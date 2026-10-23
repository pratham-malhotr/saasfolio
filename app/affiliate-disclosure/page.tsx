import { pageMetadata } from "@/lib/seo";
import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = pageMetadata({
  title: 'Affiliate Disclosure',
  description: 'Learn how SaaSFolio affiliate links and partnerships work when you explore SaaS discounts, software deals, reviews and comparisons.',
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> BACK TO DISCOVERY HOME
      </Link>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-[#C6FF3D]" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
          TRANSPARENCY & INTEGRITY STANDARDS
        </span>
      </div>
      <h1 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-5xl text-white mb-6">
        AFFILIATE & EDITORIAL DISCLOSURE
      </h1>

      <div className="space-y-6 text-zinc-300 text-sm leading-relaxed p-8 rounded-2xl bg-[#09090C] border border-white/10">
        <p>
          At SaaSFolio (<strong>saasfolio.tech</strong>), our founding mission is to help software engineers, founders, and growth marketers discover genuinely valuable tools while trimming unnecessary subscription expenses.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">How We Fund Our Platform</h2>
        <p>
          Some of the outbound links pointing to SaaS products and checkout pages are affiliate links. This means that if you click through and purchase a plan or lifetime license, SaaSFolio may earn a referral commission from the vendor.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">What This Means For You</h2>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li><strong>Check the payable total:</strong> A referral link alone does not apply a discount. Compare the same plan, eligibility, access fees and renewal price with the provider’s direct pricing.</li>
          <li><strong>Editorial and sponsored material:</strong> Commercial relationships are disclosed. Buying guides explain sources and limitations; they do not establish hands-on testing, independent benchmarks or customer ratings.</li>
          <li><strong>Source checks and corrections:</strong> Published expirations and observation-age limits are applied to listings. Feedback can be submitted for review, but immediate detection or removal is not guaranteed. Current codes have not been checkout tested.</li>
        </ul>

        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>LAST UPDATED: OCTOBER 2026</span>
          <span className="text-[#C6FF3D]">SOURCES & CLEAR TERMS</span>
        </div>
      </div>
    </div>
  );
}
