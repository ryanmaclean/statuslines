#!/usr/bin/env node
import { readdirSync, statSync, readFileSync, watchFile, unwatchFile, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fg, dim, noColor } from "../../lib/colors.js";
import { renderBar } from "../../lib/bar.js";
import { gitBranch, gitDirty } from "../../lib/git.js";
import { getEvents } from "../lib/events.js";
import { renderPupSegment } from "../lib/render.js";

const CODEX_HOME = process.env.CODEX_HOME ?? join(homedir(), ".codex");
const SESSIONS_DIR = join(CODEX_HOME, "sessions");
const POLL_MS = Number(process.env.STATUSLINES_CODEX_POLL_MS ?? 2000);
const SEP = noColor() ? " | " : ` ${dim("·")} `;
const DEFAULT_WINDOW = Number(process.env.STATUSLINES_CODEX_WINDOW ?? 200_000);

function findLatestRollout(root) {
  if (!existsSync(root)) return null;
  let best = null;
  const walk = (dir) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.startsWith("rollout-") && e.name.endsWith(".jsonl")) {
        const st = statSync(p);
        if (!best || st.mtimeMs > best.mtimeMs) best = { path: p, mtimeMs: st.mtimeMs };
      }
    }
  };
  walk(root);
  return best?.path ?? null;
}

function parseRollout(path) {
  let raw;
  try { raw = readFileSync(path, "utf8"); } catch { return null; }
  let model = null, totalTokens = null, cwd = null;
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    let entry; try { entry = JSON.parse(line); } catch { continue; }
    const payload = entry?.payload ?? entry;
    if (payload?.type === "session_meta" || entry?.type === "session_meta") {
      const meta = payload?.meta ?? payload;
      model = meta?.model ?? model;
      cwd = meta?.cwd ?? cwd;
    }
    if (payload?.type === "token_count") {
      const info = payload?.info ?? payload;
      const t = info?.total_token_usage?.total_tokens ?? info?.total_token_usage?.input_tokens;
      if (typeof t === "number") totalTokens = t;
      const m = payload?.turn_context?.model ?? info?.model;
      if (m) model = m;
    }
  }
  return { model, totalTokens, cwd };
}

function render({ model, totalTokens, cwd, sessionPath, pupCache }) {
  const usedPct = totalTokens != null ? Math.min(100, (totalTokens / DEFAULT_WINDOW) * 100) : null;
  const cwdLabel = cwd ? basename(cwd) : "?";
  const branch = cwd ? gitBranch(cwd) : null;
  const dirty = cwd ? gitDirty(cwd) : null;
  const parts = [
    fg.magenta(model ?? "codex"),
    fg.blue(cwdLabel),
    branch ? `${fg.cyan(branch)} ${dirty ? fg.yellow("●") : fg.green("✓")}` : null,
    usedPct != null ? renderBar(usedPct) : fg.gray("(no token data)"),
    renderPupSegment(pupCache),
    fg.gray(basename(sessionPath ?? "")),
  ].filter(Boolean);
  return parts.join(SEP);
}

const tmuxAvailable = () => spawnSync("tmux", ["-V"], { stdio: "ignore" }).status === 0;
const inTmux = () => Boolean(process.env.TMUX);
const setTmuxStatus = (text) => {
  try { execFileSync("tmux", ["set-option", "-g", "status-right", text], { stdio: "ignore" }); } catch {}
};

function once() {
  const path = findLatestRollout(SESSIONS_DIR);
  if (!path) { process.stderr.write(`No rollouts under ${SESSIONS_DIR}\n`); process.exit(1); }
  const data = parseRollout(path) ?? {};
  const pupCache = getEvents();
  process.stdout.write(render({ ...data, sessionPath: path, pupCache }) + "\n");
}

function loop() {
  let currentPath = findLatestRollout(SESSIONS_DIR);
  const tmux = inTmux() && tmuxAvailable();

  const tick = () => {
    const latest = findLatestRollout(SESSIONS_DIR);
    if (!latest) return;
    if (latest !== currentPath) {
      if (currentPath) unwatchFile(currentPath);
      currentPath = latest;
      watchFile(currentPath, { interval: POLL_MS }, tick);
    }
    const data = parseRollout(currentPath) ?? {};
    const pupCache = getEvents();
    const line = render({ ...data, sessionPath: currentPath, pupCache });
    if (tmux) setTmuxStatus(line);
    else process.stdout.write(`\r\x1b[K${line}`);
  };

  if (currentPath) watchFile(currentPath, { interval: POLL_MS }, tick);
  tick();
  setInterval(tick, POLL_MS);
}

const cmd = process.argv[2] ?? "watch";
if (cmd === "once") once();
else if (cmd === "watch") loop();
else if (cmd === "--help" || cmd === "-h") {
  process.stdout.write("Usage: pup/codex/hud.js [once|watch]\n");
} else { process.stderr.write(`unknown subcommand: ${cmd}\n`); process.exit(2); }
