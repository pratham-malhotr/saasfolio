import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SocialImage } from "@/components/seo/SocialImage";
export const alt = "SaaSFolio web hosting comparisons and VPS buying guides";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const backgroundImage = `data:image/webp;base64,${(await readFile(path.join(process.cwd(), "public/images/hosting/vps-comparison.webp"))).toString("base64")}`;
  return new ImageResponse(<SocialImage title="Web hosting comparisons" label="VPS, MANAGED WORDPRESS & APP PLATFORMS" backgroundImage={backgroundImage} />, size);
}
