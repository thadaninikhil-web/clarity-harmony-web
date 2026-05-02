import { describe, it, expect } from "vitest";
import { project, projectTwoBucket, type RetirementInputs } from "@/lib/retirement";

const base: RetirementInputs = {
  name: "Test",
  dob: "1985-01-01",
  currentMonthlyExpenses: 80000,
  inflationRate: 0.07,
  currentCorpus: 2_000_000,
  monthlyInvestment: 50000,
  sipStepUpRate: 0.08,
  retirementAge: 60,
  lifeExpectancyYears: 30,
  lifeExpectancyAge: 90,
  accEquityPct: 0.7,
  accReturn: 0.10,
  prepEquityPct: 0.3,
  prepReturn: 0.07,
  prepYearsBeforeRetirement: 3,
  withdrawalYears: 3,
  withdrawalReturn: 0.055,
  emergencyFundMonths: 12,
  emergencyFundToday: 80000 * 12,
  transferMode: "annual-topup",
  stressEnabled: true,
  stressMode: "sequence",
  crashPct: 0.3,
  crashYearOffset: 10,
  recoveryYears: 3,
  stressedAccReturn: 0.04,
  sequenceCagr: 0.10,
  sequenceMinReturn: -0.20,
  sequenceMaxReturn: 0.25,
  sequenceMode: "controlled",
  monteCarloRuns: 1000,
  sequenceSeed: 42,
};

describe("retirement engine audits", () => {
  it("three-bucket: depletion year matches displayed schedule (corpus actually 0)", () => {
    // Force tiny corpus + high expenses to guarantee depletion.
    const r = project({
      ...base,
      currentCorpus: 100_000,
      monthlyInvestment: 1000,
      sipStepUpRate: 0,
    });
    if (r.depleted) {
      const depletionRow = r.rows.find((row) => row.age === r.depletionAge);
      expect(depletionRow).toBeDefined();
      // At depletion age, total corpus must be effectively zero.
      expect(depletionRow!.total).toBeLessThanOrEqual(1);
      // Every subsequent row should also be at zero.
      const after = r.rows.filter((row) => row.age > r.depletionAge!);
      for (const row of after) expect(row.total).toBeLessThanOrEqual(1);
    }
  });

  it("three-bucket: total expense met = sum of withdrawn (within rounding) until depletion", () => {
    const r = project(base);
    const retirementRows = r.rows.filter((row) => row.phase === "retirement");
    for (const row of retirementRows) {
      if (r.depleted && row.age >= (r.depletionAge ?? Infinity)) continue;
      // Withdrawn should equal expense (within ₹1) for every funded year.
      expect(Math.abs(row.withdrawn - row.expense)).toBeLessThan(2);
    }
  });

  it("two-bucket: withdrawal sleeve depletion matches displayed depletion age", () => {
    const r = projectTwoBucket({
      ...base,
      currentCorpus: 50_000,
      monthlyInvestment: 500,
      sipStepUpRate: 0,
    });
    if (r.depleted) {
      const depletionRow = r.rows.find((row) => row.age === r.depletionAge);
      expect(depletionRow).toBeDefined();
      expect(depletionRow!.total).toBeLessThanOrEqual(1);
    }
  });

  it("sequence sampler: realised return distribution is roughly uniform across [min, max]", () => {
    // Pull 1000 years' worth of returns and bin them. Each of 5 equal bins
    // should hold ~20% (allow generous slack because of bias-correction).
    const r = project({
      ...base,
      lifeExpectancyAge: 1985 + 1000, // huge horizon
      lifeExpectancyYears: 1000,
      sequenceSeed: 7,
    });
    // Engine caps at 150 years — that's still enough to test distribution.
    const returns = r.rows.slice(1).map((row) => row.accReturnApplied);
    const lo = base.sequenceMinReturn;
    const hi = base.sequenceMaxReturn;
    const bins = [0, 0, 0, 0, 0];
    for (const ret of returns) {
      const t = Math.max(0, Math.min(0.9999, (ret - lo) / (hi - lo)));
      bins[Math.floor(t * 5)] += 1;
    }
    const expectedPerBin = returns.length / 5;
    // No single bin should hold more than 50% of returns (would indicate
    // upper-end clustering bug). And no bin should be empty.
    for (const count of bins) {
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(expectedPerBin * 2.5);
    }
  });
});