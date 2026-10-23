import { writeFile } from "node:fs/promises";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const { getAllTools } = loadCatalogModule("lib/data/tools-data.ts");
const { getAllDeals } = loadCatalogModule("lib/data/deals-data.ts");
const { getCustomAffiliateUrl } = loadCatalogModule("lib/data/affiliate-links.ts");
const selected = process.argv.find(arg => arg.startsWith("--only="))?.slice(7).split(",");
const reportPath = process.argv.find(arg => arg.startsWith("--report="))?.slice(9) || "/tmp/saasfolio-outbound-audit.json";
const targets = new Map();
function add(url, slug, kind) {
  if (!url) return;
  if (!targets.has(url)) targets.set(url, []);
  targets.get(url).push({ slug, kind });
}
for (const tool of getAllTools()) if (!selected || selected.includes(tool.slug)) {
  add(tool.website, tool.slug, "website"); add(tool.pricingUrl, tool.slug, "pricing");
  add(getCustomAffiliateUrl(tool.slug), tool.slug, "referral");
}
for (const deal of getAllDeals()) if ((!selected || selected.includes(deal.toolSlug)) && deal.dealType !== "pricing") add(deal.destinationUrl, deal.toolSlug, deal.dealType);

async function check(url) {
  let current = url;
  const hops = [];
  try {
    for (let hop = 0; hop < 8; hop++) {
      const response = await fetch(current, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(10000), headers: { "User-Agent": "SaaSFolioLinkCheck/1.0 (+https://saasfolio.tech/about)" } });
      hops.push({ url: current, status: response.status });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) return { status: "broken", reason: "Redirect has no destination", hops };
        const next = new URL(location, current);
        if (next.protocol !== "https:") return { status: "review", reason: "Redirect leaves HTTPS", hops };
        if (hops.some(previous => previous.url === next.href)) return { status: "broken", reason: "Redirect loop", hops };
        current = next.href; continue;
      }
      const status = response.ok ? "reachable" : [404, 410].includes(response.status) ? "broken" : [401, 403, 405, 429].includes(response.status) ? "unverified" : "unavailable";
      return { status, httpStatus: response.status, finalUrl: current, hops };
    }
    return { status: "review", reason: "Too many redirects", hops };
  } catch (error) { return { status: "unverified", reason: error.cause?.code || error.message, hops }; }
}
const urls = [...targets.keys()], results = [];
let cursor = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    const result = { url, uses: targets.get(url), ...await check(url) };
    results.push(result);
    if (results.length % 100 === 0) console.log(`Checked ${results.length}/${urls.length} outbound URLs`);
  }
}));
const counts = results.reduce((counts, result) => ({ ...counts, [result.status]: (counts[result.status] || 0) + 1 }), {});
await writeFile(reportPath, `${JSON.stringify({ checkedAt: new Date().toISOString(), counts, results }, null, 2)}\n`);
console.log(JSON.stringify({ ...counts, reportPath }));
if (results.some(result => result.status === "broken") || (results.length && results.every(result => result.hops.length === 0))) process.exitCode = 1;
