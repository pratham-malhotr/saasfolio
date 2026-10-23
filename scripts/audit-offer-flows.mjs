import assert from "node:assert/strict";
import { loadCatalogModule } from "./lib/load-catalog.mjs";
import aliases from "../lib/data/legacy-deal-aliases.json" with { type: "json" };
import snapshot from "../lib/data/offer-snapshot.json" with { type: "json" };

// Check real production HTTP responses without following affiliate links.
const origin = (process.argv[2] || "http://127.0.0.1:3210").replace(/\/$/, "");
const { TOOLS_DATA, getToolBySlug } = loadCatalogModule("lib/data/tools-data.ts");
const { getAllDeals, getDealBySlug, getHistoricOfferToolSlug } = loadCatalogModule("lib/data/deals-data.ts");
const { getCustomAffiliateUrl } = loadCatalogModule("lib/data/affiliate-links.ts");
const { publicHttpsUrl } = loadCatalogModule("lib/offer-links.ts");
const ids = [...new Set([...TOOLS_DATA.map(tool => tool.slug), ...getAllDeals().flatMap(deal => [deal.slug, deal.id]), ...Object.keys(aliases), ...snapshot.offers.flatMap(offer => [offer.slug, `deal-${offer.slug}`]), "unknown-brand", "https://evil.example", "__proto__"])];
const counts = { redirects: 0, unavailable: 0, unknown: 0 };
let cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < ids.length) {
    const id = ids[cursor++];
    const deal = getDealBySlug(id), tool = getToolBySlug(id);
    const provider = tool || getToolBySlug(deal?.toolSlug || getHistoricOfferToolSlug(id) || "");
    const response = await fetch(`${origin}/go/${encodeURIComponent(id)}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
    assert.match(response.headers.get("x-robots-tag"), /noindex/, id);
    assert.equal(response.headers.get("cache-control"), "no-store", id);
    if (provider?.providerStatus === "unavailable") {
      assert.equal(response.status, 410, `${id}: disabled provider`);
      assert.equal(response.headers.get("location"), null, id);
      assert.match(await response.text(), /Browse other software/, id);
      counts.unavailable++;
    } else {
      const exact = deal && [deal.slug, deal.id].includes(id);
      const destination = exact ? publicHttpsUrl(deal.destinationUrl) || publicHttpsUrl(deal.affiliateUrl)
        : tool ? publicHttpsUrl(getCustomAffiliateUrl(tool.slug)) || publicHttpsUrl(tool.pricingUrl) || publicHttpsUrl(tool.website)
        : publicHttpsUrl(provider?.pricingUrl) || publicHttpsUrl(provider?.website);
      assert.equal(response.status, destination ? 302 : 404, id);
      assert.equal(response.headers.get("location"), destination || null, `${id}: preserve the intended destination`);
      counts[destination ? "redirects" : "unknown"]++;
    }
  }
}));
console.log(`Offer flow audit passed: ${ids.length} production routes (${counts.redirects} redirects, ${counts.unavailable} unavailable, ${counts.unknown} unknown). External checkout acceptance is not tested.`);
