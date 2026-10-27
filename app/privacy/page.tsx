import { pageMetadata } from "@/lib/seo";
import React from "react";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";

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
            UPDATED: OCTOBER 27, 2026
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
              SaaSFolio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the software-discount directory at{" "}
              <strong className="text-white">saasfolio.tech</strong>. This policy explains account and form data, browser storage, affiliate links and advertising services. The providers named below may process information under their own policies when their services are enabled.
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
                <strong className="text-zinc-200">Account Credentials:</strong> Account signup uses Supabase Auth to process your email address and password. When enabled, Google or Apple sign-in provides identity details such as your provider-confirmed email and available profile name; Apple may provide a private relay address. Your Google or Apple password is entered with that provider. Profile settings contain your display name and optional biography. Supabase stores salted password hashes for email/password accounts.
              </li>
              <li>
                <strong className="text-zinc-200">Messages and Submissions:</strong> Contact, advertising and software-submission forms collect the details you enter when the online submission service is configured. Community and article drafts, comments and session feedback are browser-local previews and are not shared publicly by the current implementation.
              </li>
              <li>
                <strong className="text-zinc-200">Newsletter Subscription:</strong> If you opt-in to the Tuesday SaaS Brief, we securely store your email address for newsletter dispatch.
              </li>
              <li>
                <strong className="text-zinc-200">Technical Device Logs:</strong> Our hosting and authentication providers may process request logs for operation and abuse prevention. Server form limits use a keyed hash derived from the client address supplied by the hosting proxy. We do not claim that provider logs are automatically anonymized after a fixed period.
              </li>
            </ul>
          </section>

          <section id="advertising" className="scroll-mt-28 space-y-4">
            <h2 className="font-display font-bold text-xl text-white">Google advertising and your choices</h2>
            <p>We have applied to Google AdSense. Our publisher verification tag identifies this site to Google. This release uses verification only and does not load Google ad-serving code. Advertising can be introduced after account approval and consent configuration. A verification tag is not an advertisement or a promise that the site has been approved.</p>
            <p>When Google advertising is enabled, third-party vendors, including Google, may place or read cookies and use web beacons, device information and IP addresses to serve and measure ads. Google’s advertising cookies can enable Google and its partners to personalize ads using visits to this site and other sites. Contextual or non-personalized advertising can also involve data processing for security and measurement.</p>
            <p>You can manage Google’s personalized advertising choices through <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#C6FF3D] underline">My Ad Center</a>. Read <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-[#C6FF3D] underline">how Google uses information from partner sites</a> and <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-[#C6FF3D] underline">Google’s advertising technologies policy</a>. Some other advertising vendors offer choices through <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-[#C6FF3D] underline">the Digital Advertising Alliance</a>.</p>
            <p>Where required, advertising must use a Google-certified consent management platform. Its message provides choices about consent, vendors and changing preferences. Browser settings can remove or block cookies, but do not replace that consent process. Essential account and security functions may use storage separately from advertising choices.</p>
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
                <strong className="text-zinc-200">Session and Preference Storage:</strong> Account sessions use HttpOnly cookies. Saved articles and offers are stored in Supabase under the signed-in account. Browser-only community previews and preferences can use local storage; these are separate from the account session.
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
              The production site uses HTTPS. Account session cookies are configured as HttpOnly, SameSite=Lax, and Secure in production. Database access policies restrict saved items to their account owner, and the inquiry inbox requires administrator authorization. Supabase processes account and database information; Resend processes newsletter confirmation delivery. Contact and vendor submissions remain stored for operational review. Hosting and service providers also have their own data handling and retention policies.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">05.</span>
              <span>Privacy Requests</span>
            </h2>
            <p className="mb-3">
              Contact us with the email address associated with your account or inquiry to request help with the following. We may need to verify ownership before acting:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Access to or a copy of personal information associated with your account.</li>
              <li>Review or deletion of your account and associated personal information. Self-service account deletion is not currently available.</li>
              <li>Newsletter cancellation using the unsubscribe link in your signup email or a support request. Newsletter signup is inactive until you confirm your email.</li>
              <li>Corrections to inaccurate contact, profile, or submission information.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-white uppercase mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-[#C6FF3D]">06.</span>
              <span>Contact Us About Privacy</span>
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
