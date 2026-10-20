import { pageMetadata } from "@/lib/seo";
import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, FileText, ArrowLeft, Mail } from "lucide-react";

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'Read the SaaSFolio privacy policy to learn how information is collected, used and stored when you browse software deals, reviews and community pages.',
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-[#C6FF3D] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-4 font-mono text-xs text-[#C6FF3D]">
            <Lock className="w-3.5 h-3.5" />
            <span>LEGAL & DATA PROTECTION</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tighter text-white mb-3">
            SAASFOLIO PRIVACY POLICY
          </h1>
          <p className="font-mono text-xs text-zinc-500">
            EFFECTIVE DATE: OCTOBER 18, 2026 // VERSION 2.4 (GDPR & CCPA COMPLIANT)
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 font-sans text-sm text-zinc-300 leading-relaxed">
          
          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">01.</span>
              <span>Overview & Scope</span>
            </h2>
            <p>
              SaaSFolio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the discovery platform located at{" "}
              <strong className="text-white">saasfolio.tech</strong>. This Privacy Policy details the types of personal data we collect, why we collect it, how it is safeguarded, and your legal rights regarding your personal information. We believe in privacy by design: we do not sell your data to brokers, nor do we deploy intrusive behavioral fingerprinting trackers.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">02.</span>
              <span>Information We Collect</span>
            </h2>
            <p className="mb-3">
              We collect information in the following limited categories:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Account Credentials:</strong> When creating a Member Passport or authenticating via OAuth (GitHub or Google), we receive your display name, email address, and avatar image URL.
              </li>
              <li>
                <strong className="text-zinc-200">User-Generated Content:</strong> Thread submissions, community comments, coupon success voting (&quot;Worked / Didn&apos;t Work&quot;), and tool submission tickets.
              </li>
              <li>
                <strong className="text-zinc-200">Newsletter Subscription:</strong> If you opt-in to the Tuesday SaaS Brief, we securely store your email address for newsletter dispatch.
              </li>
              <li>
                <strong className="text-zinc-200">Technical Device Logs:</strong> Minimal server telemetry including IP addresses (anonymized after 24 hours), browser user-agent, operating system, and HTTP referrers to prevent DDOS and coupon scraping abuse.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">03.</span>
              <span>Cookies & Local Client Storage</span>
            </h2>
            <p className="mb-3">
              SaaSFolio utilizes limited browser storage mechanisms:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Strictly Necessary Storage:</strong> LocalStorage keys (such as <code className="text-[#C6FF3D] bg-black/40 px-1.5 py-0.5 rounded">saasfolio_current_user</code> and <code className="text-[#C6FF3D] bg-black/40 px-1.5 py-0.5 rounded">saasfolio_preloader_seen</code>) to preserve your dark theme, authentication state, and session preferences without sending cookies to third parties.
              </li>
              <li>
                <strong className="text-zinc-200">Affiliate Referral Parameters:</strong> When clicking outward affiliate links (via our <code className="text-zinc-300">/go/[id]</code> redirect gateway), destination partner platforms may set an affiliate tracking cookie to attribute software purchases and commission splits.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">04.</span>
              <span>How We Protect and Retain Data</span>
            </h2>
            <p>
              All traffic between your browser and SaaSFolio is strictly encrypted using TLS 1.3 cryptographic protocols with HSTS preloading enabled. We follow the principle of data minimization: database snapshots are encrypted at rest with AES-256 standards, and internal staff access requires multi-factor authentication (MFA).
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">05.</span>
              <span>Your Rights (GDPR & CCPA)</span>
            </h2>
            <p className="mb-3">
              Regardless of your geographic jurisdiction, SaaSFolio grants all users the following fundamental privacy rights:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>The right to access, inspect, and export a copy of all personal data tied to your account.</li>
              <li>The right to immediately delete your account, comments, and member passport from our systems (&quot;Right to be Forgotten&quot;).</li>
              <li>The right to unsubscribe from any editorial marketing communications with a single 1-click header link.</li>
              <li>The right not to be discriminated against for exercising any privacy or data rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">06.</span>
              <span>Contact Our Data Protection Officer</span>
            </h2>
            <p className="mb-4">
              If you have any questions regarding this policy, wish to execute a deletion request, or report a security concern, contact our data privacy desk:
            </p>
            <div className="p-4 rounded-xl bg-[#09090C] border border-white/10 flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#C6FF3D]" />
              <span className="font-mono text-sm text-white">privacy@saasfolio.tech</span>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
