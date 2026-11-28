import test from "node:test";
import assert from "node:assert/strict";
import { estimateFirecrawlCosts } from "../lib/firecrawl-cost.mjs";

const plan = (estimate, name) => estimate.plans.find(item => item.name === name);

test("the calculator reproduces the page's worked example", () => {
  // 500 pages x 4 runs, basic output: 2,000 credits.
  const basic = estimateFirecrawlCosts(500, 4, 1);
  assert.equal(basic.credits, 2_000);
  assert.equal(plan(basic, "Free").total, null, "Free has no top-ups, so 2,000 credits is over its limit");
  assert.equal(plan(basic, "Hobby").total, 19);
  // Same pages with JSON output (5 credits/page): 10,000 credits.
  const json = estimateFirecrawlCosts(500, 4, 5);
  assert.equal(json.credits, 10_000);
  assert.equal(plan(json, "Hobby").overage, 25, "5,000 extra credits at 1,000 per $5");
  assert.equal(plan(json, "Hobby").total, 44);
  assert.equal(plan(json, "Standard").total, 99, "Standard includes 100,000 credits");
});

test("overage is bought in whole $5 blocks at each plan's published rate", () => {
  const estimate = estimateFirecrawlCosts(1, 1_000_001, 1); // 1,000,001 credits
  assert.equal(plan(estimate, "Scale").overage, 5, "one extra credit still buys a full 5,000-credit block");
  assert.equal(plan(estimate, "Growth").overage, Math.ceil(500_001 / 2_500) * 5);
  assert.equal(plan(estimate, "Standard").overage, Math.ceil(900_001 / 2_000) * 5);
});

test("invalid input produces no estimate", () => {
  for (const args of [[0, 4, 1], [500, -1, 1], [1.5, 4, 1], [Number.NaN, 4, 1], [Number.MAX_SAFE_INTEGER, 2, 5]]) {
    assert.equal(estimateFirecrawlCosts(...args), null, JSON.stringify(args));
  }
});
