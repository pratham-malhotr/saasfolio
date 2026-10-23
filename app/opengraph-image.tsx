import { ImageResponse } from "next/og";
import { SocialImage } from "@/components/seo/SocialImage";

export const alt = "SaaSFolio — SaaS discounts and software coupon codes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<SocialImage title="Save on SaaS. Find discounts & software coupon codes." />, size);
}
