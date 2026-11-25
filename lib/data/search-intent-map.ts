import { CATEGORY_SEARCH_CONTENT } from "./category-search-content";
import { RESEARCH_COMPARISONS } from "./comparison-research";
import { SOFTWARE_REVIEWS } from "./software-reviews";
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
  { path: "/", primaryQuery: "find SaaS tools", relatedQueries: ["software reviews", "web hosting comparisons", "software deals"], intent: "Discover software and choose a comparison, review or savings guide" },
  { path: "/brands", primaryQuery: "software brands A–Z", relatedQueries: ["software brands by category", "SaaS product profiles"], intent: "Look up a software company by name or category" },
  { path: "/tools", primaryQuery: "SaaS product profiles", relatedQueries: ["software features", "pricing links", "software alternatives"], intent: "Evaluate an individual software product and find related tools" },
  { path: "/compare", primaryQuery: "compare SaaS tools", relatedQueries: ["software comparisons", "software pricing models"], intent: "Evaluate two software options against equivalent workflows and plan limits" },
  { path: "/hosting", primaryQuery: "web hosting comparisons", relatedQueries: ["VPS hosting", "managed WordPress hosting", "web hosting provider"], intent: "Shortlist providers by workload, management responsibilities and renewal costs" },
  { path: "/hosting-cost-calculator", primaryQuery: "web hosting renewal cost calculator", relatedQueries: ["hosting introductory rate", "full cost of web hosting", "web hosting renewal price"], intent: "Model comparable introductory and renewal prices from two provider quotes" },
  { path: "/savings-calculator", primaryQuery: "SaaS savings calculator", relatedQueries: ["monthly and annual software costs", "membership fee"], intent: "Calculate annual software savings after including required access fees" },
  { path: "/articles", primaryQuery: "software buying guides", relatedQueries: ["LinkedIn tools", "newsletter platforms", "hosting renewal costs"], intent: "Find researched software reviews, pricing guides and comparisons by topic" },
  { path: "/discounts", primaryQuery: "software discounts by brand", relatedQueries: ["brand SaaS discounts", "software savings guides"], intent: "Find a named provider and compare its eligible savings routes" },
  { path: "/deals", primaryQuery: "SaaS deals", relatedQueries: ["software offers", "SaaS free trials"], intent: "Browse the current sourced offer inventory by its actual type" },
  ...SAVINGS_COLLECTIONS.map(collection => ({ path: `/${collection.slug}`, primaryQuery: collection.navLabel, relatedQueries: {
    "coupon-codes": ["SaaS promo codes", "software discount codes"],
    "startup-deals": ["SaaS discounts for startups", "startup software credits"],
    "student-discounts": ["education software offers", "software discounts for students"],
    "nonprofit-discounts": ["nonprofit SaaS programs", "software discounts for nonprofits"],
  }[collection.slug], intent: collection.answer })),
  ...Object.keys(CATEGORY_SEARCH_CONTENT).map(slug => ({ path: `/deals/category/${slug}`, primaryQuery: categoryQueries[slug].primary, relatedQueries: categoryQueries[slug].related, intent: CATEGORY_SEARCH_CONTENT[slug].answer })),
  ...Object.entries(RESEARCH_COMPARISONS).map(([slug, guide]) => ({
    path: `/compare/${slug}`, primaryQuery: `${guide.toolA} vs ${guide.toolB}`, relatedQueries: [], intent: guide.search.description,
  })),
  ...SOFTWARE_REVIEWS.map(review => ({
    path: `/articles/${review.slug}`, primaryQuery: review.title, relatedQueries: [], intent: review.summary,
  })),
  { path: "/articles/find-and-use-saas-coupon-codes", primaryQuery: "how to find SaaS coupon codes", relatedQueries: ["check a software promo code", "compare coupon savings"], intent: "Work through source, eligibility and checkout checks without assuming code acceptance" },
  { path: "/articles/startup-software-credits-and-renewal-costs", primaryQuery: "startup software credits", relatedQueries: ["startup credit expiry", "startup software renewal costs"], intent: "Value an approved benefit against covered usage and later paid costs" },
  { path: "/articles/student-software-discounts-after-graduation", primaryQuery: "student software discounts after graduation", relatedQueries: ["education account verification", "student software account ownership"], intent: "Plan verification, ownership and continued software access when student status changes" },
  { path: "/articles/taplio-pricing-starter-vs-growth-vs-pro", primaryQuery: "Taplio pricing", relatedQueries: ["Taplio Starter", "Taplio Growth", "Taplio Pro trial"], intent: "Compare Taplio tiers, upfront annual costs and features after the trial" },
  { path: "/articles/taplio-vs-authoredup", primaryQuery: "Taplio vs AuthoredUp", relatedQueries: ["LinkedIn scheduling", "company page publishing", "analytics export"], intent: "Choose a LinkedIn publishing workflow for personal profiles or company pages" },
  { path: "/articles/beehiiv-vs-kit-newsletter", primaryQuery: "beehiiv vs Kit", relatedQueries: ["newsletter free plan", "email sequences", "paid newsletter fees"], intent: "Choose a newsletter platform based on list size, automation and monetization costs" },
  { path: "/articles/systeme-io-free-plan-limits", primaryQuery: "Systeme.io free plan limits", relatedQueries: ["sales funnels", "automation rules", "evergreen webinar"], intent: "Identify the first contact, course or workflow limit that requires a paid plan" },
  { path: "/articles/streamyard-vs-riverside-video-podcast", primaryQuery: "StreamYard vs Riverside for video podcasts", relatedQueries: ["local recording", "separate tracks", "livestream destinations"], intent: "Choose a video podcast studio based on broadcast, editing and track download requirements" },
];
