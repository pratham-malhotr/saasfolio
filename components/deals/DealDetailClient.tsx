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
  Bookmark
} from "lucide-react";
import { SaaSDeal, DetailedTool } from "@/lib/types";
import { CUSTOM_AFFILIATE_LINKS } from "@/lib/data/affiliate-links";

interface DealDetailClientProps {
  deal: SaaSDeal;
  tool?: DetailedTool;
  relatedDeals: SaaSDeal[];
  comparisonHref: string;
}

export function DealDetailClient({ deal, tool, relatedDeals, comparisonHref }: DealDetailClientProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [votesUp, setVotesUp] = useState(deal.votesUp || 120);
  const [votesDown, setVotesDown] = useState(deal.votesDown || 4);
  const [saved, setSaved] = useState(false);

  // Comments state
  const [comments, setComments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    {
      id: "c-1",
      user: "dev_alex",
      text: "Code worked instantly on annual checkout! Saved over $290 for our team.",
      time: "2 hours ago",
    },
    {
      id: "c-2",
      user: "marcus_scale",
      text: "Confirmed working on both EU and US billing locations. Great find SaaSFolio team.",
      time: "5 hours ago",
    },
  ]);
  const [commentInput, setCommentInput] = useState("");

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        navigator.clipboard.writeText(deal.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        // Fallback
      }
    }

    // Automatically navigate to official checkout in new tab
    if (typeof window !== "undefined") {
      const customAffiliate = CUSTOM_AFFILIATE_LINKS[deal.toolSlug] || CUSTOM_AFFILIATE_LINKS[deal.slug];
      const destinationUrl = customAffiliate || tool?.website || (deal.affiliateUrl?.startsWith("http") ? deal.affiliateUrl : `/go/${deal.toolSlug}`);
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleVote = (type: "up" | "down") => {
    if (voted) return;
    setVoted(type);
    if (type === "up") setVotesUp((prev) => prev + 1);
    if (type === "down") setVotesDown((prev) => prev + 1);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        user: "you_founder",
        text: commentInput.trim(),
        time: "Just now",
      },
      ...prev,
    ]);
    setCommentInput("");
  };

  const totalVotes = votesUp + votesDown;
  const liveSuccessRate = Math.round((votesUp / totalVotes) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-8">
        <Link href="/" className="hover:text-white transition-colors">HOME</Link>
        <span>/</span>
        <Link href="/deals" className="hover:text-white transition-colors">DEALS</Link>
        <span>/</span>
        <span className="text-zinc-300">{deal.category.toUpperCase()}</span>
        <span>/</span>
        <span className="text-[#C6FF3D]">{deal.toolName}</span>
      </div>

      {/* Main Grid: Deal Card (8 cols) + Sticky Details & Tool (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        {/* Left Column: Offer Hero & Code Reveal (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Hero Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#09090C] border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            {/* Top Badges & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs px-3 py-1 rounded-lg bg-[#C6FF3D] text-black font-black uppercase">
                  {deal.discountPercentage}% OFF
                </span>
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 uppercase">
                  {deal.dealType.toUpperCase()}
                </span>
                {deal.badge && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#C6FF3D]/10 text-[#C6FF3D] border border-[#C6FF3D]/30 font-bold uppercase">
                    {deal.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`p-2 rounded-xl border transition-colors ${
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
                VERIFIED EXCLUSIVE COUPON CODE
              </div>

              {revealed ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#121215] border-2 border-[#C6FF3D] font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#C6FF3D] shadow-[0_0_30px_rgba(198,255,61,0.3)] select-all">
                    {deal.code || "AUTOMATIC_OFFER"}
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
                        <Copy className="w-4 h-4" /> Copy Promo Code
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
                    <span>Reveal Coupon & Copy to Clipboard</span>
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
                href={`/go/${deal.toolSlug}`}
                rel="sponsored nofollow noopener noreferrer"
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#C6FF3D] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_25px_rgba(198,255,61,0.3)]"
              >
                <span>Visit {deal.toolName} Official Checkout</span>
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Offer Terms & Redemption Guidelines */}
          <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-4">
            <h3 className="font-display font-bold text-xl text-white">
              Offer Terms & Conditions
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {deal.terms}
            </p>
            <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-zinc-400">
              <div>
                <span className="text-zinc-500 block uppercase text-[10px]">VERIFIED AT</span>
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
                className="px-5 py-3 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-1.5"
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

        {/* Right Column: Timer, Voting & Tool Profile (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Expiry Countdown Card */}
          <div className="p-6 rounded-2xl bg-[#08080A] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-[#C6FF3D] font-bold">
                <Clock className="w-4 h-4" /> TIME REMAINING
              </span>
              <span>LIMITED OFFER</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
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
            </div>
          </div>

          {/* Did it work crowd voting */}
          <div className="p-6 rounded-2xl bg-[#08080A] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                CROWD VERIFICATION
              </span>
              <span className="font-mono text-xs text-[#C6FF3D] font-bold">
                {liveSuccessRate}% SUCCESS
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
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all ${
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
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all ${
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
                    <span>★ {tool.rating}</span>
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
                      {rel.discountPercentage}% OFF
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">{rel.dealType.toUpperCase()}</span>
                  </div>
                  <h4 className="font-display font-bold text-lg text-white mb-1">
                    {rel.toolName}
                  </h4>
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
