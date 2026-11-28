import type { Metadata } from "next";
import type { DetailedTool, SaaSDeal } from "@/lib/types";

// One origin for canonicals, the sitemap, social previews, and entity identifiers.
// Never derive this from a request host (which may be a staging/preview domain).
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech"
).origin;
export const SITE_NAME = "SaaSFolio";
export const SITE_TITLE = "Find SaaS Tools, Software Reviews & Deals | SaaSFolio";
export const SITE_DESCRIPTION =
  "Find SaaS tools, compare software and web hosting, and check sourced deals, subscription prices and renewal costs before you buy.";

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

// Offer titles lead with the saving and carry the month of the offer's last
// source check (offers older than 14 days are not published at all).
export function dealSearchTitle(deal: SaaSDeal): string {
  if (deal.dealType === "pricing") return `${deal.toolName} Pricing & Current Offers`;
  const checked = Date.parse(deal.checkedAt || "");
  const month = Number.isFinite(checked) ? ` (${new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(checked)})` : "";
  const dated = (title: string) => (title + month).length <= 62 ? title + month : title;
  const value = deal.discountPercentage > 0 ? `${deal.discountKind === "up-to" ? "Up to " : ""}${deal.discountPercentage}% Off` : "";
  if (deal.code) return dated(value ? `${deal.toolName} Coupon Code ${deal.code}: ${value}` : `${deal.toolName} Coupon Code: ${deal.code}`);
  if (deal.dealType === "free_plan") return dated(`${deal.toolName} Free Plan: Limits & Eligibility`);
  if (deal.dealType === "free_trial") return dated(`${deal.toolName} Free Trial: Terms & How to Start`);
  return dated(deal.title.toLowerCase().includes(deal.toolName.toLowerCase()) ? deal.title : `${deal.toolName}: ${deal.title}`);
}

export function dealMetaDescription(deal: SaaSDeal): string {
  const value = deal.discountPercentage > 0 ? ` for ${deal.discountKind === "up-to" ? "up to " : ""}${deal.discountPercentage}% off` : "";
  const type = deal.code ? `Reported ${deal.toolName} coupon code ${deal.code}${value}.` : `${deal.title}.`;
  return summarize(`${type} Check eligibility, redemption steps and source details. ${deal.terms}`, 155);
}

const profileSearchCopy: Record<string, { topic: string; description: string }> = {
  taplio: { topic: "LinkedIn Scheduling & Analytics", description: "Explore Taplio for LinkedIn scheduling, post drafting and analytics. Compare how the workflow fits a personal profile, a team or a native LinkedIn setup." },
  beehiiv: { topic: "Newsletter Publishing & Monetization", description: "Explore beehiiv for newsletter publishing, subscriber growth and paid subscriptions. Compare its workflow, portability and alternatives for your publication." },
  convertkit: { topic: "Email Marketing & Automations", description: "Explore Kit, formerly ConvertKit, for newsletters, email sequences and digital products. Compare automation needs and what changes as your list grows." },
  "systeme-io": { topic: "Sales Funnels, Email & Courses", description: "See how Systeme.io fits a sales funnel, email sequence or online course. Compare the publishing workflow, limits and subscription options before you switch." },
  "snov-io": { topic: "Email Finder, Verification & Outreach", description: "Explore Snov.io for email finding, verification and outreach. Compare credit usage, mailbox requirements and the scope of the workflow you need." },
  smartlead: { topic: "Cold Email Sequences & Mailboxes", description: "Explore Smartlead for cold email sequences and mailbox management. Compare pricing by usage, required sending infrastructure and alternative workflows." },
  streamyard: { topic: "Live Streaming & Multistreaming", description: "Explore StreamYard for browser-based live streams and recordings. Compare guest workflows, destinations, recording requirements and plan limits." },
  "predis-ai": { topic: "AI Social Media Content & Scheduling", description: "Explore Predis.ai for AI social media assets and scheduling. Compare generation allowances, publishing workflows and alternative tools." },
  baremetrics: { topic: "SaaS MRR, Churn & Subscription Analytics", description: "Explore Baremetrics for SaaS subscription analytics. Compare MRR, churn reporting, billing integrations and the plan requirements for your revenue data." },
  anytrack: { topic: "Conversion Tracking & Attribution", description: "Explore AnyTrack for conversion tracking and attribution. Compare event allowances, integrations and the sources you need to connect before purchasing." },
};

export function toolSearchTitle(tool: Pick<DetailedTool, "slug" | "name">): string {
  const topic = profileSearchCopy[tool.slug]?.topic;
  return topic ? `${tool.name}: ${topic}` : `${tool.name} Pricing, Features & Alternatives`;
}

export function toolMetaDescription(tool: Pick<DetailedTool, "slug" | "name" | "description">): string {
  return summarize(profileSearchCopy[tool.slug]?.description ||
    `${tool.description} Review ${tool.name} features, provider pricing and alternatives.`, 155);
}
