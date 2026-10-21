import type { DetailedTool } from "@/lib/types";

// Provider-backed additions. No invented prices, ratings or customer reviews.
export const REVIEWED_BRAND_TOOLS: DetailedTool[] = [{
  id: "tool-ocoya", name: "Ocoya", slug: "ocoya",
  tagline: "Social publishing, content creation and team workflows",
  description: "Ocoya combines social media scheduling, AI-assisted content creation and team workflows. Compare profile limits, shared credits and current trial terms.",
  longDescription: "Ocoya is a social media platform for preparing content and scheduling posts across connected profiles. Its official product pages describe publishing, campaigns, a design studio, a social inbox, workflows and integrations. Evaluate a complete publishing cycle with the profiles you manage, then compare user access, social profile capacity and monthly credits on the official pricing page.",
  category: "Growth & Marketing", categorySlug: "marketing",
  website: "https://www.ocoya.com", sourceUrl: "https://www.ocoya.com/pricing", pricingUrl: "https://www.ocoya.com/pricing",
  logoLetter: "O", rating: 0, reviewCount: 0, pricingStart: 0, pricingModel: "Free Trial",
  verified: false, pricingVerified: false, updatedAt: "2026-10-21T00:00:00.000Z",
  bestFor: "Creators and teams preparing and scheduling content across social profiles",
  keyFeatures: ["Social publishing and scheduling", "AI-assisted content creation", "Design studio", "Team workflows", "Social inbox", "API and integrations"],
  pros: [], cons: [], pricingPlans: [], reviews: [], dealsCount: 0,
  alternatives: [
    { name: "Predis.ai", slug: "predis-ai", tagline: "AI content and visual generation", rating: 0 },
    { name: "Taplio", slug: "taplio", tagline: "LinkedIn writing and publishing workflow", rating: 0 },
  ],
}];

// Refresh the priority profiles' descriptive copy alongside their savings guides.
export const REVIEWED_BRAND_COPY: Record<string, Pick<DetailedTool, "description" | "longDescription" | "keyFeatures">> = {
  beehiiv: {
    description: "Beehiiv is a newsletter platform with publishing, audience tools and paid-plan growth features. Compare subscriber tiers, billing and current plan limits.",
    longDescription: "Beehiiv combines newsletter publishing with website and audience tools. Its current pricing distinguishes Free, Lite, Pro and Enterprise plans. Compare the features required for your publication at its subscriber count, then evaluate migration, automation and monetization workflows before selecting a paid billing period. The savings guide explains annual billing and coupon availability separately from free access.",
    keyFeatures: ["Newsletter publishing", "Website and landing pages", "Audience tools", "Paid-plan automation", "Subscription and ad monetization options", "Plan-dependent analytics and integrations"],
  },
  "snov-io": {
    description: "Snov.io combines prospect search, email verification and outreach tools. Compare Sales Suite allowances with separate LinkedIn and enrichment requirements.",
    longDescription: "Snov.io provides tools for finding prospects, verifying email addresses, running outreach and managing a sales pipeline. Its pricing distinguishes Sales Suite, LinkedIn Automation and data enrichment. Compare credits, recipients and service-specific charges for your actual workflow. Use an evaluation sample to check data usefulness and integration fit; the subscription does not guarantee replies or inbox placement.",
    keyFeatures: ["Prospect and email search", "Email verification", "Outreach campaigns", "CRM", "Separately priced LinkedIn Automation", "Token-based enrichment"],
  },
  "predis-ai": {
    description: "Predis.ai helps create social visuals, videos, carousels and captions. Compare generation credits, brand capacity and publishing options before subscribing.",
    longDescription: "Predis.ai is an AI content platform for producing social media visuals, videos and ad creatives. Compare the content formats you need, how much generation usage your workflow consumes and the number of brands and social channels you manage. Test finished assets before committing to a billing period, and review the trial deadline and any additional credit or channel costs on official pricing.",
    keyFeatures: ["AI visual and video generation", "Social posts and carousels", "Ad creative generation", "Brand-based workflows", "Plan-dependent scheduling and publishing", "Generation credits and optional add-ons"],
  },
};
