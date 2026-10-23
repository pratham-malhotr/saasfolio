import test from "node:test";
import assert from "node:assert/strict";
import { compareAnnualBilling } from "../lib/savings.mjs";

test("annual savings compare twelve equivalent monthly payments", () => {
  const result = compareAnnualBilling(50, 480);
  assert.equal(result.monthlyTotal, 600);
  assert.equal(result.annualTotal, 480);
  assert.equal(result.saving, 120);
  assert.equal(result.savingPercent, 20);
  assert.equal(result.effectiveMonthly, 40);
});
test("a membership fee can eliminate an apparent subscription saving", () => {
  const result = compareAnnualBilling(30, 300, 80);
  assert.equal(result.annualTotal, 380);
  assert.equal(result.saving, -20);
  assert.ok(result.savingPercent < 0);
  assert.equal(compareAnnualBilling(30, 300, 60).saving, 0);
});
test("zero-cost annual quotes remain valid but cannot fabricate a monthly baseline", () => {
  assert.equal(compareAnnualBilling(10, 0, 0).savingPercent, 100);
  assert.equal(compareAnnualBilling(0, 0), null);
});
test("invalid, negative and unbounded quotes do not produce financial results", () => {
  for (const values of [[-1, 10], [20, -1], [20, 100, -1], [NaN, 10], [20, Infinity], [20, 100, NaN], ["20", 100], [1e10, 100]]) assert.equal(compareAnnualBilling(...values), null);
});
