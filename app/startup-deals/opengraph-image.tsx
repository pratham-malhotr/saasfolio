import { ImageResponse } from "next/og";
import { SocialImage } from "@/components/seo/SocialImage";
import { getSavingsCollection } from "@/lib/data/savings-collections";

export const alt = "startup deals on SaaSFolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<SocialImage title={getSavingsCollection("startup-deals")!.heading} label="SOFTWARE SAVINGS · ELIGIBILITY & TERMS" />, size);
}
