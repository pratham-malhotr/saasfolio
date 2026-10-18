"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Send,
  ShieldCheck,
  Check,
  Tag,
  Layers,
  FileText,
  ArrowRight,
  Eye,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";

type SubmissionType = "deal" | "tool" | "review";

export function SubmitWizardClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [submissionType, setSubmissionType] = useState<SubmissionType>("deal");

  // Form State
  const [formData, setFormData] = useState({
    toolName: "",
    tagline: "",
    websiteUrl: "",
    category: "Dev Tools",
    dealType: "Verified Coupon Code",
    discountPercentage: "50",
    couponCode: "SAAS50",
    expirationDate: "2026-12-31",
    verificationProof: "",
    techStack: "Next.js, EdgeBase, Cloudflare Workers",
    differentiator: "Sub-15ms worldwide latency, 80% lower cost than AWS Aurora, zero connection pool timeouts.",
    founderEmail: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as any);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `SUB-${Math.floor(100000 + Math.random() * 900000)}`;
    setTrackingId(newId);

    const submissionPayload = {
      id: newId,
      submissionType,
      toolName: formData.toolName || "Custom SaaS Tool",
      tagline: formData.tagline || "High-performance developer platform",
      websiteUrl: formData.websiteUrl || "https://example.com",
      category: formData.category,
      dealType: formData.dealType,
      discountPercentage: Number(formData.discountPercentage) || 40,
      couponCode: formData.couponCode || "EXCLUSIVE",
      expirationDate: formData.expirationDate,
      verificationProof: formData.verificationProof,
      techStack: formData.techStack,
      differentiator: formData.differentiator,
      founderEmail: formData.founderEmail || "founder@startup.io",
      status: "PENDING VERIFICATION",
      submittedAt: "Just now",
      views: 0,
    };

    try {
      const stored = localStorage.getItem("saasfolio_submissions");
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem("saasfolio_submissions", JSON.stringify([submissionPayload, ...list]));
    } catch (e) {
      console.error(e);
    }

    setIsSubmitted(true);
  };

  const handleCopyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> BACK TO DISCOVERY HOME
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
          FOUNDER & VENDOR ONBOARDING PORTAL
        </span>
      </div>
      <h1 className="font-display font-black tracking-tight uppercase text-3xl sm:text-5xl text-white mb-4">
        SUBMIT A TOOL OR EXCLUSIVE DEAL
      </h1>
      <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-2xl">
        Connect directly with 10,000+ founders, tech leads, and software buyers. Every listing is reviewed by our engineering staff within 24 hours.
      </p>

      {/* Progress Steps Indicator */}
      {!isSubmitted && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-10">
          {[
            { step: 1, title: "Intent", desc: "Category" },
            { step: 2, title: "Offer", desc: "Pricing & Code" },
            { step: 3, title: "Tech Specs", desc: "Architecture" },
            { step: 4, title: "Preview", desc: "Verification" },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <div
                key={item.step}
                className={`p-3 rounded-2xl border transition-all ${
                  isActive
                    ? "bg-[#C6FF3D]/10 border-[#C6FF3D] text-[#C6FF3D]"
                    : isCompleted
                    ? "bg-white/5 border-white/20 text-white"
                    : "bg-black/40 border-white/5 text-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase font-bold">
                    STEP {item.step}
                  </span>
                  {isCompleted && <Check className="w-3.5 h-3.5 text-[#C6FF3D]" />}
                </div>
                <div className="font-display font-bold text-xs sm:text-sm text-white">
                  {item.title}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Success Celebration Screen */}
      {isSubmitted ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#09090C] border border-[#C6FF3D]/40 text-center space-y-6 shadow-[0_0_50px_rgba(198,255,61,0.15)] animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-[#C6FF3D] text-black flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(198,255,61,0.4)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 font-mono text-xs text-[#C6FF3D] font-bold uppercase">
              TICKET GENERATED
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-3 mb-2">
              SUBMISSION RECEIVED
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
              Your software offer for <strong className="text-white">{formData.toolName || "your product"}</strong> has entered our staff moderation queue.
            </p>
          </div>

          {/* Tracking ID Box */}
          <div className="max-w-xs mx-auto p-4 rounded-2xl bg-black border border-white/10 flex items-center justify-between">
            <div className="text-left font-mono text-xs">
              <span className="text-zinc-500 block text-[10px]">VERIFICATION ID</span>
              <span className="font-bold text-[#C6FF3D] text-sm">{trackingId}</span>
            </div>
            <button
              onClick={handleCopyTrackingId}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Copy Tracking ID"
            >
              {copiedId ? <Check className="w-4 h-4 text-[#C6FF3D]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-white/10">
            <Link
              href="/profile"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors"
            >
              View In Member Profile
            </Link>
            <Link
              href="/admin"
              className="px-6 py-3 rounded-xl bg-[#C6FF3D] hover:bg-[#D6FF66] text-black font-display font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(198,255,61,0.25)]"
            >
              Check Admin Approval Queue →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-3xl bg-[#09090C] border border-white/10 shadow-2xl">
          {/* STEP 1: Submission Intent */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="font-display font-bold text-xl text-white mb-1">
                  1. Choose Your Submission Category
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm">
                  Select how you would like your product to be listed and discovered.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    type: "deal",
                    icon: Tag,
                    title: "Exclusive Deal",
                    desc: "List a verified promo code, lifetime discount, or credit.",
                  },
                  {
                    type: "tool",
                    icon: Layers,
                    title: "Tool Directory",
                    desc: "Add your software to our browsable, searchable catalogue.",
                  },
                  {
                    type: "review",
                    icon: FileText,
                    title: "Technical Review",
                    desc: "Submit an architectural breakdown or benchmark test.",
                  },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSubmissionType(item.type as any)}
                    className={`p-6 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      submissionType === item.type
                        ? "bg-[#C6FF3D]/10 border-[#C6FF3D] shadow-[0_0_20px_rgba(198,255,61,0.15)]"
                        : "bg-black/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <item.icon
                        className={`w-6 h-6 mb-3 ${
                          submissionType === item.type ? "text-[#C6FF3D]" : "text-zinc-500"
                        }`}
                      />
                      <div className="font-display font-bold text-base text-white mb-1">
                        {item.title}
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 font-mono text-[10px] text-zinc-500">
                      {submissionType === item.type ? "● Selected" : "○ Click to select"}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Target Product Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#C6FF3D]"
                >
                  <option value="Dev Tools">Dev Tools & Infrastructure</option>
                  <option value="AI Tools">AI & Machine Learning</option>
                  <option value="Security">Security & Zero-Trust Auth</option>
                  <option value="Analytics">Analytics & Data Observability</option>
                  <option value="Fintech">Fintech & Invoicing</option>
                  <option value="Marketing">Marketing & Communication</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Tool & Offer Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="font-display font-bold text-xl text-white mb-1">
                  2. Product & Offer Information
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm">
                  Specify exact coupon terms, website links, and discount percentages.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    SaaS Tool Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.toolName}
                    onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                    placeholder="e.g. EdgeBase Cloud"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Official Website URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://edgebase.cloud"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  One-Line Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Distributed SQLite for Edge Runtimes with Raft Consensus"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Deal Type
                  </label>
                  <select
                    value={formData.dealType}
                    onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#C6FF3D]"
                  >
                    <option value="Verified Coupon Code">Verified Coupon Code</option>
                    <option value="Lifetime Deal (LTD)">Lifetime Deal (LTD)</option>
                    <option value="Extended Free Trial">Extended Free Trial</option>
                    <option value="Startup Credits">Startup Credits</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    placeholder="50"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Coupon Promo Code
                  </label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="SAAS50"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs font-bold text-[#C6FF3D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Verification Proof Link / Documentation
                </label>
                <input
                  type="text"
                  value={formData.verificationProof}
                  onChange={(e) => setFormData({ ...formData, verificationProof: e.target.value })}
                  placeholder="https://twitter.com/... or public pricing checkout link"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Technical Specifications */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="font-display font-bold text-xl text-white mb-1">
                  3. Architecture & Competitive Edge
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm">
                  Engineers love SaaSFolio because we explain why tools are built better.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Core Tech Stack / Cloud Infrastructure
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="e.g. Rust, WebAssembly, ClickHouse, AWS eu-central-1"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Why is this product better than legacy alternatives? *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.differentiator}
                  onChange={(e) => setFormData({ ...formData, differentiator: e.target.value })}
                  placeholder="Explain latency, cost savings, compliance, or developer experience advantages..."
                  className="w-full p-4 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Founder / Submitter Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.founderEmail}
                  onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
                  placeholder="founder@yourcompany.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Live Card Preview & Final Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="font-display font-bold text-xl text-white mb-1">
                  4. Real-Time Deal Card Preview
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm">
                  This is how your product listing will appear in the SaaSFolio directory.
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#09090C] border-2 border-[#C6FF3D]/40 shadow-[0_0_30px_rgba(198,255,61,0.1)] relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-[#C6FF3D] font-bold">
                    {formData.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C6FF3D] text-black font-mono text-xs font-black">
                    {formData.discountPercentage}% OFF
                  </span>
                </div>

                <h4 className="font-display font-black text-xl text-white mb-1">
                  {formData.toolName || "Your SaaS Tool"}
                </h4>
                <p className="text-zinc-400 text-xs mb-4 line-clamp-2">
                  {formData.tagline || "High performance software designed for high-scale teams."}
                </p>

                <div className="p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-xs space-y-1 mb-4">
                  <div className="text-zinc-400 flex justify-between">
                    <span>Deal Type:</span>
                    <span className="text-white">{formData.dealType}</span>
                  </div>
                  <div className="text-zinc-400 flex justify-between">
                    <span>Promo Code:</span>
                    <span className="text-[#C6FF3D] font-bold">{formData.couponCode || "DISCOUNT"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Staff Verified
                  </span>
                  <span className="text-[#C6FF3D] font-bold">Reveal Coupon →</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  By submitting, you confirm that this offer is active and you have rights to represent the product or coupon. Listing approvals take ~24 hours.
                </span>
              </div>
            </div>
          )}

          {/* Wizard Navigation Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white font-mono text-xs transition-colors"
              >
                ← Previous Step
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(198,255,61,0.2)]"
              >
                Continue to Step {currentStep + 1} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-[#C6FF3D] text-black font-display font-black text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(198,255,61,0.3)]"
              >
                <Send className="w-4 h-4" /> Submit to Moderation Queue
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
