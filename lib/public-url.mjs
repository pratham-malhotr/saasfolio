// Network-facing links must use public HTTPS domain names, without credentials.
// This is syntactic validation; source collection only uses reviewed URLs.
export function normalizePublicHttpsUrl(value) {
  try {
    if (typeof value !== "string" || !value) return undefined;
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.+$/, "");
    if (url.protocol !== "https:" || url.username || url.password || url.port || !host.includes(".") ||
      host.startsWith("[") || /^\d+(?:\.\d+){3}$/.test(host) ||
      /(?:^|\.)(?:localhost|local|internal|test|invalid|lan)$/.test(host) || host.endsWith(".home.arpa")) return undefined;
    url.hostname = host;
    return url.toString();
  } catch { return undefined; }
}
