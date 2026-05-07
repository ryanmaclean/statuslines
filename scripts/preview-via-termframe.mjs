#!/usr/bin/env node
/**
 * preview-via-termframe.mjs
 *
 * For each catalog entry where:
 *   - host_clis includes "claude"
 *   - install.type is "npx"       (no global install needed, idempotent)
 *   - redistributable is true
 *   - configs.claude.statusLine.command exists
 *
 * Pipes a synthetic JSON fixture to the entry's statusLine command via
 * termframe and saves the SVG to catalog/images/<slug>.svg.
 *
 * Usage:
 *   node scripts/preview-via-termframe.mjs [--force] [--slug=<slug>]
 *
 *   --force     Re-render even if catalog/images/<slug>.svg already exists.
 *   --slug=...  Render only the named entry (for debugging).
 *
 * Requirements:
 *   ~/.local/bin/termframe  (termframe v0.8.4+, installed by Phase 1)
 *   Node.js 18+             (stdlib only, no npm deps)
 *
 * Direct-mode (bypass import.meta.url guard):
 *   Some packages gate their main() on `import.meta.url === \`file://\${process.argv[1]}\``.
 *   When invoked through an npm/npx bin symlink the symlink path diverges from the
 *   resolved file path, so the guard never fires.  For those entries, set
 *   configs.claude.statusLine.direct = true  in the catalog JSON.  The harness will
 *   then locate the real entry .js file inside the npx cache and invoke it as
 *   `node <resolved-path>` so both sides of the guard agree.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "catalog");
const IMAGES = join(CATALOG, "images");
const FIXTURE = join(ROOT, "scripts", "fixtures", "claude-statusline-input.json");
const TERMFRAME = join(homedir(), ".local", "bin", "termframe");

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const SLUG_FILTER = args.find((a) => a.startsWith("--slug="))?.slice(7) ?? null;

// ---------------------------------------------------------------------------
// termframe config: use a font name not in the built-in registry so that
// termframe skips TLS font-download and completes offline.  The SVG uses
// CSS system font-family as a fallback; ANSI colour rendering is not
// affected by font selection.
// ---------------------------------------------------------------------------
const TF_CONFIG = join(ROOT, "scripts", "fixtures", "termframe-config.json");

const TF_CONFIG_CONTENT = JSON.stringify({
  font: {
    family: ["Liberation Mono", "monospace"],
  },
});

// Write config on first run (or overwrite — it is deterministic)
writeFileSync(TF_CONFIG, TF_CONFIG_CONTENT);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function log(tag, msg) {
  process.stdout.write(`[${tag}] ${msg}\n`);
}

/**
 * Resolve the real entry .js path for a package installed in the npx cache.
 *
 * Strategy:
 *   1. Run `npm exec --yes -- node -e "require.resolve('<pkg>')"` inside a
 *      temp context to let npm locate or install the package and print its
 *      resolved main path.
 *   2. Fall back to searching ~/.npm/_npx for a matching package.json and
 *      reading its `main` / `bin` field.
 *
 * Returns the absolute path string, or null if resolution fails.
 *
 * @param {string} packageName   e.g. "@this-dot/claude-code-context-status-line"
 * @param {string} [commandName] bare binary name to prefer when pkg.bin is an object
 */
