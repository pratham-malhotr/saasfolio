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

export interface SaaSDeal {
  id: string;
  title: string;
  slug: string;
  toolName: string;
  toolSlug: string;
  category: string;
  discountPercentage: number;
  dealType: "coupon" | "lifetime" | "free_trial" | "free_plan";
  code?: string;
  originalPrice?: number;
  dealPrice?: number;
  billingPeriod?: "monthly" | "yearly" | "one-time";
  description: string;
  badge?: "HOT" | "VERIFIED" | "EXCLUSIVE" | "LIMITED";
  expiryDate: string; // ISO date
  successRate: number; // e.g. 96%
  verifiedAt: string;
  revealsCount: number;
  affiliateUrl: string;
  featured?: boolean;
}

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
    description: "LLMs, AI agents, automated copywriters and code generation suites.",
    iconName: "Sparkles",
    toolCount: 142,
    dealCount: 38,
    popularTools: ["CogniFlow", "SyntaxAI", "HyperScribe"],
  },
  {
    id: "mktg",
    name: "Growth & Marketing",
    shortCode: "MKTG",
    slug: "marketing",
    description: "Omnichannel campaigns, automated email sequences and viral loops.",
    iconName: "TrendingUp",
    toolCount: 118,
    dealCount: 29,
    popularTools: ["PulseMail", "ViralPeak", "AdOptima"],
  },
  {
    id: "crm",
    name: "CRM & Sales Automation",
    shortCode: "CRM",
    slug: "crm-sales",
    description: "Pipeline management, lead intelligence and meeting schedulers.",
    iconName: "Users",
    toolCount: 86,
    dealCount: 21,
    popularTools: ["CloserHQ", "LeadMatrix", "PipeMaster"],
  },
  {
    id: "dev",
    name: "Developer & API Tools",
    shortCode: "DEV",
    slug: "dev-tools",
    description: "API test harnesses, headless backends, DB tooling and serverless clouds.",
    iconName: "Code2",
    toolCount: 175,
    dealCount: 45,
    popularTools: ["EdgeBase", "QueryForge", "DeployJet"],
  },
  {
    id: "des",
    name: "Design & Creative Systems",
    shortCode: "DES",
    slug: "design",
    description: "Vector canvas, 3D prototyping, token generators and motion suites.",
    iconName: "Palette",
    toolCount: 94,
    dealCount: 24,
    popularTools: ["VectorCraft", "FrameGen", "PixelPulse"],
  },
  {
    id: "data",
    name: "Analytics & Product Telemetry",
    shortCode: "DATA",
    slug: "analytics",
    description: "Cookieless visitor analytics, event tracking and conversion funnels.",
    iconName: "BarChart3",
    toolCount: 78,
    dealCount: 19,
    popularTools: ["InsightStream", "MetricPulse", "FunnelSync"],
  },
  {
    id: "host",
    name: "Cloud Hosting & Edge Infra",
    shortCode: "HOST",
    slug: "hosting",
    description: "Global CDN, edge runtimes, container orchestrators and object stores.",
    iconName: "Server",
    toolCount: 65,
    dealCount: 18,
    popularTools: ["ApexEdge", "VesselCloud", "NodeFort"],
  },
  {
    id: "fin",
    name: "Fintech, Billing & Invoicing",
    shortCode: "FIN",
    slug: "finance",
    description: "Subscription billing, multi-currency invoicing and tax compliance.",
    iconName: "CreditCard",
    toolCount: 52,
    dealCount: 14,
    popularTools: ["LedgerZen", "StripeMate", "TaxOmni"],
  },
  {
    id: "prod",
    name: "Productivity & Knowledge Hubs",
    shortCode: "PROD",
    slug: "productivity",
    description: "Modular workspaces, second-brain wikis and automated calendars.",
    iconName: "CheckSquare",
    toolCount: 110,
    dealCount: 31,
    popularTools: ["NexusNotes", "FocusGrid", "ChronoSync"],
  },
  {
    id: "sec",
    name: "Cybersecurity & Compliance",
    shortCode: "SEC",
    slug: "security",
    description: "SOC2 compliance, zero-trust access, secrets vault and DDoS shielding.",
    iconName: "ShieldCheck",
    toolCount: 47,
    dealCount: 12,
    popularTools: ["VaultGuard", "ArmorID", "ZeroTrace"],
  },
  {
    id: "ecom",
    name: "E-Commerce & Checkout Engines",
    shortCode: "ECOM",
    slug: "ecommerce",
    description: "High-converting checkouts, inventory syncing and order tracking.",
    iconName: "ShoppingBag",
    toolCount: 61,
    dealCount: 16,
    popularTools: ["CartSwift", "DropSync", "StoreForge"],
  },
  {
    id: "pm",
    name: "Project & Sprint Management",
    shortCode: "PM",
    slug: "project-management",
    description: "Kanban boards, roadmap sync, sprint poker and async check-ins.",
    iconName: "Layers",
    toolCount: 72,
    dealCount: 17,
    popularTools: ["SprintForge", "TaskFlow", "RoadmapHQ"],
  },
];

