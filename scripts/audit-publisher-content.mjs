import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { parse } from "parse5";
import { auditIndexing, parseArguments } from "./audit-indexing.mjs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const origin = (process.argv[2] || "http://127.0.0.1:3245").replace(/\/$/, "");
const reportPath = process.argv.find(value => value.startsWith("--report="))?.slice(9) || `docs/reports/publisher-content-${new Date().toISOString().slice(0, 10)}.json`;
const options = { ...parseArguments([origin, "--concurrency", "2", "--delay", "20"]), importedUrls: [] };
const attr = (node, key) => node?.attrs?.find(item => item.name === key)?.value;
const nodes = (node, predicate) => [...(predicate(node) ? [node] : []), ...(node.childNodes || []).flatMap(child => nodes(child, predicate))];
const visibleText = node => ["script", "style", "template"].includes(node?.tagName) ? "" : node?.value || (node?.childNodes || []).map(visibleText).join(" ");
const content = [];
const scriptPaths = new Set();
const { getPublishedTools, getPublishedOffers } = loadCatalogModule("lib/published-catalog.ts");
const { toolMetaDescription } = loadCatalogModule("lib/seo.ts");
const publishedTools = new Map(getPublishedTools().map(tool => [tool.slug, tool]));

const indexing = await auditIndexing(options, {
  fetch: async (url, init) => {
    const response = await fetch(url, init);
    if (response.status === 200 && response.headers.get("content-type")?.includes("text/html")) {
      const raw = await response.clone().text(), document = parse(raw), path = new URL(url).pathname;
      for (const node of nodes(document, item => item.tagName === "script")) {
        const src = attr(node, "src");
        if (src?.startsWith("/_next/")) scriptPaths.add(src);
      }
      const main = nodes(document, node => node.tagName === "main")[0];
      const text = visibleText(main).replace(/\s+/g, " ").trim();
      const findings = [];
      if (Buffer.byteLength(raw) >= 1900000) findings.push("HTML exceeds the internal 1.9 MB crawl budget");
      if (nodes(main, node => node.tagName === "h1").length !== 1) findings.push("Expected one meaningful primary heading");
      if (/HANDS-ON|SaaSFolio Studio AI Voice Engine|Verified Engineer|Verified Reader|Over 2,400 engineering teams|120,000\+ FOUNDERS|zero vanity traffic/.test(text)) findings.push("Unsupported testing, identity, audience or activity claim");
      if (/^\/tools\/[^/]+$/.test(path) && !nodes(main, node => attr(node, "data-editorial-profile") === "true").length) findings.push("Published software profile lacks its buying guidance");
      if (/^\/tools\/[^/]+$/.test(path)) {
        const tool = publishedTools.get(path.split("/").pop());
        const description = nodes(document, node => node.tagName === "meta" && attr(node, "name") === "description")[0];
        if (tool && attr(description, "content") !== toolMetaDescription(tool.name, tool.description)) findings.push("Search description differs from reviewed public copy");
      }
      if (/^\/compare\/[^/]+$/.test(path) && !nodes(main, node => attr(node, "data-editorial-comparison") === "true").length) findings.push("Published comparison lacks its original decision analysis");
      if (/^\/articles\/[^/]+$/.test(path)) for (const id of ["worked-example", "decision-record", "common-mistake", "references"]) {
        if (!nodes(main, node => attr(node, "id") === id).length) findings.push(`Missing article section: ${id}`);
      }
      for (const script of nodes(document, node => node.tagName === "script" && attr(node, "type") === "application/ld+json")) {
        const value = JSON.parse((script.childNodes || []).map(node => node.value || "").join(""));
        for (const schema of value["@graph"] || [value]) {
          if (schema["@type"] !== "SoftwareApplication") continue;
          const slug = new URL(schema.url).pathname.split("/").pop(), tool = publishedTools.get(slug);
          if (tool && (schema.description !== tool.description || JSON.stringify(schema.featureList) !== JSON.stringify(tool.keyFeatures))) findings.push("Structured software facts differ from reviewed public copy");
        }
      }
      const links = nodes(main, node => node.tagName === "a").map(node => attr(node, "href")).filter(Boolean);
      content.push({ path, htmlBytes: Buffer.byteLength(raw), visibleWords: text.split(/\s+/).length, links: links.length, findings });
    }
    return response;
  },
  onProgress: ({ completed, total }) => { if (completed % 50 === 0 || completed === total) console.log(`Publisher content: ${completed}/${total}`); },
});

