#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readBridge } from "../../lib/bridge.js";
import { readStdinJson } from "../../lib/safe-stdin.js";

const TOOL = "claude";
const WARN_AT = 35;
const CRIT_AT = 25;
const MIN_CALLS_BETWEEN = 5;
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;

function statePath(sessionId) {
  if (!SAFE_ID.test(sessionId)) throw new Error("unsafe session id");
  const dir = join(tmpdir(), "statuslines-state");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return join(dir, `${TOOL}-${sessionId}.json`);
}

function loadState(p) {
  if (!existsSync(p)) return { lastSeverity: null, lastCallIndex: -Infinity, callIndex: 0 };
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return { lastSeverity: null, lastCallIndex: -Infinity, callIndex: 0 }; }
}

function saveState(p, s) {
  try { writeFileSync(p, JSON.stringify(s)); } catch { /* best-effort */ }
}

function severity(remainingPct) {
  if (remainingPct <= CRIT_AT) return "CRITICAL";
  if (remainingPct <= WARN_AT) return "WARNING";
  return null;
}

function escalates(prev, next) {
  if (next === "CRITICAL" && prev !== "CRITICAL") return true;
  return false;
}

(async () => {
  const input = (await readStdinJson()) ?? {};
  const sessionId = input?.session_id;
  if (!sessionId || !SAFE_ID.test(sessionId)) { process.exit(0); }

  const ctx = readBridge(TOOL, sessionId);
  if (!ctx || typeof ctx.remaining_percentage !== "number") { process.exit(0); }

  const sev = severity(ctx.remaining_percentage);
  const sp = statePath(sessionId);
  const state = loadState(sp);
  state.callIndex = (state.callIndex ?? 0) + 1;

  const debounced = state.callIndex - state.lastCallIndex < MIN_CALLS_BETWEEN;
  if (!sev) { saveState(sp, state); process.exit(0); }
  if (debounced && !escalates(state.lastSeverity, sev)) { saveState(sp, state); process.exit(0); }

  state.lastSeverity = sev;
  state.lastCallIndex = state.callIndex;
  saveState(sp, state);

  const message = sev === "CRITICAL"
    ? `Context is at ${ctx.remaining_percentage.toFixed(0)}% remaining. Wrap up the current step and consider compacting.`
    : `Context is at ${ctx.remaining_percentage.toFixed(0)}% remaining. Plan to summarize before deeper exploration.`;

  process.stdout.write(JSON.stringify({
    decision: "continue",
    additionalContext: `[statuslines/${sev}] ${message}`,
  }));
})();
