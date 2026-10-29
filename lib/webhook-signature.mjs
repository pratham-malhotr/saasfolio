import { createHmac, timingSafeEqual } from "node:crypto";

// Svix's documented symmetric signature format, used by Resend.
// https://www.svix.com/guides/receiving/receive-webhooks-with-svix-cli/
export function verifyDeliverySignature(body, headers, secret, now = Date.now()) {
  if (typeof secret !== "string" || !/^whsec_[A-Za-z0-9+/]+={0,2}$/.test(secret)) return false;
  const key = Buffer.from(secret.slice(6), "base64");
  if (key.length < 24) return false;
  const id = headers.get("svix-id") || "";
  const timestamp = headers.get("svix-timestamp") || "";
  const signatures = headers.get("svix-signature") || "";
  if (!/^[A-Za-z0-9_-]{1,200}$/.test(id) || !/^\d{1,12}$/.test(timestamp) || signatures.length > 2048 || Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.`).update(body).digest();
  return signatures.split(" ").some(part => {
    if (!/^v1,[A-Za-z0-9+/]{43}=$/.test(part)) return false;
    const supplied = Buffer.from(part.slice(3), "base64");
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  });
}
