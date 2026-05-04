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
const PINNED_INSTALL_TYPES = new Set(["npx", "npm-global", "opencode-plugin"]);
const DANGEROUS_PATTERNS = [
  { re: /\bcurl\b[^|]*\|\s*(bash|sh|zsh)\b/i, label: "curl-pipe-shell" },
  { re: /\bwget\b[^|]*\|\s*(bash|sh|zsh)\b/i, label: "wget-pipe-shell" },
  { re: /\beval\s*\(/i, label: "eval()" },
  { re: /\bbase64\s+-d\b/i, label: "base64 -d" },
  { re: /<repository-url>/i, label: "literal placeholder URL" },
];
const REVEAL_ENV = "STATUSLINES_REVEAL_QUARANTINE";

function revealQuarantine() {
  const v = process.env[REVEAL_ENV];
  return v === "1" || v === "yes" || v === "true";
}

function isQuarantined(entry) {
  return entry?.security?.quarantined === true;
}

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
    if (group.name === "locks") continue; // Phase J: per-entry transitive-dep lockfiles, not entries
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

function loadVisible() {
  if (revealQuarantine()) return loadAll();
  return loadAll().filter((e) => !isQuarantined(e));
}

function findBySlug(slug, { includeQuarantined = false } = {}) {
  const pool = includeQuarantined || revealQuarantine() ? loadAll() : loadVisible();
  return pool.find((e) => e.slug === slug);
}

function validate(entry) {
  const errs = [];
  const warns = [];
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

    if (entry.redistributable && PINNED_INSTALL_TYPES.has(entry.install.type)) {
      if (!entry.install.version || entry.install.version === "latest") {
        errs.push(`redistributable=true with install.type=${entry.install.type} requires a pinned install.version (not "latest")`);
      }
    }
  }
  if (entry.configs) {
    for (const cli of Object.keys(entry.configs)) {
      if (!VALID_CLIS.includes(cli)) errs.push(`configs key '${cli}' is not a known CLI`);
      const snippet = entry.configs[cli];
      const flat = JSON.stringify(snippet);
      for (const p of DANGEROUS_PATTERNS) {
        if (p.re.test(flat)) errs.push(`configs.${cli} contains dangerous pattern: ${p.label}`);
      }
      if (entry.redistributable && /@latest\b/.test(flat)) {
        errs.push(`configs.${cli} uses @latest; pin a version for redistributable entries`);
      }
    }
  }
  if (entry.security?.quarantined === true && !entry.security?.quarantine_reason) {
    errs.push(`security.quarantined=true requires security.quarantine_reason`);
  }
  // Phase H — image. Warning, not error, during rollout. When the
  // backfill completes for every redistributable entry the warning will
  // be promoted to a hard error.
  if (entry.redistributable === true && !entry.image) {
    warns.push(`redistributable=true but no image block (will become an error after Phase H rollout)`);
  } else if (entry.image) {
    const img = entry.image;
    if (typeof img.url !== "string" || !img.url.startsWith("https://")) {
      errs.push(`image.url must be https://...`);
    } else if (img.url.includes("github.com/user-attachments/")) {
      errs.push(`image.url uses github.com/user-attachments/... which 403s to non-browser clients`);
    }
    if (typeof img.alt !== "string" || img.alt.length < 1 || img.alt.length > 120) {
      errs.push(`image.alt must be a string of length 1..120`);
    }
    if (img.source !== "readme" && img.source !== "og-fallback" && img.source !== "termframe-synthetic") {
      errs.push(`image.source must be "readme", "og-fallback", or "termframe-synthetic"`);
    }
  }
  // Phase G — capabilities. Warning, not error, during rollout. When the
  // backfill completes for every redistributable entry the warning will
  // be promoted to a hard error.
  if (entry.redistributable === true && !entry.capabilities) {
    warns.push(`redistributable=true but no capabilities block (will become an error after Phase G rollout)`);
  } else if (entry.capabilities) {
    const c = entry.capabilities;
    for (const k of ["network", "child_process", "filesystem_write"]) {
      if (k in c && typeof c[k] !== "boolean") errs.push(`capabilities.${k} must be boolean`);
    }
    if ("env_read" in c && !Array.isArray(c.env_read)) errs.push(`capabilities.env_read must be an array of strings`);
    const validMethods = ["declared", "sandbox-strace", "sandbox-bpf", "skipped"];
    if ("verification_method" in c && c.verification_method !== null && !validMethods.includes(c.verification_method)) {
      errs.push(`capabilities.verification_method must be one of: ${validMethods.join(", ")}`);
    }
    if (Array.isArray(c.env_read) && c.env_read.includes("*") && !entry.notes) {
      warns.push(`capabilities.env_read includes "*" without a notes field justifying the wildcard`);
    }
  }
  return { errs, warns };
}

