/**
 * Test suite for bin/statuslines.js
 * Run with: node --test tests/statuslines.test.js
 *
 * Strategy: we import the exported pure functions directly and supply
 * synthetic in-memory data. For functions that read from disk via
 * loadVisible/loadAll, we write JSON into a temp catalog dir and point
 * STATUSLINES_CATALOG at it. Each describe block gets its own temp dir
 * to avoid inter-suite races (node:test runs suites concurrently).
 *
 * ES module cache-busting: we append a unique query-string to each
 * dynamic import so the module re-executes and picks up the updated
 * STATUSLINES_CATALOG env var.
 */

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Minimal valid entry — all required fields, no extras. */
function minimalEntry(overrides = {}) {
  return {
    slug: "test-slug",
    name: "Test Entry",
    repo: "https://github.com/example/test",
    license: "MIT",
    redistributable: false,
    host_clis: ["claude"],
    language: "javascript",
    description: "A test entry.",
    install: { type: "git", clone_dir: "test-entry" },
    ...overrides,
  };
}

/** Full redistributable entry with image + capabilities + i18n descriptions. */
function fullEntry(overrides = {}) {
  return minimalEntry({
    redistributable: true,
    install: { type: "npx", package: "test-pkg", version: "1.2.3" },
    image: {
      url: "https://example.com/preview.png",
      alt: "test preview",
      source: "readme",
      local: "images/test.png",
    },
    capabilities: {
      network: false,
      child_process: false,
      filesystem_write: false,
      env_read: ["HOME"],
      verification_method: "declared",
    },
    description_fr: "Description en français.",
    description_ja: "日本語の説明。",
    ...overrides,
  });
}

/**
 * Write a set of catalog entries into a freshly-created temp directory.
 * Returns the path to the temp catalog root so each suite can use its own.
 */
function makeTempCatalog(entries, tempRoot) {
  try { rmSync(tempRoot, { recursive: true, force: true }); } catch {}
  for (const dir of ["claude", "opencode", "gemini", "codex", "multi"]) {
    mkdirSync(join(tempRoot, dir), { recursive: true });
  }
  for (const e of entries) {
    // Pick the subdirectory based on the number of host_clis.
    const dir = e.host_clis.length > 1 ? "multi" : e.host_clis[0];
    writeFileSync(join(tempRoot, dir, `${e.slug}.json`), JSON.stringify(e, null, 2));
  }
  return tempRoot;
}

/** Monotonically increasing counter so every import() URL is unique. */
let _seq = 0;

/**
 * Import a fresh instance of the module, pointing STATUSLINES_CATALOG at
 * tempRoot. Uses a unique query string so Node's ES module cache treats each
 * import as a separate module instance.
 */
async function freshImport(tempRoot) {
  process.env.STATUSLINES_CATALOG = tempRoot;
  const mod = await import(`../bin/statuslines.js?t=${++_seq}`);
  return mod;
}

// ─── import validate once (pure function, no disk I/O) ───────────────────────

const { validate } = await import("../bin/statuslines.js");

// ════════════════════════════════════════════════════════════════════════════
// validate() tests — no disk, just call the function directly
// ════════════════════════════════════════════════════════════════════════════

describe("validate() — required fields", () => {
  test("passes for a minimal valid entry", () => {
    const { errs } = validate(minimalEntry());
    assert.deepEqual(errs, []);
  });

  test("reports missing slug", () => {
    const e = minimalEntry();
    delete e.slug;
    const { errs } = validate(e);
    assert.ok(errs.some((m) => m.includes("missing field: slug")));
  });

  test("reports all 9 missing required fields at once when entry is empty", () => {
    const { errs } = validate({});
    const required = ["slug", "name", "repo", "license", "redistributable", "host_clis", "language", "description", "install"];
    for (const k of required) {
      assert.ok(errs.some((m) => m.includes(`missing field: ${k}`)), `expected missing field: ${k}`);
    }
  });
});

describe("validate() — host_clis", () => {
  test("accepts all known clis", () => {
    const { errs } = validate(minimalEntry({ host_clis: ["claude", "opencode", "gemini", "codex"] }));
    assert.deepEqual(errs.filter((m) => m.includes("invalid host_cli")), []);
  });

  test("rejects an unknown cli", () => {
    const { errs } = validate(minimalEntry({ host_clis: ["cursor"] }));
    assert.ok(errs.some((m) => m.includes("invalid host_cli: cursor")));
  });

  test("rejects multiple unknown clis independently", () => {
    const { errs } = validate(minimalEntry({ host_clis: ["cursor", "amp"] }));
    assert.ok(errs.some((m) => m.includes("invalid host_cli: cursor")));
    assert.ok(errs.some((m) => m.includes("invalid host_cli: amp")));
  });
});

