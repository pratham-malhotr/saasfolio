"use client";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";

export function UnsubscribeClient({ token }: { token: string }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  async function unsubscribe() {
    setStatus("loading"); setError("");
    try { await apiRequest("/api/newsletter/unsubscribe", { token }); setStatus("done"); }
    catch (error) { setStatus("idle"); setError(error instanceof Error ? error.message : "Please try again."); }
  }
  return <div className="space-y-5">
    <h1 className="font-display text-3xl font-bold text-white">{status === "done" ? "You’re unsubscribed" : "Unsubscribe from SaaSFolio"}</h1>
    <p className="text-zinc-400">{status === "done" ? "Your newsletter subscription is now inactive." : "Confirm below to stop newsletter emails. You do not need to sign in."}</p>
    {error && <p role="alert" className="text-rose-400">{error}</p>}
    {status !== "done" && <button onClick={unsubscribe} disabled={status === "loading" || !token} className="px-5 py-3 rounded-xl bg-[#C6FF3D] text-black font-bold disabled:opacity-50">{status === "loading" ? "Updating…" : "Confirm unsubscribe"}</button>}
  </div>;
}
