import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { brandMarkSvg } from "../lib/brand-mark.mjs";

const root = new URL("../", import.meta.url);
const svg = brandMarkSvg();
await mkdir(new URL("public/brand/", root), { recursive: true });
await writeFile(new URL("public/brand/saasfolio-icon.svg", root), svg);
for (const size of [48, 96, 192, 512]) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(new URL(`public/brand/icon-${size}.png`, root).pathname);
}
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile(new URL("app/apple-icon.png", root).pathname);
const sizes = [16, 32, 48, 64];
const images = await Promise.all(sizes.map(size => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + 16 * sizes.length);
directory.writeUInt16LE(1, 2); directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (let index = 0; index < sizes.length; index++) {
  const at = 6 + index * 16;
  directory[at] = sizes[index]; directory[at + 1] = sizes[index];
  directory.writeUInt16LE(1, at + 4); directory.writeUInt16LE(32, at + 6);
  directory.writeUInt32LE(images[index].length, at + 8); directory.writeUInt32LE(offset, at + 12);
  offset += images[index].length;
}
await writeFile(new URL("app/favicon.ico", root), Buffer.concat([directory, ...images]));
console.log("Generated SaaSFolio SVG, 48/96/192/512 PNGs, Apple icon and 16/32/48/64 ICO.");
