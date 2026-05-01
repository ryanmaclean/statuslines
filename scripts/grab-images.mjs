#!/usr/bin/env node
// Download a local copy of every catalog entry's image into catalog/images/.
// Idempotent: re-downloads only when the local file is missing or older than
// 30 days, unless --force is passed.
//
// Usage:
//   node scripts/grab-images.mjs           # skip fresh files
//   node scripts/grab-images.mjs --force   # always re-download

import { readFile, writeFile, stat, mkdir, readdir } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";
import http from "node:http";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CATALOG = join(ROOT, "catalog");
const IMAGES_DIR = join(CATALOG, "images");

const FORCE = process.argv.includes("--force");
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_TIME_MS = 30_000;

const CATALOG_GROUPS = ["claude", "opencode", "codex", "gemini", "multi"];

const CONTENT_TYPE_TO_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

function extFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const m = pathname.match(/\.([a-zA-Z0-9]+)$/);
    if (m) {
      const ext = m[1].toLowerCase();
      // Only return known image extensions
      if (["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"].includes(ext)) {
        return "." + (ext === "jpeg" ? "jpg" : ext);
      }
    }
  } catch (_) {}
  return null;
}

function ogFallbackUrl(repo) {
  // e.g. https://github.com/owner/reponame -> owner/reponame
  const m = repo.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/);
  if (!m) return null;
  return `https://opengraph.githubassets.com/1/${m[1]}`;
}

function ownerRepo(repo) {
  const m = repo.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/);
  return m ? m[1] : null;
}

/**
 * Perform an HTTP HEAD request and return the Content-Type header value.
 * Follows up to 5 redirects.
 */
function headContentType(url, redirectsLeft = 5) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: "HEAD",
        headers: { "User-Agent": "statuslines-grab-images/1.0" },
        timeout: MAX_TIME_MS,
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
          const nextUrl = new URL(res.headers.location, url).toString();
          resolve(headContentType(nextUrl, redirectsLeft - 1));
          return;
        }
        const ct = (res.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
        resolve({ statusCode: res.statusCode, contentType: ct });
      }
    );
    req.on("timeout", () => { req.destroy(); resolve({ statusCode: 0, contentType: "" }); });
    req.on("error", () => resolve({ statusCode: 0, contentType: "" }));
    req.end();
  });
}

/**
 * Download a URL to a file. Follows redirects. Returns true on success.
 */
function downloadToFile(url, destPath, redirectsLeft = 10) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === "https:" ? https : http;
    const req = lib.get(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        headers: { "User-Agent": "statuslines-grab-images/1.0" },
        timeout: MAX_TIME_MS,
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
          const nextUrl = new URL(res.headers.location, url).toString();
          resolve(downloadToFile(nextUrl, destPath, redirectsLeft - 1));
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          resolve(false);
          return;
        }
        const out = createWriteStream(destPath);
        res.pipe(out);
        out.on("finish", () => resolve(true));
        out.on("error", () => resolve(false));
        res.on("error", () => { out.destroy(); resolve(false); });
      }
    );
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.on("error", () => resolve(false));
  });
}

async function needsDownload(localPath) {
  if (FORCE) return true;
  if (!existsSync(localPath)) return true;
  try {
    const s = await stat(localPath);
    if (s.size === 0) return true;
    const ageMsec = Date.now() - s.mtimeMs;
    return ageMsec > MAX_AGE_MS;
  } catch (_) {
    return true;
  }
}

async function resolveExtension(url) {
  // 1. Try to infer from URL path
  const urlExt = extFromUrl(url);
  if (urlExt) return urlExt;
  // 2. HEAD request to get Content-Type
  const { contentType } = await headContentType(url);
  const ext = CONTENT_TYPE_TO_EXT[contentType];
  if (ext) return ext;
  // Default to .png
  return ".png";
}

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

