import assert from "node:assert/strict";
import { openChromePage } from "./lib/chrome-page.mjs";

const origin = (process.argv[2] || "http://127.0.0.1:3227").replace(/\/$/, "");
const { page, evaluate, until, close, runtimeErrors, failedAssets, writes } = await openChromePage(origin, [
  "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl",
]);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const ready = () => until(() => evaluate(`document.querySelector('.folio-frame[data-active="true"] canvas')?.width > 0 && window.folioDraws > 0`), "Painted WebGL scene");
const mode = index => evaluate(`document.querySelectorAll('.folio-views button')[${index}].click()`);

async function viewport(width, height, mobile) {
  await page("Emulation.setTouchEmulationEnabled", { enabled: mobile });
  await page("Emulation.setDeviceMetricsOverride", { width, height, mobile, deviceScaleFactor: mobile ? 3 : 1 });
}

async function navigate(path) {
  await page("Page.navigate", { url: origin + path });
  await until(() => evaluate(`location.href === ${JSON.stringify(origin + path)} && document.readyState === 'complete' && !!document.querySelector('.folio-frame')`), path);
  assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"), `${path}: layout fits the viewport`);
  if (new URL(path, origin).pathname === "/") {
    await evaluate("document.querySelector('.folio-stage').scrollIntoView({block:'center',behavior:'instant'})");
  }
}