describe("validate() — license / redistributable", () => {
  test("permissive license + redistributable=true is OK", () => {
    const { errs } = validate(fullEntry({ license: "MIT", redistributable: true }));
    assert.deepEqual(errs.filter((m) => m.includes("permissive")), []);
  });

  test("non-permissive license + redistributable=true is an error", () => {
    const { errs } = validate(fullEntry({ license: "GPL-3.0", redistributable: true }));
    assert.ok(errs.some((m) => m.includes("redistributable=true") && m.includes("permissive")));
  });

  test("non-permissive license + redistributable=false is fine", () => {
    const { errs } = validate(minimalEntry({ license: "GPL-3.0", redistributable: false }));
    assert.deepEqual(errs.filter((m) => m.includes("permissive")), []);
  });

  test("all 7 permissive licenses pass", () => {
    for (const lic of ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "MPL-2.0", "0BSD"]) {
      const { errs } = validate(fullEntry({ license: lic, redistributable: true }));
      assert.deepEqual(errs.filter((m) => m.includes("permissive")), [], `${lic} should be allowed`);
    }
  });
});

describe("validate() — install types", () => {
  test("invalid install.type is an error", () => {
    const { errs } = validate(minimalEntry({ install: { type: "pip" } }));
    assert.ok(errs.some((m) => m.includes("invalid install.type: pip")));
  });

  test("git without clone_dir is an error", () => {
    const { errs } = validate(minimalEntry({ install: { type: "git" } }));
    assert.ok(errs.some((m) => m.includes("clone_dir")));
  });

  test("npx without package is an error", () => {
    const { errs } = validate(minimalEntry({ install: { type: "npx" } }));
    assert.ok(errs.some((m) => m.includes("requires package")));
  });

  test("npm-global without package is an error", () => {
    const { errs } = validate(minimalEntry({ install: { type: "npm-global" } }));
    assert.ok(errs.some((m) => m.includes("requires package")));
  });

  test("opencode-plugin without package is an error", () => {
    const { errs } = validate(minimalEntry({ install: { type: "opencode-plugin" } }));
    assert.ok(errs.some((m) => m.includes("requires package")));
  });

  test("redistributable npx with pinned version is OK", () => {
    const { errs } = validate(fullEntry({ install: { type: "npx", package: "foo", version: "1.0.0" } }));
    assert.deepEqual(errs.filter((m) => m.includes("pinned")), []);
  });

  test("redistributable npx without version is an error", () => {
    const { errs } = validate(fullEntry({ install: { type: "npx", package: "foo" } }));
    assert.ok(errs.some((m) => m.includes("pinned install.version")));
  });

  test("redistributable npx with version='latest' is an error", () => {
    const { errs } = validate(fullEntry({ install: { type: "npx", package: "foo", version: "latest" } }));
    assert.ok(errs.some((m) => m.includes("pinned install.version")));
  });

  test("non-redistributable npx without version is fine", () => {
    const { errs } = validate(minimalEntry({ redistributable: false, install: { type: "npx", package: "foo" } }));
    assert.deepEqual(errs.filter((m) => m.includes("pinned")), []);
  });

  test("all valid install types pass type-check", () => {
    const validTypes = [
      { type: "git", clone_dir: "dir" },
      { type: "npx", package: "foo", version: "1.0.0" },
      { type: "npm-global", package: "foo", version: "1.0.0" },
      { type: "cargo", package: "foo" },
      { type: "brew", package: "foo" },
      { type: "manual" },
      { type: "opencode-plugin", package: "foo", version: "1.0.0" },
    ];
    for (const install of validTypes) {
      const { errs } = validate(fullEntry({ install }));
      assert.deepEqual(
        errs.filter((m) => m.includes("invalid install.type") || m.includes("requires package") || m.includes("clone_dir")),
        [],
        `install.type=${install.type} should be valid`
      );
    }
  });
});

describe("validate() — dangerous config patterns", () => {
  function entryWithConfig(snippet) {
    return fullEntry({ configs: { claude: snippet } });
  }

  test("curl|bash pattern is an error", () => {
    const { errs } = validate(entryWithConfig({ cmd: "curl http://x.com/install | bash" }));
    assert.ok(errs.some((m) => m.includes("curl-pipe-shell")));
  });

  test("wget|sh pattern is an error", () => {
    const { errs } = validate(entryWithConfig({ cmd: "wget http://x.com/install | sh" }));
    assert.ok(errs.some((m) => m.includes("wget-pipe-shell")));
  });

  test("eval() pattern is an error", () => {
    const { errs } = validate(entryWithConfig({ cmd: "eval(something)" }));
    assert.ok(errs.some((m) => m.includes("eval()")));
  });

  test("base64 -d pattern is an error", () => {
    const { errs } = validate(entryWithConfig({ cmd: "base64 -d payload | bash" }));
    assert.ok(errs.some((m) => m.includes("base64 -d")));
  });

  test("<repository-url> placeholder is an error", () => {
    const { errs } = validate(entryWithConfig({ url: "<repository-url>" }));
    assert.ok(errs.some((m) => m.includes("literal placeholder URL")));
  });

  test("@latest in redistributable configs is an error", () => {
    const { errs } = validate(entryWithConfig({ cmd: "npx some-pkg@latest" }));
    assert.ok(errs.some((m) => m.includes("@latest")));
  });

  test("@latest in non-redistributable configs is allowed", () => {
    const e = minimalEntry({
      redistributable: false,
      configs: { claude: { cmd: "npx some-pkg@latest" } },
    });
    const { errs } = validate(e);
    assert.deepEqual(errs.filter((m) => m.includes("@latest")), []);
  });

  test("config key with unknown cli is an error", () => {
    const { errs } = validate(fullEntry({ configs: { cursor: { cmd: "foo" } } }));
    assert.ok(errs.some((m) => m.includes("configs key 'cursor'")));
  });

  test("config with known cli and safe content is OK", () => {
    const { errs } = validate(fullEntry({ configs: { claude: { statusLine: "echo ok" } } }));
    assert.deepEqual(errs.filter((m) => m.includes("configs")), []);
  });
});