const { getAllTools } = loadCatalogModule("lib/data/tools-data.ts");
const { COMPARISON_SLUGS } = loadCatalogModule("lib/data/comparisons-data.ts");
const sitemapPaths = new Set(indexing.pages.map(page => new URL(page.url).pathname));
const approved = new Set(publishedTools.keys());
for (const tool of getAllTools()) assert.equal(sitemapPaths.has(`/tools/${tool.slug}`), approved.has(tool.slug), `${tool.slug}: sitemap publication boundary`);

const probes = [];
for (const path of ["/tools/cogniflow-ai", "/tools/claude-ai", "/tools/metricpulse", "/tools?page=2", "/tools?page=9999", "/tools/publisher-nonexistent", "/editorial-policy"]) {
  const response = await fetch(`${origin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  const raw = await response.text(), document = parse(raw);
  const text = visibleText(nodes(document, node => node.tagName === "main")[0]);
  const noindex = nodes(document, node => node.tagName === "meta" && attr(node, "name") === "robots").some(node => /noindex/.test(attr(node, "content") || ""));
  const record = { path, status: response.status, noindex, findings: [] };
  if (["/tools/cogniflow-ai", "/tools/claude-ai", "/tools/metricpulse"].includes(path)) {
    if (response.status !== 200 || !noindex || !raw.includes('data-catalog-reference="true"')) record.findings.push("Legacy reference must remain accessible, non-indexed and clearly identified");
    if (/2,400 engineering teams|100% GDPR|SOC2 Type II|zero impact on Lighthouse/.test(text)) record.findings.push("Unreviewed legacy claim is still rendered");
  } else if (["/tools?page=9999", "/tools/publisher-nonexistent"].includes(path)) {
    if (response.status !== 404 || !noindex) record.findings.push("Unknown or out-of-range page must return a non-indexed 404");
  } else if (response.status !== 200) record.findings.push("Expected a successful public page");
  probes.push(record);
}

const toolPage = await (await fetch(`${origin}/tools`)).text();
const secondPage = await (await fetch(`${origin}/tools?page=2`)).text();
const profileLinks = html => nodes(parse(html), node => node.tagName === "a" && /^\/tools\/[^/?]+$/.test(attr(node, "href") || "")).map(node => attr(node, "href"));
assert.ok(profileLinks(toolPage).length <= 48, "Only the first 24 cards render, with title and action links");
assert.ok(profileLinks(secondPage).some(path => !profileLinks(toolPage).includes(path)), "The second page contains different profiles before JavaScript");
assert.match(secondPage, /canonical[^>]+href="https:\/\/saasfolio.tech\/tools\?page=2"/);

const scripts = [];
for (const path of scriptPaths) {
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30000) });
  const bytes = (await response.arrayBuffer()).byteLength;
  scripts.push({ path, status: response.status, bytes });
}
const failedScripts = scripts.filter(script => script.status !== 200 || script.bytes >= 1900000);

const errors = indexing.summary.errors + content.reduce((sum, page) => sum + page.findings.length, 0) + probes.reduce((sum, page) => sum + page.findings.length, 0) + failedScripts.length;
const report = { generatedAt: new Date().toISOString(), origin, scope: "Production-build HTTP and content checks; public GETs; no accounts, emails, ads or consent submissions; not an AdSense approval prediction", summary: { publishedTools: approved.size, excludedLegacyTools: getAllTools().length - approved.size, publishedOffers: getPublishedOffers().length, originalComparisons: COMPARISON_SLUGS.length, sitemapPages: indexing.pages.length, contentPages: content.length, largestHtmlBytes: Math.max(...content.map(page => page.htmlBytes)), scriptAssets: scripts.length, largestScriptBytes: Math.max(...scripts.map(script => script.bytes)), indexingErrors: indexing.summary.errors, errors }, indexing: { summary: indexing.summary, failures: indexing.pages.filter(page => page.issues.length) }, content, probes, scripts };
await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report.summary, null, 2));
console.log(`Report: ${reportPath}`);
if (errors) { console.error(JSON.stringify({ content: content.filter(page => page.findings.length), probes: probes.filter(page => page.findings.length) }, null, 2)); process.exitCode = 1; }
