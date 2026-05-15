import { describe, it, expect } from "vitest";
import { project, projectTwoBucket, projectOneBucket, type RetirementInputs } from "@/lib/retirement";

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

  it("one-bucket: SIP accumulation grows the corpus before retirement", () => {
    const r = projectOneBucket({ ...base, sequenceMode: "controlled" });
    expect(r.yearsToRetirement).toBeGreaterThan(0);
    // Corpus at retirement should exceed initial corpus + simple SIP sum
    // (ignoring step-up & growth — a very loose lower bound).
    const naiveLowerBound = base.currentCorpus + base.monthlyInvestment * 12 * r.yearsToRetirement;
    expect(r.corpusAtRetirement).toBeGreaterThan(naiveLowerBound * 0.9);
  });

  it("two-bucket: Withdrawal bucket seeded at retirement with Y years + emergency", () => {
    const r = projectTwoBucket({ ...base, sequenceMode: "controlled" });
    const retireRowIdx = r.yearsToRetirement + 1; // year 1 of retirement
    const row = r.rows[retireRowIdx];
    expect(row).toBeDefined();
    expect(row.phase).toBe("retirement");
    // Withdrawal bucket should be non-trivial after seeding.
    expect(row.withdrawal).toBeGreaterThan(0);
    // Some accToWithd transfer must have occurred at year 0.
    expect(row.accToWithd).toBeGreaterThan(0);
  });

  it("three-bucket: emergency reserve is not over-inflated in year 1 of retirement", () => {
    const r = project({ ...base, sequenceMode: "controlled" });
    const firstRetire = r.rows.find((row) => row.phase === "retirement");
    expect(firstRetire).toBeDefined();
    // First retirement-year reserve should equal the inflated-to-retirement
    // emergency amount, NOT inflated one extra year.
    const expected = r.emergencyFundAtRetirement;
    expect(Math.abs(firstRetire!.emergencyReserve - expected)).toBeLessThan(expected * 0.001 + 1);
  });
});