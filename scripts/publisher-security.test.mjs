import test from "node:test";
import assert from "node:assert/strict";
import { normalizePublicHttpsUrl } from "../lib/public-url.mjs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

test("URL validation preserves campaigns while rejecting private and disguised hosts", () => {
  for (const value of ["javascript:alert(1)", "http://example.com", "https://2130706433", "https://0x7f000001", "https://[::ffff:127.0.0.1]", "https://a.internal.", "https://a.localhost", "https://a.home.arpa", "https://user:pass@example.com"]) assert.equal(normalizePublicHttpsUrl(value), undefined);
  assert.equal(normalizePublicHttpsUrl("https://example.com/path?coupon=SAVE&plan=annual#apply"), "https://example.com/path?coupon=SAVE&plan=annual#apply");
});
test("malformed local discussion data cannot impersonate seeded public activity", () => {
  const { parseLocalThreads } = loadCatalogModule("lib/local-community.ts");
  for (const data of [null, "{", "{}", '[null, {"id":"editorial-1"}]']) assert.deepEqual(parseLocalThreads(data), []);
  const [draft] = parseLocalThreads(JSON.stringify([{ id: "disc-123", slug: "my-question", title: "A question", content: "My local draft", author: { badge: "STAFF ARCHITECT" }, upvotes: 10000 }]));
  assert.equal(draft.author.badge, "LOCAL DRAFT"); assert.equal(draft.upvotes, 0); assert.deepEqual(draft.comments, []);
});
test("public articles and editorial prompts have references and no invented customer activity", () => {
  const { DETAILED_ARTICLES } = loadCatalogModule("lib/data/articles-data.ts");
  const { DETAILED_THREADS } = loadCatalogModule("lib/data/community-data.ts");
  assert.equal(DETAILED_ARTICLES.length, 8);
  for (const article of DETAILED_ARTICLES) {
    assert.equal(article.author.name, "SaaSFolio editorial"); assert.ok(article.sources.length > 0);
    assert.ok(article.sections.length >= 5);
    for (const source of article.sources) assert.ok(normalizePublicHttpsUrl(source.url));
  }
  for (const prompt of DETAILED_THREADS) { assert.equal(prompt.upvotes, 0); assert.equal(prompt.viewsCount, 0); assert.equal(prompt.comments.length, 0); assert.equal(prompt.author.badge, "EDITORIAL"); }
});
