import {
  authClient, authConfigured, authProviderAvailability, isSupabaseConfigured,
  enforceLimit, publicUser, currentUser,
} from "@/lib/server/supabase";
import { email, failure, HttpError, json, readBody, text } from "@/lib/server/http";
import { authOrigin, supabasePublicConfig, RECOVERY_COOKIE, recoveryCookieOptions, verifyRecoveryProof } from "@/lib/auth-config";
import { safeAuthRedirect } from "@/lib/auth-navigation";
import { cookies } from "next/headers";
import {
  createLocalAccount, verifyLocalCredentials, createSessionToken, updateLocalUser,
  localAuthConfigured, revokeSessionToken,
} from "@/lib/server/local-auth";

const cookieOptions = () => ({ httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 30 * 86400 });

function passwordInput(data: Record<string, unknown>, minimum: number): string {
  const value = data.password;
  if (typeof value !== "string" || value.length < minimum || value.length > 128 || value.includes("\0") || !value.trim()) {
    throw new HttpError(400, `Use a password with ${minimum}–128 characters.`);
  }
  return value;
}

function callbackUrl(request: Request, next = "/profile", oauth = false) {
  const url = new URL("/auth/callback", authOrigin(request));
  url.searchParams.set("next", safeAuthRedirect(next));
  if (oauth) url.searchParams.set("flow", "oauth");
  return url.toString();
}

async function clearSessionCookies(response: ReturnType<typeof json>) {
  const store = await cookies();
  const config = supabasePublicConfig();
  const prefix = config ? `sb-${new URL(config.url).hostname.split(".")[0]}-auth-token` : "";
  const names = new Set(["saasfolio_session", ...store.getAll().map(cookie => cookie.name).filter(name => prefix && (name === prefix || name.startsWith(`${prefix}.`) || name.startsWith(`${prefix}-`)))]);
  for (const name of names) response.cookies.set(name, "", { ...cookieOptions(), maxAge: 0 });
  response.cookies.set(RECOVERY_COOKIE, "", { ...recoveryCookieOptions(), maxAge: 0 });
}

