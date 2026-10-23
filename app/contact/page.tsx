import ContactClient from "@/components/contact/ContactClient";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/seo";
import { getDealBySlug } from "@/lib/data/deals-data";
import { getToolBySlug } from "@/lib/data/tools-data";
import { hasBrandDiscountPage } from "@/lib/brand-discounts";

export const metadata = pageMetadata({
  title: 'Contact SaaSFolio',
  description: 'Contact SaaSFolio for help with software discounts, SaaS listings, editorial reviews, partnerships and account questions.',
  path: "/contact",
});

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const validSlug = (value: string | string[] | undefined) => typeof value === "string" && value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : undefined;
  const offerSlug = validSlug(query.offer), brandSlug = validSlug(query.brand);
  const offer = offerSlug ? getDealBySlug(offerSlug) : undefined;
  const brand = brandSlug ? getToolBySlug(brandSlug) : undefined;
  const name = offer?.toolName || brand?.name;
  const path = offer ? `/deals/${offerSlug}` : brand ? `/${hasBrandDiscountPage(brand.slug) ? "discounts" : "tools"}/${brand.slug}` : undefined;
  const initialReport = name && path ? { subject: `${name}: offer or link correction`, message: `Listing: ${absoluteUrl(path)}\n${offer?.code ? `Recorded code: ${offer.code}\n` : ""}\nIssue (expired code, eligibility, pricing or broken link):\n\nPlan and billing period:\n\nWhat happened, and the current provider terms:\n` } : undefined;
  return <ContactClient key={path || "general"} initialReport={initialReport} />;
}
