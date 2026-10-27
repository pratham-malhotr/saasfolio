import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabasePublicConfig } from "@/lib/auth-config";

type CookieUpdate = { name: string; value: string; options: CookieOptions };

function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

// The admin page is the only current Server Component that reads an account.
// Refresh here, where cookies can reach both the browser and the render request.
// This does not grant access: the page and its APIs perform authorization.
export async function proxy(request: NextRequest) {
  const config = supabasePublicConfig();
  if (!config) return privateResponse(NextResponse.next());
  const prefix = `sb-${new URL(config.url).hostname.split(".")[0]}-auth-token`;
  const sessionCookies = request.cookies.getAll().filter(cookie => cookie.name === prefix ||
    (cookie.name.startsWith(prefix) && /^\.\d+$/.test(cookie.name.slice(prefix.length))));
  if (!sessionCookies.length) return privateResponse(NextResponse.next());

  const pending = new Map<string, CookieUpdate>();
  let unavailable = false;
  try {
    const client = createServerClient(config.url, config.key, {
      auth: { flowType: "pkce" },
      cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: values => {
          for (const cookie of values) {
            const expired = (cookie.options.maxAge !== undefined && cookie.options.maxAge <= 0) ||
              (cookie.options.expires && cookie.options.expires.getTime() <= Date.now());
            if (expired) request.cookies.delete(cookie.name);
            else request.cookies.set(cookie.name, cookie.value);
            pending.set(cookie.name, cookie);
          }
        },
      },
    });
    const { error } = await client.auth.getUser();
    // Invalid/absent sessions continue to the page's own access check. A
    // provider outage is an unavailable response, never a fabricated session.
    unavailable = Boolean(error && ![400, 401, 403].includes(error.status || 0));
  } catch { unavailable = true; }

  // Forward request headers upstream, not as browser response headers. Passing
  // refreshed cookies only to the browser would leave this render using stale
  // tokens and could trigger a second refresh in the Server Component.
  const response = privateResponse(unavailable
    ? new NextResponse("Account services are temporarily unavailable. Please try again.", { status: 503 })
    : NextResponse.next({ request: { headers: new Headers(request.headers) } }));
  for (const { name, value, options } of pending.values()) response.cookies.set(name, value, {
    ...options, domain: undefined, path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
