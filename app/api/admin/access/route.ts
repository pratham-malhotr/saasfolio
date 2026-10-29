import { failure, json } from "@/lib/server/http";
import { requireStaff } from "@/lib/server/staff";

export async function GET() {
  try { const access = await requireStaff({ mfa: false }); return json({ role: access.role, mfaVerified: access.mfaVerified }); }
  catch (error) { return failure(error); }
}
