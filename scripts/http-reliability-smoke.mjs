import assert from "node:assert/strict";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const origin = new URL(process.argv[2] || "http://127.0.0.1:3238");
assert.ok(origin.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname) && !origin.username && !origin.password && origin.pathname === "/" && !origin.search && !origin.hash, "Concurrency checks are restricted to a local preview");
const { getAllDeals } = loadCatalogModule("lib/data/deals-data.ts");
const offer = getAllDeals()[0];
assert.ok(offer, "A catalog destination is needed for the redirect check");
const cases = [
  { path: "/discounts", status: 200 },
  { path: `/go/${offer.slug}`, status: 302 },
  { path: "/api/admin/offers", status: 401, private: true },
  { path: "/api/account/export", status: 401, private: true },
  // Missing required fields are rejected before rate-limit or database writes.
  { path: "/api/inquiries", status: 400, private: true, init: { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"kind":"contact"}' } },
];
const tasks = Array.from({ length: 60 }, (_, index) => cases[index % cases.length]);
let cursor = 0;
const durations = [];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < tasks.length) {
    const item = tasks[cursor++], start = performance.now();
    const response = await fetch(new URL(item.path, origin), { ...item.init, redirect: "manual", signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, item.status, `${item.path}: status under concurrent requests`);
    if (item.private) {
      assert.match(response.headers.get("cache-control"), /private.*no-store/);
      assert.ok(response.headers.get("x-request-id"));
    }
    if (item.path.startsWith("/go/")) {
      assert.equal(response.headers.get("location"), offer.destinationUrl || offer.affiliateUrl);
      assert.match(response.headers.get("cache-control"), /no-store/);
    }
    await response.arrayBuffer();
    durations.push(performance.now() - start);
  }
}));
durations.sort((a, b) => a - b);
console.log(`Local concurrency check passed: ${tasks.length} requests, 6 workers, search landing, redirect, authorization and invalid-form responses; p95 ${Math.round(durations[Math.ceil(durations.length * .95) - 1])}ms. No external destination was followed or form saved. This is a local reliability check, not production capacity evidence.`);
