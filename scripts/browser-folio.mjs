import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openChromePage } from "./lib/chrome-page.mjs";

const origin = (process.argv[2] || "http://127.0.0.1:3227").replace(/\/$/, "");
const { page, evaluate, until, close, runtimeErrors, failedAssets, writes } = await openChromePage(origin);

// These photographs and shortcuts replaced the WebGL folios on the research hubs.
const hubs = [
  {
    path: "/hosting",
    photo: "hosting-aisle",
    credit: "Taylor Vick",
    shortcuts: [
      "/articles/hetzner-vs-digitalocean-small-business-vps",
      "/articles/hostinger-vps-vs-managed-wordpress-solo-blogger",
      "/articles/digitalocean-app-platform-review",
    ],
  },
  {
    path: "/compare",
    photo: "software-workshop",
    credit: "Marvin Meyer",
    shortcuts: ["#pick-tools", "/savings-calculator", "/articles/compare-saas-pricing-limits"],
  },
];

async function navigate(path) {
  await page("Page.navigate", { url: origin + path });
  await until(() => evaluate(`location.href === ${JSON.stringify(origin + path)} && document.readyState === 'complete'`), path);
}

async function verifyPhoto(selector, photo, credit) {
  await until(() => evaluate(`document.querySelector(${JSON.stringify(`${selector} img`)})?.naturalWidth > 0`), `${photo}: photograph loads`);
  const state = await evaluate(`(() => {
    const figure = document.querySelector(${JSON.stringify(selector)});
    const image = figure.querySelector('img');
    const response = new URL(image.currentSrc);
    const source = response.searchParams.get('url') || response.pathname;
    return {
      local: response.origin === location.origin,
      source,
      alt: image.alt,
      credit: figure.querySelector('figcaption a').textContent.trim(),
    };
  })()`);
  assert.equal(state.source, `/images/research/${photo}.webp`);
  assert.equal(state.credit, credit);
  assert.ok(state.local && state.alt, `${photo}: locally served with a description`);
}

async function verifyHub(hub) {
  await navigate(hub.path);
  await verifyPhoto(".research-photo-panel figure", hub.photo, hub.credit);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.research-photo-panel nav a')].map(link => link.getAttribute('href'))"), hub.shortcuts);
  assert.ok(await evaluate("!document.querySelector('.folio-canvas, .folio-frame')"), `${hub.path}: no generated artwork panel`);
  assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"), `${hub.path}: layout fits the viewport`);
}

try {
  await page("Page.addScriptToEvaluateOnNewDocument", {
    source: "Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' });",
  });
  await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  for (const viewport of [{ width: 320, height: 720, mobile: true }, { width: 390, height: 844, mobile: true }, { width: 1440, height: 1000, mobile: false }]) {
    await page("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1 });
    for (const hub of hubs) {
      await verifyHub(hub);
      const { data } = await page("Page.captureScreenshot", { format: "png" });
      await writeFile(join(tmpdir(), `saasfolio-photo-${hub.path.slice(1)}-${viewport.width}.png`), Buffer.from(data, "base64"));
    }
  }

  await navigate("/hosting");
  assert.ok(await evaluate("[...document.querySelectorAll('#guides img')].every(img => new URL(img.src).searchParams.get('url')?.startsWith('/images/research/'))"), "Every hosting guide uses local photography");
  await navigate(hubs[0].shortcuts[0]);
  await verifyPhoto("main figure", "equipment-racks", "Kevin Ache");
  await navigate(hubs[1].shortcuts[2]);
  await verifyPhoto("main figure", "software-workshop", "Marvin Meyer");

  await page("Emulation.setScriptExecutionDisabled", { value: true });
  for (const hub of hubs) await verifyHub(hub);
  await evaluate("document.querySelector('.research-photo-panel a[href=\"#pick-tools\"]').click()");
  await until(() => evaluate("location.hash === '#pick-tools'"), "Photo panel jumps to the comparison form without JavaScript");

  assert.deepEqual(runtimeErrors, []);
  assert.deepEqual(failedAssets, []);
  assert.deepEqual(writes, []);
  console.log("Research photography passed: local responsive images, visible credits, retained shortcuts, hosting guide covers and no-JavaScript access.");
} finally {
  await close();
}
