import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Real footer clicks and UI behavior. API writes are intercepted fixtures; no
// email, account, inquiry or newsletter record is created by this browser test.
const origin = (process.argv[2] || "http://127.0.0.1:3227").replace(/\/$/, "");
const reportPath = process.argv.find(value => value.startsWith("--report="))?.slice(9) || `docs/reports/browser-site-pages-${new Date().toISOString().slice(0, 10)}.json`;
const profile = await mkdtemp(join(tmpdir(), "saasfolio-site-pages-"));
const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
let sequence = 0, buffer = "", activeSession, inquiryMode = "error", activeUrl = "about:blank", activeWidth = 0;
let servicesAvailable = true;
const pending = new Map();
const runtimeErrors = [], interceptionErrors = [], mockedWrites = [], failedResources = [], results = [];
chrome.stdio[4].on("data", chunk => {
  buffer += chunk.toString();
  let boundary;
  while ((boundary = buffer.indexOf("\0")) >= 0) {
    const message = JSON.parse(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 1);
    if (message.method === "Page.frameNavigated" && !message.params.frame.parentId) activeUrl = message.params.frame.url;
    if (message.method === "Page.navigatedWithinDocument") activeUrl = message.params.url;
    if (message.method === "Runtime.exceptionThrown") {
      const error = { url: activeUrl, width: activeWidth, description: message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text };
      runtimeErrors.push(error); console.error("Browser runtime exception:", JSON.stringify(error));
    }
    if (message.method === "Fetch.requestPaused") void intercept(message.params).catch(error => interceptionErrors.push(error.message));
    if (message.method === "Network.responseReceived") {
      const { response, type } = message.params;
      if (response.url.startsWith(origin) && response.status >= 400 && ["Document", "Script", "Stylesheet", "Image"].includes(type)) failedResources.push({ url: response.url, status: response.status, type });
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
async function intercept({ requestId, request }) {
  const url = new URL(request.url);
  const reply = (body, responseCode = 200) => send("Fetch.fulfillRequest", { requestId, responseCode, responseHeaders: [{ name: "Content-Type", value: "application/json" }, { name: "Cache-Control", value: "no-store" }], body: Buffer.from(JSON.stringify(body)).toString("base64") }, activeSession);
  if (url.origin !== origin) return send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }, activeSession);
  if (url.pathname.startsWith("/api/")) {
    if (url.pathname === "/api/health") return reply({ checks: { accountsConfigured: false, formsConfigured: servicesAvailable, newsletterConfigured: servicesAvailable } });
    if (url.pathname === "/api/auth/session") return reply({ user: null });
    if (url.pathname === "/api/auth/capabilities") return reply({ available: false, providers: { google: false, apple: false }, recoveryAllowed: false });
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      mockedWrites.push({ path: url.pathname, body: JSON.parse(request.postData || "{}") });
      if (url.pathname === "/api/inquiries") return inquiryMode === "error" ? reply({ error: "UI audit: temporary failure. Please retry." }, 503) : reply({ id: "UI-AUDIT-ONLY", ok: true });
    }
    return reply({ error: "This endpoint is outside this UI fixture." }, 503);
  }
  return send("Fetch.continueRequest", { requestId }, activeSession);
}
async function until(check, description) {
  for (let attempt = 0; attempt < 160; attempt++) {
    const value = await check(); if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Browser condition failed: ${description}`);
}
try {
  await send("Browser.getVersion");
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  activeSession = sessionId;
  const page = (method, params) => send(method, params, sessionId);
  const evaluate = async expression => {
    const result = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await page("Page.enable"); await page("Runtime.enable"); await page("Network.enable");
  const cpuRate = Number(process.env.BROWSER_CPU_RATE || 1);
  assert.ok(Number.isFinite(cpuRate) && cpuRate >= 1 && cpuRate <= 8, "BROWSER_CPU_RATE must be between 1 and 8");
  await page("Emulation.setCPUThrottlingRate", { rate: cpuRate });
  await page("Page.addScriptToEvaluateOnNewDocument", { source: "window.auditClicks=[]; for(const type of ['mousedown','mouseup','click']) document.addEventListener(type,event=>auditClicks.push({type,href:event.target.closest('a')?.getAttribute('href'),y:event.clientY,scrollY}),true);" });
  await page("Fetch.enable", { patterns: [{ urlPattern: `${origin}/api/*` }, { urlPattern: "https://*" }] });
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  async function navigate(path) {
    await page("Page.navigate", { url: `${origin}${path}` });
    await until(() => evaluate(`location.href === ${JSON.stringify(`${origin}${path}`)} && document.readyState === 'complete' && !!document.querySelector('main')`), path);
  }
  async function click(selector) {
    await until(() => evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), selector);
    await evaluate("document.fonts.ready.then(()=>true)");
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    let previous, stable = 0;
    await until(async () => {
      const rect = await evaluate(`(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return [r.x,r.y,r.width,r.height]; })()`);
      stable = JSON.stringify(rect) === JSON.stringify(previous) ? stable + 1 : 0;
      previous = rect;
      return stable >= 2;
    }, `Stable ${selector}`);
    await until(() => evaluate(`(() => { const element=document.querySelector(${JSON.stringify(selector)}); const r=element.getBoundingClientRect(); return r.width>0 && element.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)); })()`), `Clickable ${selector}`);
    const point = await evaluate(`(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
    await page("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
    await page("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
    await page("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
  }
  async function enter(selector, value) {
    await evaluate(`(() => {const input=document.querySelector(${JSON.stringify(selector)}); input.focus(); input.select();})()`);
    await page("Input.insertText", { text: value });
  }
  async function select(selector, value) {
    await evaluate(`(() => {const input=document.querySelector(${JSON.stringify(selector)}); input.value=${JSON.stringify(value)}; input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  }
  async function press(key, code, keyCode, modifiers = 0) {
    const text = modifiers ? undefined : key === "Enter" ? "\r" : key.length === 1 ? key : undefined;
    await page("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode, modifiers, text, unmodifiedText: text });
    await page("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode, modifiers });
  }
  async function layout(width, path) {
    await until(() => evaluate("!!document.querySelector('main h1')"), `${path} primary heading`);
    const state = await evaluate(`({ width:document.documentElement.scrollWidth, heading:document.querySelector('main h1').textContent.trim(), images:[...document.images].filter(image=>image.complete&&!image.naturalWidth).map(image=>image.src) })`);
    assert.ok(state.heading.length, `${path}: nonempty heading`);
    assert.ok(state.width <= width + 1, `${path}: ${state.width}px fits ${width}px viewport`);
    assert.deepEqual(state.images, [], `${path}: no broken images`);
    return state.heading;
  }
  for (const viewport of [{ width: 360, height: 800, mobile: true }, { width: 1440, height: 1000, mobile: false }]) {
    activeWidth = viewport.width;
    await page("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1 });
    await page("Emulation.setTouchEmulationEnabled", { enabled: viewport.mobile });
    await navigate("/");
    const links = await evaluate("[...new Set([...document.querySelectorAll('footer a[href]')].map(link=>link.getAttribute('href')).filter(href=>href.startsWith('/')))]");
    for (const href of links) {
      const html = await (await fetch(new URL(href, origin))).text();
      const expectedTitle = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replaceAll("&amp;", "&").replaceAll("&#x27;", "'");
      await navigate("/");
      await click(`footer a[href=${JSON.stringify(href)}]`);
      const destination = new URL(href, origin);
      try {
        await until(() => evaluate(`location.pathname === ${JSON.stringify(destination.pathname)} && location.search === ${JSON.stringify(destination.search)} && location.hash === ${JSON.stringify(destination.hash)} && document.title === ${JSON.stringify(expectedTitle)} && document.readyState === 'complete'`), `Footer ${href}`);
      } catch (error) {
        console.error({ href, expectedTitle, state: await evaluate("({href:location.href,title:document.title,clicks:window.auditClicks?.slice(-6),main:document.querySelector('main')?.textContent.slice(0,150)})") });
        throw error;
      }
      const heading = await layout(viewport.width, href);
      if (destination.hash) assert.ok(await evaluate(`(() => {const target=document.getElementById(${JSON.stringify(decodeURIComponent(destination.hash.slice(1)))});return !!target&&target.getBoundingClientRect().top>=0&&target.getBoundingClientRect().top<innerHeight;})()`), `${href}: anchor scrolls into view`);
      if (destination.searchParams.has("type")) assert.ok(await evaluate(`document.querySelector('main').textContent.includes(${JSON.stringify(`Type: ${destination.searchParams.get("type")}`)})`), `${href}: requested filter is active`);
      results.push({ width: viewport.width, href, heading });
    }
    // A second footer click on /deals must replace the existing local filter.
    await navigate("/deals?type=lifetime");
    await click('footer a[href="/deals?type=free_trial"]');
    await until(() => evaluate("location.search==='?type=free_trial' && document.querySelector('main').textContent.includes('Type: free_trial') && !document.querySelector('main').textContent.includes('Type: lifetime')"), "Same-page footer filter navigation");

    await navigate("/contact");
    await until(() => evaluate("document.querySelector('#contact-form fieldset')?.disabled === false"), "Available contact form");
    const beforeValidation = mockedWrites.length;
    await evaluate("document.querySelector('#contact-form').requestSubmit()");
    assert.equal(mockedWrites.length, beforeValidation, "Blank contact form cannot submit");
    await enter("#form-name", "UI Audit"); await enter("#form-email", "ui-audit@example.test");
    await enter("#form-message", "This is an intercepted browser fixture for the contact form.");
    inquiryMode = "error";
    await evaluate("document.querySelector('#contact-form').requestSubmit()");
    await until(() => evaluate("document.querySelector('#contact-form [role=alert]')?.textContent.includes('temporary failure')"), "Contact error is visible");
    assert.equal(await evaluate("document.querySelector('#form-name').value"), "UI Audit", "Failed submission preserves input");
    inquiryMode = "success";
    await evaluate("document.querySelector('#contact-form').requestSubmit()");
    await until(() => evaluate("document.querySelector('main').textContent.includes('UI-AUDIT-ONLY')"), "Contact retry has a reference number");
    const faq = 'button[aria-controls="contact-faq-0"]';
    await evaluate(`document.querySelector(${JSON.stringify(faq)}).focus()`);
    await press("Enter", "Enter", 13);
    await until(() => evaluate(`document.querySelector(${JSON.stringify(faq)}).getAttribute('aria-expanded')==='true'`), "FAQ opens with keyboard");
    await press(" ", "Space", 32);
    await until(() => evaluate(`document.querySelector(${JSON.stringify(faq)}).getAttribute('aria-expanded')==='false'`), "FAQ closes with keyboard");

    await navigate("/advertise");
    await until(() => evaluate("document.querySelector('#form-packageSelected')?.disabled === false && !document.querySelector('fieldset').disabled"), "Available partnership form");
    await click('main button[type="button"]');
    assert.equal(await evaluate("document.querySelector('#form-packageSelected').value"), "featured-tool", "Package CTA selects the corresponding form option");
    await enter("#form-companyName", "UI Audit"); await enter("#form-toolUrl", "https://example.test/");
    await enter("#form-contactEmail", "ui-audit@example.test");
    inquiryMode = "success";
    await evaluate("document.querySelector('#partner-inquiry-form form').requestSubmit()");
    await until(() => evaluate("document.querySelector('main').textContent.includes('UI-AUDIT-ONLY')"), "Partnership form confirmation");

    await navigate("/savings-calculator");
    await enter('input[name="monthly"]', "20"); await enter('input[name="annual"]', "200"); await enter('input[name="fee"]', "10");
    await until(() => evaluate("document.querySelector('[data-savings-result]').textContent.includes('$30.00 (12.5%)')"), "Calculator includes access fee");
    await select('select[id$="-currency"]', "INR");
    await until(() => evaluate("document.querySelector('[data-savings-result]').textContent.includes('₹30.00')"), "Currency selector updates calculation formatting");

    await navigate("/compare");
    await until(() => evaluate("Object.keys(document.querySelector('#compare-tool-a')||{}).some(key=>key.startsWith('__reactProps'))"), "Comparison selector hydration");
    await select("#compare-tool-a", "notion"); await select("#compare-tool-b", "notion");
    await evaluate("document.querySelector('main form').requestSubmit()");
    await until(() => evaluate("document.querySelector('#comparison-error')?.textContent.includes('different tools')"), "Same-tool comparison has inline feedback");
    await select("#compare-tool-b", "linear");
    await evaluate("document.querySelector('main form').requestSubmit()");
    await until(() => evaluate("location.pathname==='/compare/notion-vs-linear' && document.querySelector('main h1')?.textContent.toLowerCase().includes('linear')"), "Custom comparison navigation");
    await layout(viewport.width, "/compare/notion-vs-linear");
    await until(() => evaluate("Object.keys(document.querySelector('#comparison-switch-b')||{}).some(key=>key.startsWith('__reactProps'))"), "Comparison switcher hydration");
    await select("#comparison-switch-b", "notion");
    await click('button[aria-label="Compare selected tools"]');
    await until(() => evaluate("document.querySelector('#comparison-switch-error')?.textContent.includes('different tools')"), "Comparison switcher has inline validation");
    await select("#comparison-switch-b", "asana");
    await click('button[aria-label="Compare selected tools"]');
    await until(() => evaluate("location.pathname==='/compare/notion-vs-asana' && document.querySelector('main h1')?.textContent.toLowerCase().includes('asana') && document.querySelector('#comparison-switch-b')?.value==='asana'"), "Comparison switcher navigation refreshes its controls");

    await navigate("/");
    await until(() => evaluate("Object.keys(document.querySelector('button[aria-label=\"Search SaaS discounts and coupon codes\"]')||{}).some(key=>key.startsWith('__reactProps'))"), "Home hydration");
    // A committed button can precede the Navbar's passive effect. Sending
    // Ctrl+K then invokes Chrome's own shortcut on Linux instead of the page.
    await until(async () => {
      const result = await page("Runtime.evaluate", { expression: "(getEventListeners(window).keydown || []).length > 0", includeCommandLineAPI: true, returnByValue: true });
      return result.result.value === true;
    }, "Search keyboard listener ready");
    const scriptsBefore = await evaluate("performance.getEntriesByType('resource').filter(entry=>entry.initiatorType==='script').map(entry=>entry.name)");
    await press("k", "KeyK", 75, 2);
    await until(() => evaluate("!!document.querySelector('[role=dialog] input[aria-label=\"Search brands, discounts and offers\"]')"), "Keyboard shortcut opens lazy search");
    const scriptsAfter = await evaluate("performance.getEntriesByType('resource').filter(entry=>entry.initiatorType==='script').map(entry=>entry.name)");
    assert.ok(scriptsAfter.some(script => !scriptsBefore.includes(script)), "Search code loads on demand after the shortcut");
    await press("Escape", "Escape", 27);
    await until(() => evaluate("!document.querySelector('[role=dialog]') && document.body.style.overflow!=='hidden'"), "Search closes and restores scrolling");

    servicesAvailable = false;
    await navigate("/contact");
    await until(() => evaluate("document.querySelector('main [role=status]')?.textContent.includes('temporarily unavailable')"), "Unavailable forms provide fallback");
    assert.ok(await evaluate("document.querySelector('#contact-form fieldset').disabled && !!document.querySelector('main a[href^=\"mailto:\"]')"), "Unavailable form disables submission and exposes email");
    servicesAvailable = true;
    console.log(`Passed ${viewport.width}px: ${links.length} footer destinations, same-route filters, FAQ keyboard, form validation/error/retry fixtures, package selection, calculator, comparison and lazy keyboard search.`);
  }
  assert.deepEqual(runtimeErrors, [], "No uncaught browser errors");
  assert.deepEqual(interceptionErrors, [], "No interception failures");
  assert.deepEqual(failedResources, [], "No broken page or local resources");
  assert.ok(mockedWrites.every(request => request.path === "/api/inquiries"), "Only the intended form fixtures received writes");
  const report = { checkedAt: new Date().toISOString(), origin, pages: results, mockedFormWrites: mockedWrites.length, runtimeErrors, failedResources, externalSubmissions: 0 };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log("All footer and page interaction checks passed. Form responses were mocked; no external submission was sent.");
} finally {
  try { await send("Browser.close"); } catch { chrome.kill("SIGTERM"); }
  await new Promise(resolve => chrome.exitCode === null ? chrome.once("exit", resolve) : resolve());
  for (let attempt = 0; attempt < 5; attempt++) {
    try { await rm(profile, { recursive: true, force: true }); break; }
    catch (error) { if (attempt === 4) throw error; await new Promise(resolve => setTimeout(resolve, 100)); }
  }
}
