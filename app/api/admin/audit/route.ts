import { failure, HttpError, json } from "@/lib/server/http";
import { requireStaff, rpcValue } from "@/lib/server/staff";

export async function GET(request: Request) {
  try {
    const { client } = await requireStaff({ roles: ["owner", "reviewer"] });
    const before = new URL(request.url).searchParams.get("before");
    if (before && (!/^\d{1,15}$/.test(before) || !Number.isSafeInteger(Number(before)))) throw new HttpError(400, "The audit cursor is invalid.");
    const events = rpcValue(await client.rpc("list_audit_events", { before_id: before ? Number(before) : null })) as Array<{ id: number }>;
    return json({ events, nextCursor: events.length === 100 ? events.at(-1)?.id : null });
  } catch (error) { return failure(error); }
}
