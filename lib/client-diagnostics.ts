import { routeTemplate, safeIdentifier } from "@/lib/observability.mjs";
export function errorReference(error: unknown) {
  return error instanceof Error && "digest" in error ? safeIdentifier(error.digest, "") : "";
}
export function reportClientError(error: unknown) {
  const record = { route: routeTemplate(location.pathname), errorName: error instanceof Error ? safeIdentifier(error.name) : "UnknownError", digest: errorReference(error) };
  console.error("SaaSFolio page failure", record);
  if (process.env.NEXT_PUBLIC_CLIENT_DIAGNOSTICS !== "true") return;
  void fetch("/api/telemetry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record), keepalive: true, credentials: "same-origin" }).catch(() => {});
}
