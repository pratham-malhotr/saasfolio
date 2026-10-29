"use client";
import { MfaSettings } from "@/components/auth/MfaSettings";
export function AdminMfaGate() {
  return <div className="max-w-2xl mx-auto px-4 pt-32 pb-24"><MfaSettings required onVerified={() => window.location.reload()} /></div>;
}
