import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CATEGORIES } from "@/lib/catalog-categories";
import { SAVINGS_COLLECTION_LINKS } from "@/lib/data/savings-collections";
import { PrivacyPreferences } from "@/components/privacy/PrivacyPreferences";

export function Footer() {
  return (
    <footer data-nosnippet="" className="relative bg-[#000000] border-t border-white/10 pt-20 pb-12 overflow-hidden text-zinc-400">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#C6FF3D]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-5">
            <Logo size="lg" withTagline={true} />
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Spend less on the software you need. Explore sourced discounts, compare billing options, and check the terms before you subscribe.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
                <span className="text-zinc-200">Sourced offers · Clear terms</span>
              </div>
            </div>
          </div>

          {/* Column: Deals & Discover */}
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
              Discover SaaS
            </div>
            <ul className="space-y-2.5 text-sm">
              <li><Link prefetch={false} href="/discounts" className="hover:text-[#C6FF3D] transition-colors">Discounts by Brand</Link></li>
              <li><Link prefetch={false} href="/brands" className="hover:text-[#C6FF3D] transition-colors">All Brands A–Z</Link></li>
              {SAVINGS_COLLECTION_LINKS.map(link => <li key={link.href}><Link prefetch={false} href={link.href} className="hover:text-[#C6FF3D] transition-colors">{link.label}</Link></li>)}
              <li><Link prefetch={false} href="/savings-calculator" className="hover:text-[#C6FF3D] transition-colors">Annual Savings Calculator</Link></li>
              <li>
                <Link prefetch={false} href="/deals" className="hover:text-[#C6FF3D] transition-colors flex items-center justify-between">
                  <span>Hot Deals This Week</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#C6FF3D]/10 text-[#C6FF3D]">HOT</span>
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/deals?type=lifetime" className="hover:text-[#C6FF3D] transition-colors">
                  Lifetime Deals (LTDs)
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/deals?type=free_trial" className="hover:text-[#C6FF3D] transition-colors">
                  Free Trials
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/tools" className="hover:text-[#C6FF3D] transition-colors">
                  Software Directory
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/submit" className="hover:text-[#C6FF3D] transition-colors text-white font-medium">
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
                <Link prefetch={false} href="/articles" className="hover:text-[#C6FF3D] transition-colors">
                  Software Buying Guides
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/articles/build-a-saas-budget-before-buying" className="hover:text-[#C6FF3D] transition-colors">
                  Build a Software Budget
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/community" className="hover:text-[#C6FF3D] transition-colors flex items-center gap-1.5">
                  <span>Community Q&A</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">NEW</span>
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/about#standards" className="hover:text-[#C6FF3D] transition-colors">
                  How We Check Offers
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/compare" className="hover:text-[#C6FF3D] transition-colors">
                  Compare Tools Side-by-Side
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/advertise" className="hover:text-[#C6FF3D] transition-colors">
                  Partner / Advertise
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/contact" className="hover:text-[#C6FF3D] transition-colors">
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
                  prefetch={false}
                  key={cat.id}
                  href={`/deals/category/${cat.slug}`}
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
          SaaSFolio operates independently. Some provider links contain referral or affiliate tracking. If you purchase through them, we may earn a commission at no additional cost to you. A referral alone does not guarantee a discount. Review each offer’s source and terms before paying.
        </div>

        {/* Bottom Bar: Wordmark & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-6">
            <span>© 2026 SaaSFolio (saasfolio.tech). All rights reserved.</span>
            <Link prefetch={false} href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link prefetch={false} href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <PrivacyPreferences />
            <Link prefetch={false} href="/affiliate-disclosure" className="hover:text-zinc-300 transition-colors">
              Affiliate Disclosure
            </Link>
            <Link prefetch={false} href="/contact" className="hover:text-zinc-300 transition-colors">
              Contact Desk
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-zinc-400">WHERE SAAS DEALS WIN ✦</span>
            <Link prefetch={false} href="/contact" className="hover:text-[#C6FF3D] underline">Contact SaaSFolio</Link>
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
