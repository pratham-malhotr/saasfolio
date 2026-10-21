import React from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getAllDeals, getDealBySlug } from "@/lib/data/deals-data";
import { getToolBySlug } from "@/lib/data/tools-data";
import { DealDetailClient } from "@/components/deals/DealDetailClient";
import type { Metadata } from "next";
import { pageMetadata, dealSearchTitle, dealMetaDescription } from "@/lib/seo";
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

export async function generateStaticParams() {
  const deals = getAllDeals();
  return deals.map((deal) => ({
    slug: deal.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const deal = getDealBySlug(slug);

  if (!deal) notFound();

  return pageMetadata({
    title: dealSearchTitle(deal),
    description: dealMetaDescription(deal),
    path: `/deals/${deal.slug}`,
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
  const deal = getDealBySlug(slug);

  if (!deal) {
    notFound();
  }

  if (slug !== deal.slug) permanentRedirect(`/deals/${deal.slug}`);

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
