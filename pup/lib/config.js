import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULTS = {
  ttl_seconds: 60,
  duration: "5m",
  tags: null,
  priority: null,
  alert_type: null,
  sources: null,
  max_events: 50,
  pup_bin: "pup",
  cache_path: null,
};

function readConfigFile() {
  const explicit = process.env.STATUSLINES_PUP_CONFIG;
  const candidates = [
    explicit,
    join(homedir(), ".config", "statuslines", "pup.json"),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) {
      try { return JSON.parse(readFileSync(p, "utf8")); } catch { /* fall through */ }
    }
  }
  return {};
}

function fromEnv() {
  const e = process.env;
  const out = {};
  if (e.STATUSLINES_PUP_TTL_SECONDS) out.ttl_seconds = Number(e.STATUSLINES_PUP_TTL_SECONDS);
  if (e.STATUSLINES_PUP_DURATION)    out.duration    = e.STATUSLINES_PUP_DURATION;
  if (e.STATUSLINES_PUP_TAGS)        out.tags        = e.STATUSLINES_PUP_TAGS;
  if (e.STATUSLINES_PUP_PRIORITY)    out.priority    = e.STATUSLINES_PUP_PRIORITY;
  if (e.STATUSLINES_PUP_ALERT_TYPE)  out.alert_type  = e.STATUSLINES_PUP_ALERT_TYPE;
  if (e.STATUSLINES_PUP_SOURCES)     out.sources     = e.STATUSLINES_PUP_SOURCES;
  if (e.STATUSLINES_PUP_MAX_EVENTS)  out.max_events  = Number(e.STATUSLINES_PUP_MAX_EVENTS);
  if (e.STATUSLINES_PUP_BIN)         out.pup_bin     = e.STATUSLINES_PUP_BIN;
  if (e.STATUSLINES_PUP_CACHE_PATH)  out.cache_path  = e.STATUSLINES_PUP_CACHE_PATH;
  return out;
}

export function loadConfig() {
  return { ...DEFAULTS, ...readConfigFile(), ...fromEnv() };
}
