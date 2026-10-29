import { createHash } from "node:crypto";
import { failure, HttpError, json, readBody, text } from "@/lib/server/http";
import { serviceClient } from "@/lib/server/supabase";

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const token = text(body, "token", 64, 64);
    if (!/^[0-9a-f]{64}$/.test(token)) throw new HttpError(400, "This unsubscribe link is invalid.");
    const service = serviceClient();
    const { data, error } = await service.from("newsletter_subscribers").update({ status: "unsubscribed", confirmation_hash: null, updated_at: new Date().toISOString() })
      .eq("unsubscribe_hash", createHash("sha256").update(token).digest("hex")).select("id").maybeSingle();
    if (error) throw new HttpError(503, "We couldn’t update your subscription. Please try again later.");
    if (!data) throw new HttpError(400, "This link is invalid or has been replaced by a newer signup.");
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
