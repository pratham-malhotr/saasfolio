import { createHash, randomBytes } from "node:crypto";
import { email, failure, HttpError, json, readBody } from "@/lib/server/http";
import { enforceLimit, serviceClient } from "@/lib/server/supabase";
import { absoluteUrl } from "@/lib/seo";

export async function POST(request: Request) {
  try {
    const data = await readBody(request);
    const address = email(data);
    if (data.consent !== true) throw new HttpError(400, "Please agree to receive the newsletter.");
    if (data.companyWebsite) throw new HttpError(400, "Please try again.");
    if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_FROM_EMAIL || process.env.RESEND_API_KEY.includes("your_api_key")) {
      throw new HttpError(503, "Newsletter signup is temporarily unavailable. Please try again later.");
    }
    await enforceLimit(request, "newsletter", 3);
    const service = serviceClient();
    const { data: existing, error: readError } = await service.from("newsletter_subscribers").select("id,status").eq("email", address).maybeSingle();
    if (readError) throw new HttpError(503, "Newsletter signup is temporarily unavailable.");
    const message = "If this address needs confirmation, a signup email has been requested. Check your inbox and spam folder.";
    if (existing?.status === "active") return json({ message });
    const token = randomBytes(32).toString("hex");
    const unsubscribe = randomBytes(32).toString("hex");
    const hash = createHash("sha256").update(token).digest("hex");
    const { error } = await service.from("newsletter_subscribers").upsert({
      email: address, status: "pending", confirmation_hash: hash,
      unsubscribe_hash: createHash("sha256").update(unsubscribe).digest("hex"),
      confirmation_expires_at: new Date(Date.now() + 86400000).toISOString(), consent_version: "2026-10-21",
    }, { onConflict: "email" });
    if (error) throw new HttpError(503, "Your signup could not be saved. Please try again.");
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `newsletter-${hash}` },
      body: JSON.stringify({ from: process.env.NEWSLETTER_FROM_EMAIL, to: [address], subject: "Confirm your SaaSFolio newsletter signup",
        text: `You requested the SaaSFolio newsletter. Confirm within 24 hours by opening this link:\n\n${absoluteUrl(`/newsletter/confirm?token=${token}`)}\n\nIf you did not request this, ignore this email. You will not be subscribed without confirmation.\n\nCancel this signup or unsubscribe:\n${absoluteUrl(`/newsletter/unsubscribe?token=${unsubscribe}`)}`,
      }), signal: AbortSignal.timeout(10000),
    });
    if (!result.ok) throw new HttpError(503, "The confirmation email could not be sent. Please try again later.");
    return json({ message }, 202);
  } catch (error) { return failure(error); }
}
