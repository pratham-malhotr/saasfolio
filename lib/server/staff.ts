import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { authClient, currentUser, isAdmin, serviceClient } from "@/lib/server/supabase";
import { HttpError } from "@/lib/server/http";

export type StaffRole = "owner" | "editor" | "reviewer";
export type StaffAccess = { user: User; client: SupabaseClient; role: StaffRole; mfaVerified: boolean };

export function rpcValue<T>(result: { data: T; error: { code?: string } | null }): T {
  if (!result.error) return result.data;
  if (result.error.code === "42501") throw new HttpError(403, "Your account does not have permission for this action. Complete two-factor verification if required.", "STAFF_PERMISSION_REQUIRED");
  if (result.error.code === "40001" || result.error.code === "23505") throw new HttpError(409, "This record changed. Reload it before trying again.", "REVISION_CONFLICT");
  if (result.error.code === "P0002") throw new HttpError(404, "The requested record was not found.", "RECORD_NOT_FOUND");
  if (["22023", "22007", "22P02", "23514"].includes(result.error.code || "")) throw new HttpError(400, "Check the record, source evidence and requested action before continuing.", "INVALID_WORKFLOW_STATE");
  throw new HttpError(503, "The administration service is temporarily unavailable. Please try again.", "STAFF_SERVICE_UNAVAILABLE");
}

export async function requireStaff({ roles = ["owner", "editor", "reviewer"], mfa = true, writable = true }: { roles?: StaffRole[]; mfa?: boolean; writable?: boolean } = {}): Promise<StaffAccess> {
  const user = await currentUser({ writable });
  if (!user) throw new HttpError(401, "Sign in to continue.");
  if (user.app_metadata?.provider === "local" || !user.email_confirmed_at) throw new HttpError(403, "A confirmed production staff account is required.");
  const client = await authClient({ writable });
  let access = rpcValue(await client.rpc("staff_self")) as { role?: unknown; mfaVerified?: boolean } | null;
  if (!access && isAdmin(user)) {
    rpcValue(await serviceClient().rpc("bootstrap_staff_owner", { target_user: user.id }));
    access = rpcValue(await client.rpc("staff_self")) as typeof access;
  }
  if (!access || !roles.includes(access.role as StaffRole)) throw new HttpError(403, "Staff permission is required.", "STAFF_PERMISSION_REQUIRED");
  if (mfa && access.mfaVerified !== true) throw new HttpError(403, "Verify your authenticator code to continue.", "MFA_REQUIRED");
  return { user, client, role: access.role as StaffRole, mfaVerified: access.mfaVerified === true };
}
