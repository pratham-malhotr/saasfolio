import { NextResponse } from "next/server";
import { failure, HttpError } from "@/lib/server/http";
import { authClient, enforceLimit, isSupabaseConfigured, publicUser, requireUser, serviceClient } from "@/lib/server/supabase";
import { getLocalSavedItems } from "@/lib/server/local-auth";
import { randomUUID } from "node:crypto";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    if (isSupabaseConfigured() && (!user.email_confirmed_at || !user.email)) throw new HttpError(403, "Confirm your account email before exporting linked records.");
    await enforceLimit(request, `account-export:${user.id}`, 3, 3600);
    const saved: unknown[] = []; const inquiries: unknown[] = [];
    let newsletter: unknown = null;
    if (isSupabaseConfigured()) {
      const client = await authClient(); const service = serviceClient();
      for (const [target, table, columns, filter, value, db] of [
        [saved, "saved_items", "kind,slug,created_at", "user_id", user.id, client],
        [inquiries, "inquiries", "kind,payload,status,created_at", "email", user.email || "", service],
      ] as const) {
        for (let offset = 0; ; offset += 100) {
          if (offset >= 10000) throw new HttpError(413, "This export requires support assistance because of its size. No partial export was created.");
          const result = await db.from(table).select(columns).eq(filter, value).order("created_at").range(offset, offset + 99);
          if (result.error) throw new HttpError(503, "Your complete export could not be prepared. Please try again.");
          const rows = result.data || []; target.push(...rows);
          if (JSON.stringify([saved, inquiries]).length > 5000000) throw new HttpError(413, "This export requires support assistance because of its size. No partial export was created.");
          if (rows.length < 100) break;
        }
      }
      const result = await service.from("newsletter_subscribers").select("status,created_at,confirmed_at,consent_version,delivery_suppressed").eq("email", user.email || "").maybeSingle();
      if (result.error) throw new HttpError(503, "Your complete export could not be prepared. Please try again.");
      newsletter = result.data;
    } else saved.push(...getLocalSavedItems(user.id));
    const identity = publicUser(user);
    return NextResponse.json({ formatVersion: 1, exportedAt: new Date().toISOString(), account: { id: user.id, email: identity.email, name: identity.name, bio: String(user.user_metadata?.bio || ""), createdAt: user.created_at }, savedItems: saved, submissions: inquiries, newsletter }, {
      headers: { "Content-Disposition": `attachment; filename="saasfolio-account-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "X-Request-ID": randomUUID() },
    });
  } catch (error) { return failure(error); }
}
