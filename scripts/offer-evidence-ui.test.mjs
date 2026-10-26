import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import ts from "typescript";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

// Render the actual shared component, including the production public-URL
// validation, without a browser or a second application build.
const nativeRequire = createRequire(import.meta.url);
const source = readFileSync(new URL("../components/deals/OfferEvidenceDetails.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const loaded = { exports: {} };
new Function("require", "module", "exports", compiled)(name => name === "@/lib/offer-links" ? loadCatalogModule("lib/offer-links.ts") : nativeRequire(name), loaded, loaded.exports);
const { OfferEvidenceDetails } = loaded.exports;
const base = { slug: "sample-offer", dealType: "coupon", sourceKind: "vendor", expiryDate: "" };
const render = details => renderToStaticMarkup(createElement(OfferEvidenceDetails, { deal: { ...base, ...details } }));

test("offer evidence links to its recorded source and displays real check/expiry dates", () => {
  const html = render({ sourceUrl: "https://provider.example/offer?plan=annual", checkedAt: "2026-10-26T08:30:00.000Z", expiryDate: "2026-11-30T23:59:00.000Z" });
  assert.match(html, /href="https:\/\/provider\.example\/offer\?plan=annual"/);
  assert.match(html, /Provider source/);
  assert.match(html, /Source checked/);
  assert.match(html, /dateTime="2026-10-26T08:30:00.000Z"/);
  assert.match(html, /Published expiry/);
  assert.match(html, /dateTime="2026-11-30T23:59:00.000Z"/);
  assert.match(html, /not checkout tested/);
});

test("coupon publishers remain attributed as reports rather than checkout verification", () => {
  const html = render({ sourceUrl: "https://coupons.example/store/brand", sourceKind: "coupon-site", checkedAt: "2026-10-26" });
  assert.match(html, /Coupon publisher/);
  assert.match(html, /Reported by coupon source; not checkout tested/);
  assert.doesNotMatch(html, /success rate|checkout verified|verified at checkout/i);
});

test("missing or invalid evidence never invents a date or unsafe source link", () => {
  for (const sourceUrl of [undefined, "javascript:alert(1)", "http://provider.example/offer", "https://127.0.0.1/offer", "https://user:secret@provider.example/offer", "https://host.internal/offer"]) {
    const html = render({ sourceUrl, checkedAt: "3 hours ago", expiryDate: "2026-02-30" });
    assert.doesNotMatch(html, /<a\b|<time\b|Source checked|Published expiry/);
    assert.match(html, /Check current vendor terms/);
  }
});

test("an unattributed recorded source is not relabeled as an official provider", () => {
  const html = render({ sourceUrl: "https://source.example/offer", sourceKind: undefined, checkedAt: "2026-10-26" });
  assert.match(html, /Recorded source/);
  assert.doesNotMatch(html, /Provider source|Coupon publisher|Vendor source checked/);
  assert.match(html, /Recorded source check; not checkout tested/);
});
