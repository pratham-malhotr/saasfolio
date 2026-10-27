import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { HttpError } from "@/lib/server/http";
import { supabasePublicConfig } from "@/lib/auth-config";
import {
  getLocalUserById,
  localAuthConfigured,
  verifySessionToken,
} from "@/lib/server/local-auth";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabasePublicConfig());
}

export function authConfigured(): boolean {
  return isSupabaseConfigured() || localAuthConfigured();
}

export function formsConfigured(): boolean {
  return (isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service"))) || localAuthConfigured();
}

export async function authProviderAvailability(): Promise<{ google: boolean; apple: boolean }> {
  const config = supabasePublicConfig();
  if (!config) return { google: false, apple: false };
  try {
    const response = await fetch(`${config.url}/auth/v1/settings`, {
      headers: { apikey: config.key }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) return { google: false, apple: false };
    const settings = await response.json();
    return { google: settings?.external?.google === true, apple: settings?.external?.apple === true };
  } catch { return { google: false, apple: false }; }
}

export async function authClient({ writable = true }: { writable?: boolean } = {}) {
  const config = supabasePublicConfig();
  if (!config) {
    throw new HttpError(503, "Account services are temporarily unavailable. Please try again later.");
  }
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    auth: { flowType: "pkce" },
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    cookies: {
      getAll: () => store.getAll(),
      setAll: values => {
        try {
          values.forEach(({ name, value, options }) => store.set(name, value, {
            ...options, domain: undefined, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/",
            ...(name.includes("code-verifier") && options.maxAge !== 0 ? { maxAge: 3600 } : {}),
          }));
        } catch (error) {
          // The proxy refreshes admin render sessions; writable API handlers
          // must propagate cookie failures instead of losing rotated tokens.
          if (writable) throw error;
        }
      },
    },
  });
}

export function serviceClient() {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")) {
    throw new HttpError(503, "This service is temporarily unavailable. Please try again later or use our contact email.");
  }
  return createClient(supabasePublicConfig()!.url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdmin(user: User | null): boolean {
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return Boolean(user?.app_metadata?.provider !== "local" && user?.email_confirmed_at && user.email && admins.includes(user.email.toLowerCase()));
}

export async function currentUser({ writable = true }: { writable?: boolean } = {}): Promise<User | null> {
  // 1. If Supabase is configured, check Supabase session
  if (isSupabaseConfigured()) {
    try {
      const client = await authClient({ writable });
      const { data: { user }, error } = await client.auth.getUser();
      if (!error && user) return user;
    } catch { /* An unavailable provider never authenticates a local account. */ }
    return null;
  }

  if (!localAuthConfigured()) return null;
  // Local accounts are an explicit development/test mode, never a cloud fallback.
  try {
    const store = await cookies();
    const token = store.get?.("saasfolio_session")?.value;
    if (token) {
      const userId = verifySessionToken(token);
      if (userId) {
        const localUser = getLocalUserById(userId);
        if (localUser) {
          return {
            id: localUser.id,
            email: localUser.email,
            created_at: localUser.createdAt,
            user_metadata: { name: localUser.name, bio: localUser.bio || "" },
            app_metadata: { provider: "local" },
            aud: "authenticated",
          } as unknown as User;
        }
      }
    }
  } catch {
    // Return null if reading cookies/session fails
  }

  return null;
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Sign in to continue.");
  return user;
}

export function publicUser(user: User) {
  const name = String(user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Member").slice(0, 100);
  return { id: user.id, name, email: user.email, avatarLetter: name.charAt(0).toUpperCase(), isAdmin: isAdmin(user) };
}

const processLimits = new Map<string, { attempts: number; expiresAt: number }>();

export async function enforceLimit(request: Request, action: string, max = 5, seconds = 600) {
  const header = process.env.TRUSTED_CLIENT_IP_HEADER || (process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : "");
  const trusted = ["cf-connecting-ip", "x-vercel-forwarded-for", "x-real-ip", "x-forwarded-for"].includes(header);
  const address = (trusted ? request.headers.get(header)?.split(",")[0].trim().slice(0, 64) : undefined) || "anonymous";
  const material = `${action}:${address}`;
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")) {
    const now = Date.now();
    for (const [key, value] of processLimits) if (value.expiresAt <= now) processLimits.delete(key);
    const record = processLimits.get(material);
    if (record && record.attempts >= max) throw new HttpError(429, "Too many attempts. Please wait a few minutes before trying again.");
    if (!record && processLimits.size >= 2048) throw new HttpError(429, "Too many attempts. Please try again shortly.");
    processLimits.set(material, { attempts: (record?.attempts || 0) + 1, expiresAt: record?.expiresAt || now + seconds * 1000 });
    return;
  }
  const service = serviceClient();
  const key = createHmac("sha256", process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!).update(material).digest("hex");
  const { data, error } = await service.rpc("consume_request_limit", { bucket_key: key, max_attempts: max, window_seconds: seconds });
  if (error) throw new HttpError(503, "This service is temporarily unavailable. Please try again later.");
  if (!data) throw new HttpError(429, "Too many attempts. Please wait a few minutes before trying again.");
}
