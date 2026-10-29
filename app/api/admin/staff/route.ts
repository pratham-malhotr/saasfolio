import { failure, HttpError, json, readBody, email, text } from "@/lib/server/http";
import { requireStaff, rpcValue } from "@/lib/server/staff";
import { enforceLimit } from "@/lib/server/supabase";

export async function GET() {
  try { const { client } = await requireStaff({ roles: ["owner"] }); return json({ members: rpcValue(await client.rpc("list_staff")) }); }
  catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const { user, client } = await requireStaff({ roles: ["owner"] });
    await enforceLimit(request, `staff-management:${user.id}`, 10, 600);
    const address = email(body); const role = text(body, "role", 1, 20);
    if (!["owner", "editor", "reviewer"].includes(role) || typeof body.active !== "boolean") throw new HttpError(400, "Choose a valid staff role and access state.");
    rpcValue(await client.rpc("manage_staff", { target_email: address, target_role: role, target_active: body.active }));
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
