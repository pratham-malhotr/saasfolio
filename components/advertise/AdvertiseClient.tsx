"use client";
import { useServiceAvailability } from "@/lib/use-service-availability";
import { EmailInquiry } from "@/components/forms/EmailInquiry";

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
    price: "Scope to agree",
    period: "by written agreement",
    badge: "PROPOSED PLACEMENT",
    description: "Propose a clearly disclosed software placement. Location, duration and pricing require a written agreement before publication.",
    features: [
      "Official product and source review",
      "Current offer terms and eligibility",
      "Sponsorship and commercial links disclosed",
      "Placement and duration discussed before publication",
    ],
  },
  {
    id: "deal-showcase",
    name: "Software Offer Proposal",
    price: "Scope to agree",
    period: "by written agreement",
    badge: "PROPOSED CAMPAIGN",
    description: "Discuss a sourced coupon or software offer placement with clear eligibility, expiry information and redemption steps.",
    features: [
      "Offer source and eligibility details",
      "Expiry and billing-period conditions",
      "Checkout testing status identified separately",
      "Campaign scope and pricing agreed in writing",
    ],
  },
  {
    id: "editorial-deepdive",
    name: "Sponsored Buying Guide",
    price: "Scope to agree",
    period: "subject to editorial review",
    badge: "EDITORIAL OPTION",
    description: "A proposed sponsored buying guide with clear sponsorship disclosure, current references and scope agreed before publication. No positive review or measured result is guaranteed.",
    features: [
      "Original decision guidance and identifiable sources",
      "Sponsorship and commercial links disclosed",
      "Editorial review before publication",
      "No guaranteed publication or favorable assessment",
    ],
  },
];

export default function AdvertisePage() {
  const { available: serviceAvailable } = useServiceAvailability("formsConfigured");
  const [formData, setFormData] = useState({
    companyName: "",
    toolUrl: "",
    contactEmail: "",
    packageSelected: "featured-tool",
    budget: "Not yet decided",
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

  if (!serviceAvailable) return <EmailInquiry
    kind="partnership"
    title="Discuss a software partnership"
    description="Send SaaSFolio a proposal with your company, product and intended scope. Any commercial arrangement requires editorial review and a written agreement before publication."
    subject="SaaSFolio partnership proposal"
    body={"Company or product name:\n\nOfficial website URL:\n\nYour role and contact details:\n\nPartnership proposal:\n\nRelevant product sources or offer terms:\n\nPreferred timing:\n\nScope and budget (optional):\n"}
    details={[
      { heading: "Company and product", text: "Include your company or product name, official website, your role and a reply address." },
      { heading: "Proposal and sources", text: "Explain the proposed relationship and share current product documentation or offer terms. Identify any commercial or affiliate relationship." },
      { heading: "Scope to discuss", text: "Describe the audience, format and timing you have in mind. Availability, pricing and deliverables must be agreed before a placement is booked." },
    ]}
  />;

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
            DISCUSS YOUR SOFTWARE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#C6FF3D]">
              PARTNERSHIP WITH SAASFOLIO.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 font-sans leading-relaxed">
            Share a proposal for a clearly disclosed software placement or buying guide. Request current audience information and agree the scope before booking.
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              DISCUSS A PARTNERSHIP PROPOSAL
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
              <fieldset className="contents">
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
                      {PACKAGES.map(pkg => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
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
                      <option value="Not yet decided">Not yet decided</option>
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
