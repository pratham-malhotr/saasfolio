import { NextResponse } from "next/server";
import { authConfigured, authProviderAvailability, formsConfigured, isSupabaseConfigured } from "@/lib/server/supabase";

/** Public service configuration, with conservative provider readiness. */
export async function GET() {
  const startTime = Date.now();
  const accountsConfigured = authConfigured();
  const authProviders = await authProviderAvailability();

  const healthPayload = {
    status: "operational",
    service: "saasfolio-core",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    authProviders,
    authMode: accountsConfigured ? (isSupabaseConfigured() ? "supabase" : "local") : "unavailable",
    minimumPasswordLength: 12,
    checks: {
      catalog: "available",
      accountsConfigured,
      formsConfigured: formsConfigured(),
      newsletterConfigured: Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL),
      responseTimeMs: Math.max(1, Date.now() - startTime),
    },
  };

  return NextResponse.json(healthPayload, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Health-Status": "HEALTHY",
      "X-Service-Name": "saasfolio",
    },
  });
}
