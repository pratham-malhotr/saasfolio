import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCatalogModule } from "./lib/load-catalog.mjs";
import { openChromePage } from "./lib/chrome-page.mjs";

const origin = (process.argv.find(value => /^https?:\/\//.test(value)) || "http://127.0.0.1:3238").replace(/\/$/, "");
const { SEARCH_LANDING_TARGETS } = loadCatalogModule("lib/data/search-intent-map.ts");
const browser = await openChromePage(origin);
const { page, evaluate, until } = browser;
const results = [];
try {
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await page("Page.addScriptToEvaluateOnNewDocument", { source: "Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new DOMException('Denied','NotAllowedError'))}});" });
  async function navigate(path) {
    await page("Page.navigate", { url: `${origin}${path}` });
    await until(() => evaluate(`location.pathname===${JSON.stringify(path)} && document.readyState==='complete' && !!document.querySelector('main h1')`), path);
    await evaluate("document.fonts.ready.then(()=>true)");
  }
  for (const viewport of [{ width: 390, height: 844, mobile: true }, { width: 1440, height: 1000, mobile: false }]) {
    await page("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1 });
    await page("Emulation.setTouchEmulationEnabled", { enabled: viewport.mobile });
    for (const target of SEARCH_LANDING_TARGETS) {
      await navigate(target.path);
      const state = await evaluate(`(() => {
        const heading = document.querySelector('main h1');
        const fragments = [...document.querySelectorAll('main a[href^="#"]')].map(link => link.getAttribute('href'));
        const brokenFragments = fragments.filter(href => href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1))));
        return { width: document.documentElement.scrollWidth, mainCount: document.querySelectorAll('main').length,
          heading: heading.getAttribute('aria-label') || heading.textContent.trim(), brokenFragments };
      })()`);
      assert.ok(state.width <= viewport.width + 1, `${target.path}: ${state.width}px fits ${viewport.width}px`);
      assert.equal(state.mainCount, 1, `${target.path}: one main landmark`);
      assert.ok(state.heading.length > 5);
      assert.deepEqual(state.brokenFragments, [], `${target.path}: complete section navigation`);
      if (["/coupon-codes", "/startup-deals", "/student-discounts", "/nonprofit-discounts"].includes(target.path)) {
        assert.ok(await evaluate("[...document.querySelectorAll('main a[href^=\"/go/\"]')].every(link=>link.target==='_blank'&&['sponsored','nofollow','noopener','noreferrer'].every(value=>link.rel.split(' ').includes(value)))"), "Provider links preserve sponsorship and safe new-tab attributes");
        await evaluate("document.querySelector('main details summary').click()");
        assert.equal(await evaluate("document.querySelector('main details').open"), true, "Native FAQ opens");
        if (target.path === "/coupon-codes" && await evaluate("!!document.querySelector('main button[aria-label=\"Copy coupon code\"]')")) {
          await until(() => evaluate("Object.keys(document.querySelector('main button[aria-label=\"Copy coupon code\"]')).some(key=>key.startsWith('__reactProps'))"), "Coupon copy hydration");
          await evaluate("document.querySelector('main button[aria-label=\"Copy coupon code\"]').click()");
          await until(() => evaluate("document.querySelector('main').textContent.includes('copy it manually')"), "Denied clipboard keeps a manual copy path");
        }
        await evaluate("scrollTo({top:0,behavior:'instant'})");
        const shot = await page("Page.captureScreenshot", { format: "png" });
        await writeFile(join(tmpdir(), `saasfolio-${target.path.slice(1)}-${viewport.width}.png`), Buffer.from(shot.data, "base64"));
      }
      results.push({ path: target.path, width: viewport.width, heading: state.heading });
    }
    console.log(`Passed ${viewport.width}px: ${SEARCH_LANDING_TARGETS.length} search landing pages, layout, fragments, FAQ and coupon-copy fallback.`);
  }
  // Cold, script-disabled visits prove that discoverability and eligibility
  // content are present before hydration, including the new article links.
  await page("Emulation.setScriptExecutionDisabled", { value: true });
  for (const path of ["/", "/coupon-codes", "/startup-deals", "/student-discounts", "/nonprofit-discounts", "/deals/category/ai-tools", "/articles/find-and-use-saas-coupon-codes"]) {
    await navigate(path);
    assert.ok(await evaluate("document.querySelector('main h1').checkVisibility({checkVisibilityCSS:true})"), `${path}: visible without JavaScript`);
    assert.ok(await evaluate("document.querySelector('main a[href]')?.checkVisibility({checkVisibilityCSS:true})"), `${path}: crawlable native links without JavaScript`);
  }
  assert.deepEqual(browser.runtimeErrors, [], "No uncaught browser exceptions");
  assert.deepEqual(browser.failedAssets, [], "No broken document, script, stylesheet or image responses");
  assert.deepEqual(browser.writes, [], "The audit never submits a form or changes an account");
  const report = { checkedAt: new Date().toISOString(), origin, pages: results, noJavaScriptVisits: 7, runtimeErrors: browser.runtimeErrors, failedAssets: browser.failedAssets, writes: browser.writes };
  const reportPath = process.argv.find(value => value.startsWith("--report="))?.slice(9) || `docs/reports/browser-seo-landings-${new Date().toISOString().slice(0, 10)}.json`;
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Search landing Chrome audit passed. Report: ${reportPath}. No provider checkout or form submission was opened.`);
} finally { await browser.close(); }
