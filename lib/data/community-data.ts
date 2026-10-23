export interface ThreadComment {
  id: string;
  author: {
    username: string;
    avatarLetter: string;
    badge: "PRO FOUNDER" | "DEAL HUNTER" | "STAFF ARCHITECT" | "VERIFIED MKTG" | "FOUNDER" | "MEMBER";
    reputation: number;
  };
  content: string;
  createdAt: string;
  upvotes: number;
  replies?: ThreadComment[];
}

export interface DetailedCommunityThread {
  id: string;
  title: string;
  slug: string;
  category: "Dev Tools" | "SaaS Economics" | "Analytics" | "AI Tools" | "Growth & Marketing";
  content: string;
  author: {
    username: string;
    name: string;
    avatarLetter: string;
    badge: "PRO FOUNDER" | "DEAL HUNTER" | "STAFF ARCHITECT" | "VERIFIED MKTG" | "LOCAL DRAFT" | "EDITORIAL";
    reputation: number;
  };
  upvotes: number;
  commentCount: number;
  viewsCount: number;
  createdAt: string;
  toolTags: { name: string; slug: string }[];
  hot?: boolean;
  solved?: boolean;
  comments: ThreadComment[];
}

const prompts = [
  { slug: "indispensable-developer-tool-2026", title: "Which software subscription earns its place in your budget?", category: "Dev Tools", content: "Editorial discussion prompt: choose one subscription and describe the task it completes, the usage you need and the alternative you compared. Include the plan and billing period if you discuss price. Separate your own experience from a provider claim, and do not include private account information. This prompt is not a customer testimonial or a record of product testing.", tags: [{ name: "Notion", slug: "notion" }] },
  { slug: "lifetime-deals-vs-subscriptions-worth-it", title: "How do you evaluate a lifetime deal against a subscription?", category: "SaaS Economics", content: "Editorial discussion prompt: compare the features available today, usage limits, refund conditions and the period for which you expect to use the product. A one-time licence can still have recurring extras or limited capacity. Use the seller's actual terms and clearly label illustrative calculations. No customer outcome or return on investment is asserted by this prompt.", tags: [] },
  { slug: "transitioning-ga4-to-cookieless-analytics", title: "What do you check before choosing an analytics plan?", category: "Analytics", content: "Editorial discussion prompt: identify the events, retention, reports and integrations you require, then compare the provider's billing units and privacy information. A marketing label does not explain every data flow. Describe the evidence you inspected and any gaps in the evaluation. This is an invitation to compare requirements, not a measured migration or privacy-compliance claim.", tags: [] },
  { slug: "ai-code-reviewer-security-concurrency-2026", title: "How would you evaluate an AI tool during a trial?", category: "AI Tools", content: "Editorial discussion prompt: define a representative task, record retries and editing time, and check the usable output rather than a demonstration alone. If you mention a tool, distinguish a feature you tested from one described in its marketing. No tool is certified to catch security defects by this prompt. Replies are browser-local previews in the current implementation.", tags: [{ name: "Predis.ai", slug: "predis-ai" }] },
  { slug: "self-hosted-auth-in-2026-clerk-vs-armorid", title: "What team-access costs belong in a software comparison?", category: "Dev Tools", content: "Editorial discussion prompt: count required seats and workspaces and check how a provider defines guests, viewers and administrators. Include the controls your organization needs and how seat changes affect the selected billing period. Use a current quote and an equivalent requirement for both options. This prompt does not claim a completed migration or a measured saving.", tags: [{ name: "Notion", slug: "notion" }] },
  { slug: "how-we-negotiate-saas-enterprise-contracts", title: "Which renewal terms should be checked before an annual commitment?", category: "SaaS Economics", content: "Editorial discussion prompt: consider the renewal amount, payment schedule, notice period, cancellation process and data export needs. Explain how you would record the decision and review it before the next charge. Do not imply that another organization qualifies for a negotiated rate. No enterprise contract, negotiation result or percentage reduction is asserted here.", tags: [{ name: "Baremetrics", slug: "baremetrics" }] },
  { slug: "ai-agents-in-production-real-world-failures", title: "How do you budget for usage beyond a software plan's allowance?", category: "AI Tools", content: "Editorial discussion prompt: compare the same workflow in a normal month and a busier month. Identify hard limits, credits that reset and extras that would be needed for the task. Keep unknown charges separate from zero-cost items. This is a planning question rather than a report of a production incident or a guarantee about any provider's service.", tags: [{ name: "Predis.ai", slug: "predis-ai" }] },
  { slug: "email-deliverability-open-rate-collapse", title: "What should a newsletter trial help you verify?", category: "Growth & Marketing", content: "Editorial discussion prompt: test a signup and publishing workflow using information you are permitted to share. Check the subscriber tier, required features, export path and trial deadline. If discussing deliverability or engagement, state what was actually measured and avoid extrapolating one account's result to others. This prompt does not assert an open rate or a recovery case study.", tags: [{ name: "beehiiv", slug: "beehiiv" }] },
] as const;

export const DETAILED_THREADS: DetailedCommunityThread[] = prompts.map((prompt, index) => ({
  id: `editorial-${index + 1}`, slug: prompt.slug, title: prompt.title, category: prompt.category, content: prompt.content,
  author: { username: "saasfolio_editorial", name: "SaaSFolio editorial", avatarLetter: "S", badge: "EDITORIAL", reputation: 0 },
  upvotes: 0, commentCount: 0, viewsCount: 0, createdAt: "Editorial prompt", toolTags: [...prompt.tags], hot: false, solved: false, comments: [],
}));
