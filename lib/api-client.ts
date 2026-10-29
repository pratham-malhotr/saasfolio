export class ApiError extends Error {
  constructor(message: string, public status: number, public requestId?: string, public code?: string) { super(message); }
}
export async function apiRequest<T = Record<string, unknown>>(path: string, body?: unknown, method = "POST"): Promise<T> {
  const response = await fetch(path, {
    method, headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(20000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(result.error || "We couldn’t complete that request. Please try again.", response.status, response.headers.get("x-request-id") || undefined, result.code);
  return result as T;
}