export async function GET(_request: Request, { params }: { params: Promise<{ action: string }> }) {
  if ((await params).action !== "session") return json({ error: "Not found." }, 404);
  try {
    const user = await currentUser();
    let recoveryAllowed = false;
    const proof = (await cookies()).get(RECOVERY_COOKIE)?.value;
    if (user && proof && isSupabaseConfigured()) {
      const client = await authClient();
      const { data } = await client.auth.getSession();
      recoveryAllowed = verifyRecoveryProof(proof, user.id, data.session?.access_token || "");
    }
    return json({ configured: authConfigured(), user: user ? publicUser(user) : null, recoveryAllowed });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await params;
    if (!["login", "signup", "logout", "reset", "password", "oauth"].includes(action)) throw new HttpError(404, "Not found.");
    const data = await readBody(request);
    const store = await cookies();
    if (action === "logout") {
      const token = store.get("saasfolio_session")?.value;
      if (localAuthConfigured() && token) revokeSessionToken(token);
      try { await enforceLimit(request, "auth:logout", 30); }
      catch (error) {
        const response = failure(error);
        await clearSessionCookies(response);
        return response;
      }
      let providerFailed = false;
      if (isSupabaseConfigured()) {
        try {
          const client = await authClient({ writable: true });
          const { error } = await client.auth.signOut({ scope: "local" });
          providerFailed = Boolean(error);
        } catch { providerFailed = true; }
      }
      const response = providerFailed
        ? json({ error: "Your browser session was cleared. The account service could not confirm sign-out; please try again." }, 503)
        : json({ ok: true });
      await clearSessionCookies(response);
      return response;
    }

    await enforceLimit(request, `auth:${action}`, action === "login" ? 15 : 5);

    if (action === "oauth") {
      // PKCE binds the callback to this browser; the start itself must also be same-origin.
      if (request.headers.get("origin") !== authOrigin(request)) throw new HttpError(403, "This request must come from SaaSFolio.");
      const provider = data.provider;
      if (provider !== "google" && provider !== "apple") throw new HttpError(400, "Choose Google or Apple to continue.");
      if (!(await authProviderAvailability())[provider]) throw new HttpError(503, `${provider === "google" ? "Google" : "Apple"} sign-in is temporarily unavailable. Use email and password or try again later.`);
      const client = await authClient({ writable: true });
      const { data: result, error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl(request, safeAuthRedirect(data.redirect), true), skipBrowserRedirect: true },
      });
      if (error || !result.url) throw new HttpError(503, "We couldn’t start that sign-in. Please try again.");
      const destination = new URL(result.url);
      const config = supabasePublicConfig();
      if (!config || destination.origin !== config.url || destination.pathname !== "/auth/v1/authorize" || destination.searchParams.get("provider") !== provider || destination.searchParams.get("code_challenge_method") !== "s256" || !destination.searchParams.get("code_challenge")) {
        throw new HttpError(503, "We couldn’t start that sign-in. Please try again.");
      }
      return json({ url: destination.toString() });
    }

    if (!authConfigured()) throw new HttpError(503, "Account services are temporarily unavailable. Please try again later.");

    if (action === "password") {
      const user = await currentUser();
      if (!user) throw new HttpError(401, "Open a valid password reset link or sign in first.");
      const password = passwordInput(data, 12);
      if (isSupabaseConfigured()) {
        const client = await authClient({ writable: true });
        const { data: sessionData } = await client.auth.getSession();
        const recovering = verifyRecoveryProof(store.get(RECOVERY_COOKIE)?.value, user.id, sessionData.session?.access_token || "");
        if (!recovering) {
          const currentPassword = passwordInput({ password: data.currentPassword }, 1);
          const { data: verified, error } = await client.auth.signInWithPassword({ email: user.email || "", password: currentPassword });
          if (error || verified.user?.id !== user.id) throw new HttpError(401, "Your current password could not be confirmed. Request a new reset link if needed.");
        }
        const { error } = await client.auth.updateUser({ password });
        if (error) throw new HttpError(400, "The password could not be changed. Request a fresh reset link and try again.");
        // Drop this browser's credentials even if the remote sign-out is interrupted.
        try { await client.auth.signOut({ scope: "global" }); } catch { /* No provider error details are exposed. */ }
      } else {
        const currentPassword = passwordInput({ password: data.currentPassword }, 1);
        if (verifyLocalCredentials(user.email || "", currentPassword)?.id !== user.id) throw new HttpError(401, "Your current password could not be confirmed.");
        updateLocalUser(user.id, { password });
      }
      const response = json({ ok: true, requiresReauthentication: true });
      await clearSessionCookies(response);
      return response;
    }

    const address = email(data);
    const password = action === "reset" ? "" : passwordInput(data, action === "signup" ? 12 : 1);
    const name = action === "signup" ? text(data, "name", 2, 100) : "";

    if (action === "reset") {
      if (!isSupabaseConfigured()) throw new HttpError(503, "Password reset email is unavailable for this account service. Please contact support.");
      const client = await authClient({ writable: true });
      const { error } = await client.auth.resetPasswordForEmail(address, { redirectTo: callbackUrl(request, "/reset-password") });
      if (error) throw new HttpError(503, "We couldn’t request a reset email. Please try again later.");
      return json({ message: "If an account exists for that address, a password reset email has been requested." });
    }

    if (isSupabaseConfigured()) {
      const client = await authClient({ writable: true });
      if (action === "signup") {
        const { data: result, error } = await client.auth.signUp({
          email: address, password,
          options: { data: { name }, emailRedirectTo: callbackUrl(request, safeAuthRedirect(data.redirect)) },
        });
        if (error) throw new HttpError(400, "We couldn’t create this account. Check your details or try signing in.");
        return json({ user: result.session && result.user ? publicUser(result.user) : null, message: result.session ? "Your account is ready." : "Check your inbox to confirm your email before signing in." });
      }
      const { data: result, error } = await client.auth.signInWithPassword({ email: address, password });
      if (error || !result.user) throw new HttpError(401, "Sign in failed. Check your email, password, and email confirmation.");
      return json({ user: publicUser(result.user) });
    }

    // Explicit local development/test mode; cloud failures never enter this branch.
    if (!localAuthConfigured()) throw new HttpError(503, "Account services are temporarily unavailable. Please try again later.");
    let localUser;
    if (action === "signup") {
      try { localUser = createLocalAccount(name, address, password); }
      catch { throw new HttpError(400, "We couldn’t create this account. Check your details or try signing in."); }
    } else {
      localUser = verifyLocalCredentials(address, password);
      if (!localUser) throw new HttpError(401, "Sign in failed. Check your email and password.");
    }
    const token = createSessionToken(localUser.id);
    const user = { id: localUser.id, email: localUser.email, user_metadata: { name: localUser.name, bio: localUser.bio || "" }, app_metadata: { provider: "local" } };
    const response = json({ user: publicUser(user as never), ...(action === "signup" ? { message: "Your account is ready." } : {}) });
    response.cookies.set("saasfolio_session", token, cookieOptions());
    return response;
  } catch (error) { return failure(error); }
}
