"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CouponCode({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch { setStatus("manual"); }
  }
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-center gap-3">
      <code className="select-all break-all rounded-xl border border-[#C6FF3D]/50 bg-black px-6 py-4 font-mono text-2xl font-bold text-[#C6FF3D]">{code}</code>
      <button type="button" onClick={copy} className="flex items-center gap-2 rounded-xl bg-[#C6FF3D] px-5 py-3 font-bold text-black" aria-label="Copy coupon code">
        {status === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {status === "copied" ? "Copied" : "Copy code"}
      </button>
    </div>
    <p role="status" className="text-sm text-zinc-400">{status === "copied" ? "Code copied. Paste it at the provider’s checkout and confirm the final price." : status === "manual" ? "Clipboard access is unavailable. Select the code above and copy it manually." : "This code is source-reported; acceptance has not been tested at checkout."}</p>
  </div>;
}