function resolveDirectPath(packageName, commandName) {
  // Strategy: search ~/.npm/_npx for installed package
  const npxCacheBase = join(homedir(), ".npm", "_npx");
  if (!existsSync(npxCacheBase)) return null;

  // Walk one level of hash dirs under _npx
  let found = null;
  try {
    for (const hashDir of readdirSync(npxCacheBase, { withFileTypes: true })) {
      if (!hashDir.isDirectory()) continue;
      const pkgJsonPath = join(
        npxCacheBase, hashDir.name, "node_modules", packageName, "package.json"
      );
      if (!existsSync(pkgJsonPath)) continue;
      const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
      // Prefer bin field, fall back to main
      let entry = null;
      if (pkg.bin) {
        // bin can be a string or object
        if (typeof pkg.bin === "string") {
          entry = pkg.bin;
        } else {
          // prefer bin whose key matches commandName, fall back to first entry
          const keys = Object.keys(pkg.bin);
          const match = commandName
            ? keys.find((k) => k === commandName || k === commandName.split("/").pop())
            : null;
          entry = match ? pkg.bin[match] : Object.values(pkg.bin)[0];
        }
      } else if (pkg.main) {
        entry = pkg.main;
      } else if (pkg.exports && pkg.exports["."] && typeof pkg.exports["."] === "string") {
        entry = pkg.exports["."];
      }
      if (!entry) continue;
      const fullPath = join(
        npxCacheBase, hashDir.name, "node_modules", packageName,
        entry.replace(/^\.\//, "")
      );
      if (existsSync(fullPath)) {
        found = fullPath;
        break;
      }
    }
  } catch (e) {
    // ignore FS errors
  }
  return found;
}

function loadEntries() {
  const entries = [];
  if (!existsSync(CATALOG)) return entries;
  for (const group of readdirSync(CATALOG, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    if (group.name === "locks" || group.name === "images") continue;
    const dir = join(CATALOG, group.name);
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      try {
        const raw = readFileSync(join(dir, f), "utf8");
        const entry = JSON.parse(raw);
        entry._path = join(dir, f);
        entries.push(entry);
      } catch (e) {
        log("WARN", `failed to parse ${f}: ${e.message}`);
      }
    }
  }
  return entries;
}

function isCandidateEntry(e) {
  return (
    Array.isArray(e.host_clis) &&
    e.host_clis.includes("claude") &&
    e.install?.type === "npx" &&
    e.redistributable === true &&
    typeof e.configs?.claude?.statusLine?.command === "string"
  );
}

/**
 * Run termframe and capture the SVG into outputPath.
 * Returns { ok: boolean, reason?: string, svgBytes?: number }.
 *
 * termframe argv:
 *   termframe [OPTIONS] -- bash -c '<cmd> < <fixture>'
 *
 * We use:
 *   --config      offline font config (skips TLS font download)
 *   --mode=dark   consistent dark theme
 *   --embed-fonts=false  no font embed needed (CSS fallback is fine)
 *   --timeout=60  allow up to 60 s for npx install + first run
 *   --width=180   comfortable statusline width
 *   --height=5    single-line statusline → very short frame
 *   -o <file>     output path
 *   --             separator before the command to run
 *
 * The outer spawnSync timeout is 90 s (30 s more than termframe's own limit).
 *
 * @param {string} slug
 * @param {string} cmd            The statusLine command string from catalog
 * @param {string} outputPath
 * @param {{ directPath?: string }} [opts]
 *   directPath  If provided, invoke `node <directPath>` instead of `cmd` to
 *               bypass import.meta.url guards that fail through npx symlinks.
 */
function renderEntry(slug, cmd, outputPath, opts = {}) {
  // Build the shell command: pipe fixture JSON to the statusLine command.
  // In direct mode we replace the npx invocation with `node <resolved-path>`
  // so import.meta.url === `file://${process.argv[1]}` holds true.
  const effectiveCmd = opts.directPath
    ? `node ${JSON.stringify(opts.directPath)}`
    : cmd;

  const shellCmd = `${effectiveCmd} < ${JSON.stringify(FIXTURE)}`;

  const tfArgs = [
    `--config=${TF_CONFIG}`,
    "--mode=dark",
    "--embed-fonts=false",
    "--width=180",
    "--height=5",
    `--timeout=60`,
    `-o`, outputPath,
    "--",
    "bash", "-c", shellCmd,
  ];

  if (opts.directPath) {
    log("RUN", `${slug}: termframe ... node ${opts.directPath} < fixture  [direct mode]`);
  } else {
    log("RUN", `${slug}: termframe ... bash -c '${cmd} < fixture'`);
  }

  const result = spawnSync(TERMFRAME, tfArgs, {
    timeout: 90_000,           // 90 s outer hard limit
    encoding: "utf8",
    env: {
      ...process.env,
      // Ensure npx can find its cache
      HOME: homedir(),
      // Disable any interactive prompts
      CI: "1",
      NO_COLOR: "0",           // keep ANSI colours for the render
    },
  });

  if (result.error) {
    if (result.error.code === "ETIMEDOUT") {
      return { ok: false, reason: "timed out after 90 s" };
    }
    return { ok: false, reason: result.error.message };
  }

  if (!existsSync(outputPath)) {
    const stderr = (result.stderr ?? "").trim();
    return { ok: false, reason: `no SVG written; stderr: ${stderr.slice(0, 200)}` };
  }

  const svgBytes = statSync(outputPath).size;

  if (svgBytes < 500) {
    // Suspiciously small — probably an error page, not a real render
    return { ok: false, reason: `SVG too small (${svgBytes} bytes) — likely empty render` };
  }

  // Sanity check: must look like SVG
  const svgHead = readFileSync(outputPath, "utf8").slice(0, 200);
  if (!svgHead.includes("<svg")) {
    return { ok: false, reason: "output does not start with <svg>" };
  }

  return { ok: true, svgBytes };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (!existsSync(TERMFRAME)) {
  process.stderr.write(`FATAL: termframe not found at ${TERMFRAME}\n`);
  process.stderr.write(`Install it with: cargo install termframe\n`);
  process.stderr.write(`or download from https://github.com/pamburus/termframe/releases\n`);
  process.exit(1);
}

if (!existsSync(FIXTURE)) {
  process.stderr.write(`FATAL: fixture not found at ${FIXTURE}\n`);
  process.exit(1);
}

mkdirSync(IMAGES, { recursive: true });

const entries = loadEntries().filter((e) => {
  if (SLUG_FILTER && e.slug !== SLUG_FILTER) return false;
  return isCandidateEntry(e);
});

if (entries.length === 0) {
  log("INFO", SLUG_FILTER
    ? `no candidate entry found for slug=${SLUG_FILTER}`
    : "no candidate entries (claude + npx + redistributable + statusLine.command)");
  process.exit(0);
}

log("INFO", `found ${entries.length} candidate entr${entries.length === 1 ? "y" : "ies"}`);
if (FORCE) log("INFO", "--force: will re-render existing SVGs");

const results = { upgraded: [], skipped: [] };

for (const entry of entries) {
  const { slug } = entry;
  const statusLineCfg = entry.configs.claude.statusLine;
  const cmd = statusLineCfg.command;
  const outputPath = join(IMAGES, `${slug}.svg`);

  if (!FORCE && existsSync(outputPath)) {
    // Check freshness: skip if SVG is newer than the catalog entry
    const svgMtime = statSync(outputPath).mtimeMs;
    const entryMtime = statSync(entry._path).mtimeMs;
    if (svgMtime >= entryMtime) {
      log("SKIP", `${slug}: SVG exists and is up-to-date (use --force to re-render)`);
      results.skipped.push({ slug, reason: "already exists (fresh)" });
      continue;
    }
    log("INFO", `${slug}: SVG exists but entry is newer — re-rendering`);
  }

  // Direct mode: bypass import.meta.url guard in packages whose guard fails
  // through npm/npx symlinks.  Triggered by direct:true in statusLine config.
  let renderOpts = {};
  if (statusLineCfg.direct === true) {
    const packageName = entry.install?.package;
    if (!packageName) {
      log("FAIL", `${slug}: direct:true but no install.package defined`);
      results.skipped.push({ slug, reason: "direct:true but no install.package" });
      continue;
    }
    // Extract bare binary name from the command string so the correct bin
    // entry is selected when pkg.bin is an object with multiple keys.
    // e.g. "npx --ignore-scripts -y @this-dot/foo@1.2.3" → "foo"
    // e.g. "npx -y somepkg" → "somepkg"
    const cmdParts = statusLineCfg.command.replace(/@[^@/\s]+$/, "").trim().split(/\s+/);
    const cmdName = cmdParts[cmdParts.length - 1].split("/").pop();
    const directPath = resolveDirectPath(packageName, cmdName);
    if (!directPath) {
      log("FAIL", `${slug}: direct:true but could not resolve real path for ${packageName}`);
      log("INFO", `${slug}: hint — run 'npx --ignore-scripts -y ${packageName}' first to warm the cache`);
      results.skipped.push({ slug, reason: `could not resolve direct path for ${packageName}` });
      continue;
    }
    log("INFO", `${slug}: direct mode → ${directPath}`);
    renderOpts = { directPath };
  }

  const { ok, reason, svgBytes } = renderEntry(slug, cmd, outputPath, renderOpts);

  if (ok) {
    log("OK  ", `${slug}: wrote ${outputPath} (${svgBytes} bytes)`);
    results.upgraded.push({ slug, outputPath, svgBytes });
  } else {
    log("FAIL", `${slug}: ${reason}`);
    results.skipped.push({ slug, reason });
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
process.stdout.write("\n");
log("SUMMARY", `upgraded=${results.upgraded.length}  skipped/failed=${results.skipped.length}`);
if (results.upgraded.length) {
  process.stdout.write("  Upgraded:\n");
  for (const r of results.upgraded) {
    process.stdout.write(`    ${r.slug}  →  ${r.outputPath}  (${r.svgBytes} bytes)\n`);
  }
}
if (results.skipped.length) {
  process.stdout.write("  Skipped:\n");
  for (const r of results.skipped) {
    process.stdout.write(`    ${r.slug}  — ${r.reason}\n`);
  }
}

process.stdout.write("\nNext step (Phase 3): update image.local and image.source in each upgraded entry.\n");
process.stdout.write("Run: node scripts/preview-via-termframe.mjs --apply  (not yet implemented)\n");
process.stdout.write("Or manually update the JSON fields per the instructions in docs.\n");
