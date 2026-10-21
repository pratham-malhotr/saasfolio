import { NextResponse } from "next/server";
import { authClient } from "@/lib/server/supabase";
import { safeRedirect } from "@/lib/server/http";
import { absoluteUrl } from "@/lib/seo";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    try {
      const client = await authClient();
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(absoluteUrl(safeRedirect(url.searchParams.get("next"))));
    } catch { /* Show a recoverable error without revealing provider details. */ }
  }
  return NextResponse.redirect(absoluteUrl("/login?error=confirmation"));
}
