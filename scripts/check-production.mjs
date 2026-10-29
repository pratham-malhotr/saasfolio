import assert from "node:assert/strict";
import { boundedMonitorBody, validateMonitorResponse } from "./lib/monitor-response.mjs";
const site = new URL(process.env.SITE_URL || "https://saasfolio.tech");
assert.ok(site.protocol === "https:" && !site.username && !site.password && site.pathname === "/" && !site.search && !site.hash, "SITE_URL must be a clean HTTPS origin");
const failures = [];
for (const path of ["/", "/robots.txt", "/sitemap.xml", "/api/health", "/api/ready"]) {
  try {
    const response = await fetch(new URL(path, site), { redirect: "error", signal: AbortSignal.timeout(10000), headers: { "User-Agent": "SaaSFolioMonitor/1.0" } });
    assert.equal(response.status, 200, `HTTP ${response.status}`);
    validateMonitorResponse(path, await boundedMonitorBody(response), site);
    console.log(`${path}: passed`);
  } catch (error) { failures.push(path); console.error(`${path}: ${error.name === "AssertionError" ? error.message.split("\n")[0] : "request unavailable"}`); }
}
if (failures.length) process.exitCode = 1;