export const HOT_DEALS: SaaSDeal[] = [
  {
    id: "deal-1",
    title: "50% Off First Year on All Pro AI Plans",
    slug: "cogniflow-pro-50-off",
    toolName: "CogniFlow AI",
    toolSlug: "cogniflow-ai",
    category: "AI Tools",
    discountPercentage: 50,
    dealType: "coupon",
    code: "FOLIO50",
    originalPrice: 49,
    dealPrice: 24.5,
    billingPeriod: "monthly",
    description: "Unleash automated autonomous workflows with Claude 3.5 & GPT-4o pipeline orchestrators.",
    badge: "EXCLUSIVE",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48h from now
    successRate: 98,
    verifiedAt: "2 hours ago",
    revealsCount: 1420,
    affiliateUrl: "/go/cogniflow-ai",
    featured: true,
  },
  {
    id: "deal-2",
    title: "Lifetime Founders License (Tier 3)",
    slug: "edgebase-lifetime-deal",
    toolName: "EdgeBase Cloud",
    toolSlug: "edgebase-cloud",
    category: "Dev Tools",
    discountPercentage: 80,
    dealType: "lifetime",
    code: "LIFETIME-FOUNDER",
    originalPrice: 480,
    dealPrice: 99,
    billingPeriod: "one-time",
    description: "Serverless SQLite at edge with sub-10ms latency worldwide and instant replication.",
    badge: "HOT",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    successRate: 95,
    verifiedAt: "30 mins ago",
    revealsCount: 2890,
    affiliateUrl: "/go/edgebase-cloud",
    featured: true,
  },
  {
    id: "deal-3",
    title: "60 Days Extended Free Pro Trial (No CC Required)",
    slug: "pulsemail-extended-trial",
    toolName: "PulseMail Pro",
    toolSlug: "pulsemail-pro",
    category: "Marketing",
    discountPercentage: 100,
    dealType: "free_trial",
    code: "PULSE-FOLIO60",
    originalPrice: 79,
    dealPrice: 0,
    billingPeriod: "monthly",
    description: "Deliverability-focused newsletter & behavioral triggers with interactive email blocks.",
    badge: "VERIFIED",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    successRate: 99,
    verifiedAt: "Just now",
    revealsCount: 864,
    affiliateUrl: "/go/pulsemail-pro",
    featured: true,
  },
  {
    id: "deal-4",
    title: "40% Off Annual Enterprise Cloud Seat",
    slug: "vaultguard-annual-40",
    toolName: "VaultGuard Security",
    toolSlug: "vaultguard-security",
    category: "Security",
    discountPercentage: 40,
    dealType: "coupon",
    code: "SECURE40",
    originalPrice: 120,
    dealPrice: 72,
    billingPeriod: "monthly",
    description: "SOC2 automation, automated secrets scanner, and real-time vulnerability alerting.",
    badge: "LIMITED",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    successRate: 94,
    verifiedAt: "4 hours ago",
    revealsCount: 612,
    affiliateUrl: "/go/vaultguard-security",
    featured: true,
  },
  {
    id: "deal-5",
    title: "Lifetime Access to VectorCraft Designer",
    slug: "vectorcraft-lifetime-plan",
    toolName: "VectorCraft",
    toolSlug: "vectorcraft",
    category: "Design",
    discountPercentage: 75,
    dealType: "lifetime",
    code: "CRAFT-LTD",
    originalPrice: 299,
    dealPrice: 69,
    billingPeriod: "one-time",
    description: "Browser-based infinite canvas with native SVG export, color systems, and token sync.",
    badge: "HOT",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    successRate: 97,
    verifiedAt: "1 hour ago",
    revealsCount: 1980,
    affiliateUrl: "/go/vectorcraft",
    featured: true,
  },
  {
    id: "deal-6",
    title: "35% Recurring Discount on All Agency Tiers",
    slug: "metricpulse-agency-35",
    toolName: "MetricPulse Analytics",
    toolSlug: "metricpulse",
    category: "Analytics",
    discountPercentage: 35,
    dealType: "coupon",
    code: "AGENCY35REC",
    originalPrice: 89,
    dealPrice: 57.85,
    billingPeriod: "monthly",
    description: "Lightweight, privacy-first web telemetry without cookies or GDPR consent banners.",
    badge: "EXCLUSIVE",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 168).toISOString(),
    successRate: 99,
    verifiedAt: "6 hours ago",
    revealsCount: 1140,
    affiliateUrl: "/go/metricpulse",
    featured: true,
  },
];

