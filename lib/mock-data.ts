import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { DETAILED_THREADS } from "@/lib/data/community-data";
export interface Category {
  id: string;
  name: string;
  shortCode: string;
  slug: string;
  description: string;
  iconName: string;
  toolCount: number;
  dealCount: number;
  popularTools: string[];
}

export type { SaaSDeal } from "@/lib/types";
import type { SaaSDeal } from "@/lib/types";

export interface ToolItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  logoLetter: string;
  logoBg: string;
  rating: number;
  reviewCount: number;
  pricingStart: number;
  pricingModel: "Free Trial" | "Freemium" | "Paid" | "Open Source";
  featuredDeal?: SaaSDeal;
  verified: boolean;
  tier?: "popular" | "mid-tier" | "indie-budget";
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  readTime: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatarLetter: string;
  };
  featured?: boolean;
  coverAccent: string;
  tags: string[];
}

export interface CommunityThread {
  id: string;
  title: string;
  slug: string;
  contentSnippet: string;
  category: string;
  upvotes: number;
  commentCount: number;
  author: {
    username: string;
    reputation: number;
    badge: string;
  };
  createdAt: string;
  toolTags: string[];
  hot?: boolean;
}

export const CATEGORIES: Category[] = [
  {
    id: "ai",
    name: "Artificial Intelligence",
    shortCode: "AI",
    slug: "ai-tools",
    description: "LLMs, AI code editors, speech synthesis, and autonomous agent orchestrators.",
    iconName: "Sparkles",
    toolCount: 195,
    dealCount: 68,
    popularTools: ["Cursor AI", "Aider", "Perplexity", "Windsurf", "ElevenLabs"],
  },
  {
    id: "mktg",
    name: "Growth & Marketing",
    shortCode: "MKTG",
    slug: "marketing",
    description: "Omnichannel campaigns, newsletter engines, SEO intelligence, and viral loops.",
    iconName: "TrendingUp",
    toolCount: 165,
    dealCount: 52,
    popularTools: ["Beehiiv", "MailerLite", "Semrush", "EmailOctopus", "SE Ranking"],
  },
  {
    id: "crm",
    name: "CRM & Sales Automation",
    shortCode: "CRM",
    slug: "crm-sales",
    description: "Prospect databases, email finders, cold outreach, and pipeline intelligence.",
    iconName: "Users",
    toolCount: 130,
    dealCount: 44,
    popularTools: ["Smartlead.ai", "Apollo.io", "Folk CRM", "Close CRM", "Lemlist"],
  },
  {
    id: "dev",
    name: "Developer & API Tools",
    shortCode: "DEV",
    slug: "dev-tools",
    description: "Postgres backends, container clouds, error tracking, and modern auth suites.",
    iconName: "Code2",
    toolCount: 245,
    dealCount: 86,
    popularTools: ["Supabase", "Coolify", "PocketBase", "Hoppscotch", "Railway"],
  },
  {
    id: "des",
    name: "Design & Creative Systems",
    shortCode: "DES",
    slug: "design",
    description: "Interactive site builders, screen recorders, screenshot utilities, and templates.",
    iconName: "Palette",
    toolCount: 145,
    dealCount: 48,
    popularTools: ["Framer", "Carrd", "CleanShot X", "Tella", "Shots.so"],
  },
  {
    id: "data",
    name: "Analytics & Product Telemetry",
    shortCode: "DATA",
    slug: "analytics",
    description: "Cookieless visitor analytics, event tracking, and conversion funnels.",
    iconName: "BarChart3",
    toolCount: 110,
    dealCount: 36,
    popularTools: ["Umami", "Plausible", "Pirsch.io", "Simple Analytics"],
  },
  {
    id: "host",
    name: "Cloud Hosting & Edge Infra",
    shortCode: "HOST",
    slug: "hosting",
    description: "Global CDN, edge runtimes, NVMe cloud hosting, and serverless compute.",
    iconName: "Server",
    toolCount: 105,
    dealCount: 38,
    popularTools: ["Contabo", "Hostinger", "Vercel", "Scaleway", "Cloudflare"],
  },
  {
    id: "fin",
    name: "Fintech, Billing & Invoicing",
    shortCode: "FIN",
    slug: "finance",
    description: "Subscription billing, multi-currency invoicing, and tax compliance.",
    iconName: "CreditCard",
    toolCount: 82,
    dealCount: 28,
    popularTools: ["Invoice Ninja", "Bonsai", "Chargebee", "Lemon Squeezy", "Stripe"],
  },
  {
    id: "prod",
    name: "Productivity & Knowledge Hubs",
    shortCode: "PROD",
    slug: "productivity",
    description: "Modular workspaces, desktop launchers, video messaging, and second brains.",
    iconName: "CheckSquare",
    toolCount: 165,
    dealCount: 56,
    popularTools: ["Notion", "Obsidian", "TickTick", "Raindrop.io", "Raycast"],
  },
  {
    id: "sec",
    name: "Cybersecurity & Compliance",
    shortCode: "SEC",
    slug: "security",
    description: "Password vaults, zero-trust passkeys, VPN encryption, and SOC2 compliance.",
    iconName: "ShieldCheck",
    toolCount: 92,
    dealCount: 30,
    popularTools: ["Mullvad VPN", "Proton Pass", "Uptime Kuma", "1Password", "Bitwarden"],
  },
  {
    id: "ecom",
    name: "E-Commerce & Checkout Engines",
    shortCode: "ECOM",
    slug: "ecommerce",
    description: "High-converting checkouts, inventory syncing, and order tracking.",
    iconName: "ShoppingBag",
    toolCount: 88,
    dealCount: 28,
    popularTools: ["Gumroad", "Payhip", "Medusa.js", "ThriveCart", "Shopify"],
  },
  {
    id: "pm",
    name: "Project & Sprint Management",
    shortCode: "PM",
    slug: "project-management",
    description: "Engineering issue tracking, keyboard-first sprints, and product roadmaps.",
    iconName: "Layers",
    toolCount: 102,
    dealCount: 32,
    popularTools: ["Linear", "Plane.so", "Basecamp", "Taiga", "ClickUp"],
  },
];

