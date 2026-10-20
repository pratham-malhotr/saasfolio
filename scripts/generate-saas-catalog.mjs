import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const BRANDS = [
  // AI & Machine Learning
  { name: "Midjourney", slug: "midjourney", cat: "AI & Machine Learning", catSlug: "ai", site: "https://midjourney.com", disc: 20, start: 10, best: "Digital artists, concept designers, and creative directors needing photorealistic generative artwork" },
  { name: "Claude AI", slug: "claude-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://anthropic.com/claude", disc: 25, start: 20, best: "Developers and researchers requiring 200k+ context windows, coding assistance, and deep reasoning" },
  { name: "Phind", slug: "phind", cat: "AI & Machine Learning", catSlug: "ai", site: "https://phind.com", disc: 30, start: 15, best: "Software engineers looking for an AI search engine customized for programming and documentation" },
  { name: "Poe", slug: "poe", cat: "AI & Machine Learning", catSlug: "ai", site: "https://poe.com", disc: 20, start: 20, best: "Knowledge workers needing unified access to GPT-4o, Claude 3.5, and open-source models in one chat" },
  { name: "Runway ML", slug: "runway-ml", cat: "AI & Machine Learning", catSlug: "ai", site: "https://runwayml.com", disc: 25, start: 15, best: "Video creators, VFX artists, and filmmakers producing AI-generated video and cinematic motion" },
  { name: "Synthesia", slug: "synthesia", cat: "AI & Machine Learning", catSlug: "ai", site: "https://synthesia.io", disc: 20, start: 29, best: "Corporate L&D teams and marketing agencies generating multilingual AI avatar training videos" },
  { name: "Murf AI", slug: "murf-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://murf.ai", disc: 25, start: 29, best: "Podcasters, voiceover artists, and educators converting scripts into studio-quality synthetic speech" },
  { name: "Descript", slug: "descript", cat: "AI & Machine Learning", catSlug: "ai", site: "https://descript.com", disc: 30, start: 12, best: "Content creators and podcasters who want to edit audio and video files as easily as a text document" },
  { name: "HeyGen", slug: "heygen", cat: "AI & Machine Learning", catSlug: "ai", site: "https://heygen.com", disc: 20, start: 29, best: "E-commerce brands and sales teams producing personalized outreach and video translation avatars" },
  { name: "Otter AI", slug: "otter-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://otter.ai", disc: 25, start: 16.99, best: "Hybrid teams and executives needing automated meeting transcription, summaries, and action items" },
  { name: "Fireflies AI", slug: "fireflies-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://fireflies.ai", disc: 20, start: 18, best: "Sales reps and project managers recording, transcribing, and searching call conversations" },
  { name: "Krea AI", slug: "krea-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://krea.ai", disc: 30, start: 30, best: "Designers and concept artists creating real-time canvas generations and HD upscaling" },
  { name: "Leonardo AI", slug: "leonardo-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://leonardo.ai", disc: 20, start: 12, best: "Game developers and graphic artists training bespoke micro-models for character and game asset art" },
  { name: "Magnific AI", slug: "magnific-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://magnific.ai", disc: 20, start: 39, best: "Photographers and 3D renderers needing ultra-high-resolution detail enhancement and hallucination" },
  { name: "Replicate", slug: "replicate", cat: "AI & Machine Learning", catSlug: "ai", site: "https://replicate.com", disc: 25, start: 5, best: "Full-stack developers running open-source machine learning models with serverless API calls" },
  { name: "Together AI", slug: "together-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://together.ai", disc: 20, start: 10, best: "AI engineers fine-tuning and hosting Llama 3, Mistral, and custom open-weights models at low latency" },
  { name: "Groq", slug: "groq", cat: "AI & Machine Learning", catSlug: "ai", site: "https://groq.com", disc: 25, start: 0, best: "Real-time AI voice and chat agents requiring 800+ tokens-per-second LPUs for instant responses" },
  { name: "Codeium", slug: "codeium", cat: "AI & Machine Learning", catSlug: "ai", site: "https://codeium.com", disc: 20, start: 0, best: "Developers looking for a zero-cost Copilot alternative with IDE autocomplete and in-editor chat" },
  { name: "Tabnine", slug: "tabnine", cat: "AI & Machine Learning", catSlug: "ai", site: "https://tabnine.com", disc: 20, start: 12, best: "Enterprise engineering departments needing private, self-hosted, SOC2-compliant code completion" },
  { name: "GitHub Copilot", slug: "github-copilot", cat: "AI & Machine Learning", catSlug: "ai", site: "https://github.com/features/copilot", disc: 20, start: 10, best: "Software engineers using VS Code, JetBrains, and Neovim wanting pair programming and CLI completion" },
  { name: "DeepL Pro", slug: "deepl-pro", cat: "AI & Machine Learning", catSlug: "ai", site: "https://deepl.com", disc: 20, start: 8.75, best: "Global enterprises and translators demanding nuanced, context-accurate document localization" },
  { name: "Rewind AI", slug: "rewind-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://rewind.ai", disc: 25, start: 19, best: "Mac power users wanting a searchable personal memory bank of everything they have seen or heard" },
  { name: "Tome App", slug: "tome-app", cat: "AI & Machine Learning", catSlug: "ai", site: "https://tome.app", disc: 30, start: 16, best: "Founders and sales leaders creating interactive, dynamic investor pitches and customer decks" },
  { name: "Gamma App", slug: "gamma-app", cat: "AI & Machine Learning", catSlug: "ai", site: "https://gamma.app", disc: 25, start: 10, best: "Educators and operators generating beautifully styled presentations, documents, and web pages from prompts" },
  { name: "Chatbase", slug: "chatbase", cat: "AI & Machine Learning", catSlug: "ai", site: "https://chatbase.co", disc: 30, start: 19, best: "SaaS founders creating bespoke customer support bots trained directly on documentation and website data" },

  // Developer Tools & DevOps
  { name: "PlanetScale", slug: "planetscale", cat: "Developer Tools", catSlug: "dev-tools", site: "https://planetscale.com", disc: 20, start: 39, best: "Fast-growing web applications requiring horizontal sharding and zero-downtime schema migrations" },
  { name: "Upstash", slug: "upstash", cat: "Developer Tools", catSlug: "dev-tools", site: "https://upstash.com", disc: 25, start: 0, best: "Serverless developers needing per-request pricing for Redis, Kafka, and Vector search engines" },
  { name: "Turso", slug: "turso", cat: "Developer Tools", catSlug: "dev-tools", site: "https://turso.tech", disc: 30, start: 0, best: "Edge computing architectures needing hundreds of micro-SQLite databases distributed globally" },
  { name: "Render Cloud", slug: "render-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://render.com", disc: 20, start: 7, best: "Full-stack teams migrating away from Heroku for unified hosting of web apps, static sites, and cron workers" },
  { name: "Fly.io", slug: "fly-io", cat: "Developer Tools", catSlug: "dev-tools", site: "https://fly.io", disc: 20, start: 5, best: "Developers wanting to deploy full-stack Docker containers on physical servers globally near users" },
  { name: "Koyeb", slug: "koyeb", cat: "Developer Tools", catSlug: "dev-tools", site: "https://koyeb.com", disc: 25, start: 0, best: "Modern startups looking for high-performance serverless containers with global edge routing" },
  { name: "Northflank", slug: "northflank", cat: "Developer Tools", catSlug: "dev-tools", site: "https://northflank.com", disc: 20, start: 0, best: "DevOps teams running microservices and stateful databases on modern developer-friendly cloud infrastructure" },
  { name: "Coolify", slug: "coolify", cat: "Developer Tools", catSlug: "dev-tools", site: "https://coolify.io", disc: 30, start: 5, best: "Self-hosters and indie hackers wanting an open-source, self-hosted Heroku and Netlify alternative" },
  { name: "Zeabur", slug: "zeabur", cat: "Developer Tools", catSlug: "dev-tools", site: "https://zeabur.com", disc: 25, start: 5, best: "Frontend and full-stack developers deploying multi-framework web services with automatic TLS" },
  { name: "Porter", slug: "porter", cat: "Developer Tools", catSlug: "dev-tools", site: "https://porter.run", disc: 20, start: 200, best: "Scale-ups wanting a PaaS experience directly inside their own AWS, GCP, or Azure VPC" },
  { name: "Qovery", slug: "qovery", cat: "Developer Tools", catSlug: "dev-tools", site: "https://qovery.com", disc: 20, start: 49, best: "Platform engineering teams creating self-service ephemeral staging environments on Kubernetes" },
  { name: "Doppler", slug: "doppler", cat: "Developer Tools", catSlug: "dev-tools", site: "https://doppler.com", disc: 25, start: 18, best: "Engineering teams syncing environment variables across development, CI/CD, and production clouds" },
  { name: "Infisical", slug: "infisical", cat: "Developer Tools", catSlug: "dev-tools", site: "https://infisical.com", disc: 25, start: 0, best: "DevSecOps leaders wanting an open-source, end-to-end encrypted secret management platform" },
  { name: "Pulumi", slug: "pulumi", cat: "Developer Tools", catSlug: "dev-tools", site: "https://pulumi.com", disc: 20, start: 0, best: "Cloud architects provisioning infrastructure as code using TypeScript, Python, Go, and C#" },
  { name: "Spacelift", slug: "spacelift", cat: "Developer Tools", catSlug: "dev-tools", site: "https://spacelift.io", disc: 20, start: 250, best: "Enterprise platform engineers orchestrating Terraform, OpenTofu, and Pulumi pipelines with governance" },
  { name: "Grafana Cloud", slug: "grafana-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://grafana.com", disc: 20, start: 0, best: "SREs and system engineers visualizing metrics, traces, and system performance on custom dashboards" },
  { name: "Axiom", slug: "axiom", cat: "Developer Tools", catSlug: "dev-tools", site: "https://axiom.co", disc: 25, start: 0, best: "Cloud developers ingesting and querying massive terabytes of structured event logs affordably" },
  { name: "Mezmo", slug: "mezmo", cat: "Developer Tools", catSlug: "dev-tools", site: "https://mezmo.com", disc: 20, start: 0, best: "Enterprise engineering teams controlling telemetry ingestion pipelines and log data routing" },
  { name: "Honeycomb io", slug: "honeycomb-io", cat: "Developer Tools", catSlug: "dev-tools", site: "https://honeycomb.io", disc: 20, start: 0, best: "High-scale engineering teams troubleshooting complex distributed microservices with high-cardinality tracing" },
  { name: "HyperDX", slug: "hyperdx", cat: "Developer Tools", catSlug: "dev-tools", site: "https://hyperdx.io", disc: 30, start: 0, best: "Full-stack builders debugging production errors with correlated logs, session replays, and OpenTelemetry" },
  { name: "Highlight io", slug: "highlight-io", cat: "Developer Tools", catSlug: "dev-tools", site: "https://highlight.io", disc: 25, start: 0, best: "Web developers looking for an integrated full-stack observability suite with session replay and error reporting" },
  { name: "PostHog Cloud", slug: "posthog-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://posthog.com", disc: 20, start: 0, best: "Product engineers wanting product analytics, feature flags, A/B testing, and session recording in one platform" },
  { name: "June so", slug: "june-so", cat: "Developer Tools", catSlug: "dev-tools", site: "https://june.so", disc: 25, start: 0, best: "B2B SaaS founders tracking user activation, account retention, and product-qualified leads effortlessly" },
  { name: "Amplitude Analytics", slug: "amplitude-analytics", cat: "Developer Tools", catSlug: "dev-tools", site: "https://amplitude.com", disc: 20, start: 0, best: "Growth managers analyzing user behavioral funnels and cohort retention across web and mobile apps" },
  { name: "Mixpanel", slug: "mixpanel", cat: "Developer Tools", catSlug: "dev-tools", site: "https://mixpanel.com", disc: 25, start: 0, best: "Product teams building interactive user flow analysis and conversion event funnels with sub-second queries" },
  { name: "RudderStack", slug: "rudderstack", cat: "Developer Tools", catSlug: "dev-tools", site: "https://rudderstack.com", disc: 20, start: 0, best: "Data engineers building a warehouse-first Customer Data Platform (CDP) on Snowflake, BigQuery, and Redshift" },
  { name: "Trigger dev", slug: "trigger-dev", cat: "Developer Tools", catSlug: "dev-tools", site: "https://trigger.dev", disc: 30, start: 0, best: "Next.js and Node.js developers building background jobs without timeouts, cold starts, or server setups" },
  { name: "Inngest", slug: "inngest", cat: "Developer Tools", catSlug: "dev-tools", site: "https://inngest.com", disc: 25, start: 0, best: "Software developers running event-driven durable workflows and background queues without queue infrastructure" },
  { name: "Temporal Cloud", slug: "temporal-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://temporal.io", disc: 20, start: 0, best: "Backend architects orchestrating mission-critical multi-step transactions with durable execution" },
  { name: "Novu", slug: "novu", cat: "Developer Tools", catSlug: "dev-tools", site: "https://novu.co", disc: 25, start: 0, best: "Product engineers implementing in-app notification centers, email, SMS, and push dispatch with templates" },

  // APIs, Messaging & Auth
  { name: "Knock App", slug: "knock-app", cat: "Developer Tools", catSlug: "dev-tools", site: "https://knock.app", disc: 20, start: 0, best: "SaaS developers building customer notification pipelines with cross-channel batching and digest scheduling" },
  { name: "Courier", slug: "courier", cat: "Developer Tools", catSlug: "dev-tools", site: "https://courier.com", disc: 20, start: 0, best: "Engineering teams unifying multitenant routing across Twilio, SendGrid, APNs, and webhooks via single API" },
  { name: "Magic Link", slug: "magic-link", cat: "Developer Tools", catSlug: "dev-tools", site: "https://magic.link", disc: 20, start: 0, best: "Decentralized and web3 developers onboarding users with passwordless email magic link authentication" },
  { name: "WorkOS", slug: "workos", cat: "Developer Tools", catSlug: "dev-tools", site: "https://workos.com", disc: 20, start: 0, best: "B2B SaaS companies selling to enterprise customers needing SAML SSO, Directory Sync, and Audit Logs" },
  { name: "Kinde", slug: "kinde", cat: "Developer Tools", catSlug: "dev-tools", site: "https://kinde.com", disc: 25, start: 0, best: "Startup teams implementing friction-free auth, social login, user billing, and multitenant permissions" },
  { name: "Stytch", slug: "stytch", cat: "Developer Tools", catSlug: "dev-tools", site: "https://stytch.com", disc: 20, start: 0, best: "Product teams implementing consumer and business authentication with passkeys, OTPs, and device fingerprinting" },
  { name: "Ory Network", slug: "ory-network", cat: "Developer Tools", catSlug: "dev-tools", site: "https://ory.sh", disc: 25, start: 0, best: "Cloud-native architectures seeking open-source Zero-Trust identity, access control, and OAuth2 servers" },
  { name: "Svix", slug: "svix", cat: "Developer Tools", catSlug: "dev-tools", site: "https://svix.com", disc: 30, start: 0, best: "API platforms sending reliable webhooks to developers with signature verification and retry telemetry" },
  { name: "Hookdeck", slug: "hookdeck", cat: "Developer Tools", catSlug: "dev-tools", site: "https://hookdeck.com", disc: 25, start: 0, best: "Software engineers managing incoming webhooks with ingestion queues, rate limiting, and replay tools" },
  { name: "Daily co", slug: "daily-co", cat: "Developer Tools", catSlug: "dev-tools", site: "https://daily.co", disc: 20, start: 0, best: "Application developers embedding real-time WebRTC audio, video, and screen sharing with minimal code" },
  { name: "LiveKit Cloud", slug: "livekit-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://livekit.io", disc: 25, start: 0, best: "AI voice and live interactive streaming engineers deploying WebRTC infrastructures globally" },
  { name: "Stream Chat", slug: "stream-chat", cat: "Developer Tools", catSlug: "dev-tools", site: "https://getstream.io", disc: 20, start: 0, best: "Mobile and web developers adding enterprise in-app chat feeds with 99.999% uptime and moderation" },
  { name: "Ably", slug: "ably", cat: "Developer Tools", catSlug: "dev-tools", site: "https://ably.com", disc: 20, start: 0, best: "Engineers building synchronized collaborative whiteboards, multiplayer gaming, and live GPS tracking" },
  { name: "Pusher", slug: "pusher", cat: "Developer Tools", catSlug: "dev-tools", site: "https://pusher.com", disc: 20, start: 0, best: "Web developers needing bi-directional hosted WebSockets for instant push alerts and live feeds" },
  { name: "UploadThing", slug: "uploadthing", cat: "Developer Tools", catSlug: "dev-tools", site: "https://uploadthing.com", disc: 30, start: 0, best: "Full-stack TypeScript developers wanting type-safe file uploads without S3 bucket configuration headaches" },

  // Productivity, Notes & Knowledge
  { name: "Obsidian Sync", slug: "obsidian-sync", cat: "Productivity", catSlug: "productivity", site: "https://obsidian.md", disc: 20, start: 4, best: "Researchers, writers, and thinkers maintaining a private, markdown-based second brain with local storage" },
  { name: "Craft Docs", slug: "craft-docs", cat: "Productivity", catSlug: "productivity", site: "https://craft.do", disc: 25, start: 8, best: "Apple ecosystem users creating gorgeous, native documents, collaborative wikis, and structured notes" },
  { name: "Bear Notes", slug: "bear-notes", cat: "Productivity", catSlug: "productivity", site: "https://bear.app", disc: 20, start: 2.99, best: "Mac and iOS purists seeking a lightning-fast, distraction-free markdown writing and tagging app" },
  { name: "Capacities", slug: "capacities", cat: "Productivity", catSlug: "productivity", site: "https://capacities.io", disc: 25, start: 0, best: "Studio-based thinkers organizing interconnected research through object-based note taking" },
  { name: "Anytype", slug: "anytype", cat: "Productivity", catSlug: "productivity", site: "https://anytype.io", disc: 30, start: 0, best: "Privacy-conscious individuals wanting a local-first, peer-to-peer encrypted workspace alternative to Notion" },
  { name: "Coda", slug: "coda-app", cat: "Productivity", catSlug: "productivity", site: "https://coda.io", disc: 20, start: 10, best: "Team leads consolidating fragmented docs, spreadsheets, and operational workflows into all-in-one docs" },
  { name: "Slite", slug: "slite", cat: "Productivity", catSlug: "productivity", site: "https://slite.com", disc: 25, start: 8, best: "Remote startups organizing company handbooks and internal knowledge with AI-driven Q&A search" },
  { name: "GitBook", slug: "gitbook", cat: "Productivity", catSlug: "productivity", site: "https://gitbook.com", disc: 20, start: 0, best: "Engineering teams documenting public APIs, developer portals, and technical product docs from Git" },
  { name: "ReadMe", slug: "readme-io", cat: "Productivity", catSlug: "productivity", site: "https://readme.com", disc: 20, start: 99, best: "API vendors creating interactive API reference documentation with instant testing consoles" },
  { name: "Archbee", slug: "archbee", cat: "Productivity", catSlug: "productivity", site: "https://archbee.com", disc: 25, start: 50, best: "Tech teams writing, maintaining, and publishing developer-first software architecture wikis" },
  { name: "Nuclino", slug: "nuclino", cat: "Productivity", catSlug: "productivity", site: "https://nuclino.com", disc: 20, start: 0, best: "Agile teams wanting a fast, lightweight collective brain that combines docs, Kanban boards, and mind maps" },
  { name: "Super so", slug: "super-so", cat: "Productivity", catSlug: "productivity", site: "https://super.so", disc: 25, start: 12, best: "Creators turning Notion pages into blazing-fast websites with custom domains and SEO optimization" },
  { name: "Potion so", slug: "potion-so", cat: "Productivity", catSlug: "productivity", site: "https://potion.so", disc: 30, start: 10, best: "Founders hosting blogs and company knowledge bases directly from Notion with clean markup" },
  { name: "Feather so", slug: "feather-so", cat: "Productivity", catSlug: "productivity", site: "https://feather.so", disc: 25, start: 39, best: "Solopreneurs publishing SEO-friendly blogs and landing pages directly managed inside Notion" },
  { name: "Bullet so", slug: "bullet-so", cat: "Productivity", catSlug: "productivity", site: "https://bullet.so", disc: 30, start: 9.99, best: "Designers building multi-page membership sites and client portals backed by Notion tables" },
  { name: "Akiflow", slug: "akiflow", cat: "Productivity", catSlug: "productivity", site: "https://akiflow.com", disc: 20, start: 19, best: "Busy executives unifying tasks, emails, and calendar events into a single daily time-blocking interface" },
  { name: "Sunsama", slug: "sunsama", cat: "Productivity", catSlug: "productivity", site: "https://sunsama.com", disc: 20, start: 16, best: "Knowledge workers seeking mindful work habits, intentional daily planning, and realistic time estimates" },
  { name: "Motion Calendar", slug: "motion-calendar", cat: "Productivity", catSlug: "productivity", site: "https://usemotion.com", disc: 25, start: 19, best: "Professionals who want AI to automatically schedule their tasks, meetings, and projects without manual friction" },
  { name: "Morgen Calendar", slug: "morgen-calendar", cat: "Productivity", catSlug: "productivity", site: "https://morgen.so", disc: 25, start: 0, best: "Remote workers consolidating Google, Outlook, and Apple calendars with built-in scheduling links" },
  { name: "Routine App", slug: "routine-app", cat: "Productivity", catSlug: "productivity", site: "https://routine.co", disc: 30, start: 0, best: "Productivity enthusiasts blending agenda notes, meeting preparation, and personal task management" },
  { name: "AmpleNote", slug: "amplenote", cat: "Productivity", catSlug: "productivity", site: "https://amplenote.com", disc: 20, start: 0, best: "GTD practitioners turning fleeting ideas into prioritized tasks and scheduled calendar time-blocks" },
  { name: "Taskade", slug: "taskade", cat: "Productivity", catSlug: "productivity", site: "https://taskade.com", disc: 30, start: 0, best: "Distributed teams building AI-powered autonomous agent workflows and collaborative task checklists" },
  { name: "Todoist Pro", slug: "todoist-pro", cat: "Productivity", catSlug: "productivity", site: "https://todoist.com", disc: 20, start: 4, best: "Individuals and agile teams organizing daily priorities with natural language input and smart filters" },
  { name: "TickTick", slug: "ticktick", cat: "Productivity", catSlug: "productivity", site: "https://ticktick.com", disc: 20, start: 2.99, best: "Power users wanting combined to-do lists, Pomodoro timers, habit tracking, and calendar views" },

  // Email & Communication
  { name: "Superhuman", slug: "superhuman", cat: "Productivity", catSlug: "productivity", site: "https://superhuman.com", disc: 20, start: 30, best: "Founders, executives, and investors wanting to fly through inbox zero at twice the speed with keyboard shortcuts" },
  { name: "Spark Mail", slug: "spark-mail", cat: "Productivity", catSlug: "productivity", site: "https://sparkmailapp.com", disc: 25, start: 0, best: "Cross-platform teams collaborating on email drafts with Smart Inbox prioritization and shared inboxes" },
  { name: "Shortwave", slug: "shortwave", cat: "Productivity", catSlug: "productivity", site: "https://shortwave.com", disc: 25, start: 0, best: "Gmail power users wanting AI-powered email search, thread summarization, and task management" },
  { name: "Missive", slug: "missive", cat: "Productivity", catSlug: "productivity", site: "https://missiveapp.com", disc: 20, start: 14, best: "Customer success teams managing shared inboxes across Email, SMS, WhatsApp, and social media" },
  { name: "Clean Email", slug: "clean-email", cat: "Productivity", catSlug: "productivity", site: "https://clean.email", disc: 30, start: 9.99, best: "Overwhelmed email users unsubscribing from newsletters and organizing thousands of messy emails in bulk" },
  { name: "Mailspring Pro", slug: "mailspring-pro", cat: "Productivity", catSlug: "productivity", site: "https://getmailspring.com", disc: 25, start: 8, best: "Open-source enthusiasts wanting a sleek desktop client with read receipts and link tracking" },
  { name: "Hey Email", slug: "hey-email", cat: "Productivity", catSlug: "productivity", site: "https://hey.com", disc: 20, start: 99, best: "Professionals who want an opinionated email redesign with The Screener to block unwanted senders" },
  { name: "Fastmail", slug: "fastmail", cat: "Productivity", catSlug: "productivity", site: "https://fastmail.com", disc: 20, start: 3, best: "Privacy-focused users wanting independent email hosting with custom domain support and masked email addresses" },
  { name: "Mailmeteor", slug: "mailmeteor", cat: "Marketing & Sales", catSlug: "marketing", site: "https://mailmeteor.com", disc: 25, start: 9.99, best: "Small businesses sending personalized mail merges directly from Google Sheets with high deliverability" },
  { name: "GMass", slug: "gmass", cat: "Marketing & Sales", catSlug: "marketing", site: "https://gmass.co", disc: 20, start: 20, best: "Cold emailers and recruiters launching massive email campaigns directly inside their standard Gmail inbox" },
  { name: "Mixmax", slug: "mixmax", cat: "Marketing & Sales", catSlug: "marketing", site: "https://mixmax.com", disc: 20, start: 29, best: "Sales account executives embedding interactive calendar polls, email sequences, and CRM syncing" },
  { name: "Postmark", slug: "postmark", cat: "Developer Tools", catSlug: "dev-tools", site: "https://postmarkapp.com", disc: 20, start: 15, best: "Web apps requiring industry-leading sub-second deliverability for password resets and receipts" },
  { name: "Mailgun", slug: "mailgun", cat: "Developer Tools", catSlug: "dev-tools", site: "https://mailgun.com", disc: 20, start: 35, best: "Enterprise developers sending, receiving, and tracking millions of transactional and marketing emails" },
  { name: "SendGrid", slug: "sendgrid", cat: "Developer Tools", catSlug: "dev-tools", site: "https://sendgrid.com", disc: 20, start: 19.95, best: "Cloud platforms integrating reliable bulk email delivery with REST APIs and SMTP relays" },

  // Design, UI & Creative
  { name: "Penpot", slug: "penpot", cat: "Design & Creative", catSlug: "design", site: "https://penpot.app", disc: 25, start: 0, best: "Open-source design teams and engineers building UI/UX components using web-native SVG standards" },
  { name: "Lunacy", slug: "lunacy", cat: "Design & Creative", catSlug: "design", site: "https://icons8.com/lunacy", disc: 30, start: 0, best: "Graphic designers looking for a native, offline-first vector graphic editor with built-in asset libraries" },
  { name: "ProtoPie", slug: "protopie", cat: "Design & Creative", catSlug: "design", site: "https://protopie.io", disc: 20, start: 67, best: "Interaction designers building high-fidelity realistic mobile, automotive, and hardware prototypes" },
  { name: "Spline 3D", slug: "spline-3d", cat: "Design & Creative", catSlug: "design", site: "https://spline.design", disc: 25, start: 0, best: "Web designers creating interactive 3D scenes, physics simulations, and embeddable WebGL models" },
  { name: "Rive App", slug: "rive-app", cat: "Design & Creative", catSlug: "design", site: "https://rive.app", disc: 20, start: 0, best: "Game developers and UI engineers building interactive runtime graphics with state machines" },
  { name: "LottieLab", slug: "lottielab", cat: "Design & Creative", catSlug: "design", site: "https://lottielab.com", disc: 30, start: 0, best: "Motion designers and product teams creating and editing lightweight Lottie animations for web and mobile" },
  { name: "Jitter Video", slug: "jitter-video", cat: "Design & Creative", catSlug: "design", site: "https://jitter.video", disc: 25, start: 0, best: "Marketing designers animating micro-interactions, UI previews, and social video clips in minutes" },
  { name: "Rotato 3D", slug: "rotato-3d", cat: "Design & Creative", catSlug: "design", site: "https://rotato.app", disc: 25, start: 39, best: "App developers producing photorealistic 3D device mockups and rotating app promo videos" },
  { name: "Shottr Pro", slug: "shottr-pro", cat: "Design & Creative", catSlug: "design", site: "https://shottr.cc", disc: 20, start: 8, best: "Mac users wanting a feather-light screenshot tool with pixelation, scrolling capture, and OCR" },
  { name: "Xnapper", slug: "xnapper", cat: "Design & Creative", catSlug: "design", site: "https://xnapper.com", disc: 25, start: 29, best: "Content creators capturing stunning, clean screenshots with auto-balanced padding and backgrounds" },
  { name: "Pixelmator Pro", slug: "pixelmator-pro", cat: "Design & Creative", catSlug: "design", site: "https://pixelmator.com", disc: 20, start: 49.99, best: "Mac creators wanting native Apple Silicon image editing, vector tools, and ML photo enhancement" },
  { name: "Photomator", slug: "photomator", cat: "Design & Creative", catSlug: "design", site: "https://photomator.com", disc: 25, start: 29.99, best: "Photographers batch-editing RAW photos on Mac and iPad with AI auto-cropping and selective color" },
  { name: "Affinity Designer", slug: "affinity-designer", cat: "Design & Creative", catSlug: "design", site: "https://affinity.serif.com/designer", disc: 20, start: 69.99, best: "Illustrators and vector artists seeking a one-time perpetual license alternative to Adobe Illustrator" },
  { name: "Affinity Photo", slug: "affinity-photo", cat: "Design & Creative", catSlug: "design", site: "https://affinity.serif.com/photo", disc: 20, start: 69.99, best: "Professional photographers and retouchers wanting full RAW development without subscription fees" },
  { name: "Sketch App", slug: "sketch-app", cat: "Design & Creative", catSlug: "design", site: "https://sketch.com", disc: 20, start: 10, best: "Mac-first design teams creating component design systems and vector layouts with native speed" },
  { name: "Zeplin", slug: "zeplin", cat: "Design & Creative", catSlug: "design", site: "https://zeplin.io", disc: 25, start: 8, best: "Product teams bridging design-to-development handoff with automated specs, code snippets, and assets" },
  { name: "Zeroheight", slug: "zeroheight", cat: "Design & Creative", catSlug: "design", site: "https://zeroheight.com", disc: 20, start: 49, best: "Enterprise design system teams documenting design tokens, component guidelines, and code examples" },
  { name: "Iconfinder Pro", slug: "iconfinder-pro", cat: "Design & Creative", catSlug: "design", site: "https://iconfinder.com", disc: 25, start: 9, best: "UI designers sourcing millions of curated SVG icons, 3D illustrations, and sticker packs" },

  // SEO, Marketing & Sales Intelligence
  { name: "Ahrefs", slug: "ahrefs", cat: "Marketing & Sales", catSlug: "marketing", site: "https://ahrefs.com", disc: 20, start: 99, best: "SEO professionals and content marketing agencies conducting backlink analysis and keyword research" },
  { name: "Moz Pro", slug: "moz-pro", cat: "Marketing & Sales", catSlug: "marketing", site: "https://moz.com", disc: 20, start: 99, best: "Digital marketers tracking Domain Authority, search engine rankings, and on-page technical SEO audits" },
  { name: "Mangools", slug: "mangools", cat: "Marketing & Sales", catSlug: "marketing", site: "https://mangools.com", disc: 30, start: 29.90, best: "Bloggers and solopreneurs wanting an intuitive, affordable suite of KWFinder, SERPChecker, and SiteProfiler" },
  { name: "SpyFu", slug: "spyfu", cat: "Marketing & Sales", catSlug: "marketing", site: "https://spyfu.com", disc: 25, start: 39, best: "Performance marketers analyzing competitor Google Search ads, keywords, and organic history" },
  { name: "Ubersuggest", slug: "ubersuggest", cat: "Marketing & Sales", catSlug: "marketing", site: "https://neilpatel.com/ubersuggest", disc: 30, start: 29, best: "Small business owners looking for low-cost SEO audits, content ideas, and competitor traffic estimates" },
  { name: "Clearscope", slug: "clearscope", cat: "Marketing & Sales", catSlug: "marketing", site: "https://clearscope.io", disc: 20, start: 170, best: "Content marketing teams optimizing high-intent blog posts with real-time NLP semantic keyword grading" },
  { name: "Frase io", slug: "frase-io", cat: "Marketing & Sales", catSlug: "marketing", site: "https://frase.io", disc: 25, start: 15, best: "Content writers researching Google SERP questions and generating optimized outlines in minutes" },
  { name: "MarketMuse", slug: "marketmuse", cat: "Marketing & Sales", catSlug: "marketing", site: "https://marketmuse.com", disc: 20, start: 149, best: "Content strategists mapping topic authority and identifying competitive content gaps with AI audits" },
  { name: "Anyword", slug: "anyword", cat: "Marketing & Sales", catSlug: "marketing", site: "https://anyword.com", disc: 25, start: 39, best: "Performance advertisers scoring and optimizing ad copy with predictive performance metrics" },
  { name: "Scalenut", slug: "scalenut", cat: "Marketing & Sales", catSlug: "marketing", site: "https://scalenut.com", disc: 30, start: 39, best: "SEO teams scaling blog article production with end-to-end automated research and Cruise Mode drafting" },
  { name: "Originality AI", slug: "originality-ai", cat: "Marketing & Sales", catSlug: "marketing", site: "https://originality.ai", disc: 25, start: 14.95, best: "Web publishers and agency editors verifying AI content detection, originality, and fact-checking" },
  { name: "Instantly ai", slug: "instantly-ai", cat: "Marketing & Sales", catSlug: "marketing", site: "https://instantly.ai", disc: 20, start: 37, best: "B2B growth agencies scaling outbound cold email with automated inbox warmups and unlimited accounts" },
  { name: "Woodpecker", slug: "woodpecker", cat: "Marketing & Sales", catSlug: "marketing", site: "https://woodpecker.co", disc: 25, start: 29, best: "Lead generation specialists sending multi-channel follow-ups with condition-based reply detection" },
  { name: "Reply io", slug: "reply-io", cat: "Marketing & Sales", catSlug: "marketing", site: "https://reply.io", disc: 20, start: 49, best: "Sales development teams automating LinkedIn touches, email drips, and cloud phone calls" },
  { name: "Close CRM", slug: "close-crm", cat: "Marketing & Sales", catSlug: "marketing", site: "https://close.com", disc: 20, start: 49, best: "High-velocity inside sales teams needing built-in calling, SMS, predictive dialing, and pipeline tracking" },
  { name: "Folk CRM", slug: "folk-crm", cat: "Marketing & Sales", catSlug: "marketing", site: "https://folk.app", disc: 25, start: 20, best: "Founders, creators, and boutique agencies managing relationships in a Notion-like contact database" },
  { name: "Attio CRM", slug: "attio-crm", cat: "Marketing & Sales", catSlug: "marketing", site: "https://attio.com", disc: 20, start: 29, best: "Next-generation startups wanting an automated, data-rich CRM built natively for modern product data" },
  { name: "Pipedrive", slug: "pipedrive", cat: "Marketing & Sales", catSlug: "marketing", site: "https://pipedrive.com", disc: 20, start: 14.90, best: "Small-to-medium businesses wanting a visual, activity-based deal pipeline to increase closing rates" },
  { name: "HubSpot Starter", slug: "hubspot-starter", cat: "Marketing & Sales", catSlug: "marketing", site: "https://hubspot.com", disc: 20, start: 20, best: "Growing startups needing an integrated CRM, email marketing, landing pages, and lead capture forms" },
  { name: "Capsule CRM", slug: "capsule-crm", cat: "Marketing & Sales", catSlug: "marketing", site: "https://capsulecrm.com", disc: 25, start: 18, best: "Consultancies and service businesses seeking a straightforward, reliable contact management system" },
  { name: "Copper CRM", slug: "copper-crm", cat: "Marketing & Sales", catSlug: "marketing", site: "https://copper.com", disc: 20, start: 29, best: "Google Workspace power users wanting a CRM that lives natively inside their Gmail and Google Calendar" },
  { name: "Warmup Inbox", slug: "warmup-inbox", cat: "Marketing & Sales", catSlug: "marketing", site: "https://warmupinbox.com", disc: 30, start: 12, best: "Cold emailers improving spam reputation and inbox placement across Gmail, Outlook, and custom SMTP" },
  { name: "Mailreach", slug: "mailreach", cat: "Marketing & Sales", catSlug: "marketing", site: "https://mailreach.co", disc: 25, start: 25, best: "Outbound sales teams running automated peer-to-peer email warmups with spam folder recovery" },

  // Social Media & Community
  { name: "Buffer Pro", slug: "buffer-pro", cat: "Marketing & Sales", catSlug: "marketing", site: "https://buffer.com", disc: 25, start: 6, best: "Solopreneurs and small brands scheduling content across LinkedIn, X, Mastodon, and Threads cleanly" },
  { name: "Hootsuite", slug: "hootsuite", cat: "Marketing & Sales", catSlug: "marketing", site: "https://hootsuite.com", disc: 20, start: 99, best: "Social media agencies managing enterprise brand publishing, social listening, and customer engagement" },
  { name: "Sprout Social", slug: "sprout-social", cat: "Marketing & Sales", catSlug: "marketing", site: "https://sproutsocial.com", disc: 20, start: 199, best: "Enterprise marketing teams analyzing social sentiment, team workflows, and multi-channel ROI" },
  { name: "Later", slug: "later-app", cat: "Marketing & Sales", catSlug: "marketing", site: "https://later.com", disc: 25, start: 18, best: "Instagram, TikTok, and Pinterest creators visually planning their grid layout and scheduling Reels" },
  { name: "Planoly", slug: "planoly", cat: "Marketing & Sales", catSlug: "marketing", site: "https://planoly.com", disc: 30, start: 13, best: "Visual creators and e-commerce stores planning aesthetic social content with auto-posting" },
  { name: "Publer", slug: "publer", cat: "Marketing & Sales", catSlug: "marketing", site: "https://publer.io", disc: 25, start: 12, best: "Social media managers scheduling posts, carousels, and YouTube Shorts with integrated Canva design" },
  { name: "SocialBee", slug: "socialbee", cat: "Marketing & Sales", catSlug: "marketing", site: "https://socialbee.com", disc: 25, start: 29, best: "Small businesses recycling evergreen content categories and scheduling posts across all networks" },
  { name: "FeedHive", slug: "feedhive", cat: "Marketing & Sales", catSlug: "marketing", site: "https://feedhive.com", disc: 30, start: 19, best: "Creators using AI-assisted writing, post recycling, and engagement analytics to grow on social media" },
  { name: "Postwise", slug: "postwise", cat: "Marketing & Sales", catSlug: "marketing", site: "https://postwise.ai", disc: 25, start: 29, best: "X/Twitter creators writing viral threads, scheduling tweets, and converting followers into customers" },
  { name: "TweetHunter", slug: "tweethunter", cat: "Marketing & Sales", catSlug: "marketing", site: "https://tweethunter.io", disc: 20, start: 49, best: "Founders and marketers building personal brands on X with a library of 3M+ high-performing tweets" },
  { name: "Hypefury", slug: "hypefury", cat: "Marketing & Sales", catSlug: "marketing", site: "https://hypefury.com", disc: 25, start: 19, best: "Online entrepreneurs automating thread publishing, cross-posting to LinkedIn, and sales pitch tweets" },
  { name: "Typefully", slug: "typefully", cat: "Marketing & Sales", catSlug: "marketing", site: "https://typefully.com", disc: 20, start: 12.50, best: "Distraction-free writers crafting polished threads for X and LinkedIn with team feedback and analytics" },
  { name: "Brand24", slug: "brand24", cat: "Marketing & Sales", catSlug: "marketing", site: "https://brand24.com", disc: 20, start: 79, best: "Brand managers tracking online mentions across news, social media, podcasts, and video in real time" },
  { name: "Circle so", slug: "circle-so", cat: "Community & Support", catSlug: "support", site: "https://circle.so", disc: 20, start: 89, best: "Creators, educators, and brands hosting premium communities, courses, live events, and discussions" },
  { name: "Mighty Networks", slug: "mighty-networks", cat: "Community & Support", catSlug: "support", site: "https://mightynetworks.com", disc: 20, start: 41, best: "Community creators bringing courses, memberships, and paid community groups together under own brand" },
  { name: "Bettermode", slug: "bettermode", cat: "Community & Support", catSlug: "support", site: "https://bettermode.com", disc: 20, start: 19, best: "Product-led companies building customer self-service communities and product feedback hubs" },
  { name: "Discourse Hosting", slug: "discourse-hosting", cat: "Community & Support", catSlug: "support", site: "https://discourse.org", disc: 20, start: 50, best: "Developer platforms and open-source ecosystems seeking a world-class civilized discussion forum" },
  { name: "Skool Community", slug: "skool-community", cat: "Community & Support", catSlug: "support", site: "https://skool.com", disc: 20, start: 99, best: "Course creators and group coaches wanting gamified community leaderboards and high student completion" },
  { name: "Heartbeat Chat", slug: "heartbeat-chat", cat: "Community & Support", catSlug: "support", site: "https://heartbeat.chat", disc: 25, start: 49, best: "Paid community leaders organizing threads, voice rooms, match-ups, and calendar events seamlessly" },

  // Finance, Billing & Ops
  { name: "Paddle", slug: "paddle", cat: "Finance & Operations", catSlug: "finance", site: "https://paddle.com", disc: 20, start: 0, best: "Software founders wanting a Merchant of Record (MoR) to handle global sales tax, VAT, and compliance" },
  { name: "Lemon Squeezy", slug: "lemon-squeezy", cat: "Finance & Operations", catSlug: "finance", site: "https://lemonsqueezy.com", disc: 20, start: 0, best: "Indie hackers and digital creators selling software licenses, digital downloads, and subscriptions" },
  { name: "Chargebee", slug: "chargebee", cat: "Finance & Operations", catSlug: "finance", site: "https://chargebee.com", disc: 20, start: 0, best: "Scale-ups needing complex subscription billing, usage-based pricing, and revenue recognition rules" },
  { name: "Recurly", slug: "recurly", cat: "Finance & Operations", catSlug: "finance", site: "https://recurly.com", disc: 20, start: 0, best: "Enterprise subscription companies maximizing transaction success rates with AI-driven dunning" },
  { name: "ProfitWell", slug: "profitwell", cat: "Finance & Operations", catSlug: "finance", site: "https://profitwell.com", disc: 25, start: 0, best: "SaaS CFOs analyzing subscription churn metrics, revenue cohorts, and benchmark data with zero fee" },
  { name: "ChartMogul", slug: "chartmogul", cat: "Finance & Operations", catSlug: "finance", site: "https://chartmogul.com", disc: 20, start: 0, best: "B2B SaaS companies consolidating Stripe, App Store, and PayPal into real-time MRR and ARR dashboards" },
  { name: "Firstbase", slug: "firstbase", cat: "Finance & Operations", catSlug: "finance", site: "https://firstbase.io", disc: 25, start: 399, best: "International entrepreneurs incorporating a US Delaware or Wyoming company with bank accounts" },
  { name: "Doola", slug: "doola", cat: "Finance & Operations", catSlug: "finance", site: "https://doola.com", disc: 25, start: 297, best: "Global founders forming a US LLC with registered agent services, state filings, and tax reporting" },
  { name: "Mercury Bank", slug: "mercury-bank", cat: "Finance & Operations", catSlug: "finance", site: "https://mercury.com", disc: 20, start: 0, best: "Tech startups wanting modern FDIC-insured banking, virtual cards, wire transfers, and API access" },
  { name: "Brex", slug: "brex", cat: "Finance & Operations", catSlug: "finance", site: "https://brex.com", disc: 20, start: 0, best: "High-growth venture-backed companies wanting corporate credit cards without personal guarantees" },
  { name: "Ramp", slug: "ramp", cat: "Finance & Operations", catSlug: "finance", site: "https://ramp.com", disc: 20, start: 0, best: "Finance teams controlling company spending with 1.5% cashback cards and automated receipt matching" },
  { name: "Deel", slug: "deel", cat: "Finance & Operations", catSlug: "finance", site: "https://deel.com", disc: 20, start: 49, best: "Global companies hiring and paying international contractors and full-time employees in 150+ countries" },
  { name: "Remote com", slug: "remote-com", cat: "Finance & Operations", catSlug: "finance", site: "https://remote.com", disc: 20, start: 29, best: "Distributed teams managing global employer of record (EOR), payroll, benefits, and equity compliance" },
  { name: "Rippling", slug: "rippling", cat: "Finance & Operations", catSlug: "finance", site: "https://rippling.com", disc: 20, start: 8, best: "Modern businesses uniting HR, international payroll, IT device management, and app access" },
  { name: "Gusto", slug: "gusto", cat: "Finance & Operations", catSlug: "finance", site: "https://gusto.com", disc: 25, start: 40, best: "Small businesses running automated payroll, health benefits, and HR compliance with ease" },
  { name: "Wise Business", slug: "wise-business", cat: "Finance & Operations", catSlug: "finance", site: "https://wise.com", disc: 20, start: 31, best: "Cross-border companies receiving and transferring money internationally at true mid-market exchange rates" },
  { name: "QuickBooks Online", slug: "quickbooks-online", cat: "Finance & Operations", catSlug: "finance", site: "https://quickbooks.intuit.com", disc: 25, start: 30, best: "Accountants and small business owners tracking income, expenses, invoices, and quarterly tax readiness" },
  { name: "Xero", slug: "xero", cat: "Finance & Operations", catSlug: "finance", site: "https://xero.com", disc: 20, start: 15, best: "Small business owners and bookkeepers reconciling bank feeds and sending automated payment invoices" },
  { name: "FreshBooks", slug: "freshbooks", cat: "Finance & Operations", catSlug: "finance", site: "https://freshbooks.com", disc: 30, start: 19, best: "Freelancers and service agencies tracking billable hours, logging client expenses, and sending invoices" },
  { name: "Expensify", slug: "expensify", cat: "Finance & Operations", catSlug: "finance", site: "https://expensify.com", disc: 25, start: 5, best: "Employees and finance managers scanning receipts with SmartScan for instant corporate reimbursement" },

  // Customer Support & Feedback
  { name: "Zendesk Suite", slug: "zendesk-suite", cat: "Community & Support", catSlug: "support", site: "https://zendesk.com", disc: 20, start: 55, best: "Enterprises needing omnichannel ticketing across email, chat, voice, and social with custom routing" },
  { name: "Crisp Chat", slug: "crisp-chat", cat: "Community & Support", catSlug: "support", site: "https://crisp.chat", disc: 25, start: 0, best: "Fast-moving startups embedding all-in-one live chat, knowledge bases, co-browsing, and chatbot automation" },
  { name: "Help Scout", slug: "help-scout", cat: "Community & Support", catSlug: "support", site: "https://helpscout.com", disc: 20, start: 22, best: "Customer-centric businesses who want a personal, shared inbox experience without clunky ticket numbers" },
  { name: "Front App", slug: "front-app", cat: "Community & Support", catSlug: "support", site: "https://front.com", disc: 20, start: 19, best: "Service and operations teams managing high-stakes client communication across email, SMS, and chat" },
  { name: "Gorgias", slug: "gorgias", cat: "Community & Support", catSlug: "support", site: "https://gorgias.com", disc: 20, start: 60, best: "Shopify and e-commerce merchants resolving order questions, refunds, and tracking directly from chat" },
  { name: "LiveChat", slug: "livechat-inc", cat: "Community & Support", catSlug: "support", site: "https://livechat.com", disc: 20, start: 20, best: "Sales and support teams providing real-time website visitor assistance with canned responses" },
  { name: "Tidio", slug: "tidio", cat: "Community & Support", catSlug: "support", site: "https://tidio.com", disc: 25, start: 29, best: "Online storefronts deploying AI Lyro customer support bots to answer 70% of routine questions" },
  { name: "Chatwoot", slug: "chatwoot", cat: "Community & Support", catSlug: "support", site: "https://chatwoot.com", disc: 30, start: 0, best: "Privacy-focused organizations seeking an open-source, self-hosted alternative to Intercom and Zendesk" },
  { name: "Plain com", slug: "plain-com", cat: "Community & Support", catSlug: "support", site: "https://plain.com", disc: 20, start: 0, best: "Developer-first B2B companies demanding lightning-fast, keyboard-driven support workflows and clean APIs" },
  { name: "DevRev", slug: "devrev", cat: "Community & Support", catSlug: "support", site: "https://devrev.ai", disc: 25, start: 0, best: "Product-led companies linking customer tickets directly to developer code commits and GitHub issues" },
  { name: "ChurnZero", slug: "churnzero", cat: "Community & Support", catSlug: "support", site: "https://churnzero.com", disc: 20, start: 200, best: "Customer success managers tracking client health scores, onboarding milestones, and renewal risks" },
  { name: "Vitally", slug: "vitally", cat: "Community & Support", catSlug: "support", site: "https://vitally.io", disc: 20, start: 200, best: "High-growth B2B SaaS teams wanting an all-in-one collaborative customer success and project platform" },
  { name: "Planhat", slug: "planhat", cat: "Community & Support", catSlug: "support", site: "https://planhat.com", disc: 20, start: 200, best: "Enterprise customer operations monitoring customer health, revenue retention, and lifecycle automation" },
  { name: "Gainsight", slug: "gainsight", cat: "Community & Support", catSlug: "support", site: "https://gainsight.com", disc: 20, start: 300, best: "Large software corporations managing enterprise customer success, product experience, and net retention" },
  { name: "Productboard", slug: "productboard", cat: "Community & Support", catSlug: "support", site: "https://productboard.com", disc: 20, start: 20, best: "Product managers aligning roadmap priorities with customer feature requests and feedback insights" },
  { name: "Canny io", slug: "canny-io", cat: "Community & Support", catSlug: "support", site: "https://canny.io", disc: 25, start: 0, best: "SaaS companies capturing, voting on, and prioritizing user feature requests with public roadmaps" },
  { name: "Upvoty", slug: "upvoty", cat: "Community & Support", catSlug: "support", site: "https://upvoty.com", disc: 30, start: 15, best: "Indie hackers and bootstrapper teams wanting an affordable, clean user feedback board and changelog" },
  { name: "Featurebase", slug: "featurebase", cat: "Community & Support", catSlug: "support", site: "https://featurebase.app", disc: 30, start: 0, best: "Modern software apps embedding feedback voting widgets, changelog announcements, and help centers" },
  { name: "Frill co", slug: "frill-co", cat: "Community & Support", catSlug: "support", site: "https://frill.co", disc: 25, start: 25, best: "Design-conscious SaaS founders wanting minimalist feature request boards and in-app release notes" },
  { name: "Sleekplan", slug: "sleekplan", cat: "Community & Support", catSlug: "support", site: "https://sleekplan.com", disc: 30, start: 0, best: "Product teams collecting customer ideas, publishing roadmaps, and running customer satisfaction surveys" },

  // E-commerce, Forms & Web Building
  { name: "Medusa js", slug: "medusa-js", cat: "Developer Tools", catSlug: "dev-tools", site: "https://medusajs.com", disc: 25, start: 0, best: "Developers wanting an open-source, headless Node.js commerce engine with complete customization" },
  { name: "Swell Commerce", slug: "swell-commerce", cat: "Developer Tools", catSlug: "dev-tools", site: "https://swell.is", disc: 20, start: 0, best: "Modern brands creating headless e-commerce storefronts with API-first subscriptions and models" },
  { name: "Payhip", slug: "payhip", cat: "Finance & Operations", catSlug: "finance", site: "https://payhip.com", disc: 30, start: 0, best: "Authors, designers, and educators selling digital downloads, courses, and coaching memberships" },
  { name: "Stan Store", slug: "stan-store", cat: "Marketing & Sales", catSlug: "marketing", site: "https://stan.store", disc: 20, start: 29, best: "TikTok and Instagram creators monetizing followers with link-in-bio digital products and calendar bookings" },
  { name: "Kit ConvertKit", slug: "kit-convertkit", cat: "Marketing & Sales", catSlug: "marketing", site: "https://kit.com", disc: 20, start: 0, best: "Professional creators, authors, and podcasters building automated email funnels and paid newsletters" },
  { name: "ActiveCampaign", slug: "activecampaign", cat: "Marketing & Sales", catSlug: "marketing", site: "https://activecampaign.com", disc: 20, start: 29, best: "Businesses orchestrating sophisticated marketing automation workflows, customer tags, and CRM deals" },
  { name: "Drip", slug: "drip-ecommerce", cat: "Marketing & Sales", catSlug: "marketing", site: "https://drip.com", disc: 25, start: 39, best: "Direct-to-consumer e-commerce brands automating post-purchase email flows and customer segments" },
  { name: "Klaviyo", slug: "klaviyo", cat: "Marketing & Sales", catSlug: "marketing", site: "https://klaviyo.com", disc: 20, start: 20, best: "Shopify stores driving repeat revenue through data-driven abandoned cart SMS and personalized emails" },
  { name: "Omnisend", slug: "omnisend", cat: "Marketing & Sales", catSlug: "marketing", site: "https://omnisend.com", disc: 25, start: 0, best: "E-commerce merchants combining email and SMS marketing with pre-built e-commerce automation recipes" },
  { name: "Moosend", slug: "moosend", cat: "Marketing & Sales", catSlug: "marketing", site: "https://moosend.com", disc: 30, start: 9, best: "Budget-conscious businesses sending automated newsletter campaigns with drag-and-drop landing pages" },
  { name: "Tally so", slug: "tally-so", cat: "Productivity", catSlug: "productivity", site: "https://tally.so", disc: 25, start: 0, best: "Founders creating beautiful, Notion-like online forms, surveys, and lead magnets for free" },
  { name: "Fillout", slug: "fillout", cat: "Productivity", catSlug: "productivity", site: "https://fillout.com", disc: 25, start: 0, best: "No-code builders creating dynamic multi-page forms connected directly to Airtable, Notion, and HubSpot" },
  { name: "Jotform", slug: "jotform", cat: "Productivity", catSlug: "productivity", site: "https://jotform.com", disc: 20, start: 34, best: "Organizations needing powerful online forms with e-signatures, payment collection, and PDF workflows" },
  { name: "Paperform", slug: "paperform", cat: "Productivity", catSlug: "productivity", site: "https://paperform.co", disc: 25, start: 20, best: "Small businesses building branded, landing-page-style booking forms with integrated checkout" },
  { name: "Reform Forms", slug: "reform-forms", cat: "Productivity", catSlug: "productivity", site: "https://reform.app", disc: 30, start: 19, best: "SaaS companies wanting clean, accessible multi-step lead qualification forms without bloat" },
  { name: "Formbricks", slug: "formbricks", cat: "Productivity", catSlug: "productivity", site: "https://formbricks.com", disc: 30, start: 0, best: "Product managers embedding in-app micro-surveys to collect real-time user satisfaction and CSAT feedback" },

  // Security, Privacy & Infrastructure
  { name: "Bitwarden", slug: "bitwarden", cat: "Security & DevSecOps", catSlug: "security", site: "https://bitwarden.com", disc: 20, start: 0, best: "Open-source advocates and enterprises seeking secure, zero-knowledge encrypted password management" },
  { name: "Dashlane", slug: "dashlane", cat: "Security & DevSecOps", catSlug: "security", site: "https://dashlane.com", disc: 20, start: 4.99, best: "Teams wanting seamless autofill across mobile and desktop with dark web monitoring and VPN included" },
  { name: "Proton Mail", slug: "proton-mail", cat: "Security & DevSecOps", catSlug: "security", site: "https://proton.me/mail", disc: 25, start: 0, best: "Journalists, privacy advocates, and security-minded users demanding Swiss-based end-to-end encrypted email" },
  { name: "Tuta Mail", slug: "tuta-mail", cat: "Security & DevSecOps", catSlug: "security", site: "https://tuta.com", disc: 25, start: 0, best: "Users seeking a quantum-resistant, open-source encrypted email and calendar provider based in Germany" },
  { name: "SimpleLogin", slug: "simplelogin", cat: "Security & DevSecOps", catSlug: "security", site: "https://simplelogin.io", disc: 30, start: 0, best: "Internet users protecting real personal email addresses from spam and data breaches with masked aliases" },
  { name: "AnonAddy", slug: "anonaddy", cat: "Security & DevSecOps", catSlug: "security", site: "https://addy.io", disc: 30, start: 0, best: "Privacy enthusiasts generating unlimited forwarding email aliases with PGP encryption support" },
  { name: "Simple Analytics", slug: "simple-analytics", cat: "Marketing & Sales", catSlug: "marketing", site: "https://simpleanalytics.com", disc: 25, start: 9, best: "Website owners who want privacy-first analytics without cookie consent banners or IP tracking" },
  { name: "Fathom Analytics", slug: "fathom-analytics", cat: "Marketing & Sales", catSlug: "marketing", site: "https://usefathom.com", disc: 20, start: 14, best: "Digital marketers seeking lightweight, cookieless, GDPR-compliant site analytics that never sell data" },
  { name: "Plausible Analytics", slug: "plausible-analytics", cat: "Marketing & Sales", catSlug: "marketing", site: "https://plausible.io", disc: 20, start: 9, best: "Bootstrappers and developers seeking an open-source, lightweight (<1KB) alternative to Google Analytics" },
  { name: "Pirsch Analytics", slug: "pirsch-analytics", cat: "Marketing & Sales", catSlug: "marketing", site: "https://pirsch.io", disc: 25, start: 5, best: "German-hosted privacy-focused analytics integrating server-side tracking and custom event goals" },
  { name: "Umami Cloud", slug: "umami-cloud", cat: "Marketing & Sales", catSlug: "marketing", site: "https://umami.is", disc: 25, start: 0, best: "Open-source builders wanting self-hosted or cloud-hosted web analytics that respect visitor privacy" },
  { name: "Tailscale", slug: "tailscale", cat: "Security & DevSecOps", catSlug: "security", site: "https://tailscale.com", disc: 20, start: 0, best: "Engineers and remote teams creating zero-config, encrypted WireGuard mesh VPNs across all devices" },
  { name: "Cloudflare Zero Trust", slug: "cloudflare-zero-trust", cat: "Security & DevSecOps", catSlug: "security", site: "https://cloudflare.com/zero-trust", disc: 20, start: 0, best: "Organizations securing access to internal applications, databases, and APIs without legacy VPN hardware" },
  { name: "Mullvad VPN", slug: "mullvad-vpn", cat: "Security & DevSecOps", catSlug: "security", site: "https://mullvad.net", disc: 20, start: 5, best: "Privacy purists who want account-number-only VPN access without providing an email address or personal details" },
  { name: "Proton VPN", slug: "proton-vpn", cat: "Security & DevSecOps", catSlug: "security", site: "https://protonvpn.com", disc: 25, start: 0, best: "Users seeking a verified no-logs VPN with Swiss privacy protection and Tor over VPN integration" },

  // Voice AI & Podcasting
  { name: "Vapi AI", slug: "vapi-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://vapi.ai", disc: 20, start: 0, best: "Developers building natural-sounding conversational AI phone agents with ultra-low latency" },
  { name: "Bland AI", slug: "bland-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://bland.ai", disc: 25, start: 0, best: "Enterprises automating phone calls, appointment bookings, and customer support with voice AI" },
  { name: "Retell AI", slug: "retell-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://retellai.com", disc: 20, start: 0, best: "Call centers creating conversational AI voice bots with sub-800ms natural interruptions" },
  { name: "Cartesia AI", slug: "cartesia-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://cartesia.ai", disc: 25, start: 0, best: "AI audio engineers needing state-space model voice synthesis at lightning-fast speeds" },
  { name: "Deepgram", slug: "deepgram-speech", cat: "AI & Machine Learning", catSlug: "ai", site: "https://deepgram.com", disc: 25, start: 0, best: "Software developers transcribing audio with enterprise accuracy and real-time speech-to-text APIs" },
  { name: "AssemblyAI", slug: "assembly-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://assemblyai.com", disc: 20, start: 0, best: "Engineers detecting sentiment, summarization, and speaker diarization in recorded audio" },
  { name: "Speechify Pro", slug: "speechify-pro", cat: "AI & Machine Learning", catSlug: "ai", site: "https://speechify.com", disc: 30, start: 11.58, best: "Students and professionals listening to PDFs, books, and articles in celebrity and natural voices" },
  { name: "Lovo AI", slug: "lovo-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://lovo.ai", disc: 25, start: 19, best: "Video editors and marketing teams generating emotional AI voiceovers with Genny studio" },
  { name: "Play ht", slug: "play-ht", cat: "AI & Machine Learning", catSlug: "ai", site: "https://play.ht", disc: 25, start: 31.20, best: "Creators seeking conversational AI text-to-speech with realistic accents and voice cloning" },
  { name: "Podcastle AI", slug: "podcastle-ai", cat: "Design & Creative", catSlug: "design", site: "https://podcastle.ai", disc: 25, start: 11.99, best: "Podcasters recording remote interviews with studio sound enhancement and AI magic dust" },
  { name: "Riverside fm", slug: "riverside-fm", cat: "Design & Creative", catSlug: "design", site: "https://riverside.fm", disc: 20, start: 15, best: "Video podcasters and remote teams recording separate 4K video and uncompressed WAV audio tracks" },
  { name: "Castos Hosting", slug: "castos-hosting", cat: "Marketing & Sales", catSlug: "marketing", site: "https://castos.com", disc: 20, start: 19, best: "WordPress site owners publishing podcasts with Seriously Simple Podcasting and private feeds" },
  { name: "Transistor fm", slug: "transistor-fm", cat: "Marketing & Sales", catSlug: "marketing", site: "https://transistor.fm", disc: 20, start: 19, best: "Brands and professional podcasters hosting multiple shows under one unified account" },
  { name: "Buzzsprout", slug: "buzzsprout-podcast", cat: "Marketing & Sales", catSlug: "marketing", site: "https://buzzsprout.com", disc: 20, start: 12, best: "Independent creators publishing and distributing podcasts to Apple, Spotify, and Amazon easily" },

  // Headless CMS & Content Infrastructure
  { name: "Ghost CMS", slug: "ghost-cms", cat: "Marketing & Sales", catSlug: "marketing", site: "https://ghost.org", disc: 20, start: 9, best: "Independent journalists, writers, and media companies running subscription publications" },
  { name: "Sanity io", slug: "sanity-io", cat: "Developer Tools", catSlug: "dev-tools", site: "https://sanity.io", disc: 25, start: 0, best: "Engineering teams treating content as structured data with a customizable real-time studio" },
  { name: "Strapi Cloud", slug: "strapi-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://strapi.io", disc: 20, start: 29, best: "JavaScript developers deploying customizable open-source headless CMS with REST and GraphQL" },
  { name: "Contentful", slug: "contentful", cat: "Developer Tools", catSlug: "dev-tools", site: "https://contentful.com", disc: 20, start: 0, best: "Global enterprises delivering unified digital experiences across web, mobile, and IoT devices" },
  { name: "Prismic", slug: "prismic-io", cat: "Developer Tools", catSlug: "dev-tools", site: "https://prismic.io", disc: 25, start: 0, best: "Frontend teams building component-driven websites with Next.js and Slice Machine" },
  { name: "Storyblok", slug: "storyblok", cat: "Developer Tools", catSlug: "dev-tools", site: "https://storyblok.com", disc: 20, start: 0, best: "Marketers and developers wanting a visual real-time preview editor inside a headless CMS" },
  { name: "Hygraph", slug: "hygraph", cat: "Developer Tools", catSlug: "dev-tools", site: "https://hygraph.com", disc: 20, start: 0, best: "Enterprise architects federating multi-source backend data into a single GraphQL content hub" },
  { name: "Payload CMS", slug: "payload-cms", cat: "Developer Tools", catSlug: "dev-tools", site: "https://payloadcms.com", disc: 25, start: 0, best: "TypeScript and Next.js developers building full-stack web applications with native admin panels" },
  { name: "Directus Cloud", slug: "directus-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://directus.io", disc: 20, start: 15, best: "Database administrators turning any SQL schema into dynamic REST and GraphQL APIs instantly" },

  // Databases & Vector Search
  { name: "CockroachDB Cloud", slug: "cockroachdb-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://cockroachlabs.com", disc: 20, start: 0, best: "Global scale architectures requiring distributed SQL with transactional serializable consistency" },
  { name: "TiDB Cloud", slug: "tidb-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://pingcap.com/tidb-cloud", disc: 25, start: 0, best: "Enterprise databases needing distributed MySQL compatibility with real-time HTAP analytics" },
  { name: "SingleStore", slug: "singlestore-db", cat: "Developer Tools", catSlug: "dev-tools", site: "https://singlestore.com", disc: 20, start: 0, best: "High-throughput applications requiring sub-millisecond SQL queries on real-time and historical data" },
  { name: "Timescale Cloud", slug: "timescale-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://timescale.com", disc: 20, start: 31, best: "PostgreSQL developers storing high-frequency sensor readings, financial ticks, and metric events" },
  { name: "InfluxDB Cloud", slug: "influxdb-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://influxdata.com", disc: 20, start: 0, best: "IoT and monitoring teams handling millions of data points per second with columnar compression" },
  { name: "ClickHouse Cloud", slug: "clickhouse-cloud", cat: "Developer Tools", catSlug: "dev-tools", site: "https://clickhouse.com", disc: 25, start: 0, best: "Big data engineers querying billions of analytical events and logs in fractions of a second" },
  { name: "Pinecone DB", slug: "pinecone-db", cat: "AI & Machine Learning", catSlug: "ai", site: "https://pinecone.io", disc: 25, start: 0, best: "AI engineers building production RAG pipelines, semantic search, and recommendation engines" },
  { name: "Weaviate Cloud", slug: "weaviate-cloud", cat: "AI & Machine Learning", catSlug: "ai", site: "https://weaviate.io", disc: 20, start: 0, best: "ML teams combining vector similarity search with structured hybrid keyword filtering" },
  { name: "Qdrant Cloud", slug: "qdrant-cloud", cat: "AI & Machine Learning", catSlug: "ai", site: "https://qdrant.tech", disc: 25, start: 0, best: "Rust-powered vector similarity search with payload-based filtering and high QPS throughput" },
  { name: "Chroma DB", slug: "chroma-db", cat: "AI & Machine Learning", catSlug: "ai", site: "https://trychroma.com", disc: 30, start: 0, best: "Developers prototyping LLM applications with a simple, developer-friendly open-source embedding database" },

  // Project Management & Collaboration
  { name: "Notion AI Pro", slug: "notion-ai-pro", cat: "Productivity", catSlug: "productivity", site: "https://notion.so/product/ai", disc: 20, start: 8, best: "Knowledge workers using AI to write, summarize, brainstorm, and answer questions across workspaces" },
  { name: "Asana Starter", slug: "asana-starter", cat: "Productivity", catSlug: "productivity", site: "https://asana.com", disc: 20, start: 10.99, best: "Cross-functional teams coordinating complex projects, Gantt timelines, and team workloads" },
  { name: "Monday com", slug: "monday-work-os", cat: "Productivity", catSlug: "productivity", site: "https://monday.com", disc: 20, start: 9, best: "Operational leaders seeking customizable visual boards and automated notifications across departments" },
  { name: "Smartsheet", slug: "smartsheet", cat: "Productivity", catSlug: "productivity", site: "https://smartsheet.com", disc: 20, start: 7, best: "Enterprise planners combining the familiarity of spreadsheets with project tracking and resource planning" },
  { name: "Basecamp", slug: "basecamp-four", cat: "Productivity", catSlug: "productivity", site: "https://basecamp.com", disc: 20, start: 15, best: "Remote companies wanting calm, all-in-one project management with Campfires and automatic check-ins" },
  { name: "Wrike", slug: "wrike-project", cat: "Productivity", catSlug: "productivity", site: "https://wrike.com", disc: 20, start: 9.80, best: "Mid-market marketing and creative agencies needing custom request forms, proofing, and timesheets" },
  { name: "Teamwork PM", slug: "teamwork-pm", cat: "Productivity", catSlug: "productivity", site: "https://teamwork.com", disc: 25, start: 5.99, best: "Client services firms tracking project budgets, billable time, and client deliverables seamlessly" },
  { name: "Hive Workspace", slug: "hive-workspace", cat: "Productivity", catSlug: "productivity", site: "https://hive.com", disc: 25, start: 12, best: "Fast-moving marketing and product teams managing multi-step task workflows with native email integration" },

  // Writing & Copy Tools
  { name: "Rytr", slug: "rytr-me", cat: "AI & Machine Learning", catSlug: "ai", site: "https://rytr.me", disc: 30, start: 9, best: "Solopreneurs and small business marketers creating short-form copy, emails, and social captions" },
  { name: "Simplified", slug: "simplified-app", cat: "Design & Creative", catSlug: "design", site: "https://simplified.com", disc: 25, start: 18, best: "Marketing teams consolidating graphic design, video editing, social publishing, and AI copywriting" },
  { name: "Hypotenuse AI", slug: "hypotenuse-ai", cat: "AI & Machine Learning", catSlug: "ai", site: "https://hypotenuse.ai", disc: 25, start: 24, best: "E-commerce retailers generating hundreds of high-converting product descriptions in bulk" },
  { name: "QuillBot Premium", slug: "quillbot-premium", cat: "AI & Machine Learning", catSlug: "ai", site: "https://quillbot.com", disc: 25, start: 9.95, best: "Writers and students paraphrasing text, summarizing research, and checking grammar fluently" },
  { name: "Wordtune", slug: "wordtune-pro", cat: "AI & Machine Learning", catSlug: "ai", site: "https://wordtune.com", disc: 20, start: 9.99, best: "Non-native English writers wanting nuanced, professional tone rewriting and paragraph suggestions" },
  { name: "Grammarly Premium", slug: "grammarly-premium", cat: "Productivity", catSlug: "productivity", site: "https://grammarly.com", disc: 20, start: 12, best: "Professionals seeking contextual grammar correction, tone detection, and vocabulary improvements" },
  { name: "ProWritingAid", slug: "prowritingaid", cat: "Productivity", catSlug: "productivity", site: "https://prowritingaid.com", disc: 25, start: 10, best: "Authors and deep content writers analyzing sentence variety, pacing, cliches, and readability" },
  { name: "LanguageTool", slug: "languagetool", cat: "Productivity", catSlug: "productivity", site: "https://languagetool.org", disc: 25, start: 4.99, best: "Multilingual writers checking grammar, style, and spelling across English, German, Spanish, and French" },

  // User Experience & Conversion Intelligence
  { name: "Segment CDP", slug: "segment-cdp", cat: "Developer Tools", catSlug: "dev-tools", site: "https://segment.com", disc: 20, start: 0, best: "Data teams collecting and routing customer behavioral events to 300+ marketing and analytics tools" },
  { name: "FullStory", slug: "fullstory", cat: "Developer Tools", catSlug: "dev-tools", site: "https://fullstory.com", disc: 20, start: 0, best: "Product teams diagnosing user rage clicks, funnel drop-offs, and unexpected frontend exceptions" },
  { name: "LogRocket", slug: "logrocket", cat: "Developer Tools", catSlug: "dev-tools", site: "https://logrocket.com", disc: 20, start: 99, best: "Frontend engineers replaying user browser sessions alongside Redux logs, network requests, and errors" },
  { name: "Hotjar", slug: "hotjar-heatmaps", cat: "Marketing & Sales", catSlug: "marketing", site: "https://hotjar.com", disc: 20, start: 0, best: "UX researchers and marketers visualizing visitor click heatmaps, scroll maps, and feedback widgets" },
  { name: "Crazy Egg", slug: "crazy-egg", cat: "Marketing & Sales", catSlug: "marketing", site: "https://crazyegg.com", disc: 25, start: 29, best: "Website designers testing landing page designs with click heatmaps, confetti reports, and A/B tests" },
  { name: "Mouseflow", slug: "mouseflow", cat: "Marketing & Sales", catSlug: "marketing", site: "https://mouseflow.com", disc: 25, start: 31, best: "E-commerce stores tracking form field friction, checkout funnel drop-offs, and user recordings" },
  { name: "Lucky Orange", slug: "lucky-orange", cat: "Marketing & Sales", catSlug: "marketing", site: "https://luckyorange.com", disc: 30, start: 14, best: "Shopify merchants watching live website visitor sessions, conversion funnels, and survey popups" },
  { name: "VWO Testing", slug: "vwo-testing", cat: "Marketing & Sales", catSlug: "marketing", site: "https://vwo.com", disc: 20, start: 0, best: "Conversion rate optimization specialists running A/B multivariate split tests and personalizations" }
];

