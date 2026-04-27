#!/usr/bin/env node
import { getEvents, readEventsCacheOnly, paths } from "./lib/events.js";
import { renderPupSegment } from "./lib/render.js";
import { loadConfig } from "./lib/config.js";

const sub = process.argv[2];
if (sub === "fetch") {
  const force = process.argv.includes("--force");
  const r = getEvents({ force });
  process.stdout.write(JSON.stringify(r, null, 2) + "\n");
} else if (sub === "show") {
  const c = readEventsCacheOnly();
  process.stdout.write(renderPupSegment(c) + "\n");
} else if (sub === "config") {
  process.stdout.write(JSON.stringify(loadConfig(), null, 2) + "\n");
} else if (sub === "paths") {
  process.stdout.write(JSON.stringify(paths(), null, 2) + "\n");
} else {
  process.stdout.write(`Usage: node pup/cli.js <fetch|show|config|paths> [--force]\n`);
  process.exit(sub ? 2 : 0);
}
