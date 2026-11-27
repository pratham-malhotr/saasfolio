// Notify IndexNow search engines (Bing, Yandex, Seznam, Naver...) about
// canonical URLs from the live sitemap. Bing's index also feeds Copilot and
// ChatGPT search. Run after a deployment is live:
//
//   npm run seo:indexnow                       # every URL in the live sitemap
//   npm run seo:indexnow -- --changed-since=2026-11-27   # only URLs whose lastmod is newer
//   npm run seo:indexnow -- --dry-run          # list what would be sent
//
// The key file public/<key>.txt must be deployed at the site root first.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech");
const key = (await fs.readdir(path.join(root, "public"))).map(file => file.match(/^([a-f0-9]{32})\.txt$/)?.[1]).find(Boolean);
if (!key) throw new Error("No IndexNow key file (32 hex characters + .txt) found in public/");

const keyUrl = new URL(`/${key}.txt`, site);
const keyResponse = await fetch(keyUrl, { signal: AbortSignal.timeout(20000) });
if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) throw new Error(`The key file is not live at ${keyUrl}; deploy first.`);

const since = process.argv.find(arg => arg.startsWith("--changed-since="))?.slice(16);
const sitemap = await (await fetch(new URL("/sitemap.xml", site), { signal: AbortSignal.timeout(30000) })).text();
const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => ({
  loc: match[1].match(/<loc>([^<]+)<\/loc>/)?.[1].replaceAll("&amp;", "&"),
  lastmod: match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
})).filter(entry => entry.loc && new URL(entry.loc).host === site.host);
const urls = entries.filter(entry => !since || (entry.lastmod && Date.parse(entry.lastmod) >= Date.parse(since))).map(entry => entry.loc);
console.log(`${urls.length} of ${entries.length} sitemap URLs selected${since ? ` (lastmod since ${since})` : ""}.`);
if (process.argv.includes("--dry-run") || !urls.length) { for (const url of urls.slice(0, 20)) console.log(`  ${url}`); process.exit(0); }

// IndexNow accepts up to 10,000 URLs per request.
for (let start = 0; start < urls.length; start += 10000) {
  const batch = urls.slice(start, start + 10000);
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: site.host, key, keyLocation: keyUrl.href, urlList: batch }),
    signal: AbortSignal.timeout(30000),
  });
  // 200 and 202 both mean accepted; search engines still decide what to crawl and index.
  console.log(`IndexNow batch ${start / 10000 + 1}: HTTP ${response.status} for ${batch.length} URLs`);
  if (![200, 202].includes(response.status)) { console.error(await response.text()); process.exitCode = 1; }
}
