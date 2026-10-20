import { ImageResponse } from "next/og";
import { SocialImage } from "@/components/seo/SocialImage";

export const alt = "SaaSFolio — SaaS discounts, software deals and reviews";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<SocialImage title="Discover SaaS discounts, software deals & reviews." />, size);
}
