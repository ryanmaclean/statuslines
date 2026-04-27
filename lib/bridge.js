import { mkdtempSync, readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";

const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;

export function bridgePath(tool, sessionId) {
  if (!SAFE_ID.test(sessionId)) {
    throw new Error(`unsafe session id: ${sessionId}`);
  }
  if (!SAFE_ID.test(tool)) {
    throw new Error(`unsafe tool name: ${tool}`);
  }
  return join(tmpdir(), `statuslines-${tool}-ctx-${sessionId}.json`);
}

export function writeBridge(tool, sessionId, data) {
  const path = bridgePath(tool, sessionId);
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify({ ...data, timestamp: Date.now() }));
  renameSync(tmp, path);
  return path;
}

export function readBridge(tool, sessionId, maxAgeMs = 60_000) {
  const path = bridgePath(tool, sessionId);
  if (!existsSync(path)) return null;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8"));
    if (typeof raw?.timestamp !== "number") return null;
    if (Date.now() - raw.timestamp > maxAgeMs) return null;
    return raw;
  } catch {
    return null;
  }
}
