import { readFile, writeFile } from "node:fs/promises";
import { parse } from "parse5";

// Read-only production audit. Redirects to providers are inspected, never followed.
// Covers the built HTML routes, sitemap, footer queries, linked pages and fragments.
const origin = (process.argv[2] || "http://127.0.0.1:3227").replace(/\/$/, "");
const productionOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech").origin;
const reportPath = process.argv.find(value => value.startsWith("--report="))?.slice(9) || `docs/reports/site-pages-${new Date().toISOString().slice(0, 10)}.json`;
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const content = node => node?.value || (node?.childNodes || []).map(content).join("");
function elements(node, result = []) {
  if (node.tagName) result.push(node);
  for (const child of node.childNodes || []) elements(child, result);
  return result;
}
function localURL(href, source) {
  if (typeof href !== "string" || !href) return null;
  try {
    const url = new URL(href, `${origin}${source}`);
    if (![origin, productionOrigin].includes(url.origin)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return null; }
}
const failures = [];
const pages = new Map();
const references = new Map();
const assets = new Set();
const footerLinks = new Set();
let redirects = 0;
const queue = new Set(["/", "/contact", "/deals", "/newsletter", "/newsletter/unsubscribe"]);
const manifest = JSON.parse(await readFile(".next/prerender-manifest.json", "utf8"));
for (const path of Object.keys(manifest.routes)) {
  if (!path.startsWith("/_") && !path.includes("opengraph-image") && !/\.[a-z0-9]+$/.test(path)) queue.add(path);
}
const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
if (sitemapResponse.status !== 200) throw new Error("Sitemap is unavailable");
const sitemap = await sitemapResponse.text();
for (const [, raw] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) queue.add(new URL(raw.replaceAll("&amp;", "&")).pathname);

async function response(path) {
  let current = path;
  for (let hop = 0; hop < 8; hop++) {
    const result = await fetch(`${origin}${current}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
    if (result.status >= 300 && result.status < 400 && result.headers.has("location")) {
      const target = localURL(result.headers.get("location"), current);
      if (!target) return { result, external: result.headers.get("location") };
      current = target.split("#")[0];
      redirects++;
      continue;
    }
    return { result, finalPath: current, html: await result.text() };
  }
  throw new Error(`Redirect loop: ${path}`);
}
async function audit(path) {
  try {
    const { result, finalPath, html, external } = await response(path);
    if (external) throw new Error(`Unexpected external page redirect: ${external}`);
    if (result.status !== 200) throw new Error(`HTTP ${result.status}`);
    if (!result.headers.get("content-type")?.includes("text/html")) throw new Error("Expected an HTML page");
    const nodes = elements(parse(html));
    const main = nodes.find(node => node.tagName === "main");
    const footer = nodes.find(node => node.tagName === "footer");
    const ids = new Set(nodes.map(node => attr(node, "id")).filter(Boolean));
    const title = content(nodes.find(node => node.tagName === "title"));
    const h1 = nodes.filter(node => node.tagName === "h1").map(content);
    if (!main || !content(main).trim()) throw new Error("Missing or empty main content");
    if (!footer) throw new Error("Missing site footer");
    if (!title || /Application error|Internal Server Error/.test(title)) throw new Error(`Invalid page title: ${title}`);
    if (/Application error: a (client|server)-side exception/.test(content(main))) throw new Error("Rendered application error");
    pages.set(path, { path, finalPath, status: result.status, title, h1, ids });
    for (const node of nodes) {
      if (node.tagName === "a") {
        const href = attr(node, "href");
        if (!href) { failures.push({ path, issue: "Anchor without a destination", label: content(node).slice(0, 100) }); continue; }
        if (/^javascript:/i.test(href) || href === "#") failures.push({ path, issue: `Placeholder link: ${href}`, label: content(node).slice(0, 100) });
        const target = localURL(href, finalPath);
        if (target) {
          if (!references.has(target)) references.set(target, path);
          const destination = target.split("#")[0];
          if (destination && !/^\/(go|api|auth)\//.test(destination) && !/\.[a-z0-9]+(?:\?|$)/.test(destination)) queue.add(destination);
        }
      }
      if (node.tagName === "img" || node.tagName === "script" || (node.tagName === "link" && attr(node, "rel") === "stylesheet")) {
        const url = localURL(attr(node, "src") || attr(node, "href"), finalPath);
        if (url && url !== finalPath) assets.add(url);
      }
    }
    if (path === "/") for (const node of elements(footer)) {
      if (node.tagName !== "a") continue;
      const target = localURL(attr(node, "href"), "/");
      if (target) footerLinks.add(target);
    }
  } catch (error) {
    failures.push({ path, issue: error.message });
    pages.set(path, { path, status: 0, ids: new Set() });
  }
}
const visited = new Set();
while ([...queue].some(path => !visited.has(path))) {
  const batch = [...queue].filter(path => !visited.has(path));
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < batch.length) {
      const path = batch[cursor++];
      visited.add(path);
      await audit(path);
      if (visited.size % 200 === 0) console.log(`Audited ${visited.size} page URLs...`);
    }
  }));
}
for (const [target, from] of references) {
  const [path, hash] = target.split("#");
  if (path.startsWith("/go/")) continue;
  if (hash && pages.has(path) && !pages.get(path).ids.has(decodeURIComponent(hash))) failures.push({ path: from, issue: `Missing fragment: ${target}` });
}
const outboundPaths = [...new Set([...references.keys()].filter(path => path.startsWith("/go/")).map(path => path.split("#")[0]))];
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < outboundPaths.length) {
    const path = outboundPaths[cursor++];
    try {
      const result = await fetch(`${origin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
      if (result.status !== 302 || !result.headers.get("location")?.startsWith("https://")) failures.push({ path, issue: `Invalid provider redirect: HTTP ${result.status}` });
    } catch (error) { failures.push({ path, issue: error.message }); }
  }
}));
for (const path of assets) {
  try {
    const result = await fetch(`${origin}${path}`, { method: "HEAD", signal: AbortSignal.timeout(30000) });
    if (result.status !== 200) failures.push({ path, issue: `Missing local asset: HTTP ${result.status}` });
  } catch (error) { failures.push({ path, issue: error.message }); }
}
const report = {
  checkedAt: new Date().toISOString(), origin,
  summary: { pages: pages.size, footerDestinations: footerLinks.size, internalLinkTargets: references.size, providerRedirects: outboundPaths.length, localAssets: assets.size, followedInternalRedirects: redirects, failures: failures.length },
  footer: [...footerLinks].map(target => ({ target, status: pages.get(target.split("#")[0])?.status })),
  failures,
  pages: [...pages.values()].map(({ ids, ...page }) => ({ ...page, fragments: ids.size })),
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
console.log(`Report: ${reportPath}`);
if (failures.length) { console.error(failures.slice(0, 40)); process.exitCode = 1; }
