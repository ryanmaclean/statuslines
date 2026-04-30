#!/usr/bin/env node
// tarball-diff: structurally compare two npm tarballs (.tgz) and emit a
// concise markdown summary plus a flag list. Used by the weekly version-bump
// bot to surface supply-chain-relevant changes between an old pinned version
// and the proposed new one.
//
// Pure stdlib (node:zlib + a small POSIX-tar reader); we don't pull in `tar`
// to keep CI footprint flat and the dependency surface small.
//
// API:
//   import { diffTarballs } from "./tarball-diff.mjs";
//   const { markdown, flags } = await diffTarballs(oldTgz, newTgz);
// CLI:
//   node scripts/tarball-diff.mjs <old.tgz> <new.tgz>

import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const LIFECYCLE = ["preinstall", "install", "postinstall", "prepare"];
const URL_RE = /\b(?:https?|wss?):\/\/([A-Za-z0-9.-]+)/g;
const BIG_BLOB_BYTES = 100 * 1024;

// ---------- tar reader (POSIX ustar) ---------------------------------------
// Each entry is a 512-byte header followed by ceil(size/512)*512 bytes of
// data. We only read regular files (typeflag '0' or '\0'). Long names use
// the GNU 'L' typeflag — npm tarballs almost always rely on it for paths
// over 100 chars (e.g. `package/.../something.js`).

function readOctal(buf, off, len) {
  let s = "";
  for (let i = 0; i < len; i++) {
    const b = buf[off + i];
    if (b === 0 || b === 0x20) break;
    s += String.fromCharCode(b);
  }
  return s ? parseInt(s, 8) : 0;
}

function readStr(buf, off, len) {
  let end = off;
  const stop = off + len;
  while (end < stop && buf[end] !== 0) end++;
  return buf.toString("utf8", off, end);
}

function parseTar(buf) {
  const out = [];
  let off = 0;
  let longName = null;
  while (off + 512 <= buf.length) {
    // empty block = end-of-archive marker
    let allZero = true;
    for (let i = 0; i < 512; i++) if (buf[off + i] !== 0) { allZero = false; break; }
    if (allZero) break;

    const name = readStr(buf, off, 100);
    const size = readOctal(buf, off + 124, 12);
    const typeflag = String.fromCharCode(buf[off + 156] || 0x30);
    const prefix = readStr(buf, off + 345, 155);
    let fullName = prefix ? `${prefix}/${name}` : name;

    const dataOff = off + 512;
    const padded = Math.ceil(size / 512) * 512;

    if (typeflag === "L") {
      // GNU long-name: data block is the actual filename (NUL-terminated)
      let end = dataOff;
      const stop = dataOff + size;
      while (end < stop && buf[end] !== 0) end++;
      longName = buf.toString("utf8", dataOff, end);
    } else if (typeflag === "0" || typeflag === "\0") {
      const finalName = longName || fullName;
      longName = null;
      const data = buf.subarray(dataOff, dataOff + size);
      out.push({ name: finalName, size, data });
    } else {
      // directories ('5'), longlink ('K'), xattr ('x'/'g'), etc. — skip data
      longName = null;
    }
    off = dataOff + padded;
  }
  return out;
}

async function readTarball(path) {
  const gz = await readFile(path);
  const tar = gunzipSync(gz);
  const entries = parseTar(tar);
  // npm tarballs nest everything under "package/" — strip that prefix so
  // diffs are intuitive.
  const map = new Map();
  for (const e of entries) {
    const stripped = e.name.startsWith("package/") ? e.name.slice("package/".length) : e.name;
    if (!stripped) continue;
    map.set(stripped, { size: e.size, data: e.data });
  }
  return map;
}

// ---------- analysis helpers -----------------------------------------------

function isBinaryBlob(data) {
  // Sample up to first 8 KiB; flag if >50% of bytes are non-printable.
  const n = Math.min(data.length, 8192);
  if (n === 0) return false;
  let nonPrint = 0;
  for (let i = 0; i < n; i++) {
    const b = data[i];
    // printable: tab, LF, CR, 0x20-0x7E
    if (b === 9 || b === 10 || b === 13) continue;
    if (b >= 0x20 && b <= 0x7e) continue;
    nonPrint++;
  }
  return nonPrint / n > 0.5;
}

function readPackageJson(map) {
  const f = map.get("package.json");
  if (!f) return null;
  try { return JSON.parse(f.data.toString("utf8")); }
  catch { return null; }
}

function collectDomains(map) {
  const domains = new Set();
  for (const [name, f] of map) {
    if (f.size > 2 * 1024 * 1024) continue; // skip huge files for grep
    if (isBinaryBlob(f.data)) continue;
    const text = f.data.toString("utf8");
    for (const m of text.matchAll(URL_RE)) {
      const host = m[1].toLowerCase();
      // collapse to registrable-ish suffix: take last 2 labels (good enough
      // for "new domain" surfacing; we accept some false-positives on .co.uk
      // etc — that's a feature, not a bug, in this advisory context).
      const parts = host.split(".").filter(Boolean);
      if (parts.length < 2) continue;
      const tld = parts.slice(-2).join(".");
      domains.add(tld);
    }
    void name;
  }
  return domains;
}

function licenseHash(map) {
  for (const candidate of ["LICENSE", "LICENSE.md", "LICENSE.txt", "license", "license.md"]) {
    const f = map.get(candidate);
    if (f) return createHash("sha256").update(f.data).digest("hex");
  }
  return null;
}

// ---------- diff -----------------------------------------------------------

