#!/usr/bin/env node
// Probes every catalog entry against its upstream registry/repo, prints
// a markdown report of drift to stdout. Exits 0 even on drift — the
// workflow uses the report to decide whether to open an issue.
//
// Flags:
//   --json <path>   write the full structured report as JSON to <path>
import { readdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";
import http from "node:http";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "catalog");

// Parse --json <path> flag
const JSON_FLAG_IDX = process.argv.indexOf("--json");
const JSON_OUT_PATH = JSON_FLAG_IDX !== -1 ? process.argv[JSON_FLAG_IDX + 1] : null;

const IMAGE_UA = "statuslines-catalog-liveness/1.0 (+https://github.com/ryanmaclean/statuslines)";
const HEAD_TIMEOUT_MS = 8000;
const OG_ASSETS_RE = /^https:\/\/opengraph\.githubassets\.com\//;

function listEntries() {
  const out = [];
  for (const group of readdirSync(CATALOG, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const dir = join(CATALOG, group.name);
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".json")) {
        out.push(JSON.parse(readFileSync(join(dir, f), "utf8")));
      }
    }
  }
  return out;
}

async function fetchJson(url, timeoutMs = 8000) {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return await r.json();
}

/**
 * Perform an HTTP HEAD request following redirects (up to 5).
 * Returns { statusCode, contentType, finalUrl, redirected }.
 */
function headRequest(url, originalUrl = url, redirectsLeft = 5) {
  return new Promise((resolve) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (_) {
      resolve({ statusCode: 0, contentType: "", finalUrl: url, redirected: false, error: "invalid URL" });
      return;
    }
    const lib = parsedUrl.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: "HEAD",
        headers: { "User-Agent": IMAGE_UA },
        timeout: HEAD_TIMEOUT_MS,
      },
      (res) => {
        if (
          [301, 302, 303, 307, 308].includes(res.statusCode) &&
          res.headers.location &&
          redirectsLeft > 0
        ) {
          const nextUrl = new URL(res.headers.location, url).toString();
          resolve(headRequest(nextUrl, originalUrl, redirectsLeft - 1));
          return;
        }
        const ct = (res.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
        const cl = res.headers["content-length"] ? parseInt(res.headers["content-length"], 10) : null;
        resolve({
          statusCode: res.statusCode,
          contentType: ct,
          finalUrl: url,
          redirected: url !== originalUrl,
          contentLength: isNaN(cl) ? null : cl,
        });
      }
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ statusCode: 0, contentType: "", finalUrl: url, redirected: url !== originalUrl, error: "timeout" });
    });
    req.on("error", (err) => {
      resolve({ statusCode: 0, contentType: "", finalUrl: url, redirected: url !== originalUrl, error: err.message });
    });
    req.end();
  });
}

/**
 * Probe a single image URL and classify the result.
 * Returns { slug, imageUrl, httpStatus, contentType, contentLength, category, note, isOgStable }.
 */
