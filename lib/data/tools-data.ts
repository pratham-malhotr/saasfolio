import { DetailedTool } from "@/lib/types";

export const TOOLS_DATA: DetailedTool[] = [
  {
    id: "tool-cogniflow",
    name: "CogniFlow AI",
    slug: "cogniflow-ai",
    tagline: "Autonomous multi-agent LLM orchestrator for software teams",
    description: "Build, debug, and monitor production AI agent workflows using Claude 3.5 Sonnet and GPT-4o with zero-downtime execution pipelines.",
    longDescription: "CogniFlow AI provides a battle-tested control plane for orchestrating multi-agent systems. It offers real-time streaming traces, automated context compaction, model fallbacks, token budget guards, and deterministic regression testing. Over 2,400 engineering teams use CogniFlow to safely run user-facing AI agents.",
    category: "Artificial Intelligence",
    categorySlug: "ai-tools",
    website: "https://cogniflow.ai",
    logoLetter: "CF",
    rating: 4.9,
    reviewCount: 342,
    pricingStart: 24,
    pricingModel: "Freemium",
    verified: true,
    bestFor: "AI engineers and software teams building autonomous agents and complex LLM pipelines",
    keyFeatures: [
      "Multi-agent workflow DAG designer with parallel execution",
      "Automatic context pruning and token cost optimization",
      "Model fallback cascade (Claude 3.5, GPT-4o, Mistral Large)",
      "Zero-latency streaming trace telemetry and audit logs",
      "Self-healing tool failure retries with sandboxed code runners",
      "Enterprise SOC2 Type II and HIPAA compliance guarantees"
    ],
    pros: [
      "Drastically cuts LLM token bills by 35-50% via intelligent caching",
      "Exceptional visual canvas for tracing execution trees and latency bottlenecks",
      "Type-safe SDKs for TypeScript, Python, and Go"
    ],
    cons: [
      "Steep initial learning curve for teams new to agentic state machines",
      "Self-hosted option only available on custom Enterprise tier"
    ],
    pricingPlans: [
      {
        name: "Hobby / Free",
        priceMonthly: 0,
        priceYearly: 0,
        features: ["1,000 workflow runs/mo", "Community support", "1 agent worker", "Shared rate limits"]
      },
      {
        name: "Pro Builder",
        priceMonthly: 49,
        priceYearly: 39,
        popular: true,
        features: ["50,000 workflow runs/mo", "Unlimited agent workers", "Claude 3.5 + GPT-4o router", "Dedicated webhook triggers", "Priority support"]
      },
      {
        name: "Scale Team",
        priceMonthly: 199,
        priceYearly: 159,
        features: ["500,000 runs/mo", "Custom model fine-tuning", "SSO & Audit logging", "Sub-50ms latency guarantee", "Dedicated solutions architect"]
      }
    ],
    alternatives: [
      { name: "SyntaxAI", slug: "syntaxai", tagline: "Developer-first AI code automation", rating: 4.7 },
      { name: "HyperScribe", slug: "hyperscribe", tagline: "Autonomous copy & documentation agent", rating: 4.6 }
    ],
    reviews: [
      {
        id: "rev-1",
        author: "Devin Zhao",
        authorTitle: "CTO @ OrbitScale",
        avatar: "DZ",
        rating: 5,
        date: "Oct 12, 2026",
        content: "CogniFlow completely solved our latency spikes. The token caching feature alone saved us over $1,800 on Anthropic API invoices last month.",
        pros: ["Token savings", "DAG UI"],
        cons: ["Docs need more Python examples"]
      },
      {
        id: "rev-2",
        author: "Sarah Lindqvist",
        authorTitle: "Head of AI @ VoxelHQ",
        avatar: "SL",
        rating: 5,
        date: "Oct 04, 2026",
        content: "The multi-agent orchestration is incredible. Being able to set automatic model fallbacks saved our customer-facing bot during the last OpenAI outage.",
        pros: ["Model fallback", "Reliability"],
        cons: ["None for our use case"]
      }
    ],
    dealsCount: 2
  },
  {
    id: "tool-edgebase",
    name: "EdgeBase Cloud",
    slug: "edgebase-cloud",
    tagline: "Serverless global SQLite database with sub-10ms edge replication",
    description: "The lightweight edge database with instantaneous branching, embedded vector search, and millisecond cold-start times across 35 regions worldwide.",
    longDescription: "EdgeBase delivers ultra-low-latency persistent relational storage right at the user's nearest edge node. Powered by embedded SQLite engines with master-replica consensus, EdgeBase eliminates traditional DB connection pool exhaustion and egress fees.",
    category: "Developer & API Tools",
    categorySlug: "dev-tools",
    website: "https://edgebase.dev",
    logoLetter: "EB",
    rating: 4.95,
    reviewCount: 489,
    pricingStart: 0,
    pricingModel: "Freemium",
    verified: true,
    bestFor: "Next.js, Cloudflare Workers, and serverless applications requiring high-concurrency read replicas",
    keyFeatures: [
      "Sub-10ms global read latencies via 35+ edge points of presence",
      "Git-like instant schema database branching for pull requests",
      "Native vector embedding extensions for fast RAG search",
      "Zero connection pool exhaustion limits",
      "Standard SQLite syntax and full ACID transactional safety"
    ],
    pros: [
      "Near-zero cold starts compared to traditional serverless Postgres",
      "Super generous free tier with 5GB storage and 1B reads/mo",
      "Effortless PR branching preview workflow"
    ],
    cons: [
      "Write throughput limited if you have intense concurrent multi-region writes to the exact same table",
      "No stored procedures (standard SQLite limitation)"
    ],
    pricingPlans: [
      {
        name: "Community",
        priceMonthly: 0,
        priceYearly: 0,
        features: ["5GB Storage", "1 Billion Row Reads/mo", "3 Database Branches", "Community Discord"]
      },
      {
        name: "Founder Pro",
        priceMonthly: 29,
        priceYearly: 24,
        popular: true,
        features: ["50GB Storage", "Unlimited Branches", "Vector Search Indices", "Automated Daily Backups", "Sub-15m support"]
      },
      {
        name: "Enterprise Edge",
        priceMonthly: 249,
        priceYearly: 199,
        features: ["1TB+ Storage", "Custom Regions", "99.99% SLA", "SOC2 compliance report", "Dedicated Slack channel"]
      }
    ],
    alternatives: [
      { name: "DeployJet", slug: "deployjet", tagline: "Serverless edge compute runner", rating: 4.8 },
      { name: "QueryForge", slug: "queryforge", tagline: "AI SQL generator and query optimizer", rating: 4.7 }
    ],
    reviews: [
      {
        id: "rev-3",
        author: "Markus Vance",
        authorTitle: "Database Architect @ FleetOps",
        avatar: "MV",
        rating: 5,
        date: "Oct 14, 2026",
        content: "We migrated 8 microservices from RDS Aurora to EdgeBase. Our p99 latency dropped from 145ms to 12ms. Truly remarkable technology.",
        pros: ["Unmatched latency", "Zero connection limits"],
        cons: ["Requires mindset shift regarding write locality"]
      }
    ],
    dealsCount: 2
  },
  {
    id: "tool-pulsemail",
    name: "PulseMail Pro",
    slug: "pulsemail-pro",
    tagline: "High-deliverability newsletter and automated email engine for builders",
    description: "Designed for SaaS growth teams. Clean markdown editor, dynamic liquid tags, interactive AMP email components, and dedicated warmup IPs.",
    longDescription: "PulseMail is built to guarantee your SaaS newsletters and transactional alerts hit the primary inbox, never the promotions or spam tabs. Features visual behavioral trigger maps, churn prevention flows, and automatic domain reputation monitoring.",
    category: "Growth & Marketing",
    categorySlug: "marketing",
    website: "https://pulsemail.io",
    logoLetter: "PM",
    rating: 4.8,
    reviewCount: 275,
    pricingStart: 29,
    pricingModel: "Free Trial",
    verified: true,
    bestFor: "Indie hackers, SaaS founders, and creators seeking high inbox placement rates",
    keyFeatures: [
      "Dedicated warmup IP pools with 99.4% deliverability guarantee",
      "Visual behavioral automation canvas with webhook triggers",
      "Interactive newsletter blocks (polls, countdowns, coupons)",
      "Zero spam score pre-flight testing engine",
      "Native integrations with Stripe, Lemon Squeezy, and Supabase"
    ],
    pros: [
      "Incredible inbox deliverability rates compared to legacy tools",
      "No penalty pricing when list sizes grow modestly",
      "Real-time click heatmap telemetry"
    ],
    cons: [
      "Stricter domain verification checks (DMARC/DKIM/SPF mandatory)",
      "No SMS marketing channel (strictly focused on email)"
    ],
    pricingPlans: [
      {
        name: "Starter",
        priceMonthly: 29,
        priceYearly: 22,
        features: ["Up to 5,000 subscribers", "Unlimited monthly sends", "Visual automation builder", "Standard IP pool"]
      },
      {
        name: "Growth",
        priceMonthly: 79,
        priceYearly: 62,
        popular: true,
        features: ["Up to 25,000 subscribers", "Dedicated warmup IP", "A/B subject line testing", "Custom domain branding"]
      },
      {
        name: "Scale",
        priceMonthly: 199,
        priceYearly: 159,
        features: ["Up to 100,000 subscribers", "Deliverability consultant", "Multi-brand workspaces", "Custom webhook pipes"]
      }
    ],
    alternatives: [
      { name: "ViralPeak", slug: "viralpeak", tagline: "Referral & viral loop marketing suite", rating: 4.7 },
      { name: "AdOptima", slug: "adoptima", tagline: "Autonomous paid ad budget optimizer", rating: 4.6 }
    ],
    reviews: [
      {
        id: "rev-4",
        author: "Camila Gomez",
        authorTitle: "Growth Lead @ SaaSPulse",
        avatar: "CG",
        rating: 5,
        date: "Oct 08, 2026",
        content: "PulseMail bumped our open rate from 28% to 49% within three weeks of migrating off Substack. The deliverability is real.",
        pros: ["Deliverability", "Interactive blocks"],
        cons: ["DKIM setup took a day to propagate"]
      }
    ],
    dealsCount: 1
  },
  {
    id: "tool-vaultguard",
    name: "VaultGuard Security",
    slug: "vaultguard-security",
    tagline: "Automated continuous SOC2, ISO27001, and secrets vulnerability defense",
    description: "Scan cloud infrastructure, enforce zero-trust policies, and auto-generate compliance evidence directly from GitHub and AWS.",
    longDescription: "VaultGuard automates 90% of the manual evidence collection required for SOC2 Type I & II audits. Integrates with your cloud providers, repositories, and identity providers to continuously monitor for security drift.",
    category: "Cybersecurity & Compliance",
    categorySlug: "security",
    website: "https://vaultguard.com",
    logoLetter: "VG",
    rating: 4.9,
    reviewCount: 198,
    pricingStart: 120,
    pricingModel: "Free Trial",
    verified: true,
    bestFor: "B2B SaaS companies needing SOC2 Type II certification to close enterprise contracts",
    keyFeatures: [
      "Over 120+ automated security tests and cloud drift monitors",
      "Auditor-ready compliance portal with one-click export",
      "Continuous secret scanner across git history and CI/CD pipelines",
      "Zero-trust RBAC access reviews and workstation tracking",
      "Pre-vetted auditor marketplace with discounted audit fees"
    ],
    pros: [
      "Reduces SOC2 audit prep time from 6 months to 3 weeks",
      "Seamless integrations with AWS, GCP, Vercel, and GitHub",
      "Direct chat with cybersecurity compliance experts"
    ],
    cons: [
      "Enterprise software pricing model",
      "Requires broad initial read access to cloud accounts"
    ],
    pricingPlans: [
      {
        name: "Startup SOC2",
        priceMonthly: 149,
        priceYearly: 120,
        features: ["1 Cloud Provider", "Up to 15 team seats", "Automated evidence collection", "Auditor-ready portal"]
      },
      {
        name: "Growth Compliance",
        priceMonthly: 349,
        priceYearly: 289,
        popular: true,
        features: ["Multi-cloud (AWS + GCP)", "SOC2 + ISO27001 + HIPAA", "Continuous secrets scanner", "Auditor matchmaking"]
      }
    ],
    alternatives: [
      { name: "ArmorID", slug: "armorid", tagline: "Zero-trust authentication & passkey vault", rating: 4.8 },
      { name: "ZeroTrace", slug: "zerotrace", tagline: "DDoS and API bot mitigation gateway", rating: 4.7 }
    ],
    reviews: [
      {
        id: "rev-5",
        author: "Julian Thorne",
        authorTitle: "VP Security @ FinEdge",
        avatar: "JT",
        rating: 5,
        date: "Oct 02, 2026",
        content: "Passed our SOC2 Type II audit with zero findings thanks to VaultGuard. Worth every single penny for enterprise credibility.",
        pros: ["Automated evidence", "Auditor support"],
        cons: ["Pricey for pre-revenue startups"]
      }
    ],
    dealsCount: 1
  },
  {
    id: "tool-vectorcraft",
    name: "VectorCraft",
    slug: "vectorcraft",
    tagline: "Next-generation browser canvas with instant SVG export and design tokens",
    description: "Lightning-fast vector design platform built for developers and UI designers. Export production-ready Tailwind CSS classes, SVGs, and token files.",
    longDescription: "VectorCraft bridges the gap between design systems and frontend code. Features infinite canvas zooming, component state variants, automated auto-layout, and direct export to React/Tailwind code with zero pixel drift.",
    category: "Design & Creative Systems",
    categorySlug: "design",
    website: "https://vectorcraft.design",
    logoLetter: "VC",
    rating: 4.85,
    reviewCount: 310,
    pricingStart: 12,
    pricingModel: "Freemium",
    verified: true,
    bestFor: "Product designers, solo founders, and frontend devs building modern web design systems",
    keyFeatures: [
      "Native WebAssembly-powered canvas rendering at 120fps",
      "Bi-directional design token sync with GitHub repos",
      "Direct copy-paste as Tailwind CSS JSX components",
      "Vector shape boolean operators with non-destructive history",
      "Multiplayer real-time collaboration with audio cursors"
    ],
    pros: [
      "Infinitely faster and lighter on RAM than Electron-based Figma",
      "Tailwind code export actually generates clean, production-ready JSX",
      "Offline mode works seamlessly"
    ],
    cons: [
      "Smaller third-party plugin ecosystem than legacy competitors"
    ],
    pricingPlans: [
      {
        name: "Solo Free",
        priceMonthly: 0,
        priceYearly: 0,
        features: ["3 active projects", "Unlimited vector export", "Design token generator", "Community files"]
      },
      {
        name: "Pro Designer",
        priceMonthly: 16,
        priceYearly: 12,
        popular: true,
        features: ["Unlimited projects", "GitHub Token Sync", "Tailwind Component Exporter", "Unlimited version history"]
      },
      {
        name: "Lifetime Founder",
        priceMonthly: 69,
        priceYearly: 69,
        features: ["One-time lifetime payment", "All Pro features forever", "Early access to 3D canvas", "Priority Discord VIP"]
      }
    ],
    alternatives: [
      { name: "FrameGen", slug: "framegen", tagline: "AI UI layout generator & wireframer", rating: 4.6 },
      { name: "PixelPulse", slug: "pixelpulse", tagline: "Motion graphics and micro-interaction animator", rating: 4.7 }
    ],
    reviews: [
      {
        id: "rev-6",
        author: "Nadia Rossi",
        authorTitle: "Product Designer @ HyperStudio",
        avatar: "NR",
        rating: 5,
        date: "Oct 11, 2026",
        content: "The Tailwind export alone is worth the lifetime deal. It saves me 4 hours every single design handoff.",
        pros: ["Speed", "Clean Tailwind export"],
        cons: ["Community plugins are still growing"]
      }
    ],
    dealsCount: 1
  },
  {
    id: "tool-metricpulse",
    name: "MetricPulse Analytics",
    slug: "metricpulse",
    tagline: "Lightweight, privacy-first web telemetry without cookies or consent banners",
    description: "Under 1KB script. Track pageviews, custom SaaS conversion events, and referral revenue without GDPR cookie consent headaches.",
    longDescription: "MetricPulse is the modern alternative to bloated analytics scripts. It respects user privacy, complies 100% with GDPR/CCPA out of the box, loads asynchronously in less than 5ms, and provides insightful clean dashboards.",
    category: "Analytics & Product Telemetry",
    categorySlug: "analytics",
    website: "https://metricpulse.io",
    logoLetter: "MP",
    rating: 4.9,
    reviewCount: 420,
    pricingStart: 9,
    pricingModel: "Free Trial",
    verified: true,
    bestFor: "Privacy-conscious founders, agencies, and sites wanting fast, cookieless metrics",
    keyFeatures: [
      "Ultra-compact 0.8KB telemetry script with zero impact on Lighthouse scores",
      "No cookies, no IP tracking, 100% GDPR/PECR compliant without cookie banners",
      "Custom event funnels and SaaS checkout conversion tracking",
      "UTM campaign performance and referral source intelligence",
      "Public and shareable stats dashboards with custom domains"
    ],
    pros: [
      "Say goodbye to intrusive cookie banners on your website",
      "Super fast real-time dashboard updates",
      "Agency feature allows managing 20+ client sites under one roof"
    ],
    cons: [
      "Does not track individual cross-site user fingerprinting (by design)"
    ],
    pricingPlans: [
      {
        name: "Indie",
        priceMonthly: 12,
        priceYearly: 9,
        features: ["Up to 100k monthly pageviews", "Unlimited custom events", "3 websites", "Weekly email digests"]
      },
      {
        name: "Startup",
        priceMonthly: 29,
        priceYearly: 24,
        popular: true,
        features: ["Up to 500k monthly pageviews", "10 websites", "Custom domain stats", "API access & webhooks"]
      },
      {
        name: "Agency",
        priceMonthly: 89,
        priceYearly: 69,
        features: ["Up to 3M monthly pageviews", "Unlimited client sites", "White-label reports", "Client login accounts"]
      }
    ],
    alternatives: [
      { name: "InsightStream", slug: "insightstream", tagline: "Product behavior and retention cohorts", rating: 4.7 },
      { name: "FunnelSync", slug: "funnelsync", tagline: "Automated checkout dropoff telemetry", rating: 4.6 }
    ],
    reviews: [
      {
        id: "rev-7",
        author: "Karan Patel",
        authorTitle: "Lead Architect @ TechCraft",
        avatar: "KP",
        rating: 5,
        date: "Oct 15, 2026",
        content: "Dropped Google Analytics 4 for MetricPulse and our page load time instantly improved by 0.6 seconds. Cleanest UI in the business.",
        pros: ["No cookie banner", "0.8KB script"],
        cons: ["None"]
      }
    ],
    dealsCount: 1
  },
  {
    id: "tool-syntaxai",
    name: "SyntaxAI",
    slug: "syntaxai",
    tagline: "AI architecture reviewer that catches race conditions and logic flaws",
    description: "Automated PR reviewer that runs deep semantic analysis across entire codebases to catch security vulnerabilities and API rate-limit bottlenecks.",
    longDescription: "Unlike surface-level syntax linters, SyntaxAI compiles an AST representation of your repository to simulate async execution paths, uncover deadlocks, check SQL injection risks, and ensure adherence to your internal coding conventions.",
    category: "Artificial Intelligence",
    categorySlug: "ai-tools",
    website: "https://syntaxai.dev",
    logoLetter: "SX",
    rating: 4.75,
    reviewCount: 215,
    pricingStart: 19,
    pricingModel: "Free Trial",
    verified: true,
    bestFor: "Engineering teams wanting automated architectural code reviews on GitHub/GitLab pull requests",
    keyFeatures: [
      "Semantic AST simulation across pull requests",
      "Automatic detection of concurrency race conditions",
      "Database query N+1 performance warnings",
      "Custom organization rulebook enforcement",
      "One-click auto-fix PR suggestions"
    ],
    pros: [
      "Catches genuine architectural bugs that ESLint completely misses",
      "Very low false-positive rate compared to generic AI code bots"
    ],
    cons: [
      "Can take 1-2 minutes on massive 500k+ line monorepos"
    ],
    pricingPlans: [
      {
        name: "Developer",
        priceMonthly: 19,
        priceYearly: 15,
        features: ["1 user", "Unlimited public repos", "50 PR reviews/mo", "TypeScript & Python support"]
      },
      {
        name: "Team",
        priceMonthly: 69,
        priceYearly: 55,
        popular: true,
        features: ["Up to 10 engineers", "Unlimited private repos", "Custom rulebooks", "CI/CD integration"]
      }
    ],
    alternatives: [
      { name: "CogniFlow AI", slug: "cogniflow-ai", tagline: "Autonomous multi-agent LLM orchestrator", rating: 4.9 }
    ],
    reviews: [
      {
        id: "rev-8",
        author: "Alex Sterling",
        authorTitle: "Staff Software Engineer",
        avatar: "AS",
        rating: 5,
        date: "Oct 10, 2026",
        content: "SyntaxAI flagged an obscure database transaction deadlock in a PR before it went to staging. Saved us an inevitable outage.",
        pros: ["Astute bug detection", "Great GitHub integration"],
        cons: ["Slightly slower on large PRs"]
      }
    ],
    dealsCount: 1
  },
  {
    id: "tool-deployjet",
    name: "DeployJet",
    slug: "deployjet",
    tagline: "Instant global edge deployment platform for Docker and Node microservices",
    description: "Deploy containers in under 3 seconds to 40 global regions with automated SSL, anycast routing, and zero-idle cost scaling.",
    longDescription: "DeployJet is the fastest way to deploy backend microservices and full-stack apps to global edge infrastructure. With native GitHub push triggers, zero-downtime rollouts, and automatic DDoS mitigation.",
    category: "Developer & API Tools",
    categorySlug: "dev-tools",
    website: "https://deployjet.com",
    logoLetter: "DJ",
    rating: 4.85,
    reviewCount: 380,
    pricingStart: 15,
    pricingModel: "Freemium",
    verified: true,
    bestFor: "Full-stack developers and teams deploying high-performance APIs and microservices",
    keyFeatures: [
      "Sub-3 second global deployments from git commit",
      "Automated Anycast IP routing with 40+ points of presence",
      "Zero-idle compute scaling down to $0 when inactive",
      "Instant rollback and preview URLs for every git branch",
      "Built-in secrets manager and private networking"
    ],
    pros: [
      "Astonishing deployment speeds",
      "No complex Kubernetes manifests needed",
      "Transparent usage-based pricing"
    ],
    cons: [
      "No support for legacy Windows containers"
    ],
    pricingPlans: [
      {
        name: "Hobby",
        priceMonthly: 0,
        priceYearly: 0,
        features: ["3 services", "100GB egress", "Shared CPU", "Community Discord"]
      },
      {
        name: "Developer Pro",
        priceMonthly: 20,
        priceYearly: 16,
        popular: true,
        features: ["Unlimited services", "1TB egress", "Dedicated CPU cores", "Custom domains & SSL", "Instant rollbacks"]
      }
    ],
    alternatives: [
      { name: "ApexEdge Infra", slug: "apexedge", tagline: "Global CDN and edge runtime", rating: 4.8 },
      { name: "VesselCloud", slug: "vesselcloud", tagline: "Container orchestrator for small teams", rating: 4.6 }
    ],
    reviews: [
      {
        id: "rev-9",
        author: "Danielle Vance",
        authorTitle: "DevOps Engineer @ WebFlows",
        avatar: "DV",
        rating: 5,
        date: "Oct 13, 2026",
        content: "DeployJet replaced our clunky AWS ECS setup. We ship 15 times a day now without any deployment headaches.",
        pros: ["3s deploys", "Anycast routing"],
        cons: ["None so far"]
      }
    ],
    dealsCount: 1
  },
  {
    id: "tool-ledgerzen",
    name: "LedgerZen",
    slug: "ledgerzen",
    tagline: "Automated multi-currency invoicing, VAT compliance, and revenue recognition",
    description: "Built for international software companies. Handle EU VAT, US sales taxes, automated dunning, and Stripe subscription syncing in one dashboard.",
    longDescription: "LedgerZen removes the legal and accounting headache of selling software internationally. It automatically determines localized tax liabilities, generates compliant PDF invoices with localized tax IDs, and handles churn prevention dunning.",
    category: "Fintech, Billing & Invoicing",
    categorySlug: "finance",
    website: "https://ledgerzen.com",
    logoLetter: "LZ",
    rating: 4.8,
    reviewCount: 164,
    pricingStart: 39,
    pricingModel: "Free Trial",
    verified: true,
    bestFor: "Global SaaS founders and agencies with international customers and complex VAT obligations",
    keyFeatures: [
      "Automated EU VAT, OSS, and US state nexus tax calculations",
      "One-click sync with Stripe, Paddle, and Wise balances",
      "Smart dunning sequences with automated card retry cascades",
      "ASC 606 and IFRS 15 compliant revenue recognition schedules",
      "White-labeled customer billing portal"
    ],
    pros: [
      "Eliminates hours of manual monthly VAT tax filing",
      "Recovered over 18% of failed credit card transactions automatically"
    ],
    cons: [
      "Requires Stripe account (does not act as merchant of record itself)"
    ],
    pricingPlans: [
      {
        name: "Starter Tax",
        priceMonthly: 39,
        priceYearly: 29,
        features: ["Up to $30k MRR volume", "Automated EU VAT invoices", "Stripe sync", "Customer billing portal"]
      },
      {
        name: "Scale Finance",
        priceMonthly: 99,
        priceYearly: 79,
        popular: true,
        features: ["Up to $150k MRR volume", "Smart dunning engine", "ASC 606 revenue recognition", "Multi-currency support"]
      }
    ],
    alternatives: [
      { name: "StripeMate", slug: "stripemate", tagline: "Subscription analytics & dunning", rating: 4.7 },
      { name: "TaxOmni", slug: "taxomni", tagline: "Global digital tax compliance engine", rating: 4.6 }
    ],
    reviews: [
      {
        id: "rev-10",
        author: "Elena Rostova",
        authorTitle: "Finance Lead @ OrbitScale",
        avatar: "ER",
        rating: 5,
        date: "Oct 11, 2026",
        content: "Saved us at least 15 hours each month during our quarterly VAT reconciliations. Indispensable tool for European SaaS.",
        pros: ["Automated VAT", "Smart dunning"],
        cons: ["Takes some time to map custom webhook events"]
      }
    ],
    dealsCount: 1
  },
  {
    id: "tool-sprintforge",
    name: "SprintForge",
    slug: "sprintforge",
    tagline: "High-velocity issue tracker and sprint planner built for linear engineering",
    description: "Keyboard-first, lightning-fast roadmap and issue tracker with native GitHub PR linking, async standups, and cycle velocity analytics.",
    longDescription: "SprintForge strips out all the Jira bureaucracy and focuses on pure engineering velocity. Features sub-50ms UI interactions, full offline mode, automated sprint rollover, and bi-directional GitHub/GitLab issue syncing.",
    category: "Project & Sprint Management",
    categorySlug: "project-management",
    website: "https://sprintforge.io",
    logoLetter: "SF",
    rating: 4.9,
    reviewCount: 310,
    pricingStart: 8,
    pricingModel: "Freemium",
    verified: true,
    bestFor: "Fast-moving product and engineering teams tired of clunky legacy Jira boards",
    keyFeatures: [
      "Sub-50ms keyboard-driven navigation (Cmd+K command center)",
      "Native GitHub/GitLab PR linking and branch auto-creation",
      "Automated sprint cycles, velocity metrics, and burndown charts",
      "Offline-first architecture with instant sync upon reconnect",
      "Custom engineering roadmaps with customer feedback portal"
    ],
    pros: [
      "Blazingly fast interface compared to Jira and Asana",
      "Engineers actually enjoy creating and updating tickets",
      "Very affordable pricing model"
    ],
    cons: [
      "Fewer non-engineering department templates (HR, Legal)"
    ],
    pricingPlans: [
      {
        name: "Free Solo",
        priceMonthly: 0,
        priceYearly: 0,
        features: ["Up to 5 team members", "Unlimited issues", "GitHub integration", "Keyboard shortcuts"]
      },
      {
        name: "Pro Team",
        priceMonthly: 10,
        priceYearly: 8,
        popular: true,
        features: ["Unlimited members", "Sprint velocity analytics", "Roadmap timelines", "Customer portal", "Priority support"]
      }
    ],
    alternatives: [
      { name: "TaskFlow", slug: "taskflow", tagline: "Kanban and sprint workflows", rating: 4.6 },
      { name: "RoadmapHQ", slug: "roadmaphq", tagline: "Customer-facing roadmap portal", rating: 4.7 }
    ],
    reviews: [
      {
        id: "rev-11",
        author: "Marcus Vance",
        authorTitle: "Engineering Manager @ EdgeBase",
        avatar: "MV",
        rating: 5,
        date: "Oct 09, 2026",
        content: "SprintForge made sprint planning painless. Tickets update immediately when pull requests merge. 10/10 developer UX.",
        pros: ["Keyboard shortcuts", "GitHub sync"],
        cons: ["None"]
      }
    ],
    dealsCount: 1
  },
  {
    id: "tool-closerhq",
    name: "CloserHQ",
    slug: "closerhq",
    tagline: "AI sales pipeline intelligence and meeting note transcription for B2B",
    description: "Automatically transcribe sales demo calls, extract action items, update deal stage probabilities, and draft personalized follow-up emails.",
    longDescription: "CloserHQ joins your Zoom and Google Meet calls as a silent AI co-pilot. It drafts comprehensive call notes, flags competitor objections, predicts churn or close likelihood, and syncs directly with your CRM.",
    category: "CRM & Sales Automation",
    categorySlug: "crm-sales",
    website: "https://closerhq.com",
    logoLetter: "CH",
    rating: 4.85,
    reviewCount: 220,
    pricingStart: 35,
    pricingModel: "Free Trial",
    verified: true,
    bestFor: "B2B SaaS account executives and sales leaders looking to increase close rates",
    keyFeatures: [
      "Instant AI meeting recording & multi-speaker transcription",
      "Automated personalized follow-up email drafts within 60 seconds",
      "Competitor mention alerts and objection handling prompts",
      "Deal momentum scoring and close date forecasting",
      "Two-way sync with HubSpot, Salesforce, and Pipedrive"
    ],
    pros: [
      "Saves AEs 1-2 hours of tedious CRM data entry every single day",
      "Follow-up email drafts sound genuinely human and accurate"
    ],
    cons: [
      "Requires sales reps to permit bot entry into client meetings"
    ],
    pricingPlans: [
      {
        name: "AE Starter",
        priceMonthly: 45,
        priceYearly: 35,
        features: ["30 meetings/mo", "AI transcription & summaries", "CRM sync", "Personalized follow-ups"]
      },
      {
        name: "Sales Pro",
        priceMonthly: 89,
        priceYearly: 69,
        popular: true,
        features: ["Unlimited meetings", "Deal momentum analytics", "Team coaching insights", "Custom objection library"]
      }
    ],
    alternatives: [
      { name: "LeadMatrix", slug: "leadmatrix", tagline: "B2B contact enrichment database", rating: 4.7 },
      { name: "PipeMaster", slug: "pipemaster", tagline: "Visual sales pipeline CRM", rating: 4.6 }
    ],
    reviews: [
      {
        id: "rev-12",
        author: "Brad Sterling",
        authorTitle: "VP of Sales @ DataPulse",
        avatar: "BS",
        rating: 5,
        date: "Oct 14, 2026",
        content: "Our team's average deal cycle shortened by 9 days because follow-up proposals go out within 10 minutes of every call.",
        pros: ["Instant follow-ups", "CRM sync"],
        cons: ["Need good audio quality for accents"]
      }
    ],
    dealsCount: 1
  },
  {
    id: "tool-nexusnotes",
    name: "NexusNotes",
    slug: "nexusnotes",
    tagline: "High-speed second-brain knowledge base with bi-directional graph linking",
    description: "Local-first, encrypted personal and team wiki with markdown editing, visual knowledge graphs, and semantic vector query capabilities.",
    longDescription: "NexusNotes combines the simplicity of plaintext markdown with the power of visual knowledge graphs. Your notes stay encrypted on your machine with optional instant peer-to-peer team sync.",
    category: "Productivity & Knowledge Hubs",
    categorySlug: "productivity",
    website: "https://nexusnotes.app",
    logoLetter: "NN",
    rating: 4.9,
    reviewCount: 390,
    pricingStart: 0,
    pricingModel: "Freemium",
    verified: true,
    bestFor: "Researchers, developers, and founders building personal knowledge systems and engineering docs",
    keyFeatures: [
      "Local-first markdown storage with end-to-end zero-knowledge encryption",
      "3D interactive concept knowledge graph visualization",
      "Semantic AI query across entire note library",
      "Sub-10ms instantaneous note switching",
      "Published web doc mode with custom domain"
    ],
    pros: [
      "You own your raw markdown data forever",
      "Offline performance is instantaneous",
      "Beautiful dark mode design"
    ],
    cons: [
      "Collaboration requires team sync plan"
    ],
    pricingPlans: [
      {
        name: "Personal",
        priceMonthly: 0,
        priceYearly: 0,
        features: ["Unlimited local notes", "3D Graph view", "Full offline support", "Markdown export"]
      },
      {
        name: "Sync Pro",
        priceMonthly: 8,
        priceYearly: 6,
        popular: true,
        features: ["End-to-end encrypted cloud sync", "Unlimited devices", "Semantic AI search", "Web publishing"]
      }
    ],
    alternatives: [
      { name: "FocusGrid", slug: "focusgrid", tagline: "Time-blocking calendar and task manager", rating: 4.7 },
      { name: "ChronoSync", slug: "chronosync", tagline: "Automated meeting scheduler", rating: 4.8 }
    ],
    reviews: [
      {
        id: "rev-13",
        author: "Tara Williams",
        authorTitle: "Founder @ IndieBuild",
        avatar: "TW",
        rating: 5,
        date: "Oct 16, 2026",
        content: "Replaced Notion with NexusNotes. My writing speed doubled and I never wait for pages to load.",
        pros: ["Instant speed", "Markdown ownership"],
        cons: ["None"]
      }
    ],
    dealsCount: 1
  }
];

export function getToolBySlug(slug: string): DetailedTool | undefined {
  return TOOLS_DATA.find((t) => t.slug === slug);
}

export function getAllTools(): DetailedTool[] {
  return TOOLS_DATA;
}
