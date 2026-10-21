"use client";
import { useDialog } from "@/components/modals/useDialog";

import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import { DetailedCommunityThread } from "@/lib/data/community-data";

interface NewDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newThread: DetailedCommunityThread) => void;
}

export function NewDiscussionModal({
  isOpen,
  onClose,
  onSubmit,
}: NewDiscussionModalProps) {
  const dialogRef = useDialog(isOpen, onClose);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<
    "Dev Tools" | "SaaS Economics" | "Analytics" | "AI Tools" | "Growth & Marketing"
  >("Dev Tools");
  const [toolTags, setToolTags] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please fill out both the title and discussion content.");
      return;
    }

    const tagsArray = toolTags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean)
      .map((t) => ({
        name: t,
        slug: t.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }));

    const thread: DetailedCommunityThread = {
      id: `disc-${Date.now()}`,
      title: title.trim(),
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      category,
      content: content.trim(),
      author: {
        username: "current_user",
        name: "You (local draft)",
        avatarLetter: "Y",
        badge: "LOCAL DRAFT",
        reputation: 0,
      },
      upvotes: 1,
      commentCount: 0,
      viewsCount: 1,
      createdAt: "Just now",
      toolTags: tagsArray.length > 0 ? tagsArray : [{ name: "SaaS", slug: "tools" }],
      hot: true,
      comments: [],
    };

    onSubmit(thread);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Create a local discussion draft" tabIndex={-1} className="relative w-full max-w-xl rounded-3xl bg-[#0B0B0E] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close discussion draft"
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2 font-mono text-xs text-[#C6FF3D] uppercase font-bold">
          <MessageSquare className="w-3.5 h-3.5" /> Create a discussion draft
        </div>
        <h3 className="font-display font-bold text-2xl text-white mb-2">
          Ask Founders & Engineers
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm mb-6">
          Draft a discussion on this device. It will not be published to other visitors.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Discussion Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Has anyone tested EdgeBase vs Neon Postgres under high concurrent writes?"
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DetailedCommunityThread["category"])}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
              >
                <option value="Dev Tools">Dev Tools</option>
                <option value="SaaS Economics">SaaS Economics</option>
                <option value="Analytics">Analytics</option>
                <option value="AI Tools">AI Tools</option>
                <option value="Growth & Marketing">Growth & Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Tool Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={toolTags}
                onChange={(e) => setToolTags(e.target.value)}
                placeholder="e.g. EdgeBase, Neon, Postgres"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Discussion Body *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide background, benchmarks, or specific questions..."
              rows={5}
              className="w-full p-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-sans text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white font-mono text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all shadow-[0_0_15px_rgba(198,255,61,0.2)]"
            >
              Publish Thread
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
