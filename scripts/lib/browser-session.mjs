import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
export async function browserSession() {
  const profile = await mkdtemp(join(tmpdir(), "saasfolio-browser-"));
  const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
  const exited = new Promise(resolve => chrome.once("close", resolve));
  let sequence = 0, buffer = ""; const pending = new Map(), listeners = new Map();
  function send(method, params = {}, sessionId) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Browser timed out: ${method}`)); }, 15000);
      pending.set(id, { resolve, reject, timer }); chrome.stdio[3].write(`${JSON.stringify({ id, method, params, sessionId })}\0`);
    });
  }
  chrome.stdio[4].on("data", chunk => {
    buffer += chunk.toString(); let end;
    while ((end = buffer.indexOf("\0")) >= 0) {
      const message = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
      if (message.method) for (const listener of listeners.get(message.method) || []) listener(message.params);
      const request = pending.get(message.id); if (!request) continue;
      clearTimeout(request.timer); pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result);
    }
  });
  await send("Browser.getVersion");
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  await page("Page.enable"); await page("Runtime.enable");
  return {
    page,
    on(name, listener) { listeners.set(name, [...listeners.get(name) || [], listener]); },
    async evaluate(expression) { const result = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; },
    async close() { try { await send("Browser.close"); } catch { chrome.kill("SIGKILL"); } await exited; for (const request of pending.values()) clearTimeout(request.timer); await rm(profile, { recursive: true, force: true }); },
  };
}
export async function until(check, label) { for (let attempt = 0; attempt < 150; attempt++) { const value = await check(); if (value) return value; await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error(`Browser condition failed: ${label}`); }
