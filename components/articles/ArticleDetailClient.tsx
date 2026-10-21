"use client";

import { SaveItemButton } from "@/components/profile/SaveItemButton";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Copy,
  Check,
  MessageSquare,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  Type,
  ChevronUp,
} from "lucide-react";
import { DetailedArticle, DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { TableOfContents } from "./TableOfContents";
import { DealCallout } from "./DealCallout";
import { ProsConsBox } from "./ProsConsBox";
import { FeatureComparisonTable } from "./FeatureComparisonTable";
import { FaqAccordion } from "./FaqAccordion";

interface ArticleDetailClientProps {
  article: DetailedArticle;
}

interface ArticleComment {
  id: string;
  name: string;
  role: string;
  avatarLetter: string;
  time: string;
  text: string;
  upvotes: number;
}

export function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentUpvotes, setCommentUpvotes] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<ArticleComment[]>([]);

  // Load bookmark, persisted comments, and comment upvotes on mount
  React.useEffect(() => {
    const timer = requestAnimationFrame(() => {
    try {

      const savedComments = localStorage.getItem(`saasfolio_article_comments_${article.slug}`);
      if (savedComments) {
        const parsed: ArticleComment[] = JSON.parse(savedComments);
        setComments((prev) => {
          const ids = new Set(prev.map((c) => c.id));
          const additions = parsed.filter((c) => !ids.has(c.id));
          return [...additions, ...prev];
        });
      }

      const savedUpvotes = localStorage.getItem(`saasfolio_art_comment_upvotes_${article.slug}`);
      if (savedUpvotes) {
        setCommentUpvotes(JSON.parse(savedUpvotes));
      }
    } catch {}    });
    return () => cancelAnimationFrame(timer);
  }, [article.slug]);

  // Cleanup speech synthesis on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudio = () => {
    if (typeof window === "undefined") return;

    if (isPlayingAudio) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const textToSpeak = `${article.title}. An architectural review by ${article.author.name}. ${article.summary}. Key sections include: ${article.sections
          .slice(0, 3)
          .map((s) => s.heading + ". " + s.content.slice(0, 140))
          .join(" ")}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      } else {
        setIsPlayingAudio(true);
        setTimeout(() => setIsPlayingAudio(false), 6000);
      }
    }
  };


  const toggleCommentUpvote = (commentId: string) => {
    const isUpvoted = !!commentUpvotes[commentId];
    const newMap = { ...commentUpvotes, [commentId]: !isUpvoted };
    setCommentUpvotes(newMap);
    try {
      localStorage.setItem(`saasfolio_art_comment_upvotes_${article.slug}`, JSON.stringify(newMap));
    } catch {}

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, upvotes: isUpvoted ? c.upvotes - 1 : c.upvotes + 1 }
          : c
      )
    );
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = commentAuthor.trim() || "Verified Engineer";
    const newComment: ArticleComment = {
      id: `ac-${Date.now()}`,
      name: authorName,
      role: "Community Member",
      avatarLetter: authorName.charAt(0).toUpperCase(),
      time: "Just now",
      text: commentText.trim(),
      upvotes: 1,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentText("");
    setCommentAuthor("");

    try {
      const stored = localStorage.getItem(`saasfolio_article_comments_${article.slug}`);
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem(`saasfolio_article_comments_${article.slug}`, JSON.stringify([newComment, ...list]));
    } catch {}
  };

  // Find related articles
  const relatedArticles = DETAILED_ARTICLES.filter((a) =>
    article.relatedArticlesSlugs.includes(a.slug)
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <ReadingProgressBar />

      {/* Header Container */}
      <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-8">
          <Link href="/" className="hover:text-[#C6FF3D] transition-colors">
            HOME
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-[#C6FF3D] transition-colors">
            ARTICLES
          </Link>
          <span>/</span>
          <span className="text-zinc-500 truncate max-w-xs">{article.title}</span>
        </div>

        {/* Category & Metadata */}
        <div className="flex flex-wrap items-center gap-3 mb-4 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-[#C6FF3D]/10 text-[#C6FF3D] font-bold uppercase tracking-wider border border-[#C6FF3D]/20">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
          <span className="text-zinc-600">✦</span>
          <span className="flex items-center gap-1 text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            Published {article.publishedAt}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="font-display font-black tracking-tight text-3xl sm:text-5xl lg:text-6xl text-white mb-6 leading-[1.1]">
          {article.title}
        </h1>
        <p className="text-lg sm:text-xl text-zinc-300 max-w-4xl leading-relaxed mb-8">
          {article.subtitle}
        </p>

        {/* Author & Share Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C6FF3D] to-[#80B814] flex items-center justify-center font-display font-black text-black text-lg">
              {article.author.avatarLetter}
            </div>
            <div>
              <div className="font-display font-bold text-white text-base">
                {article.author.name}
              </div>
              <div className="font-mono text-xs text-zinc-400">
                {article.author.role}
              </div>
            </div>
          </div>

          {/* Social share & utilities */}
          <div className="flex flex-wrap items-center gap-2">
            <SaveItemButton kind="article" slug={article.slug} />

            <button
              onClick={() => setIsReadingMode(!isReadingMode)}
              className={`p-2.5 rounded-xl border font-mono text-xs transition-colors flex items-center gap-1 ${
                isReadingMode
                  ? "bg-[#C6FF3D]/10 border-[#C6FF3D] text-[#C6FF3D] font-bold"
                  : "bg-[#0F0F12] border-white/10 text-zinc-300 hover:border-white/20 hover:text-white"
              }`}
              title="Toggle reading font size"
            >
              <Type className="w-3.5 h-3.5" />
              <span>{isReadingMode ? "18px" : "15px"}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl bg-[#0F0F12] border border-white/10 hover:border-[#C6FF3D]/40 text-zinc-300 hover:text-[#C6FF3D] transition-colors flex items-center gap-1.5 font-mono text-xs"
              title="Copy share link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C6FF3D]" />
                  <span className="text-[#C6FF3D]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                article.title + " on SaaSFolio"
              )}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-[#0F0F12] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-colors"
              title="Share on X (Twitter)"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-[#0F0F12] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-colors"
              title="Share on LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Audio Overview Player */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#09090C] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleToggleAudio}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isPlayingAudio
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                  : "bg-[#C6FF3D] text-black hover:bg-[#D6FF66] shadow-[0_0_15px_rgba(198,255,61,0.25)]"
              }`}
              title={isPlayingAudio ? "Pause Audio" : "Play Audio Narration"}
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div>
              <div className="font-display font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                <span>Listen to Architectural Deep Dive</span>
                <span className="font-mono text-[10px] text-[#C6FF3D] px-2 py-0.5 rounded bg-[#C6FF3D]/10 border border-[#C6FF3D]/20 uppercase font-bold">
                  AI AUDIO • {article.readTime}
                </span>
              </div>
              <div className="font-mono text-[11px] text-zinc-400">
                {isPlayingAudio
                  ? "Playing synthesized speech narration (Web Speech API)..."
                  : "Generated with SaaSFolio Studio AI Voice Engine"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isPlayingAudio ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C6FF3D]/10 border border-[#C6FF3D]/30">
                <span className="font-mono text-[10px] text-[#C6FF3D] font-bold mr-2">PLAYING</span>
                <span className="w-1 h-3.5 bg-[#C6FF3D] animate-pulse rounded-full" />
                <span className="w-1 h-5 bg-[#C6FF3D] animate-pulse delay-75 rounded-full" />
                <span className="w-1 h-2.5 bg-[#C6FF3D] animate-pulse delay-150 rounded-full" />
                <span className="w-1 h-4 bg-[#C6FF3D] animate-pulse delay-100 rounded-full" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Lossless 48kHz Audio</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout with 2 Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Body Column (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Executive Summary Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 relative">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold block mb-2">
                Executive Takeaway
              </span>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                {article.summary}
              </p>
            </div>

            {/* Render Each Article Section */}
            {article.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4">
                  {section.heading}
                </h2>

                <div
                  className={`prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-4 ${
                    isReadingMode ? "text-base sm:text-lg" : "text-sm sm:text-base"
                  }`}
                >
                  {section.content.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Optional Code Snippet */}
                {section.codeSnippet && (
                  <div className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#09090C]">
                    <div className="px-4 py-2.5 bg-black/60 border-b border-white/5 flex items-center justify-between font-mono text-[11px] text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-[#C6FF3D] font-bold">
                          {section.codeSnippet.language}
                        </span>
                        {section.codeSnippet.caption && (
                          <span className="text-zinc-500">| {section.codeSnippet.caption}</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleCopyCode(section.codeSnippet!.code, section.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors text-xs font-mono"
                      >
                        {copiedSnippetId === section.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#C6FF3D]" />
                            <span className="text-[#C6FF3D] font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono text-zinc-200 overflow-x-auto">
                      <code>{section.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}

                {/* Optional Deal Callout */}
                {section.dealCalloutSlug && (
                  <DealCallout dealSlug={section.dealCalloutSlug} />
                )}
              </section>
            ))}

            {/* Optional Pros & Cons Box */}
            {article.prosCons && (
              <ProsConsBox
                toolName={article.prosCons.toolName}
                pros={article.prosCons.pros}
                cons={article.prosCons.cons}
              />
            )}

            {/* Optional Feature Comparison Table */}
            {article.comparisonTable && (
              <FeatureComparisonTable
                headers={article.comparisonTable.headers}
                rows={article.comparisonTable.rows}
              />
            )}

            {/* Optional FAQ Section */}
            {article.faqs && article.faqs.length > 0 && (
              <div className="pt-8 border-t border-white/10">
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-4">
                  Frequently Asked Questions
                </h3>
                <FaqAccordion faqs={article.faqs} />
              </div>
            )}

            {/* Author Bio Box */}
            <div className="p-8 rounded-2xl bg-[#09090C] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C6FF3D] to-[#80B814] flex items-center justify-center font-display font-black text-black text-2xl shrink-0">
                {article.author.avatarLetter}
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-white mb-1">
                  Written by {article.author.name}
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-3">
                  {article.author.bio}
                </p>
                <div className="flex items-center gap-4 font-mono text-xs text-[#C6FF3D]">
                  {article.author.twitter && (
                    <a
                      href={`https://twitter.com/${article.author.twitter.replace(
                        "@",
                        ""
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {article.author.twitter}
                    </a>
                  )}
                  {article.author.github && (
                    <a
                      href={`https://github.com/${article.author.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      github.com/{article.author.github}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Comments & Discussion */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-4 h-4 text-[#C6FF3D]" />
                <h3 className="font-display font-bold text-xl text-white">
                  Discussion ({comments.length})
                </h3>
              </div>

              {/* Comment submission form */}
              <form onSubmit={handlePostComment} className="mb-10 p-5 rounded-2xl bg-[#09090C] border border-white/10">
                <div className="mb-3">
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Your Name or Handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="e.g. Alex Chen, Backend Engineer"
                    className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Perspective or Architectural Question *
                  </label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment saved in this browser…"
                    rows={3}
                    className="w-full p-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-sm resize-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-500">
                    SaaSFolio verified engineering discussion
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-colors"
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-6 rounded-2xl bg-[#09090C] border border-white/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-display font-bold text-white text-xs">
                          {comment.avatarLetter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-xs text-white">
                              {comment.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#C6FF3D]/10 text-[#C6FF3D] text-[9px] font-mono font-bold">
                              {comment.role}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-zinc-500">
                            Verified Reader
                          </span>
                        </div>
                      </div>

                      <span className="font-mono text-[11px] text-zinc-500">
                        {comment.time}
                      </span>
                    </div>

                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                      {comment.text}
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Table of Contents */}
            <TableOfContents items={article.tableOfContents} />

            {/* Featured Article Tags */}
            <div className="p-6 rounded-2xl bg-[#09090C] border border-white/10">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold block mb-3">
                ARTICLE TAGS
              </span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-zinc-300 hover:border-[#C6FF3D]/40 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold block mb-1">
                  KEEP EXPLORING
                </span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  Related Architecture Analyses
                </h3>
              </div>
              <Link
                href="/articles"
                className="font-mono text-xs text-zinc-400 hover:text-[#C6FF3D] flex items-center gap-1 transition-colors"
              >
                All Articles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/articles/${rel.slug}`}
                  className="p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="font-mono text-xs text-[#C6FF3D] font-bold mb-2">
                      {rel.category}
                    </div>
                    <h4 className="font-display font-bold text-lg text-white group-hover:text-[#C6FF3D] transition-colors mb-2">
                      {rel.title}
                    </h4>
                    <p className="text-zinc-400 text-xs line-clamp-2 mb-4">
                      {rel.summary}
                    </p>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 flex items-center justify-between pt-3 border-t border-white/5">
                    <span>{rel.readTime}</span>
                    <span className="text-[#C6FF3D] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
