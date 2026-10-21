import { NextResponse } from "next/server";
import { authConfigured } from "@/lib/server/supabase";

/**
 * Enterprise Health & Liveness Probe
 * 
 * System Design Principle: Observability, Uptime Probing & Auto-Healing
 * Compatible with Kubernetes probes, Cloudflare health checks, AWS ALB, Datadog, and UptimeRobot.
 */

export async function GET() {
  const startTime = Date.now();

  const healthPayload = {
    status: "operational",
    service: "saasfolio-core",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "production",
    checks: {
      catalog: "available",
      accountsConfigured: authConfigured(),
      formsConfigured: authConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      newsletterConfigured: authConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL),
      responseTimeMs: Math.max(1, Date.now() - startTime),
    },
    systemSpecs: {
      framework: "Next.js 16.4.2",
      runtime: "Node.js ESM",
      nodeVersion: process.version,
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
