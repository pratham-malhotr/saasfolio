export { CATEGORIES } from "./catalog-categories";
export type { Category } from "./catalog-categories";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { DETAILED_THREADS } from "@/lib/data/community-data";


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
