export async function readStdinJson({ timeoutMs = 3000 } = {}) {
  if (process.stdin.isTTY) return null;
  return await new Promise((resolve) => {
    let buf = "";
    let settled = false;
    const finish = (val) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { buf += chunk; });
    process.stdin.on("end", () => {
      clearTimeout(timer);
      if (!buf.trim()) return finish(null);
      try { finish(JSON.parse(buf)); } catch { finish(null); }
    });
    process.stdin.on("error", () => finish(null));
  });
}