describe("validate() — quarantine", () => {
  test("quarantined=true without reason is an error", () => {
    const { errs } = validate(fullEntry({ security: { quarantined: true } }));
    assert.ok(errs.some((m) => m.includes("quarantine_reason")));
  });

  test("quarantined=true with reason is OK", () => {
    const { errs } = validate(fullEntry({ security: { quarantined: true, quarantine_reason: "supply chain issue" } }));
    assert.deepEqual(errs.filter((m) => m.includes("quarantine")), []);
  });

  test("quarantined=false produces no quarantine error", () => {
    const { errs } = validate(fullEntry({ security: { quarantined: false } }));
    assert.deepEqual(errs.filter((m) => m.includes("quarantine")), []);
  });
});

describe("validate() — image validation", () => {
  test("missing image on redistributable entry is a warning, not error", () => {
    const e = fullEntry();
    delete e.image;
    const { errs, warns } = validate(e);
    assert.deepEqual(errs.filter((m) => m.includes("image")), []);
    assert.ok(warns.some((m) => m.includes("image")));
  });

  test("missing image on non-redistributable entry produces no warning", () => {
    const { warns } = validate(minimalEntry({ redistributable: false }));
    assert.deepEqual(warns.filter((m) => m.includes("image")), []);
  });

  test("http:// image.url is an error", () => {
    const { errs } = validate(fullEntry({ image: { url: "http://example.com/img.png", alt: "ok", source: "readme" } }));
    assert.ok(errs.some((m) => m.includes("image.url must be https://")));
  });

  test("non-string image.url is an error", () => {
    const { errs } = validate(fullEntry({ image: { url: 42, alt: "ok", source: "readme" } }));
    assert.ok(errs.some((m) => m.includes("image.url must be https://")));
  });

  test("github.com/user-attachments/ URL is an error", () => {
    const { errs } = validate(fullEntry({
      image: { url: "https://github.com/user-attachments/assets/abc123", alt: "ok", source: "readme" },
    }));
    assert.ok(errs.some((m) => m.includes("user-attachments")));
  });

  test("image.alt empty string is an error (length < 1)", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: "", source: "readme" } }));
    assert.ok(errs.some((m) => m.includes("image.alt")));
  });

  test("image.alt of 121 chars is an error (length > 120)", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: "a".repeat(121), source: "readme" } }));
    assert.ok(errs.some((m) => m.includes("image.alt")));
  });

  test("image.alt of exactly 120 chars is OK (upper boundary)", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: "a".repeat(120), source: "readme" } }));
    assert.deepEqual(errs.filter((m) => m.includes("image.alt")), []);
  });

  test("image.alt of exactly 1 char is OK (lower boundary)", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: "x", source: "readme" } }));
    assert.deepEqual(errs.filter((m) => m.includes("image.alt")), []);
  });

  test("non-string image.alt is an error", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: null, source: "readme" } }));
    assert.ok(errs.some((m) => m.includes("image.alt")));
  });

  test("image.source='readme' is accepted", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: "ok", source: "readme" } }));
    assert.deepEqual(errs.filter((m) => m.includes("image.source")), []);
  });

  test("image.source='og-fallback' is accepted", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: "ok", source: "og-fallback" } }));
    assert.deepEqual(errs.filter((m) => m.includes("image.source")), []);
  });

  test("image.source='termframe-synthetic' is accepted (not an error)", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: "ok", source: "termframe-synthetic" } }));
    assert.deepEqual(errs.filter((m) => m.includes("image.source")), []);
  });

  test("unknown image.source enum value is an error", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: "ok", source: "uploaded" } }));
    assert.ok(errs.some((m) => m.includes('image.source must be')));
  });

  test("undefined image.source is an error", () => {
    const { errs } = validate(fullEntry({ image: { url: "https://example.com/img.png", alt: "ok" } }));
    assert.ok(errs.some((m) => m.includes('image.source must be')));
  });
});