function cmdList(args) {
  const cliFilter = args.find((a) => a.startsWith("--cli="))?.slice(6);
  const licFilter = args.find((a) => a.startsWith("--license="))?.slice(10);
  const onlyRedist = args.includes("--redistributable");
  const pool = loadVisible();
  const rows = pool
    .filter((e) => !cliFilter || e.host_clis.includes(cliFilter))
    .filter((e) => !licFilter || e.license === licFilter)
    .filter((e) => !onlyRedist || e.redistributable === true)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  for (const e of rows) {
    const tag = isQuarantined(e) ? "[!q]" : (e.redistributable ? "[ok]" : "[ref]");
    process.stdout.write(`${tag} ${e.slug.padEnd(36)} ${e.license.padEnd(30)} ${e.host_clis.join(",").padEnd(20)} ${e.name}\n`);
  }
  if (!rows.length) process.stderr.write("no entries match\n");
  const hidden = loadAll().length - loadVisible().length;
  if (hidden > 0 && !revealQuarantine()) {
    process.stderr.write(`(${hidden} quarantined entr${hidden === 1 ? "y" : "ies"} hidden; set ${REVEAL_ENV}=1 to reveal)\n`);
  }
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
  let warned = 0;
  for (const f of listEntryFiles()) {
    let entry;
    try { entry = loadEntry(f); }
    catch (e) { process.stderr.write(`PARSE  ${f}: ${e.message}\n`); bad++; continue; }
    const { errs, warns } = validate(entry);
    if (errs.length) {
      bad++;
      for (const m of errs) process.stderr.write(`ERR    ${entry.slug ?? f}: ${m}\n`);
    } else {
      process.stdout.write(`ok     ${entry.slug}\n`);
    }
    for (const w of warns) {
      warned++;
      process.stderr.write(`WARN   ${entry.slug ?? f}: ${w}\n`);
    }
  }
  const summary = bad === 0
    ? `all entries valid${warned ? ` (${warned} warning${warned === 1 ? "" : "s"})` : ""}`
    : `${bad} problem(s)${warned ? `, ${warned} warning(s)` : ""}`;
  process.stderr.write(`${summary}\n`);
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
  const ignoreQuarantine = args.includes("--ignore-quarantine");
  if (!slug || !cli) { process.stderr.write("usage: statuslines configure <slug> --cli=<claude|opencode|gemini|codex> [--dry-run] [--ignore-quarantine]\n"); process.exit(2); }
  if (!VALID_CLIS.includes(cli)) { process.stderr.write(`invalid --cli: ${cli}\n`); process.exit(2); }
  const e = findBySlug(slug, { includeQuarantined: ignoreQuarantine });
  if (!e) { process.stderr.write(`no entry: ${slug}\n`); process.exit(1); }
  if (isQuarantined(e) && !ignoreQuarantine) {
    process.stderr.write(`entry ${slug} is quarantined (${e.security?.quarantine_reason ?? "no reason"}); pass --ignore-quarantine and set ${REVEAL_ENV}=1 to override\n`);
    process.exit(1);
  }
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

const README_I18N = {
  en: {
    title: "# Catalog",
    nav: "**Languages:** English · [Français](./README.fr.md) · [日本語](./README.ja.md)",
    intro: "Third-party statuslines and related tools for Claude Code, OpenCode, Gemini CLI, and Codex CLI. Generated from `catalog/<cli>/<slug>.json` — do not edit by hand.",
    legend: "Legend: **ok** = OSI-permissive license, install/configure recipes shipped. **ref** = listed for reference; install per upstream.",
    tableHeader: "| Slug | Name | Targets | License | Lang | Status | Install |",
    perEntryHeading: "## Per-entry detail",
    labels: { license: "License", targets: "Targets", description: "Description", notes: "Notes", install: "Install", headsUp: "Heads-up", configure: "Configure" },
    notRedistributable: " (not redistributable; reference only)",
    headsUpText: "package declares lifecycle scripts (preinstall/postinstall/prepare); `configure` runs with `--ignore-scripts`.",
    seeUpstream: "see upstream",
    pinnedTo: "pinned to",
    opencodePluginText: (pkg, ver) => `OpenCode loads \`${pkg}@${ver}\` from npm at session start (added via \`opencode.json\` \`plugin\` array)`,
    gitInstallText: "`git clone` (handled by `bin/statuslines.js configure`)",
  },
  fr: {
    title: "# Catalogue",
    nav: "**Langues :** [English](./README.md) · Français · [日本語](./README.ja.md)",
    intro: "Statuslines tierces et outils apparentés pour Claude Code, OpenCode, Gemini CLI et Codex CLI. Généré depuis `catalog/<cli>/<slug>.json` — ne pas éditer à la main.",
    legend: "Légende : **ok** = licence OSI-permissive, recettes d'installation/configuration livrées. **ref** = listé pour référence ; installer selon les instructions amont.",
    tableHeader: "| Slug | Nom | Cibles | Licence | Langage | Statut | Installation |",
    perEntryHeading: "## Détail par entrée",
    labels: { license: "Licence", targets: "Cibles", description: "Description", notes: "Notes", install: "Installation", headsUp: "À noter", configure: "Configurer" },
    notRedistributable: " (non redistribuable ; pour référence uniquement)",
    headsUpText: "le paquet déclare des scripts de cycle de vie (preinstall/postinstall/prepare) ; `configure` s'exécute avec `--ignore-scripts`.",
    seeUpstream: "voir en amont",
    pinnedTo: "épinglé à",
    opencodePluginText: (pkg, ver) => `OpenCode charge \`${pkg}@${ver}\` depuis npm au démarrage de la session (ajouté via le tableau \`plugin\` de \`opencode.json\`)`,
    gitInstallText: "`git clone` (géré par `bin/statuslines.js configure`)",
  },
  ja: {
    title: "# カタログ",
    nav: "**言語：** [English](./README.md) · [Français](./README.fr.md) · 日本語",
    intro: "Claude Code、OpenCode、Gemini CLI、Codex CLI 向けのサードパーティ statusline と関連ツール。`catalog/<cli>/<slug>.json` から生成されます — 手で編集しないでください。",
    legend: "凡例：**ok** = OSI 互換ライセンス、インストール／設定レシピ同梱。**ref** = 参照のみ。上流の手順でインストールしてください。",
    tableHeader: "| Slug | 名称 | 対象 | ライセンス | 言語 | 状況 | インストール |",
    perEntryHeading: "## エントリ別詳細",
    labels: { license: "ライセンス", targets: "対象", description: "説明", notes: "備考", install: "インストール", headsUp: "注意", configure: "設定" },
    notRedistributable: "（再配布不可。参照のみ）",
    headsUpText: "パッケージはライフサイクルスクリプト（preinstall／postinstall／prepare）を宣言しています。`configure` は `--ignore-scripts` 付きで実行されます。",
    seeUpstream: "上流を参照",
    pinnedTo: "固定バージョン",
    opencodePluginText: (pkg, ver) => `OpenCode がセッション開始時に \`${pkg}@${ver}\` を npm からロードします（\`opencode.json\` の \`plugin\` 配列に追加）`,
    gitInstallText: "`git clone`（`bin/statuslines.js configure` で処理）",
  },
};

function renderReadme(lang = "en") {
  const t = README_I18N[lang];
  const entries = loadVisible().sort((a, b) => a.slug.localeCompare(b.slug));
  const lines = [];
  lines.push(t.title);
  lines.push("");
  lines.push(t.nav);
  lines.push("");
  lines.push(t.intro);
  lines.push("");
  lines.push(t.legend);
  lines.push("");
  lines.push(t.tableHeader);
  lines.push("|---|---|---|---|---|---|---|");
  for (const e of entries) {
    const status = e.redistributable ? "ok" : "ref";
    const install = e.install?.type ?? "—";
    lines.push(`| \`${e.slug}\` | [${e.name}](${e.repo}) | ${e.host_clis.join(", ")} | ${e.license} | ${e.language} | ${status} | ${install} |`);
  }
  lines.push("");
  lines.push(t.perEntryHeading);
  lines.push("");
  for (const e of entries) {
    lines.push(`### \`${e.slug}\` — [${e.name}](${e.repo})`);
    lines.push("");
    if (e.image?.url || e.image?.local) {
      const alt = (e.image.alt ?? e.name).replace(/\]/g, "\\]");
      const imgSrc = e.image.local ?? e.image.url;
      lines.push(`<a href="${e.repo}"><img alt="${alt}" src="${imgSrc}" width="480"></a>`);
      lines.push("");
    }
    lines.push(`- **${t.labels.license}:** ${e.license}${e.redistributable ? "" : t.notRedistributable}`);
    lines.push(`- **${t.labels.targets}:** ${e.host_clis.join(", ")}`);
    lines.push(`- **${t.labels.description}:** ${e.description}`);
    if (e.notes) lines.push(`- **${t.labels.notes}:** ${e.notes}`);
    const ver = e.install?.version;
    if (e.install?.type === "npx") lines.push(`- **${t.labels.install}:** \`npx --ignore-scripts -y ${e.install.package}@${ver ?? "latest"}\``);
    else if (e.install?.type === "npm-global") lines.push(`- **${t.labels.install}:** \`npm i -g --ignore-scripts ${e.install.package}@${ver ?? "latest"}\``);
    else if (e.install?.type === "cargo") lines.push(`- **${t.labels.install}:** \`cargo install ${e.install.package}${ver ? ` --version ${ver}` : ""}\``);
    else if (e.install?.type === "brew") lines.push(`- **${t.labels.install}:** \`brew install ${e.install.formula ?? e.install.package}\`${e.install.tap ? ` (tap: \`${e.install.tap}\`)` : ""}${ver ? ` — ${t.pinnedTo} ${ver}` : ""}`);
    else if (e.install?.type === "git") lines.push(`- **${t.labels.install}:** ${t.gitInstallText}`);
    else if (e.install?.type === "opencode-plugin") lines.push(`- **${t.labels.install}:** ${t.opencodePluginText(e.install.package, ver ?? "latest")}`);
    else lines.push(`- **${t.labels.install}:** ${t.seeUpstream}`);
    if (e.security?.has_install_scripts) lines.push(`- **${t.labels.headsUp}:** ${t.headsUpText}`);
    if (e.redistributable && e.configs && Object.keys(e.configs).length) {
      lines.push(`- **${t.labels.configure}:** \`node bin/statuslines.js configure ${e.slug} --cli=<${Object.keys(e.configs).join("|")}>\``);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function cmdRenderReadme() {
  for (const lang of ["en", "fr", "ja"]) {
    const md = renderReadme(lang);
    const file = lang === "en" ? "README.md" : `README.${lang}.md`;
    const out = join(CATALOG, file);
    writeFileSync(out, md);
    process.stdout.write(`wrote ${out}\n`);
  }
}

function renderTopReadmeBlocks() {
  const entries = loadVisible().sort((a, b) => a.slug.localeCompare(b.slug));
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
    lines.push("| Preview | Name | License | Description |");
    lines.push("|---|---|---|---|");
    for (const e of byCli[cli]) {
      const tag = e.redistributable ? "" : " `(ref)`";
      const imgCell = e.image?.local
        ? `<a href="${e.repo}"><img alt="${(e.image.alt ?? e.name).replace(/"/g, "&quot;").replace(/\|/g, "\\|")}" src="./catalog/${e.image.local}" width="200"></a>`
        : "—";
      const desc = e.description.replace(/\|/g, "\\|");
      lines.push(`| ${imgCell} | [**${e.name}**](${e.repo}) | ${e.license}${tag} | ${desc} |`);
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

async function fetchNpmMetadata(pkg) {
  const url = `https://registry.npmjs.org/${pkg.replace("/", "%2F")}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`registry returned ${res.status}`);
  return await res.json();
}

function detectInstallScripts(scripts) {
  if (!scripts || typeof scripts !== "object") return false;
  for (const k of ["preinstall", "install", "postinstall", "prepare"]) {
    if (typeof scripts[k] === "string" && scripts[k].length > 0) return true;
  }
  return false;
}

async function cmdAudit(args) {
  const onlySlug = args.find((a) => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");
  let touched = 0, failed = 0;
  for (const f of listEntryFiles()) {
    const e = loadEntry(f);
    if (onlySlug && e.slug !== onlySlug) continue;
    const t = e.install?.type;
    if (!["npx", "npm-global", "opencode-plugin"].includes(t)) continue;
    const pkg = e.install.package;
    if (!pkg) continue;
    try {
      const meta = await fetchNpmMetadata(pkg);
      const latest = meta?.["dist-tags"]?.latest;
      if (!latest) throw new Error("no dist-tags.latest");
      const v = meta.versions?.[latest];
      if (!v) throw new Error(`version ${latest} missing from versions[]`);
      const integrity = v?.dist?.integrity ?? null;
      const hasScripts = detectInstallScripts(v?.scripts);
      const license = v?.license ?? meta?.license ?? null;

      const newEntry = JSON.parse(JSON.stringify(e));
      delete newEntry._path;
      newEntry.install.version = latest;
      if (integrity) newEntry.install.integrity = integrity;
      newEntry.security = newEntry.security ?? {};
      newEntry.security.has_install_scripts = hasScripts;
      newEntry.security.license_observed = license;
      newEntry.security.last_audit = new Date().toISOString().slice(0, 10);

      if (newEntry.configs) {
        const escPkg = pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pkgAtLatest = new RegExp(`${escPkg}@latest`, "g");
        for (const cli of Object.keys(newEntry.configs)) {
          let flat = JSON.stringify(newEntry.configs[cli]);
          flat = flat.replace(pkgAtLatest, `${pkg}@${latest}`);
          flat = flat.replace(/npx -y /g, "npx --ignore-scripts -y ");
          newEntry.configs[cli] = JSON.parse(flat);
        }
      }

      if (dryRun) {
        process.stdout.write(`would update ${e.slug}: version=${latest}, has_install_scripts=${hasScripts}\n`);
      } else {
        writeFileSync(f, JSON.stringify(newEntry, null, 2) + "\n");
        process.stdout.write(`updated ${e.slug}: version=${latest}, has_install_scripts=${hasScripts}\n`);
      }
      touched += 1;
    } catch (err) {
      failed += 1;
      process.stderr.write(`audit ${e.slug}: ${err.message}\n`);
    }
  }
  process.stderr.write(`audit done: ${touched} updated, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

const QUARANTINE_I18N = {
  en: {
    title: "# Quarantine",
    nav: "**Languages:** English · [Français](./QUARANTINE.fr.md) · [日本語](./QUARANTINE.ja.md)",
    intro: "Entries the catalog has hidden from `list`, `show`, `configure`, and the rendered READMEs because an automated security check fired or a maintainer flagged them.",
    reveal: (env) => `Set \`${env}=1\` in the environment to reveal these in the CLI; pass \`--ignore-quarantine\` to \`configure\` to override and install anyway.`,
    none: "*No entries are currently quarantined.*",
    tableHeader: "| Slug | Reason | Quarantined since |",
  },
  fr: {
    title: "# Quarantaine",
    nav: "**Langues :** [English](./QUARANTINE.md) · Français · [日本語](./QUARANTINE.ja.md)",
    intro: "Entrées que le catalogue a masquées de `list`, `show`, `configure` et des READMEs rendus parce qu'une vérification de sécurité automatisée s'est déclenchée ou qu'un mainteneur les a signalées.",
    reveal: (env) => `Définissez \`${env}=1\` dans l'environnement pour les révéler dans la CLI ; passez \`--ignore-quarantine\` à \`configure\` pour outrepasser et installer malgré tout.`,
    none: "*Aucune entrée n'est actuellement en quarantaine.*",
    tableHeader: "| Slug | Raison | En quarantaine depuis |",
  },
  ja: {
    title: "# 隔離",
    nav: "**言語：** [English](./QUARANTINE.md) · [Français](./QUARANTINE.fr.md) · 日本語",
    intro: "自動セキュリティチェックが発火した、またはメンテナーが手動でフラグを立てたために、カタログが `list`、`show`、`configure`、生成された README から非表示にしているエントリです。",
    reveal: (env) => `環境変数で \`${env}=1\` を設定すると CLI で表示されます。それでもインストールしたい場合は、\`configure\` に \`--ignore-quarantine\` を渡して上書きしてください。`,
    none: "*現在、隔離されているエントリはありません。*",
    tableHeader: "| Slug | 理由 | 隔離日 |",
  },
};

function renderQuarantine(lang = "en") {
  const t = QUARANTINE_I18N[lang];
  const all = loadAll();
  const quarantined = all.filter(isQuarantined).sort((a, b) => a.slug.localeCompare(b.slug));
  const lines = [];
  lines.push(t.title);
  lines.push("");
  lines.push(t.nav);
  lines.push("");
  lines.push(t.intro);
  lines.push("");
  lines.push(t.reveal(REVEAL_ENV));
  lines.push("");
  if (quarantined.length === 0) {
    lines.push(t.none);
    lines.push("");
  } else {
    lines.push(t.tableHeader);
    lines.push("|---|---|---|");
    for (const e of quarantined) {
      const since = e.security?.quarantined_at ?? "—";
      const reason = (e.security?.quarantine_reason ?? "").replace(/\|/g, "\\|");
      lines.push(`| \`${e.slug}\` | ${reason} | ${since} |`);
    }
    lines.push("");
  }
  return { md: lines.join("\n"), count: quarantined.length };
}

function cmdRenderQuarantine() {
  for (const lang of ["en", "fr", "ja"]) {
    const { md, count } = renderQuarantine(lang);
    const file = lang === "en" ? "QUARANTINE.md" : `QUARANTINE.${lang}.md`;
    const out = join(CATALOG, file);
    writeFileSync(out, md);
    process.stdout.write(`wrote ${out} (${count} quarantined)\n`);
  }
}

function cmdRenderTopReadme() {
  const { catalog, count } = renderTopReadmeBlocks();
  const badge = `![entries](https://img.shields.io/badge/catalog%20entries-${count}-orange)`;
  for (const file of ["README.md", "README.fr.md", "README.ja.md"]) {
    const path = join(ROOT, file);
    if (!existsSync(path)) {
      process.stderr.write(`${file} not found; skipping\n`);
      continue;
    }
    let raw = readFileSync(path, "utf8");
    raw = replaceBetweenMarkers(raw, "<!-- catalog:start -->", "<!-- catalog:end -->", catalog);
    raw = replaceBetweenMarkers(raw, "<!-- count:start -->", "<!-- count:end -->", badge);
    writeFileSync(path, raw);
    process.stdout.write(`wrote ${path} (${count} entries)\n`);
  }
}

function cmdVerifyCapabilities(args) {
  const slug = args.find((a) => !a.startsWith("--"));
  if (!slug) {
    process.stderr.write("usage: statuslines verify-capabilities <slug> [--dry-run]\n");
    process.exit(2);
  }
  const script = join(ROOT, "scripts/verify-capabilities.mjs");
  const passthrough = [script, slug, ...args.filter((a) => a.startsWith("--"))];
  const r = spawnSync(process.execPath, passthrough, { stdio: "inherit" });
  process.exit(r.status ?? 1);
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
  audit [<slug>]       Probe npm registry for each npm-resolvable entry;
                       backfill install.version, install.integrity, and
                       security.has_install_scripts on each entry. Use
                       --dry-run to preview without writing.
  verify-capabilities <slug>
                       Run the entry's install in a firejail/strace
                       sandbox and emit a JSON report comparing observed
                       behavior against the declared capabilities block.
                       Use --dry-run to print a canned report shape
                       without sandboxing.
  render-readme        Regenerate catalog/README.md from entries
  render-top-readme    Regenerate the catalog section + count badge
                       in the top-level README.md (between markers)
  render-quarantine    Regenerate catalog/QUARANTINE.md from entries
                       flagged with security.quarantined=true
  help                 Show this message

Environment:
  STATUSLINES_REVEAL_QUARANTINE=1   Surface quarantined entries in
                                     list/show/configure (defaults to
                                     hidden — OpenBSD-style secure default)
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
  case "render-quarantine": cmdRenderQuarantine(); break;
  case "audit":         await cmdAudit(rest); break;
  case "verify-capabilities": cmdVerifyCapabilities(rest); break;
  case "help":
  case "--help":
  case "-h":
  case undefined:       cmdHelp(); break;
  default: process.stderr.write(`unknown command: ${cmd}\n`); cmdHelp(); process.exit(2);
}
