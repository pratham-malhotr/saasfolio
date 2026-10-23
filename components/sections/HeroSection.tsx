"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, ShieldCheck, Flame, Zap, CheckCircle2 } from "lucide-react";
import { ParticleCanvas } from "@/components/animations/ParticleCanvas";
import { Reveal } from "@/components/animations/Reveal";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { CommandPalette } from "@/components/modals/CommandPalette";

export function HeroSection() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#050505]">
      {/* 3D / WebGL Interactive Particle Canvas */}
      <ParticleCanvas />

      {/* Radiant Glow Behind Headline */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[400px] bg-[#C6FF3D]/12 blur-[140px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Top Announcement Pill */}
        <Reveal delay={0.1} direction="down">
          <Link href="/discounts" className="inline-flex flex-wrap justify-center items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8 hover:border-[#C6FF3D]/50 transition-colors group">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6FF3D] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C6FF3D]" />
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-300">
              Save on your SaaS subscriptions
            </span>
            <span className="text-xs font-semibold text-[#C6FF3D] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Browse brand discounts <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </Reveal>

        {/* Oversized Editorial Clamp Typography */}
        <h1 className="font-display font-black tracking-tighter uppercase text-white leading-[1.05] text-5xl sm:text-7xl md:text-8xl lg:text-[6.8rem] mb-6 text-balance">
          <span className="text-[#C6FF3D] text-glow">SaaS discounts</span> & software deals
        </h1>

        {/* Sharp Subheadline */}
        <Reveal delay={0.35} direction="up">
          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-zinc-400 font-sans leading-relaxed mb-10">
            Find SaaS discounts for beehiiv, Predis.ai, Taplio, Baremetrics and more. See source links, eligibility and check dates. Compare coupons, annual savings and trials before you subscribe.
          </p>
        </Reveal>

        {/* Prominent Search Bar with Live Command Trigger */}
        <Reveal delay={0.45} direction="up" className="w-full max-w-2xl mb-8">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search SaaS discounts and coupon codes"
            className="group relative flex items-center justify-between w-full p-2 sm:p-2.5 rounded-2xl bg-[#0D0D10]/90 border border-white/15 hover:border-[#C6FF3D]/70 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(198,255,61,0.06)] cursor-pointer"
          >
            <div className="flex items-center gap-3.5 pl-3 sm:pl-4 text-zinc-400 group-hover:text-white transition-colors">
              <Search className="w-5 h-5 text-[#C6FF3D]" />
              <span className="text-sm sm:text-base text-zinc-400 group-hover:text-zinc-200">
                Search brands, discounts and coupon codes...
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-white/5 border border-white/10 font-mono text-xs text-zinc-400">
                ⌘K
              </span>
              <div className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(198,255,61,0.4)]">
                <span>Find Deals</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </button>
        </Reveal>

        {/* Quick Discovery Tags */}
        <Reveal delay={0.55} direction="up" className="flex flex-wrap items-center justify-center gap-2 mb-10 text-xs">
          <span className="font-mono text-zinc-500 uppercase text-[11px] mr-1">Find your brand:</span>
          {[
            { name: "beehiiv discounts", href: "/discounts/beehiiv" },
            { name: "Predis.ai discounts", href: "/discounts/predis-ai" },
            { name: "Taplio discounts", href: "/discounts/taplio" },
            { name: "Baremetrics discounts", href: "/discounts/baremetrics" },
          ].map((tag) => (
            <Link
              key={tag.name}
              href={tag.href}
              className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#C6FF3D]/60 hover:text-white transition-colors text-zinc-400 font-mono text-[11px]"
            >
              {tag.name}
            </Link>
          ))}
        </Reveal>

        {/* Dual Primary CTAs */}
        <Reveal delay={0.65} direction="up" className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/discounts">
            <MagneticButton
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-bold tracking-tight text-sm px-8 py-4 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Browse SaaS Discounts</span>
            </MagneticButton>
          </Link>

          <Link href="/deals">
            <MagneticButton
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto font-medium text-sm px-8 py-4 flex items-center gap-2 text-zinc-300 hover:text-white"
            >
              <span>See All Software Offers</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </MagneticButton>
          </Link>
        </Reveal>

        {/* Trust Badges Bar */}
        <Reveal delay={0.75} direction="up" className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C6FF3D]" />
            <span>Offer Sources Included</span>
          </div>
          <span>✦</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#C6FF3D]" />
            <span>Provider Terms Apply</span>
          </div>
          <span>✦</span>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#C6FF3D]" />
            <span>Check Dates Shown</span>
          </div>
        </Reveal>
      </div>

      {/* Global Command Palette Integration */}
      <CommandPalette isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </section>
  );
}
