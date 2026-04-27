import { readBridge } from "../../lib/bridge.js";

const TOOL = "opencode";
const WARN_AT = 35;
const CRIT_AT = 25;
const MIN_CALLS_BETWEEN = 5;
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;

const sessions = new Map();

function severity(remainingPct) {
  if (remainingPct <= CRIT_AT) return "CRITICAL";
  if (remainingPct <= WARN_AT) return "WARNING";
  return null;
}

function escalates(prev, next) {
  return next === "CRITICAL" && prev !== "CRITICAL";
}

function buildMessage(sev, remaining) {
  const pct = remaining.toFixed(0);
  return sev === "CRITICAL"
    ? `[statuslines/CRITICAL] Context is at ${pct}% remaining. Wrap up the current step and consider compacting.`
    : `[statuslines/WARNING] Context is at ${pct}% remaining. Plan to summarize before deeper exploration.`;
}

export const StatuslinesContextMonitor = async ({ project, client, $ }) => {
  void project; void client; void $;
  return {
    "tool.execute.after": async (event) => {
      const sessionId = event?.sessionID ?? event?.session?.id;
      if (!sessionId || !SAFE_ID.test(sessionId)) return;

      const ctx = readBridge(TOOL, sessionId);
      if (!ctx || typeof ctx.remaining_percentage !== "number") return;

      const sev = severity(ctx.remaining_percentage);
      const state = sessions.get(sessionId) ?? { lastSeverity: null, lastCallIndex: -Infinity, callIndex: 0 };
      state.callIndex += 1;

      if (!sev) { sessions.set(sessionId, state); return; }
      const debounced = state.callIndex - state.lastCallIndex < MIN_CALLS_BETWEEN;
      if (debounced && !escalates(state.lastSeverity, sev)) {
        sessions.set(sessionId, state);
        return;
      }

      state.lastSeverity = sev;
      state.lastCallIndex = state.callIndex;
      sessions.set(sessionId, state);

      const msg = buildMessage(sev, ctx.remaining_percentage);
      process.stderr.write(msg + "\n");
      return { additionalContext: msg };
    },
  };
};

export default StatuslinesContextMonitor;
