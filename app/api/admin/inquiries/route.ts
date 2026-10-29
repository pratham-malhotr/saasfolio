import { failure, HttpError, json, readBody, text } from "@/lib/server/http";
import { requireStaff, rpcValue } from "@/lib/server/staff";
import { enforceLimit } from "@/lib/server/supabase";

export async function GET(request: Request) {
  try {
    const { client } = await requireStaff({ roles: ["owner", "reviewer"] });
    const cursor = request ? new URL(request.url).searchParams.get("before") : null;
    let before_time: string | null = null, before_id: string | null = null;
    if (cursor) {
      const parts = cursor.split("|");
      if (parts.length !== 2 || !Number.isFinite(Date.parse(parts[0])) || !/^[a-f0-9-]{36}$/i.test(parts[1])) throw new HttpError(400, "The pagination cursor is invalid.");
      [before_time, before_id] = parts;
    }
    const rows = rpcValue(await client.rpc("review_inquiries", { before_time, before_id })) as Array<{ id: string; created_at: string }>;
    const last = rows.at(-1);
    return json({ inquiries: rows, nextCursor: rows.length === 50 && last ? `${last.created_at}|${last.id}` : null });
  } catch (error) { return failure(error); }
}
export async function PATCH(request: Request) {
  try {
    const data = await readBody(request);
    const { user, client } = await requireStaff({ roles: ["owner", "reviewer"] });
    await enforceLimit(request, `inquiry-review:${user.id}`, 50, 600);
    const id = text(data, "id", 36, 36);
    const status = text(data, "status", 1, 20);
    const previousStatus = text(data, "previousStatus", 1, 20);
    if (!/^[0-9a-f-]{36}$/i.test(id) || !["pending", "reviewing", "resolved", "rejected"].includes(status)) throw new HttpError(400, "Invalid review update.");
    rpcValue(await client.rpc("update_inquiry_status", { target_id: id, previous_status: previousStatus, next_status: status }));
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
