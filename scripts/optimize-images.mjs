#!/usr/bin/env node
// Post-process oversized catalog images: compress in-place using ImageMagick
// (IM6 syntax) and gifsicle. Idempotent — skips files already under threshold.
//
// Usage:
//   node scripts/optimize-images.mjs          # optimize all three targets
//   node scripts/optimize-images.mjs --force  # re-encode even if already small
//   node scripts/optimize-images.mjs --check  # exit 1 if any target is over threshold

import { readFile, writeFile, stat, unlink, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CATALOG = join(ROOT, "catalog");
const IMAGES_DIR = join(CATALOG, "images");

const FORCE = process.argv.includes("--force");
const CHECK_MODE = process.argv.includes("--check");

// ──────────────────────────────────────────────────────────────────────────────
// Tool detection
// ──────────────────────────────────────────────────────────────────────────────

function which(bin) {
  const r = spawnSync("which", [bin], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

const CONVERT = which("convert");
const GIFSICLE = which("gifsicle");

if (!CONVERT) {
  console.error(
    "ERROR: `convert` (ImageMagick) not found.\n" +
    "  Install with: sudo apt-get install -y imagemagick\n" +
    "  Then re-run this script."
  );
  process.exit(1);
}

if (!GIFSICLE) {
  console.warn(
    "WARN: `gifsicle` not found — lossy GIF final pass will be skipped.\n" +
    "  Install with: sudo apt-get install -y gifsicle"
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Target definitions
// ──────────────────────────────────────────────────────────────────────────────

// threshold: if current file size (bytes) is <= this value, treat as already optimized
const TARGETS = [
  {
    name: "tokscale.png → tokscale.webp",
    srcFile: "tokscale.png",
    dstFile: "tokscale.webp",
    // threshold in bytes: 100 KB
    threshold: 100 * 1024,
    // JSON that must be updated when conversion succeeds
    jsonFile: join(CATALOG, "multi", "tokscale.json"),
    newLocalField: "images/tokscale.webp",
    deleteSrc: true,
    optimize: optimizeTokscale,
  },
  {
    name: "owloops-claude-powerline.gif",
    srcFile: "owloops-claude-powerline.gif",
    dstFile: "owloops-claude-powerline.gif",
    // threshold: 400 KB
    threshold: 400 * 1024,
    optimize: optimizeOwloops,
  },
  {
    name: "ccstatusline.gif",
    srcFile: "ccstatusline.gif",
    dstFile: "ccstatusline.gif",
    // threshold: 900 KB
    threshold: 900 * 1024,
    optimize: optimizeCcstatusline,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

function tempPath(suffix) {
  return join(tmpdir(), `opt-img-${randomBytes(6).toString("hex")}${suffix}`);
}

async function fileSize(p) {
  try {
    const s = await stat(p);
    return s.size;
  } catch (_) {
    return 0;
  }
}

function run(cmd, args, opts = {}) {
  const label = [cmd, ...args].join(" ");
  console.log(`  $ ${label}`);
  const r = spawnSync(cmd, args, { encoding: "buffer", ...opts });
  if (r.status !== 0) {
    const stderr = r.stderr ? r.stderr.toString() : "";
    throw new Error(`Command failed (exit ${r.status}): ${label}\n${stderr}`);
  }
  return r;
}

// KEY_ORDER matches apply-images.mjs and grab-images.mjs
const KEY_ORDER = [
  "slug", "name", "repo", "license", "redistributable", "host_clis",
  "language", "description", "image", "install", "configs", "tags",
  "notes", "security", "capabilities",
];

function reorderKeys(obj) {
  const out = {};
  for (const k of KEY_ORDER) if (k in obj) out[k] = obj[k];
  for (const k of Object.keys(obj)) if (!(k in out)) out[k] = obj[k];
  return out;
}

async function updateJsonLocal(jsonFile, newLocal) {
  const raw = await readFile(jsonFile, "utf8");
  const entry = JSON.parse(raw);
  entry.image = { ...entry.image, local: newLocal };
  const reordered = reorderKeys(entry);
  await writeFile(jsonFile, JSON.stringify(reordered, null, 2) + "\n");
  console.log(`  Updated ${jsonFile}: image.local → "${newLocal}"`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Per-target optimisation routines
// ──────────────────────────────────────────────────────────────────────────────

async function optimizeTokscale(srcPath, tmpOut) {
  // PNG → WebP, 960px max width, q=80, strip all metadata
  run(CONVERT, [
    srcPath,
    "-strip",
    "-resize", "960x>",
    "-quality", "80",
    tmpOut,
  ]);
}

async function optimizeOwloops(srcPath, tmpOut) {
  // 1205-frame GIF → decimate to ~300 frames (keep every 4th), resize to 960px,
  // quantize to 128 colours.
  //
  // IM6 strategy: coalesce, then delete frames whose index % 4 != 0,
  // resize, remap, deconstruct (optimize layers).

  const tmp1 = tempPath(".gif");
  try {
    // Step 1: coalesce + delete 3 of every 4 frames + resize + remap
    run(CONVERT, [
      "-coalesce",
      srcPath,
      "-delete", "1-3",   // delete frames 1,2,3 of every 0-indexed group of 4
      "-resize", "960x>",
      "-dither", "FloydSteinberg",
      "-remap", srcPath,  // remap colour palette from original (128-color approx)
      "-layers", "optimize",
      tmp1,
    ]);
    // Step 2: quantize to 128 colours explicitly
    run(CONVERT, [
      tmp1,
      "-dither", "FloydSteinberg",
      "-colors", "128",
      "-layers", "optimize",
      tmpOut,
    ]);
  } finally {
    try { await unlink(tmp1); } catch (_) {}
  }
}

async function optimizeCcstatusline(srcPath, tmpOut) {
  // 316-frame GIF: decimate every 2nd frame, resize to 960px, 128 colours,
  // then gifsicle --lossy=80 --optimize=3 final pass.

  const tmp1 = tempPath(".gif");
  const tmp2 = tempPath(".gif");
  try {
    // Step 1: coalesce + delete every odd frame + resize + colours
    run(CONVERT, [
      "-coalesce",
      srcPath,
      "-delete", "1",      // IM6 deletes frame 1 from current sequence, cycling
      "-resize", "960x>",
      "-dither", "FloydSteinberg",
      "-colors", "128",
      "-layers", "optimize",
      tmp1,
    ]);

    if (GIFSICLE) {
      // Step 2: gifsicle lossy pass
      run(GIFSICLE, [
        "--lossy=80",
        "--optimize=3",
        "--colors", "128",
        "-o", tmp2,
        tmp1,
      ]);
      // copy tmp2 → tmpOut
      const buf = await readFile(tmp2);
      await writeFile(tmpOut, buf);
    } else {
      console.warn("  WARN: gifsicle not available, skipping lossy pass");
      const buf = await readFile(tmp1);
      await writeFile(tmpOut, buf);
    }
  } finally {
    try { await unlink(tmp1); } catch (_) {}
    try { if (existsSync(tmp2)) await unlink(tmp2); } catch (_) {}
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// --check mode
// ──────────────────────────────────────────────────────────────────────────────

async function checkMode() {
  console.log("=== optimize-images --check ===\n");
  let anyOver = false;
  for (const t of TARGETS) {
    const srcPath = join(IMAGES_DIR, t.srcFile);
    // For tokscale, the output file may already be .webp
    const checkPath = existsSync(join(IMAGES_DIR, t.dstFile))
      ? join(IMAGES_DIR, t.dstFile)
      : srcPath;
    const sz = await fileSize(checkPath);
    const overThreshold = sz > t.threshold;
    const status = overThreshold ? "OVER" : "OK  ";
    console.log(
      `  [${status}] ${t.name}: ${kb(sz)} (threshold ${kb(t.threshold)})`
    );
    if (overThreshold) anyOver = true;
  }
  if (anyOver) {
    console.log(
      "\nSome files exceed their size thresholds. Run:\n" +
      "  node scripts/optimize-images.mjs\n" +
      "to optimize them."
    );
    process.exit(1);
  } else {
    console.log("\nAll files are within their size thresholds.");
    process.exit(0);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Main optimisation loop
// ──────────────────────────────────────────────────────────────────────────────

async function processTarget(t) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${t.name}`);
  console.log(`${"═".repeat(60)}`);

  const srcPath = join(IMAGES_DIR, t.srcFile);
  const dstPath = join(IMAGES_DIR, t.dstFile);

  // Determine which file to check for "already optimized"
  // For PNG→WebP: if webp already exists, check that; else check png
  const checkPath = existsSync(dstPath) ? dstPath : srcPath;

  if (!existsSync(srcPath) && srcPath !== dstPath && !existsSync(dstPath)) {
    console.log(`  SKIP: source file not found: ${srcPath}`);
    return { name: t.name, status: "missing" };
  }

  const beforeSize = await fileSize(checkPath);
  console.log(`  Input:     ${checkPath.replace(ROOT + "/", "")}`);
  console.log(`  Size now:  ${kb(beforeSize)}`);
  console.log(`  Threshold: ${kb(t.threshold)}`);

  if (!FORCE && beforeSize <= t.threshold && beforeSize > 0) {
    console.log(
      `  SKIPPED (already optimized: ${kb(beforeSize)} <= ${kb(t.threshold)})`
    );
    return { name: t.name, status: "skipped", beforeSize, afterSize: beforeSize };
  }

  // Pick a temp file extension matching destination
  const ext = t.dstFile.match(/\.[^.]+$/)[0];
  const tmpOut = tempPath(ext);

  let afterSize = 0;
  try {
    await t.optimize(srcPath, tmpOut);

    afterSize = await fileSize(tmpOut);
    console.log(`  Output:    ${tmpOut}`);
    console.log(`  New size:  ${kb(afterSize)}`);

    if (afterSize === 0) {
      throw new Error("Optimized file is empty — aborting replacement.");
    }
    if (afterSize >= beforeSize) {
      console.warn(
        `  WARN: optimized file (${kb(afterSize)}) is NOT smaller than` +
        ` original (${kb(beforeSize)}) — keeping original.`
      );
      return { name: t.name, status: "no-improvement", beforeSize, afterSize };
    }

    const pct = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(1);
    console.log(`  Saved:     ${kb(beforeSize - afterSize)} (${pct}%)`);

    // Atomically replace destination
    await rename(tmpOut, dstPath);
    console.log(`  Written:   ${dstPath.replace(ROOT + "/", "")}`);

    // JSON update + delete source PNG (tokscale only)
    if (t.jsonFile) {
      await updateJsonLocal(t.jsonFile, t.newLocalField);
    }
    if (t.deleteSrc && t.srcFile !== t.dstFile && existsSync(srcPath)) {
      await unlink(srcPath);
      console.log(`  Deleted:   ${t.srcFile}`);
    }

    return { name: t.name, status: "ok", beforeSize, afterSize };
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    try { if (existsSync(tmpOut)) await unlink(tmpOut); } catch (_) {}
    return { name: t.name, status: "error", error: err.message };
  }
}

async function main() {
  if (CHECK_MODE) {
    await checkMode();
    return; // checkMode exits
  }

  console.log("=== optimize-images ===");
  console.log(`convert: ${CONVERT}`);
  console.log(`gifsicle: ${GIFSICLE || "(not found)"}`);
  console.log(`--force: ${FORCE}`);

  const results = [];
  for (const t of TARGETS) {
    const r = await processTarget(t);
    results.push(r);
  }

  // Summary
  console.log(`\n${"═".repeat(60)}`);
  console.log("  SUMMARY");
  console.log(`${"═".repeat(60)}`);
  for (const r of results) {
    if (r.status === "ok") {
      const pct = (((r.beforeSize - r.afterSize) / r.beforeSize) * 100).toFixed(1);
      console.log(`  [OK]      ${r.name}: ${kb(r.beforeSize)} → ${kb(r.afterSize)} (-${pct}%)`);
    } else if (r.status === "skipped") {
      console.log(`  [SKIP]    ${r.name}: ${kb(r.beforeSize)} (already within threshold)`);
    } else if (r.status === "no-improvement") {
      console.log(`  [NOWIN]   ${r.name}: ${kb(r.beforeSize)} → ${kb(r.afterSize)} (kept original)`);
    } else if (r.status === "error") {
      console.log(`  [ERROR]   ${r.name}: ${r.error}`);
    } else {
      console.log(`  [${r.status.toUpperCase()}]   ${r.name}`);
    }
  }

  const errors = results.filter((r) => r.status === "error");
  if (errors.length) {
    console.error(`\n${errors.length} target(s) failed.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
