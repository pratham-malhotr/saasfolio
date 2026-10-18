"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Bookmark,
  ChevronUp,
  Clock,
  Sparkles,
  ArrowRight,
  Settings,
  LogOut,
  Send,
  ShieldCheck,
  Check,
  Tag,
  BookOpen,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { DETAILED_ARTICLES, DetailedArticle } from "@/lib/data/articles-data";
import { DEALS_DATA } from "@/lib/data/deals-data";
import { DETAILED_THREADS, DetailedCommunityThread } from "@/lib/data/community-data";
import { SaaSDeal } from "@/lib/types";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarLetter: string;
  badge: string;
  role: string;
  reputation: number;
  joinedDate: string;
  bio: string;
}

export function ProfileDashboardClient({ targetUsername }: { targetUsername?: string }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"saved" | "activity" | "submissions" | "settings">("saved");
  const [savedArticles, setSavedArticles] = useState<DetailedArticle[]>([]);
  const [upvotedThreads, setUpvotedThreads] = useState<DetailedCommunityThread[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    role: "",
    bio: "",
    weeklyDigest: true,
    dealAlerts: true,
  });
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  useEffect(() => {
    // Load current user from localStorage or provide demo default
    try {
      const stored = localStorage.getItem("saasfolio_current_user");
      let user: UserProfile;
      if (stored) {
        user = JSON.parse(stored);
      } else {
        // Fallback default demo profile
        user = {
          id: "usr_demo",
          username: targetUsername || "alex_chen_dev",
          name: "Alex Chen",
          email: "alex@syntaxflow.dev",
          avatarLetter: "A",
          badge: "PRO FOUNDER",
          role: "Full-Stack SaaS Architect",
          reputation: 640,
          joinedDate: "October 2026",
          bio: "Building developer tooling and high-concurrency event pipelines. Power user of EdgeBase & DeployJet.",
        };
      }
      setCurrentUser(user);
      setSettingsForm({
        name: user.name,
        role: user.role,
        bio: user.bio,
        weeklyDigest: true,
        dealAlerts: true,
      });

      // Load saved bookmarks
      const bookmarked = DETAILED_ARTICLES.filter((art) => {
        return localStorage.getItem(`saasfolio_bookmark_${art.slug}`) === "true";
      });
      // If none bookmarked yet, show the first 2 guides as recommended items
      setSavedArticles(bookmarked.length > 0 ? bookmarked : DETAILED_ARTICLES.slice(0, 2));

      // Load upvoted community threads
      const storedUpvotes = localStorage.getItem("saasfolio_community_upvotes");
      if (storedUpvotes) {
        const upvoteMap = JSON.parse(storedUpvotes);
        const upvoted = DETAILED_THREADS.filter((t) => upvoteMap[t.id]);
        setUpvotedThreads(upvoted.length > 0 ? upvoted : DETAILED_THREADS.slice(0, 2));
      } else {
        setUpvotedThreads(DETAILED_THREADS.slice(0, 2));
      }

      // Load user submissions from localStorage
      const storedSubmissions = localStorage.getItem("saasfolio_submissions");
      if (storedSubmissions) {
        setUserSubmissions(JSON.parse(storedSubmissions));
      } else {
        // Provide mock initial submitted item
        setUserSubmissions([
          {
            id: "sub-seed-1",
            toolName: "EdgeBase Cloud",
            dealType: "Lifetime Deal (LTD)",
            discountPercentage: 80,
            couponCode: "LIFETIME-FOUNDER",
            status: "APPROVED & LIVE",
            submittedAt: "2 days ago",
            views: 420,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [targetUsername]);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("saasfolio_current_user");
      window.dispatchEvent(new Event("saasfolio_auth_changed"));
    } catch (e) {}
    router.push("/login");
  };

  const handleRemoveBookmark = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.removeItem(`saasfolio_bookmark_${slug}`);
      setSavedArticles((prev) => prev.filter((a) => a.slug !== slug));
    } catch (e) {}
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser: UserProfile = {
      ...currentUser,
      name: settingsForm.name,
      role: settingsForm.role,
      bio: settingsForm.bio,
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem("saasfolio_current_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("saasfolio_auth_changed"));
    } catch (e) {}

    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2500);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-mono text-xs">
        Loading member passport...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Profile Header Hero */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0C0F08] via-[#09090C] to-[#0A0A0E] border border-white/10 relative overflow-hidden mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6FF3D]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#C6FF3D] to-[#7EA81C] text-black font-display font-black text-3xl sm:text-4xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(198,255,61,0.25)]">
              {currentUser.avatarLetter}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
                  {currentUser.name}
                </h1>
                <span className="font-mono text-xs text-zinc-400">
                  @{currentUser.username}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#C6FF3D]/15 text-[#C6FF3D] border border-[#C6FF3D]/30 font-mono text-[10px] font-bold">
                  {currentUser.badge}
                </span>
              </div>

              <div className="font-mono text-xs text-zinc-400 mb-2">
                {currentUser.role} • Member since {currentUser.joinedDate}
              </div>

              <p className="text-zinc-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                {currentUser.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 w-full md:w-auto">
            {/* Reputation score pill */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center">
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-0.5">
                REPUTATION SCORE
              </span>
              <span className="font-display font-black text-2xl text-[#C6FF3D]">
                {currentUser.reputation} <span className="text-xs text-white font-mono">PTS</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/submit"
                className="flex-1 px-4 py-2 rounded-xl bg-[#C6FF3D] hover:bg-[#D6FF66] text-black font-display font-bold text-xs uppercase tracking-wider text-center transition-all shadow-[0_0_15px_rgba(198,255,61,0.2)]"
              >
                + Submit Deal
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 transition-colors text-xs font-mono flex items-center gap-1.5"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === "saved"
              ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_15px_rgba(198,255,61,0.25)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Articles & Guides ({savedArticles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === "activity"
              ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_15px_rgba(198,255,61,0.25)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span>Supported Discussions ({upvotedThreads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === "submissions"
              ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_15px_rgba(198,255,61,0.25)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Vendor Submissions ({userSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === "settings"
              ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_15px_rgba(198,255,61,0.25)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Passport Settings</span>
        </button>
      </div>

      {/* Tab 1: Saved Articles & Guides */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C6FF3D]" />
              Bookmarked Architectural Guides
            </h3>
            <span className="font-mono text-xs text-zinc-500">
              Persisted in local browser passport
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedArticles.map((article) => (
              <div
                key={article.id}
                className="p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/40 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 font-mono text-xs text-zinc-400">
                    <span className="text-[#C6FF3D] font-bold">{article.category}</span>
                    <button
                      onClick={(e) => handleRemoveBookmark(article.slug, e)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors text-[11px]"
                      title="Remove bookmark"
                    >
                      Remove
                    </button>
                  </div>

                  <Link href={`/articles/${article.slug}`}>
                    <h4 className="font-display font-bold text-lg text-white group-hover:text-[#C6FF3D] transition-colors mb-2 leading-snug">
                      {article.title}
                    </h4>
                  </Link>

                  <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 font-mono text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {article.readTime}
                  </span>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="text-[#C6FF3D] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Read Guide <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Top Saved Deals shelf */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <h4 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C6FF3D]" />
              Recommended Verified Founder Deals
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEALS_DATA.slice(0, 3).map((deal: SaaSDeal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.slug}`}
                  className="p-5 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/40 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-zinc-400">{deal.toolName}</span>
                      <span className="px-2 py-0.5 rounded bg-[#C6FF3D]/10 text-[#C6FF3D] font-mono text-xs font-bold">
                        {deal.discountPercentage}% OFF
                      </span>
                    </div>
                    <div className="font-display font-bold text-sm text-white group-hover:text-[#C6FF3D] transition-colors mb-2">
                      {deal.title}
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span>Code: <span className="text-white font-bold">{deal.code || "AUTO-APPLIED"}</span></span>
                    <span className="text-[#C6FF3D]">View Deal →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Activity & Upvotes */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#C6FF3D]" />
              Discussions Supported
            </h3>
            <span className="font-mono text-xs text-zinc-500">
              {upvotedThreads.length} threads upvoted
            </span>
          </div>

          <div className="space-y-4">
            {upvotedThreads.map((thread) => (
              <Link
                key={thread.id}
                href={`/community/${thread.slug}`}
                className="p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/40 transition-all block group"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-[#C6FF3D] transition-colors leading-snug">
                    {thread.title}
                  </h4>
                  <span className="px-3 py-1 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] font-mono text-xs font-bold shrink-0">
                    ▲ {thread.upvotes}
                  </span>
                </div>

                <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 mb-4">
                  {thread.content}
                </p>

                <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-500">
                  <span>Category: {thread.category}</span>
                  <span>✦</span>
                  <span>{thread.commentCount} replies</span>
                  <span>✦</span>
                  <span>By @{thread.author.username}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Vendor Submissions */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-[#C6FF3D]" />
              My Submitted Deals & Tools
            </h3>
            <Link
              href="/submit"
              className="px-4 py-2 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-colors"
            >
              + Submit Another
            </Link>
          </div>

          <div className="space-y-4">
            {userSubmissions.map((sub, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#09090C] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 className="font-display font-bold text-base sm:text-lg text-white">
                      {sub.toolName}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                      {sub.status || "APPROVED & LIVE"}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-zinc-400">
                    {sub.dealType} • {sub.discountPercentage}% Discount • Code:{" "}
                    <span className="text-[#C6FF3D] font-bold">{sub.couponCode}</span>
                  </div>
                </div>

                <div className="font-mono text-xs text-zinc-500 text-right">
                  <div>Submitted: {sub.submittedAt || "Recently"}</div>
                  <div className="text-[#C6FF3D]">Tracking ID: #{sub.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Settings */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="p-8 rounded-2xl bg-[#09090C] border border-white/10 max-w-2xl space-y-6">
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#C6FF3D]" />
            Passport Information & Alert Preferences
          </h3>

          {savedSettingsNotice && (
            <div className="p-3 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] font-mono text-xs flex items-center gap-2">
              <Check className="w-4 h-4" /> Changes successfully saved to your member profile.
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              value={settingsForm.name}
              onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Engineering Role / Title
            </label>
            <input
              type="text"
              value={settingsForm.role}
              onChange={(e) => setSettingsForm({ ...settingsForm, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Bio / Focus
            </label>
            <textarea
              rows={3}
              value={settingsForm.bio}
              onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
              className="w-full p-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-xs resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <span className="font-mono text-xs uppercase text-zinc-400 block mb-2 font-bold">
              Email Notifications & Intelligence
            </span>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.weeklyDigest}
                onChange={(e) => setSettingsForm({ ...settingsForm, weeklyDigest: e.target.checked })}
                className="w-4 h-4 accent-[#C6FF3D]"
              />
              <span className="text-zinc-300 text-xs">
                Weekly SaaS Deals Digest (Curated LTDs, price cuts, and architectural teardowns)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.dealAlerts}
                onChange={(e) => setSettingsForm({ ...settingsForm, dealAlerts: e.target.checked })}
                className="w-4 h-4 accent-[#C6FF3D]"
              />
              <span className="text-zinc-300 text-xs">
                Instant alerts when tools on my watchlist drop new discounts
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-colors"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
