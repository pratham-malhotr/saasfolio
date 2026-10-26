import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

// Focused, dependency-free Chrome checks for brand-discount discovery and guides.
// Usage: node scripts/browser-discount-seo-smoke.mjs http://127.0.0.1:3210
// Select additional guide coverage with --only=affine,huly,mymind,fabric.
// The established discovery, coupon and no-JavaScript flows still run.
const args = process.argv.slice(2);
const origins = args.filter(argument => !argument.startsWith("--"));
const onlyArgs = args.filter(argument => argument.startsWith("--only="));
assert.ok(origins.length <= 1 && onlyArgs.length <= 1 && args.every(argument => !argument.startsWith("--") || argument.startsWith("--only=")), "Usage: browser-discount-seo-smoke.mjs [origin] [--only=slug,slug]");
const origin = (origins[0] || "http://127.0.0.1:3210").replace(/\/$/, "");
const defaultGuides = ["beehiiv", "predis-ai", "taplio", "baremetrics", "hostinger"];
const guideSlugs = [...new Set(onlyArgs.length ? onlyArgs[0].slice("--only=".length).split(",").map(slug => slug.trim()) : defaultGuides)];
const { getIndexableDiscountBrands } = loadCatalogModule("lib/brand-discounts.ts");
const indexableGuides = new Set(getIndexableDiscountBrands().map(tool => tool.slug));
assert.ok(guideSlugs.length && guideSlugs.every(slug => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && indexableGuides.has(slug)), `Choose canonical, indexable guide slugs; invalid selection: ${guideSlugs.filter(slug => !indexableGuides.has(slug)).join(", ") || "empty or malformed slug"}`);
const additionalScreenshotSlug = guideSlugs.find(slug => !defaultGuides.includes(slug));
console.log(`Checking ${guideSlugs.length} selected discount guides at 390px and 1440px: ${guideSlugs.join(", ")}. Established discovery flows are also included.`);
const profile = await mkdtemp(join(tmpdir(), "saasfolio-discount-browser-"));
const chrome = spawn(process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "about:blank",
], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
let sequence = 0, buffer = "";
const pending = new Map();
const runtimeErrors = [];
chrome.stdio[4].on("data", chunk => {
  buffer += chunk.toString();
  let boundary;
  while ((boundary = buffer.indexOf("\0")) >= 0) {
    const message = JSON.parse(buffer.slice(0, boundary));
    buffer = buffer.slice(boundary + 1);
    if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
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
  let scriptsDisabled = false;
  let viewportWidth = 390;
  const evaluate = async expression => {
    const result = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await page("Page.enable");
  await page("Runtime.enable");
  await page("Network.enable");
  await page("Network.setBlockedURLs", { urls: ["https://*"] });
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  async function navigate(path) {
    await page("Page.navigate", { url: `${origin}${path}` });
    await until(() => evaluate(`location.href === ${JSON.stringify(`${origin}${path}`)} && document.readyState === 'complete'`), path);
  }
  async function clickLink(selector, destination) {
    if (!scriptsDisabled && !selector.includes('href="#')) {
      await until(() => evaluate(`(() => { const link = document.querySelector(${JSON.stringify(selector)}); return !!link && Object.keys(link).some(key => key.startsWith('__reactProps')); })()`), `Hydrated link: ${selector}`);
    }
    assert.ok(await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), `Link exists: ${selector}`);
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ block: 'center', behavior: 'instant' })`);
    // Hydration and browser scroll anchoring can move an inline link between
    // the first measurement and a native pointer event. Wait for a stable rect.
    let previous, stable = 0;
    await until(async () => {
      const rect = await evaluate(`(() => { const rect = document.querySelector(${JSON.stringify(selector)}).getClientRects()[0]; return [rect.x, rect.y, rect.width, rect.height]; })()`);
      stable = JSON.stringify(rect) === JSON.stringify(previous) ? stable + 1 : 0;
      previous = rect;
      return stable >= 3;
    }, `Stable link geometry: ${selector}`);
    const point = await evaluate(`(() => {
      const link = document.querySelector(${JSON.stringify(selector)});
      const rect = link.getClientRects()[0];
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    })()`);
    assert.ok(await evaluate(`document.querySelector(${JSON.stringify(selector)}).contains(document.elementFromPoint(${point.x}, ${point.y}))`), `Link receives pointer input: ${selector}`);
    await evaluate("window.smokeClickEvents = []; for (const type of ['pointerdown', 'mousedown', 'mouseup', 'click']) document.addEventListener(type, event => window.smokeClickEvents.push({ type, tag: event.target.tagName, href: event.target.closest('a')?.getAttribute('href'), x: event.clientX, y: event.clientY }), { capture: true, once: true })");
    await page("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
    await page("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
    await page("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
    try {
      await until(() => evaluate(`location.pathname + location.hash === ${JSON.stringify(destination)} && document.readyState === 'complete'`), `Native link navigation: ${destination}`);
    } catch (error) {
      const state = await evaluate(`({ href: location.href, ready: document.readyState, heading: document.querySelector('main h1')?.textContent, events: window.smokeClickEvents, viewport: { width: innerWidth, height: innerHeight, scale: visualViewport.scale, scrollY, visualY: visualViewport.offsetTop, documentWidth: document.documentElement.scrollWidth }, link: document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect().toJSON(), hit: document.elementFromPoint(${point.x}, ${point.y})?.outerHTML.slice(0, 200) })`);
      await screenshot("saasfolio-discount-failed-link.png");
      throw new Error(`${error.message}; state=${JSON.stringify(state)}; runtimeErrors=${JSON.stringify(runtimeErrors)}`, { cause: error });
    }
  }
  async function assertGuide(slug) {
    const details = await evaluate(`(() => {
      const summary = document.querySelector('#discount-availability');
      const brokenFragments = [...document.querySelectorAll('main a[href^="#"]')]
        .map(link => link.getAttribute('href')).filter(href => href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1))));
      return { heading: document.querySelector('main h1')?.textContent,
        visible: summary?.checkVisibility({ checkVisibilityCSS: true }),
        states: [...(summary?.querySelectorAll('dt') || [])].map(node => node.textContent),
        brokenFragments, width: document.documentElement.scrollWidth, viewport: innerWidth };
    })()`);
    assert.match(details.heading, /discount/i, `${slug}: heading targets discounts`);
    assert.ok(details.visible, `${slug}: availability summary is visible`);
    assert.equal(details.states.length, 3, `${slug}: codes, provider savings and free access are separate`);
    assert.deepEqual(details.brokenFragments, [], `${slug}: in-page links resolve to rendered sections`);
    assert.ok(details.width <= viewportWidth, `${slug}: page fits ${viewportWidth}px viewport (document width ${details.width}px)`);
  }
  async function assertViewport(path) {
    const width = await evaluate("document.documentElement.scrollWidth");
    // Mobile Chrome can expand innerWidth when content overflows, so compare
    // against the emulated device width rather than that expanded innerWidth.
    assert.ok(width <= viewportWidth, `${path}: page fits ${viewportWidth}px viewport (document width ${width}px)`);
  }
  async function screenshot(name) {
    const result = await page("Page.captureScreenshot", { format: "png" });
    const path = join(tmpdir(), name);
    await writeFile(path, Buffer.from(result.data, "base64"));
    console.log(`Screenshot: ${path}`);
  }
  for (const viewport of [{ width: 390, height: 844, mobile: true }, { width: 1440, height: 1000, mobile: false }]) {
    viewportWidth = viewport.width;
    await page("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1 });
    for (const slug of guideSlugs) {
      await navigate(`/discounts/${slug}`);
      await assertGuide(slug);
      if (slug === additionalScreenshotSlug) {
        await clickLink('a[href="#current-offers"]', `/discounts/${slug}#current-offers`);
        await screenshot(`saasfolio-discount-${slug}-${viewport.mobile ? "mobile" : "desktop"}.png`);
      }
      console.log(`Passed /discounts/${slug} at ${viewport.width}px.`);
    }
    await navigate("/discounts/beehiiv");
    await clickLink('a[href="#current-offers"]', "/discounts/beehiiv#current-offers");
    await screenshot(`saasfolio-discount-${viewport.mobile ? "mobile" : "desktop"}.png`);
    if (await evaluate("!!document.querySelector('#provider-savings')")) {
      await clickLink('#discount-availability a[href="#provider-savings"]', "/discounts/beehiiv#provider-savings");
      assert.ok(await evaluate("document.querySelector('#provider-savings').getBoundingClientRect().top >= 0 && document.querySelector('#provider-savings').getBoundingClientRect().top < innerHeight"), "Provider savings shortcut reaches visible terms");
    } else {
      assert.ok(await evaluate("document.querySelector('#discount-availability').textContent.includes('Check official pricing') && !document.querySelector('#discount-availability a[href=\"#provider-savings\"]')"), "Expired provider savings use official pricing instead of a missing section");
    }
    await navigate("/discounts/hostinger");
    if (await evaluate("!!document.querySelector('#coupon-codes')")) {
      await clickLink('#discount-availability a[href="#coupon-codes"]', "/discounts/hostinger#coupon-codes");
      assert.ok(await evaluate("!!document.querySelector('#coupon-codes code')"), "Coupon shortcut reaches the actual recorded code");
    } else {
      assert.ok(await evaluate("document.querySelector('#discount-availability').textContent.includes('No current code recorded') && !!document.querySelector('#discount-availability a[href=\"#offer-sources\"]')"), "Expired coupon records use the code-research fallback");
    }
    await navigate("/deals/category/marketing");
    await assertViewport("/deals/category/marketing");
    await clickLink('[data-related-discount-guides] a[href="/discounts/beehiiv"]', "/discounts/beehiiv");
    await assertGuide("beehiiv");
    await navigate("/compare/obsidian-vs-notion");
    await assertViewport("/compare/obsidian-vs-notion");
    await clickLink('[data-related-discount-guides] a[href="/discounts/notion"]', "/discounts/notion");
    await assertGuide("notion");
  }
  // Disable scripts before cold loads so these checks exercise the server HTML.
  await page("Emulation.setScriptExecutionDisabled", { value: true });
  scriptsDisabled = true;
  viewportWidth = 390;
  await page("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 });
  for (const [path, selector, destination] of [
    ["/", '[data-home-brands] a[href="/discounts/beehiiv"]', "/discounts/beehiiv"],
    ["/discounts", 'nav[aria-label="Find a brand discount"] a[href="/discounts/taplio"]', "/discounts/taplio"],
    ["/deals/category/marketing", '[data-related-discount-guides] a[href="/discounts/beehiiv"]', "/discounts/beehiiv"],
    ["/compare/obsidian-vs-notion", '[data-related-discount-guides] a[href="/discounts/notion"]', "/discounts/notion"],
    ["/tools/beehiiv", 'nav[aria-label="Beehiiv discount guide shortcuts"] a[href="/discounts/beehiiv#redemption"]', "/discounts/beehiiv#redemption"],
  ]) {
    await navigate(path);
    assert.ok(await evaluate(`document.querySelector(${JSON.stringify(selector)})?.checkVisibility({ checkVisibilityCSS: true })`), `${path}: discovery link is visible without JavaScript`);
    await clickLink(selector, destination);
    await assertGuide(destination.split("/")[2].split("#")[0]);
  }
  assert.deepEqual(runtimeErrors, [], "No uncaught browser exceptions in discount discovery flows");
  console.log(`Discount Chrome smoke passed: ${guideSlugs.length} selected brand guides at 390px/1440px, separate availability states, working fragments, mobile width, category/comparison navigation, screenshots, and cold no-JavaScript discovery links from home, hub, category, comparison and profile. No external offer, signup or checkout was opened.`);
} finally {
  for (const entry of pending.values()) clearTimeout(entry.timer);
  chrome.kill();
  await new Promise(resolve => chrome.once("exit", resolve));
  await rm(profile, { recursive: true, force: true });
}
