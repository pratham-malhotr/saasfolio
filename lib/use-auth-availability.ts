"use client";

import { useEffect, useState } from "react";

type AuthAvailability = {
  status: "loading" | "available" | "unavailable";
  available: boolean;
  providers: { google: boolean; apple: boolean };
  authMode: "supabase" | "local" | "unavailable";
  minimumPasswordLength: number;
};

const initialAvailability: AuthAvailability = {
  status: "loading", available: false,
  providers: { google: false, apple: false }, authMode: "unavailable",
  minimumPasswordLength: 12,
};

export function useAuthAvailability(): AuthAvailability {
  const [availability, setAvailability] = useState(initialAvailability);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => { setAvailability({ ...initialAvailability, status: "unavailable" }); controller.abort(); }, 8000);
    fetch("/api/health", { cache: "no-store", signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(result => {
        if (controller.signal.aborted) return;
        const available = result.checks?.accountsConfigured === true;
        setAvailability({
          status: available ? "available" : "unavailable", available,
          providers: { google: result.authProviders?.google === true, apple: result.authProviders?.apple === true },
          authMode: ["supabase", "local"].includes(result.authMode) ? result.authMode : "unavailable",
          minimumPasswordLength: Number.isInteger(result.minimumPasswordLength) && result.minimumPasswordLength >= 12 && result.minimumPasswordLength <= 128 ? result.minimumPasswordLength : 12,
        });
      })
      .catch(() => { if (!controller.signal.aborted) setAvailability({ ...initialAvailability, status: "unavailable" }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, []);
  return availability;
}