async function probeImageUrl(slug, imageUrl) {
  const isOgStable = OG_ASSETS_RE.test(imageUrl);
  let result;
  try {
    result = await headRequest(imageUrl);
  } catch (e) {
    return {
      slug, imageUrl, httpStatus: 0, contentType: "", contentLength: null,
      category: "dead", note: `probe error: ${e.message}`, isOgStable,
    };
  }

  const { statusCode, contentType, finalUrl, redirected, contentLength, error } = result;

  if (error && statusCode === 0) {
    const sharpAlarm = isOgStable ? " [OG-STABLE: SHARP ALARM]" : "";
    return {
      slug, imageUrl, httpStatus: 0, contentType: "", contentLength: null,
      category: "dead", note: `network error: ${error}${sharpAlarm}`, isOgStable,
    };
  }

  const isImageCt = contentType.startsWith("image/");
  const isHtmlCt = contentType === "text/html" || contentType === "application/json";

  if (statusCode >= 400) {
    const sharpAlarm = isOgStable ? " [OG-STABLE: SHARP ALARM]" : "";
    return {
      slug, imageUrl, httpStatus: statusCode, contentType, contentLength,
      category: "dead", note: `HTTP ${statusCode}${sharpAlarm}`, isOgStable,
    };
  }

  if (statusCode >= 300) {
    // Not yet following — shouldn't happen since we follow redirects, but guard anyway
    return {
      slug, imageUrl, httpStatus: statusCode, contentType, contentLength,
      category: "dead", note: `unexpected redirect HTTP ${statusCode} (no Location?)`, isOgStable,
    };
  }

  // statusCode is 2xx
  if (statusCode === 200 && isImageCt) {
    if (redirected) {
      // URL has moved but still serves an image — flag for maintainer awareness
      const note = `final URL differs from catalog: ${finalUrl}`;
      return {
        slug, imageUrl, httpStatus: statusCode, contentType, contentLength,
        category: "redirected", note, isOgStable,
      };
    }
    if (isOgStable) {
      return {
        slug, imageUrl, httpStatus: statusCode, contentType, contentLength,
        category: "og-stable", note: "opengraph.githubassets.com — stable by GitHub contract", isOgStable,
      };
    }
    return {
      slug, imageUrl, httpStatus: statusCode, contentType, contentLength,
      category: "ok", note: "", isOgStable,
    };
  }

  if (statusCode === 200 && isHtmlCt) {
    const sharpAlarm = isOgStable ? " [OG-STABLE: SHARP ALARM]" : "";
    return {
      slug, imageUrl, httpStatus: statusCode, contentType, contentLength,
      category: "wrong_content_type",
      note: `200 OK but content-type is ${contentType} — upstream may be returning an error page${sharpAlarm}`,
      isOgStable,
    };
  }

  if (statusCode === 200) {
    return {
      slug, imageUrl, httpStatus: statusCode, contentType, contentLength,
      category: "wrong_content_type",
      note: `200 OK but unexpected content-type: ${contentType || "(none)"}`,
      isOgStable,
    };
  }

  // Other 2xx
  return {
    slug, imageUrl, httpStatus: statusCode, contentType, contentLength,
    category: "ok", note: `HTTP ${statusCode}`, isOgStable,
  };
}

/**
 * Probe image URLs for all visible (non-quarantined) entries.
 * Returns { results: [...], groups: { ok, og_stable, wrong_content_type, redirected, dead } }.
 */
async function probeAllImageUrls(entries) {
  const visible = entries.filter(
    (e) => !e.security?.quarantined && e.image?.url
  );

  const results = [];
  for (const e of visible) {
    const r = await probeImageUrl(e.slug, e.image.url);
    results.push(r);
  }

  const groups = {
    ok: results.filter((r) => r.category === "ok"),
    og_stable: results.filter((r) => r.category === "og-stable"),
    wrong_content_type: results.filter((r) => r.category === "wrong_content_type"),
    redirected: results.filter((r) => r.category === "redirected"),
    dead: results.filter((r) => r.category === "dead"),
  };

  return { results, groups, probed: visible.length };
}

