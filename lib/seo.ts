import type { Metadata } from "next";
import type { SaaSDeal } from "@/lib/types";

// One origin for canonicals, the sitemap, social previews, and entity identifiers.
// Never derive this from a request host (which may be a staging/preview domain).
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech"
).origin;
export const SITE_NAME = "SaaSFolio";
export const SITE_TITLE = "SaaS Discounts, Software Deals & Reviews | SaaSFolio";
export const SITE_DESCRIPTION =
  "Find SaaS discounts and software deals with clear terms, source links and check dates. Compare coupon codes, annual savings and trials before you subscribe.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE_URL}/`).toString().replace(/\/$/, "");
}

export function summarize(text: string, maxLength = 160): string {
  const plain = text.replace(/<[^>]*>/g, "").replace(/\*\*|`|\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  const truncated = plain.slice(0, maxLength - 1);
  const space = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, space > maxLength / 2 ? space : undefined)}…`;
}

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    authors: string[];
    tags: string[];
    section: string;
  };
  image?: string;
}

export function pageMetadata({ title, description, path, noIndex = false, article, image = "/opengraph-image" }: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const summary = summarize(description);
  const images = [{ url: absoluteUrl(image), width: 1200, height: 630, alt: title }];
  return {
    title: { absolute: fullTitle },
    description: summary,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: summary,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      images,
      ...(article ? { type: "article" as const, ...article } : { type: "website" as const }),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: summary, images },
    robots: noIndex ? { index: false, follow: true } : {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
  };
}

// Do not turn relative labels such as "3 hours ago" into invented publish dates.
export function isoDate(value?: string): string | undefined {
  if (!value || !/^(?:\d{4}-\d{2}-\d{2}|[A-Za-z]{3,9} \d{1,2}, \d{4})/.test(value)) return undefined;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : /^[A-Za-z]/.test(value) ? `${value} 00:00:00 GMT` : value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function dealSearchTitle(deal: SaaSDeal): string {
  if (deal.dealType === "pricing") return `${deal.toolName} Pricing & Current Offers`;
  if (deal.code) return `${deal.toolName} Coupon Code: ${deal.code}`;
  if (deal.dealType === "free_plan") return `${deal.toolName} Free Plan: Limits & Eligibility`;
  if (deal.dealType === "free_trial") return `${deal.toolName} Free Trial: Terms & How to Start`;
  return deal.title.toLowerCase().includes(deal.toolName.toLowerCase()) ? deal.title : `${deal.toolName}: ${deal.title}`;
}

export function dealMetaDescription(deal: SaaSDeal): string {
  const type = deal.code ? `Reported ${deal.toolName} coupon code ${deal.code}.` : `${deal.title}.`;
  return summarize(`${type} Check eligibility, redemption steps and source details. ${deal.terms}`, 155);
}

export function toolSearchTitle(toolName: string): string {
  return `${toolName} Pricing, Features & Alternatives`;
}

export function toolMetaDescription(toolName: string, description?: string): string {
  return summarize(`${toolName} pricing, features, alternatives and discount availability. ${description || "Compare software options and check current provider plans."}`, 155);
}
