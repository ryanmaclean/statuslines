#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "catalog");
const VALID_CLIS = ["claude", "opencode", "gemini", "codex"];
const PERMISSIVE = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "MPL-2.0", "0BSD"]);
const REQUIRED = ["slug", "name", "repo", "license", "redistributable", "host_clis", "language", "description", "install"];

const SETTINGS_PATHS = {
  claude:   join(homedir(), ".claude/settings.json"),
  opencode: join(homedir(), ".config/opencode/opencode.json"),
  gemini:   join(homedir(), ".gemini/settings.json"),
  codex:    join(homedir(), ".codex/config.toml"),
};

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

function loadEntry(path) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  data._path = path;
  return data;
}

function loadAll() {
  return listEntryFiles().map(loadEntry);
}

function findBySlug(slug) {
  return loadAll().find((e) => e.slug === slug);
}

function validate(entry) {
  const errs = [];
  for (const k of REQUIRED) if (!(k in entry)) errs.push(`missing field: ${k}`);
  if (entry.host_clis) {
    for (const c of entry.host_clis) {
      if (!VALID_CLIS.includes(c)) errs.push(`invalid host_cli: ${c}`);
    }
  }
  if (entry.redistributable && !PERMISSIVE.has(entry.license)) {
    errs.push(`redistributable=true but license '${entry.license}' is not in the permissive allowlist`);
  }
  if (entry.install) {
    const ok = ["npx", "npm-global", "cargo", "brew", "git", "manual", "opencode-plugin"];
    if (!ok.includes(entry.install.type)) errs.push(`invalid install.type: ${entry.install.type}`);
    if (entry.install.type === "git" && !entry.install.clone_dir) errs.push("install.type=git requires clone_dir");
    if (["npx","npm-global","opencode-plugin"].includes(entry.install.type) && !entry.install.package) errs.push("install.type=npx/npm-global/opencode-plugin requires package");
  }
  if (entry.configs) {
    for (const cli of Object.keys(entry.configs)) {
      if (!VALID_CLIS.includes(cli)) errs.push(`configs key '${cli}' is not a known CLI`);
    }
  }
  return errs;
}

function cmdList(args) {
  const cliFilter = args.find((a) => a.startsWith("--cli="))?.slice(6);
  const licFilter = args.find((a) => a.startsWith("--license="))?.slice(10);
  const onlyRedist = args.includes("--redistributable");
  const all = loadAll();
  const rows = all
    .filter((e) => !cliFilter || e.host_clis.includes(cliFilter))
    .filter((e) => !licFilter || e.license === licFilter)
    .filter((e) => !onlyRedist || e.redistributable === true)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  for (const e of rows) {
    const tag = e.redistributable ? "[ok]" : "[ref]";
    process.stdout.write(`${tag} ${e.slug.padEnd(36)} ${e.license.padEnd(30)} ${e.host_clis.join(",").padEnd(20)} ${e.name}\n`);
  }
  if (!rows.length) process.stderr.write("no entries match\n");
}

function cmdShow(args) {
  const slug = args[0];
  if (!slug) { process.stderr.write("usage: statuslines show <slug>\n"); process.exit(2); }
  const e = findBySlug(slug);
  if (!e) { process.stderr.write(`no entry: ${slug}\n`); process.exit(1); }
  const { _path, ...rest } = e;
  process.stdout.write(JSON.stringify(rest, null, 2) + "\n");
}

function cmdDoctor() {
  let bad = 0;
  for (const f of listEntryFiles()) {
    let entry;
    try { entry = loadEntry(f); }
    catch (e) { process.stderr.write(`PARSE  ${f}: ${e.message}\n`); bad++; continue; }
    const errs = validate(entry);
    if (errs.length) { bad++; for (const m of errs) process.stderr.write(`ERR    ${entry.slug ?? f}: ${m}\n`); }
    else process.stdout.write(`ok     ${entry.slug}\n`);
  }
  process.stderr.write(`${bad === 0 ? "all entries valid" : `${bad} problem(s)`}\n`);
  process.exit(bad === 0 ? 0 : 1);
}

function ensureCommand(name) {
  const r = spawnSync(name, ["--version"], { stdio: "ignore" });
  if (r.error || (r.status !== 0 && r.status !== 1)) {
    process.stderr.write(`required command not found: ${name}\n`);
    process.exit(127);
  }
}

function cloneRepo(repo, dest) {
  if (existsSync(dest)) {
    process.stdout.write(`already cloned at ${dest} — pulling\n`);
    const r = spawnSync("git", ["-C", dest, "pull", "--ff-only"], { stdio: "inherit" });
    if (r.status !== 0) process.exit(r.status ?? 1);
  } else {
    mkdirSync(dirname(dest), { recursive: true });
    const r = spawnSync("git", ["clone", "--depth", "1", repo, dest], { stdio: "inherit" });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
}

function expandInstallDir(snippet, installDir) {
  return JSON.parse(JSON.stringify(snippet).replaceAll("${INSTALL_DIR}", installDir));
}

function mergeInto(targetPath, patch) {
  ensureCommand("jq");
  mkdirSync(dirname(targetPath), { recursive: true });
  const tmpPatch = `${targetPath}.patch.tmp`;
  writeFileSync(tmpPatch, JSON.stringify(patch));
  let cmd, args;
  if (existsSync(targetPath)) {
    cmd = "jq"; args = ["-s", ".[0] * .[1]", targetPath, tmpPatch];
  } else {
    cmd = "jq"; args = [".", tmpPatch];
  }
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) { process.stderr.write(r.stderr); process.exit(r.status ?? 1); }
  writeFileSync(targetPath, r.stdout);
  spawnSync("rm", ["-f", tmpPatch]);
}

