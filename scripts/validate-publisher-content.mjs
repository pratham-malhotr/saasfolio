import assert from "node:assert/strict";
import { editorialGuideIssues, duplicatedEditorialParagraphs } from "../lib/editorial-quality.mjs";
import { normalizePublicHttpsUrl } from "../lib/public-url.mjs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const { BRAND_DISCOUNT_GUIDES } = loadCatalogModule("lib/data/brand-discount-guides.ts");
const { getAllTools } = loadCatalogModule("lib/data/tools-data.ts");
const { COMPARISON_GUIDES } = loadCatalogModule("lib/data/comparison-guides.ts");
const { EDITORIAL_TOOL_NOTES } = loadCatalogModule("lib/data/editorial-tool-notes.ts");
const { DETAILED_ARTICLES } = loadCatalogModule("lib/data/articles-data.ts");
const errors = [];
for (const [slug, guide] of Object.entries(BRAND_DISCOUNT_GUIDES)) for (const issue of editorialGuideIssues(guide)) errors.push(`${slug}: ${issue}`);
const entries = Object.entries(BRAND_DISCOUNT_GUIDES).map(([slug, guide]) => ({ slug: `discounts/${slug}`, paragraphs: guide.sections.map(section => section.text) }));
for (const [slug, guide] of Object.entries(COMPARISON_GUIDES)) {
  if (!guide.summary || !guide.decision || guide.sections.length < 3 || guide.exercise.length < 3 || guide.rows.length < 2 || guide.sources.length < 2) errors.push(`${slug}: incomplete comparison analysis`);
  for (const source of guide.sources) if (!normalizePublicHttpsUrl(source.url)) errors.push(`${slug}: invalid comparison source`);
  entries.push({ slug: `compare/${slug}`, paragraphs: guide.sections.map(section => section.text) });
}
for (const [slug, note] of Object.entries(EDITORIAL_TOOL_NOTES)) if (!note.summary || !note.checks.length || !normalizePublicHttpsUrl(note.sourceUrl)) errors.push(`${slug}: incomplete documented profile`);
for (const article of DETAILED_ARTICLES) {
  if (!article.sources?.length || !article.author.name) errors.push(`${article.slug}: missing attribution or sources`);
  for (const source of article.sources || []) if (!normalizePublicHttpsUrl(source.url)) errors.push(`${article.slug}: invalid article source`);
  entries.push({ slug: `articles/${article.slug}`, paragraphs: article.sections.map(section => section.content) });
}
const duplicates = duplicatedEditorialParagraphs(entries, getAllTools().map(tool => tool.name));
for (const duplicate of duplicates) errors.push(`Repeated editorial paragraph across ${duplicate.slugs.join(", ")}`);
assert.deepEqual(errors, [], "Resolve incomplete, placeholder, unsourced or duplicated editorial content before release");
console.log(`Publisher source validation passed: ${Object.keys(BRAND_DISCOUNT_GUIDES).length} brand guides, ${Object.keys(COMPARISON_GUIDES).length} original comparisons, ${Object.keys(EDITORIAL_TOOL_NOTES).length} documented profiles and ${DETAILED_ARTICLES.length} articles; no duplicated substantive editorial paragraphs.`);
console.log("These publication checks do not predict or guarantee AdSense approval; original value still requires editorial judgment.");
