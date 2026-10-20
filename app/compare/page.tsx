"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Scale, 
  Check, 
  Zap, 
  ArrowLeftRight,
  ShieldCheck,
  TrendingUp,
  Star
} from "lucide-react";
import { TOOLS_DATA } from "@/lib/data/tools-data";

const POPULAR_COMPARISONS = [
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

export default function CompareHubPage() {
  const router = useRouter();
  const [toolASlug, setToolASlug] = useState(TOOLS_DATA[0]?.slug || "cogniflow-ai");
  const [toolBSlug, setToolBSlug] = useState(TOOLS_DATA[1]?.slug || "syntaxai");

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (toolASlug === toolBSlug) {
      alert("Please select two distinct tools to compare.");
      return;
    }
    router.push(`/compare/${toolASlug}-vs-${toolBSlug}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-[#C6FF3D] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Software Comparison Engine</span>
        </div>

        {/* Header */}
        <div className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-6 font-mono text-xs text-[#C6FF3D]">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>HEAD-TO-HEAD BENCHMARKS</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter uppercase leading-[0.95] mb-6">
            COMPARE SAAS TOOLS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#C6FF3D]">
              SIDE BY SIDE.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 font-sans leading-relaxed">
            Unbiased architectural breakdowns, pricing differentials, feature checklists, and active discount codes between top SaaS competitors.
          </p>
        </div>

        {/* Interactive Dual-Tool Generator */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#09090C] border border-[#C6FF3D]/40 mb-20 shadow-[0_0_35px_rgba(198,255,61,0.08)]">
          <div className="max-w-3xl mb-8">
            <span className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest font-bold">
              INTERACTIVE SELECTOR
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mt-1">
              PICK ANY TWO TOOLS TO BENCHMARK
            </h2>
          </div>

          <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                First Software Tool (A)
              </label>
              <select
                value={toolASlug}
                onChange={(e) => setToolASlug(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#050505] border border-white/15 text-white focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
              >
                {TOOLS_DATA.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center py-2 md:py-0">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#C6FF3D]">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                Second Software Tool (B)
              </label>
              <select
                value={toolBSlug}
                onChange={(e) => setToolBSlug(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#050505] border border-white/15 text-white focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
              >
                {TOOLS_DATA.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5 pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C6FF3D] text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,61,0.25)]"
              >
                <span>Launch Head-to-Head Comparison</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Featured Popular Comparisons */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest font-bold">
                POPULAR MATCH-UPS
              </span>
              <h2 className="font-display font-black text-3xl uppercase tracking-tight text-white mt-1">
                TRENDING HEAD-TO-HEAD GUIDES
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POPULAR_COMPARISONS.map((comp) => (
              <Link
                key={comp.slug}
                href={`/compare/${comp.slug}`}
                className="group p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/50 hover:bg-[#0E0E12] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 group-hover:text-[#C6FF3D] transition-colors">
                      {comp.category}
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#C6FF3D] group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-[#C6FF3D] transition-colors mb-2">
                    {comp.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-6">
                    {comp.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>{comp.toolA}</span>
                  <span className="text-zinc-600">vs</span>
                  <span>{comp.toolB}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
