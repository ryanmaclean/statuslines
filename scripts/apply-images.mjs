#!/usr/bin/env node
// One-off: apply image metadata gathered by the catalog-image research agents
// into every catalog JSON entry. Re-runnable; idempotent.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CATALOG = join(ROOT, "catalog");

const IMAGES = {
  "b-open-statusline": { url: "https://opengraph.githubassets.com/1/b-open-io/statusline", alt: "b-open-io/statusline repo preview", source: "og-fallback" },
  "ccometixline": { url: "https://raw.githubusercontent.com/Haleclipse/CCometixLine/HEAD/assets/img1.png", alt: "CCometixLine statusline screenshot", source: "readme" },
  "ccstatusline": { url: "https://raw.githubusercontent.com/sirmalloc/ccstatusline/main/screenshots/demo.gif", alt: "ccstatusline demo animation", source: "readme" },
  "ccusage": { url: "https://cdn.jsdelivr.net/gh/ryoppippi/ccusage@main/docs/public/screenshot.png", alt: "ccusage terminal screenshot", source: "readme" },
  "claude-hud": { url: "https://raw.githubusercontent.com/jarrodwatts/claude-hud/HEAD/claude-hud-preview-5-2.png", alt: "claude-hud in action", source: "readme" },
  "daniel3303-claude-statusline": { url: "https://raw.githubusercontent.com/daniel3303/ClaudeCodeStatusLine/HEAD/screenshot.png", alt: "Status line showing model, tokens, rate limits", source: "readme" },
  "dwillitzer-claude-statusline": { url: "https://opengraph.githubassets.com/1/dwillitzer/claude-statusline", alt: "claude-statusline repo preview", source: "og-fallback" },
  "felipeelias-claude-statusline": { url: "https://raw.githubusercontent.com/felipeelias/claude-statusline/HEAD/assets/screenshot.webp", alt: "claude-statusline demo screenshot", source: "readme" },
  "fredrikaverpil-claudeline": { url: "https://opengraph.githubassets.com/1/fredrikaverpil/claudeline", alt: "claudeline repo preview", source: "og-fallback" },
  "hagan-claudia-statusline": { url: "https://raw.githubusercontent.com/hagan/claudia-statusline/HEAD/statusline.png", alt: "claudia-statusline with cost, git, context", source: "readme" },
  "lucasilverentand-claudeline": { url: "https://opengraph.githubassets.com/1/lucasilverentand/claudeline", alt: "claudeline statusline for Claude Code", source: "og-fallback" },
  "ndave92-claude-code-status-line": { url: "https://opengraph.githubassets.com/1/ndave92/claude-code-status-line", alt: "claude-code-status-line repo preview", source: "og-fallback" },
  "owloops-claude-powerline": { url: "https://raw.githubusercontent.com/Owloops/claude-powerline/HEAD/images/demo-tui.gif", alt: "claude-powerline TUI demo", source: "readme" },
  "sotayamashita-claude-code-statusline": { url: "https://opengraph.githubassets.com/1/sotayamashita/claude-code-statusline", alt: "claude-code-statusline (Rust) repo preview", source: "og-fallback" },
  "thisdot-context-statusline": { url: "https://opengraph.githubassets.com/1/thisdot/claude-code-context-status-line", alt: "claude-code-context-status-line repo preview", source: "og-fallback" },
  "ainsley-opencode-token-monitor": { url: "https://opengraph.githubassets.com/1/Ainsley0917/opencode-token-monitor", alt: "opencode-token-monitor repo preview", source: "og-fallback" },
  "joaquinvesapa-sub-agent-statusline": { url: "https://raw.githubusercontent.com/Joaquinvesapa/sub-agent-statusline/main/assets/subagents_monitor_banner.webp", alt: "Subagents Monitor banner", source: "readme" },
  "markwilkening-opencode-status-line": { url: "https://opengraph.githubassets.com/1/markwilkening21/opencode-status-line", alt: "opencode-status-line repo preview", source: "og-fallback" },
  "opencode-quota": { url: "https://shawnkiser.com/opencode-quota/sidebar.webp", alt: "opencode-quota sidebar", source: "readme" },
  "ramtinj95-opencode-tokenscope": { url: "https://opengraph.githubassets.com/1/ramtinJ95/opencode-tokenscope", alt: "opencode-tokenscope repo preview", source: "og-fallback" },
  "kiriketsuki-gemini-statusline": { url: "https://opengraph.githubassets.com/1/Kiriketsuki/gemini-statusline", alt: "gemini-statusline repo preview", source: "og-fallback" },
  "capedbitmap-codex-hud": { url: "https://raw.githubusercontent.com/Capedbitmap/codex-hud/HEAD/docs/images/codex-hud-menu.png", alt: "codex-hud menu bar with account status", source: "readme" },
  "fwyc-codex-hud": { url: "https://raw.githubusercontent.com/fwyc0573/codex-hud/HEAD/doc/fig/2a00eaf0-496a-4039-a0ce-87a9453df30d.png", alt: "codex-hud single-session statusline demo", source: "readme" },
  "tokscale": { url: "https://raw.githubusercontent.com/junhoyeo/tokscale/HEAD/.github/assets/hero-v2.png", alt: "tokscale hero banner", source: "readme" },
};

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

let touched = 0;
const seen = new Set();
const groups = readdirSync(CATALOG, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "locks")
  .map((d) => d.name);

for (const g of groups) {
  for (const f of readdirSync(join(CATALOG, g))) {
    if (!f.endsWith(".json")) continue;
    const path = join(CATALOG, g, f);
    const entry = JSON.parse(readFileSync(path, "utf8"));
    const img = IMAGES[entry.slug];
    if (!img) continue;
    seen.add(entry.slug);
    entry.image = img;
    const reordered = reorderKeys(entry);
    writeFileSync(path, JSON.stringify(reordered, null, 2) + "\n");
    touched += 1;
    process.stdout.write(`patched ${entry.slug}\n`);
  }
}

const missing = Object.keys(IMAGES).filter((s) => !seen.has(s));
if (missing.length) {
  process.stderr.write(`unmatched slugs in IMAGES table: ${missing.join(", ")}\n`);
  process.exit(1);
}
process.stdout.write(`apply-images: ${touched} entries patched\n`);
