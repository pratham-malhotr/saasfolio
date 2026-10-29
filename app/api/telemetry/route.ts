import { failure, json, readBody } from "@/lib/server/http";
import { enforceLimit } from "@/lib/server/supabase";
import { recordEvent } from "@/lib/server/observability";
export async function POST(request: Request) {
  try {
    const body = await readBody(request, 2000);
    if (process.env.NEXT_PUBLIC_CLIENT_DIAGNOSTICS !== "true") return json({ accepted: false }, 202);
    await enforceLimit(request, "client-diagnostics", 20, 600);
    recordEvent("client.error", { route: body.route, errorName: body.errorName, digest: body.digest });
    return json({ accepted: true }, 202);
  } catch (error) { return failure(error); }
}
