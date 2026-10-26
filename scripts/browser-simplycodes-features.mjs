import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

// Exercise SaaSFolio's search and coupon improvements without opening a store,
// submitting a form, installing an extension or claiming checkout verification.
// Usage: node scripts/browser-simplycodes-features.mjs http://127.0.0.1:3210
const origin = (process.argv[2] || "http://127.0.0.1:3210").replace(/\/$/, "");
const { getAllDeals } = loadCatalogModule("lib/data/deals-data.ts");
const coupon = getAllDeals().find(deal => deal.toolSlug === "hostinger" && deal.code);
assert.ok(coupon?.sourceUrl && coupon.checkedAt, "This feature smoke needs a current sourced Hostinger code; refresh or explicitly update its fixture before running.");
const profile = await mkdtemp(join(tmpdir(), "saasfolio-feature-browser-"));
const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "about:blank",
], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
let sequence = 0, buffer = "";
const pending = new Map();
const runtimeErrors = [];
const writeRequests = [];
chrome.stdio[4].on("data", chunk => {
  buffer += chunk.toString();
  let boundary;
  while ((boundary = buffer.indexOf("\0")) >= 0) {
    const message = JSON.parse(buffer.slice(0, boundary));
    buffer = buffer.slice(boundary + 1);
    if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === "Network.requestWillBeSent") {
      const request = message.params.request;
      if (request.url.startsWith(`${origin}/`) && !["GET", "HEAD", "OPTIONS"].includes(request.method)) writeRequests.push({ method: request.method, url: request.url });
    }
    if (!message.id || !pending.has(message.id)) continue;
    const { resolve, reject, timer } = pending.get(message.id);
    pending.delete(message.id); clearTimeout(timer);
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
async function until(check, description) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const value = await check();
    if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Browser condition failed: ${description}`);
}
try {
  await send("Browser.getVersion");
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  const evaluate = async expression => {
    const result = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await page("Page.enable"); await page("Runtime.enable"); await page("Network.enable");
  await page("Network.setBlockedURLs", { urls: ["https://*"] });
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await page("Page.addScriptToEvaluateOnNewDocument", { source: "window.open = () => { throw new Error('Popup API disabled for smoke test'); }; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) } });" });

  const searchDialog = '[role="dialog"][aria-label="Search SaaSFolio"]';
  const searchInput = `${searchDialog} input[aria-label="Search brands, discounts and offers"]`;
  const evidenceSelector = `[data-offer-evidence=${JSON.stringify(coupon.slug)}]`;
  let viewportWidth = 390;
  async function navigate(path) {
    await page("Page.navigate", { url: `${origin}${path}` });
    await until(() => evaluate(`location.href === ${JSON.stringify(`${origin}${path}`)} && document.readyState === 'complete'`), path);
  }
  async function assertWidth(description, dialogSelector) {
    const dimensions = await evaluate(`({ page: document.documentElement.scrollWidth, dialog: ${dialogSelector ? `document.querySelector(${JSON.stringify(dialogSelector)})?.getBoundingClientRect().width` : "null"} })`);
    assert.ok(dimensions.page <= viewportWidth, `${description}: document ${dimensions.page}px fits actual ${viewportWidth}px device`);
    if (dialogSelector) assert.ok(dimensions.dialog > 0 && dimensions.dialog <= viewportWidth, `${description}: dialog fits the device`);
  }
  async function clickTarget(expression, description) {
    await until(() => evaluate(`(() => { const element = ${expression}; return !!element && Object.keys(element).some(key => key.startsWith('__reactProps')); })()`), `Hydrated ${description}`);
    await evaluate(`(${expression}).scrollIntoView({ block: 'center', behavior: 'instant' })`);
    let previous, stable = 0;
    await until(async () => {
      const rect = await evaluate(`(() => { const rect = (${expression}).getClientRects()[0]; return [rect.x, rect.y, rect.width, rect.height]; })()`);
      stable = JSON.stringify(previous) === JSON.stringify(rect) ? stable + 1 : 0;
      previous = rect;
      return stable >= 2;
    }, `Stable ${description}`);
    const point = await evaluate(`(() => { const rect = (${expression}).getClientRects()[0]; return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }; })()`);
    await until(() => evaluate(`(${expression}).contains(document.elementFromPoint(${point.x}, ${point.y}))`), `${description} receives pointer input`);
    await page("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
    await page("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
    await page("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
  }
  const click = selector => clickTarget(`document.querySelector(${JSON.stringify(selector)})`, selector);
  async function enterText(selector, value) {
    await until(() => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); return !!input && Object.keys(input).some(key => key.startsWith('__reactProps')); })()`), `Hydrated input ${selector}`);
    await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); input.focus(); input.select(); })()`);
    await page("Input.insertText", { text: value });
    await until(() => evaluate(`document.querySelector(${JSON.stringify(selector)}).value === ${JSON.stringify(value)}`), `Input contains ${value}`);
  }
  async function press(key, code, keyCode) {
    await page("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
    await page("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  }
  async function openHomeSearch(mobile) {
    await navigate("/");
    await click(mobile ? 'button[aria-label="Open search"]' : 'button[aria-label="Search deals and tools"]');
    await until(() => evaluate(`!!document.querySelector(${JSON.stringify(searchInput)})`), "Actual home search dialog");
  }
  async function screenshot(name) {
    const result = await page("Page.captureScreenshot", { format: "png" });
    const path = join(tmpdir(), name);
    await writeFile(path, Buffer.from(result.data, "base64"));
    console.log(`Screenshot: ${path}`);
  }
  async function assertEvidence(scope) {
    const details = await evaluate(`(() => {
      const evidence = document.querySelector(${JSON.stringify(`${scope} ${evidenceSelector}`)});
      return evidence ? { text: evidence.textContent, links: [...evidence.querySelectorAll('a')].map(link => ({ href: link.href, target: link.target, rel: link.rel })), dates: [...evidence.querySelectorAll('time')].map(time => time.dateTime) } : null;
    })()`);
    assert.ok(details, `${scope}: shared coupon evidence is rendered`);
    assert.match(details.text, /not checkout tested/);
    assert.ok(details.links.some(link => link.href === new URL(coupon.sourceUrl).toString() && link.target === "_blank" && link.rel.includes("noopener") && link.rel.includes("noreferrer")), `${scope}: direct attributed source opens safely in a new tab`);
    assert.ok(details.dates.includes(new Date(coupon.checkedAt).toISOString()), `${scope}: actual source check date`);
    if (coupon.expiryDate) assert.ok(details.dates.includes(new Date(coupon.expiryDate).toISOString()), `${scope}: actual published expiry`);
    assert.doesNotMatch(details.text, /checkout verified|success rate|\d+% health/i);
  }
  for (const viewport of [{ width: 390, height: 844, mobile: true }, { width: 1440, height: 1000, mobile: false }]) {
    viewportWidth = viewport.width;
    const label = viewport.mobile ? "mobile" : "desktop";
    await page("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1 });
    await openHomeSearch(viewport.mobile);
    await enterText(searchInput, "best discount for Predis");
    await until(() => evaluate(`!!document.querySelector(${JSON.stringify(`${searchDialog} [data-discount-search-results] a[href="/discounts/predis-ai"]`)})`), "Predis discount guide search result");
    assert.ok(await evaluate(`!document.querySelector(${JSON.stringify(searchDialog)}).textContent.includes('No matches found')`), "A matching brand guide never displays a false empty state");
    await assertWidth("Brand search", searchDialog);
    await screenshot(`saasfolio-simplycodes-search-${label}.png`);
    await press("Enter", "Enter", 13);
    await until(() => evaluate("location.pathname === '/discounts/predis-ai' && !document.querySelector('[role=dialog]')"), "Enter navigates to the Predis guide");

    await openHomeSearch(viewport.mobile);
    await enterText(searchInput, "Kit coupon");
    await until(() => evaluate(`!!document.querySelector(${JSON.stringify(`${searchDialog} [data-discount-search-results] a[href="/discounts/convertkit"]`)})`), "Kit alias resolves to ConvertKit");
    await press("Enter", "Enter", 13);
    await until(() => evaluate("location.pathname === '/discounts/convertkit' && !document.querySelector('[role=dialog]')"), "Alias Enter uses the canonical guide");

    await openHomeSearch(viewport.mobile);
    await clickTarget(`[...document.querySelectorAll(${JSON.stringify(`${searchDialog} button`)})].find(button => button.textContent.trim() === 'brands')`, "Brands search filter");
    await enterText(searchInput, "no-such-saas-feature-smoke-91827");
    await until(() => evaluate(`document.querySelector(${JSON.stringify(searchDialog)}).textContent.includes('No matches found')`), "Unknown brand has the correct filtered empty state");
    assert.ok(await evaluate(`!document.querySelector(${JSON.stringify(`${searchDialog} [data-discount-search-results]`)})`), "No irrelevant brand results for an unknown brand");
    await assertWidth("Filtered search empty state", searchDialog);
    await press("Escape", "Escape", 27);

    await navigate("/discounts/hostinger");
    assert.equal(await evaluate("document.querySelector('#coupon-codes code')?.textContent"), coupon.code, "Guide shows the actual reported Hostinger code");
    await assertEvidence("#coupon-codes");
    const tabsBeforeCopy = (await send("Target.getTargets")).targetInfos.length;
    await click('#coupon-codes button[aria-label="Copy coupon code"]');
    await until(() => evaluate("document.querySelector('#coupon-codes').textContent.includes('copy it manually')"), "Guide copy denial provides the manual fallback");
    assert.equal((await send("Target.getTargets")).targetInfos.length, tabsBeforeCopy, "Copying a guide code does not open a tab");
    await assertWidth("Hostinger guide code and evidence");
    await evaluate("document.querySelector('#coupon-codes').scrollIntoView({ block: 'start', behavior: 'instant' })");
    await screenshot(`saasfolio-simplycodes-coupon-guide-${label}.png`);

    await navigate("/tools/hostinger");
    await click('button[aria-label="View Hostinger coupon code"]');
    const couponDialog = '[role="dialog"][aria-label="Hostinger offer details"]';
    await until(() => evaluate(`!!document.querySelector(${JSON.stringify(`${couponDialog} code`)})`), "Tool profile opens the real coupon dialog");
    await assertEvidence(couponDialog);
    const outbound = await evaluate(`(() => { const dialog = document.querySelector(${JSON.stringify(couponDialog)}); const provider = dialog.querySelector('a[href^="/go/"]'); const details = dialog.querySelector('a[href=${JSON.stringify(`/deals/${coupon.slug}`)}]'); return { provider: provider ? { href: provider.getAttribute('href'), target: provider.target, rel: provider.rel } : null, details: details?.textContent, code: dialog.querySelector('code')?.textContent }; })()`);
    assert.equal(outbound.code, coupon.code);
    assert.equal(outbound.provider?.href, `/go/${coupon.slug}`);
    assert.equal(outbound.provider?.target, "_blank", "Provider action explicitly uses a new tab");
    assert.ok(outbound.provider.rel.includes("noopener") && outbound.provider.rel.includes("noreferrer"));
    assert.match(outbound.details, /redemption steps/);
    await assertWidth("Coupon evidence dialog", couponDialog);
    await screenshot(`saasfolio-simplycodes-coupon-evidence-${label}.png`);
    await press("Escape", "Escape", 27);

    await navigate("/submit");
    const submissionCopy = await evaluate("document.querySelector('main').textContent");
    assert.match(submissionCopy, /does not verify that it works at checkout/);
    assert.doesNotMatch(submissionCopy, /automated verification system tests|audits checkout endpoints|\d+%\s*Confidence/i);
    console.log(`Passed ${viewport.width}px: actual home search, discount intent and alias navigation, filtered empty state, guide copy fallback, source evidence, safe new-tab targets and honest anonymous submission copy.`);
  }
  assert.deepEqual(runtimeErrors, [], "No uncaught browser exceptions");
  assert.deepEqual(writeRequests, [], "Feature smoke performs no form submissions or authenticated writes");
  console.log("SaaSFolio coupon-feature Chrome smoke passed at 390px and 1440px. Search and evidence screenshots saved. No external offer, checkout, signup, submission or account write was opened or sent.");
} finally {
  for (const entry of pending.values()) clearTimeout(entry.timer);
  chrome.kill();
  await new Promise(resolve => chrome.once("exit", resolve));
  await rm(profile, { recursive: true, force: true });
}
