"use client";
import { useEffect, useState } from "react";

export function useServiceAvailability(service: "accountsConfigured" | "formsConfigured" | "newsletterConfigured") {
  const [status, setStatus] = useState<"loading" | "available" | "unavailable">("loading");
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => { setStatus("unavailable"); controller.abort(); }, 8000);
    fetch("/api/health", { cache: "no-store", signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(result => { if (!controller.signal.aborted) setStatus(result.checks?.[service] === true ? "available" : "unavailable"); })
      .catch(() => { if (!controller.signal.aborted) setStatus("unavailable"); })
      .finally(() => window.clearTimeout(timeout));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [service]);
  return { status, available: status === "available" };
}
