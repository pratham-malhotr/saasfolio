import { ImageResponse } from "next/og";
import { SocialImage } from "@/components/seo/SocialImage";

export const alt = "SaaSFolio software discovery, reviews and sourced deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<SocialImage title="Find SaaS tools. Buy with clarity." label="SOFTWARE REVIEWS, COMPARISONS & DEALS" />, size);
}
