import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openChromePage } from "./lib/chrome-page.mjs";

// An isolated development-only store exercises the real form and API without
// sending email or writing any production records. No production fallback exists.
const directory = await mkdtemp(join(tmpdir(), "saasfolio-brand-intake-"));
const origin = "http://127.0.0.1:3246";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", "--hostname", "127.0.0.1", "--port", "3246"], {
  env: { ...process.env, NODE_ENV: "development", NEXT_PUBLIC_SITE_URL: origin, LOCAL_AUTH_ENABLED: "true", LOCAL_AUTH_SECRET: randomBytes(32).toString("hex"), LOCAL_AUTH_DATA_DIR: directory,
    NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", SUPABASE_SERVICE_ROLE_KEY: "" },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
server.stdout.on("data", value => { output += value; });
server.stderr.on("data", value => { output += value; });
let browser;
try {
  const readyBy = Date.now() + 60000;
  while (Date.now() < readyBy) {
    if (server.exitCode !== null) throw new Error(`Development server failed: ${output.slice(-3000)}`);
    try { if ((await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(5000) })).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  console.log("Isolated development server ready; warming the form and intake route.");
  assert.equal((await fetch(`${origin}/submit`, { signal: AbortSignal.timeout(90000) })).status, 200);
  const warmup = await fetch(`${origin}/api/inquiries`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: "{}", signal: AbortSignal.timeout(90000) });
  assert.equal(warmup.status, 400, "An empty warmup request must not save an inquiry");
  console.log("Testing the real browser form and saved receipt.");
  browser = await openChromePage(origin);
  const { page, evaluate, until } = browser;
  await page("Page.navigate", { url: `${origin}/submit` });
  await until(() => evaluate("!!document.querySelector('#brand-name') && Object.keys(document.querySelector('#brand-name')).some(key=>key.startsWith('__reactProps'))"), "submission form hydration");
  async function type(id, value) {
    await until(() => evaluate(`!!document.getElementById(${JSON.stringify(id)})`), `field ${id}`);
    await evaluate(`(() => {const input=document.getElementById(${JSON.stringify(id)});const proto=input.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:input.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
  }
  await type("brand-name", "Intake Test Studio");
  await type("brand-url", "https://example.com");
  await type("brand-tagline", "A collaborative publishing workspace for small teams planning and reviewing their next website.");
  await type("brand-category", "productivity");
  await type("brand-source", "https://example.com/pricing");
  await type("brand-description", "Intake Test Studio helps a small publishing team collect website ideas, assign a reviewer and keep a record of launch decisions. Teams can use a shared project to prepare content and export their work. It requires an internet connection and does not replace the team's hosting provider.");
  await type("brand-features", "Shared editorial planning\nProject review assignments\nExportable launch records");
  await type("brand-contact", "Test Founder");
  await type("brand-email", "test-founder@example.com");
  await type("brand-relationship", "Founder / owner");
  await evaluate("document.querySelector('input[name=consent]').click()");
  assert.ok(await evaluate("document.querySelector('form[aria-label=\"Add your brand\"]').checkValidity()"));
  assert.ok(await evaluate("document.querySelector('button[type=submit]').innerText.includes('Submit brand for review')"), "Development database mode is active");
  await evaluate("document.querySelector('form[aria-label=\"Add your brand\"]').requestSubmit()");
  await until(() => evaluate("!!document.querySelector('#submission-received')"), "saved submission receipt");
  const saved = JSON.parse(await readFile(join(directory, "inquiries.json"), "utf8"));
  // The development store is an envelope to detect torn or malformed writes.
  const rows = Array.isArray(saved) ? saved : saved.rows;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].kind, "submission");
  assert.equal(rows[0].status, "pending");
  assert.equal(rows[0].email, "test-founder@example.com");
  assert.equal(rows[0].payload.toolName, "Intake Test Studio");
  const receiptText = await evaluate("document.querySelector('main').innerText");
  assert.ok(receiptText.includes(rows[0].id));
  await page("Page.reload");
  await until(() => evaluate("!!document.querySelector('#brand-name')"), "reload");
  const retained = JSON.parse(await readFile(join(directory, "inquiries.json"), "utf8"));
  assert.equal((Array.isArray(retained) ? retained : retained.rows)[0].id, rows[0].id);
  assert.deepEqual(browser.runtimeErrors, []);
  const report = { generatedAt: new Date().toISOString(), scope: "Real browser form to real API with isolated development-only persistence; no production writes or email", savedRecords: 1, status: "pending", receiptMatchesStoredId: true, survivesReload: true, runtimeErrors: browser.runtimeErrors };
  await writeFile(`docs/reports/brand-intake-e2e-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(report, null, 2) + "\n");
  console.log("Brand intake passed: real form → API → durable local record → matching receipt; reload retains the saved record.");
} catch (error) { await writeFile("/private/tmp/saasfolio-intake-server.log", output); console.error(output.slice(-2000)); throw error; }
finally {
  if (browser) await browser.close();
  const stopped = new Promise(resolve => server.once("exit", resolve));
  server.kill("SIGTERM");
  if (server.exitCode === null) await stopped;
  await rm(directory, { recursive: true, force: true });
}
