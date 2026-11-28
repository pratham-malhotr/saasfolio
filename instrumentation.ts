import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { startBrandReviewScheduler } = await import("@/lib/server/brand-review-scheduler");
    startBrandReviewScheduler();
  }
}

export const onRequestError: Instrumentation.onRequestError = async (error, _request, context) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { recordException } = await import("@/lib/server/observability");
    recordException(error, { route: context.routePath, operation: context.routeType, status: 500 });
  }
};