function cmdConfigure(args) {
  const slug = args[0];
  const cli = args.find((a) => a.startsWith("--cli="))?.slice(6);
  const dryRun = args.includes("--dry-run");
  if (!slug || !cli) { process.stderr.write("usage: statuslines configure <slug> --cli=<claude|opencode|gemini|codex> [--dry-run]\n"); process.exit(2); }
  if (!VALID_CLIS.includes(cli)) { process.stderr.write(`invalid --cli: ${cli}\n`); process.exit(2); }
  const e = findBySlug(slug);
  if (!e) { process.stderr.write(`no entry: ${slug}\n`); process.exit(1); }
  if (!e.redistributable) {
    process.stderr.write(`entry ${slug} is not redistributable (license: ${e.license}); install manually per upstream\n`);
    process.exit(1);
  }
  const snippet = e.configs?.[cli];
  if (!snippet) {
    process.stderr.write(`entry ${slug} has no configs.${cli} — manual setup required (see ${e.repo})\n`);
    process.exit(1);
  }

  let installDir = null;
  if (e.install.type === "git") {
    installDir = join(homedir(), ".local/share/statuslines", e.install.clone_dir);
    if (dryRun) process.stdout.write(`would clone ${e.repo} -> ${installDir}\n`);
    else cloneRepo(e.repo, installDir);
  } else if (e.install.type === "npm-global") {
    if (dryRun) process.stdout.write(`would run: npm i -g ${e.install.package}\n`);
    else { const r = spawnSync("npm", ["i", "-g", e.install.package], { stdio: "inherit" }); if (r.status !== 0) process.exit(r.status ?? 1); }
  } else if (e.install.type === "cargo") {
    if (dryRun) process.stdout.write(`would run: cargo install ${e.install.package}\n`);
    else { const r = spawnSync("cargo", ["install", e.install.package], { stdio: "inherit" }); if (r.status !== 0) process.exit(r.status ?? 1); }
  } else if (e.install.type === "brew") {
    const target = e.install.tap
      ? `${e.install.tap}/${e.install.formula ?? e.install.package}`
      : (e.install.formula ?? e.install.package);
    if (dryRun) process.stdout.write(`would run: brew install ${target}\n`);
    else { const r = spawnSync("brew", ["install", target], { stdio: "inherit" }); if (r.status !== 0) process.exit(r.status ?? 1); }
  } else if (e.install.type === "npx") {
    /* nothing to install — npx invokes at run time */
  } else if (e.install.type === "opencode-plugin") {
    /* nothing to install — OpenCode loads from npm at session start */
  }

  const expanded = installDir ? expandInstallDir(snippet, installDir) : snippet;
  const target = SETTINGS_PATHS[cli];

  if (cli === "codex") {
    process.stdout.write(`note: Codex uses TOML at ${target}; emit the snippet for manual placement:\n`);
    process.stdout.write(JSON.stringify(expanded, null, 2) + "\n");
    return;
  }

  if (dryRun) {
    process.stdout.write(`would merge into ${target}:\n${JSON.stringify(expanded, null, 2)}\n`);
    return;
  }
  mergeInto(target, expanded);
  process.stdout.write(`configured ${slug} into ${target}\n`);
}

