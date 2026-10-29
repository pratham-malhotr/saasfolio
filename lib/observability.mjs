// Deliberately excludes messages, stacks, query strings, cookies and form data.
// Operational records should be safe to retain without retaining user content.
const publicRoutes = new Set(["/", "/about", "/brands", "/tools", "/deals", "/discounts", "/articles", "/compare", "/contact", "/advertise", "/privacy", "/terms", "/affiliate-disclosure", "/savings-calculator", "/coupon-codes", "/startup-deals", "/student-discounts", "/nonprofit-discounts", "/login", "/signup", "/profile", "/admin", "/submit", "/reset-password", "/newsletter"]);
const apiRoutes = new Set(["/api/account", "/api/account/export", "/api/account/deletion", "/api/auth/mfa", "/api/health", "/api/ready", "/api/telemetry", "/api/ops/status", "/api/inquiries", "/api/newsletter", "/api/newsletter/unsubscribe", "/api/admin/access", "/api/admin/inquiries", "/api/admin/catalog", "/api/admin/offers", "/api/admin/staff", "/api/admin/audit"]);

export function routeTemplate(value) {
  if (typeof value !== "string") return "unknown";
  const path = value.split(/[?#]/, 1)[0];
  if (publicRoutes.has(path) || apiRoutes.has(path)) return path;
  if (/^\/api\/auth\/(me|login|signup|logout|recover|reset|oauth)$/.test(path)) return path;
  if (/^\/api\/auth\//.test(path)) return "/api/auth/[action]";
  if (/^\/deals\/category\//.test(path)) return "/deals/category/[slug]";
  for (const family of ["tools", "deals", "discounts", "articles", "compare", "community", "go", "u"]) {
    if (path.startsWith(`/${family}/`)) return `/${family}/[slug]`;
  }
  return "other";
}

export function safeIdentifier(value, fallback = "unknown") {
  return typeof value === "string" && /^[a-zA-Z0-9_.:-]{1,100}$/.test(value) ? value : fallback;
}

export function operationalRecord(event, fields = {}) {
  const record = { timestamp: new Date().toISOString(), service: "saasfolio", event: safeIdentifier(event) };
  for (const key of ["requestId", "errorId", "errorName", "digest", "code", "operation", "release", "component"]) {
    if (fields[key] !== undefined) record[key] = safeIdentifier(fields[key]);
  }
  if (fields.route !== undefined) record.route = routeTemplate(fields.route);
  if (Number.isInteger(fields.status) && fields.status >= 100 && fields.status <= 599) record.status = fields.status;
  if (Number.isFinite(fields.durationMs) && fields.durationMs >= 0) record.durationMs = Math.round(fields.durationMs);
  return record;
}

export function catalogFreshness(snapshot, now = Date.now()) {
  const lastRun = Date.parse(snapshot?.lastRun || "");
  const sources = Object.values(snapshot?.sources || {});
  const current = sources.filter(source => source.status === "ok" && Number.isFinite(Date.parse(source.checkedAt)) && Date.parse(source.checkedAt) <= now && now - Date.parse(source.checkedAt) <= 14 * 86400000);
  return { status: !Number.isFinite(lastRun) || lastRun > now || now - lastRun > 26 * 3600000 ? "stale" : "current", lastRun: Number.isFinite(lastRun) ? new Date(lastRun).toISOString() : null, sources: sources.length, currentSources: current.length, failedSources: sources.filter(source => source.status === "error").length };
}
