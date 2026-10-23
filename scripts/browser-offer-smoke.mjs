import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// A dependency-free Chrome smoke test. Set CHROME_PATH on non-macOS hosts.
const origin = (process.argv[2] || "http://127.0.0.1:3210").replace(/\/$/, "");
const profile = await mkdtemp(join(tmpdir(), "saasfolio-browser-"));
const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
let sequence = 0, buffer = "";
const pending = new Map();
chrome.stdio[4].on("data", chunk => {
  buffer += chunk.toString();
  let boundary;
  while ((boundary = buffer.indexOf("\0")) >= 0) {
    const message = JSON.parse(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 1);
    if (!message.id || !pending.has(message.id)) continue;
    const { resolve, reject, timer } = pending.get(message.id); pending.delete(message.id); clearTimeout(timer);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  }
});
function send(method, params = {}, sessionId) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer });
    chrome.stdio[3].write(`${JSON.stringify({ id, method, params, sessionId })}\0`);
  });
}
const pause = () => new Promise(resolve => setTimeout(resolve, 100));
async function until(check, description) {
  for (let attempt = 0; attempt < 100; attempt++) { const value = await check(); if (value) return value; await pause(); }
  throw new Error(`Browser condition failed: ${description}`);
}
try {
  await send("Browser.getVersion");
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  const evaluate = async expression => {
    const result = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await page("Page.enable"); await page("Runtime.enable");
  await page("Network.enable");
  await page("Network.setBlockedURLs", { urls: ["https://*"] });
  await page("Page.addScriptToEvaluateOnNewDocument", { source: "window.open = () => { throw new Error('Popup API disabled for smoke test'); }; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) } });" });
  await page("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  async function navigate(path) {
    await page("Page.navigate", { url: `${origin}${path}` });
    await until(() => evaluate(`location.href === ${JSON.stringify(`${origin}${path}`)} && document.readyState === 'complete'`), path);
  }
  async function opensNativeLink(selector) {
    const previous = (await send("Target.getTargets")).targetInfos;
    const before = new Set(previous.map(target => target.targetId));
    assert.ok(await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), selector);
    const newTab = await evaluate(`document.querySelector(${JSON.stringify(selector)}).target === '_blank'`);
    const point = await evaluate(`(() => { const link = document.querySelector(${JSON.stringify(selector)}); link.scrollIntoView({ block: 'center', behavior: 'instant' }); const rect = link.getBoundingClientRect(); return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }; })()`);
    const hit = await evaluate(`(() => { const link = document.querySelector(${JSON.stringify(selector)}); const hit = document.elementFromPoint(${point.x}, ${point.y}); return { receivesInput: link.contains(hit), hit: hit?.outerHTML.slice(0, 200), point: ${JSON.stringify(point)}, width: innerWidth, height: innerHeight, scrollY, url: location.href }; })()`);
    assert.ok(hit.receivesInput, `Link must receive pointer input: ${selector}: ${JSON.stringify(hit)}`);
    await page("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
    await page("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
    const target = await until(async () => (await send("Target.getTargets")).targetInfos.find(target => (newTab ? !before.has(target.targetId) : target.targetId === targetId && target.url !== previous.find(item => item.targetId === targetId).url) && target.type === "page" && target.url !== "about:blank" && target.url), `native navigation for ${selector}`);
    assert.ok(target.url.startsWith(`${origin}/go/`) || target.url.startsWith("https://"), target.url);
    if (newTab) await send("Target.closeTarget", { targetId: target.targetId });
  }
  await navigate("/tools/hostinger");
  // Wait for the production client bundle to hydrate before invoking its handler.
  await until(() => evaluate("[...document.querySelectorAll('button')].some(button => Object.keys(button).some(key => key.startsWith('__reactProps')) && button.getAttribute('aria-label') === 'View Hostinger coupon code')"), "hydrated coupon action");
  await evaluate("document.querySelector('button[aria-label=\"View Hostinger coupon code\"]').click()");
  await until(() => evaluate("!!document.querySelector('[role=dialog] code')"), "coupon dialog");
  assert.equal(await evaluate("document.querySelector('[role=dialog] code').textContent"), "COUPONSPAGE");
  const tabsBeforeCopy = (await send("Target.getTargets")).targetInfos.length;
  await evaluate("document.querySelector('[role=dialog] button[aria-label=\"Copy coupon code\"]').click()");
  await until(() => evaluate("document.querySelector('[role=dialog]').textContent.includes('copy it manually')"), "clipboard denial fallback");
  assert.equal((await send("Target.getTargets")).targetInfos.length, tabsBeforeCopy, "Copy must not open another tab");
  assert.ok(await evaluate("document.querySelector('[role=dialog]').getBoundingClientRect().width <= innerWidth"), "mobile dialog fits the viewport");
  await opensNativeLink('[role=dialog] a[href="/go/hostinger-couponspage-code"]');
  await navigate("/deals/hostinger-couponspage-code");
  await until(() => evaluate("document.querySelector('a[href=\"/go/hostinger-couponspage-code\"]')?.getBoundingClientRect().width > 0"), "visible coupon action");
  assert.ok(await evaluate("document.body.textContent.includes('COUPONSPAGE')"), "reported code stays visible");
  await page("Emulation.setScriptExecutionDisabled", { value: true });
  await opensNativeLink('a[href="/go/hostinger-couponspage-code"]');
  await page("Emulation.setScriptExecutionDisabled", { value: false });
  await navigate("/tools/beehiiv");
  await until(() => evaluate("document.querySelector('a[href=\"/go/beehiiv-free-plan\"]')?.getBoundingClientRect().width > 0"), "visible free-plan action");
  await page("Emulation.setScriptExecutionDisabled", { value: true });
  await opensNativeLink('a[href="/go/beehiiv-free-plan"]');
  await page("Emulation.setScriptExecutionDisabled", { value: false });
  await navigate("/brands");
  await until(() => evaluate("Object.keys(document.querySelector('#brand-search')).some(key => key.startsWith('__reactProps'))"), "hydrated brand search");
  await evaluate("document.querySelector('#brand-search').focus()");
  await page("Input.insertText", { text: "beehiiv" });
  await until(() => evaluate("document.querySelectorAll('[data-brand]').length === 1 && !!document.querySelector('[data-brand=beehiiv]')"), "brand search results");
  await evaluate("[...document.querySelectorAll('button')].find(button => button.textContent === 'Clear filters').click()");
  await evaluate("const filter = document.querySelector('#brand-kind'); filter.value = 'codes'; filter.dispatchEvent(new Event('change', { bubbles: true }))");
  await until(() => evaluate("document.querySelectorAll('[data-brand]').length === 2 && !!document.querySelector('[data-brand=hostinger]') && !!document.querySelector('[data-brand=namecheap]')"), "only brands with recorded codes");
  assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"), "brand directory fits mobile viewport");
  await navigate("/savings-calculator");
  await until(() => evaluate("Object.keys(document.querySelector('input[name=monthly]')).some(key => key.startsWith('__reactProps'))"), "hydrated cost calculator");
  async function enterQuote(name, value) {
    await evaluate(`(() => { const input = document.querySelector('input[name=${name}]'); input.focus(); input.select(); })()`);
    await page("Input.insertText", { text: value });
  }
  await enterQuote("monthly", "30"); await enterQuote("annual", "300"); await enterQuote("fee", "80");
  await until(() => evaluate("document.querySelector('[data-savings-result]').textContent.includes('$20.00 more')"), "access fee reverses the apparent saving");
  await enterQuote("fee", "0");
  await until(() => evaluate("document.querySelector('[data-savings-result]').textContent.includes('saves $60.00')"), "net annual saving");
  assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"), "calculator fits mobile viewport");
  const screenshot = await page("Page.captureScreenshot", { format: "png" });
  await writeFile(join(tmpdir(), "saasfolio-savings-mobile.png"), Buffer.from(screenshot.data, "base64"));
  await navigate("/contact?offer=hostinger-couponspage-code#contact-form");
  assert.ok(await evaluate("document.querySelector('#form-subject').value.includes('Hostinger') && document.querySelector('#form-message').value.includes('COUPONSPAGE') && document.querySelector('#form-message').value.includes('https://saasfolio.tech/deals/hostinger-couponspage-code')"), "correction form retains the affected offer and code");
  await page("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate("/discounts/beehiiv");
  await until(() => evaluate("document.querySelector('#offer-sources').getBoundingClientRect().width > 0"), "rendered source comparison");
  assert.ok(await evaluate("document.querySelector('#offer-sources').textContent.includes('Paid membership required')"), "membership gate shown before following a source");
  await evaluate("document.querySelector('#offer-sources').scrollIntoView({ block: 'start', behavior: 'instant' })");
  const sourcesScreenshot = await page("Page.captureScreenshot", { format: "png" });
  await writeFile(join(tmpdir(), "saasfolio-sources-desktop.png"), Buffer.from(sourcesScreenshot.data, "base64"));
  console.log("Chrome smoke passed: coupon dialog and native redirects, denied clipboard fallback, mobile brand search and coupon filter, savings including access fees, contextual correction forms, and membership disclosures. No reports submitted or checkout attempted.");
} finally {
  for (const entry of pending.values()) clearTimeout(entry.timer);
  chrome.kill();
  await new Promise(resolve => chrome.once("exit", resolve));
  await rm(profile, { recursive: true, force: true });
}
