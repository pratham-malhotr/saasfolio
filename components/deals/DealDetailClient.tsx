"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { 
  Copy, 
  Check, 
  ExternalLink, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Send,
  ArrowRight,
  ArrowLeft,
  Share2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  Tag,
  Award,
  Zap
} from "lucide-react";
import { SaaSDeal, DetailedTool } from "@/lib/types";
import { getOfferDestination, offerLabel, offerStatus } from "@/lib/offer-links";

interface DealDetailClientProps {
  deal: SaaSDeal;
  tool?: DetailedTool;
  faqs?: { question: string; answer: string }[];
  siblingDeals?: SaaSDeal[];
  relatedDeals: SaaSDeal[];
  comparisonHref: string;
}

export function DealDetailClient({
  deal,
  tool,
  faqs,
  siblingDeals = [],
  relatedDeals,
  comparisonHref,
}: DealDetailClientProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [votesUp, setVotesUp] = useState(deal.votesUp || 0);
  const [votesDown, setVotesDown] = useState(deal.votesDown || 0);
  const [saved, setSaved] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Comments state
  const [comments, setComments] = useState<{ id: string; user: string; text: string; time: string }[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!deal.expiryDate) return;
    const update = () => {
      const seconds = Math.max(0, Math.floor((Date.parse(deal.expiryDate) - Date.now()) / 1000));
      setTimeLeft({ days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [deal.expiryDate]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 },
      colors: ["#C6FF3D", "#FFFFFF", "#7C5CFF", "#111111"],
      disableForReducedMotion: true,
    });
  };

  const handleRevealAndCopy = () => {
    setRevealed(true);
    triggerConfetti();

    if (deal.code) {
      try {
        navigator.clipboard.writeText(deal.code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }).catch(() => setCopied(false));
      } catch {
        // Fallback
      }
    }

    // Automatically navigate to official checkout in new tab
    if (typeof window !== "undefined") {
      const destinationUrl = getOfferDestination(deal);
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleVote = (type: "up" | "down") => {
    if (voted === type) return;
    if (type === "up") {
      setVotesUp((prev) => prev + 1);
      if (voted === "down") setVotesDown((prev) => Math.max(0, prev - 1));
    } else {
      setVotesDown((prev) => prev + 1);
      if (voted === "up") setVotesUp((prev) => Math.max(0, prev - 1));
    }
    setVoted(type);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments([
      {
        id: `c-${Date.now()}`,
        user: "founder_you",
        text: commentInput.trim(),
        time: "Just now",
      },
      ...comments,
    ]);
    setCommentInput("");
  };

  const liveSuccessRate = Math.round((votesUp / (votesUp + votesDown || 1)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/deals"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO ALL DEALS</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
            CATEGORY:
          </span>
          <Link
            href={`/deals?category=${deal.categorySlug}`}
            className="font-mono text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white hover:border-[#C6FF3D]/50 transition-all"
          >
            {deal.category}
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Column Content (8 cols) & Right Column Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Deal Details, Code Reveal, How-To, Table, FAQs (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Deal Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#09090C] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6FF3D]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#C6FF3D] text-black font-mono font-black text-xs uppercase tracking-wider">
                  {offerLabel(deal)}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-mono text-xs uppercase">
                  {deal.dealType.replace("_", " ")}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {offerStatus(deal)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${deal.toolName} Discount on SaaSFolio`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all"
                  title="Share this deal"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`p-2 rounded-xl border transition-all ${
                    saved
                      ? "bg-[#C6FF3D] text-black border-[#C6FF3D]"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                  title="Bookmark this deal"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Tool Link */}
            <div className="mb-4">
              <Link
                href={tool ? `/tools/${deal.toolSlug}` : "/tools"}
                className="font-mono text-xs text-[#C6FF3D] hover:underline uppercase tracking-wider inline-flex items-center gap-1 mb-2"
              >
                <span>{deal.toolName}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                {deal.title}
              </h1>
            </div>

            {/* Description */}
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-8">
              {deal.description}
            </p>

            {/* Interactive Reveal Coupon Code Box */}
            <div className="relative p-6 sm:p-8 rounded-2xl border-2 border-dashed border-[#C6FF3D]/40 bg-black/70 text-center mb-8">
              <div className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
                {deal.code ? "REPORTED COUPON CODE" : "PROVIDER OFFER"}
              </div>

              {revealed ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#121215] border-2 border-[#C6FF3D] font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#C6FF3D] shadow-[0_0_30px_rgba(198,255,61,0.3)] select-all">
                    {deal.code || "NO CODE NEEDED"}
                  </div>
                  <button
                    onClick={handleRevealAndCopy}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#C6FF3D] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_25px_rgba(198,255,61,0.4)] cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" /> Copied to Clipboard
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> {deal.code ? "Copy Promo Code" : "Open Provider"}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="filter blur-md select-none font-mono text-3xl font-bold tracking-widest text-zinc-500">
                    FOLIO••••••••
                  </div>
                  <button
                    onClick={handleRevealAndCopy}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C6FF3D] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center justify-center gap-2 mx-auto shadow-[0_0_30px_rgba(198,255,61,0.4)] cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 fill-black" />
                    <span>{deal.code ? "Reveal Code & Open Provider" : "Open Provider Offer"}</span>
                  </button>
                </div>
              )}

              {copied && (
                <div className="mt-3 text-xs font-mono text-[#C6FF3D] font-bold flex items-center justify-center gap-1.5 animate-pulse">
                  <Check className="w-4 h-4" /> Copied! Ready to paste at checkout.
                </div>
              )}
            </div>

            {/* Outbound Link CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={`/go/${deal.slug}`}
                rel="sponsored nofollow noopener noreferrer"
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#C6FF3D] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_25px_rgba(198,255,61,0.3)]"
              >
                <span>Visit {deal.toolName} Offer</span>
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Step-by-Step Coupon Redemption Guide */}
          <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#C6FF3D]" />
              <h2 className="font-display font-bold text-xl text-white">
                How to Claim Your {deal.toolName} Discount (4 Steps)
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#C6FF3D] text-black font-black text-xs flex items-center justify-center font-mono">1</span>
                  <span className="font-display font-bold text-sm text-white">Review Offer</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Read the offer terms and source below. {deal.code ? `The reported code is ${deal.code}.` : "No coupon code is recorded for this offer."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#C6FF3D] text-black font-black text-xs flex items-center justify-center font-mono">2</span>
                  <span className="font-display font-bold text-sm text-white">Open Official Site</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Open the offer link to visit {deal.toolName}. A referral link does not guarantee a discount.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#C6FF3D] text-black font-black text-xs flex items-center justify-center font-mono">3</span>
                  <span className="font-display font-bold text-sm text-white">Select Eligible Plan</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Check plan eligibility, billing period, usage limits, and renewal prices directly with the provider.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#C6FF3D] text-black font-black text-xs flex items-center justify-center font-mono">4</span>
                  <span className="font-display font-bold text-sm text-white">Apply & Save</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {deal.code ? `Try ${deal.code} in the promo field.` : "Follow the provider’s signup or application process."} Confirm the final total before paying.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Savings Matrix */}
          <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#C6FF3D]" />
                <h2 className="font-display font-bold text-xl text-white">
                  {deal.toolName} Discount & Savings Matrix
                </h2>
              </div>
              <span className="font-mono text-xs text-[#C6FF3D] font-bold">SOURCE DETAILS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase">
                    <th className="pb-3 font-semibold">Offer Attribute</th>
                    <th className="pb-3 font-semibold">Standard Rate</th>
                    <th className="pb-3 font-semibold text-[#C6FF3D]">Provider Offer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  <tr>
                    <td className="py-3 text-white font-medium">Discount Rate</td>
                    <td className="py-3 text-zinc-500">0% (Full Price)</td>
                    <td className="py-3 text-[#C6FF3D] font-bold">{offerLabel(deal)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-white font-medium">Coupon Code</td>
                    <td className="py-3 text-zinc-500">None required</td>
                    <td className="py-3 font-mono text-[#C6FF3D] font-bold">{deal.code || "See provider terms"}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-white font-medium">Applicable Plans</td>
                    <td className="py-3 text-zinc-500">All Tiers</td>
                    <td className="py-3 text-white">See offer terms</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-white font-medium">Verification Status</td>
                    <td className="py-3 text-zinc-500">—</td>
                    <td className="py-3 text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {offerStatus(deal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-white font-medium">Customer Eligibility</td>
                    <td className="py-3 text-zinc-500">All</td>
                    <td className="py-3 text-white">See provider eligibility</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sibling Deals / Other Promo Codes for the Same Brand */}
          {siblingDeals && siblingDeals.length > 0 && (
            <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#C6FF3D]" />
                <h2 className="font-display font-bold text-xl text-white">
                  Other Verified {deal.toolName} Discounts & Promo Codes
                </h2>
              </div>
              <div className="space-y-3">
                {siblingDeals.map((sib) => (
                  <div
                    key={sib.id}
                    className="p-4 rounded-2xl bg-black border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#C6FF3D] text-black font-black">
                          {offerLabel(sib)}
                        </span>
                        <span className="font-mono text-xs text-zinc-400 uppercase">
                          {sib.dealType.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-white text-sm">
                        {sib.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {sib.description}
                      </p>
                    </div>
                    <Link
                      href={`/deals/${sib.slug}`}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#C6FF3D] hover:text-black text-white text-xs font-mono font-bold transition-all text-center shrink-0"
                    >
                      Claim Offer →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offer Terms & Redemption Guidelines */}
          <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-4">
            <h3 className="font-display font-bold text-xl text-white">
              Offer Terms & Conditions
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {deal.terms}
            </p>
            {deal.sourceUrl && <p className="text-xs text-zinc-400">Source: <a href={deal.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#C6FF3D] hover:underline">{deal.sourceKind === "coupon-site" ? "Coupon publisher" : "Official provider"} ↗</a>. {offerStatus(deal)}.</p>}
            <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-zinc-400">
              <div>
                <span className="text-zinc-500 block uppercase text-[10px]">SOURCE CHECKED</span>
                <span className="text-white font-medium">{deal.verifiedAt}</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase text-[10px]">TOTAL REVEALS</span>
                <span className="text-white font-medium">{deal.revealsCount} founders</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase text-[10px]">BILLING FREQUENCY</span>
                <span className="text-white font-medium">{deal.billingPeriod || "Monthly"}</span>
              </div>
            </div>
          </div>

          {/* Interactive FAQ Accordion */}
          {faqs && faqs.length > 0 && (
            <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#C6FF3D]" />
                  <h2 className="font-display font-bold text-xl text-white">
                    Frequently Asked Questions About {deal.toolName} Discounts
                  </h2>
                </div>
                <span className="font-mono text-xs text-zinc-500">VERIFIED ANSWERS</span>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer"
                      >
                        <span className="font-display font-bold text-sm sm:text-base text-white">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#C6FF3D] shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Crowd Comments / Discussion */}
          <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#C6FF3D]" />
                <h3 className="font-display font-bold text-xl text-white">
                  Community Feedback ({comments.length})
                </h3>
              </div>
              <span className="font-mono text-xs text-zinc-500">REALTIME CROWD INTEL</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Did the discount apply? Share terms or billing notes..."
                className="flex-1 px-4 py-3 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#C6FF3D]"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comm) => (
                <div key={comm.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#C6FF3D] font-bold">@{comm.user}</span>
                    <span className="text-zinc-500">{comm.time}</span>
                  </div>
                  <p className="text-sm text-zinc-300 font-sans">{comm.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Timer, Voting, Tool Profile, Trust Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Expiry Countdown Card */}
          <div className="p-6 rounded-2xl bg-[#08080A] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-[#C6FF3D] font-bold">
                <Clock className="w-4 h-4" /> {deal.expiryDate ? "TIME REMAINING" : "OFFER AVAILABILITY"}
              </span>
              <span>{deal.expiryDate ? "PUBLISHED EXPIRY" : "NO PUBLISHED EXPIRY"}</span>
            </div>

            {deal.expiryDate ? <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "DAYS", val: timeLeft.days },
                { label: "HOURS", val: timeLeft.hours },
                { label: "MINS", val: timeLeft.minutes },
                { label: "SECS", val: timeLeft.seconds },
              ].map((unit) => (
                <div key={unit.label} className="p-3 rounded-xl bg-black border border-white/10">
                  <div className="font-mono text-2xl font-black text-white">
                    {unit.val.toString().padStart(2, "0")}
                  </div>
                  <div className="font-mono text-[9px] text-zinc-500 uppercase mt-0.5">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div> : <p className="text-xs text-zinc-400">Check current availability with the provider.</p>}
          </div>

          {/* Did it work crowd voting */}
          <div className="p-6 rounded-2xl bg-[#08080A] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                THIS SESSION FEEDBACK
              </span>
              <span className="font-mono text-xs text-[#C6FF3D] font-bold">
                {votesUp + votesDown ? `${liveSuccessRate}% THIS SESSION` : "NO CHECKOUT DATA"}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
              <div
                className="h-full bg-[#C6FF3D]"
                style={{ width: `${liveSuccessRate}%` }}
              />
              <div
                className="h-full bg-red-500/50"
                style={{ width: `${100 - liveSuccessRate}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote("up")}
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  voted === "up"
                    ? "bg-[#C6FF3D] text-black border-[#C6FF3D] font-bold"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Worked ({votesUp})</span>
              </button>

              <button
                onClick={() => handleVote("down")}
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  voted === "down"
                    ? "bg-red-500/20 text-red-300 border-red-500/30 font-bold"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Didn&apos;t work ({votesDown})</span>
              </button>
            </div>
          </div>

          {/* Software Tool Profile Card */}
          {tool && (
            <div className="p-6 rounded-2xl bg-[#08080A] border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black border border-white/15 flex items-center justify-center font-display font-black text-sm text-[#C6FF3D]">
                  {tool.logoLetter}
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-white">
                    {tool.name}
                  </h4>
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                    <span>★ {tool.reviewCount ? tool.rating : "Unrated"}</span>
                    <span>✦</span>
                    <span>{tool.reviewCount} reviews</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {tool.tagline}
              </p>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="text-[#C6FF3D] hover:underline font-bold"
                >
                  View Full Profile →
                </Link>
                <Link
                  href={comparisonHref}
                  className="text-zinc-400 hover:text-white"
                >
                  Compare Specs
                </Link>
              </div>
            </div>
          )}

          {/* Why Trust SaaSFolio Trust Card */}
          <div className="p-6 rounded-2xl bg-[#08080A] border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C6FF3D]" />
              <span className="font-mono text-xs text-white font-bold uppercase tracking-wider">
                Why Trust SaaSFolio
              </span>
            </div>
            <ul className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#C6FF3D] shrink-0 mt-0.5" />
                <span><strong>Hand-Tested Codes:</strong> Every coupon is checked in real checkouts weekly.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#C6FF3D] shrink-0 mt-0.5" />
                <span><strong>Direct Vendor Rates:</strong> We partner with founders to bring exclusive discounts.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#C6FF3D] shrink-0 mt-0.5" />
                <span><strong>Zero Clickbait:</strong> Source links and provider eligibility are shown with each offer.</span>
              </li>
            </ul>
          </div>

          {/* Affiliate Disclosure Notice */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-500 leading-relaxed">
            <span className="font-mono text-zinc-400 font-bold uppercase mr-1">Transparency Note:</span>
            SaaSFolio operates independently. When you click checkout links, we may receive a commission that supports continuous verification audits.
          </div>
        </div>
      </div>

      {/* Related Deals in this Vertical */}
      {relatedDeals.length > 0 && (
        <div className="pt-12 border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-2xl text-white uppercase">
              Similar {deal.category} Deals
            </h2>
            <Link
              href={`/deals?category=${deal.categorySlug}`}
              className="text-xs font-mono text-[#C6FF3D] hover:underline"
            >
              Browse All {deal.category} Deals →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedDeals.slice(0, 3).map((rel) => (
              <div
                key={rel.id}
                className="p-6 rounded-2xl bg-[#09090C] border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#C6FF3D] text-black font-black">
                      {offerLabel(rel)}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">{rel.dealType.toUpperCase()}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">
                    {rel.toolName}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4">
                    {rel.description}
                  </p>
                </div>
                <Link
                  href={`/deals/${rel.slug}`}
                  className="text-xs font-mono text-[#C6FF3D] hover:underline font-bold"
                >
                  View Promo Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
