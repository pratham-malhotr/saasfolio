"use client";

import React, { useState } from "react";
import Link from "next/link";
import { offerLabel } from "@/lib/offer-links";
import { useRouter } from "next/navigation";
import { 
  GitCompare, 
  Star, 
  Check, 
  X, 
  ExternalLink, 
} from "lucide-react";
import { DetailedTool, SaaSDeal } from "@/lib/types";

interface ComparisonViewProps {
  toolA: DetailedTool;
  toolB: DetailedTool;
  dealsA: SaaSDeal[];
  dealsB: SaaSDeal[];
  allTools: DetailedTool[];
  discountGuides?: React.ReactNode;
}

export function ComparisonView({
  toolA,
  toolB,
  dealsA,
  dealsB,
  allTools,
  discountGuides,
}: ComparisonViewProps) {
  const router = useRouter();
  const [selectedSlugA, setSelectedSlugA] = useState(toolA.slug);
  const [selectedSlugB, setSelectedSlugB] = useState(toolB.slug);

  const handleSwitchComparison = () => {
    if (selectedSlugA && selectedSlugB && selectedSlugA !== selectedSlugB) {
      router.push(`/compare/${selectedSlugA}-vs-${selectedSlugB}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-8">
        <Link href="/" className="hover:text-white transition-colors">HOME</Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-white transition-colors">DIRECTORY</Link>
        <span>/</span>
        <span className="text-zinc-300">HEAD-TO-HEAD</span>
        <span>/</span>
        <span className="text-[#C6FF3D]">{toolA.name} VS {toolB.name}</span>
      </div>

      {/* Page Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 mb-4">
          <GitCompare className="w-3.5 h-3.5 text-[#C6FF3D]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
            SOFTWARE COMPARISON
          </span>
        </div>
        <h1 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-6xl text-white mb-4">
          {toolA.name} <span className="text-[#C6FF3D]">VS</span> {toolB.name}
        </h1>
        <p className="text-zinc-400 max-w-3xl text-sm sm:text-base leading-relaxed">
          Compare catalog features and sourced offers for {toolA.name} and {toolB.name}. This is not a hands-on benchmark; confirm current features, prices and eligibility with each provider.
        </p>
      </div>

      {discountGuides}

      {/* Interactive Tool Selector Bar */}
      <div className="p-4 rounded-2xl bg-[#09090C] border border-white/10 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="w-full sm:w-64 font-mono text-xs">
            <label className="text-zinc-500 block mb-1 text-[10px] uppercase">TOOL A</label>
            <select
              value={selectedSlugA}
              onChange={(e) => setSelectedSlugA(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white outline-none cursor-pointer"
            >
              {allTools.map((t) => (
                <option key={t.id} value={t.slug} className="bg-[#0A0A0C]">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <span className="font-mono text-xs text-[#C6FF3D] font-bold px-2">VS</span>

          <div className="w-full sm:w-64 font-mono text-xs">
            <label className="text-zinc-500 block mb-1 text-[10px] uppercase">TOOL B</label>
            <select
              value={selectedSlugB}
              onChange={(e) => setSelectedSlugB(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white outline-none cursor-pointer"
            >
              {allTools.map((t) => (
                <option key={t.id} value={t.slug} className="bg-[#0A0A0C]">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSwitchComparison}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#D6FF66] transition-all"
        >
          Compare Now →
        </button>
      </div>

      {/* Side-by-Side Dual Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Tool A Card */}
        <div className="p-8 rounded-3xl bg-[#09090C] border border-white/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-black border border-white/20 flex items-center justify-center font-display font-black text-xl text-[#C6FF3D]">
                {toolA.logoLetter}
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-[#C6FF3D] font-bold">
                <Star className="w-4 h-4 fill-[#C6FF3D]" />
                <span>{toolA.reviewCount ? `${toolA.rating} / 5.0` : "Unrated"}</span>
              </div>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white mb-2">
              {toolA.name}
            </h2>
            <p className="text-xs text-zinc-400 mb-4">{toolA.tagline}</p>
            <div className="flex items-baseline gap-1 font-mono mb-6">
              <span className="text-3xl font-black text-[#C6FF3D]">{toolA.pricingVerified ? `$${toolA.pricingStart}` : "See provider"}</span>
              <span className="text-xs text-zinc-500">{toolA.pricingVerified && toolB.pricingVerified ? "/mo starting" : ""}</span>
            </div>
          </div>
          {toolA.providerStatus === "unavailable" ? <p role="status" className="text-sm text-amber-200">Provider link unavailable; no current offer.</p> : <a
            href={`/go/${toolA.slug}`}
            rel="sponsored nofollow noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Visit {toolA.name}</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>}
        </div>

        {/* Tool B Card */}
        <div className="p-8 rounded-3xl bg-[#09090C] border border-white/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-black border border-white/20 flex items-center justify-center font-display font-black text-xl text-[#C6FF3D]">
                {toolB.logoLetter}
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-[#C6FF3D] font-bold">
                <Star className="w-4 h-4 fill-[#C6FF3D]" />
                <span>{toolB.reviewCount ? `${toolB.rating} / 5.0` : "Unrated"}</span>
              </div>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white mb-2">
              {toolB.name}
            </h2>
            <p className="text-xs text-zinc-400 mb-4">{toolB.tagline}</p>
            <div className="flex items-baseline gap-1 font-mono mb-6">
              <span className="text-3xl font-black text-[#C6FF3D]">{toolB.pricingVerified ? `$${toolB.pricingStart}` : "See provider"}</span>
              <span className="text-xs text-zinc-500">{toolA.pricingVerified && toolB.pricingVerified ? "/mo starting" : ""}</span>
            </div>
          </div>
          {toolB.providerStatus === "unavailable" ? <p role="status" className="text-sm text-amber-200">Provider link unavailable; no current offer.</p> : <a
            href={`/go/${toolB.slug}`}
            rel="sponsored nofollow noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Visit {toolB.name}</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>}
        </div>
      </div>

      {/* Side-by-Side Detailed Spec Matrix Table */}
      <div className="rounded-3xl bg-[#09090C] border border-white/15 overflow-hidden mb-16 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="p-6 border-b border-white/10 bg-[#0C0C0F] font-display font-bold text-xl text-white uppercase">
          Detailed Specification & Feature Matrix
        </div>

        <div className="divide-y divide-white/5 text-sm">
          {/* Row: Best Suited For */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4">
            <div className="md:col-span-4 font-mono text-xs uppercase text-zinc-400 font-bold">
              BEST SUITED FOR
            </div>
            <div className="md:col-span-4 text-xs text-zinc-200">
              <strong className="text-[#C6FF3D] block font-mono mb-1">{toolA.name}:</strong>
              {toolA.bestFor}
            </div>
            <div className="md:col-span-4 text-xs text-zinc-200">
              <strong className="text-[#C6FF3D] block font-mono mb-1">{toolB.name}:</strong>
              {toolB.bestFor}
            </div>
          </div>

          {/* Row: Pricing Model */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4">
            <div className="md:col-span-4 font-mono text-xs uppercase text-zinc-400 font-bold">
              PRICING MODEL
            </div>
            <div className="md:col-span-4 font-mono text-xs text-white">
              {toolA.pricingModel} · {toolA.pricingVerified ? `Starts at $${toolA.pricingStart}/mo` : "See official pricing"}
            </div>
            <div className="md:col-span-4 font-mono text-xs text-white">
              {toolB.pricingModel} · {toolB.pricingVerified ? `Starts at $${toolB.pricingStart}/mo` : "See official pricing"}
            </div>
          </div>

          {/* Row: Active Deals */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4">
            <div className="md:col-span-4 font-mono text-xs uppercase text-zinc-400 font-bold">
              ACTIVE DISCOUNT OFFERS
            </div>
            <div className="md:col-span-4 text-xs">
              {dealsA.length > 0 ? (
                <span className="font-mono text-xs text-[#C6FF3D] font-bold">
                  {offerLabel(dealsA[0])}
                </span>
              ) : (
                <span className="font-mono text-xs text-zinc-500">Standard Pricing</span>
              )}
            </div>
            <div className="md:col-span-4 text-xs">
              {dealsB.length > 0 ? (
                <span className="font-mono text-xs text-[#C6FF3D] font-bold">
                  {offerLabel(dealsB[0])}
                </span>
              ) : (
                <span className="font-mono text-xs text-zinc-500">Standard Pricing</span>
              )}
            </div>
          </div>

          {/* Row: Key Advantages (Pros) */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4">
            <div className="md:col-span-4 font-mono text-xs uppercase text-zinc-400 font-bold">
              STANDOUT ADVANTAGES
            </div>
            <div className="md:col-span-4 space-y-1.5 text-xs text-zinc-300">
              {toolA.pros.map((pro, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </div>
              ))}
            </div>
            <div className="md:col-span-4 space-y-1.5 text-xs text-zinc-300">
              {toolB.pros.map((pro, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row: Known Limitations (Cons) */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-6 gap-4">
            <div className="md:col-span-4 font-mono text-xs uppercase text-zinc-400 font-bold">
              KNOWN SHORTCOMINGS
            </div>
            <div className="md:col-span-4 space-y-1.5 text-xs text-zinc-400">
              {toolA.cons.map((con, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{con}</span>
                </div>
              ))}
            </div>
            <div className="md:col-span-4 space-y-1.5 text-xs text-zinc-400">
              {toolB.cons.map((con, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{con}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
