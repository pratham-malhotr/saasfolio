import { getToolBySlug } from "@/lib/data/tools-data";

export const POPULAR_COMPARISONS = [
  {
    slug: "coolify-vs-vercel",
    title: "Coolify vs Vercel",
    category: "Cloud Infrastructure",
    summary: "Self-hosted $5/mo VPS PaaS vs managed premium frontend cloud platform.",
    toolA: "Coolify",
    toolB: "Vercel",
  },
  {
    slug: "aider-vs-cursor-ai",
    title: "Aider vs Cursor AI",
    category: "AI & Machine Learning",
    summary: "SWE-bench leading terminal AI pair programmer vs dedicated graphical AI code editor.",
    toolA: "Aider",
    toolB: "Cursor AI",
  },
  {
    slug: "carrd-vs-framer",
    title: "Carrd vs Framer",
    category: "Design & Landing Pages",
    summary: "$19/year ultra-lightweight one-page builder vs visual interactive design engine.",
    toolA: "Carrd",
    toolB: "Framer",
  },
  {
    slug: "obsidian-vs-notion",
    title: "Obsidian vs Notion",
    category: "Productivity & Second Brain",
    summary: "Private local-first Markdown graph vault vs team cloud collaborative workspace.",
    toolA: "Obsidian",
    toolB: "Notion",
  },
  {
    slug: "pocketbase-vs-supabase",
    title: "PocketBase vs Supabase",
    category: "Developer Tooling",
    summary: "Single-binary embedded SQLite backend vs distributed PostgreSQL cloud suite.",
    toolA: "PocketBase",
    toolB: "Supabase",
  },
  {
    slug: "umami-vs-plausible",
    title: "Umami vs Plausible Analytics",
    category: "Analytics & Telemetry",
    summary: "Open-source 2KB cookieless web analytics vs privacy-first EU hosted analytics.",
    toolA: "Umami",
    toolB: "Plausible",
  },
  {
    slug: "surrealdb-vs-supabase",
    title: "SurrealDB vs Supabase",
    category: "Developer Tooling",
    summary: "Multi-model Rust database (SQL, Document, Graph, Vector) vs PostgreSQL backend-as-a-service.",
    toolA: "SurrealDB",
    toolB: "Supabase",
  },
  {
    slug: "langflow-vs-flowise",
    title: "Langflow vs Flowise",
    category: "Artificial Intelligence",
    summary: "Visual drag-and-drop multi-agent orchestrator vs open-source LangChain LLM workflow builder.",
    toolA: "Langflow",
    toolB: "Flowise",
  },
  {
    slug: "logseq-vs-obsidian",
    title: "Logseq vs Obsidian",
    category: "Productivity & Second Brain",
    summary: "Local-first outliner with PDF annotation vs folder-based Markdown knowledge vault.",
    toolA: "Logseq",
    toolB: "Obsidian",
  },
  {
    slug: "saleshandy-vs-smartlead",
    title: "Saleshandy vs Smartlead",
    category: "CRM & Sales Automation",
    summary: "Unlimited cold email accounts with sender rotation vs high-volume outbound deliverability engine.",
    toolA: "Saleshandy",
    toolB: "Smartlead.ai",
  },
  {
    slug: "vaultwarden-vs-bitwarden",
    title: "Vaultwarden vs Bitwarden",
    category: "Cybersecurity & Compliance",
    summary: "Lightweight self-hosted Rust server consuming 25MB RAM vs official enterprise Bitwarden cloud.",
    toolA: "Vaultwarden",
    toolB: "Bitwarden",
  },
  {
    slug: "moosend-vs-mailerlite",
    title: "Moosend vs MailerLite",
    category: "Growth & Marketing",
    summary: "High-volume budget email automation workflows vs creator-first clean newsletter publisher.",
    toolA: "Moosend",
    toolB: "MailerLite",
  },
];


export const COMPARISON_SLUGS = [
  "cogniflow-ai-vs-syntaxai", "edgebase-cloud-vs-deployjet",
  "pulsemail-pro-vs-viralpeak", "vaultguard-security-vs-armorid",
  "vectorcraft-vs-framegen", "metricpulse-vs-insightstream",
  ...POPULAR_COMPARISONS.map((comparison) => comparison.slug),
].filter((slug) => slug.split("-vs-").every((part) => getToolBySlug(part)));

export function comparisonCanonicalSlug(slug: string): string {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return slug;
  const reverse = `${parts[1]}-vs-${parts[0]}`;
  if (COMPARISON_SLUGS.includes(slug)) return slug;
  if (COMPARISON_SLUGS.includes(reverse)) return reverse;
  return [...parts].sort().join("-vs-");
}
