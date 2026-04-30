#!/usr/bin/env node
// verify-capabilities: Phase G — sandboxed install verification.
//
// Given a catalog slug, runs the entry's install/invoke step inside a
// firejail (preferred) or bubblewrap sandbox, captures connect()/sendto()
// syscalls via strace, and emits a JSON report comparing observed
// behavior against the entry's declared `capabilities` block.
//
// Exit 0 when observed ⊆ declared. Exit 1 when observed exceeds declared
// (e.g. a network call we didn't allow, a child_process spawn we didn't
// declare). Exit 2 on argument/usage errors.
//
// On a host without firejail OR bubblewrap, falls back to strace-only
// (warns loudly about reduced isolation). The CI runner provisions
// firejail explicitly via apt; this fallback exists for local dev.
//
// --dry-run skips the actual sandboxed invocation and instead prints a
// canned shape so the wiring can be exercised in CI smoke tests without
// reaching the network or spawning anything.

import { readdirSync, readFileSync, mkdtempSync, existsSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "catalog");

// strace filter: trace network-related syscalls plus process-spawn and
// filesystem-write syscalls so a single run yields all four declared
// dimensions. We follow forks (-f) because npx and npm fork eagerly.
const STRACE_FILTER = "trace=network,process,%file";

function listEntryFiles() {
  const out = [];
  if (!existsSync(CATALOG)) return out;
  for (const group of readdirSync(CATALOG, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const dir = join(CATALOG, group.name);
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".json")) out.push(join(dir, f));
    }
  }
  return out;
}

function findEntry(slug) {
  for (const f of listEntryFiles()) {
    const data = JSON.parse(readFileSync(f, "utf8"));
    if (data.slug === slug) {
      data._path = f;
      return data;
    }
  }
  return null;
}

