"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import type { DetailedTool } from "@/lib/types";

type Comparison = { slug: string; title: string; category: string; summary: string; toolA: string; toolB: string };

export default function CompareHubPage({ tools, comparisons, feature }: { tools: Pick<DetailedTool, "id" | "slug" | "name" | "category">[]; comparisons: Comparison[]; feature?: React.ReactNode }) {
  const router = useRouter();
  const [toolASlug, setToolASlug] = useState(tools[0]?.slug || "");
  const [toolBSlug, setToolBSlug] = useState(tools[1]?.slug || "");
  const [error, setError] = useState("");

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (toolASlug === toolBSlug) {
      setError("Please select two different tools to compare.");
      return;
    }
    router.push(`/compare/${toolASlug}-vs-${toolBSlug}`);
  };

  return (
    <div className={`min-h-screen pb-24 pt-28 text-white ${feature ? "bg-[#090c10] bg-[radial-gradient(ellipse_at_76%_12%,#273345,transparent_60%)]" : "bg-[#050505]"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-[#C6FF3D] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Compare</span>
        </div>

        <div className={feature ? "mb-12 grid items-center gap-6 md:grid-cols-[1.08fr_.92fr] lg:mb-16 lg:gap-10" : "mb-16 max-w-4xl"}>
          <div>
            <h1 className="mb-5 font-display text-[clamp(2.3rem,4.55vw,4.8rem)] font-semibold leading-[.99] tracking-[-0.055em]">
              Compare SaaS tools<br /><span className="text-[#C6FF3D]">side by side.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Compare software features, pricing models and workflow limits for two SaaS tools. Check who owns the data, how teammates collaborate and what changes at renewal.
            </p>
            {feature && <a href="#pick-tools" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#C6FF3D] px-4 text-sm font-semibold text-black hover:bg-[#d8ff80]">Start a comparison</a>}
          </div>
          {feature}
        </div>

        {/* Interactive Dual-Tool Generator */}
        <div id="pick-tools" data-motion="" className="scroll-mt-28 p-8 sm:p-12 rounded-3xl bg-[#09090C] border border-[#C6FF3D]/40 mb-20 shadow-[0_0_35px_rgba(198,255,61,0.08)]">
          <div className="max-w-3xl mb-8">
            <span className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest font-bold">
              INTERACTIVE SELECTOR
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mt-1">
              PICK TWO TOOLS TO COMPARE
            </h2>
          </div>

          <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="compare-tool-a" className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                First Software Tool (A)
              </label>
              <select
                id="compare-tool-a"
                aria-describedby={error ? "comparison-error" : undefined}
                aria-invalid={Boolean(error)}
                value={toolASlug}
                onChange={(e) => { setToolASlug(e.target.value); setError(""); }}
                className="w-full px-4 py-3.5 rounded-xl bg-[#050505] border border-white/15 text-white focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
              >
                {tools.map((t) => (
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
              <label htmlFor="compare-tool-b" className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                Second Software Tool (B)
              </label>
              <select
                id="compare-tool-b"
                aria-describedby={error ? "comparison-error" : undefined}
                aria-invalid={Boolean(error)}
                value={toolBSlug}
                onChange={(e) => { setToolBSlug(e.target.value); setError(""); }}
                className="w-full px-4 py-3.5 rounded-xl bg-[#050505] border border-white/15 text-white focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
              >
                {tools.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5 pt-4">
              {error && <p id="comparison-error" role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}
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
                Software comparisons by workflow
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisons.map((comp, index) => (
              <Link
                key={comp.slug}
                data-motion={index % 3}
                href={`/compare/${comp.slug}`}
                prefetch={false}
                className="motion-card group p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/50 hover:bg-[#0E0E12] transition-all flex flex-col justify-between"
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
