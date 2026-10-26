import type { DetailedTool } from "@/lib/types";
import { DISCOUNT_REVIEWED_PROFILE_COPY } from "@/lib/data/discount-reviewed-profile-copy";

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
export const REVIEWED_BRAND_COPY: Record<string, Pick<DetailedTool, "description" | "longDescription" | "keyFeatures"> & Partial<Pick<DetailedTool, "name" | "website" | "pricingUrl" | "updatedAt" | "pricingModel">>> = {
  ...DISCOUNT_REVIEWED_PROFILE_COPY,
  canva: {
    pricingUrl: "https://www.canva.com/pricing/", updatedAt: "2026-10-23T00:00:00.000Z",
    description: "Canva provides visual design and publishing tools for individuals and teams. Compare workspace requirements and separately approved nonprofit or K–12 education access.",
    longDescription: "Canva combines design, presentations and publishing workflows with shared assets and team collaboration. Test the formats, asset permissions and approval routine needed by your organization before choosing a workspace package. Nonprofit and K–12 education programs have their own eligibility and verification; neither is a universal commercial coupon. The discount guide compares the relevant purchase routes without inventing a public code.",
    keyFeatures: ["Visual design and presentations", "Publishing and exports", "Shared brand assets", "Team collaboration", "Plan-dependent creative tools", "Separate nonprofit and education programs"],
  },
  figma: {
    pricingUrl: "https://www.figma.com/pricing/", updatedAt: "2026-10-23T00:00:00.000Z",
    description: "Figma provides collaborative design and product workflows with different seat capabilities. Compare design, development and review roles with verified education access.",
    longDescription: "Figma supports collaborative design, prototypes and product handoff. Map each collaborator's editing, development or review requirements to the current seat choices before estimating a team invoice. Check how new paid seats and role changes are billed during the selected term. Verified education access is a separate program, and the savings guide distinguishes that entitlement from commercial licensing and public coupon availability.",
    keyFeatures: ["Collaborative interface design", "Prototyping", "Design systems", "Development handoff", "Role-based seat capabilities", "Verified education access"],
  },
  clickup: {
    pricingUrl: "https://clickup.com/pricing", updatedAt: "2026-10-23T00:00:00.000Z",
    description: "ClickUp combines tasks, project views and team workflows. Compare the complete Workspace package, paid members, additional capabilities and approved organization pricing.",
    longDescription: "ClickUp provides a Workspace for managing tasks and project delivery. Evaluate the views, automation and collaboration needed for a complete project before comparing subscriptions. Count the actual paid users and any separately purchased capabilities. Annual billing and customized nonprofit or educator pricing have different eligibility; the brand guide explains how to compare an approved quote without assuming a universal percentage or stacking rule.",
    keyFeatures: ["Tasks and project views", "Documents", "Team collaboration", "Workflow automation", "Project reporting", "Plan-dependent additional capabilities"],
  },
  slack: {
    pricingUrl: "https://slack.com/pricing", updatedAt: "2026-10-23T00:00:00.000Z",
    description: "Slack supports team messaging and shared workspaces. Compare the capabilities and members you need, including Workspace-specific approval for nonprofit programs.",
    longDescription: "Slack organizes team communication through workspaces and channels. Identify the conversation history, integrations and administrative requirements of the team before choosing a paid package. Nonprofit access depends on organization eligibility, Workspace membership and the approved plan. The savings guide explains application scope and billing considerations rather than presenting the program as a public coupon for every customer.",
    keyFeatures: ["Team messaging", "Channels and workspaces", "Shared conversation history", "App integrations", "Plan-dependent administration", "Separate nonprofit eligibility program"],
  },
  loom: {
    pricingUrl: "https://www.loom.com/pricing", updatedAt: "2026-10-23T00:00:00.000Z",
    description: "Loom provides video recording, sharing and collaboration. Compare creator roles, recording requirements and plan-dependent AI with current verified education discounts.",
    longDescription: "Loom supports recording and sharing video explanations with colleagues and other viewers. Test the recording, editing and sharing experience before comparing a team purchase. Count the people requiring paid creation access and confirm the package containing any required AI capabilities. Current Atlassian education guidance describes verified discounts rather than the former completely free education entitlement; the brand guide links to those current terms.",
    keyFeatures: ["Video recording", "Video sharing", "Comments and collaboration", "Transcripts", "Plan-dependent AI capabilities", "Verified education discounts"],
  },
  miro: {
    pricingUrl: "https://miro.com/pricing/", updatedAt: "2026-10-23T00:00:00.000Z",
    description: "Miro provides collaborative boards and workshop tools. Compare paid team requirements, verified education access and the specific combination rules for nonprofit pricing.",
    longDescription: "Miro supports shared boards, visual planning and workshops. Evaluate the contribution, ownership and retrieval workflow with the people who will use the team. Education and nonprofit access require their own eligibility checks. The nonprofit help describes a specific annual-price combination on eligible plans; the savings guide distinguishes that rule from a general ability to stack promotions or add percentages together.",
    keyFeatures: ["Collaborative boards", "Visual planning", "Workshop collaboration", "Diagramming", "Team sharing", "Separate education and nonprofit programs"],
  },
  mailerlite: {
    pricingUrl: "https://www.mailerlite.com/pricing",
    updatedAt: "2026-10-23T00:00:00.000Z",
    description: "MailerLite combines email campaigns, automations, signup forms and websites. Compare subscriber and sending allowances, yearly billing and nonprofit eligibility.",
    longDescription: "MailerLite is an email marketing platform for newsletters, automations, forms and landing pages. Compare the current package for your audience and sending schedule rather than relying on an older plan name. Evaluate a complete signup and campaign workflow, then check team access, applicable taxes and the terms of annual or approved nonprofit pricing in the savings guide.",
    keyFeatures: ["Email campaigns and automations", "Signup forms and landing pages", "Subscriber management", "Plan-dependent sending and user capacity", "Website and digital product tools", "API and integrations"],
  },
  convertkit: {
    name: "Kit (ConvertKit)",
    website: "https://kit.com",
    pricingUrl: "https://kit.com/pricing",
    updatedAt: "2026-10-23T00:00:00.000Z",
    description: "Kit, formerly ConvertKit, provides creator email marketing, forms and automations. Compare current subscriber tiers, paid features and annual billing options.",
    longDescription: "Kit is the current brand for the creator email platform formerly called ConvertKit. Its tools support forms, broadcasts, email automations and creator monetization workflows. Compare the current package at your subscriber count and test migration and launch sequences before committing. Historical ConvertKit prices or coupon descriptions should be checked against the current Kit account and billing terms.",
    keyFeatures: ["Email broadcasts", "Forms and landing pages", "Visual automations", "Subscriber tagging and segmentation", "Creator commerce and newsletter tools", "Plan-dependent reporting and integrations"],
  },
  notion: {
    website: "https://www.notion.com",
    pricingUrl: "https://www.notion.com/pricing",
    updatedAt: "2026-10-23T00:00:00.000Z",
    description: "Notion combines documents, databases and team workflows. Compare workspace plans, paid members, AI requirements and eligibility for education or nonprofit programs.",
    longDescription: "Notion provides a workspace for documents, notes, databases and collaborative workflows. Identify the members, permissions, history and AI capabilities the team requires, then compare the complete package and any additional usage charges. Personal education access and nonprofit pricing use their own eligibility processes; review the savings guide before treating either as a general team discount.",
    keyFeatures: ["Documents and notes", "Databases and project workflows", "Team collaboration", "Forms and published pages", "Plan-dependent AI capabilities", "Education and nonprofit eligibility programs"],
  },
  framer: {
    pricingUrl: "https://www.framer.com/pricing",
    updatedAt: "2026-10-23T00:00:00.000Z",
    description: "Framer is a visual website design and publishing platform. Compare Site plans, CMS needs, editor access and the terms of its student website program.",
    longDescription: "Framer combines visual website design with publishing and CMS features. Evaluate the page structure, content collections, traffic and editing workflow required by the site. Compare the total publishing cost, including any seats, domains and optional features. The official student program has an application and permitted-use conditions; it should not be assumed to cover a commercial client project.",
    keyFeatures: ["Visual website design", "Website publishing", "CMS collections", "Responsive layouts", "Team editing", "Plan-dependent localization and site features"],
  },
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
