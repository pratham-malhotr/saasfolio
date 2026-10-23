import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { HttpError } from "@/lib/server/http";
import {
  getLocalUserById,
  verifySessionToken,
} from "@/lib/server/local-auth";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-anon")
  );
}

export function authConfigured(): boolean {
  return true; // Authentication is always supported and functional
}

export function formsConfigured(): boolean {
  return true; // Form submissions are always supported (Supabase in prod, local-store fallback in dev)
}

export async function authClient() {
  if (!isSupabaseConfigured()) {
    throw new HttpError(503, "Account services are temporarily unavailable. Please try again later.");
  }
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    cookies: {
      getAll: () => store.getAll(),
      setAll: values => {
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Server components cannot mutate cookies; API session reads refresh them. */ }
      },
    },
  });
}

export function serviceClient() {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")) {
    throw new HttpError(503, "This service is temporarily unavailable. Please try again later or use our contact email.");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdmin(user: User | null): boolean {
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return Boolean(user?.email_confirmed_at && user.email && admins.includes(user.email.toLowerCase()));
}

export async function currentUser(): Promise<User | null> {
  // 1. If Supabase is configured, check Supabase session
  if (isSupabaseConfigured()) {
    try {
      const client = await authClient();
      const { data: { user }, error } = await client.auth.getUser();
      if (!error && user) return user;
    } catch {
      // Continue to local session check
    }
  }

  // 2. Check local signed session cookie
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
            email_confirmed_at: localUser.createdAt,
            created_at: localUser.createdAt,
            user_metadata: { name: localUser.name, bio: localUser.bio || "" },
            app_metadata: { provider: "email" },
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
  const name = String(user.user_metadata?.name || user.email?.split("@")[0] || "Member").slice(0, 100);
  return { id: user.id, name, email: user.email, avatarLetter: name.charAt(0).toUpperCase(), isAdmin: isAdmin(user) };
}

export async function enforceLimit(request: Request, action: string, max = 5, seconds = 600) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return; // Rate limits bypassed when service client is unconfigured in local dev
  }
  const service = serviceClient();
  const header = process.env.TRUSTED_CLIENT_IP_HEADER || (process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : "");
  const trusted = ["cf-connecting-ip", "x-vercel-forwarded-for", "x-real-ip", "x-forwarded-for"].includes(header);
  const address = (trusted ? request.headers.get(header)?.split(",")[0].trim().slice(0, 64) : undefined) || "anonymous";
  const key = createHmac("sha256", process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`${action}:${address}`).digest("hex");
  const { data, error } = await service.rpc("consume_request_limit", { bucket_key: key, max_attempts: max, window_seconds: seconds });
  if (error) throw new HttpError(503, "This service is temporarily unavailable. Please try again later.");
  if (!data) throw new HttpError(429, "Too many attempts. Please wait a few minutes before trying again.");
}
