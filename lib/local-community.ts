import type { DetailedCommunityThread } from "@/lib/data/community-data";

// Local drafts are browser previews, not authenticated community publications.
export function parseLocalThreads(serialized: string | null): DetailedCommunityThread[] {
  try {
    const values: unknown = JSON.parse(serialized || "[]");
    if (!Array.isArray(values)) return [];
    return values.slice(0, 100).flatMap((value: unknown) => {
      if (!value || typeof value !== "object") return [];
      const row = value as Record<string, unknown>;
      if (typeof row.id !== "string" || !row.id.startsWith("disc-") || typeof row.slug !== "string" || !/^[a-z0-9-]{1,200}$/.test(row.slug) || typeof row.title !== "string" || typeof row.content !== "string") return [];
      return [{ id: row.id.slice(0, 100), slug: row.slug, title: row.title.slice(0, 300), content: row.content.slice(0, 10000), category: "SaaS Economics" as const,
        author: { username: "local_draft", name: "Your local draft", avatarLetter: "L", badge: "LOCAL DRAFT" as const, reputation: 0 },
        upvotes: 0, commentCount: 0, viewsCount: 0, createdAt: "Saved in this browser", toolTags: [], comments: [],
      }];
    });
  } catch { return []; }
}
