import { json } from "@/lib/server/http";
import { authorizedMonitor, readiness } from "@/lib/server/readiness";

export async function GET(request: Request) {
  if (!authorizedMonitor(request)) return json({ error: "Monitoring authorization is required." }, 401);
  const result = await readiness();
  return json(result, result.ready ? 200 : 503);
}
