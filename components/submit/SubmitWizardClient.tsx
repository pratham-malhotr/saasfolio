"use client";

import { useServiceAvailability } from "@/lib/use-service-availability";
import { ServiceNotice } from "@/components/forms/ServiceNotice";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Check,
  Tag,
  Layers,
  ArrowRight,
  CheckCircle2,
  Copy,
  Sparkles,
  Lock,
  Gift,
  AlertCircle,
  UserCheck
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { POPULAR_SAAS_BRANDS, verifyCodeLocally, type CodeVerificationResult } from "@/lib/code-verification";

type SubmissionMode = "code" | "deal" | "tool";

interface AuthUser {
  name: string;
  email: string;
  avatarLetter: string;
  isAdmin: boolean;
}

export function SubmitWizardClient() {
  const { status: serviceStatus, available: serviceAvailable } = useServiceAvailability("formsConfigured");

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<{ user: AuthUser | null }>("/api/auth/session", undefined, "GET")
      .then((res) => {
        if (active) {
          setCurrentUser(res.user);
          setAuthLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setCurrentUser(null);
          setAuthLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Submission Mode
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>("code");

  // Form State
  const [formData, setFormData] = useState({
    toolName: "",
    websiteUrl: "",
    code: "",
    codeType: "coupon" as "coupon" | "referral" | "discount",
    dealType: "Reported Promo Code",
    discountPercentage: "20",
    discountDescription: "",
    terms: "Applies to all plans at checkout.",
    expirationDate: "",
    verificationProof: "",
    // Fallback tool fields
    tagline: "",
    category: "Dev Tools",
    differentiator: "",
    techStack: "",
    founderEmail: "",
  });

  // Local input checks; acceptance at checkout remains untested.
  const verificationReport: CodeVerificationResult | null = useMemo(() => {
    if (!formData.code.trim() && !formData.websiteUrl.trim()) {
      return null;
    }
    return verifyCodeLocally({
      code: formData.code,
      codeType: formData.codeType,
      toolName: formData.toolName,
      websiteUrl: formData.websiteUrl,
      discountPercentage: Number(formData.discountPercentage || 0),
      discountDescription: formData.discountDescription,
      expirationDate: formData.expirationDate,
    });
  }, [
    formData.code,
    formData.codeType,
    formData.toolName,
    formData.websiteUrl,
    formData.discountPercentage,
    formData.discountDescription,
    formData.expirationDate,
  ]);

  // Handle Quick Brand Select
  const handleSelectBrand = (brand: (typeof POPULAR_SAAS_BRANDS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      toolName: brand.name,
      websiteUrl: brand.website,
      category: brand.category,
      verificationProof: `${brand.website}/pricing`,
    }));
  };

  // Submission Flow
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;

    if (!currentUser) {
      setError("Please sign in to submit a promo or referral code.");
      return;
    }

    if (!formData.websiteUrl.startsWith("https://")) {
      setError("Store website URL must start with https://");
      return;
    }

    if (!formData.verificationProof.startsWith("https://")) {
      setError("The offer source must be a valid https:// URL.");
      return;
    }

    if (submissionMode === "code" && (!formData.code.trim() || formData.code.trim().length < 3)) {
      setError("Please enter a valid coupon or referral code (at least 3 characters).");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const payload = {
        kind: "submission",
        submissionType: submissionMode,
        ...formData,
        discountPercentage: Number(formData.discountPercentage || 0),
        discountDescription:
          formData.discountDescription ||
          `${formData.discountPercentage}% off ${formData.toolName} plans`,
        founderEmail: currentUser.email,
        companyWebsite: new FormData(e.currentTarget).get("companyWebsite"),
      };

      const result = await apiRequest<{ id: string }>("/api/inquiries", payload);
      setTrackingId(result.id);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your submission could not be sent.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopyTrackingId = () => {
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Preview computed values
  const previewHeadline = useMemo(() => {
    const brand = formData.toolName || "SaaS Tool";
    const discount = formData.discountPercentage ? `${formData.discountPercentage}% Off` : "Discount on";
    return `${discount} ${brand}`;
  }, [formData.toolName, formData.discountPercentage]);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header Breadcrumb */}
      <Link
        href="/deals"
        className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> BACK TO ALL DEALS
      </Link>

      {/* Top Banner and Heading */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          COMMUNITY PROMO & REFERRAL DISCOVERY
        </span>
      </div>

      <h1 className="font-display font-black tracking-tight uppercase text-3xl sm:text-5xl text-white mb-4">
        SUBMIT A CODE OR SAAS DEAL
      </h1>
      <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-3xl">
        Discovered a working discount code, referral perk, or vendor promotion? Submit it to the SaaSFolio index.
        We check the submitted format and collect the source and conditions for editorial review. Submitting a code does not verify that it works at checkout.
      </p>

      {/* Logged in status banner */}
      {currentUser && (
        <div className="mb-8 p-3.5 rounded-2xl bg-white/[0.04] border border-[#C6FF3D]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C6FF3D] text-black font-display font-black text-xs flex items-center justify-center">
              {currentUser.avatarLetter || "U"}
            </div>
            <div>
              <span className="text-zinc-400">Authenticated Contributor: </span>
              <strong className="text-white">{currentUser.name}</strong>{" "}
              <span className="text-zinc-500 font-mono">({currentUser.email})</span>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-[#C6FF3D] bg-[#C6FF3D]/10 px-2.5 py-1 rounded-full border border-[#C6FF3D]/25 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Attributed Submissions Active
          </span>
        </div>
      )}

      {/* AUTHENTICATION GATE: If not logged in and not submitted */}
      {!currentUser && !authLoading && !isSubmitted ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0A0A0D] border border-[#C6FF3D]/30 shadow-[0_0_50px_rgba(198,255,61,0.1)] text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/40 text-[#C6FF3D] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(198,255,61,0.2)]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 font-mono text-[11px] text-[#C6FF3D] font-bold uppercase tracking-wider">
              AUTHENTICATION REQUIRED
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              Sign In To Submit Promo & Referral Codes
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Sign in to attach your submission to your account and send its source and conditions for review. Account access does not establish that a code works.
            </p>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2 text-left">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="font-mono text-xs font-bold text-[#C6FF3D] block">1. Account attribution</span>
              <p className="text-xs text-zinc-400">Keep your submission associated with your contributor account.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="font-mono text-xs font-bold text-[#C6FF3D] block">2. Input checks</span>
              <p className="text-xs text-zinc-400">Review the code format, source URL and reported expiry before submitting.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="font-mono text-xs font-bold text-[#C6FF3D] block">3. Source context</span>
              <p className="text-xs text-zinc-400">Include eligibility and a source so the offer can be reviewed.</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-white/10">
            <Link
              href="/login?redirect=/submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#C6FF3D] hover:bg-[#D6FF66] text-black font-display font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(198,255,61,0.3)] hover:shadow-[0_0_35px_rgba(198,255,61,0.5)] flex items-center justify-center gap-2"
            >
              <span>Sign In to Submit Code</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/signup?redirect=/submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs uppercase tracking-wider transition-colors border border-white/10"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      ) : isSubmitted ? (
        /* Success Screen */
        <div className="p-8 sm:p-12 rounded-3xl bg-[#09090C] border border-[#C6FF3D]/40 text-center space-y-6 shadow-[0_0_50px_rgba(198,255,61,0.15)] animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-[#C6FF3D] text-black flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(198,255,61,0.4)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 font-mono text-xs text-[#C6FF3D] font-bold uppercase">
              AWAITING EDITORIAL REVIEW
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-3 mb-2">
              SUBMISSION RECEIVED
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
              Your submitted offer for <strong className="text-white">{formData.toolName || "this software"}</strong> has been received for review. Its source and checkout acceptance have not been verified.
            </p>
          </div>

          {/* Verification receipt */}
          {verificationReport && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-black border border-white/10 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Review status:</span>
                <span className="font-bold text-amber-300">Pending editorial review</span>
              </div>
              <p className="text-[11px] text-zinc-400">{verificationReport.summary}</p>
            </div>
          )}

          {/* Tracking ID Box */}
          <div className="max-w-xs mx-auto p-4 rounded-2xl bg-black border border-white/10 flex items-center justify-between">
            <div className="text-left font-mono text-xs">
              <span className="text-zinc-500 block text-[10px]">TICKET ID</span>
              <span className="font-bold text-[#C6FF3D] text-sm">{trackingId}</span>
            </div>
            <button
              onClick={handleCopyTrackingId}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Copy Ticket ID"
            >
              {copiedId ? <Check className="w-4 h-4 text-[#C6FF3D]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData((prev) => ({ ...prev, code: "", discountDescription: "" }));
              }}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors"
            >
              Submit Another Code
            </button>
            <Link
              href="/deals"
              className="px-6 py-3 rounded-xl bg-[#C6FF3D] hover:bg-[#D6FF66] text-black font-display font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(198,255,61,0.25)]"
            >
              Browse sourced offers →
            </Link>
          </div>
        </div>
      ) : (
        /* The Code Submission Form */
        <form onSubmit={handleSubmit} className="space-y-8" aria-busy={busy}>
          <ServiceNotice status={serviceStatus} />
          <fieldset disabled={!serviceAvailable} className="contents">
            <legend className="sr-only">Code submission details</legend>
            <input name="companyWebsite" aria-label="Leave this field empty" tabIndex={-1} autoComplete="off" className="hidden" />

            {error && (
              <div role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submission Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setSubmissionMode("code")}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  submissionMode === "code"
                    ? "bg-[#C6FF3D]/10 border-[#C6FF3D] shadow-[0_0_20px_rgba(198,255,61,0.15)]"
                    : "bg-black/40 border-white/10 hover:border-white/20 text-zinc-400"
                }`}
              >
                <Tag className={`w-5 h-5 mb-2 ${submissionMode === "code" ? "text-[#C6FF3D]" : "text-zinc-500"}`} />
                <h3 className="font-display font-bold text-sm text-white">Promo or Referral Code</h3>
                <p className="text-xs text-zinc-400 mt-1">Found a coupon or referral code that gives a discount?</p>
              </button>

              <button
                type="button"
                onClick={() => setSubmissionMode("deal")}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  submissionMode === "deal"
                    ? "bg-[#C6FF3D]/10 border-[#C6FF3D] shadow-[0_0_20px_rgba(198,255,61,0.15)]"
                    : "bg-black/40 border-white/10 hover:border-white/20 text-zinc-400"
                }`}
              >
                <Gift className={`w-5 h-5 mb-2 ${submissionMode === "deal" ? "text-[#C6FF3D]" : "text-zinc-500"}`} />
                <h3 className="font-display font-bold text-sm text-white">Vendor Deal / LTD</h3>
                <p className="text-xs text-zinc-400 mt-1">Official SaaS founder or partner discount offer.</p>
              </button>

              <button
                type="button"
                onClick={() => setSubmissionMode("tool")}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  submissionMode === "tool"
                    ? "bg-[#C6FF3D]/10 border-[#C6FF3D] shadow-[0_0_20px_rgba(198,255,61,0.15)]"
                    : "bg-black/40 border-white/10 hover:border-white/20 text-zinc-400"
                }`}
              >
                <Layers className={`w-5 h-5 mb-2 ${submissionMode === "tool" ? "text-[#C6FF3D]" : "text-zinc-500"}`} />
                <h3 className="font-display font-bold text-sm text-white">New Tool Directory</h3>
                <p className="text-xs text-zinc-400 mt-1">List an uncatalogued software tool on SaaSFolio.</p>
              </button>
            </div>

            {/* Quick Brand Selectors */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                Popular Brands (Click to auto-fill store details):
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SAAS_BRANDS.slice(0, 10).map((b) => (
                  <button
                    key={b.slug}
                    type="button"
                    onClick={() => handleSelectBrand(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                      formData.toolName.toLowerCase() === b.name.toLowerCase()
                        ? "bg-[#C6FF3D] text-black font-bold border-[#C6FF3D]"
                        : "bg-white/5 border-white/10 text-zinc-300 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#09090C] border border-white/10 shadow-2xl space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="submit-toolName" className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    SaaS Tool or Brand Name *
                  </label>
                  <input
                    id="submit-toolName"
                    type="text"
                    required
                    value={formData.toolName}
                    onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                    placeholder="e.g. Hostinger, Notion, Beehiiv"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="submit-websiteUrl" className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Official Website / Store URL *
                  </label>
                  <input
                    id="submit-websiteUrl"
                    type="url"
                    required
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://hostinger.com"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Code Specific Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="submit-codeType" className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Code Type
                  </label>
                  <select
                    id="submit-codeType"
                    value={formData.codeType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codeType: e.target.value as "coupon" | "referral" | "discount",
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#C6FF3D]"
                  >
                    <option value="coupon">Promo / Coupon Code</option>
                    <option value="referral">Personal Referral Code</option>
                    <option value="discount">Automatic Checkout Offer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="submit-code" className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    The Exact Code *
                  </label>
                  <input
                    id="submit-code"
                    type="text"
                    required={submissionMode === "code"}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-[#C6FF3D] placeholder-zinc-600 focus:outline-none focus:border-[#C6FF3D] font-mono text-sm font-bold tracking-wider"
                  />
                </div>

                <div>
                  <label htmlFor="submit-discountPercentage" className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Discount Percentage (%)
                  </label>
                  <input
                    id="submit-discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    placeholder="20"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="submit-discountDescription" className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Discount Details & Benefit Description *
                </label>
                <input
                  id="submit-discountDescription"
                  type="text"
                  required
                  value={formData.discountDescription}
                  onChange={(e) => setFormData({ ...formData, discountDescription: e.target.value })}
                  placeholder="e.g. 20% off all Annual Web Hosting plans + 3 months free trial"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="submit-terms" className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Applicable Terms & Restrictions
                  </label>
                  <input
                    id="submit-terms"
                    type="text"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    placeholder="e.g. Valid for new customers on 12+ month billing"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="submit-expirationDate" className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Expiration Date (Optional)
                  </label>
                  <input
                    id="submit-expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="submit-verificationProof" className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Offer source link *
                </label>
                <input
                  id="submit-verificationProof"
                  type="url"
                  required
                  value={formData.verificationProof}
                  onChange={(e) => setFormData({ ...formData, verificationProof: e.target.value })}
                  placeholder="https://hostinger.com/pricing or public announcement URL"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                />
              </div>
            </div>

            {/* Input preflight, separate from source review or checkout testing. */}
            {verificationReport && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0B0E] border border-white/15 space-y-6 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#C6FF3D]" />
                    <h3 className="font-display font-bold text-lg text-white">
                      Submission input checks
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase ${
                        verificationReport.status === "pending_review"
                          ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {verificationReport.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Verification Checks Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {verificationReport.checks.map((check) => (
                    <div
                      key={check.id}
                      className="p-3.5 rounded-2xl bg-black/60 border border-white/5 flex items-start gap-3"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          check.passed ? "bg-[#C6FF3D]/20 text-[#C6FF3D]" : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {check.passed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-white block">{check.label}</span>
                        <span className="text-zinc-400 leading-relaxed">{check.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Card Preview */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-3">
                    Submission preview · not published
                  </span>
                  <div className="max-w-md p-5 rounded-2xl bg-black border border-[#C6FF3D]/30 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#C6FF3D] bg-[#C6FF3D]/10 px-2.5 py-0.5 rounded-full font-bold border border-[#C6FF3D]/25">
                        {verificationReport.recommendedBadge}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {formData.category || "Dev Tools"}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-white">{previewHeadline}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {formData.discountDescription || "Discount code applicable at checkout."}
                    </p>

                    {formData.code && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="font-mono text-xs font-bold text-[#C6FF3D] tracking-widest">
                          {formData.code}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400 uppercase">COPY CODE</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                      <span>Submitted by @{currentUser?.name || "you"}</span>
                      <span className="text-[#C6FF3D] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Pending review
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Link
                href="/deals"
                className="px-6 py-3 rounded-xl text-zinc-400 hover:text-white font-mono text-xs uppercase"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={busy}
                className="px-8 py-4 rounded-2xl bg-[#C6FF3D] hover:bg-[#D6FF66] text-black font-display font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(198,255,61,0.3)] hover:shadow-[0_0_35px_rgba(198,255,61,0.5)] flex items-center gap-2"
              >
                {busy ? (
                  <span>Submitting details...</span>
                ) : (
                  <>
                    <span>Submit for review</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}