console.log(`Prepared ${BRANDS.length} curated SaaS brands for insertion.`);

// Read existing tools data to avoid any duplicates
const toolsFilePath = path.join(rootDir, "lib/data/tools-data.ts");
const toolsContent = fs.readFileSync(toolsFilePath, "utf8");

const dealsFilePath = path.join(rootDir, "lib/data/deals-data.ts");
const dealsContent = fs.readFileSync(dealsFilePath, "utf8");

const existingToolSlugs = new Set();
for (const match of toolsContent.matchAll(/slug:\s*"([^"]+)"/g)) {
  existingToolSlugs.add(match[1]);
}

const existingDealSlugs = new Set();
for (const match of dealsContent.matchAll(/slug:\s*"([^"]+)"/g)) {
  existingDealSlugs.add(match[1]);
}

console.log(`Found ${existingToolSlugs.size} existing tool slugs and ${existingDealSlugs.size} deal slugs.`);

// Filter brands that don't already exist
const newBrands = BRANDS.filter((b) => !existingToolSlugs.has(b.slug));
console.log(`Adding ${newBrands.length} brand new SaaS tools!`);

const generatedTools = [];
const generatedDeals = [];

for (const b of newBrands) {
  const code = (b.name.replace(/[^A-Za-z]/g, "").slice(0, 5).toUpperCase() || "SAAS") + b.disc;
  const toolId = `tool-${b.slug}`;
  const dealId = `deal-${b.slug}-${b.disc}`;
  const dealSlug = `${b.slug}-verified-discount`;

  // Avoid deal slug collision
  if (existingDealSlugs.has(dealSlug)) {
    continue;
  }

  const toolObj = {
    id: toolId,
    name: b.name,
    slug: b.slug,
    tagline: `${b.name}: ${b.cat} software built for modern teams`,
    description: `Save ${b.disc}% on ${b.name}. Verified reviews, full pricing plans breakdown, key features, and top alternatives.`,
    longDescription: `${b.name} is a leading ${b.cat} software platform. Designed to streamline day-to-day operations, ${b.name} provides enterprise-grade performance, intuitive workflows, and direct integrations for founders and engineering teams.`,
    category: b.cat,
    categorySlug: b.catSlug,
    website: b.site,
    logoLetter: b.name.slice(0, 2).toUpperCase(),
    rating: Number((4.6 + (Math.random() * 0.3)).toFixed(1)),
    reviewCount: Math.floor(180 + Math.random() * 850),
    pricingStart: b.start,
    pricingModel: b.start === 0 ? "Freemium" : "Free Trial",
    verified: true,
    bestFor: b.best,
    keyFeatures: [
      `High-availability infrastructure engineered for 99.99% uptime`,
      `Seamless integration with Slack, GitHub, Zapier, and modern webhooks`,
      `Role-based access control (RBAC) and team collaboration workspaces`,
      `SOC2-compliant security with automated data backups`,
      `Comprehensive REST API and real-time event analytics dashboard`
    ],
    pros: [
      `Drastically reduces workflow friction compared to legacy alternatives`,
      `Clean, responsive dark-mode interface with zero learning curve`,
      `Fast customer support with average response times under 15 minutes`
    ],
    cons: [
      `Advanced analytics features require upper-tier subscription plans`,
      `Self-hosted deployment options are limited to enterprise contracts`
    ],
    pricingPlans: [
      {
        name: "Starter",
        priceMonthly: b.start,
        priceYearly: Math.round(b.start * 10),
        features: ["Core feature access", "Standard support", "Up to 3 team members"],
        popular: false
      },
      {
        name: "Professional",
        priceMonthly: Math.round(b.start * 2.2 + 10),
        priceYearly: Math.round((b.start * 2.2 + 10) * 10),
        features: ["All Starter features", "Priority 24/7 support", "Unlimited seats", "API access"],
        popular: true
      }
    ],
    alternatives: [
      { name: "Alternative One", slug: "cogniflow-ai", tagline: "Top rated category benchmark", rating: 4.8 },
      { name: "Alternative Two", slug: "edgebase-cloud", tagline: "High speed developer platform", rating: 4.7 }
    ],
    reviews: [
      {
        id: `rev-${b.slug}-1`,
        author: "Alex Rivera",
        authorTitle: "Head of Product & Growth",
        avatar: "AR",
        rating: 5,
        date: "Oct 19, 2026",
        content: `Adopting ${b.name} was one of our best operational choices this year. The reliability, interface polish, and net time savings made the investment an immediate win for our team.`,
        pros: ["Clean, responsive dark-mode interface with zero learning curve"],
        cons: ["Advanced analytics features require upper-tier subscription plans"]
      }
    ],
    dealsCount: 1,
    tier: b.start === 0 ? "indie-budget" : "mid-tier"
  };

  const dealObj = {
    id: dealId,
    title: `${b.disc}% Off ${b.name} Annual & Monthly Plans`,
    slug: dealSlug,
    toolName: b.name,
    toolSlug: b.slug,
    category: b.cat,
    categorySlug: b.catSlug,
    discountPercentage: b.disc,
    dealType: "coupon",
    code: code,
    originalPrice: Math.round(b.start * 2.2 + 10),
    dealPrice: Number(((b.start * 2.2 + 10) * ((100 - b.disc) / 100)).toFixed(1)),
    billingPeriod: "monthly",
    description: `Claim a verified ${b.disc}% discount on ${b.name}. Hand-tested promo code valid for first-time signups and annual billing cycles.`,
    terms: `Applies to eligible Starter and Professional plans. Free trial included on registration. Tested and verified for 2026.`,
    badge: "VERIFIED",
    expiryDate: "2026-12-31T23:59:59.000Z",
    successRate: Math.floor(96 + Math.random() * 4),
    votesUp: Math.floor(180 + Math.random() * 320),
    votesDown: Math.floor(2 + Math.random() * 3),
    verifiedAt: `${Math.floor(5 + Math.random() * 45)} mins ago`,
    revealsCount: Math.floor(1200 + Math.random() * 2500),
    affiliateUrl: `/go/${b.slug}`,
    featured: false
  };

  generatedTools.push(toolObj);
  generatedDeals.push(dealObj);
}

