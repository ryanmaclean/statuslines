import { readFileSync, writeFileSync, renameSync, existsSync, openSync, closeSync, unlinkSync, statSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { loadConfig } from "./config.js";

const CACHE_NAME = "statuslines-pup-events.json";
const LOCK_NAME = "statuslines-pup-events.lock";
const LOG_NAME = "statuslines-pup.log";
const LOCK_STALE_MS = 30_000;
const LOCK_WAIT_MS = 250;

function cachePath(cfg) { return cfg.cache_path ?? join(tmpdir(), CACHE_NAME); }
function lockPath(cfg)  { return (cfg.cache_path ?? join(tmpdir(), LOCK_NAME)) + ".lock"; }
function logPath()      { return join(tmpdir(), LOG_NAME); }

function log(line) {
  try { appendFileSync(logPath(), `${new Date().toISOString()} ${line}\n`); } catch { /* best-effort */ }
}

function readCache(p) {
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
}

function writeCacheAtomic(p, data) {
  const tmp = `${p}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(data));
  renameSync(tmp, p);
}

function tryAcquireLock(p) {
  if (existsSync(p)) {
    try {
      const age = Date.now() - statSync(p).mtimeMs;
      if (age > LOCK_STALE_MS) { unlinkSync(p); }
      else { return false; }
    } catch { /* race; fall through */ }
  }
  try {
    const fd = openSync(p, "wx");
    closeSync(fd);
    return true;
  } catch {
    return false;
  }
}

function releaseLock(p) { try { unlinkSync(p); } catch { /* ignore */ } }

function buildArgs(cfg) {
  const args = ["events", "list", "--duration", cfg.duration, "--output", "json"];
  if (cfg.tags)       args.push("--tags", cfg.tags);
  if (cfg.priority)   args.push("--priority", cfg.priority);
  if (cfg.sources)    args.push("--sources", cfg.sources);
  if (cfg.alert_type) args.push("--alert-type", cfg.alert_type);
  if (cfg.max_events) args.push("--limit", String(cfg.max_events));
  return args;
}

function callPup(cfg) {
  const args = buildArgs(cfg);
  log(`fetch: ${cfg.pup_bin} ${args.join(" ")}`);
  const r = spawnSync(cfg.pup_bin, args, {
    encoding: "utf8",
    timeout: 10_000,
    env: { ...process.env, PUP_AGENT_MODE: "1" },
  });
  if (r.error?.code === "ENOENT") {
    return { error: "pup_not_installed", events: [] };
  }
  if (r.status !== 0) {
    const stderr = (r.stderr ?? "").trim().slice(0, 400);
    log(`error status=${r.status} stderr=${stderr}`);
    if (/rate.?limit|429/i.test(stderr)) return { error: "rate_limited", events: [] };
    if (/auth|401|403/i.test(stderr))    return { error: "auth", events: [] };
    return { error: "unknown", events: [] };
  }
  let parsed;
  try { parsed = JSON.parse(r.stdout); } catch { return { error: "parse", events: [] }; }
  const events = Array.isArray(parsed)
    ? parsed
    : (Array.isArray(parsed?.events) ? parsed.events : (Array.isArray(parsed?.data) ? parsed.data : []));
  return { error: null, events };
}

export function getEvents({ force = false } = {}) {
  const cfg = loadConfig();
  const cp = cachePath(cfg);
  const lp = lockPath(cfg);
  const ttlMs = Math.max(1, cfg.ttl_seconds) * 1000;
  const now = Date.now();

  const cached = readCache(cp);
  const fresh = cached && typeof cached.fetched_at === "number" && (now - cached.fetched_at) < ttlMs;
  if (fresh && !force) {
    return { ...cached, source: "cache" };
  }

  if (!tryAcquireLock(lp)) {
    // Someone else is fetching. Wait briefly to see if they finish.
    const deadline = Date.now() + LOCK_WAIT_MS;
    while (Date.now() < deadline) {
      const c = readCache(cp);
      if (c && typeof c.fetched_at === "number" && (Date.now() - c.fetched_at) < ttlMs) {
        return { ...c, source: "cache_after_wait" };
      }
    }
    if (cached) return { ...cached, source: "stale" };
    return { fetched_at: now, error: "locked", events: [], source: "no_data" };
  }

  let result;
  try {
    const fetched = callPup(cfg);
    result = {
      fetched_at: Date.now(),
      ttl_seconds: cfg.ttl_seconds,
      duration: cfg.duration,
      filters: { tags: cfg.tags, priority: cfg.priority, alert_type: cfg.alert_type, sources: cfg.sources },
      ...fetched,
    };
    writeCacheAtomic(cp, result);
    log(`fetched ${result.events.length} events error=${result.error ?? "none"}`);
  } finally {
    releaseLock(lp);
  }
  return { ...result, source: "fresh" };
}

export function readEventsCacheOnly() {
  const cfg = loadConfig();
  const c = readCache(cachePath(cfg));
  if (!c) return null;
  const ageMs = Date.now() - (c.fetched_at ?? 0);
  return { ...c, age_ms: ageMs };
}

export function paths() {
  const cfg = loadConfig();
  return { cache: cachePath(cfg), lock: lockPath(cfg), log: logPath() };
}
