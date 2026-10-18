"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Heart, Shield, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CATEGORIES } from "@/lib/mock-data";

export function Footer() {
  return (
    <footer className="relative bg-[#000000] border-t border-white/10 pt-20 pb-12 overflow-hidden text-zinc-400">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#C6FF3D]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-5">
            <Logo size="lg" withTagline={true} />
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              SaaSFolio is the premier discovery network for modern software. We curate verified discounts, lifetime licenses, hands-on architectural reviews and transparent community feedback for engineers, marketers and founders.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
                <span className="text-zinc-200">1,240+ Verified Deals Live</span>
              </div>
            </div>
          </div>

          {/* Column: Deals & Discover */}
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
              Discover SaaS
            </div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/deals" className="hover:text-[#C6FF3D] transition-colors flex items-center justify-between">
                  <span>Hot Deals This Week</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#C6FF3D]/10 text-[#C6FF3D]">HOT</span>
                </Link>
              </li>
              <li>
                <Link href="/deals?type=lifetime" className="hover:text-[#C6FF3D] transition-colors">
                  Lifetime Deals (LTDs)
                </Link>
              </li>
              <li>
                <Link href="/deals?type=free_trial" className="hover:text-[#C6FF3D] transition-colors">
                  Extended Free Trials
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-[#C6FF3D] transition-colors">
                  Software Directory
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-[#C6FF3D] transition-colors text-white font-medium">
                  Submit a SaaS Deal →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Editorial & Guides */}
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
              Knowledge & Community
            </div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/articles" className="hover:text-[#C6FF3D] transition-colors">
                  In-Depth Reviews
                </Link>
              </li>
              <li>
                <Link href="/articles/ultimate-saas-stack-bootstrapped-founders-2026" className="hover:text-[#C6FF3D] transition-colors">
                  Founder Tech Stacks
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-[#C6FF3D] transition-colors flex items-center gap-1.5">
                  <span>Community Q&A</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">NEW</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#C6FF3D] transition-colors">
                  About & Testing Methodology
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-[#C6FF3D] transition-colors">
                  Compare Tools Side-by-Side
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-[#C6FF3D] transition-colors">
                  Partner / Advertise
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C6FF3D] transition-colors">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Popular Categories */}
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
              Top Categories
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/deals?category=${cat.slug}`}
                  className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 hover:border-[#C6FF3D]/50 hover:text-white transition-all font-mono text-[11px]"
                >
                  {cat.shortCode}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Affiliate Disclosure Notice */}
        <div className="my-8 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-500 leading-relaxed">
          <span className="font-bold text-zinc-400 uppercase font-mono mr-2">Affiliate & Editorial Disclosure:</span>
          SaaSFolio is an independently operated discovery engine. Some links on our platform contain referral or affiliate tracking codes. If you purchase through our links, we may receive a commission at no additional cost to you—often securing exclusive lower prices than standard retail rates. All ratings, benchmarks, and editorial comparisons remain completely impartial.
        </div>

        {/* Bottom Bar: Wordmark & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-6">
            <span>© 2026 SaaSFolio (saasfolio.tech). All rights reserved.</span>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/affiliate-disclosure" className="hover:text-zinc-300 transition-colors">
              Affiliate Disclosure
            </Link>
            <Link href="/contact" className="hover:text-zinc-300 transition-colors">
              Contact Desk
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-zinc-400">WHERE SAAS DEALS WIN ✦</span>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors text-zinc-400"
                aria-label="X / Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors text-zinc-400"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors text-zinc-400"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Giant Editorial Wordmark across the base */}
        <div className="mt-16 pt-8 border-t border-white/5 select-none pointer-events-none">
          <div className="text-[14vw] font-display font-black tracking-tighter leading-none text-white/[0.03] text-center uppercase whitespace-nowrap">
            SAASFOLIO
          </div>
        </div>
      </div>
    </footer>
  );
}
