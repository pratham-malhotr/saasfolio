import "server-only";
import { SITE_URL } from "@/lib/seo";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const RECOVERY_COOKIE = "saasfolio_recovery";
export const RECOVERY_SECONDS = 600;

export const recoveryCookieOptions = () => ({ httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/api/auth", maxAge: RECOVERY_SECONDS });

function recoverySecret(): string | null {
  const explicit = process.env.AUTH_RECOVERY_SECRET;
  if (explicit && /^[a-f\d]{64,}$/i.test(explicit)) return explicit;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return service && service.length >= 32 && !service.includes("your-service") ? service : null;
}

export function createRecoveryProof(userId: string, accessToken: string): string | null {
  const secret = recoverySecret();
  if (!secret || !userId || !accessToken) return null;
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + RECOVERY_SECONDS * 1000, session: createHash("sha256").update(accessToken).digest("hex") })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

export function verifyRecoveryProof(value: string | undefined, userId: string, accessToken: string): boolean {
  const secret = recoverySecret();
  if (!secret || !value || value.length > 2048 || !userId || !accessToken) return false;
  const parts = value.split(".");
  if (parts.length !== 2 || !/^[a-f\d]{64}$/i.test(parts[1])) return false;
  const expected = createHmac("sha256", secret).update(parts[0]).digest();
  if (!timingSafeEqual(Buffer.from(parts[1], "hex"), expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return payload.userId === userId && Number.isSafeInteger(payload.expiresAt) && payload.expiresAt > Date.now() && payload.expiresAt <= Date.now() + RECOVERY_SECONDS * 1000 && payload.session === createHash("sha256").update(accessToken).digest("hex");
  } catch { return false; }
}

/** Request hosts and forwarded headers never choose a production callback. */
export function authOrigin(request: Request): string {
  const url = new URL(request.url);
  if (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return url.origin;
  return new URL(SITE_URL).origin;
}

export function supabasePublicConfig(): { url: string; key: string } | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl || !key || /your-project/.test(rawUrl) || /your-anon|your-publishable|^sb_secret_/.test(key)) return null;
  try {
    const url = new URL(rawUrl);
    const local = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) return null;
    // Catch an accidentally copied legacy service-role JWT in a public field.
    if (key.split(".").length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
        if (payload.role === "service_role") return null;
      } catch { return null; }
    }
    return { url: url.origin, key };
  } catch { return null; }
}
