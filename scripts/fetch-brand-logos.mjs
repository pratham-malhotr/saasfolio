// Fetch each published brand's own icon once and store a local 128px copy.
//
// Sources, in order of preference, all from the brand's own website:
// apple-touch-icon, web-app manifest icons, other <link rel="icon"> entries
// (SVG preferred), then /apple-touch-icon.png. Icons smaller than 48px are
// skipped so a brand keeps its letter badge instead of a blurry logo. Pages are
// read with the same robots-aware fetcher as the offer refresh; visitors'
// browsers never request a third-party logo service.
//
//   node scripts/fetch-brand-logos.mjs [--only=slug,slug] [--force]
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { fetchPublicPage, robotsAllows } from "./lib/offer-sources.mjs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/brand-logos");
const indexFile = path.join(root, "lib/data/brand-logos.json");
const MIN_SOURCE = 48, SIZE = 128, MAX_BYTES = 2_000_000;
const UA = "SaaSFolioBot/1.0 (+https://saasfolio.tech/about)";

const selected = process.argv.find(arg => arg.startsWith("--only="))?.slice(7).split(",");
const force = process.argv.includes("--force");
const { getPublishedTools } = loadCatalogModule("lib/published-catalog.ts");
const index = JSON.parse(await fs.readFile(indexFile, "utf8").catch(() => "{}"));
await fs.mkdir(outDir, { recursive: true });

const tools = getPublishedTools().filter(tool => (!selected || selected.includes(tool.slug)) && (force || !index[tool.slug]));

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1];
const sizeOf = value => Math.max(0, ...String(value || "").split(/\s+/).map(size => Number(size.split("x")[0]) || 0));

function iconCandidates(html, base) {
  const candidates = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = (attr(tag, "rel") || "").toLowerCase();
    const href = attr(tag, "href");
    if (!href || !/icon/.test(rel)) continue;
    const url = new URL(href, base).href;
    const svg = /\.svg(\?|$)/i.test(url) || /svg/.test(attr(tag, "type") || "");
    const size = /apple-touch-icon/.test(rel) ? Math.max(sizeOf(attr(tag, "sizes")), 180) : svg ? 512 : sizeOf(attr(tag, "sizes"));
    candidates.push({ url, size, kind: rel });
  }
  const manifest = (html.match(/<link\b[^>]*rel=["']manifest["'][^>]*>/i) || [])[0];
  return { candidates, manifest: manifest && attr(manifest, "href") ? new URL(attr(manifest, "href"), base).href : undefined };
}

// Many sites publish only favicon.ico. Use its largest image: an embedded PNG,
// or a 32-bit or 8-bit paletted bitmap decoded to RGBA. Other depths are skipped.
function largestIcoImage(buffer) {
  if (buffer.length < 6 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) return undefined;
  const entries = [];
  for (let i = 0; i < buffer.readUInt16LE(4); i++) {
    const entry = 6 + i * 16;
    if (entry + 16 > buffer.length) break;
    const size = buffer.readUInt32LE(entry + 8), offset = buffer.readUInt32LE(entry + 12);
    const data = buffer.subarray(offset, offset + size);
    if (data.length === size) entries.push({ width: buffer[entry] || 256, data });
  }
  for (const { data } of entries.sort((a, b) => b.width - a.width)) {
    if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { input: data };
    if (data.length < 40 || data.readUInt32LE(0) !== 40) continue;
    const width = data.readInt32LE(4), height = data.readInt32LE(8) / 2, bpp = data.readUInt16LE(14);
    if (width <= 0 || height <= 0 || ![8, 32].includes(bpp)) continue;
    const rgba = Buffer.alloc(width * height * 4);
    if (bpp === 32) {
      if (40 + width * height * 4 > data.length) continue;
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const from = 40 + ((height - 1 - y) * width + x) * 4, to = (y * width + x) * 4;
        rgba[to] = data[from + 2]; rgba[to + 1] = data[from + 1]; rgba[to + 2] = data[from]; rgba[to + 3] = data[from + 3];
      }
    } else {
      // 8-bit paletted image followed by a 1-bit transparency (AND) mask; rows pad to 4 bytes.
      const colors = data.readUInt32LE(32) || 256, palette = 40, pixels = palette + colors * 4;
      const row = Math.ceil(width / 4) * 4, maskRow = Math.ceil(width / 32) * 4, mask = pixels + row * height;
      if (mask + maskRow * height > data.length) continue;
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const source = height - 1 - y, color = palette + data[pixels + source * row + x] * 4, to = (y * width + x) * 4;
        const transparent = (data[mask + source * maskRow + (x >> 3)] >> (7 - (x & 7))) & 1;
        rgba[to] = data[color + 2]; rgba[to + 1] = data[color + 1]; rgba[to + 2] = data[color]; rgba[to + 3] = transparent ? 0 : 255;
      }
    }
    return { input: rgba, raw: { width, height, channels: 4 } };
  }
  return undefined;
}

