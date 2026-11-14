import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openChromePage } from "./lib/chrome-page.mjs";

const origin = process.argv[2] || "http://127.0.0.1:3245";
const browser = await openChromePage(origin);
const { page, evaluate, until } = browser;
const visits = [];
async function visit(path) {
  await page("Page.navigate", { url: `${origin}${path}` });
  await until(() => evaluate(`location.pathname === ${JSON.stringify(new URL(path, origin).pathname)} && document.readyState === 'complete' && !!document.querySelector('main h1')`), path);
  await until(() => evaluate("!!document.querySelector('main') && [...document.querySelectorAll('script[src]')].every(s=>s.src)"), "scripts");
}
async function type(id, value) {
  await evaluate(`(() => { const input = document.getElementById(${JSON.stringify(id)}); const proto = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : input.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input', {bubbles:true})); })()`);
}
try {
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  for (const width of [390, 1440]) {
    await page("Emulation.setDeviceMetricsOverride", { width, height: 950, mobile: width === 390, deviceScaleFactor: 1 });
    for (const path of ["/", "/brands", "/brands?category=hosting", "/brands?q=notion", "/submit", "/articles/hostinger-hosting-review", "/articles/cloudflare-pages-review", "/articles/digitalocean-app-platform-review"]) {
      await visit(path);
      const state = await evaluate(`({ h1: document.querySelector('main h1').textContent, headings: document.querySelectorAll('main h1').length, width: document.documentElement.scrollWidth, canonical: document.querySelector('link[rel=canonical]')?.href, broken: [...document.querySelectorAll('main a[href^="#"]')].map(a=>a.hash.slice(1)).filter(id=>id && !document.getElementById(decodeURIComponent(id))) })`);
      assert.equal(state.headings, 1, path);
      assert.ok(state.width <= width + 1, `${path}: no horizontal overflow at ${width}`);
      assert.deepEqual(state.broken, [], `${path}: valid anchors`);
      if (path === "/brands?category=hosting") {
        assert.equal(await evaluate("document.querySelector('#directory-category').value"), "hosting");
        assert.ok(await evaluate("document.querySelectorAll('[data-brand]').length > 0"));
      }
      if (path === "/brands?q=notion") assert.ok(await evaluate("!!document.querySelector('[data-brand=notion]')"));
      visits.push({ path, width, ...state });
      if (["/", "/submit"].includes(path)) {
        const screenshot = await page("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        await writeFile(join(tmpdir(), `saasfolio-${path === "/" ? "directory" : "submission"}-${width}.png`), Buffer.from(screenshot.data, "base64"));
      }
    }
  }
  await visit("/submit");
  await until(() => evaluate("Object.keys(document.querySelector('#brand-name')).some(key=>key.startsWith('__reactProps'))"), "form hydration");
  await type("brand-name", "Example Studio");
  await type("brand-url", "https://example.com");
  await type("brand-tagline", "A collaborative publishing workspace for small teams planning and reviewing their next website.");
  await type("brand-category", "productivity");
  assert.ok(await evaluate("document.querySelector('aside').innerText.includes('Example Studio') && document.querySelector('aside').innerText.includes('example.com')"), "Preview updates from the form");
  assert.equal(await evaluate("document.querySelector('form[aria-label=\"Add your brand\"]').checkValidity()"), false, "Incomplete submissions are blocked");
  await type("brand-url", "https://www.hostinger.com");
  // Exact existing domains are used, never a broad substring match.
  const links = await evaluate("[...document.querySelectorAll('main a')].filter(a=>a.textContent.includes('View the listing')).map(a=>a.getAttribute('href'))");
  assert.deepEqual(links, ["/tools/hostinger"], "Duplicate detection normalizes the www subdomain");
  visits.push({ interaction: "live preview and required fields", existingDomainMatch: links });
  await page("Emulation.setScriptExecutionDisabled", { value: true });
  for (const path of ["/", "/brands?category=hosting", "/submit"]) {
    await visit(path);
    assert.ok(await evaluate("document.querySelectorAll('main a[href]').length > 0"));
    if (path === "/submit") {
      assert.ok(await evaluate("!!document.querySelector('aside noscript a[href^=\"mailto:\"]')"));
      assert.equal(await evaluate("document.querySelector('main form').checkVisibility({checkVisibilityCSS:true})"), false, "No-JavaScript mode uses the native email alternative");
    }
    visits.push({ path, javascript: false });
  }
  assert.deepEqual(browser.runtimeErrors, []);
  assert.deepEqual(browser.failedAssets, []);
  assert.deepEqual(browser.writes, [], "Production preview never sends an inquiry or email");
  const report = { origin, generatedAt: new Date().toISOString(), visits, runtimeErrors: browser.runtimeErrors, failedAssets: browser.failedAssets, writes: browser.writes };
  await writeFile(`docs/reports/brand-submission-browser-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(report, null, 2) + "\n");
  console.log(`Brand directory browser checks passed: ${visits.length} page and interaction checks.`);
} finally { await browser.close(); }
