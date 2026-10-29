import { cookies } from "next/headers";
import { failure, HttpError, json, readBody, text } from "@/lib/server/http";
import { authClient, enforceLimit, isSupabaseConfigured, requireUser, serviceClient } from "@/lib/server/supabase";
import { rpcValue } from "@/lib/server/staff";
import { supabasePublicConfig } from "@/lib/auth-config";

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const user = await requireUser();
    if (!isSupabaseConfigured() || !user.email_confirmed_at || !user.email) throw new HttpError(503, "Self-service deletion requires a confirmed production account.");
    if (text(body, "confirmation", 1, 50) !== "DELETE MY ACCOUNT" || text(body, "email", 3, 254).toLowerCase() !== user.email.toLowerCase()) throw new HttpError(400, "Confirm your account email and type DELETE MY ACCOUNT.");
    await enforceLimit(request, `account-deletion:${user.id}`, 3, 3600);
    const client = await authClient();
    if (body.password) {
      if (user.factors?.some(factor => factor.status === "verified")) throw new HttpError(403, "Sign in again, verify your authenticator and return here within five minutes.", "RECENT_SIGN_IN_REQUIRED");
      const password = typeof body.password === "string" && body.password.length <= 256 ? body.password : "";
      const verified = await client.auth.signInWithPassword({ email: user.email, password });
      if (verified.error || verified.data.user?.id !== user.id) throw new HttpError(403, "Your password could not be verified.", "RECENT_SIGN_IN_REQUIRED");
    }
    const prepared = await client.rpc("prepare_account_deletion");
    if (prepared.error?.code === "42501") throw new HttpError(403, "Sign in again and complete any authenticator verification, then return here within five minutes.", "RECENT_SIGN_IN_REQUIRED");
    if (prepared.error?.code === "23514") throw new HttpError(400, "Assign another active owner before deleting the last owner account.");
    const requestId = rpcValue(prepared) as string;
    const service = serviceClient();
    const deleted = await service.auth.admin.deleteUser(user.id, false);
    if (deleted.error) throw new HttpError(503, "Account deletion could not be confirmed. Your linked records have not been erased; try again or contact support.", "ACCOUNT_DELETION_UNCONFIRMED");
    const cleanup = await service.rpc("complete_account_deletion", { request_id: requestId });
    try { await client.auth.signOut({ scope: "local" }); } catch { /* deleted sessions cannot authenticate again */ }
    const store = await cookies();
    const config = supabasePublicConfig();
    const prefix = config ? `sb-${new URL(config.url).hostname.split(".")[0]}-auth-token` : "";
    for (const cookie of store.getAll()) if (prefix && (cookie.name === prefix || cookie.name.startsWith(`${prefix}.`) || cookie.name === `${prefix}-code-verifier`)) store.set(cookie.name, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    store.set("saasfolio_recovery", "", { path: "/api/auth", maxAge: 0, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    return json({ status: cleanup.error ? "pending_cleanup" : "deleted", reference: requestId }, cleanup.error ? 202 : 200);
  } catch (error) { return failure(error); }
}
