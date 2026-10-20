import { pageMetadata } from "@/lib/seo";
import React from "react";
import Link from "next/link";
import { Scale, FileText, CheckCircle2, Mail } from "lucide-react";

export const metadata = pageMetadata({
  title: 'Terms of Service',
  description: 'Read the SaaSFolio terms of service for software deal listings, third-party offers, reviews, account access and community participation.',
  path: "/terms",
});

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-[#C6FF3D] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Terms of Service</span>
        </div>

        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-4 font-mono text-xs text-[#C6FF3D]">
            <Scale className="w-3.5 h-3.5" />
            <span>TERMS & USER AGREEMENT</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tighter text-white mb-3">
            SAASFOLIO TERMS OF SERVICE
          </h1>
          <p className="font-mono text-xs text-zinc-500">
            LAST MODIFIED: OCTOBER 18, 2026 // VERSION 3.1
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 font-sans text-sm text-zinc-300 leading-relaxed">
          
          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">01.</span>
              <span>Acceptance of Agreement</span>
            </h2>
            <p>
              By accessing, browsing, or utilizing any services provided by SaaSFolio via{" "}
              <strong className="text-white">saasfolio.tech</strong> (including our Deals Directory, Software Catalogues, Editorial Reviews, and Community Forums), you agree to be bound by these Terms of Service. If you do not agree to all provisions contained herein, you must immediately discontinue use of the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">02.</span>
              <span>Discounts, Coupons & Merchant Disclaimers</span>
            </h2>
            <p className="mb-3">
              While our editorial staff manually verifies coupon codes and discount links prior to publication:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                SaaS vendors retain sole and absolute discretion over their pricing, billing tiers, discount validity periods, and eligible geographic regions.
              </li>
              <li>
                SaaSFolio does not guarantee that a merchant will honor an expired or revoked coupon code, nor are we responsible for pricing alterations enacted by third-party software providers.
              </li>
              <li>
                Software purchases are transacted directly on the merchant&apos;s checkout gateway; SaaSFolio is not a payment processor or direct vendor of third-party software.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">03.</span>
              <span>Affiliate & Compensation Disclosure</span>
            </h2>
            <p>
              In full compliance with Federal Trade Commission (FTC) guidelines, SaaSFolio discloses that certain outbound links (accessible via <code className="text-zinc-300">/go/[id]</code>) are affiliate tracking links. When you purchase software through these links, SaaSFolio may earn a referral commission at zero additional cost to you. We frequently negotiate exclusive lower prices for our readers that are unavailable on open retail channels.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">04.</span>
              <span>Community Conduct & Prohibited Uses</span>
            </h2>
            <p className="mb-3">
              When participating in the SaaSFolio Community, you agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Post automated, repetitive, or deceptive spam, affiliate referral codes, or deceptive reviews.</li>
              <li>Attempt to scrape, reverse engineer, or deploy automated bots to overwhelm our search or coupon endpoints.</li>
              <li>Harass, defame, or intimidate other community contributors, founders, or software maintainers.</li>
              <li>Misrepresent your identity or claim unauthorized affiliation with a vendor or software tool.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">05.</span>
              <span>Intellectual Property & Trademarks</span>
            </h2>
            <p>
              All software logos, trademarks, and brand names featured in our directory belong to their respective corporate owners. Their display on SaaSFolio constitutes nominative fair use for identification, comparative review, and discount aggregation purposes. All original editorial content, benchmarks, motion designs, and platform source code are the proprietary intellectual property of SaaSFolio.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">06.</span>
              <span>Limitation of Liability</span>
            </h2>
            <p>
              SaaSFolio is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. Under no circumstances shall SaaSFolio, its founders, or contributors be held liable for any indirect, incidental, or consequential damages resulting from third-party software purchases, migration downtime, or billing disputes.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">07.</span>
              <span>Legal Inquiries</span>
            </h2>
            <p className="mb-4">
              For legal notifications, copyright inquiries, or trademark requests, contact our legal counsel:
            </p>
            <div className="p-4 rounded-xl bg-[#09090C] border border-white/10 flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#C6FF3D]" />
              <span className="font-mono text-sm text-white">legal@saasfolio.tech</span>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
