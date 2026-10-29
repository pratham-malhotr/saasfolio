// No destructive policy is inferred. Defaults to a dry run and null retention.
const apply = process.argv.includes("--apply");
if (process.argv.slice(2).some(value => !["--apply", "--dry-run"].includes(value)) || process.argv.includes("--dry-run") && apply) throw new Error("Use --dry-run (default) or --apply.");
const retention = (name, min, max) => { const input = process.env[name]; if (!input) return null; const value = Number(input); if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} must be ${min}–${max} days.`); return value; };
const policy = { dry_run: !apply, inquiry_days: retention("INQUIRY_RETENTION_DAYS", 30, 3650), pending_days: retention("PENDING_NEWSLETTER_RETENTION_DAYS", 2, 365), unsubscribed_days: retention("UNSUBSCRIBED_RETENTION_DAYS", 30, 3650) };
const endpoint = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://missing.invalid");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (endpoint.protocol !== "https:" || endpoint.pathname !== "/" || endpoint.search || endpoint.hash || !key || endpoint.hostname === "missing.invalid") throw new Error("Configure the production Supabase URL and server service key.");
const response = await fetch(new URL("/rest/v1/rpc/platform_maintenance", endpoint), { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(policy), redirect: "error", signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Maintenance was not confirmed (HTTP ${response.status}). Inspect the provider before retrying.`);
console.log(JSON.stringify(await response.json(), null, 2));
