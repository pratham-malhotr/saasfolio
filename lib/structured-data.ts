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
    "@type": "Thing", "@id": absoluteUrl(`/tools/${tool.slug}#software`),
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
    "@type": "HowTo",
    name: `How to Apply Your ${toolName} Discount Coupon`,
    description: `Step-by-step instructions to redeem verified promo codes and claim active discounts on ${toolName}.`,
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Reveal Promo Code",
        text: `Click the 'Reveal Code' button on SaaSFolio to reveal and automatically copy your ${toolName} discount code${code ? ` (${code})` : ""}.`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: `Open ${toolName} Official Checkout`,
        text: `Navigate to the official ${toolName} checkout page with your discount link pre-activated.`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Apply Coupon Code",
        text: `Paste your coupon code into the 'Promo Code' or 'Discount Voucher' input field at checkout.`,
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Confirm Discounted Total",
        text: `Verify that your final price reflects the discount before completing payment.`,
      },
    ],
  };
}

export function getDealFaqs(deal: SaaSDeal, tool?: DetailedTool) {
  const toolName = deal.toolName;
  const discount = `${deal.discountPercentage}%`;
  const code = deal.code ? `"${deal.code}"` : "the verified partner rate";

  return [
    {
      question: `How do I get a discount on ${toolName}?`,
      answer: `You can get ${discount} off ${toolName} by using promo code ${code} at checkout. SaaSFolio hand-tests and verifies working discount rates directly with software vendors so you never run into expired codes.`,
    },
    {
      question: `Does ${toolName} have an active coupon code in 2026?`,
      answer: `Yes, the current verified coupon code for ${toolName} is ${code}, which provides ${discount} off eligible ${toolName} plans. This coupon was verified working today with a ${deal.successRate}% verified success rate.`,
    },
    {
      question: `Can I use this ${toolName} discount on annual billing?`,
      answer: `Yes, in most cases ${toolName} allows stacking coupon codes with annual billing cycles, which typically provides an extra 15% to 20% discount (or 2 full months free) compared to monthly billing.`,
    },
    {
      question: `Does ${toolName} offer a free trial or free tier?`,
      answer: `${toolName} provides ${tool?.pricingModel === "Freemium" ? "a free forever plan alongside its premium tiers" : "a free trial for new users"} so you can test features before paying.`,
    },
    {
      question: `What should I do if the ${toolName} promo code does not apply?`,
      answer: `Make sure the promo code is pasted without leading or trailing spaces. Some coupons apply exclusively to specific plans (such as Growth or Scale tiers) or to first-time customer accounts. You can also click our direct partner checkout button to activate the discount automatically.`,
    },
  ];
}
