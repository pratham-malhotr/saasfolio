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

export const HOT_DEALS: SaaSDeal[] = [
  {
    id: "deal-cursor-pro-50",
    title: "50% Off First Month of Cursor Pro Subscription",
    slug: "cursor-pro-50-off",
    toolName: "Cursor AI",
    toolSlug: "cursor-ai",
    category: "AI Tools",
    discountPercentage: 50,
    dealType: "coupon",
    code: "CURSOR50PRO",
    originalPrice: 20,
    dealPrice: 10,
    billingPeriod: "monthly",
    description: "Supercharge your coding speed with unlimited Claude 3.5 Sonnet fast requests and Composer autonomous multi-file edits.",
    badge: "HOT",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    successRate: 97,
    verifiedAt: "10 mins ago",
    revealsCount: 5410,
    affiliateUrl: "/go/cursor-ai",
    featured: true,
  },
  {
    id: "deal-framer-pro-25",
    title: "25% Off Pro Yearly Plan (Official Partner Discount)",
    slug: "framer-pro-25-off",
    toolName: "Framer",
    toolSlug: "framer",
    category: "Design",
    discountPercentage: 25,
    dealType: "coupon",
    code: "PARTNER25PROYEARLY",
    originalPrice: 240,
    dealPrice: 180,
    billingPeriod: "yearly",
    description: "Ship high-converting sites with custom code components, 200,000 visitors/mo, 10 CMS collections, and staging versions.",
    badge: "EXCLUSIVE",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    successRate: 99,
    verifiedAt: "15 mins ago",
    revealsCount: 4890,
    affiliateUrl: "/go/framer",
    featured: true,
  },
  {
    id: "deal-hostinger-cloud-79",
    title: "Up to 79% Off Cloud Hosting + Extra 10% Off with Code + Free Domain",
    slug: "hostinger-cloud-79-off",
    toolName: "Hostinger",
    toolSlug: "hostinger",
    category: "Hosting",
    discountPercentage: 81,
    dealType: "coupon",
    code: "PRODEAL",
    originalPrice: 14.99,
    dealPrice: 2.69,
    billingPeriod: "monthly",
    description: "Host up to 100 websites with free domain registration, free unmetered SSL, unlimited bandwidth, and LiteSpeed caching engine.",
    badge: "HOT",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    successRate: 99,
    verifiedAt: "15 mins ago",
    revealsCount: 6410,
    affiliateUrl: "/go/hostinger",
    featured: true,
  },
  {
    id: "deal-cleanshot-lifetime",
    title: "10% Off Mac Lifetime License / 30% Off Student",
    slug: "cleanshot-x-lifetime-discount",
    toolName: "CleanShot X",
    toolSlug: "cleanshot-x",
    category: "Design",
    discountPercentage: 10,
    dealType: "coupon",
    code: "EFFICIENT",
    originalPrice: 29,
    dealPrice: 26.1,
    billingPeriod: "one-time",
    description: "Get lifetime access to the most beloved macOS screenshot utility with scrolling capture, quick annotations, and cloud uploads.",
    badge: "HOT",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    successRate: 99,
    verifiedAt: "25 mins ago",
    revealsCount: 5120,
    affiliateUrl: "/go/cleanshot-x",
    featured: true,
  },
  {
    id: "deal-beehiiv-scale-20",
    title: "20% Off First 3 Months on Scale & Max Plans",
    slug: "beehiiv-scale-20-off",
    toolName: "Beehiiv",
    toolSlug: "beehiiv",
    category: "Marketing",
    discountPercentage: 20,
    dealType: "coupon",
    code: "20OFF2026",
    originalPrice: 84,
    dealPrice: 67.2,
    billingPeriod: "monthly",
    description: "Scale your publication with custom domain web hosting, integrated ad network monetization, referral programs, and 3D analytics.",
    badge: "HOT",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    successRate: 98,
    verifiedAt: "30 mins ago",
    revealsCount: 3670,
    affiliateUrl: "/go/beehiiv",
    featured: true,
  },
  {
    id: "deal-notion-business-free",
    title: "6 Months Free on Notion Business Plan with Notion AI ($1,200 Value)",
    slug: "notion-business-6-months-free",
    toolName: "Notion",
    toolSlug: "notion",
    category: "Productivity",
    discountPercentage: 100,
    dealType: "free_plan",
    code: "NOTION6MOBIZ",
    originalPrice: 200,
    dealPrice: 0,
    billingPeriod: "monthly",
    description: "Claim 6 full months of Notion Business plan including unlimited team members, advanced permissions, audit logs, and unlimited Notion AI.",
    badge: "EXCLUSIVE",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 240).toISOString(),
    successRate: 99,
    verifiedAt: "Just now",
    revealsCount: 6840,
    affiliateUrl: "/go/notion",
    featured: true,
  },
  {
    id: "deal-linear-startup-free",
    title: "6 Months Free on Linear Startup Tier (Up to 50 Seats)",
    slug: "linear-startup-6-months-free",
    toolName: "Linear",
    toolSlug: "linear",
    category: "Dev Tools",
    discountPercentage: 100,
    dealType: "free_plan",
    code: "LINEAR6STARTUP",
    originalPrice: 120,
    dealPrice: 0,
    billingPeriod: "monthly",
    description: "Build products faster with Linear's keyboard-first interface, automated sprint cycles, GitHub pull request sync, and customer triage.",
    badge: "HOT",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 180).toISOString(),
    successRate: 99,
    verifiedAt: "45 mins ago",
    revealsCount: 4720,
    affiliateUrl: "/go/linear",
    featured: true,
  },
  {
    id: "deal-supabase-credits",
    title: "$25 Free Cloud Compute & Database Credits",
    slug: "supabase-25-credits",
    toolName: "Supabase",
    toolSlug: "supabase",
    category: "Dev Tools",
    discountPercentage: 100,
    dealType: "free_plan",
    code: "SUPA-LAUNCH25",
    originalPrice: 25,
    dealPrice: 0,
    billingPeriod: "monthly",
    description: "Launch your next production backend with $25 free credits covering Pro compute add-ons, extra storage, and custom domains.",
    badge: "VERIFIED",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 168).toISOString(),
    successRate: 99,
    verifiedAt: "1 hour ago",
    revealsCount: 3840,
    affiliateUrl: "/go/supabase",
    featured: true,
  },
  {
    id: "deal-digitalocean-credit-200",
    title: "$200 Free Cloud Infrastructure Credit (Valid for 60 Days)",
    slug: "digitalocean-200-free-credit",
    toolName: "DigitalOcean",
    toolSlug: "digitalocean",
    category: "Hosting",
    discountPercentage: 100,
    dealType: "free_plan",
    code: "DO200CREDIT",
    originalPrice: 200,
    dealPrice: 0,
    billingPeriod: "monthly",
    description: "Deploy Droplets, Managed Postgres databases, Spaces object storage, and Kubernetes clusters with $200 in free cloud credits.",
    badge: "EXCLUSIVE",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    successRate: 98,
    verifiedAt: "1 hour ago",
    revealsCount: 5290,
    affiliateUrl: "/go/digitalocean",
    featured: true,
  },
  {
    id: "deal-nordpass-premium-61",
    title: "Up to 61% Off 2-Year Premium Subscription + Extra Months",
    slug: "nordpass-premium-61-off",
    toolName: "NordPass",
    toolSlug: "nordpass",
    category: "Security",
    discountPercentage: 61,
    dealType: "coupon",
    code: "CNEWSDEAL",
    originalPrice: 4.99,
    dealPrice: 1.95,
    billingPeriod: "monthly",
    description: "Protect your accounts with XChaCha20 encryption, automated password autofill, biometrics unlock, and dark web breach scanner.",
    badge: "HOT",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    successRate: 99,
    verifiedAt: "2 hours ago",
    revealsCount: 4210,
    affiliateUrl: "/go/nordpass",
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