export async function diffTarballs(oldPath, newPath) {
  const oldMap = await readTarball(oldPath);
  const newMap = await readTarball(newPath);
  const flags = [];
  const lines = [];

  // File-list diff
  const added = [];
  const removed = [];
  const grew = [];
  for (const [name, f] of newMap) {
    if (!oldMap.has(name)) added.push({ name, size: f.size });
    else {
      const oldSize = oldMap.get(name).size;
      if (oldSize > 0 && Math.abs(f.size - oldSize) / oldSize > 0.25) {
        grew.push({ name, oldSize, newSize: f.size });
      } else if (oldSize === 0 && f.size > 0) {
        grew.push({ name, oldSize, newSize: f.size });
      }
    }
  }
  for (const [name] of oldMap) if (!newMap.has(name)) removed.push(name);

  lines.push(`**Files:** +${added.length} added, -${removed.length} removed, ${grew.length} resized >25%`);
  if (added.length) {
    const show = added.slice(0, 6).map((a) => `\`${a.name}\` (${a.size}B)`).join(", ");
    lines.push(`- added: ${show}${added.length > 6 ? `, +${added.length - 6} more` : ""}`);
  }
  if (removed.length) {
    const show = removed.slice(0, 6).map((n) => `\`${n}\``).join(", ");
    lines.push(`- removed: ${show}${removed.length > 6 ? `, +${removed.length - 6} more` : ""}`);
  }
  if (grew.length) {
    const show = grew.slice(0, 4)
      .map((g) => `\`${g.name}\` ${g.oldSize}→${g.newSize}B`).join(", ");
    lines.push(`- resized: ${show}${grew.length > 4 ? `, +${grew.length - 4} more` : ""}`);
  }

  // Lifecycle-script diff
  const oldPkg = readPackageJson(oldMap) || {};
  const newPkg = readPackageJson(newMap) || {};
  const oldScripts = oldPkg.scripts || {};
  const newScripts = newPkg.scripts || {};
  const scriptLines = [];
  const scriptKeys = new Set([...Object.keys(oldScripts), ...Object.keys(newScripts)]);
  for (const k of scriptKeys) {
    const o = oldScripts[k];
    const n = newScripts[k];
    if (o === n) continue;
    if (o === undefined) {
      scriptLines.push(`+ \`${k}\`: \`${truncate(n)}\``);
      if (LIFECYCLE.includes(k)) flags.push(`new ${k} script`);
    } else if (n === undefined) {
      scriptLines.push(`- \`${k}\` removed`);
    } else {
      scriptLines.push(`~ \`${k}\`: \`${truncate(o)}\` → \`${truncate(n)}\``);
      if (LIFECYCLE.includes(k)) flags.push(`changed ${k} script`);
    }
  }
  lines.push(`**Scripts:** ${scriptLines.length === 0 ? "no changes" : `${scriptLines.length} changed`}`);
  for (const s of scriptLines.slice(0, 8)) lines.push(`- ${s}`);
  if (scriptLines.length > 8) lines.push(`- +${scriptLines.length - 8} more`);

  // Network-touch diff
  const oldDomains = collectDomains(oldMap);
  const newDomains = collectDomains(newMap);
  const newOnly = [...newDomains].filter((d) => !oldDomains.has(d)).sort();
  lines.push(`**Domains:** old=${oldDomains.size}, new=${newDomains.size}, +${newOnly.length} new`);
  if (newOnly.length) {
    const show = newOnly.slice(0, 8).map((d) => `\`${d}\``).join(", ");
    lines.push(`- new: ${show}${newOnly.length > 8 ? `, +${newOnly.length - 8} more` : ""}`);
    for (const d of newOnly) flags.push(`new domain ${d}`);
  }

  // Binary blob diff
  const newBlobs = [];
  for (const a of added) {
    const f = newMap.get(a.name);
    if (f.size > BIG_BLOB_BYTES && isBinaryBlob(f.data)) {
      newBlobs.push({ name: a.name, size: f.size });
      flags.push(`new binary blob ${a.name} (${f.size}B)`);
    }
  }
  if (newBlobs.length) {
    lines.push(`**Binary blobs (new, >100kB):** ${newBlobs.length}`);
    for (const b of newBlobs.slice(0, 4)) lines.push(`- \`${b.name}\` ${b.size}B`);
  }

  // License drift
  const oldLic = licenseHash(oldMap);
  const newLic = licenseHash(newMap);
  if (oldLic && newLic && oldLic !== newLic) {
    lines.push(`**License:** changed (sha256 ${oldLic.slice(0, 8)} → ${newLic.slice(0, 8)}) (!)`);
    flags.push("license changed");
  } else if (oldLic && !newLic) {
    lines.push(`**License:** file disappeared (!)`);
    flags.push("license file removed");
  } else if (!oldLic && newLic) {
    lines.push(`**License:** file appeared`);
  }

  return { markdown: lines.join("\n"), flags };
}

function truncate(s, n = 60) {
  if (typeof s !== "string") return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// ---------- CLI ------------------------------------------------------------
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const [oldPath, newPath] = process.argv.slice(2);
  if (!oldPath || !newPath) {
    process.stderr.write("usage: tarball-diff.mjs <old.tgz> <new.tgz>\n");
    process.exit(2);
  }
  const { markdown, flags } = await diffTarballs(oldPath, newPath);
  process.stdout.write(markdown + "\n");
  if (flags.length) {
    process.stdout.write("\n_flags: " + flags.join("; ") + "_\n");
  }
}
