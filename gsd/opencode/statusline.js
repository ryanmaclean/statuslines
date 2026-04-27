#!/usr/bin/env node
import { basename } from "node:path";
import { fg, dim, noColor } from "../../lib/colors.js";
import { renderBar } from "../../lib/bar.js";
import { gitBranch, gitDirty } from "../../lib/git.js";
import { writeBridge } from "../../lib/bridge.js";
import { readStdinJson } from "../../lib/safe-stdin.js";

const TOOL = "opencode";
const SEP = noColor() ? " | " : ` ${dim("·")} `;
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;

function pickContext(input) {
  const tokens = input?.tokens ?? input?.usage ?? {};
  const used = tokens.input ?? tokens.context ?? tokens.used;
  const total = tokens.context_window ?? tokens.max ?? input?.model?.context_window;
  if (typeof used !== "number" || typeof total !== "number" || total <= 0) return null;
  const usedPct = (used / total) * 100;
  return { used, total, usedPct, remainingPct: 100 - usedPct };
}

function modelLabel(input) {
  const m = input?.model;
  if (!m) return "opencode";
  if (typeof m === "string") return m;
  return m.name ?? m.id ?? "opencode";
}

function dirLabel(input) {
  const w = input?.directory ?? input?.cwd ?? process.cwd();
  return basename(w);
}

function gitSegment(cwd) {
  const branch = gitBranch(cwd);
  if (!branch) return null;
  const dirty = gitDirty(cwd);
  return `${fg.cyan(branch)} ${dirty ? fg.yellow("●") : fg.green("✓")}`;
}

function costSegment(input) {
  const cost = input?.cost ?? input?.session?.cost;
  if (typeof cost !== "number") return null;
  return fg.gray(`$${cost.toFixed(4)}`);
}

(async () => {
  const input = (await readStdinJson()) ?? {};
  const sessionId = input?.session?.id ?? input?.session_id ?? "unknown";
  const cwd = input?.directory ?? input?.cwd ?? process.cwd();
  const ctx = pickContext(input);

  if (ctx && SAFE_ID.test(sessionId)) {
    try {
      writeBridge(TOOL, sessionId, {
        used_pct: ctx.usedPct,
        remaining_percentage: ctx.remainingPct,
      });
    } catch { /* best-effort */ }
  }

  const parts = [
    fg.magenta(modelLabel(input)),
    fg.blue(dirLabel(input)),
    gitSegment(cwd),
    costSegment(input),
    ctx ? renderBar(ctx.usedPct) : null,
  ].filter(Boolean);

  process.stdout.write(parts.join(SEP) + "\n");
})();
