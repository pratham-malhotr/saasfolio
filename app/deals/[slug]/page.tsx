import React from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getAllDeals, getDealBySlug, getRetiredOfferToolSlug } from "@/lib/data/deals-data";
import { getToolBySlug } from "@/lib/data/tools-data";
import { DealDetailClient } from "@/components/deals/DealDetailClient";
import type { Metadata } from "next";
import { pageMetadata, dealSearchTitle, dealMetaDescription, toolSearchTitle, toolMetaDescription } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbSchema,
  webPageSchema,
  softwareSchema,
  faqSchema,
  howToRedeemSchema,
  getDealFaqs,
} from "@/lib/structured-data";
import { getComparisonHref } from "@/lib/catalog-links";
import { hasBrandDiscountPage, getBrandDiscountData, brandDiscountTitle, brandDiscountDescription } from "@/lib/brand-discounts";

export async function generateStaticParams() {
  const deals = getAllDeals();
  return deals.map((deal) => ({
    slug: deal.slug,
  }));
}

function resolveDeal(slug: string) {
  const retiredBrand = getRetiredOfferToolSlug(slug);
  if (retiredBrand) {
    const tool = getToolBySlug(retiredBrand);
    if (!tool || tool.providerStatus === "unavailable") notFound();
    const discountData = hasBrandDiscountPage(tool.slug) ? getBrandDiscountData(tool) : undefined;
    return {
      kind: "retired" as const,
      tool,
      discountData: discountData?.indexable ? discountData : undefined,
      path: discountData?.indexable ? `/discounts/${tool.slug}` : `/tools/${tool.slug}`,
    };
  }
  const deal = getDealBySlug(slug);
  if (!deal) notFound();
  return { kind: "active" as const, deal, path: `/deals/${deal.slug}` };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const target = resolveDeal(slug);
  // Only the page emits redirects. Next.js resolves metadata and the page in
  // parallel; redirecting from both can append duplicate Location headers.
  if (target.kind === "retired") {
    return pageMetadata({
      title: target.discountData ? brandDiscountTitle(target.tool) : toolSearchTitle(target.tool.name),
      description: target.discountData
        ? brandDiscountDescription(target.tool, target.discountData.offers)
        : toolMetaDescription(target.tool.name, target.tool.description),
      path: target.path,
    });
  }
  const { deal } = target;

  return pageMetadata({
    title: dealSearchTitle(deal),
    description: dealMetaDescription(deal),
    path: target.path,
    noIndex: deal.dealType === "pricing",
  });
}

export const revalidate = 3600;

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = resolveDeal(slug);
  if (target.kind === "retired" || slug !== target.deal.slug) permanentRedirect(target.path);
  const { deal } = target;

  const tool = getToolBySlug(deal.toolSlug);
  const allDeals = getAllDeals();
  const relatedDeals = allDeals.filter(
    (d) => d.categorySlug === deal.categorySlug && d.id !== deal.id
  );
  const siblingDeals = allDeals.filter(
    (d) => d.toolSlug === deal.toolSlug && d.id !== deal.id
  );
  const faqs = getDealFaqs(deal, tool);

  return (
    <div className="min-h-screen bg-[#050505]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              ...webPageSchema(
                dealSearchTitle(deal),
                dealMetaDescription(deal),
                `/deals/${deal.slug}`
              ),
              ...(tool ? { about: { "@id": softwareSchema(tool)["@id"] } } : {}),
            },
            ...(tool ? [softwareSchema(tool)] : []),
            breadcrumbSchema([
              { name: "SaaS Deals", path: "/deals" },
              { name: `${deal.toolName} Discount`, path: `/deals/${deal.slug}` },
            ]),
            howToRedeemSchema(deal.toolName, deal.code),
            faqSchema(faqs),
          ],
        }}
      />
      <DealDetailClient
        deal={deal}
        discountHref={hasBrandDiscountPage(deal.toolSlug) ? `/discounts/${deal.toolSlug}` : undefined}
        tool={tool}
        faqs={faqs}
        siblingDeals={siblingDeals}
        relatedDeals={relatedDeals}
        comparisonHref={
          tool ? getComparisonHref(tool.slug, tool.alternatives[0]?.slug) : "/compare"
        }
      />
    </div>
  );
}
