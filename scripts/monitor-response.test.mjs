import test from "node:test";
import assert from "node:assert/strict";
import { boundedMonitorBody, validateMonitorResponse } from "./lib/monitor-response.mjs";
const site = new URL("https://example.com/");
test("monitor rejects HTTP-200 error bodies, wrong canonicals and invalid robots/sitemap destinations", () => {
  validateMonitorResponse("/", '<html><head><link href="https://example.com/" rel="canonical"></head><body>Home</body></html>', site);
  validateMonitorResponse("/robots.txt", "User-agent: *\nDisallow: /api/\nSitemap: https://example.com/sitemap.xml", site);
  const xml = location => `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${location}</loc></url></urlset>`;
  validateMonitorResponse("/sitemap.xml", xml("https://example.com/discounts/example"), site);
  for (const [path, body] of [["/", "Upstream error"], ["/", '<html><link rel="canonical" href="https://wrong.example/">'], ["/robots.txt", "<html>Challenge</html>"], ["/robots.txt", "User-agent: *\nDisallow: /\nSitemap: https://example.com/sitemap.xml"], ["/sitemap.xml", xml("https://wrong.example/")], ["/sitemap.xml", xml("https://example.com/").replace("</urlset>", "")], ["/api/health", '{"status":"operational"}'], ["/api/ready", '{"status":"not_ready"}']]) assert.throws(() => validateMonitorResponse(path, body, site));
});
test("monitor bounds response bytes rather than trusting content-length", async () => {
  assert.equal(await boundedMonitorBody(new Response("Small response")), "Small response");
  await assert.rejects(() => boundedMonitorBody(new Response("x".repeat(4 * 1024 * 1024 + 1), { headers: { "Content-Length": "1" } })), /limit/);
});
