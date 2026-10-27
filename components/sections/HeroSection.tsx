"use client";

import React from "react";
import Link from "next/link";
import { Search, ArrowRight, ArrowDown, ShieldCheck, Zap } from "lucide-react";
import { ParticleCanvas } from "@/components/animations/ParticleCanvas";
import { MagneticButton } from "@/components/animations/MagneticButton";

export function HeroSection() {

  return (
    <section data-home-hero="" className="relative min-h-[85svh] flex flex-col justify-center items-center pt-36 pb-14 sm:pt-40 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#050505]">
      {/* 3D / WebGL Interactive Particle Canvas */}
      <ParticleCanvas />

      {/* Radiant Glow Behind Headline */}
      <div aria-hidden="true" className="hero-halo absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[720px] h-[280px] sm:h-[420px] bg-[radial-gradient(ellipse,rgba(198,255,61,0.1),transparent_70%)] sm:bg-[#C6FF3D]/10 sm:blur-[110px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Top Announcement Pill */}
        <div className="hero-intro-item">
          <Link href="/discounts" className="inline-flex justify-center items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-7 hover:border-[#C6FF3D]/50 transition-colors group">
            <span className="flex h-2 w-2 relative">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C6FF3D]" />
            </span>
            <span className="whitespace-nowrap font-mono text-[11px] leading-4 sm:text-xs uppercase tracking-wider text-zinc-300">
              Good software. Better prices.
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-[#C6FF3D] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Oversized Editorial Clamp Typography */}
        <h1 className="hero-headline font-display font-bold tracking-[-0.065em] text-white leading-[1.08] mb-6 text-[clamp(2.65rem,7.8vw,6.5rem)]">
          <span className="sr-only">SaaS discounts & software deals</span>
          <span aria-hidden="true" className="block">
            <span className="hero-word-window"><span className="hero-word text-[#C6FF3D]" style={{ "--word-delay": "70ms" } as React.CSSProperties}>SaaS</span></span>{" "}
            <span className="hero-word-window"><span className="hero-word hero-discount-text text-[#C6FF3D]" style={{ "--word-delay": "160ms" } as React.CSSProperties}>discounts</span></span>
          </span>
          <span aria-hidden="true" className="block">
            <span className="hero-word-window"><span className="hero-word text-zinc-500" style={{ "--word-delay": "260ms" } as React.CSSProperties}>&</span></span>{" "}
            <span className="hero-word-window"><span className="hero-word" style={{ "--word-delay": "350ms" } as React.CSSProperties}>software</span></span>{" "}
            <span className="hero-word-window"><span className="hero-word" style={{ "--word-delay": "440ms" } as React.CSSProperties}>deals.</span></span>
          </span>
        </h1>

        {/* Sharp Subheadline */}
        <div className="hero-intro-item">
          <p className="max-w-lg text-base sm:text-lg text-zinc-400 font-sans leading-relaxed mb-8">
            Find your next tool for less. Compare coupons, annual savings and trials, with clear terms before you click.
          </p>
        </div>

        {/* Prominent Search Bar with Live Command Trigger */}
        <div className="hero-intro-item w-full max-w-xl mb-5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("saasfolio_search_open"))}
            aria-label="Search SaaS discounts and coupon codes"
            className="group relative flex items-center justify-between w-full p-2 sm:p-2.5 rounded-2xl bg-[#0D0D10]/90 border border-white/15 hover:border-[#C6FF3D]/70 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(198,255,61,0.06)] cursor-pointer"
          >
            <div className="flex items-center gap-3.5 pl-3 sm:pl-4 text-zinc-400 group-hover:text-white transition-colors">
              <Search className="w-5 h-5 text-[#C6FF3D]" />
              <span className="text-sm sm:text-base text-zinc-400 group-hover:text-zinc-200">
                Search your next tool…
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-white/5 border border-white/10 font-mono text-xs text-zinc-400">
                ⌘K
              </span>
              <div className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(198,255,61,0.4)]">
                <span className="hidden sm:inline">Find deals</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </button>
        </div>

        {/* Quick Discovery Tags */}
        <div className="hero-intro-item flex flex-wrap items-center justify-center gap-2 mb-8 text-xs">
          <span className="text-zinc-500 text-xs mr-1">Explore:</span>
          {[
            { name: "AI tools", href: "/deals/category/ai-tools" },
            { name: "Marketing", href: "/deals/category/marketing" },
            { name: "Design", href: "/deals/category/design" },
            { name: "All brands", href: "/brands" },
          ].map((tag) => (
            <Link
              key={tag.name}
              href={tag.href}
              prefetch={false}
              className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#C6FF3D]/60 hover:text-white transition-colors text-zinc-400 font-mono text-[11px]"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        {/* Dual Primary CTAs */}
        <div className="hero-intro-item flex flex-col sm:flex-row items-center gap-4">
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
        </div>

        {/* Trust Badges Bar */}
        <div className="hero-intro-item mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C6FF3D]" />
            <span>Sources included</span>
          </div>
          <Link href="#brand-discounts-heading" className="flex items-center gap-1.5 hover:text-zinc-200">Find your brand <ArrowDown className="h-3.5 w-3.5" /></Link>
        </div>
      </div>

    </section>
  );
}