function which(cmd) {
  const r = spawnSync("sh", ["-c", `command -v ${cmd}`], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

function pickSandbox() {
  if (which("firejail")) return "firejail";
  if (which("bwrap")) return "bubblewrap";
  return null;
}

// Parse strace output for network destinations. We look for connect()
// syscalls with sin_addr / sin6_addr / sun_path. The hostname is not
// directly visible; we extract IP literals and DNS queries (sendto on
// :53). For supply-chain hygiene we treat anything outside the
// loopback range as "network=true" and report unique destinations.
function parseStraceNetwork(text) {
  const hosts = new Set();
  let networkObserved = false;
  const reConnect = /connect\([0-9]+,\s*\{sa_family=AF_INET6?,\s*[^,]*?(?:sin6?_port=htons\([0-9]+\),\s*)?(?:inet_pton\([^,]+,\s*"([^"]+)"|sin_addr=inet_addr\("([^"]+)"\)|sin6_addr=inet_pton6\("([^"]+)"\))/g;
  let m;
  while ((m = reConnect.exec(text)) !== null) {
    const ip = m[1] || m[2] || m[3];
    if (!ip) continue;
    if (ip === "127.0.0.1" || ip === "::1") continue;
    networkObserved = true;
    hosts.add(ip);
  }
  // Some libc paths use a single connect() with a struct dump; fall back
  // to the looser "AF_INET" + non-loopback heuristic.
  if (/AF_INET[6]?\b/.test(text) && !/127\.0\.0\.1/.test(text)) {
    networkObserved = networkObserved || /connect\(/.test(text);
  }
  return { networkObserved, hosts: Array.from(hosts) };
}

function parseStraceProcess(text) {
  // execve() and clone()/fork() / vfork() indicate a child process. The
  // current process counts as one execve; anything beyond the first
  // execve is a child spawn.
  const execMatches = text.match(/^[^\n]*execve\(/gm) || [];
  const cloneMatches = text.match(/clone\(|fork\(|vfork\(/g) || [];
  return { childProcessObserved: execMatches.length > 1 || cloneMatches.length > 0 };
}

function parseStraceWrite(text, allowedRoots) {
  // openat(..., O_WRONLY|O_CREAT|...) with path outside the allowlist.
  const re = /openat\([^,]+,\s*"([^"]+)",\s*([^)]+)\)/g;
  let m;
  let writeOutside = false;
  while ((m = re.exec(text)) !== null) {
    const path = m[1];
    const flags = m[2];
    if (!/O_WRONLY|O_RDWR|O_CREAT|O_TRUNC|O_APPEND/.test(flags)) continue;
    const inAllowed = allowedRoots.some((root) => path.startsWith(root));
    if (!inAllowed) { writeOutside = true; break; }
  }
  return { filesystemWriteObserved: writeOutside };
}

function dryRunReport(slug, entry) {
  return {
    slug,
    install_type: entry?.install?.type ?? "unknown",
    sandbox: "dry-run",
    observed: {
      network: entry?.capabilities?.network ?? false,
      child_process: entry?.capabilities?.child_process ?? false,
      filesystem_write: entry?.capabilities?.filesystem_write ?? false,
    },
    domains_contacted: [],
    exceeds_declared: false,
    violations: [],
    dry_run: true,
  };
}

function buildSandboxCmd(sandbox, mode, tmpHome, tmpCache, straceLog, payloadCmd) {
  // mode: "no-net" or "with-net".
  // payloadCmd is a sh -c "..." string we want to run in isolation.
  const env = [
    `HOME=${tmpHome}`,
    `XDG_CACHE_HOME=${tmpCache}`,
    `TMPDIR=${tmpCache}`,
    `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
  ];
  const inner = `env -i ${env.join(" ")} strace -f -e ${STRACE_FILTER} -o ${straceLog} sh -c '${payloadCmd.replace(/'/g, "'\\''")}'`;
  if (sandbox === "firejail") {
    const net = mode === "no-net" ? "--net=none" : "--net=eth0";
    return ["firejail", ["--quiet", "--noprofile", net, `--private=${tmpHome}`, "sh", "-c", inner]];
  }
  if (sandbox === "bubblewrap") {
    const netArg = mode === "no-net" ? ["--unshare-net"] : [];
    return ["bwrap", [
      "--ro-bind", "/usr", "/usr",
      "--ro-bind", "/bin", "/bin",
      "--ro-bind", "/lib", "/lib",
      "--ro-bind", "/lib64", "/lib64",
      "--ro-bind", "/etc", "/etc",
      "--bind", tmpHome, tmpHome,
      "--bind", tmpCache, tmpCache,
      "--proc", "/proc",
      "--dev", "/dev",
      ...netArg,
      "sh", "-c", inner,
    ]];
  }
  // Fallback: no sandbox, strace only.
  return ["sh", ["-c", inner]];
}

function payloadFor(entry) {
  const t = entry?.install?.type;
  const pkg = entry?.install?.package;
  const ver = entry?.install?.version;
  if (t === "npx") {
    // --help is the cheapest invocation; npx still resolves the tarball.
    return `npx --ignore-scripts -y ${pkg}@${ver} --help || true`;
  }
  if (t === "npm-global") {
    return `npm i -g --ignore-scripts ${pkg}@${ver} || true`;
  }
  if (t === "opencode-plugin") {
    return `npm pack ${pkg}@${ver} --silent || true`;
  }
  if (t === "git") {
    return `git clone --depth 1 ${entry.repo} repo && ls repo`;
  }
  return null;
}

function verify(slug, opts) {
  const entry = findEntry(slug);
  if (!entry) {
    process.stderr.write(`no entry: ${slug}\n`);
    process.exit(1);
  }
  if (opts.dryRun) {
    const report = dryRunReport(slug, entry);
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    process.exit(0);
  }

  const t = entry.install?.type;
  // Skip types we don't sandbox.
  if (["manual", "brew", "cargo"].includes(t)) {
    const report = {
      slug,
      install_type: t,
      sandbox: "skipped",
      verification_method: "skipped",
      observed: null,
      exceeds_declared: false,
      violations: [],
      note: `install.type=${t} is not sandboxed by verify-capabilities`,
    };
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    process.exit(0);
  }

  const sandbox = pickSandbox();
  if (!sandbox) {
    process.stderr.write(`WARN: no firejail/bubblewrap on PATH — running strace-only (REDUCED ISOLATION)\n`);
  }

  const declared = entry.capabilities ?? {};
  const tmpHome = mkdtempSync(join(tmpdir(), `verify-cap-home-${slug}-`));
  const tmpCache = mkdtempSync(join(tmpdir(), `verify-cap-cache-${slug}-`));
  const straceLog = join(tmpCache, "strace.log");
  const payload = payloadFor(entry);
  if (!payload) {
    process.stderr.write(`no payload for install.type=${t}; aborting\n`);
    process.exit(1);
  }

  const allowedWriteRoots = [tmpHome, tmpCache, "/tmp/", "/dev/null", "/dev/urandom"];

  // Pass 1: no-net to detect whether the entry actually needs network.
  // We don't fail on no-net failure; we just record "would have failed".
  const [c1, a1] = buildSandboxCmd(sandbox ?? "none", "no-net", tmpHome, tmpCache, straceLog, payload);
  const r1 = spawnSync(c1, a1, { encoding: "utf8", timeout: 180_000 });
  const noNetFailed = r1.status !== 0;

  // Pass 2: with-net + strace, the authoritative observation pass.
  const straceLog2 = join(tmpCache, "strace.with-net.log");
  const [c2, a2] = buildSandboxCmd(sandbox ?? "none", "with-net", tmpHome, tmpCache, straceLog2, payload);
  const r2 = spawnSync(c2, a2, { encoding: "utf8", timeout: 300_000 });

  let straceText = "";
  try { straceText = readFileSync(straceLog2, "utf8"); }
  catch { straceText = ""; }

  const net = parseStraceNetwork(straceText);
  const proc = parseStraceProcess(straceText);
  const fsw = parseStraceWrite(straceText, allowedWriteRoots);

  const observed = {
    network: net.networkObserved || !noNetFailed === false,
    child_process: proc.childProcessObserved,
    filesystem_write: fsw.filesystemWriteObserved,
  };

  const violations = [];
  if (observed.network && declared.network === false) {
    violations.push(`observed network=true, declared network=false`);
  }
  if (observed.child_process && declared.child_process === false) {
    violations.push(`observed child_process=true, declared child_process=false`);
  }
  if (observed.filesystem_write && declared.filesystem_write === false) {
    violations.push(`observed filesystem_write=true, declared filesystem_write=false`);
  }

  const report = {
    slug,
    install_type: t,
    sandbox: sandbox ?? "none",
    verification_method: sandbox ? "sandbox-strace" : "strace-only",
    observed,
    domains_contacted: net.hosts,
    no_net_pass: !noNetFailed,
    sandbox_status: r2.status,
    exceeds_declared: violations.length > 0,
    violations,
  };

  // Best-effort cleanup; ignore errors.
  try { rmSync(tmpHome, { recursive: true, force: true }); } catch { /* noop */ }
  try { rmSync(tmpCache, { recursive: true, force: true }); } catch { /* noop */ }

  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  process.exit(violations.length > 0 ? 1 : 0);
}

const slug = process.argv[2];
if (!slug || slug === "--help" || slug === "-h") {
  process.stderr.write("usage: verify-capabilities.mjs <slug> [--dry-run]\n");
  process.exit(slug ? 0 : 2);
}
const opts = {
  dryRun: process.argv.includes("--dry-run"),
};
verify(slug, opts);
