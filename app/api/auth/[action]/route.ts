import { authClient, authConfigured, enforceLimit, publicUser, currentUser } from "@/lib/server/supabase";
import { email, failure, HttpError, json, readBody, text } from "@/lib/server/http";
import { absoluteUrl } from "@/lib/seo";

export async function GET(_request: Request, { params }: { params: Promise<{ action: string }> }) {
  if ((await params).action !== "session") return json({ error: "Not found." }, 404);
  try {
    const user = await currentUser();
    return json({ configured: authConfigured(), user: user ? publicUser(user) : null });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await params;
    if (!["login", "signup", "logout", "reset", "password"].includes(action)) throw new HttpError(404, "Not found.");
    const data = await readBody(request);
    const client = await authClient();
    if (action === "logout") {
      const { error } = await client.auth.signOut();
      if (error) throw new HttpError(503, "Sign out failed. Please try again.");
      return json({ ok: true });
    }
    if (action === "password") {
      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new HttpError(401, "Open a valid password reset link or sign in first.");
      const password = text(data, "password", 12, 128);
      const { error } = await client.auth.updateUser({ password });
      if (error) throw new HttpError(400, "The password could not be changed. Request a fresh reset link and try again.");
      return json({ ok: true });
    }
    const address = email(data);
    const password = action === "reset" ? "" : text(data, "password", action === "signup" ? 12 : 1, 128);
    const name = action === "signup" ? text(data, "name", 2, 100) : "";
    await enforceLimit(request, `auth:${action}`, action === "login" ? 15 : 5);
    if (action === "reset") {
      const { error } = await client.auth.resetPasswordForEmail(address, { redirectTo: absoluteUrl("/auth/callback?next=/reset-password") });
      if (error) throw new HttpError(503, "We couldn’t request a reset email. Please try again later.");
      return json({ message: "If an account exists for that address, a password reset email has been requested." });
    }
    if (action === "signup") {
      const { data: result, error } = await client.auth.signUp({ email: address, password, options: {
        data: { name }, emailRedirectTo: absoluteUrl("/auth/callback"),
      } });
      if (error) throw new HttpError(400, "We couldn’t create this account. Check your details or try signing in.");
      return json({ user: result.session && result.user ? publicUser(result.user) : null,
        message: result.session ? "Your account is ready." : "Check your inbox to confirm your email before signing in." });
    }
    const { data: result, error } = await client.auth.signInWithPassword({ email: address, password });
    if (error || !result.user) throw new HttpError(401, "Sign in failed. Check your email, password, and email confirmation.");
    return json({ user: publicUser(result.user) });
  } catch (error) { return failure(error); }
}
