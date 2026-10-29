import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

// A dependency-free Chrome smoke test. Set CHROME_PATH on non-macOS hosts.
const origin = (process.argv[2] || "http://127.0.0.1:3210").replace(/\/$/, "");
const { getAllDeals } = loadCatalogModule("lib/data/deals-data.ts");
const currentCoupons = getAllDeals().filter(deal => deal.code);
const couponBrands = [...new Set(currentCoupons.map(deal => deal.toolSlug))].sort();
const officialCoupons = currentCoupons.filter(deal => deal.sourceKind === "vendor");
const profile = await mkdtemp(join(tmpdir(), "saasfolio-browser-"));
const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
let sequence = 0, buffer = "";
const pending = new Map();
const runtimeErrors = [];
const requestUrls = new Map(), failedRequests = new Set();
chrome.stdio[4].on("data", chunk => {
  buffer += chunk.toString();
  let boundary;
  while ((boundary = buffer.indexOf("\0")) >= 0) {
    const message = JSON.parse(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 1);
    if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === "Network.requestWillBeSent") requestUrls.set(message.params.requestId, message.params.request.url);
    if (message.method === "Network.loadingFailed") failedRequests.add(requestUrls.get(message.params.requestId));
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
    const result = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }).catch(error => {
      throw new Error(`${error.message}: ${expression.slice(0, 160)}`);
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await page("Page.enable"); await page("Runtime.enable");
  await page("Network.enable");
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await page("Network.setBlockedURLs", { urls: ["https://*"] });
  await page("Page.addScriptToEvaluateOnNewDocument", { source: "window.open = () => { throw new Error('Popup API disabled for smoke test'); }; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) } });" });
  await page("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  if (process.env.BROWSER_TOUCH_MODE === "coarse") await page("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  async function navigate(path) {
    await page("Page.navigate", { url: `${origin}${path}` });
    await until(() => evaluate(`location.href === ${JSON.stringify(`${origin}${path}`)} && document.readyState === 'complete'`), path);
  }
  async function auditHomeRefresh() {
    // Measure the first painted content, before hydration, as well as refreshes.
    // Waiting for hydration alone misses the old 80px navigation-placeholder jump.
    const { identifier } = await page("Page.addScriptToEvaluateOnNewDocument", { source: `
      window.homeRefresh = { frames: [], done: false };
      function sampleHome() {
        const heading = document.querySelector('.hero-headline');
        const words = [...document.querySelectorAll('.hero-word')];
        if (heading && words.length) {
          window.homeRefresh.frames.push({ top: heading.getBoundingClientRect().top, time: performance.now(), fontStatus: document.fonts.status, height: heading.getBoundingClientRect().height,
            wordTops: words.map(word => word.getBoundingClientRect().top),
            opacities: words.map(word => Number(getComputedStyle(word).opacity)) });
        }
        if (performance.now() < 3000) requestAnimationFrame(sampleHome);
        else window.homeRefresh.done = true;
      }
      requestAnimationFrame(sampleHome);
    ` });
    await page("Network.setCacheDisabled", { cacheDisabled: true });
    await page("Emulation.setCPUThrottlingRate", { rate: 4 });
    try {
      for (const viewport of [{ width: 390, height: 844, mobile: true }, { width: 1440, height: 1000, mobile: false }]) {
        await page("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1 });
        for (const refresh of [false, true]) {
          const previousOrigin = await evaluate("performance.timeOrigin");
          if (refresh) await page("Page.reload", { ignoreCache: true });
          else await page("Page.navigate", { url: `${origin}/` });
          await until(() => evaluate(`performance.timeOrigin !== ${previousOrigin} && window.homeRefresh?.done && document.readyState === 'complete'`), "cold homepage frame capture");
          const frames = await evaluate("homeRefresh.frames");
          const label = `${viewport.width}px ${refresh ? "hard refresh" : "cold load"}`;
          assert.ok(frames.length >= 3, `${label}: capture content before and after hydration`);
          const range = values => Math.max(...values) - Math.min(...values);
          if (range(frames.map(frame => frame.top)) > 1) {
            const path = join(tmpdir(), `saasfolio-home-refresh-${viewport.width}.json`);
            await writeFile(path, JSON.stringify(frames, null, 2));
            console.error({ label, first: frames[0], last: frames.at(-1), drift: range(frames.map(frame => frame.top)), frames: path });
          }
          assert.ok(range(frames.map(frame => frame.top)) <= 1, `${label}: headline layout stays fixed from its first paint`);
          for (let word = 0; word < frames[0].wordTops.length; word++) {
            assert.ok(range(frames.map(frame => frame.wordTops[word])) <= 1, `${label}: headline words do not drop or slide`);
            for (let frame = 1; frame < frames.length; frame++) assert.ok(frames[frame].opacities[word] >= frames[frame - 1].opacities[word] - 0.01, `${label}: entrance never restarts after hydration`);
          }
        }
      }
    } finally {
      await page("Page.removeScriptToEvaluateOnNewDocument", { identifier });
      await page("Emulation.setCPUThrottlingRate", { rate: 1 });
      await page("Network.setCacheDisabled", { cacheDisabled: false });
      await page("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    }
  }
  async function opensNativeLink(selector) {
    const previous = (await send("Target.getTargets")).targetInfos;
    const before = new Set(previous.map(target => target.targetId));
    assert.ok(await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), selector);
    const newTab = await evaluate(`document.querySelector(${JSON.stringify(selector)}).target === '_blank'`);
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ block: 'center', behavior: 'instant' })`);
    let previousPoint, stable = 0;
    const point = await until(async () => {
      const next = await evaluate(`(() => {
        const link = document.querySelector(${JSON.stringify(selector)});
        const rect = link.getBoundingClientRect();
        const point = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        return { ...point, receivesInput: link.contains(document.elementFromPoint(point.x, point.y)) };
      })()`);
      stable = previousPoint && next.receivesInput && Math.abs(next.x - previousPoint.x) < 0.25 && Math.abs(next.y - previousPoint.y) < 0.25 ? stable + 1 : 0;
      previousPoint = next;
      return stable >= 2 ? { x: next.x, y: next.y } : false;
    }, `stable clickable position: ${selector}`);
    const hit = await evaluate(`(() => { const link = document.querySelector(${JSON.stringify(selector)}); const hit = document.elementFromPoint(${point.x}, ${point.y}); return { receivesInput: link.contains(hit), hit: hit?.outerHTML.slice(0, 200), point: ${JSON.stringify(point)}, width: innerWidth, height: innerHeight, scrollY, url: location.href }; })()`);
    assert.ok(hit.receivesInput, `Link must receive pointer input: ${selector}: ${JSON.stringify(hit)}`);
    await page("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
    await page("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
    const target = await until(async () => (await send("Target.getTargets")).targetInfos.find(target => (newTab ? !before.has(target.targetId) : target.targetId === targetId && target.url !== previous.find(item => item.targetId === targetId).url) && target.type === "page" && target.url !== "about:blank" && target.url), `native navigation for ${selector}`);
    assert.ok(target.url.startsWith(`${origin}/go/`) || target.url.startsWith("https://"), target.url);
    if (newTab) await send("Target.closeTarget", { targetId: target.targetId });
  }
  await auditHomeRefresh();
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
  // Exercise every current official code, including new brand additions. The
  // recorded source and native anchor are checked without following the new
  // provider links. audit:offer-flows verifies their HTTP redirect destinations.
  for (const coupon of officialCoupons) {
    await navigate(`/deals/${coupon.slug}`);
    await until(() => evaluate("Object.keys(document.querySelector('button[aria-label=\"Copy coupon code\"]') || {}).some(key => key.startsWith('__reactProps'))"), `${coupon.slug}: hydrated copy action`);
    assert.equal(await evaluate("document.querySelector('main code').textContent"), coupon.code, `${coupon.slug}: exact source-reported code`);
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(`main a[href="${coupon.sourceUrl}"]`)})?.href`), coupon.sourceUrl, `${coupon.slug}: original provider source`);
    await evaluate("document.querySelector('button[aria-label=\"Copy coupon code\"]').click()");
    await until(() => evaluate("document.querySelector('[role=status]').textContent.includes('copy it manually')"), `${coupon.slug}: denied clipboard fallback`);
    assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"), `${coupon.slug}: mobile coupon fits`);
    assert.ok(await evaluate(`!!document.querySelector(${JSON.stringify(`main a[href="/go/${coupon.slug}"]`)})`), `${coupon.slug}: native provider anchor`);
  }
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
  await until(() => evaluate(`JSON.stringify([...document.querySelectorAll('[data-brand]')].map(node => node.dataset.brand).sort()) === ${JSON.stringify(JSON.stringify(couponBrands))}`), "exactly the brands with current recorded codes");
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
  const health = await (await fetch(`${origin}/api/health`)).json();
  for (const [path, flag] of [["/contact", "formsConfigured"], ["/advertise", "formsConfigured"], ["/login", "accountsConfigured"]]) {
    if (health.checks[flag]) continue;
    await navigate(path);
    await until(() => evaluate("[...document.querySelectorAll('main [role=status]')].some(node => node.textContent.includes('temporarily unavailable'))"), `${path}: unavailable service notice`);
    assert.ok(await evaluate("!!document.querySelector('main fieldset[disabled]') && !!document.querySelector('main a[href^=\"mailto:\"]')"), `${path}: disabled form and email alternative`);
  }
  await navigate("/submit");
  await until(() => evaluate("document.querySelector('main').textContent.includes('AUTHENTICATION REQUIRED')"), "anonymous submission requires authentication");
  assert.ok(await evaluate("!!document.querySelector('main a[href=\"/login?redirect=/submit\"]') && !document.querySelector('main form')"), "anonymous submission has a recoverable sign-in link and cannot expose the contributor form");
  await evaluate("localStorage.setItem('saasfolio_local_threads', '[null,{\"id\":\"bad\"}]'); localStorage.setItem('saasfolio_community_upvotes', 'null')");
  await navigate("/community");
  await until(() => evaluate("document.querySelector('main').textContent.includes('Editorial')"), "editorial prompts survive malformed local storage");
  await evaluate("localStorage.removeItem('saasfolio_local_threads'); localStorage.removeItem('saasfolio_community_upvotes')");
  await navigate("/");
  const motionCapable = await evaluate("matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches");
  await until(() => evaluate(`!!document.querySelector('[data-home-hero] canvas') === ${motionCapable}`), "hero follows the device's pointer and motion capabilities");
  console.log(`Pointer-dependent hero animation: ${motionCapable ? "enabled" : "static fallback for this device"}.`);
  assert.ok(await evaluate(`[...document.querySelectorAll('.hero-word')].every(word => getComputedStyle(word).animationName === ${JSON.stringify(motionCapable ? "hero-word-enter" : "none")})`), "headline animation follows the same pointer and motion condition as its CSS");
  await evaluate("Promise.all([...document.querySelectorAll('.hero-word')].flatMap(word => word.getAnimations()).map(animation => animation.finished.catch(() => {})))");
  assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"), "home hero and compact brand cards fit mobile");
  const mobileHome = await page("Page.captureScreenshot", { format: "png" });
  await writeFile(join(tmpdir(), "saasfolio-home-mobile.png"), Buffer.from(mobileHome.data, "base64"));
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await until(() => evaluate("!document.querySelector('[data-home-hero] canvas') && !document.documentElement.classList.contains('lenis')"), "live reduced-motion preference removes canvas and smooth scrolling");
  assert.ok(await evaluate("[...document.querySelectorAll('.hero-word')].every(word => getComputedStyle(word).animationName === 'none')"), "headline respects reduced motion");
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  // Start a fresh navigation with JavaScript disabled, before any hydration.
  await page("Emulation.setScriptExecutionDisabled", { value: true });
  await navigate("/");
  assert.ok(await evaluate("document.querySelector('main h1')?.checkVisibility({ checkVisibilityCSS: true }) && document.querySelector('[data-home-brands] a')?.checkVisibility({ checkVisibilityCSS: true })"), "cold no-JavaScript navigation exposes the real homepage and brand links");
  await navigate("/deals/hostinger-couponspage-code");
  await opensNativeLink('a[href="/go/hostinger-couponspage-code"]');
  await page("Emulation.setScriptExecutionDisabled", { value: false });
  await page("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate("/");
  await evaluate("Promise.all([...document.querySelectorAll('.hero-word')].flatMap(word => word.getAnimations()).map(animation => animation.finished.catch(() => {})))");
  const desktopHome = await page("Page.captureScreenshot", { format: "png" });
  await writeFile(join(tmpdir(), "saasfolio-home-desktop.png"), Buffer.from(desktopHome.data, "base64"));
  await navigate("/discounts/beehiiv");
  await until(() => evaluate("document.querySelector('#offer-sources').getBoundingClientRect().width > 0"), "rendered source comparison");
  assert.ok(await evaluate("document.querySelector('#offer-sources').textContent.includes('Paid membership required')"), "membership gate shown before following a source");
  await evaluate("document.querySelector('#offer-sources').scrollIntoView({ block: 'start', behavior: 'instant' })");
  const sourcesScreenshot = await page("Page.captureScreenshot", { format: "png" });
  await writeFile(join(tmpdir(), "saasfolio-sources-desktop.png"), Buffer.from(sourcesScreenshot.data, "base64"));
  // Simulate an unavailable optional animation asset on a cold desktop visit.
  // Locate the emitted library by its version marker rather than a build hash.
  const chunks = new URL("../.next/static/chunks/", import.meta.url);
  const chunkFiles = (await readdir(chunks)).filter(name => name.endsWith(".js"));
  const animationAssets = (await Promise.all(chunkFiles.map(async name => (await readFile(new URL(name, chunks), "utf8")).includes("lenisVersion") ? name : null))).filter(Boolean);
  assert.equal(animationAssets.length, 1, "One optional scroll library asset is emitted");
  const blockedAnimation = `${origin}/_next/static/chunks/${animationAssets[0]}`;
  failedRequests.clear();
  await page("Network.setCacheDisabled", { cacheDisabled: true });
  await page("Network.setBlockedURLs", { urls: ["https://*", blockedAnimation] });
  await navigate("/");
  const scrollCapable = await evaluate("matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches");
  if (scrollCapable) await until(async () => failedRequests.has(blockedAnimation), "optional scroll asset is deliberately blocked");
  else assert.equal(failedRequests.has(blockedAnimation), false, "Devices without a fine hover pointer do not request the optional scroll asset");
  assert.ok(await evaluate("!document.documentElement.classList.contains('lenis')"), "failed enhancement leaves native scrolling enabled");
  await evaluate("window.scrollTo({ top: 400, behavior: 'instant' })");
  await until(() => evaluate("window.scrollY >= 350"), "native scrolling works without the optional asset");
  await navigate("/discounts/wpforms");
  assert.ok(await evaluate("document.querySelector('main h1').textContent.includes('WPForms')"), "brand navigation works after optional asset failure");
  assert.deepEqual(runtimeErrors, [], "No uncaught browser exceptions across the audited flows");
  console.log(`Chrome smoke passed: stable cold loads and hard refreshes on mobile/desktop with 4x CPU throttling, ${officialCoupons.length} official coupon copy/source checks, native redirects, denied clipboard, exact current coupon-brand filtering, mobile search and savings, unavailable service forms, malformed local storage, capability-dependent hero animation, live reduced motion, cold no-JavaScript content and coupon navigation, membership disclosures, and native scrolling with the optional asset ${scrollCapable ? "blocked" : "unrequested for this device"}. No reports submitted or checkout attempted.`);
} finally {
  for (const entry of pending.values()) clearTimeout(entry.timer);
  chrome.kill();
  await new Promise(resolve => chrome.once("exit", resolve));
  await rm(profile, { recursive: true, force: true });
}