describe("validate() — capabilities", () => {
  test("missing capabilities on redistributable entry is a warning", () => {
    const e = fullEntry();
    delete e.capabilities;
    const { errs, warns } = validate(e);
    assert.deepEqual(errs.filter((m) => m.includes("capabilities")), []);
    assert.ok(warns.some((m) => m.includes("capabilities")));
  });

  test("capabilities.network must be boolean", () => {
    const { errs } = validate(fullEntry({ capabilities: { network: "yes" } }));
    assert.ok(errs.some((m) => m.includes("capabilities.network must be boolean")));
  });

  test("capabilities.child_process must be boolean", () => {
    const { errs } = validate(fullEntry({ capabilities: { child_process: 1 } }));
    assert.ok(errs.some((m) => m.includes("capabilities.child_process must be boolean")));
  });

  test("capabilities.filesystem_write must be boolean", () => {
    const { errs } = validate(fullEntry({ capabilities: { filesystem_write: null } }));
    assert.ok(errs.some((m) => m.includes("capabilities.filesystem_write must be boolean")));
  });

  test("capabilities.env_read must be an array", () => {
    const { errs } = validate(fullEntry({ capabilities: { env_read: "HOME" } }));
    assert.ok(errs.some((m) => m.includes("capabilities.env_read must be an array")));
  });

  test("capabilities.env_read as array is OK", () => {
    const { errs } = validate(fullEntry({ capabilities: { env_read: ["HOME", "PATH"] } }));
    assert.deepEqual(errs.filter((m) => m.includes("env_read")), []);
  });

  test("unknown verification_method is an error", () => {
    const { errs } = validate(fullEntry({ capabilities: { verification_method: "guessing" } }));
    assert.ok(errs.some((m) => m.includes("verification_method")));
  });

  test("null verification_method is OK", () => {
    const { errs } = validate(fullEntry({ capabilities: { verification_method: null } }));
    assert.deepEqual(errs.filter((m) => m.includes("verification_method")), []);
  });

  test("all valid verification_method values pass", () => {
    for (const vm of ["declared", "sandbox-strace", "sandbox-bpf", "skipped"]) {
      const { errs } = validate(fullEntry({ capabilities: { verification_method: vm } }));
      assert.deepEqual(errs.filter((m) => m.includes("verification_method")), [], `${vm} should be valid`);
    }
  });

  test("env_read=['*'] without notes produces a wildcard warning", () => {
    const e = fullEntry({ capabilities: { env_read: ["*"] } });
    delete e.notes;
    const { warns } = validate(e);
    assert.ok(warns.some((m) => m.includes("wildcard")));
  });

  test("env_read=['*'] with notes suppresses wildcard warning", () => {
    const e = fullEntry({ capabilities: { env_read: ["*"] }, notes: "justified" });
    const { warns } = validate(e);
    assert.deepEqual(warns.filter((m) => m.includes("wildcard")), []);
  });
});