async function download(url) {
  if (!url.startsWith("https://")) throw new Error("not https");
  const response = await fetch(url, { headers: { "User-Agent": UA, Accept: "image/*,application/manifest+json,application/json" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_BYTES) throw new Error("too large");
  return { buffer, type: response.headers.get("content-type") || "" };
}

async function logoFor(tool) {
  const site = new URL(tool.website);
  // A project hosted on a code-hosting site would get that platform's logo instead of its own.
  if (/(^|\.)(github\.com|gitlab\.com)$/.test(site.hostname) && !["github", "gitlab"].includes(tool.slug)) throw new Error("Hosted on a code platform; no brand-owned icon");
  const robots = await fetchPublicPage(`${site.origin}/robots.txt`).then(page => page.html, () => "");
  if (!robotsAllows(robots, "/")) throw new Error("Disallowed by robots.txt");
  const page = await fetchPublicPage(site.origin + "/");
  const { candidates, manifest } = iconCandidates(page.html, page.url);
  if (manifest) {
    try {
      const icons = JSON.parse((await download(manifest)).buffer.toString("utf8")).icons || [];
      for (const icon of icons) if (icon.src) candidates.push({ url: new URL(icon.src, manifest).href, size: sizeOf(icon.sizes) || 192, kind: "manifest" });
    } catch { /* a broken manifest is not fatal */ }
  }
  candidates.push({ url: `${site.origin}/apple-touch-icon.png`, size: 180, kind: "apple-touch-icon (default path)" });
  candidates.push({ url: `${site.origin}/favicon.ico`, size: 1, kind: "favicon.ico (default path)" });
  candidates.sort((a, b) => b.size - a.size);
  for (const candidate of candidates.filter((item, i, all) => all.findIndex(other => other.url === item.url) === i)) {
    try {
      const { buffer: raw } = await download(candidate.url);
      const ico = largestIcoImage(raw);
      const image = ico?.raw ? sharp(ico.input, { raw: ico.raw }) : sharp(ico?.input || raw, { density: 300 });
      const meta = await image.metadata();
      if (!meta.width || meta.width < MIN_SOURCE || !meta.height || meta.height < MIN_SOURCE) continue;
      const png = await image.resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 }).toBuffer();
      await fs.writeFile(path.join(outDir, `${tool.slug}.png`), png);
      return { src: `/brand-logos/${tool.slug}.png`, source: candidate.url, sourceWidth: meta.width, fetchedAt: new Date().toISOString().slice(0, 10) };
    } catch { /* try the next candidate */ }
  }
  throw new Error("No icon of at least 48px");
}

let cursor = 0, saved = 0;
const failures = [];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < tools.length) {
    const tool = tools[cursor++];
    try { index[tool.slug] = await logoFor(tool); saved++; } catch (error) { failures.push(`${tool.slug}: ${error.message}`); }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}));
await fs.writeFile(indexFile, `${JSON.stringify(Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b))), null, 2)}\n`);
// Browser code only needs to know which brands have a logo.
await fs.writeFile(path.join(root, "lib/data/brand-logo-slugs.json"), `${JSON.stringify(Object.keys(index).sort())}\n`);
console.log(JSON.stringify({ attempted: tools.length, saved, failed: failures.length }));
for (const failure of failures) console.log(`  - ${failure}`);
