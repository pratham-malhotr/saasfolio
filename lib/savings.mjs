// Compare quoted prices for the same plan, currency and twelve-month period.
export function compareAnnualBilling(monthly, annual, accessFee = 0) {
  if (![monthly, annual, accessFee].every(value => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1e9) || monthly === 0) return null;
  const monthlyTotal = monthly * 12;
  const annualTotal = annual + accessFee;
  const saving = monthlyTotal - annualTotal;
  return { monthlyTotal, annualTotal, saving, savingPercent: saving / monthlyTotal * 100, effectiveMonthly: annualTotal / 12 };
}
