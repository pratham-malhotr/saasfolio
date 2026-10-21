import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import type { DetailedTool, SaaSDeal } from "@/lib/types";

export const organizationId = absoluteUrl("/#organization");
export const websiteId = absoluteUrl("/#website");

export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": organizationId, name: SITE_NAME, url: absoluteUrl(), description: SITE_DESCRIPTION },
      { "@type": "WebSite", "@id": websiteId, name: SITE_NAME, alternateName: "saasfolio.tech", url: absoluteUrl(), description: SITE_DESCRIPTION, inLanguage: "en", publisher: { "@id": organizationId } },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path),
    })),
  };
}

export function webPageSchema(name: string, description: string, path: string, type = "WebPage") {
  return {
    "@type": type, "@id": absoluteUrl(`${path}#webpage`), url: absoluteUrl(path), name, description,
    inLanguage: "en", isPartOf: { "@id": websiteId }, publisher: { "@id": organizationId },
  };
}

export function collectionSchema(name: string, description: string, path: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...webPageSchema(name, description, path, "CollectionPage"),
        mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items.map((item, index) => ({
          "@type": "ListItem", position: index + 1, name: item.name, url: absoluteUrl(item.path),
        })) },
      },
      breadcrumbSchema([{ name, path }]),
    ],
  };
}

export function softwareSchema(tool: DetailedTool) {
  return {
    "@type": "SoftwareApplication", "@id": absoluteUrl(`/tools/${tool.slug}#software`),
    applicationCategory: tool.category, operatingSystem: "See provider for platform availability",
    featureList: tool.keyFeatures, sameAs: tool.website,
    name: tool.name, description: tool.description, url: absoluteUrl(`/tools/${tool.slug}`),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function howToRedeemSchema(toolName: string, code?: string) {
  return {
    "@type": "HowTo", name: `How to check and claim the ${toolName} offer`,
    step: [
      { "@type": "HowToStep", position: 1, name: "Review eligibility", text: "Read the offer source and current provider terms, including eligible plans and renewal prices." },
      { "@type": "HowToStep", position: 2, name: "Visit the provider", text: `Open the recorded ${toolName} offer link.` },
      { "@type": "HowToStep", position: 3, name: code ? "Try the reported code" : "Choose an eligible plan", text: code ? `Enter ${code} at checkout. Its acceptance is determined by the provider.` : "Follow the provider's signup or application process. No coupon is recorded for this offer." },
      { "@type": "HowToStep", position: 4, name: "Confirm the total", text: "Check the final price, billing period, eligibility and renewal terms before paying." },
    ],
  };
}

export function getDealFaqs(deal: SaaSDeal, tool?: DetailedTool) {
  return [
    { question: `How do I claim this ${deal.toolName} offer?`, answer: deal.code ? `The recorded code is ${deal.code}. Open the offer link, select an eligible plan, and try the code at checkout. ${deal.terms}` : `Open the provider link and follow its signup or application process. ${deal.terms}` },
    { question: `Has this ${deal.toolName} offer been checkout tested?`, answer: `No. ${deal.checkedAt ? `The source page was checked on ${deal.checkedAt.slice(0, 10)}.` : "No current source verification is recorded."} ${deal.sourceKind === "coupon-site" ? "This is a third party reported offer." : "The provider determines availability and eligibility."} Always confirm the price before paying.` },
    { question: `Can I combine this offer with other ${deal.toolName} discounts?`, answer: "Stacking is not assumed. Check the provider's current promotion terms for billing restrictions, eligibility, and whether another code can be used." },
    { question: `Where can I check ${deal.toolName} pricing and alternatives?`, answer: `Use the official provider link for current prices and plan limits.${tool ? ` The ${tool.name} profile also lists product features and related software.` : ""} Prices can differ by region, billing period, and usage.` },
  ];
}
