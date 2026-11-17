import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SocialImage } from "@/components/seo/SocialImage";
export const alt = "SaaSFolio hosting research, VPS comparisons and cost calculator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const backgroundImage = `data:image/webp;base64,${(await readFile(path.join(process.cwd(), "public/images/hosting/vps-comparison.webp"))).toString("base64")}`;
  return new ImageResponse(<SocialImage title="Your next host. A better reason to choose it." label="THE HOSTING DECISION DESK" backgroundImage={backgroundImage} />, size);
}