async function processEntry(filePath) {
  const raw = await readFile(filePath, "utf8");
  const entry = JSON.parse(raw);
  const { slug, image, repo } = entry;

  if (!image?.url) {
    console.warn(`  [SKIP] ${slug}: no image.url`);
    return { slug, status: "skipped" };
  }

  // Determine extension from primary URL
  const ext = await resolveExtension(image.url);
  const localFilename = `${slug}${ext}`;
  const localPath = join(IMAGES_DIR, localFilename);
  const localField = `images/${localFilename}`;

  const download = await needsDownload(localPath);
  if (!download) {
    console.log(`  [FRESH] ${slug} -> ${localFilename}`);
    // Still ensure local field is set in JSON
    if (!entry.image.local || entry.image.local !== localField) {
      entry.image = { ...entry.image, local: localField };
      const reordered = reorderKeys(entry);
      await writeFile(filePath, JSON.stringify(reordered, null, 2) + "\n");
    }
    return { slug, status: "fresh", file: localFilename };
  }

  // Try primary URL
  console.log(`  [DL]    ${slug} <- ${image.url}`);
  let success = await downloadToFile(image.url, localPath);
  let usedFallback = false;

  if (!success) {
    console.warn(`  [FAIL]  ${slug}: primary URL failed, trying OG fallback`);
    const ogUrl = ogFallbackUrl(repo || "");
    if (ogUrl) {
      const fallbackFilename = `${slug}.png`;
      const fallbackPath = join(IMAGES_DIR, fallbackFilename);
      console.log(`  [DL]    ${slug} <- ${ogUrl}`);
      success = await downloadToFile(ogUrl, fallbackPath);
      if (success) {
        usedFallback = true;
        const fallbackField = `images/${fallbackFilename}`;
        entry.image = { ...entry.image, local: fallbackField };
        const reordered = reorderKeys(entry);
        await writeFile(filePath, JSON.stringify(reordered, null, 2) + "\n");
        console.log(`  [OK-FB] ${slug} -> ${fallbackFilename} (OG fallback)`);
        return { slug, status: "fallback", file: fallbackFilename };
      }
    }
    console.error(`  [ERROR] ${slug}: both primary and fallback failed`);
    return { slug, status: "failed" };
  }

  // Verify downloaded file is non-empty
  try {
    const s = await stat(localPath);
    if (s.size === 0) {
      console.error(`  [ERROR] ${slug}: downloaded file is empty`);
      return { slug, status: "failed" };
    }
  } catch (_) {
    return { slug, status: "failed" };
  }

  entry.image = { ...entry.image, local: localField };
  const reordered = reorderKeys(entry);
  await writeFile(filePath, JSON.stringify(reordered, null, 2) + "\n");
  console.log(`  [OK]    ${slug} -> ${localFilename}`);
  return { slug, status: "ok", file: localFilename };
}

async function main() {
  await mkdir(IMAGES_DIR, { recursive: true });

  const results = [];
  for (const group of CATALOG_GROUPS) {
    const groupDir = join(CATALOG, group);
    let files;
    try {
      files = await readdir(groupDir);
    } catch (_) {
      continue;
    }
    for (const f of files.sort()) {
      if (!f.endsWith(".json")) continue;
      const filePath = join(groupDir, f);
      const result = await processEntry(filePath);
      results.push(result);
    }
  }

  console.log("\n--- Summary ---");
  const ok = results.filter((r) => r.status === "ok" || r.status === "fresh");
  const fallback = results.filter((r) => r.status === "fallback");
  const failed = results.filter((r) => r.status === "failed");
  const skipped = results.filter((r) => r.status === "skipped");

  console.log(`Downloaded/fresh: ${ok.length + fallback.length}`);
  if (fallback.length) console.log(`  Fallback used: ${fallback.map((r) => r.slug).join(", ")}`);
  if (failed.length) console.log(`  FAILED: ${failed.map((r) => r.slug).join(", ")}`);
  if (skipped.length) console.log(`  Skipped (no image.url): ${skipped.map((r) => r.slug).join(", ")}`);

  // Report sizes
  console.log("\n--- File sizes ---");
  let totalBytes = 0;
  const oversized = [];
  try {
    const imgFiles = await readdir(IMAGES_DIR);
    for (const f of imgFiles.sort()) {
      const p = join(IMAGES_DIR, f);
      try {
        const s = await stat(p);
        totalBytes += s.size;
        const kb = (s.size / 1024).toFixed(1);
        const flag = s.size > 1_000_000 ? " *** OVERSIZED (>1MB) ***" : "";
        if (s.size > 1_000_000) oversized.push({ file: f, bytes: s.size });
        console.log(`  ${f.padEnd(60)} ${kb.padStart(8)} KB${flag}`);
      } catch (_) {}
    }
  } catch (_) {}
  console.log(`  Total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  if (oversized.length) {
    console.warn("\n  Oversized images (>1MB) — consider re-sourcing:");
    for (const { file, bytes } of oversized) {
      console.warn(`    ${file}: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
    }
  }

  if (failed.length) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
