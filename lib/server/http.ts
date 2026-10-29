import "server-only";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";
import { normalizePublicHttpsUrl } from "@/lib/public-url.mjs";
import { safeAuthRedirect } from "@/lib/auth-navigation";
import { randomUUID } from "node:crypto";
import { recordException } from "@/lib/server/observability";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = `HTTP_${status}`) { super(message); this.name = "HttpError"; }
}

export function json(data: unknown, status = 200, requestId = randomUUID()) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "X-Request-ID": requestId } });
}

export function failure(error: unknown) {
  const status = error instanceof HttpError ? error.status : 500;
  const requestId = randomUUID();
  if (status >= 500) recordException(error, { requestId, status });
  return json({ error: error instanceof HttpError ? error.message : "We couldn’t complete that request. Please try again shortly.",
    code: error instanceof HttpError ? error.code : "UNEXPECTED_ERROR", requestId }, status, requestId);
}

export async function readBody(request: Request, maxBytes = 24000): Promise<Record<string, unknown>> {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(SITE_URL).origin]);
  const requestUrl = new URL(request.url);
  if (process.env.NODE_ENV !== "production" || ["localhost", "127.0.0.1", "[::1]"].includes(requestUrl.hostname)) allowed.add(requestUrl.origin);
  const siteUrl = new URL(SITE_URL);
  if (!siteUrl.hostname.startsWith("www.")) allowed.add(`${siteUrl.protocol}//www.${siteUrl.host}`);
  if (origin && !allowed.has(origin)) throw new HttpError(403, "This request must come from SaaSFolio.");
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "This request must come from SaaSFolio.");
  if (!request.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "Send a JSON request.");
  // Read the stream with a hard limit; Content-Length alone is not trustworthy.
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "The form is empty.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) { await reader.cancel(); throw new HttpError(413, "The form is too large."); }
    chunks.push(value);
  }
  try {
    const result = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error();
    return result;
  } catch { throw new HttpError(400, "The form could not be read."); }
}

export function text(data: Record<string, unknown>, key: string, min = 1, max = 200): string {
  const value = typeof data[key] === "string" ? data[key].trim() : "";
  if (value.length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) {
    throw new HttpError(400, `Please provide a valid ${key.replace(/([A-Z])/g, " $1").toLowerCase()} (${min}–${max} characters).`);
  }
  return value;
}

export function email(data: Record<string, unknown>, key = "email") {
  const value = text(data, key, 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new HttpError(400, "Please enter a valid email address.");
  return value;
}

export function website(data: Record<string, unknown>, key: string) {
  const value = text(data, key, 8, 2000);
  const safe = normalizePublicHttpsUrl(value);
  if (!safe) throw new HttpError(400, "Please enter a public HTTPS website URL without credentials or a private address.");
  return safe;
}

export function safeRedirect(value: unknown, fallback = "/profile") {
  return safeAuthRedirect(value, fallback);
}
