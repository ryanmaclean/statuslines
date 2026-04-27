import { execFileSync } from "node:child_process";

function run(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 500,
    }).trim();
  } catch {
    return null;
  }
}

export function gitBranch(cwd) {
  return run(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
}

export function gitDirty(cwd) {
  const out = run(["status", "--porcelain"], cwd);
  if (out == null) return null;
  return out.length > 0;
}
