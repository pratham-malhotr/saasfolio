import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { HttpError } from "@/lib/server/http";

export function authConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-anon"));
}

export async function authClient() {
  if (!authConfigured()) throw new HttpError(503, "Account services are temporarily unavailable. Please try again later.");
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
  if (!authConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")) {
    throw new HttpError(503, "This service is temporarily unavailable. Please try again later or use our contact email.");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdmin(user: User | null) {
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return Boolean(user?.email_confirmed_at && user.email && admins.includes(user.email.toLowerCase()));
}

export async function currentUser() {
  if (!authConfigured()) return null;
  const client = await authClient();
  const { data: { user }, error } = await client.auth.getUser();
  return error ? null : user;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Sign in to continue.");
  return user;
}

export function publicUser(user: User) {
  const name = String(user.user_metadata?.name || user.email?.split("@")[0] || "Member").slice(0, 100);
  return { id: user.id, name, email: user.email, avatarLetter: name.charAt(0).toUpperCase(), isAdmin: isAdmin(user) };
}

export async function enforceLimit(request: Request, action: string, max = 5, seconds = 600) {
  const service = serviceClient();
  // Trust only a header explicitly configured for an edge that overwrites it.
  // Otherwise use a shared anonymous bucket instead of accepting spoofable IPs.
  const header = process.env.TRUSTED_CLIENT_IP_HEADER || (process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : "");
  const trusted = ["cf-connecting-ip", "x-vercel-forwarded-for", "x-real-ip", "x-forwarded-for"].includes(header);
  const address = (trusted ? request.headers.get(header)?.split(",")[0].trim().slice(0, 64) : undefined) || "anonymous";
  const key = createHmac("sha256", process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`${action}:${address}`).digest("hex");
  const { data, error } = await service.rpc("consume_request_limit", { bucket_key: key, max_attempts: max, window_seconds: seconds });
  if (error) throw new HttpError(503, "This service is temporarily unavailable. Please try again later.");
  if (!data) throw new HttpError(429, "Too many attempts. Please wait a few minutes before trying again.");
}