export const HOT_DEALS: SaaSDeal[] = []; // Homepage receives current offers from its server page.


export const FEATURED_ARTICLES: ArticleItem[] = DETAILED_ARTICLES.slice(0, 4);

export const TRENDING_DISCUSSIONS: CommunityThread[] = DETAILED_THREADS.slice(0, 3).map(thread => ({
  ...thread, contentSnippet: thread.content, toolTags: thread.toolTags.map(tool => tool.name),
}));

export const SAAS_LOGOS = [
  { name: "Coolify", label: "Self-Hosted PaaS" },
  { name: "SurrealDB", label: "Multi-Model DB" },
  { name: "Aider", label: "Terminal AI Coding" },
  { name: "Langflow", label: "Visual AI Agents" },
  { name: "Supabase", label: "Postgres Backend" },
  { name: "Nhost", label: "GraphQL BaaS" },
  { name: "Logto", label: "Open Auth Identity" },
  { name: "Carrd", label: "One-Page Builder" },
  { name: "Obsidian", label: "Markdown Second Brain" },
  { name: "Logseq", label: "Local Outliner" },
  { name: "PocketBase", label: "SQLite BaaS" },
  { name: "Directus", label: "Headless CMS" },
  { name: "Smartlead", label: "Outbound Engine" },
  { name: "Saleshandy", label: "Cold Outreach" },
  { name: "Umami", label: "Cookieless Analytics" },
  { name: "Swetrix", label: "Privacy Telemetry" },
  { name: "Tella", label: "Screen Recorder" },
  { name: "Veed.io", label: "AI Video Studio" },
  { name: "MailerLite", label: "Newsletter Suite" },
  { name: "Moosend", label: "Email Automation" },
  { name: "Contabo", label: "NVMe Cloud VPS" },
  { name: "OVHcloud", label: "Bare Metal Cloud" },
  { name: "Mullvad", label: "Zero-Log VPN" },
  { name: "Vaultwarden", label: "Rust Password Vault" },
  { name: "Hoppscotch", label: "Open API Client" },
  { name: "Plane", label: "Agile Issue Tracker" },
  { name: "Height", label: "Autonomous AI PM" },
  { name: "TickTick", label: "Time-Block Calendar" },
  { name: "Akiflow", label: "Task Time Blocking" },
  { name: "Sellfy", label: "Creator Storefront" },
  { name: "Shots.so", label: "Mockup Studio" },
  { name: "Previewed", label: "3D App Mockups" },
  { name: "Vercel", label: "Frontend Cloud" },
  { name: "Linear", label: "Sprint Planner" },
  { name: "Medusa", label: "Headless Commerce" },
  { name: "Proton Pass", label: "Swiss Vault" },
];
