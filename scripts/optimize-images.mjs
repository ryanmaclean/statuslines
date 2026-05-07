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
    // threshold: 800 KB — reflects the realistic post-optimization target
    threshold: 800 * 1024,
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
  // Truncate log line when args list is very long (e.g. 900+ frame selectors)
  const fullLabel = [cmd, ...args].join(" ");
  const logLabel = fullLabel.length > 200
    ? fullLabel.slice(0, 197) + "..."
    : fullLabel;
  console.log(`  $ ${logLabel}`);
  const r = spawnSync(cmd, args, { encoding: "buffer", ...opts });
  if (r.status !== 0) {
    const stderr = r.stderr ? r.stderr.toString() : "";
    throw new Error(`Command failed (exit ${r.status}): ${logLabel}\n${stderr}`);
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
  // Strategy: use gifsicle to delete frames where index%4 != 0, resize, and
  // apply lossy compression. This avoids ImageMagick's pixel-cache exhaustion
  // on large multi-frame GIFs.

  if (!GIFSICLE) {
    throw new Error(
      "gifsicle is required for GIF optimization but was not found.\n" +
      "  Install with: sudo apt-get install -y gifsicle"
    );
  }

  // Count total frames to build delete list
  const infoResult = spawnSync(GIFSICLE, ["--info", srcPath], { encoding: "utf8" });
  const m = infoResult.stdout.match(/(\d+)\s+images/);
  const totalFrames = m ? parseInt(m[1], 10) : 1205;

  // Delete frames where index % 4 != 0 (keep every 4th frame: 0,4,8,...)
  const deleteFrames = [];
  for (let i = 0; i < totalFrames; i++) {
    if (i % 4 !== 0) deleteFrames.push(`#${i}`);
  }

  run(GIFSICLE, [
    "--no-warnings",
    srcPath,
    "--delete", ...deleteFrames,
    "--resize-width", "960",
    "--colors", "128",
    "--lossy=80",
    "--optimize=3",
    "-o", tmpOut,
  ]);
}

async function optimizeCcstatusline(srcPath, tmpOut) {
  // 316-frame GIF: keep every 3rd frame (delete where index%3 != 0), resize to 960px,
  // reduce to 64 colours, apply gifsicle lossy=120 pass.
  //
  // Frame decimation strategy: keeping every 3rd frame (→ ~106 frames) is required
  // to hit the <800 KB target. Empirical tests on the 6.7 MB original:
  //   every 2nd frame (158 frames) + 64c + lossy=120 → ~981 KB  (over target)
  //   every 3rd frame (106 frames) + 64c + lossy=120 → ~670 KB  (under target)
  // 64 colors is sufficient for a terminal UI screenshot.

  if (!GIFSICLE) {
    throw new Error(
      "gifsicle is required for GIF optimization but was not found.\n" +
      "  Install with: sudo apt-get install -y gifsicle"
    );
  }

  // Count total frames
  const infoResult = spawnSync(GIFSICLE, ["--info", srcPath], { encoding: "utf8" });
  const m = infoResult.stdout.match(/(\d+)\s+images/);
  const totalFrames = m ? parseInt(m[1], 10) : 316;

  // Keep frames where index % 3 == 0 (0,3,6,...); delete all others
  const deleteFrames = [];
  for (let i = 0; i < totalFrames; i++) {
    if (i % 3 !== 0) deleteFrames.push(`#${i}`);
  }

  run(GIFSICLE, [
    "--no-warnings",
    srcPath,
    "--delete", ...deleteFrames,
    "--resize-width", "960",
    "--colors", "64",
    "--lossy=120",
    "--optimize=3",
    "-o", tmpOut,
  ]);
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