function renderImageReport(imageProbe) {
  const { results, groups, probed } = imageProbe;
  const driftCount = groups.wrong_content_type.length + groups.redirected.length + groups.dead.length;
  const lines = [];

  lines.push(`## image-url liveness (${probed} probed)`);
  lines.push("");

  if (driftCount === 0) {
    lines.push(`All ${probed} image URLs healthy.`);
    lines.push("");
    return lines.join("\n");
  }

  lines.push(`${probed} image URLs probed; ${driftCount} need attention.`);
  lines.push("");

  if (groups.dead.length) {
    lines.push("### Dead (4xx / 5xx / network error)");
    lines.push("");
    for (const r of groups.dead) {
      lines.push(`- \`${r.slug}\` — HTTP ${r.httpStatus || "ERR"}: ${r.note}`);
      lines.push(`  URL: \`${r.imageUrl}\``);
    }
    lines.push("");
  }

  if (groups.wrong_content_type.length) {
    lines.push("### Wrong content-type (200 but not image/*)");
    lines.push("");
    for (const r of groups.wrong_content_type) {
      lines.push(`- \`${r.slug}\` — ${r.note}`);
      lines.push(`  URL: \`${r.imageUrl}\``);
    }
    lines.push("");
  }

  if (groups.redirected.length) {
    lines.push("### Redirected (URL has moved)");
    lines.push("");
    for (const r of groups.redirected) {
      lines.push(`- \`${r.slug}\` — ${r.note}`);
      lines.push(`  Original: \`${r.imageUrl}\``);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function probeNpm(entry) {
  const drift = [];
  const pkg = entry.install?.package;
  const ver = entry.install?.version;
  if (!pkg || !ver) return drift;

  let meta;
  try {
    meta = await fetchJson(`https://registry.npmjs.org/${pkg.replace("/", "%2F")}`);
  } catch (e) {
    drift.push(`registry unreachable: ${e.message}`);
    return drift;
  }

  const v = meta.versions?.[ver];
  if (!v) {
    drift.push(`version ${ver} no longer in registry`);
    return drift;
  }

  const observedIntegrity = v.dist?.integrity;
  if (entry.install?.integrity && observedIntegrity && observedIntegrity !== entry.install.integrity) {
    drift.push(`integrity changed: stored=${entry.install.integrity}, observed=${observedIntegrity}`);
  }

  const observedLicense = v.license ?? meta.license ?? null;
  if (observedLicense && entry.license && observedLicense !== entry.license) {
    drift.push(`license drift: catalog=${entry.license}, registry=${observedLicense}`);
  }

  const latest = meta["dist-tags"]?.latest;
  if (latest && latest !== ver) {
    drift.push(`upstream advanced: pinned=${ver}, latest=${latest}`);
  }
  return drift;
}

async function probeRepo(entry) {
  const drift = [];
  if (!entry.repo) return drift;
  try {
    const r = await fetch(entry.repo, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      redirect: "manual",
    });
    if (r.status >= 300 && r.status < 400) {
      drift.push(`repo redirects (HTTP ${r.status}); investigate`);
    } else if (r.status >= 400) {
      drift.push(`repo unreachable (HTTP ${r.status})`);
    }
  } catch (e) {
    drift.push(`repo probe failed: ${e.message}`);
  }
  return drift;
}

const entries = listEntries();

// --- registry/repo probe (existing) ---
const reports = [];
for (const e of entries) {
  const driftLines = [];
  if (["npx", "npm-global", "opencode-plugin"].includes(e.install?.type)) {
    driftLines.push(...await probeNpm(e));
  }
  driftLines.push(...await probeRepo(e));
  if (driftLines.length) {
    reports.push({ slug: e.slug, drift: driftLines });
  }
}

// --- image URL probe (new) ---
const imageProbe = await probeAllImageUrls(entries);
const { groups: imgGroups } = imageProbe;
const imageDriftCount =
  imgGroups.wrong_content_type.length + imgGroups.redirected.length + imgGroups.dead.length;

// Write JSON output if --json was requested
if (JSON_OUT_PATH) {
  const jsonPayload = {
    generatedAt: new Date().toISOString(),
    registryRepoDrift: reports,
    imageUrlProbe: {
      probed: imageProbe.probed,
      results: imageProbe.results,
      summary: {
        ok: imgGroups.ok.length,
        og_stable: imgGroups.og_stable.length,
        wrong_content_type: imgGroups.wrong_content_type.length,
        redirected: imgGroups.redirected.length,
        dead: imgGroups.dead.length,
      },
    },
  };
  try {
    await writeFile(JSON_OUT_PATH, JSON.stringify(jsonPayload, null, 2) + "\n");
  } catch (e) {
    process.stderr.write(`Warning: could not write JSON to ${JSON_OUT_PATH}: ${e.message}\n`);
  }
}

// --- Build and emit markdown report ---
const hasAnyDrift = reports.length > 0 || imageDriftCount > 0;

if (!hasAnyDrift) {
  process.stdout.write("# catalog-liveness\n\nAll entries clean.\n\n");
  process.stdout.write(renderImageReport(imageProbe));
  process.exit(0);
}

process.stdout.write("# catalog-liveness — drift report\n\n");

if (reports.length > 0) {
  process.stdout.write(`## registry / repo drift\n\n`);
  process.stdout.write(`Probed ${entries.length} entries; ${reports.length} have drift.\n\n`);
  for (const r of reports) {
    process.stdout.write(`### \`${r.slug}\`\n\n`);
    for (const line of r.drift) process.stdout.write(`- ${line}\n`);
    process.stdout.write("\n");
  }
  process.stdout.write("---\n_Update with `node bin/statuslines.js audit <slug>` to refresh pins, or quarantine via `security.quarantined: true` + reason._\n\n");
}

process.stdout.write(renderImageReport(imageProbe));

// Exit 0 unless every single image URL failed (pure network-down state)
if (
  imageProbe.probed > 0 &&
  imgGroups.dead.length === imageProbe.probed &&
  imgGroups.ok.length === 0 &&
  imgGroups.og_stable.length === 0 &&
  imgGroups.wrong_content_type.length === 0 &&
  imgGroups.redirected.length === 0
) {
  process.stderr.write("ERROR: every image URL failed — likely network-down state\n");
  process.exit(1);
}
