#!/usr/bin/env node
// socket-feed: ask Socket.dev for supply-chain alerts on every npm-backed
// catalog entry; quarantine anything flagged high/critical.
//
// API: GET https://api.socket.dev/v0/npm/<pkg>/<version>/issues
//   Auth   : HTTP Basic with the API token as the *username* and an empty
//            password — `Authorization: Basic base64("<token>:")`. Bearer is
//            not accepted (this matches @socketsecurity/sdk internals).
//   Quota  : 1 unit/call; over-quota → HTTP 429 + Retry-After.
//   Body   : JSON array of alert wrappers. Each alert has a `type`
//            discriminator and severity in {low, middle, high, critical} and
//            a category in {supplyChainRisk, quality, maintenance,
//            vulnerability, license, other}. Fields sometimes appear flat
//            and sometimes under `value`, so we read both.
//
// Exit: 0 even when alerts are recorded; 1 only on transport/auth/quota
// errors that prevent a reliable verdict.

import { readdir, readFile, writeFile } from "node:fs/promises";

const ROOT = new URL("../catalog/", import.meta.url);
const API = "https://api.socket.dev/v0";
const TOKEN = process.env.SOCKET_API_TOKEN;
const TODAY = new Date().toISOString().slice(0, 10);
const TIMEOUT_MS = 20_000;
const NPM_TYPES = new Set(["npx", "npm-global", "opencode-plugin"]);
const BLOCKING = new Set(["high", "critical"]);

if (!TOKEN) {
  console.error("socket-feed: SOCKET_API_TOKEN is not set");
  process.exit(1);
}
const AUTH = "Basic " + Buffer.from(TOKEN + ":").toString("base64");

async function listEntries() {
  const out = [];
  for (const cli of await readdir(ROOT, { withFileTypes: true })) {
    if (!cli.isDirectory()) continue;
    const dir = new URL(cli.name + "/", ROOT);
    for (const f of await readdir(dir)) {
      if (f.endsWith(".json")) out.push(new URL(f, dir));
    }
  }
  return out;
}

function normalizeAlert(row) {
  const v = (row && typeof row === "object" && row.value) || row || {};
  const sev = String(v.severity ?? row?.severity ?? "low").toLowerCase();
  return {
    type: row?.type ?? v.type ?? "unknown",
    severity: sev,
    category: v.category ?? row?.category ?? null,
    key: v.key ?? row?.key ?? null,
    description: v.description ?? null,
  };
}

async function fetchIssues(pkg, version) {
  const url = `${API}/npm/${encodeURIComponent(pkg)}/${encodeURIComponent(version)}/issues`;
  const res = await fetch(url, {
    headers: { Authorization: AUTH, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) return []; // unknown to Socket — no findings to record
  if (res.status === 401 || res.status === 403) {
    throw new Error(`auth rejected (HTTP ${res.status}) — check SOCKET_API_TOKEN`);
  }
  if (res.status === 429) {
    const wait = res.headers.get("retry-after") || "?";
    throw new Error(`rate limited (HTTP 429), retry-after=${wait}s`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${pkg}@${version}`);
  const body = await res.json().catch(() => null);
  return Array.isArray(body) ? body.map(normalizeAlert) : [];
}

function summarize(alerts) {
  const top = alerts.filter((a) => BLOCKING.has(a.severity)).slice(0, 3)
    .map((a) => `${a.severity}:${a.type}`).join(", ");
  return top || `${alerts.length} alerts`;
}

let scanned = 0, updated = 0, quarantined = 0, apiError = null;
for (const file of await listEntries()) {
  const entry = JSON.parse(await readFile(file, "utf8"));
  const inst = entry.install || {};
  if (!NPM_TYPES.has(inst.type) || !inst.package || !inst.version) continue;
  scanned++;
  let alerts;
  try { alerts = await fetchIssues(inst.package, inst.version); }
  catch (err) {
    console.error(`socket-feed: ${entry.slug}: ${err.message}`);
    apiError = err;
    break;
  }
  const blocking = alerts.filter((a) => BLOCKING.has(a.severity));
  const sec = (entry.security ||= {});
  const before = JSON.stringify(entry);
  sec.socket_alerts = {
    fetched_at: TODAY,
    package: `${inst.package}@${inst.version}`,
    total: alerts.length,
    blocking: blocking.length,
    alerts,
  };
  if (blocking.length > 0) {
    sec.quarantined = true;
    sec.quarantine_reason = `Socket.dev: ${summarize(alerts)}`;
    sec.quarantined_at = TODAY;
    quarantined++;
  }
  if (JSON.stringify(entry) !== before) {
    await writeFile(file, JSON.stringify(entry, null, 2) + "\n");
    updated++;
    console.log(`socket-feed: ${entry.slug}: ${alerts.length} alerts (${blocking.length} blocking)`);
  }
}
console.log(`socket-feed: scanned=${scanned} updated=${updated} quarantined=${quarantined}`);
if (apiError) process.exit(1);
