import { failure, HttpError, json } from "@/lib/server/http";
import { serviceClient } from "@/lib/server/supabase";
import { verifyDeliverySignature } from "@/lib/webhook-signature.mjs";
import { rpcValue } from "@/lib/server/staff";

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_WEBHOOK_SECRET) throw new HttpError(503, "Delivery events are not configured.");
    if (!request.body || Number(request.headers.get("content-length")) > 32000) throw new HttpError(413, "Event exceeds the request limit.");
    const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
    try { for (;;) { const { done, value } = await reader.read(); if (done) break; bytes += value.length; if (bytes > 32000) { await reader.cancel(); throw new HttpError(413, "Event exceeds the request limit."); } chunks.push(value); } } finally { reader.releaseLock(); }
    const raw = Buffer.concat(chunks);
    if (!verifyDeliverySignature(raw, request.headers, process.env.RESEND_WEBHOOK_SECRET)) throw new HttpError(400, "Invalid delivery signature.");
    let event;
    try { event = JSON.parse(raw.toString("utf8")); } catch { throw new HttpError(400, "Invalid delivery event."); }
    const accepted = ["email.delivered", "email.bounced", "email.complained", "email.failed", "email.delivery_delayed"];
    if (!accepted.includes(event?.type)) return json({ received: true, ignored: true }, 202);
    const recipients = event.data?.to;
    if (!Array.isArray(recipients) || recipients.length < 1 || recipients.length > 100 || recipients.some(address => typeof address !== "string" || address.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) || typeof event.data?.email_id !== "string" || event.data.email_id.length > 200) throw new HttpError(400, "Invalid delivery event.");
    const result = rpcValue(await serviceClient().rpc("record_email_delivery", { event_key: request.headers.get("svix-id"), message_id: event.data.email_id, event_name: event.type, recipients }));
    return json({ received: true, duplicate: result === false });
  } catch (error) { return failure(error); }
}