function renderReadme() {
  const entries = loadAll().sort((a, b) => a.slug.localeCompare(b.slug));
  const lines = [];
  lines.push("# Catalog");
  lines.push("");
  lines.push("Third-party statuslines and related tools for Claude Code, OpenCode, Gemini CLI, and Codex CLI. Generated from `catalog/<cli>/<slug>.json` — do not edit by hand.");
  lines.push("");
  lines.push("Legend: **ok** = OSI-permissive license, install/configure recipes shipped. **ref** = listed for reference; install per upstream.");
  lines.push("");
  lines.push("| Slug | Name | Targets | License | Lang | Status | Install |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const e of entries) {
    const status = e.redistributable ? "ok" : "ref";
    const install = e.install?.type ?? "—";
    lines.push(`| \`${e.slug}\` | [${e.name}](${e.repo}) | ${e.host_clis.join(", ")} | ${e.license} | ${e.language} | ${status} | ${install} |`);
  }
  lines.push("");
  lines.push("## Per-entry detail");
  lines.push("");
  for (const e of entries) {
    lines.push(`### \`${e.slug}\` — [${e.name}](${e.repo})`);
    lines.push("");
    lines.push(`- **License:** ${e.license}${e.redistributable ? "" : " (not redistributable; reference only)"}`);
    lines.push(`- **Targets:** ${e.host_clis.join(", ")}`);
    lines.push(`- **Description:** ${e.description}`);
    if (e.notes) lines.push(`- **Notes:** ${e.notes}`);
    if (e.install?.type === "npx") lines.push(`- **Install:** \`npx -y ${e.install.package}@latest\``);
    else if (e.install?.type === "npm-global") lines.push(`- **Install:** \`npm i -g ${e.install.package}\``);
    else if (e.install?.type === "cargo") lines.push(`- **Install:** \`cargo install ${e.install.package}\``);
    else if (e.install?.type === "brew") lines.push(`- **Install:** \`brew install ${e.install.formula ?? e.install.package}\`${e.install.tap ? ` (tap: \`${e.install.tap}\`)` : ""}`);
    else if (e.install?.type === "git") lines.push(`- **Install:** \`git clone\` (handled by \`bin/statuslines.js configure\`)`);
    else if (e.install?.type === "opencode-plugin") lines.push(`- **Install:** OpenCode loads \`${e.install.package}\` from npm at session start (added via \`opencode.json\` \`plugin\` array)`);
    else lines.push(`- **Install:** see upstream`);
    if (e.redistributable && e.configs && Object.keys(e.configs).length) {
      lines.push(`- **Configure:** \`node bin/statuslines.js configure ${e.slug} --cli=<${Object.keys(e.configs).join("|")}>\``);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function cmdRenderReadme() {
  const md = renderReadme();
  const out = join(CATALOG, "README.md");
  writeFileSync(out, md);
  process.stdout.write(`wrote ${out}\n`);
}

function renderTopReadmeBlocks() {
  const entries = loadAll().sort((a, b) => a.slug.localeCompare(b.slug));
  const byCli = { claude: [], opencode: [], gemini: [], codex: [] };
  for (const e of entries) {
    for (const cli of e.host_clis) {
      if (byCli[cli]) byCli[cli].push(e);
    }
  }
  const cliLabels = { claude: "Claude Code", opencode: "OpenCode", gemini: "Gemini CLI", codex: "Codex CLI" };
  const lines = [];
  for (const cli of ["claude", "opencode", "gemini", "codex"]) {
    lines.push(`### ${cliLabels[cli]}`);
    lines.push("");
    if (byCli[cli].length === 0) {
      lines.push(`*No catalog entries for ${cliLabels[cli]} yet.*`);
      lines.push("");
      continue;
    }
    for (const e of byCli[cli]) {
      const tag = e.redistributable ? "" : " `(ref)`";
      lines.push(`- [**${e.name}**](${e.repo}) — ${e.license}${tag} — ${e.description}`);
    }
    lines.push("");
  }
  return { catalog: lines.join("\n").trimEnd() + "\n", count: entries.length };
}

function replaceBetweenMarkers(raw, start, end, replacement) {
  const re = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (!re.test(raw)) {
    process.stderr.write(`README.md is missing markers ${start} ... ${end}\n`);
    process.exit(1);
  }
  return raw.replace(re, `${start}\n${replacement}\n${end}`);
}

function cmdRenderTopReadme() {
  const readmePath = join(ROOT, "README.md");
  if (!existsSync(readmePath)) { process.stderr.write(`README.md not found at ${readmePath}\n`); process.exit(1); }
  let raw = readFileSync(readmePath, "utf8");
  const { catalog, count } = renderTopReadmeBlocks();
  raw = replaceBetweenMarkers(raw, "<!-- catalog:start -->", "<!-- catalog:end -->", catalog);
  const badge = `![entries](https://img.shields.io/badge/catalog%20entries-${count}-orange)`;
  raw = replaceBetweenMarkers(raw, "<!-- count:start -->", "<!-- count:end -->", badge);
  writeFileSync(readmePath, raw);
  process.stdout.write(`wrote ${readmePath} (${count} entries)\n`);
}

function cmdHelp() {
  process.stdout.write(`Usage: statuslines <command> [options]

Commands:
  list                 List catalog entries
                       --cli=<claude|opencode|gemini|codex>
                       --license=<SPDX>
                       --redistributable
  show <slug>          Print full entry JSON
  configure <slug>     Install (if needed) and merge config snippet
                       --cli=<claude|opencode|gemini|codex>
                       --dry-run
  doctor               Validate every catalog entry
  render-readme        Regenerate catalog/README.md from entries
  render-top-readme    Regenerate the catalog section + count badge
                       in the top-level README.md (between markers)
  help                 Show this message
`);
}

const cmd = process.argv[2];
const rest = process.argv.slice(3);
switch (cmd) {
  case "list":          cmdList(rest); break;
  case "show":          cmdShow(rest); break;
  case "configure":     cmdConfigure(rest); break;
  case "doctor":        cmdDoctor(); break;
  case "render-readme": cmdRenderReadme(); break;
  case "render-top-readme": cmdRenderTopReadme(); break;
  case "help":
  case "--help":
  case "-h":
  case undefined:       cmdHelp(); break;
  default: process.stderr.write(`unknown command: ${cmd}\n`); cmdHelp(); process.exit(2);
}
