"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Flame,
  TrendingUp,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  ChevronUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  DETAILED_THREADS,
  DetailedCommunityThread,
} from "@/lib/data/community-data";
import { NewDiscussionModal } from "@/components/modals/NewDiscussionModal";

const CATEGORIES = [
  "All",
  "Dev Tools",
  "SaaS Economics",
  "Analytics",
  "AI Tools",
  "Growth & Marketing",
];

export function CommunityHubClient({ toolLinks }: { toolLinks: Record<string, string> }) {
  const [threads, setThreads] = useState<DetailedCommunityThread[]>(DETAILED_THREADS);
  const [sortTab, setSortTab] = useState<"hot" | "top" | "new">("hot");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  // Load persisted upvotes and locally created threads on mount
  React.useEffect(() => {
    try {
      const storedUpvotes = localStorage.getItem("saasfolio_community_upvotes");
      if (storedUpvotes) {
        setUpvotedIds(JSON.parse(storedUpvotes));
      }
      const storedLocalThreads = localStorage.getItem("saasfolio_local_threads");
      if (storedLocalThreads) {
        const parsed = JSON.parse(storedLocalThreads);
        setThreads((prev) => [...parsed, ...prev.filter((t) => !parsed.some((p: any) => p.id === t.id))]);
      }
    } catch (e) {}
  }, []);

  const toggleUpvote = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isUpvoted = !!upvotedIds[id];
    const newUpvotesMap = { ...upvotedIds, [id]: !isUpvoted };
    setUpvotedIds(newUpvotesMap);

    try {
      localStorage.setItem("saasfolio_community_upvotes", JSON.stringify(newUpvotesMap));
    } catch (e) {}

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            upvotes: isUpvoted ? t.upvotes - 1 : t.upvotes + 1,
          };
        }
        return t;
      })
    );
  };

  const handleCreateThread = (newThread: DetailedCommunityThread) => {
    setThreads([newThread, ...threads]);
    try {
      const stored = localStorage.getItem("saasfolio_local_threads");
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem("saasfolio_local_threads", JSON.stringify([newThread, ...list]));
    } catch (e) {}
  };

  // Filter and sort threads
  const filteredThreads = threads
    .filter((t) => {
      const matchesCategory =
        selectedCategory === "All" || t.category === selectedCategory;
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.toolTags.some((tag) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortTab === "top") return b.upvotes - a.upvotes;
      if (sortTab === "new") return b.id.localeCompare(a.id);
      // "hot"
      return b.upvotes * 2 + b.commentCount * 3 - (a.upvotes * 2 + a.commentCount * 3);
    });

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <p className="mb-6 text-xs text-zinc-400">Community preview: new discussions and votes are stored in this browser. They are not published for other visitors.</p>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO DISCOVERY HOME
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF3D] animate-ping" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
              10,000+ FOUNDERS, ARCHITECTS & DEAL HUNTERS
            </span>
          </div>
          <h1 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-6xl text-white mb-4">
            SAAS COMMUNITY FORUM
          </h1>
          <p className="text-zinc-400 max-w-2xl text-base">
            Crowdsourced tool comparisons, real feedback, and honest architectural debate without vendor censorship or sponsorship.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(198,255,61,0.25)] shrink-0"
        >
          <Plus className="w-4 h-4" /> Start Discussion
        </button>
      </div>

      {/* Filter, Sort & Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-[#09090C] border border-white/10">
        {/* Sort Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/5">
          <button
            onClick={() => setSortTab("hot")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
              sortTab === "hot"
                ? "bg-[#C6FF3D] text-black font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Hot
          </button>
          <button
            onClick={() => setSortTab("top")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
              sortTab === "top"
                ? "bg-[#C6FF3D] text-black font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Top
          </button>
          <button
            onClick={() => setSortTab("new")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
              sortTab === "new"
                ? "bg-[#C6FF3D] text-black font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-white/10 text-[#C6FF3D] font-bold border border-[#C6FF3D]/40"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions or #tag..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
          />
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.map((thread) => {
          const isUpvoted = !!upvotedIds[thread.id];
          return (
            <div
              key={thread.id}
              className="group p-5 sm:p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/40 transition-all flex flex-col sm:flex-row items-start gap-4 sm:gap-6"
            >
              {/* Upvote Column */}
              <button
                onClick={(e) => toggleUpvote(e, thread.id)}
                className={`flex sm:flex-col items-center justify-center gap-1 w-full sm:w-14 py-2 sm:py-3 px-3 rounded-xl border transition-all ${
                  isUpvoted
                    ? "bg-[#C6FF3D] border-[#C6FF3D] text-black font-bold shadow-[0_0_12px_rgba(198,255,61,0.3)]"
                    : "bg-white/[0.03] border-white/10 text-zinc-300 hover:border-[#C6FF3D]/50 hover:text-white"
                }`}
                title="Upvote thread"
              >
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-mono text-xs sm:text-sm font-bold">
                  {thread.upvotes}
                </span>
              </button>

              {/* Main Content Column */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[#C6FF3D] font-bold border border-white/10">
                    {thread.category}
                  </span>
                  <span className="text-zinc-600">✦</span>
                  <span className="text-zinc-300 font-medium">
                    @{thread.author.username}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#C6FF3D]/10 text-[#C6FF3D] text-[10px] font-bold">
                    {thread.author.badge}
                  </span>
                  <span className="text-zinc-600">✦</span>
                  <span className="text-zinc-500">{thread.createdAt}</span>
                </div>

                <Link
                  href={`/community/${thread.slug}`}
                  className="block font-display font-bold text-lg sm:text-xl text-white group-hover:text-[#C6FF3D] transition-colors mb-2 leading-snug"
                >
                  {thread.title}
                </Link>

                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {thread.content}
                </p>

                {/* Footer with Tool Tags and Comments Count */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 font-mono text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {thread.toolTags.map((tag) => (
                      <Link
                        key={tag.slug}
                        href={toolLinks[tag.slug] || "/tools"}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-[#C6FF3D]/10 text-zinc-400 hover:text-[#C6FF3D] border border-white/5 hover:border-[#C6FF3D]/30 transition-all text-[11px]"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-zinc-500">
                    <span>{thread.viewsCount} views</span>
                    <Link
                      href={`/community/${thread.slug}`}
                      className="flex items-center gap-1 text-zinc-300 hover:text-[#C6FF3D] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{thread.commentCount} comments</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredThreads.length === 0 && (
        <div className="py-20 text-center rounded-2xl border border-dashed border-white/10 bg-[#09090C]">
          <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-white mb-1">
            No discussions found
          </h3>
          <p className="text-zinc-500 text-xs font-mono mb-4">
            Be the first to start a conversation in this category!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-colors"
          >
            Start Discussion
          </button>
        </div>
      )}

      {/* New Discussion Modal */}
      <NewDiscussionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateThread}
      />
    </div>
  );
}
