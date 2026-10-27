/** Return a local navigation target without allowing encoded external URLs. */
export function safeAuthRedirect(value: unknown, fallback = "/profile"): string {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//")) return fallback;
  let decoded = value;
  for (let pass = 0; pass < 3; pass++) {
    if (/[\\\u0000-\u0020\u007f]/.test(decoded) || decoded.startsWith("//")) return fallback;
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch { return fallback; }
  }
  if (/[\\\u0000-\u0020\u007f]/.test(decoded) || decoded.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://navigation.invalid");
    if (url.origin !== "https://navigation.invalid") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}
