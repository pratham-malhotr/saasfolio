import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (error, _request, context) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { recordException } = await import("@/lib/server/observability");
    recordException(error, { route: context.routePath, operation: context.routeType, status: 500 });
  }
};
