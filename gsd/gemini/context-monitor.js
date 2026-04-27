#!/usr/bin/env node
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, isAbsolute, normalize } from "node:path";
import { readStdinJson } from "../../lib/safe-stdin.js";

const TOOL = "gemini";
const WARN_AT = 35;
const CRIT_AT = 25;
const MIN_CALLS_BETWEEN = 5;
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const DEFAULT_WINDOW = Number(process.env.STATUSLINES_GEMINI_WINDOW ?? 1_000_000);
const MAX_TRANSCRIPT_BYTES = 16 * 1024 * 1024;

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

function saveState(p, s) { try { writeFileSync(p, JSON.stringify(s)); } catch { /* best-effort */ } }

function estimateUsedTokens(transcriptPath) {
  if (!transcriptPath || !isAbsolute(transcriptPath)) return null;
  const safe = normalize(transcriptPath);
  if (!existsSync(safe)) return null;
  const st = statSync(safe);
  if (!st.isFile() || st.size > MAX_TRANSCRIPT_BYTES) return null;

  let raw;
  try { raw = readFileSync(safe, "utf8"); } catch { return null; }

  let lastTotal = null;
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    const t = entry?.usageMetadata?.totalTokenCount
      ?? entry?.usage_metadata?.total_token_count
      ?? entry?.usage?.totalTokens;
    if (typeof t === "number") lastTotal = t;
  }
  if (typeof lastTotal === "number") return lastTotal;

  // Fallback: char-count / 4 heuristic
  return Math.round(raw.length / 4);
}

function severity(remainingPct) {
  if (remainingPct <= CRIT_AT) return "CRITICAL";
  if (remainingPct <= WARN_AT) return "WARNING";
  return null;
}

function escalates(prev, next) { return next === "CRITICAL" && prev !== "CRITICAL"; }

(async () => {
  const input = (await readStdinJson()) ?? {};
  const sessionId = input?.session_id;
  if (!sessionId || !SAFE_ID.test(sessionId)) { process.exit(0); }

  const used = estimateUsedTokens(input?.transcript_path);
  if (used == null) { process.exit(0); }

  const usedPct = Math.min(100, (used / DEFAULT_WINDOW) * 100);
  const remaining = 100 - usedPct;
  const sev = severity(remaining);

  const sp = statePath(sessionId);
  const state = loadState(sp);
  state.callIndex = (state.callIndex ?? 0) + 1;

  if (!sev) { saveState(sp, state); process.exit(0); }
  const debounced = state.callIndex - state.lastCallIndex < MIN_CALLS_BETWEEN;
  if (debounced && !escalates(state.lastSeverity, sev)) { saveState(sp, state); process.exit(0); }

  state.lastSeverity = sev;
  state.lastCallIndex = state.callIndex;
  saveState(sp, state);

  const message = sev === "CRITICAL"
    ? `Context is at ${remaining.toFixed(0)}% remaining. Wrap up the current step and consider compacting.`
    : `Context is at ${remaining.toFixed(0)}% remaining. Plan to summarize before deeper exploration.`;

  process.stderr.write(`[statuslines/${sev}] ${message}\n`);
  process.stdout.write(JSON.stringify({
    additionalContext: `[statuslines/${sev}] ${message}`,
  }));
})();
