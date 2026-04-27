#!/usr/bin/env node
import { basename } from "node:path";
import { fg, dim, noColor } from "../../lib/colors.js";
import { renderBar } from "../../lib/bar.js";
import { gitBranch, gitDirty } from "../../lib/git.js";
import { writeBridge } from "../../lib/bridge.js";
import { readStdinJson } from "../../lib/safe-stdin.js";
import { getEvents } from "../lib/events.js";
import { renderPupSegment } from "../lib/render.js";

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

function dirLabel(input) { return basename(input?.directory ?? input?.cwd ?? process.cwd()); }

function gitSegment(cwd) {
  const branch = gitBranch(cwd);
  if (!branch) return null;
  return `${fg.cyan(branch)} ${gitDirty(cwd) ? fg.yellow("●") : fg.green("✓")}`;
}

(async () => {
  const input = (await readStdinJson()) ?? {};
  const sessionId = input?.session?.id ?? input?.session_id ?? "unknown";
  const cwd = input?.directory ?? input?.cwd ?? process.cwd();
  const ctx = pickContext(input);

  if (ctx && SAFE_ID.test(sessionId)) {
    try { writeBridge(TOOL, sessionId, { used_pct: ctx.usedPct, remaining_percentage: ctx.remainingPct }); } catch {}
  }

  const cache = getEvents();
  const parts = [
    fg.magenta(modelLabel(input)),
    fg.blue(dirLabel(input)),
    gitSegment(cwd),
    ctx ? renderBar(ctx.usedPct) : null,
    renderPupSegment(cache),
  ].filter(Boolean);

  process.stdout.write(parts.join(SEP) + "\n");
})();
