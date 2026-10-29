import { json } from "@/lib/server/http";
import { readiness } from "@/lib/server/readiness";

export async function GET() {
  const result = await readiness();
  return json({ status: result.ready ? "ready" : "not_ready", scope: "dependency-readiness", checkedAt: result.checkedAt }, result.ready ? 200 : 503);
}
