"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, AlertCircle } from "lucide-react";
import { DetailedCommunityThread } from "@/lib/data/community-data";
import { CommunityThreadClient } from "./CommunityThreadClient";

interface CommunityThreadFallbackProps {
  slug: string;
}

export function CommunityThreadFallback({ slug }: CommunityThreadFallbackProps) {
  const [thread, setThread] = useState<DetailedCommunityThread | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("saasfolio_local_threads");
      if (stored) {
        const parsed: DetailedCommunityThread[] = JSON.parse(stored);
        const match = parsed.find(
          (t) =>
            t.slug === slug ||
            t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug
        );
        if (match) {
          setThread(match);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
          <span>Resolving community thread...</span>
        </div>
      </div>
    );
  }

  if (thread) {
    return <CommunityThreadClient thread={thread} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#09090C] border border-white/10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">
          Thread Not Found
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm font-sans mb-6">
          This community thread may have been archived, moved, or deleted by moderation.
        </p>
        <Link
          href="/community"
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_20px_rgba(198,255,61,0.25)]"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Community Forum
        </Link>
      </div>
    </div>
  );
}
