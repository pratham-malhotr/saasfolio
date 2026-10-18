"use client";

import React from "react";
import { Search, GitCompare, Sparkles, Check, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "DISCOVER",
      tagline: "Uncover hidden deals",
      description:
        "Search through 1,200+ hand-verified coupon codes, lifetime deals, and extended free trials across 12 distinct software verticals.",
      icon: Search,
      highlight: "100% Crawled & Tested Hourly",
    },
    {
      step: "02",
      title: "COMPARE",
      tagline: "Unbiased technical vetting",
      description:
        "Review real-world latency benchmarks, developer telemetry, transparent pros/cons, and crowdsourced community sentiment before subscribing.",
      icon: GitCompare,
      highlight: "Zero Paid Placement Bias",
    },
    {
      step: "03",
      title: "SAVE & SCALE",
      tagline: "Instant checkout discounts",
      description:
        "Reveal validated promo codes with one click, copy instantly, and reduce your annual software stack overhead by up to 80%.",
      icon: Sparkles,
      highlight: "Over $2.4M Saved So Far",
    },
  ];

  return (
    <section className="py-24 bg-[#050505] border-b border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
              THE WORKFLOW // THREE SIMPLE STEPS
            </span>
          </div>
          <h2 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
            HOW SAASFOLIO WORKS
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            From initial research to verified discount redemption, we remove the friction and expense of discovering modern software.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line on Desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-y-8 pointer-events-none" />

          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.step} delay={idx * 0.15} direction="up">
                <div className="relative flex flex-col justify-between h-full p-8 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/50 hover:bg-[#0D0D10] transition-all duration-300 group">
                  <div>
                    {/* Top Step Number & Icon */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-black border border-white/15 flex items-center justify-center text-[#C6FF3D] group-hover:border-[#C6FF3D]/60 group-hover:shadow-[0_0_20px_rgba(198,255,61,0.2)] transition-all">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="font-display font-black text-4xl text-white/20 group-hover:text-[#C6FF3D] transition-colors">
                        {item.step}
                      </span>
                    </div>

                    {/* Step Title & Tagline */}
                    <div className="font-mono text-xs text-[#C6FF3D] uppercase tracking-wider mb-1">
                      {item.tagline}
                    </div>
                    <h3 className="font-display font-black text-2xl text-white mb-3">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlight pill */}
                  <div className="pt-4 border-t border-white/5 flex items-center gap-2 font-mono text-[11px] text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-[#C6FF3D]" />
                    <span>{item.highlight}</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