describe("validate() — i18n description warnings", () => {
  test("redistributable without description_fr warns", () => {
    const e = fullEntry();
    delete e.description_fr;
    const { warns } = validate(e);
    assert.ok(warns.some((m) => m.includes("description_fr")));
  });

  test("redistributable without description_ja warns", () => {
    const e = fullEntry();
    delete e.description_ja;
    const { warns } = validate(e);
    assert.ok(warns.some((m) => m.includes("description_ja")));
  });

  test("redistributable with both translations produces no i18n warning", () => {
    const { warns } = validate(fullEntry());
    assert.deepEqual(warns.filter((m) => m.includes("description_fr") || m.includes("description_ja")), []);
  });

  test("non-redistributable entry without translations produces no i18n warning", () => {
    const { warns } = validate(minimalEntry({ redistributable: false }));
    assert.deepEqual(warns.filter((m) => m.includes("description_fr") || m.includes("description_ja")), []);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Renderer tests — each suite uses its own temp dir to avoid races
// ════════════════════════════════════════════════════════════════════════════

describe("renderTopReadmeBlocks() — locale headers", () => {
  const DIR = join(tmpdir(), `sl-test-headers-${process.pid}`);

  before(() => {
    makeTempCatalog([
      fullEntry({
        slug: "alpha",
        name: "Alpha Tool",
        host_clis: ["claude"],
        image: { url: "https://example.com/a.png", alt: "alpha", source: "readme", local: "images/alpha.png" },
      }),
    ], DIR);
  });

  after(() => { try { rmSync(DIR, { recursive: true, force: true }); } catch {} });

  test("en — Preview/Name/License/Description headers", async () => {
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("en");
    assert.ok(catalog.includes("| Preview |"), `'Preview' missing; got: ${catalog.slice(0, 200)}`);
    assert.ok(catalog.includes("| Name |"));
    assert.ok(catalog.includes("| License |"));
    assert.ok(catalog.includes("| Description |"));
  });

  test("fr — Aperçu/Nom/Licence/Description headers", async () => {
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("fr");
    assert.ok(catalog.includes("| Aperçu |"), `'Aperçu' missing; got: ${catalog.slice(0, 200)}`);
    assert.ok(catalog.includes("| Nom |"));
    assert.ok(catalog.includes("| Licence |"));
    assert.ok(catalog.includes("| Description |"));
  });

  test("ja — プレビュー/名称/ライセンス/説明 headers", async () => {
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("ja");
    assert.ok(catalog.includes("| プレビュー |"), `'プレビュー' missing; got: ${catalog.slice(0, 200)}`);
    assert.ok(catalog.includes("| 名称 |"));
    assert.ok(catalog.includes("| ライセンス |"));
    assert.ok(catalog.includes("| 説明 |"));
  });

  test("unknown lang throws with 'unknown lang' message", async () => {
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    assert.throws(() => renderTopReadmeBlocks("es"), /unknown lang/);
  });
});

describe("renderTopReadmeBlocks() — description localisation and fallback", () => {
  const DIR = join(tmpdir(), `sl-test-desc-${process.pid}`);

  // Each test in this suite creates its own catalog state.
  // We serialize by making them synchronous within the suite (sequential
  // reads from same DIR). Use unique slugs to avoid stale data.

  after(() => { try { rmSync(DIR, { recursive: true, force: true }); } catch {} });

  test("en uses description field", async () => {
    makeTempCatalog([fullEntry({
      slug: "desc-en",
      host_clis: ["claude"],
      description: "English description.",
      description_fr: "Description française.",
      description_ja: "日本語の説明。",
      image: { url: "https://example.com/b.png", alt: "b", source: "readme", local: "images/b.png" },
    })], DIR);
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("en");
    assert.ok(catalog.includes("English description."));
    assert.ok(!catalog.includes("Description française."));
  });

  test("fr uses description_fr field", async () => {
    makeTempCatalog([fullEntry({
      slug: "desc-fr",
      host_clis: ["claude"],
      description: "English description.",
      description_fr: "Description française.",
      description_ja: "日本語の説明。",
      image: { url: "https://example.com/b.png", alt: "b", source: "readme", local: "images/b.png" },
    })], DIR);
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("fr");
    assert.ok(catalog.includes("Description française."));
    assert.ok(!catalog.includes("English description."));
  });

  test("ja uses description_ja field", async () => {
    makeTempCatalog([fullEntry({
      slug: "desc-ja",
      host_clis: ["claude"],
      description: "English description.",
      description_fr: "Description française.",
      description_ja: "日本語の説明。",
      image: { url: "https://example.com/b.png", alt: "b", source: "readme", local: "images/b.png" },
    })], DIR);
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("ja");
    assert.ok(catalog.includes("日本語の説明。"));
    assert.ok(!catalog.includes("English description."));
  });

  test("fr falls back to English description when description_fr is absent", async () => {
    // Build the entry manually without description_fr — fullEntry() always adds it as a default.
    const e = fullEntry({ slug: "fallback-fr", host_clis: ["claude"], description: "English fallback.",
      description_ja: "日本語。", image: { url: "https://example.com/g.png", alt: "g", source: "readme", local: "images/g.png" } });
    delete e.description_fr; // explicitly remove so the fallback path is exercised
    makeTempCatalog([e], DIR);
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("fr");
    assert.ok(catalog.includes("English fallback."), `expected fallback in: ${catalog.slice(0, 300)}`);
  });

  test("ja falls back to English description when description_ja is absent", async () => {
    // Build the entry manually without description_ja.
    const e = fullEntry({ slug: "fallback-ja", host_clis: ["claude"], description: "English fallback.",
      description_fr: "Français.", image: { url: "https://example.com/d.png", alt: "d", source: "readme", local: "images/d.png" } });
    delete e.description_ja; // explicitly remove so the fallback path is exercised
    makeTempCatalog([e], DIR);
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("ja");
    assert.ok(catalog.includes("English fallback."), `expected fallback in: ${catalog.slice(0, 300)}`);
  });
});

describe("renderTopReadmeBlocks() — pipe and quote escaping", () => {
  const DIR = join(tmpdir(), `sl-test-escape-${process.pid}`);

  before(() => {
    makeTempCatalog([fullEntry({
      slug: "escape-test",
      name: "Pipe|Tool",
      host_clis: ["claude"],
      description: 'Has a | pipe here.',
      description_fr: 'A des | barres ici.',
      image: {
        url: "https://example.com/e.png",
        alt: 'Alt with | pipe and "quote"',
        source: "readme",
        local: "images/escape-test.png",
      },
    })], DIR);
  });

  after(() => { try { rmSync(DIR, { recursive: true, force: true }); } catch {} });

  test("pipes in description are escaped as \\| in en output", async () => {
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("en");
    assert.ok(catalog.includes("\\|"), `expected escaped pipe in: ${catalog}`);
  });

  test("pipes in description_fr are escaped as \\| in fr output", async () => {
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("fr");
    assert.ok(catalog.includes("\\|"), `expected escaped pipe in fr: ${catalog}`);
  });

  test("pipe in image alt is escaped (\\| or &quot;) in img cell", async () => {
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("en");
    // alt has both | and " — verify at least one form of escaping is present
    assert.ok(catalog.includes("\\|") || catalog.includes("&quot;"), "expected escaping in alt attribute");
  });
});

describe("renderTopReadmeBlocks() — image.local absent shows em dash", () => {
  const DIR = join(tmpdir(), `sl-test-dash-${process.pid}`);

  before(() => {
    makeTempCatalog([fullEntry({
      slug: "nolocal",
      name: "No Local Image",
      host_clis: ["claude"],
      // image present but no local field
      image: { url: "https://example.com/nolocal.png", alt: "preview", source: "og-fallback" },
    })], DIR);
  });

  after(() => { try { rmSync(DIR, { recursive: true, force: true }); } catch {} });

  test("preview cell is '—' when image.local is missing", async () => {
    const { renderTopReadmeBlocks } = await freshImport(DIR);
    const { catalog } = renderTopReadmeBlocks("en");
    assert.ok(catalog.includes("| — |"), `expected '—' cell in: ${catalog}`);
  });
});

describe("renderTopReadmeBlocks() — sorting, grouping, and count", () => {
  const DIR_SORT = join(tmpdir(), `sl-test-sort-${process.pid}`);
  const DIR_COUNT = join(tmpdir(), `sl-test-count-${process.pid}`);

  before(() => {
    makeTempCatalog([
      fullEntry({ slug: "zz-last",  name: "ZZ Last",  host_clis: ["claude"],   image: { url: "https://x.com/z.png", alt: "z", source: "readme", local: "images/z.png" } }),
      fullEntry({ slug: "aa-first", name: "AA First", host_clis: ["claude"],   image: { url: "https://x.com/a.png", alt: "a", source: "readme", local: "images/a.png" } }),
      fullEntry({ slug: "oc-only",  name: "OC Only",  host_clis: ["opencode"], image: { url: "https://x.com/o.png", alt: "o", source: "readme", local: "images/o.png" } }),
    ], DIR_SORT);

    makeTempCatalog([
      fullEntry({ slug: "visible-1", name: "Visible",     host_clis: ["claude"], image: { url: "https://x.com/v.png", alt: "v", source: "readme", local: "images/v.png" } }),
      fullEntry({ slug: "q-hidden",  name: "Quarantined", host_clis: ["claude"],
        security: { quarantined: true, quarantine_reason: "test" },
        image: { url: "https://x.com/q.png", alt: "q", source: "readme", local: "images/q.png" },
      }),
    ], DIR_COUNT);
  });

  after(() => {
    try { rmSync(DIR_SORT, { recursive: true, force: true }); } catch {}
    try { rmSync(DIR_COUNT, { recursive: true, force: true }); } catch {}
  });

  test("entries are sorted by slug within each cli group (name order reflects slug order)", async () => {
    // renderTopReadmeBlocks does not emit slug in the table — it emits e.name.
    // "AA First" (slug: aa-first) must appear before "ZZ Last" (slug: zz-last).
    const { renderTopReadmeBlocks } = await freshImport(DIR_SORT);
    const { catalog } = renderTopReadmeBlocks("en");
    const aaPos = catalog.indexOf("AA First");
    const zzPos = catalog.indexOf("ZZ Last");
    assert.ok(aaPos !== -1 && zzPos !== -1, `both names should appear; got: ${catalog.slice(0, 400)}`);
    assert.ok(aaPos < zzPos, `AA First (${aaPos}) should appear before ZZ Last (${zzPos})`);
  });

  test("opencode entry appears under ### OpenCode section", async () => {
    // "OC Only" has host_clis: ["opencode"] so it should be under ### OpenCode.
    const { renderTopReadmeBlocks } = await freshImport(DIR_SORT);
    const { catalog } = renderTopReadmeBlocks("en");
    const opencodePos = catalog.indexOf("### OpenCode");
    const ocEntryPos = catalog.indexOf("OC Only");
    assert.ok(opencodePos !== -1, "should have ### OpenCode section");
    assert.ok(ocEntryPos !== -1, `OC Only should appear in catalog; got: ${catalog.slice(0, 500)}`);
    assert.ok(ocEntryPos > opencodePos, "OC Only should be in the OpenCode section");
  });

  test("count matches loadVisible().length", async () => {
    const { renderTopReadmeBlocks, loadVisible } = await freshImport(DIR_SORT);
    const { count } = renderTopReadmeBlocks("en");
    const visible = loadVisible();
    assert.equal(count, visible.length, "count should equal loadVisible().length");
  });

  test("quarantined entries are excluded from count", async () => {
    const { renderTopReadmeBlocks } = await freshImport(DIR_COUNT);
    const { count } = renderTopReadmeBlocks("en");
    assert.equal(count, 1, "only the 1 visible entry should be counted");
  });

  test("empty cli section shows localized 'no entries' message", async () => {
    // DIR_SORT has no gemini entries
    const { renderTopReadmeBlocks } = await freshImport(DIR_SORT);
    const { catalog: en } = renderTopReadmeBlocks("en");
    const { catalog: fr } = renderTopReadmeBlocks("fr");
    const { catalog: ja } = renderTopReadmeBlocks("ja");
    assert.ok(en.includes("*No catalog entries for Gemini CLI yet.*"));
    assert.ok(fr.includes("*Aucune entrée de catalogue pour Gemini CLI pour le moment.*"));
    assert.ok(ja.includes("*Gemini CLI のカタログエントリはまだありません。*"));
  });
});

describe("renderReadme() — locale titles and table headers", () => {
  const DIR = join(tmpdir(), `sl-test-readme-${process.pid}`);

  before(() => {
    makeTempCatalog([fullEntry({
      slug: "readme-test",
      name: "ReadmeTest",
      host_clis: ["claude"],
      install: { type: "npx", package: "readme-pkg", version: "2.0.0" },
      image: { url: "https://example.com/r.png", alt: "r", source: "readme", local: "images/r.png" },
      configs: { claude: { statusLine: "npx --ignore-scripts -y readme-pkg@2.0.0" } },
    })], DIR);
  });

  after(() => { try { rmSync(DIR, { recursive: true, force: true }); } catch {} });

  test("en: starts with '# Catalog'", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").startsWith("# Catalog\n"));
  });

  test("fr: starts with '# Catalogue'", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("fr").startsWith("# Catalogue\n"));
  });

  test("ja: starts with '# カタログ'", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("ja").startsWith("# カタログ\n"));
  });

  test("en table header is English", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").includes("| Slug | Name | Targets | License | Lang | Status | Install |"));
  });

  test("fr table header is French", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("fr").includes("| Slug | Nom | Cibles | Licence | Langage | Statut | Installation |"));
  });

  test("ja table header is Japanese", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("ja").includes("| Slug | 名称 | 対象 | ライセンス | 言語 | 状況 | インストール |"));
  });

  test("en npx install line rendered correctly", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").includes("npx --ignore-scripts -y readme-pkg@2.0.0"));
  });

  test("fr label is 'Installation' for install section", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("fr").includes("Installation"));
  });

  test("ja label contains 'インストール' for install section", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("ja").includes("インストール"));
  });

  test("entry image renders as <img> tag with repo link", async () => {
    const { renderReadme } = await freshImport(DIR);
    const md = renderReadme("en");
    assert.ok(md.includes('<a href="https://github.com/example/test"><img'));
    assert.ok(md.includes('width="480"'));
  });

  test("en per-entry heading is '## Per-entry detail'", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").includes("## Per-entry detail"));
  });

  test("fr per-entry heading is '## Détail par entrée'", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("fr").includes("## Détail par entrée"));
  });

  test("ja per-entry heading is '## エントリ別詳細'", async () => {
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("ja").includes("## エントリ別詳細"));
  });
});

