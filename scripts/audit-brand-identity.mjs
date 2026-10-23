import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "parse5";
import sharp from "sharp";
import { loadCatalogModule } from "./lib/load-catalog.mjs";
import { BRAND_MARK } from "../lib/brand-mark.mjs";

const origin = (process.argv[2] || "http://127.0.0.1:3210").replace(/\/$/, "");
const { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } = loadCatalogModule("lib/seo.ts");
const { getBrandDirectory } = loadCatalogModule("lib/brand-directory.ts");
const brands = getBrandDirectory();
function attr(node, name) { return node.attrs?.find(attribute => attribute.name === name)?.value; }
function elements(node, tag) { return [...(node.tagName === tag ? [node] : []), ...(node.childNodes || []).flatMap(child => elements(child, tag))]; }
function content(node) { return node.value || (node.childNodes || []).map(content).join(""); }
async function page(path, agent = "Googlebot") {
  const response = await fetch(`${origin}${path}`, { headers: { "User-Agent": agent }, signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, path);
  return parse(await response.text());
}
for (const agent of ["Googlebot", "Mozilla/5.0"]) {
  const document = await page("/", agent), head = elements(document, "head")[0];
  assert.equal(content(elements(head, "title")[0]), SITE_TITLE);
  assert.equal(attr(elements(head, "meta").find(node => attr(node, "name") === "description"), "content"), SITE_DESCRIPTION);
  assert.ok(SITE_DESCRIPTION.length >= 80 && SITE_DESCRIPTION.length <= 160);
  assert.ok(!/premier|architectural|verified discount/i.test(SITE_DESCRIPTION));
  const links = elements(head, "link");
  assert.ok(links.some(node => attr(node, "rel") === "icon" && attr(node, "href") === "/brand/icon-48.png"));
  assert.ok(links.some(node => attr(node, "rel") === "icon" && attr(node, "href") === "/brand/saasfolio-icon.svg"));
  const apple = links.find(node => attr(node, "rel") === "apple-touch-icon");
  assert.ok(apple, "Apple touch icon declared");
  const appleResponse = await fetch(new URL(attr(apple, "href"), origin));
  const appleImage = await sharp(Buffer.from(await appleResponse.arrayBuffer())).metadata();
  assert.equal(appleImage.width, 180); assert.equal(appleImage.height, 180);
  const schemas = elements(document, "script").filter(node => attr(node, "type") === "application/ld+json").flatMap(node => JSON.parse(content(node))["@graph"] || []);
  const organization = schemas.find(node => node["@type"] === "Organization");
  assert.equal(organization.name, "SaaSFolio");
  assert.equal(organization.logo.url, `${SITE_URL}/brand/icon-512.png`);
  assert.equal(organization.logo.width, 512);
}
for (const size of [48, 96, 192, 512]) {
  const response = await fetch(`${origin}/brand/icon-${size}.png`);
  assert.equal(response.status, 200);
  const info = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
  assert.equal(info.width, size); assert.equal(info.height, size);
}
const svg = await (await fetch(`${origin}/brand/saasfolio-icon.svg`)).text();
assert.ok(svg.includes(BRAND_MARK.path), "Browser icon matches the site mark");
const ico = Buffer.from(await (await fetch(`${origin}/favicon.ico`)).arrayBuffer());
assert.equal(ico.readUInt16LE(2), 1); assert.equal(ico.readUInt16LE(4), 4);
assert.equal(ico[6 + 2 * 16], 48, "ICO includes a 48-pixel search icon");
assert.deepEqual(ico, await readFile(new URL("../app/favicon.ico", import.meta.url)), "Live favicon matches the generated asset");
const manifestResponse = await fetch(`${origin}/manifest.webmanifest`);
assert.equal(manifestResponse.status, 200);
const manifest = await manifestResponse.json();
assert.equal(manifest.name, "SaaSFolio");
assert.equal(manifest.description, SITE_DESCRIPTION);
assert.equal(manifest.icons.length, 2);

const directory = await page("/brands");
assert.equal(elements(directory, "li").filter(node => attr(node, "data-brand")).length, brands.length);
const directoryLinks = new Set(elements(directory, "a").map(node => attr(node, "href")));
for (const brand of brands) assert.ok(directoryLinks.has(`/${brand.hasGuide ? "discounts" : "tools"}/${brand.slug}`), brand.slug);
const { getAllTools } = loadCatalogModule("lib/data/tools-data.ts");
assert.equal(brands.length, getAllTools().length);
const { getAllDeals } = loadCatalogModule("lib/data/deals-data.ts");
const offers = getAllDeals();
for (const brand of brands) assert.equal(brand.codeCount, offers.filter(offer => offer.toolSlug === brand.slug && offer.code).length);

const reported = offers.find(offer => offer.code) || offers[0];
const report = await page(`/contact?offer=${reported.slug}`);
assert.ok(attr(elements(report, "input").find(node => attr(node, "id") === "form-subject"), "value").includes(reported.toolName));
const message = content(elements(report, "textarea").find(node => attr(node, "id") === "form-message"));
assert.ok(message.includes(`${SITE_URL}/deals/${reported.slug}`));
if (reported.code) assert.ok(message.includes(reported.code));
assert.ok(elements(report, "form").some(node => attr(node, "id") === "contact-form"));
const invalid = await page("/contact?offer=https%3A%2F%2Fevil.example%2F");
assert.equal(attr(elements(invalid, "input").find(node => attr(node, "id") === "form-subject"), "value"), "");
for (const slug of ["beehiiv", "predis-ai"]) {
  const guide = await page(`/discounts/${slug}`);
  assert.ok(content(guide).includes("Paid membership required in reviewed listing"));
  assert.ok(elements(guide, "section").some(node => attr(node, "id") === "compare-costs"));
  assert.ok(elements(guide, "a").some(node => attr(node, "href") === `/contact?brand=${slug}#contact-form`));
}
console.log(`Brand identity audit passed: custom favicon and logo assets, Apple icon, manifest, matching browser/bot metadata, ${brands.length} directory brands, accurate coupon counts, source access disclosures and contextual correction forms.`);
