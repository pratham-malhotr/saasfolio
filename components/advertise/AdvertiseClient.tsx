"use client";
import { useServiceAvailability } from "@/lib/use-service-availability";
import { ServiceNotice } from "@/components/forms/ServiceNotice";

import React, { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  CheckCircle2, 
  Send, 
  Check
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";

const PACKAGES = [
  {
    id: "featured-tool",
    name: "Featured Tool Spotlight",
    price: "$499",
    period: "per 30 days",
    badge: "PROPOSED PLACEMENT",
    description: "Maximum discovery across the homepage hero banner, category leaderboards, and directory search suggestions.",
    features: [
      "Top sticky placement on /tools directory",
      "Homepage 'Featured SaaS' card inclusion",
      "Direct outbound /go/[id] provider link",
      "Clearly labeled sponsored placement",
      "Social mention on Twitter & LinkedIn channels",
    ],
  },
  {
    id: "deal-showcase",
    name: "Exclusive Deal Launch",
    price: "$349",
    period: "per deal campaign",
    badge: "PROPOSED CAMPAIGN",
    description: "Discuss a sourced coupon or software offer placement with clear eligibility, expiry information and redemption steps.",
    features: [
      "Top slot in /deals hub filter grid",
      "Interactive coupon reveal modal + clipboard copy",
      "Offer terms and source attribution",
      "Pinned on trending deals ticker for 14 days",
      "Campaign links with agreed tracking parameters",
    ],
  },
  {
    id: "editorial-deepdive",
    name: "Architectural Deep Dive",
    price: "$899",
    period: "permanent article",
    badge: "EDITORIAL OPTION",
    description: "A proposed sponsored buying guide with clear sponsorship disclosure, current references and scope agreed before publication. No positive review or measured result is guaranteed.",
    features: [
      "Permanent longform article on /articles/[slug]",
      "Browser text-to-speech on supported devices",
      "Feature comparison matrix vs top 2 competitors",
      "Sponsored links disclosed and qualified appropriately",
      "Full Table of Contents and in-article deal callout",
    ],
  },
  {
    id: "newsletter-takeover",
    name: "Tuesday SaaS Brief Sponsor",
    price: "$599",
    period: "per edition",
    badge: "DIRECT INBOX",
    description: "Discuss newsletter sponsorship availability and the audience details for a proposed edition.",
    features: [
      "Sole primary sponsor header banner (no competition)",
      "150-word founder problem-solution paragraph",
      "Trackable CTA button with custom UTM tags",
      "Request current campaign reporting details",
      "Permanent mention in our newsletter web archive",
    ],
  },
];

export default function AdvertisePage() {
  const { status: serviceStatus, available: serviceAvailable } = useServiceAvailability("formsConfigured");
  const [formData, setFormData] = useState({
    companyName: "",
    toolUrl: "",
    contactEmail: "",
    packageSelected: "featured-tool",
    budget: "$500 - $1,500",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const honeypot = new FormData(e.currentTarget).get("companyWebsite");
    setBusy(true); setError("");
    try {
      const result = await apiRequest<{ id: string }>("/api/inquiries", { kind: "advertise", ...formData, companyWebsite: honeypot });
      setTicketId(result.id); setSubmitted(true);
    } catch (error) { setError(error instanceof Error ? error.message : "Your inquiry could not be sent."); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-[#C6FF3D] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Advertise & Partnerships</span>
        </div>

        {/* Hero */}
        <div className="max-w-4xl mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-6 font-mono text-xs text-[#C6FF3D]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>PARTNER WITH SAASFOLIO</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter uppercase leading-[0.95] mb-8">
            PUT YOUR SAAS IN FRONT OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#C6FF3D]">
              120,000+ FOUNDERS & DEVS.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 font-sans leading-relaxed">
            Our audience consists of serious builders, bootstrapped founders, software architects, and growth leaders looking for reliable software to power their products. 
            We offer premium placements with transparent metrics and zero vanity traffic.
          </p>
        </div>

        <p className="mb-12 text-sm text-zinc-400">Placements are subject to availability and editorial review. Request current audience information and a written scope before booking. No traffic, conversion, or search ranking is guaranteed.</p>

        {/* Sponsorship Packages Grid */}
        <div className="mb-24">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#C6FF3D] font-bold uppercase tracking-widest">
              PLANS & TIERS
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight mt-2 text-white">
              SELECT YOUR PARTNERSHIP FORMAT
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/10 text-[#C6FF3D] font-bold">
                      {pkg.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">
                    {pkg.name}
                  </h3>
                  <div className="mb-4">
                    <span className="font-display font-black text-3xl text-[#C6FF3D]">
                      {pkg.price}
                    </span>
                    <span className="font-mono text-xs text-zinc-500 ml-2">
                      {pkg.period}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-6">
                    {pkg.description}
                  </p>
                  <ul className="space-y-2.5 font-sans text-xs text-zinc-300 border-t border-white/5 pt-5 mb-6">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#C6FF3D] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, packageSelected: pkg.id }));
                    const formElement = document.getElementById("partner-inquiry-form");
                    formElement?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#C6FF3D] hover:text-black border border-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Select Package
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Partnership Inquiry Form */}
        <div id="partner-inquiry-form" className="p-8 sm:p-12 rounded-3xl bg-[#0A0A0E] border border-white/10">
          <div className="max-w-3xl mb-8">
            <span className="font-mono text-xs text-[#C6FF3D] uppercase tracking-widest font-bold">
              GET IN TOUCH // SALES DESK
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight mt-2 text-white">
              RESERVE YOUR SPONSORSHIP SLOT
            </h2>
            <p className="text-sm text-zinc-400 mt-2 font-sans">
              Fill out your company details below. Our team reviews inquiries before confirming availability, scope, and pricing.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-[#09090C] border border-[#C6FF3D]/40 text-center">
              <div className="w-16 h-16 rounded-2xl bg-black border border-[#C6FF3D] flex items-center justify-center text-[#C6FF3D] mx-auto mb-4 shadow-[0_0_20px_rgba(198,255,61,0.2)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white mb-2">
                INQUIRY DISPATCHED SUCCESSFULLY
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6 font-sans">
                Your partnership ticket <span className="font-mono text-[#C6FF3D] font-bold">{ticketId}</span> has been logged. Our team can reply to <span className="text-white font-medium">{formData.contactEmail}</span>.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-white uppercase hover:bg-white/10 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" aria-busy={busy}>
              <ServiceNotice status={serviceStatus} />
              <fieldset disabled={!serviceAvailable} className="contents">
                <legend className="sr-only">Form details</legend>
                {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
                <input name="companyWebsite" aria-label="Leave this field empty" tabIndex={-1} autoComplete="off" className="hidden" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="form-companyName" className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                      Company / Product Name *
                    </label>
                    <input id="form-companyName"
                      type="text"
                      required
                      placeholder="e.g. NextPulse AI"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="form-toolUrl" className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                      Product Website URL *
                    </label>
                    <input id="form-toolUrl"
                      type="url"
                      required
                      placeholder="https://yourproduct.com"
                      value={formData.toolUrl}
                      onChange={(e) => setFormData({ ...formData, toolUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="form-contactEmail" className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                      Founder / Marketing Email *
                    </label>
                    <input id="form-contactEmail"
                      type="email"
                      required
                      placeholder="founder@company.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="form-packageSelected" className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                      Preferred Package
                    </label>
                    <select id="form-packageSelected"
                      value={formData.packageSelected}
                      onChange={(e) => setFormData({ ...formData, packageSelected: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                    >
                      <option value="featured-tool">Featured Tool Spotlight ($499)</option>
                      <option value="deal-showcase">Exclusive Deal Launch ($349)</option>
                      <option value="editorial-deepdive">Architectural Deep Dive ($899)</option>
                      <option value="newsletter-takeover">Tuesday SaaS Brief ($599)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="form-budget" className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                      Estimated Monthly Budget
                    </label>
                    <select id="form-budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                    >
                      <option value="Under $500">Under $500</option>
                      <option value="$500 - $1,500">$500 - $1,500</option>
                      <option value="$1,500 - $5,000">$1,500 - $5,000</option>
                      <option value="$5,000+ Enterprise">$5,000+ Enterprise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="form-message" className="block font-mono text-xs uppercase text-zinc-400 mb-2">
                    Campaign Goals & Special Requests (Optional)
                  </label>
                  <textarea id="form-message"
                    rows={4}
                    placeholder="Tell us about your target audience, current promo codes, or desired launch dates..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#060608] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] transition-colors font-sans text-sm"
                  />
                </div>

                <button
                  type="submit" disabled={busy}
                  className="px-8 py-4 rounded-xl bg-[#C6FF3D] text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(198,255,61,0.25)]"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Partnership Inquiry</span>
                </button>
              </fieldset>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
