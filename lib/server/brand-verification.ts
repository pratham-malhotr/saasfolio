import "server-only";
import { createHmac } from "node:crypto";
import { normalizePublicHttpsUrl } from "@/lib/public-url.mjs";
import { isSupabaseConfigured } from "@/lib/server/supabase";

// Light helpers shared by brand intake (no catalog dependency) and listings.

export function brandListingsEnabled() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return process.env.BRAND_LISTINGS_ENABLED !== "false" && isSupabaseConfigured() && Boolean(key && !key.includes("your-service"));
}

export function brandVerificationSecret() {
  const dedicated = process.env.BRAND_VERIFICATION_SECRET;
  if (dedicated) return /^[a-f0-9]{64}$/i.test(dedicated) ? dedicated : undefined;
  const shared = process.env.RATE_LIMIT_SECRET;
  return shared && shared.length >= 32 && !/replace-with|your-secret|example/i.test(shared)
    ? createHmac("sha256", shared).update("saasfolio:brand-domain-verification:v1").digest()
    : undefined;
}

export function brandVerificationEnabled() {
  return brandListingsEnabled() && Boolean(brandVerificationSecret());
}

export function brandHost(website: string) {
  return new URL(website).hostname.replace(/^www\./, "");
}

export function claimToken(secret: string | Buffer, receipt: string, address: string, website: string) {
  const host = brandHost(website);
  const token = createHmac("sha256", secret).update(`${receipt}:${host}:${address}`).digest("hex");
  return { host, dnsName: `_saasfolio.${host}`, dnsValue: `saasfolio=${token}` };
}

/** DNS instructions for a freshly saved submission, or null when verification is off. */
export function brandDnsInstructions(receipt: string, address: string, payload: Record<string, unknown>) {
  const secret = brandVerificationSecret();
  const website = normalizePublicHttpsUrl(payload.websiteUrl);
  if (!brandListingsEnabled() || !secret || !website) return null;
  const { dnsName, dnsValue } = claimToken(secret, receipt.toLowerCase(), address, website);
  return { dnsName, dnsValue };
}
