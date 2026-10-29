import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server/supabase";
import { absoluteUrl } from "@/lib/seo";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  let status = "expired";
  if (/^[0-9a-f]{64}$/.test(token)) {
    try {
      const service = serviceClient();
      const hash = createHash("sha256").update(token).digest("hex");
      const { data, error } = await service.from("newsletter_subscribers").update({
        status: "active", confirmed_at: new Date().toISOString(), confirmation_hash: null,
      }).eq("confirmation_hash", hash).eq("status", "pending").eq("delivery_suppressed", false).gt("confirmation_expires_at", new Date().toISOString()).select("id").maybeSingle();
      if (!error && data) status = "confirmed";
    } catch { status = "unavailable"; }
  }
  return NextResponse.redirect(absoluteUrl(`/newsletter?status=${status}`), { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
