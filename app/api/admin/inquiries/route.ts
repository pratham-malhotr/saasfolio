import { failure, HttpError, json, readBody, text } from "@/lib/server/http";
import { isAdmin, requireUser, serviceClient } from "@/lib/server/supabase";

async function authorize() {
  const user = await requireUser();
  if (!isAdmin(user)) throw new HttpError(403, "Administrator access is required.");
  return serviceClient();
}
export async function GET() {
  try {
    const service = await authorize();
    const { data, error } = await service.from("inquiries").select("id,kind,email,payload,status,created_at").order("created_at", { ascending: false }).limit(100);
    if (error) throw new HttpError(503, "The review queue is temporarily unavailable.");
    return json({ inquiries: data });
  } catch (error) { return failure(error); }
}
export async function PATCH(request: Request) {
  try {
    const data = await readBody(request);
    const service = await authorize();
    const id = text(data, "id", 36, 36);
    const status = text(data, "status", 1, 20);
    if (!/^[0-9a-f-]{36}$/i.test(id) || !["pending", "reviewing", "resolved", "rejected"].includes(status)) throw new HttpError(400, "Invalid review update.");
    const { data: row, error } = await service.from("inquiries").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
    if (error) throw new HttpError(503, "The review could not be saved.");
    if (!row) throw new HttpError(404, "Submission not found.");
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