try {
  await page("Page.addScriptToEvaluateOnNewDocument", { source: `
    localStorage.setItem('saasfolio.analytics-consent.v1', JSON.stringify({ version: 1, allowed: false, at: Date.now() }));
    window.folioDraws = 0;
    window.folioContexts = 0;
    if (location.search.includes('test-save-data')) {
      const connection = new EventTarget();
      connection.saveData = true;
      Object.defineProperty(navigator, 'connection', { value: connection });
    }
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (kind === 'webgl2') {
        window.folioContexts++;
        if (location.search.includes('test-no-webgl')) return null;
      }
      return getContext.call(this, kind, ...args);
    };
    for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
      const draw = WebGL2RenderingContext.prototype[name];
      WebGL2RenderingContext.prototype[name] = function (...args) { window.folioDraws++; return draw.apply(this, args); };
    }
  ` });
  await viewport(1440, 980, false);
  for (const [path, name, links] of [
    ["/", "directory", ["/brands", "/compare", "/deals"]],
    ["/hosting", "hosting", ["/articles/hetzner-vs-digitalocean-small-business-vps", "/articles/hostinger-vps-vs-managed-wordpress-solo-blogger", "/articles/digitalocean-app-platform-review"]],
    ["/compare", "compare", ["#pick-tools", "/savings-calculator", "/articles/compare-saas-pricing-limits"]],
  ]) {
    await navigate(path);
    await ready();
    assert.equal(await evaluate("document.querySelector('.folio-frame').dataset.variant"), name);
    assert.equal(await evaluate("document.querySelector('.folio-detail a').getAttribute('href')"), links[0]);
    for (const index of [1, 2, 0]) {
      const count = await evaluate("window.folioDraws");
      await mode(index);
      await until(() => evaluate(`document.querySelectorAll('.folio-views button')[${index}].getAttribute('aria-pressed') === 'true' && document.querySelector('.folio-detail a').getAttribute('href') === ${JSON.stringify(links[index])} && window.folioDraws > ${count}`), `${name}: mode ${index + 1} redraw and link`);
    }
    if (path === "/compare") {
      assert.ok(await evaluate("!!document.querySelector('#pick-tools form')"));
      await evaluate("document.querySelector('.folio-detail a').click()");
      await until(() => evaluate("location.hash === '#pick-tools'"), "Comparison preview points to the existing form");
    }
  }

  await viewport(390, 844, true);
  await navigate("/");
  await ready();
  assert.ok(await evaluate(`(() => { const c = document.querySelector('.folio-canvas'); return c.width / c.clientWidth <= 1.3; })()`), "Mobile rendering resolution is capped");
  await evaluate(`document.querySelector('.folio-stage').scrollIntoView({ block: 'center', behavior: 'instant' })`);
  const stage = await evaluate(`(() => { const r = document.querySelector('.folio-stage').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), scroll: scrollY }; })()`);
  await pause(2300);
  const settled = await evaluate("window.folioDraws");
  await pause(230);
  assert.equal(await evaluate("window.folioDraws"), settled, "Idle scenes release the animation frame loop");
  await page("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: stage.x, y: stage.y }] });
  for (const dx of [16, 34, 62, 88]) await page("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: stage.x + dx, y: stage.y }] });
  await until(() => evaluate(`document.querySelector('.folio-frame').dataset.dragging === 'true' && window.folioDraws > ${settled}`), "Horizontal touch movement orbits the scene");
  await page("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  assert.ok(Math.abs(await evaluate("scrollY") - stage.scroll) < 4, "Orbit drag does not move the page vertically");
  await page("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: stage.x, y: stage.y }] });
  for (const dy of [15, 40, 72, 120]) await page("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: stage.x, y: stage.y - dy }] });
  await page("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await until(() => evaluate(`scrollY > ${stage.scroll + 22}`), "Vertical swipes on the scene scroll the page");
  await evaluate(`document.querySelector('[aria-label="Reset 3D view"]').click(); scrollTo({ top: 0, behavior: 'instant' })`);
  await pause(200);
  const offscreen = await evaluate("window.folioDraws");
  await pause(250);
  assert.equal(await evaluate("window.folioDraws"), offscreen, "Offscreen scenes stop drawing");
  await evaluate(`scrollTo({ top: ${stage.scroll}, behavior: 'instant' })`);
  await until(() => evaluate(`window.folioDraws > ${offscreen}`), "Scene resumes on return to the viewport");
  const rotated = await evaluate("window.folioDraws");
  await evaluate(`document.querySelector('[aria-label="Rotate 3D illustration"]').focus({ preventScroll: true })`);
  await page("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await page("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await until(() => evaluate(`window.folioDraws > ${rotated}`), "Rotate button requests a fresh animation");
  await evaluate(`document.querySelector('.folio-canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()`);
  await until(() => evaluate("!document.querySelector('.folio-canvas') && document.querySelector('.folio-poster').naturalWidth > 0"), "Context loss restores the static artwork");

  await viewport(320, 700, true);
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate("/compare");
  await until(() => evaluate("document.querySelector('.folio-poster').naturalWidth > 0"), "Reduced-motion artwork loads");
  await pause(380);
  assert.equal(await evaluate("window.folioContexts"), 0);
  await mode(2);
  await until(() => evaluate("document.querySelector('.folio-detail a').getAttribute('href') === '/articles/compare-saas-pricing-limits'"), "Mode navigation works with reduced motion");
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await navigate("/?test-no-webgl");
  await until(() => evaluate("window.folioContexts > 0 && document.querySelector('.folio-poster').naturalWidth > 0"), "Static fallback works when WebGL is unavailable");
  assert.equal(await evaluate("document.querySelectorAll('.folio-canvas').length"), 0);
  await navigate("/?test-save-data");
  await until(() => evaluate("document.querySelector('.folio-poster').naturalWidth > 0"), "Data-saving artwork loads");
  await pause(380);
  assert.equal(await evaluate("window.folioContexts"), 0, "Data saver skips WebGL initialization");
  await page("Emulation.setScriptExecutionDisabled", { value: true });
  await navigate("/hosting");
  assert.equal(await evaluate("document.querySelector('.folio-detail a').getAttribute('href')"), "/articles/hetzner-vs-digitalocean-small-business-vps");
  await until(() => evaluate("document.querySelector('.folio-poster').naturalWidth > 0"), "The initial artwork and guide link survive without JavaScript");
  assert.deepEqual(runtimeErrors, []);
  assert.deepEqual(failedAssets, []);
  assert.deepEqual(writes, []);
  console.log("Three.js browser checks passed: 9 views, mobile drag and native scroll, keyboard controls, idle and offscreen pausing, and fallbacks for context loss, reduced motion, data saver and disabled JavaScript.");
} finally {
  await close();
}