export const FEATURED_ARTICLES: ArticleItem[] = [
  {
    id: "art-1",
    title: "The Ultimate SaaS Stack for Bootstrapped Founders in 2026",
    slug: "ultimate-saas-stack-bootstrapped-founders-2026",
    summary: "How to run a high-revenue, $50k MRR software company with less than $350/mo in software infrastructure.",
    category: "Guides & Stacks",
    readTime: "8 min read",
    publishedAt: "Oct 16, 2026",
    author: {
      name: "Alex Sterling",
      role: "Lead Systems Architect",
      avatarLetter: "A",
    },
    featured: true,
    coverAccent: "#C6FF3D",
    tags: ["Bootstrapping", "Cost Optimization", "Dev Tools", "Founders"],
  },
  {
    id: "art-2",
    title: "Supabase vs. Firebase vs. EdgeBase: Real Production Latency Benchmarks",
    slug: "supabase-vs-firebase-vs-edgebase-benchmarks",
    summary: "We stress-tested query throughput, cold starts, and egress fees across 10 global regions.",
    category: "Comparisons",
    readTime: "11 min read",
    publishedAt: "Oct 14, 2026",
    author: {
      name: "Marcus Vance",
      role: "Database Engineer",
      avatarLetter: "M",
    },
    coverAccent: "#7C5CFF",
    tags: ["Databases", "Edge Infra", "Benchmarking"],
  },
  {
    id: "art-3",
    title: "How We Cut Our SaaS Invoicing & Billing Overhead by 65%",
    slug: "cutting-saas-invoicing-overhead",
    summary: "A practical breakdown of moving off legacy billing providers to modern automated tax compliance stacks.",
    category: "Case Studies",
    readTime: "6 min read",
    publishedAt: "Oct 11, 2026",
    author: {
      name: "Elena Rostova",
      role: "Fintech Lead",
      avatarLetter: "E",
    },
    coverAccent: "#FF723D",
    tags: ["Fintech", "Billing", "Stripe", "Taxes"],
  },
  {
    id: "art-4",
    title: "Top 7 AI Code Reviewers That Actually Catch Architecture Flaws",
    slug: "top-ai-code-reviewers-architecture-flaws",
    summary: "Beyond simple syntax linting: tools that simulate execution paths, identify race conditions, and guard API limits.",
    category: "Tool Roundups",
    readTime: "9 min read",
    publishedAt: "Oct 08, 2026",
    author: {
      name: "Karan Patel",
      role: "Staff Engineer",
      avatarLetter: "K",
    },
    coverAccent: "#3DF0FF",
    tags: ["AI Tools", "DevOps", "Code Quality"],
  },
];

export const TRENDING_DISCUSSIONS: CommunityThread[] = [
  {
    id: "disc-1",
    title: "What is your #1 indispensable developer tool you'd pay personal money for?",
    slug: "indispensable-developer-tool-2026",
    contentSnippet: "With company budgets tightening, what software tools do you refuse to let go of even if you had to expense it out of pocket?",
    category: "Dev Tools",
    upvotes: 342,
    commentCount: 89,
    author: {
      username: "dan_code",
      reputation: 1840,
      badge: "PRO FOUNDER",
    },
    createdAt: "3 hours ago",
    toolTags: ["#DeployJet", "#EdgeBase", "#Raycast"],
    hot: true,
  },
  {
    id: "disc-2",
    title: "Lifetime Deals (LTDs) vs Monthly Subscriptions: When is an LTD actually worth it?",
    slug: "lifetime-deals-vs-subscriptions-worth-it",
    contentSnippet: "Let's analyze unit economics. What happens to server costs 3 years down the line when a company offers lifetime access?",
    category: "SaaS Economics",
    upvotes: 278,
    commentCount: 64,
    author: {
      username: "saas_economist",
      reputation: 920,
      badge: "DEAL HUNTER",
    },
    createdAt: "5 hours ago",
    toolTags: ["#LTD", "#AppSumo", "#Pricing"],
    hot: true,
  },
  {
    id: "disc-3",
    title: "Has anyone transitioned from Google Analytics 4 to self-hosted cookieless analytics?",
    slug: "transitioning-ga4-to-cookieless-analytics",
    contentSnippet: "Looking for recommendations. How is data discrepancy when comparing server-side events vs browser tracking scripts?",
    category: "Analytics",
    upvotes: 195,
    commentCount: 42,
    author: {
      username: "sarah_growth",
      reputation: 1250,
      badge: "VERIFIED MKTG",
    },
    createdAt: "8 hours ago",
    toolTags: ["#MetricPulse", "#Plausible", "#Telemetry"],
  },
];

export const SAAS_LOGOS = [
  { name: "CogniFlow", label: "AI Workflows" },
  { name: "EdgeBase", label: "Edge Database" },
  { name: "PulseMail", label: "Email Infra" },
  { name: "VaultGuard", label: "SOC2 Compliance" },
  { name: "MetricPulse", label: "Cookieless Analytics" },
  { name: "VectorCraft", label: "Canvas Engine" },
  { name: "LedgerZen", label: "Fintech Invoicing" },
  { name: "DeployJet", label: "Serverless Edge" },
  { name: "SprintForge", label: "Roadmap Sprint" },
  { name: "ArmorID", label: "Zero-Trust Auth" },
];
