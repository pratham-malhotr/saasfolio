import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function openChromePage(origin) {
  const profile = await mkdtemp(join(tmpdir(), "saasfolio-seo-browser-"));
  const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
  let sequence = 0, buffer = "";
  const pending = new Map(), runtimeErrors = [], failedAssets = [], writes = [];
  chrome.stdio[4].on("data", chunk => {
    buffer += chunk.toString();
    let boundary;
    while ((boundary = buffer.indexOf("\0")) >= 0) {
      const message = JSON.parse(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 1);
      if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (message.method === "Network.responseReceived") {
        const { response, type } = message.params;
        if (response.url.startsWith(origin) && response.status >= 400 && ["Script", "Stylesheet", "Image", "Document"].includes(type)) failedAssets.push({ url: response.url, status: response.status });
      }
      if (message.method === "Network.requestWillBeSent") {
        const { request } = message.params;
        if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && request.url.startsWith(origin)) writes.push({ url: request.url, method: request.method });
      }
      if (!message.id || !pending.has(message.id)) continue;
      const { resolve, reject, timer } = pending.get(message.id); pending.delete(message.id); clearTimeout(timer);
      if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
    }
  });
  function send(method, params = {}, sessionId) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome timed out: ${method}`)); }, 30000);
      pending.set(id, { resolve, reject, timer });
      chrome.stdio[3].write(`${JSON.stringify({ id, method, params, sessionId })}\0`);
    });
  }
  async function close() {
    try { await send("Browser.close"); } catch { chrome.kill("SIGTERM"); }
    await new Promise(resolve => chrome.exitCode === null ? chrome.once("exit", resolve) : resolve());
    for (let attempt = 0; attempt < 5; attempt++) {
      try { await rm(profile, { recursive: true, force: true }); break; }
      catch (error) { if (attempt === 4) throw error; await new Promise(resolve => setTimeout(resolve, 100)); }
    }
  }
  try {
    await send("Browser.getVersion");
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    const page = (method, params) => send(method, params, sessionId);
    const evaluate = async expression => {
      const result = await page("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    };
    const until = async (check, description) => {
      for (let attempt = 0; attempt < 160; attempt++) { const value = await check(); if (value) return value; await new Promise(resolve => setTimeout(resolve, 100)); }
      throw new Error(`Browser condition failed: ${description}`);
    };
    await page("Page.enable"); await page("Runtime.enable"); await page("Network.enable");
    await page("Network.setBlockedURLs", { urls: ["https://*"] });
    return { page, evaluate, until, close, runtimeErrors, failedAssets, writes };
  } catch (error) { await close(); throw error; }
}
