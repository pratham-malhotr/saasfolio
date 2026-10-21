import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getAllTools, getToolBySlug } from "@/lib/data/tools-data";
import { hasBrandDiscountPage, brandDiscountTitle } from "@/lib/brand-discounts";
import { SocialImage } from "@/components/seo/SocialImage";

export const alt = "Brand discounts, coupon availability and savings guides on SaaSFolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllTools().filter(tool => hasBrandDiscountPage(tool.slug)).map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool || !hasBrandDiscountPage(tool.slug)) notFound();
  return new ImageResponse(<SocialImage title={brandDiscountTitle(tool)} label="BRAND SAVINGS GUIDE · SOURCED OFFERS" />, size);
}
