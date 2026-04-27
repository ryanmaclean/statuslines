#!/usr/bin/env node
import { basename } from "node:path";
import { fg, dim, noColor } from "../../lib/colors.js";
import { renderBar } from "../../lib/bar.js";
import { gitBranch, gitDirty } from "../../lib/git.js";
import { writeBridge } from "../../lib/bridge.js";
import { readStdinJson } from "../../lib/safe-stdin.js";

const TOOL = "claude";
const SEP = noColor() ? " | " : ` ${dim("·")} `;

function pickContext(input) {
  const cw = input?.context_window ?? input?.context ?? {};
  const used = cw.used_tokens ?? cw.input_tokens;
  const total = cw.total ?? cw.max_tokens ?? cw.window_size;
  if (typeof used !== "number" || typeof total !== "number" || total <= 0) {
    return null;
  }
  const usedPct = (used / total) * 100;
  return { used, total, usedPct, remainingPct: 100 - usedPct };
}

function modelLabel(input) {
  const m = input?.model;
  if (!m) return "claude";
  if (typeof m === "string") return m;
  return m.display_name ?? m.id ?? "claude";
}

function dirLabel(input) {
  const w = input?.workspace?.current_dir ?? input?.cwd ?? process.cwd();
  return basename(w);
}

function gitSegment(cwd) {
  const branch = gitBranch(cwd);
  if (!branch) return null;
  const dirty = gitDirty(cwd);
  const mark = dirty ? fg.yellow("●") : fg.green("✓");
  return `${fg.cyan(branch)} ${mark}`;
}

(async () => {
  const input = (await readStdinJson()) ?? {};
  const sessionId = input?.session_id ?? "unknown";
  const cwd = input?.workspace?.current_dir ?? input?.cwd ?? process.cwd();

  const ctx = pickContext(input);
  if (ctx && /^[A-Za-z0-9_-]{1,128}$/.test(sessionId)) {
    try {
      writeBridge(TOOL, sessionId, {
        used_pct: ctx.usedPct,
        remaining_percentage: ctx.remainingPct,
      });
    } catch { /* bridge is best-effort */ }
  }

  const parts = [
    fg.magenta(modelLabel(input)),
    fg.blue(dirLabel(input)),
    gitSegment(cwd),
    ctx ? renderBar(ctx.usedPct) : null,
  ].filter(Boolean);

  process.stdout.write(parts.join(SEP) + "\n");
})();
