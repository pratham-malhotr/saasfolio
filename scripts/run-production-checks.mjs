import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { appendFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.env.AUDIT_PORT || 3238);
assert.ok(Number.isInteger(port) && port >= 1024 && port <= 65535, "AUDIT_PORT must be an unprivileged port");
const origin = `http://127.0.0.1:${port}`;
const log = join(tmpdir(), "saasfolio-production-checks.log");
const checks = ["audit-seo", "audit-brand-seo", "audit-offer-flows", "http-reliability-smoke", "browser-site-pages", "browser-offer-smoke", "browser-auth-smoke", "browser-privacy-smoke"];
const selected = process.argv.find(value => value.startsWith("--only="))?.slice(7).split(",") || checks;
assert.ok(selected.length && selected.every(script => checks.includes(script)), "--only must name existing production checks");
const env = { ...process.env };
if (!env.CHROME_PATH) {
  for (const path of ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]) {
    try { await access(path); env.CHROME_PATH = path; break; } catch { /* try the next installed browser */ }
  }
}
assert.ok(env.CHROME_PATH, "Install Chrome or configure CHROME_PATH before running browser checks");
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { env, stdio: ["ignore", "pipe", "pipe"] });
for (const stream of [server.stdout, server.stderr]) stream.on("data", chunk => { void appendFile(log, chunk); });
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([new Promise(resolve => server.once("exit", resolve)), delay(5000)]);
  if (server.exitCode === null) server.kill("SIGKILL");
}
process.once("SIGINT", () => { void stop(); });
process.once("SIGTERM", () => { void stop(); });
async function run(script) {
  console.log(`Running ${script}`);
  const child = spawn(process.execPath, [`scripts/${script}.mjs`, origin], { env, stdio: "inherit" });
  const code = await new Promise((resolve, reject) => { child.once("error", reject); child.once("exit", resolve); });
  assert.equal(code, 0, `${script} failed`);
}
try {
  let available = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    assert.equal(server.exitCode, null, "Production preview stopped before becoming ready; inspect the log");
    try { available = (await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(2000) })).ok; } catch { /* starting */ }
    if (available) break;
    await delay(200);
  }
  assert.ok(available, "Production preview did not become available");
  for (const script of selected) await run(script);
  console.log("Production build checks passed.");
} finally { await stop(); }