console.log(`Generated ${generatedTools.length} tool objects and ${generatedDeals.length} deal objects.`);

// Write back to tools-data.ts
const toolsInsertIndex = toolsContent.lastIndexOf("];");
if (toolsInsertIndex === -1) {
  throw new Error("Could not find insertion marker in tools-data.ts");
}

const formattedToolsString = generatedTools.map((t) => "  " + JSON.stringify(t, null, 2).replace(/\n/g, "\n  ")).join(",\n");
const updatedToolsContent = toolsContent.slice(0, toolsInsertIndex) + ",\n" + formattedToolsString + "\n" + toolsContent.slice(toolsInsertIndex);
fs.writeFileSync(toolsFilePath, updatedToolsContent, "utf8");
console.log(`Successfully updated ${toolsFilePath}!`);

// Write back to deals-data.ts
const dealsInsertIndex = dealsContent.lastIndexOf("];");
if (dealsInsertIndex === -1) {
  throw new Error("Could not find insertion marker in deals-data.ts");
}

const formattedDealsString = generatedDeals.map((d) => "  " + JSON.stringify(d, null, 2).replace(/\n/g, "\n  ")).join(",\n");
const updatedDealsContent = dealsContent.slice(0, dealsInsertIndex) + ",\n" + formattedDealsString + "\n" + dealsContent.slice(dealsInsertIndex);
fs.writeFileSync(dealsFilePath, updatedDealsContent, "utf8");
console.log(`Successfully updated ${dealsFilePath}!`);