describe("renderReadme() — install type variants", () => {
  const DIR = join(tmpdir(), `sl-test-install-${process.pid}`);

  after(() => { try { rmSync(DIR, { recursive: true, force: true }); } catch {} });

  test("cargo install line", async () => {
    makeTempCatalog([minimalEntry({ slug: "cargo-e", install: { type: "cargo", package: "cargo-tool" } })], DIR);
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").includes("cargo install cargo-tool"));
  });

  test("cargo install with version includes --version flag", async () => {
    makeTempCatalog([minimalEntry({ slug: "cargo-v", install: { type: "cargo", package: "cargo-tool", version: "0.5.0" } })], DIR);
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").includes("--version 0.5.0"));
  });

  test("brew install line", async () => {
    makeTempCatalog([minimalEntry({ slug: "brew-e", install: { type: "brew", package: "brew-tool" } })], DIR);
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").includes("brew install brew-tool"));
  });

  test("git install line uses git clone text", async () => {
    makeTempCatalog([minimalEntry({ slug: "git-e", install: { type: "git", clone_dir: "git-tool" } })], DIR);
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").includes("git clone"));
  });

  test("opencode-plugin install line shows package@version and opencode.json", async () => {
    makeTempCatalog([fullEntry({
      slug: "oc-plugin",
      name: "OC Plugin",
      host_clis: ["opencode"],
      install: { type: "opencode-plugin", package: "oc-pkg", version: "3.1.0" },
    })], DIR);
    const { renderReadme } = await freshImport(DIR);
    const md = renderReadme("en");
    assert.ok(md.includes("oc-pkg@3.1.0"));
    assert.ok(md.includes("opencode.json"));
  });

  test("manual install uses 'see upstream' (en)", async () => {
    makeTempCatalog([minimalEntry({ slug: "manual-e", install: { type: "manual" } })], DIR);
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").includes("see upstream"));
  });

  test("manual install uses 'voir en amont' (fr)", async () => {
    makeTempCatalog([minimalEntry({ slug: "manual-fr", install: { type: "manual" } })], DIR);
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("fr").includes("voir en amont"));
  });

  test("manual install uses '上流を参照' (ja)", async () => {
    makeTempCatalog([minimalEntry({ slug: "manual-ja", install: { type: "manual" } })], DIR);
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("ja").includes("上流を参照"));
  });

  test("npm-global install line", async () => {
    makeTempCatalog([fullEntry({ slug: "npm-global-e", install: { type: "npm-global", package: "global-pkg", version: "5.0.0" } })], DIR);
    const { renderReadme } = await freshImport(DIR);
    assert.ok(renderReadme("en").includes("npm i -g --ignore-scripts global-pkg@5.0.0"));
  });
});

