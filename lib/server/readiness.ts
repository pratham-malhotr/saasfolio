import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { supabasePublicConfig } from "@/lib/auth-config";
import { catalogFreshness } from "@/lib/observability.mjs";
import snapshot from "@/lib/data/offer-snapshot.json";

type Check = "ok" | "unavailable" | "not_configured";
let cached: { until: number; result: ReturnType<typeof inspect> } | undefined;

async function inspect() {
  const config = supabasePublicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const checks: { auth: Check; database: Check; schema: Check } = { auth: "not_configured", database: "not_configured", schema: "not_configured" };
  if (config) {
    await Promise.all([
      (async () => {
        try {
          const response = await fetch(`${config.url}/auth/v1/settings`, { headers: { apikey: config.key }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(3500) });
          checks.auth = response.ok ? "ok" : "unavailable";
        } catch { checks.auth = "unavailable"; }
      })(),
      (async () => {
        if (!key || key.includes("your-service")) return;
        try {
          const response = await fetch(`${config.url}/rest/v1/rpc/platform_readiness`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: "{}", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(3500) });
          if (!response.ok) { checks.database = "unavailable"; checks.schema = "unavailable"; return; }
          const result = await response.json();
          checks.database = "ok"; checks.schema = result?.ready === true && result.schemaVersion >= 3 ? "ok" : "unavailable";
        } catch { checks.database = "unavailable"; checks.schema = "unavailable"; }
      })(),
    ]);
  }
  const catalog = catalogFreshness(snapshot);
  return { ready: checks.auth === "ok" && checks.database === "ok" && checks.schema === "ok" && catalog.status === "current",
    checkedAt: new Date().toISOString(), checks, catalog, newsletter: { configured: Boolean(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("your_api") && process.env.NEWSLETTER_FROM_EMAIL), delivery: "not_probed" } };
}

export async function readiness() {
  if (!cached || cached.until <= Date.now()) cached = { until: Date.now() + 15000, result: inspect() };
  return cached.result;
}

export function authorizedMonitor(request: Request) {
  const secret = process.env.MONITORING_TOKEN;
  if (!secret || secret.length < 32 || /replace|example|your[-_]/i.test(secret)) return false;
  const value = request.headers.get("authorization") || "";
  if (value.length > 512) return false;
  const supplied = value.startsWith("Bearer ") ? value.slice(7) : "";
  return timingSafeEqual(createHash("sha256").update(secret).digest(), createHash("sha256").update(supplied).digest());
}
