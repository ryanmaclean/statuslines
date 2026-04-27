import { fg, dim, noColor } from "../../lib/colors.js";

const ALERT_EMOJI = {
  error: "✗",
  warning: "⚠",
  success: "✓",
  info: "ℹ",
  user_update: "·",
};

function ageLabel(ageMs) {
  if (ageMs == null || !Number.isFinite(ageMs)) return "?";
  const s = Math.floor(ageMs / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}

function pickAlertType(ev) {
  return ev.alert_type ?? ev.alertType ?? ev.attributes?.attributes?.alert_type ?? "info";
}

function tally(events) {
  const t = { error: 0, warning: 0, success: 0, info: 0, user_update: 0 };
  for (const e of events) {
    const k = pickAlertType(e);
    if (k in t) t[k] += 1;
    else t.info += 1;
  }
  return t;
}

export function renderPupSegment(cache, { staleAfterMs = 5 * 60 * 1000 } = {}) {
  if (!cache) return noColor() ? "pup:—" : dim("pup:—");

  if (cache.error === "pup_not_installed") {
    return noColor() ? "pup:not installed" : dim("pup:not installed");
  }
  if (cache.error === "auth") return noColor() ? "pup:auth?" : fg.red("pup:auth?");
  if (cache.error === "rate_limited") return noColor() ? "pup:rate-limited" : fg.yellow("pup:rate-limited");

  const events = Array.isArray(cache.events) ? cache.events : [];
  const t = tally(events);
  const age = ageLabel(cache.age_ms ?? (Date.now() - (cache.fetched_at ?? 0)));
  const stale = (cache.age_ms ?? (Date.now() - (cache.fetched_at ?? 0))) > staleAfterMs;

  const parts = [];
  if (events.length === 0) {
    parts.push(noColor() ? "pup:idle" : dim("pup:idle"));
  } else {
    const segs = [];
    if (t.success > 0) segs.push(noColor() ? `${ALERT_EMOJI.success}${t.success}` : fg.green(`${ALERT_EMOJI.success}${t.success}`));
    if (t.warning > 0) segs.push(noColor() ? `${ALERT_EMOJI.warning}${t.warning}` : fg.yellow(`${ALERT_EMOJI.warning}${t.warning}`));
    if (t.error > 0)   segs.push(noColor() ? `${ALERT_EMOJI.error}${t.error}`     : fg.red(`${ALERT_EMOJI.error}${t.error}`));
    if (t.info > 0)    segs.push(noColor() ? `${ALERT_EMOJI.info}${t.info}`       : fg.cyan(`${ALERT_EMOJI.info}${t.info}`));
    parts.push(`pup:${segs.join(" ")}`);
  }

  const ageTag = stale ? (noColor() ? `(${age} stale)` : dim(`(${age} stale)`)) : (noColor() ? `(${age})` : dim(`(${age})`));
  parts.push(ageTag);
  const joined = parts.join(" ");
  return stale && !noColor() ? dim(joined) : joined;
}