describe("renderReadme() — quarantined entries excluded", () => {
  const DIR = join(tmpdir(), `sl-test-readme-q-${process.pid}`);

  before(() => {
    makeTempCatalog([
      fullEntry({ slug: "visible", name: "Visible Entry", host_clis: ["claude"],
        image: { url: "https://x.com/v.png", alt: "v", source: "readme", local: "images/v.png" } }),
      fullEntry({ slug: "hidden-q", name: "Quarantined Entry", host_clis: ["claude"],
        security: { quarantined: true, quarantine_reason: "test" },
        image: { url: "https://x.com/q.png", alt: "q", source: "readme", local: "images/q.png" } }),
    ], DIR);
  });

  after(() => { try { rmSync(DIR, { recursive: true, force: true }); } catch {} });

  test("quarantined entry does not appear in rendered README", async () => {
    const { renderReadme } = await freshImport(DIR);
    const md = renderReadme("en");
    assert.ok(!md.includes("hidden-q"), "quarantined slug should not appear");
    assert.ok(md.includes("visible"), "visible entry should appear");
  });
});

describe("renderQuarantine() — locale headers and no-entries message", () => {
  const DIR = join(tmpdir(), `sl-test-quarantine-${process.pid}`);

  after(() => { try { rmSync(DIR, { recursive: true, force: true }); } catch {} });

  test("en: '# Quarantine' title when no quarantined entries", async () => {
    makeTempCatalog([fullEntry({ slug: "clean-en" })], DIR);
    const { renderQuarantine } = await freshImport(DIR);
    const { md } = renderQuarantine("en");
    assert.ok(md.includes("# Quarantine"));
    assert.ok(md.includes("*No entries are currently quarantined.*"));
  });

  test("fr: '# Quarantaine' and French no-entries message", async () => {
    makeTempCatalog([fullEntry({ slug: "clean-fr" })], DIR);
    const { renderQuarantine } = await freshImport(DIR);
    const { md } = renderQuarantine("fr");
    assert.ok(md.includes("# Quarantaine"));
    assert.ok(md.includes("*Aucune entrée n'est actuellement en quarantaine.*"));
  });

  test("ja: '# 隔離' and Japanese no-entries message", async () => {
    makeTempCatalog([fullEntry({ slug: "clean-ja" })], DIR);
    const { renderQuarantine } = await freshImport(DIR);
    const { md } = renderQuarantine("ja");
    assert.ok(md.includes("# 隔離"));
    assert.ok(md.includes("*現在、隔離されているエントリはありません。*"));
  });

  test("count=0 when no quarantined entries", async () => {
    makeTempCatalog([fullEntry({ slug: "nonq" })], DIR);
    const { renderQuarantine } = await freshImport(DIR);
    assert.equal(renderQuarantine("en").count, 0);
  });

  test("quarantined entry appears with slug, reason, and date", async () => {
    makeTempCatalog([
      fullEntry({ slug: "visible-clean" }),
      fullEntry({
        slug: "q-entry",
        name: "Quarantined",
        host_clis: ["claude"],
        security: { quarantined: true, quarantine_reason: "supply chain risk", quarantined_at: "2026-01-01" },
      }),
    ], DIR);
    const { renderQuarantine } = await freshImport(DIR);
    const { md, count } = renderQuarantine("en");
    assert.equal(count, 1);
    assert.ok(md.includes("q-entry"));
    assert.ok(md.includes("supply chain risk"));
    assert.ok(md.includes("2026-01-01"));
  });

  test("renderQuarantine sees quarantined entries even though loadVisible() excludes them", async () => {
    makeTempCatalog([
      fullEntry({
        slug: "q-only",
        name: "Only Quarantined",
        host_clis: ["claude"],
        security: { quarantined: true, quarantine_reason: "reason" },
      }),
    ], DIR);
    const { renderQuarantine, loadVisible } = await freshImport(DIR);
    assert.equal(loadVisible().length, 0, "loadVisible should exclude the quarantined entry");
    assert.equal(renderQuarantine("en").count, 1, "renderQuarantine should find it via loadAll");
  });

  test("pipe character in quarantine_reason is escaped as \\|", async () => {
    makeTempCatalog([
      fullEntry({
        slug: "pipe-q",
        name: "Pipe Quarantined",
        host_clis: ["claude"],
        security: { quarantined: true, quarantine_reason: "reason | with pipe", quarantined_at: "2026-02-01" },
      }),
    ], DIR);
    const { renderQuarantine } = await freshImport(DIR);
    const { md } = renderQuarantine("en");
    assert.ok(md.includes("reason \\| with pipe"), `expected escaped pipe in: ${md}`);
  });

  test("fr quarantine table header is French", async () => {
    makeTempCatalog([
      fullEntry({
        slug: "q-fr",
        name: "Quarantined FR",
        host_clis: ["claude"],
        security: { quarantined: true, quarantine_reason: "fr test" },
      }),
    ], DIR);
    const { renderQuarantine } = await freshImport(DIR);
    const { md } = renderQuarantine("fr");
    assert.ok(md.includes("| Slug | Raison | En quarantaine depuis |"));
  });

  test("ja quarantine table header is Japanese", async () => {
    makeTempCatalog([
      fullEntry({
        slug: "q-ja",
        name: "Quarantined JA",
        host_clis: ["claude"],
        security: { quarantined: true, quarantine_reason: "ja test" },
      }),
    ], DIR);
    const { renderQuarantine } = await freshImport(DIR);
    const { md } = renderQuarantine("ja");
    assert.ok(md.includes("| Slug | 理由 | 隔離日 |"));
  });
});

describe("loadVisible() vs loadAll()", () => {
  const DIR = join(tmpdir(), `sl-test-loaders-${process.pid}`);

  before(() => {
    makeTempCatalog([
      fullEntry({ slug: "visible-a", name: "Visible A", host_clis: ["claude"] }),
      fullEntry({
        slug: "quarantined-b",
        name: "Quarantined B",
        host_clis: ["claude"],
        security: { quarantined: true, quarantine_reason: "test" },
      }),
    ], DIR);
  });

  after(() => { try { rmSync(DIR, { recursive: true, force: true }); } catch {} });

  test("loadVisible() excludes quarantined entries", async () => {
    const { loadVisible } = await freshImport(DIR);
    const entries = loadVisible();
    assert.equal(entries.length, 1);
    assert.ok(entries.every((e) => !e.security?.quarantined));
  });

  test("loadAll() includes quarantined entries", async () => {
    const { loadAll } = await freshImport(DIR);
    const entries = loadAll();
    assert.equal(entries.length, 2);
    assert.ok(entries.some((e) => e.slug === "quarantined-b"));
  });
});
