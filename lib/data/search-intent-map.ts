import { CATEGORY_SEARCH_CONTENT } from "./category-search-content";
import { SAVINGS_COLLECTIONS } from "./savings-collections";

export interface SearchLandingTarget {
  path: string;
  primaryQuery: string;
  relatedQueries: string[];
  intent: string;
}

const categoryQueries: Record<string, { primary: string; related: string[] }> = {
  "ai-tools": { primary: "AI tool discounts", related: ["AI software deals", "AI tool free trials"] },
  marketing: { primary: "marketing software deals", related: ["email marketing software discounts", "newsletter software deals"] },
  "crm-sales": { primary: "CRM software discounts", related: ["sales tool deals", "startup CRM offers"] },
  "dev-tools": { primary: "developer tool discounts", related: ["developer software credits", "API tool deals"] },
  design: { primary: "design software discounts", related: ["creative tool deals", "design software student offers"] },
  analytics: { primary: "analytics software deals", related: ["tracking tool discounts", "analytics software free trials"] },
  hosting: { primary: "web hosting deals", related: ["hosting discounts", "hosting promo codes"] },
  finance: { primary: "invoicing software deals", related: ["billing software discounts", "invoicing software free trials"] },
  productivity: { primary: "productivity software discounts", related: ["workspace deals", "productivity student offers"] },
  security: { primary: "security software deals", related: ["VPN offers", "password tool discounts"] },
  ecommerce: { primary: "ecommerce software deals", related: ["store tool discounts", "checkout software free trials"] },
  "project-management": { primary: "project management software discounts", related: ["team software deals", "nonprofit project management offers"] },
};

// Editorial targeting, not search-volume estimates or evidence of rankings.
// One owning URL per primary intent avoids creating synonym landing pages.
export const SEARCH_LANDING_TARGETS: SearchLandingTarget[] = [
  { path: "/", primaryQuery: "SaaS discounts", relatedQueries: ["software deals", "SaaS savings"], intent: "Discover software savings and choose a specific buying route" },
  { path: "/discounts", primaryQuery: "software discounts by brand", relatedQueries: ["brand SaaS discounts", "software savings guides"], intent: "Find a named provider and compare its eligible savings routes" },
  { path: "/deals", primaryQuery: "SaaS deals", relatedQueries: ["software offers", "SaaS free trials"], intent: "Browse the current sourced offer inventory by its actual type" },
  ...SAVINGS_COLLECTIONS.map(collection => ({ path: `/${collection.slug}`, primaryQuery: collection.navLabel, relatedQueries: {
    "coupon-codes": ["SaaS promo codes", "software discount codes"],
    "startup-deals": ["SaaS discounts for startups", "startup software credits"],
    "student-discounts": ["education software offers", "software discounts for students"],
    "nonprofit-discounts": ["nonprofit SaaS programs", "software discounts for nonprofits"],
  }[collection.slug], intent: collection.answer })),
  ...Object.keys(CATEGORY_SEARCH_CONTENT).map(slug => ({ path: `/deals/category/${slug}`, primaryQuery: categoryQueries[slug].primary, relatedQueries: categoryQueries[slug].related, intent: CATEGORY_SEARCH_CONTENT[slug].answer })),
  { path: "/articles/find-and-use-saas-coupon-codes", primaryQuery: "how to find SaaS coupon codes", relatedQueries: ["check a software promo code", "compare coupon savings"], intent: "Work through source, eligibility and checkout checks without assuming code acceptance" },
  { path: "/articles/startup-software-credits-and-renewal-costs", primaryQuery: "startup software credits", relatedQueries: ["startup credit expiry", "startup software renewal costs"], intent: "Value an approved benefit against covered usage and later paid costs" },
  { path: "/articles/student-software-discounts-after-graduation", primaryQuery: "student software discounts after graduation", relatedQueries: ["education account verification", "student software account ownership"], intent: "Plan verification, ownership and continued software access when student status changes" },
];
