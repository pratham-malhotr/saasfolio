import { failure, HttpError, json, readBody, text } from "@/lib/server/http";
import { authClient, isSupabaseConfigured, publicUser, requireUser } from "@/lib/server/supabase";
import { getDealBySlug } from "@/lib/data/deals-data";
import { getArticleBySlug } from "@/lib/data/articles-data";
import { getLocalSavedItems, toggleLocalSavedItem, updateLocalUser } from "@/lib/server/local-auth";

export async function GET() {
  try {
    const user = await requireUser();
    let rawSaved: Array<{ kind: "deal" | "article"; slug: string; created_at: string }> = [];

    if (isSupabaseConfigured()) {
      const client = await authClient();
      const { data, error } = await client
        .from("saved_items")
        .select("kind,slug,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw new HttpError(503, "Your saved items could not be loaded.");
      rawSaved = data;
    } else {
      rawSaved = getLocalSavedItems(user.id);
    }

    const saved = rawSaved.map(item => {
      const entry = item.kind === "deal" ? getDealBySlug(item.slug) : getArticleBySlug(item.slug);
      return {
        ...item,
        title: entry?.title || "This item is no longer available",
        href: entry ? `/${item.kind === "deal" ? "deals" : "articles"}/${entry.slug}` : null,
      };
    });

    return json({ user: publicUser(user), saved, bio: String(user.user_metadata?.bio || "") });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = await readBody(request);
    const user = await requireUser();
    const kind = text(data, "kind", 1, 10);
    const slug = text(data, "slug", 1, 200);
    if (!["deal", "article"].includes(kind)) throw new HttpError(400, "Choose a valid item type.");
    const exists = kind === "deal" ? getDealBySlug(slug) : getArticleBySlug(slug);
    if (data.saved !== false && !exists) throw new HttpError(404, "This item is no longer available.");

    if (isSupabaseConfigured()) {
      const client = await authClient();
      const query = data.saved === false
        ? client.from("saved_items").delete().eq("user_id", user.id).eq("kind", kind).eq("slug", slug)
        : client.from("saved_items").upsert({ user_id: user.id, kind, slug }, { onConflict: "user_id,kind,slug" });
      const { error } = await query;
      if (error) throw new HttpError(503, "Your saved items could not be updated.");
    } else {
      toggleLocalSavedItem(user.id, kind as "deal" | "article", slug, data.saved !== false);
    }

    return json({ saved: data.saved !== false });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await readBody(request);
    const user = await requireUser();
    const name = text(data, "name", 2, 100);
    const bio = text(data, "bio", 0, 1000);

    if (isSupabaseConfigured()) {
      const client = await authClient();
      const { error } = await client.auth.updateUser({ data: { name, bio } });
      if (error) throw new HttpError(503, "Your profile could not be saved.");
    } else {
      updateLocalUser(user.id, { name, bio });
    }

    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
