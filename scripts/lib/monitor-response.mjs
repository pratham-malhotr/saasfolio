import assert from "node:assert/strict";

// An error page served with HTTP 200 must still fail the availability check.
export function validateMonitorResponse(path, body, site) {
  const text = body.trim();
  if (path === "/api/health") assert.equal(JSON.parse(text).status, "alive", "liveness response");
  else if (path === "/api/ready") assert.equal(JSON.parse(text).status, "ready", "dependency readiness");
  else if (path === "/") {
    assert.match(text, /<html\b/i, "homepage HTML");
    const canonical = [...text.matchAll(/<link\b[^>]*>/gi)].find(([tag]) => /\brel=["']canonical["']/i.test(tag))?.[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
    assert.equal(canonical, site.href, "homepage canonical");
  } else if (path === "/robots.txt") {
    assert.match(text, /^User-agent:\s*\*\s*$/im, "public robots rules");
    assert.ok(!/^Disallow:\s*\/\s*$/im.test(text), "robots must allow the public site");
    const sitemap = text.match(/^Sitemap:\s*(\S+)\s*$/im)?.[1];
    assert.equal(sitemap, new URL("/sitemap.xml", site).href, "robots sitemap destination");
  } else if (path === "/sitemap.xml") {
    assert.match(text, /<urlset\b[^>]*xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/i, "sitemap URL set");
    assert.ok(/<\/urlset>\s*$/.test(text) && !/<html\b/i.test(text), "complete XML sitemap");
    const locations = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)];
    assert.ok(locations.length > 0, "nonempty sitemap");
    for (const [, value] of locations) {
      const url = new URL(value.replaceAll("&amp;", "&"));
      assert.ok(url.origin === site.origin && !url.username && !url.password, "sitemap locations belong to this site");
    }
  }
}

export async function boundedMonitorBody(response) {
  assert.ok(response.body, "response body");
  const reader = response.body.getReader(), chunks = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 4 * 1024 * 1024) { await reader.cancel(); throw new Error("Monitor response exceeds its limit"); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
