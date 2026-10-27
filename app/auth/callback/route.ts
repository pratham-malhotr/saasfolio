import { NextResponse } from "next/server";
import { authClient, enforceLimit, isSupabaseConfigured } from "@/lib/server/supabase";
import { safeAuthRedirect } from "@/lib/auth-navigation";
import { authOrigin, createRecoveryProof, RECOVERY_COOKIE, recoveryCookieOptions } from "@/lib/auth-config";

function redirect(request: Request, path: string) {
  const response = NextResponse.redirect(new URL(path, authOrigin(request)), 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeAuthRedirect(url.searchParams.get("next"));
  const errorPath = url.searchParams.get("flow") === "oauth" ? "/login?error=oauth" : "/login?error=confirmation";
  // The SDK exchanges this one-use code against the browser's HttpOnly PKCE verifier.
  if (isSupabaseConfigured() && code && code.length <= 2048 && !/[\s\u0000-\u001f]/.test(code) && !url.searchParams.has("error")) {
    try {
      await enforceLimit(request, "auth:callback", 30, 60);
      const client = await authClient({ writable: true });
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (!error && data?.user && data.session?.access_token) {
        const response = redirect(request, next);
        const proof = "redirectType" in data && data.redirectType === "recovery" && data.user && data.session
          ? createRecoveryProof(data.user.id, data.session.access_token) : null;
        response.cookies.set(RECOVERY_COOKIE, proof || "", { ...recoveryCookieOptions(), ...(proof ? {} : { maxAge: 0 }) });
        return response;
      }
    } catch { /* Provider descriptions, codes and tokens never become error query strings. */ }
  }
  return redirect(request, errorPath);
}
