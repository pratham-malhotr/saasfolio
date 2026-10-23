"use client";

import { offerLabel } from "@/lib/offer-links";
import { OfferAction } from "@/components/deals/OfferAction";
import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronUp,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
  Send,
} from "lucide-react";
import {
  DetailedCommunityThread,
  ThreadComment,
} from "@/lib/data/community-data";
import { DEALS_DATA } from "@/lib/data/deals-data";
import { SaaSDeal } from "@/lib/types";
import { CouponRevealModal } from "@/components/modals/CouponRevealModal";

interface CommunityThreadClientProps {
  thread: DetailedCommunityThread;
  toolLinks?: Record<string, string>;
}

export function CommunityThreadClient({ thread, toolLinks }: CommunityThreadClientProps) {
  const [upvotes, setUpvotes] = useState(thread.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [comments, setComments] = useState<ThreadComment[]>(thread.comments);
  const [replyText, setReplyText] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<SaaSDeal | null>(null);
  const [commentUpvotes, setCommentUpvotes] = useState<Record<string, boolean>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [nestedReplyText, setNestedReplyText] = useState("");

  // Load persisted upvote and user comments for this thread
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const storedUpvotes = localStorage.getItem("saasfolio_community_upvotes");
        if (storedUpvotes) {
          const parsed = JSON.parse(storedUpvotes);
          if (parsed[thread.id]) {
            setHasUpvoted(true);
            setUpvotes(thread.upvotes + 1);
          }
        }
        const storedCommentUpvotes = localStorage.getItem("saasfolio_comment_upvotes");
        if (storedCommentUpvotes) {
          setCommentUpvotes(JSON.parse(storedCommentUpvotes));
        }
        const threadComments = localStorage.getItem(`saasfolio_thread_comments_${thread.id}`);
        if (threadComments) {
          const parsedComments = JSON.parse(threadComments);
          // Merge without duplicating
          const existingIds = new Set(thread.comments.map((c) => c.id));
          const customAdded = parsedComments.filter((c: ThreadComment) => !existingIds.has(c.id));
          setComments([...thread.comments, ...customAdded]);
        }
      } catch {}
    });
    return () => cancelAnimationFrame(frame);
  }, [thread.id, thread.comments, thread.upvotes]);

  const toggleCommentUpvote = (commentId: string) => {
    const isUpvoted = !!commentUpvotes[commentId];
    const newMap = { ...commentUpvotes, [commentId]: !isUpvoted };
    setCommentUpvotes(newMap);
    try {
      localStorage.setItem("saasfolio_comment_upvotes", JSON.stringify(newMap));
    } catch {}

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, upvotes: isUpvoted ? c.upvotes - 1 : c.upvotes + 1 }
          : c
      )
    );
  };

  const handlePostNestedReply = (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!nestedReplyText.trim()) return;

    const newReply: ThreadComment = {
      id: `rep-${Date.now()}`,
      author: {
        username: "current_user",
        avatarLetter: "Y",
        badge: "MEMBER",
        reputation: 500,
      },
      content: nestedReplyText.trim(),
      createdAt: "Just now",
      upvotes: 1,
    };

    const updated = comments.map((c) =>
      c.id === commentId
        ? { ...c, replies: [...(c.replies || []), newReply] }
        : c
    );

    setComments(updated);
    setNestedReplyText("");
    setActiveReplyId(null);

    try {
      localStorage.setItem(`saasfolio_thread_comments_${thread.id}`, JSON.stringify(updated));
    } catch {}
  };

  const toggleUpvote = () => {
    const nextState = !hasUpvoted;
    setHasUpvoted(nextState);
    setUpvotes((prev) => (nextState ? prev + 1 : prev - 1));

    try {
      const storedUpvotes = localStorage.getItem("saasfolio_community_upvotes");
      const map = storedUpvotes ? JSON.parse(storedUpvotes) : {};
      map[thread.id] = nextState;
      localStorage.setItem("saasfolio_community_upvotes", JSON.stringify(map));
    } catch {}
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newComment: ThreadComment = {
      id: `c-${Date.now()}`,
      author: {
        username: "current_user",
        avatarLetter: "Y",
        badge: "MEMBER",
        reputation: 500,
      },
      content: replyText.trim(),
      createdAt: "Just now",
      upvotes: 1,
    };

    const updated = [...comments, newComment];
    setComments(updated);
    setReplyText("");

    try {
      const stored = localStorage.getItem(`saasfolio_thread_comments_${thread.id}`);
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem(`saasfolio_thread_comments_${thread.id}`, JSON.stringify([...list, newComment]));
    } catch {}
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Find deals related to the tool tags mentioned in this thread
  const relatedDeals = DEALS_DATA.filter((d: SaaSDeal) =>
    thread.toolTags.some(
      (t) =>
        d.toolSlug.toLowerCase().includes(t.slug) ||
        t.slug.includes(d.toolSlug.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-8">
          <Link href="/" className="hover:text-[#C6FF3D] transition-colors">
            HOME
          </Link>
          <span>/</span>
          <Link href="/community" className="hover:text-[#C6FF3D] transition-colors">
            COMMUNITY
          </Link>
          <span>/</span>
          <span className="text-zinc-500 truncate max-w-sm">{thread.title}</span>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Discussion Thread (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Thread Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#09090C] border border-white/10 relative">
              {/* Header meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#C6FF3D]/10 text-[#C6FF3D] font-bold border border-[#C6FF3D]/20">
                    {thread.category}
                  </span>
                  <span className="text-zinc-600">✦</span>
                  <span className="text-zinc-400">{thread.createdAt}</span>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#C6FF3D]" />
                      <span className="text-[#C6FF3D]">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title */}
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white mb-6 leading-tight">
                {thread.title}
              </h1>

              {/* Author Bar */}
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C6FF3D] to-[#80B814] flex items-center justify-center font-display font-black text-black text-base shrink-0">
                  {thread.author.avatarLetter}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">
                      {thread.author.name}
                    </span>
                    <span className="text-zinc-500 font-mono text-xs">
                      @{thread.author.username}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#C6FF3D]/10 text-[#C6FF3D] text-[10px] font-mono font-bold">
                      {thread.author.badge}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-400">
                    Reputation: {thread.author.reputation} pts
                  </div>
                </div>
              </div>

              {/* Post Body */}
              <div className="text-zinc-300 text-sm sm:text-base leading-relaxed space-y-4 mb-8">
                {thread.content.split("\n\n").map((para, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Tool Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="font-mono text-xs text-zinc-500 mr-1">
                  Mentioned Tools:
                </span>
                {thread.toolTags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={toolLinks?.[tag.slug] || "/tools"}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-[#C6FF3D]/10 text-zinc-300 hover:text-[#C6FF3D] border border-white/10 hover:border-[#C6FF3D]/40 font-mono text-xs transition-colors flex items-center gap-1"
                  >
                    <span>#{tag.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-60" />
                  </Link>
                ))}
              </div>

              {/* Action Bar (Upvote button + comment counter) */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={toggleUpvote}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
                    hasUpvoted
                      ? "bg-[#C6FF3D] text-black shadow-[0_0_15px_rgba(198,255,61,0.3)]"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>▲ Upvote ({upvotes})</span>
                </button>

                <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{comments.length} replies</span>
                  <span>✦</span>
                  <span>{thread.viewsCount} views</span>
                </div>
              </div>
            </div>

            {/* Replies & Comments Section */}
            <div className="space-y-6">
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#C6FF3D]" />
                Discussion Thread ({comments.length})
              </h3>

              {/* Reply Input Form */}
              <form onSubmit={handlePostReply} className="p-6 rounded-2xl bg-[#09090C] border border-white/10">
                <label className="block text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wider">
                  Add Your Perspective or Benchmark Data
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Share real production insights, latency numbers, or ask a follow-up question..."
                  rows={4}
                  className="w-full p-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-sm resize-none mb-3"
                />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-500">
                    Markdown supported • Keep it constructive & verified
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Post Reply
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-6 rounded-2xl bg-[#09090C] border border-white/5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-display font-bold text-white text-xs">
                          {comment.author.avatarLetter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-xs text-white">
                              @{comment.author.username}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#C6FF3D]/10 text-[#C6FF3D] text-[9px] font-mono font-bold">
                              {comment.author.badge}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-zinc-500">
                            Reputation: {comment.author.reputation} pts
                          </span>
                        </div>
                      </div>

                      <span className="font-mono text-[11px] text-zinc-500">
                        {comment.createdAt}
                      </span>
                    </div>

                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4 pt-2 border-t border-white/5 font-mono text-xs">
                      <button
                        onClick={() => toggleCommentUpvote(comment.id)}
                        className={`flex items-center gap-1 transition-colors px-2.5 py-1 rounded-md ${
                          commentUpvotes[comment.id]
                            ? "bg-[#C6FF3D]/10 text-[#C6FF3D] font-bold border border-[#C6FF3D]/30"
                            : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>▲ {comment.upvotes}</span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveReplyId(
                            activeReplyId === comment.id ? null : comment.id
                          )
                        }
                        className="text-zinc-400 hover:text-[#C6FF3D] transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{activeReplyId === comment.id ? "Cancel" : "Reply"}</span>
                      </button>
                    </div>

                    {/* Inline Reply Form */}
                    {activeReplyId === comment.id && (
                      <form
                        onSubmit={(e) => handlePostNestedReply(comment.id, e)}
                        className="p-4 rounded-xl bg-black/60 border border-[#C6FF3D]/30 animate-in fade-in"
                      >
                        <textarea
                          value={nestedReplyText}
                          onChange={(e) => setNestedReplyText(e.target.value)}
                          placeholder={`Reply directly to @${comment.author.username}...`}
                          rows={2}
                          className="w-full p-3 rounded-lg bg-black border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-xs resize-none mb-2"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveReplyId(null)}
                            className="px-3 py-1 rounded-lg text-zinc-400 hover:text-white text-xs font-mono"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase hover:bg-[#D6FF66] transition-colors"
                          >
                            Send Reply
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5 pl-4 sm:pl-6 space-y-3 border-l-2 border-white/10">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="space-y-1.5">
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <span className="font-bold text-white">
                                @{reply.author.username}
                              </span>
                              <span className="px-1 py-0.2 rounded bg-white/5 text-[#C6FF3D] text-[9px]">
                                {reply.author.badge}
                              </span>
                              <span className="text-zinc-600">✦</span>
                              <span className="text-zinc-500">{reply.createdAt}</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Mentioned Tools & Active Deals */}
            {relatedDeals.length > 0 && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F140A] to-[#090C06] border border-[#C6FF3D]/30 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#C6FF3D]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
                    OPTIONS FOR MENTIONED TOOLS
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mb-4">
                  Review the offer type and provider terms for software referenced in this discussion:
                </p>

                <div className="space-y-3">
                  {relatedDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-4 rounded-xl bg-black/60 border border-white/10 hover:border-[#C6FF3D]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-display font-bold text-sm text-white">
                          {deal.toolName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#C6FF3D] text-black font-mono text-[10px] font-bold">
                          {offerLabel(deal)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mb-3">
                        {deal.title}
                      </p>
                      <OfferAction deal={deal} onReveal={setSelectedDeal} className="w-full py-2 rounded-lg bg-[#C6FF3D]/10 hover:bg-[#C6FF3D] text-[#C6FF3D] hover:text-black font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Guidelines Card */}
            <div className="p-6 rounded-2xl bg-[#09090C] border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[#C6FF3D]" />
                <span className="font-mono text-xs uppercase tracking-widest text-white font-bold">
                  COMMUNITY GUIDELINES
                </span>
              </div>
              <ul className="space-y-2.5 font-mono text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-[#C6FF3D]">1.</span>
                  <span>Zero tolerance for sponsored spam or astroturfed reviews.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C6FF3D]">2.</span>
                  <span>Back up architecture opinions with latency or cost numbers when possible.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C6FF3D]">3.</span>
                  <span>Disclose any personal affiliations with tools discussed.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Reveal Modal */}
      {selectedDeal && (
        <CouponRevealModal
          deal={selectedDeal}
          isOpen={!!selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
