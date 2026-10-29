import "server-only";
import { randomUUID } from "node:crypto";
import { operationalRecord, safeIdentifier } from "@/lib/observability.mjs";

type Context = { requestId?: string; route?: string; operation?: string; status?: number; component?: string };

export function recordException(error: unknown, context: Context = {}) {
  const requestId = context.requestId || randomUUID();
  const errorId = randomUUID();
  const candidate = error && typeof error === "object" ? error as { name?: unknown; digest?: unknown; code?: unknown } : {};
  console.error(JSON.stringify(operationalRecord("request.failed", { ...context, requestId, errorId,
    errorName: safeIdentifier(candidate.name, "Error"), digest: candidate.digest, code: candidate.code,
    release: process.env.APP_RELEASE || process.env.GITHUB_SHA?.slice(0, 12) || "development" })));
  return { requestId, errorId };
}

export function recordEvent(event: string, fields: Record<string, unknown> = {}) {
  console.info(JSON.stringify(operationalRecord(event, { ...fields, release: process.env.APP_RELEASE || "development" })));
}
