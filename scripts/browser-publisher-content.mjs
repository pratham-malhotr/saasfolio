import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { openChromePage } from "./lib/chrome-page.mjs";

const origin = (process.argv[2] || "http://127.0.0.1:3245").replace(/\/$/, "");
const reportPath = process.argv.find(value => value.startsWith("--report="))?.slice(9) || `docs/reports/browser-publisher-content-${new Date().toISOString().slice(0, 10)}.json`;
const browser = await openChromePage(origin);
const { page, evaluate, until } = browser;
const visits = [];
async function navigate(path) {
  await page("Page.navigate", { url: `${origin}${path}` });
  await until(() => evaluate(`location.pathname === ${JSON.stringify(new URL(path, origin).pathname)} && location.search === ${JSON.stringify(new URL(path, origin).search)} && document.readyState === 'complete' && !!document.querySelector('main h1')`), path);
}
try {
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  for (const width of [390, 1440]) {
    await page("Emulation.setDeviceMetricsOverride", { width, height: 900, mobile: width === 390, deviceScaleFactor: 1 });
    for (const path of ["/", "/editorial-policy", "/tools", "/tools?page=2", "/tools/notion", "/compare/obsidian-vs-notion", "/articles/build-a-saas-budget-before-buying", "/tools/cogniflow-ai"]) {
      await navigate(path);
      const state = await evaluate(`(() => {const main=document.querySelector('main');return {title:document.title,heading:main.querySelector('h1').textContent,headingVisible:main.querySelector('h1').checkVisibility({checkVisibilityCSS:true}),width:document.documentElement.scrollWidth,headings:main.querySelectorAll('h1').length,text:main.innerText,canonical:document.querySelector('link[rel=canonical]')?.href,brokenFragments:[...main.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(decodeURIComponent(h.slice(1))))};})()`);
      assert.equal(state.headings, 1, `${path}: one primary heading`);
      assert.ok(state.headingVisible, `${path}: visible heading`);
      assert.ok(state.width <= width + 1, `${path}: fits ${width}px`);
      assert.deepEqual(state.brokenFragments, [], `${path}: article navigation is complete`);
      assert.doesNotMatch(state.text, /SaaSFolio Studio AI Voice Engine|Verified Engineer|Verified Reader|Over 2,400 engineering teams/);
      if (path === "/compare/obsidian-vs-notion") assert.ok(state.text.includes("A practical evaluation to run"));
      if (path === "/articles/build-a-saas-budget-before-buying") assert.ok(state.text.includes("$832") && state.text.includes("Make a decision record you can reuse"));
      visits.push({ path, width, javascript: true, heading: state.heading, canonical: state.canonical });
      if (width === 390 && ["/", "/compare/obsidian-vs-notion"].includes(path)) {
        const shot = await page("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        await writeFile(join(tmpdir(), `saasfolio-publisher-${path === "/" ? "home" : "comparison"}.png`), Buffer.from(shot.data, "base64"));
      }
    }
  }
  await navigate("/tools");
  await until(() => evaluate("Object.keys(document.querySelector('#software-search')).some(key=>key.startsWith('__reactProps'))"), "Software search hydration");
  await evaluate(`(() => {const input=document.querySelector('#software-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'notion');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await until(() => evaluate("document.querySelector('[role=status]').textContent.includes('of 1 software profiles')"), "Published software search finds Notion across all pages");
  assert.ok(await evaluate("!!document.querySelector('main a[href=\"/tools/notion\"]')"));

  await page("Emulation.setScriptExecutionDisabled", { value: true });
  for (const path of ["/", "/tools?page=2", "/editorial-policy", "/compare/pocketbase-vs-supabase", "/articles/saas-coupon-renewal-price-checklist"]) {
    await navigate(path);
    const state = await evaluate("({heading:document.querySelector('main h1').textContent,visible:document.querySelector('main h1').checkVisibility({checkVisibilityCSS:true}),links:document.querySelectorAll('main a[href]').length})");
    assert.ok(state.visible && state.links, `${path}: substantive content and native links without JavaScript`);
    visits.push({ path, width: 1440, javascript: false, heading: state.heading });
  }
  assert.deepEqual(browser.runtimeErrors, [], "No browser exceptions");
  assert.deepEqual(browser.failedAssets, [], "No failed local page, script, stylesheet or image requests");
  assert.deepEqual(browser.writes, [], "No forms or account writes were submitted");
  const report = { generatedAt: new Date().toISOString(), origin, scope: "Production build in Chrome at 390 and 1440 pixels; JavaScript and no-JavaScript visits; external HTTPS/measurement blocked; no form submissions", visits, runtimeErrors: browser.runtimeErrors, failedAssets: browser.failedAssets, writes: browser.writes };
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
  console.log(`Publisher browser checks passed: ${visits.length} page/viewport/script combinations, search, pagination, decision exercises and no provider or analytics writes. Report: ${reportPath}`);
} finally { await browser.close(); }
