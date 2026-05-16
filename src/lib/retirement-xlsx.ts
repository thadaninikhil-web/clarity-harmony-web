// Excel export using raw numbers and money/percentage formats.

import * as XLSX from "xlsx";
import type { ProjectionResult, RetirementInputs } from "@/lib/retirement";
import { buildYearBullets } from "@/lib/retirement";

interface Options {
  strategy?: "three-bucket" | "two-bucket" | "one-bucket";
}

// Full-precision rupee format — no lakh/crore truncation. Two decimals so
// the on-screen detailed table values reconcile to the rupee.
const moneyFmt = '_-₹* #,##0.00_-;-₹* #,##0.00_-;_-₹* "-"_-;_-@_-';
const pctFmt = "0.0000%";

export function exportRetirementXLSX(
  input: RetirementInputs,
  result: ProjectionResult,
  options: Options = {},
) {
  const isTwoBucket = options.strategy === "two-bucket";
  const strategy = isTwoBucket ? "two-bucket" : "three-bucket";
  const wb = XLSX.utils.book_new();

  const assumptions: (string | number)[][] = [
    ["Field", "Value"],
    ["Name", input.name || ""],
    ["Date of birth", input.dob || ""],
    ["Current age", result.ageAtStart],
    ["Retirement age", input.retirementAge],
    ["Years to retirement", result.yearsToRetirement],
    ["Life expectancy age", input.lifeExpectancyAge ?? (input.retirementAge + input.lifeExpectancyYears)],
    ["Years planned post-retirement", input.lifeExpectancyYears],
    ["Current monthly expenses (₹)", input.currentMonthlyExpenses],
    ["Inflation rate", input.inflationRate],
    ["Current retirement corpus (₹)", input.currentCorpus],
    ["Monthly SIP (₹)", input.monthlyInvestment],
    ["SIP step-up", input.sipStepUpRate],
    ["Emergency fund (months of expenses)", input.emergencyFundMonths || 0],
    ["Emergency fund today (₹)", input.emergencyFundToday ?? input.currentMonthlyExpenses * (input.emergencyFundMonths || 0)],
    ["Emergency fund at retirement (₹)", result.emergencyFundAtRetirement],
    ["Strategy", isTwoBucket ? "Two-bucket" : "Three-bucket"],
    ["Accumulation equity allocation", input.accEquityPct],
    ["Accumulation expected return", input.accReturn],
    ...(isTwoBucket
      ? [
          ["Withdrawal bucket expected return", input.withdrawalReturn] as (string | number)[],
          ["Withdrawal years parked", input.withdrawalYears] as (string | number)[],
        ]
      : [
          ["Preparation equity allocation", input.prepEquityPct] as (string | number)[],
          ["Preparation expected return", input.prepReturn],
          ["Preparation glide-path years", input.prepYearsBeforeRetirement],
          ["Withdrawal years parked", input.withdrawalYears],
          ["Withdrawal expected return", input.withdrawalReturn],
          ["Transfer mode", input.transferMode ?? "annual-topup"],
        ]),
    ["Stress enabled", input.stressEnabled ? "yes" : "no"],
    ["Stress mode", input.stressMode],
    ["Sequence CAGR", input.sequenceCagr],
    ["Sequence min return", input.sequenceMinReturn],
    ["Sequence max return", input.sequenceMaxReturn],
    ["Corpus at retirement (₹)", result.corpusAtRetirement],
    ["Monthly expense at retirement (₹)", result.monthlyExpenseAtRetirement],
    ["Final corpus (₹)", result.finalCorpus],
    ["Outcome", result.depleted ? `Depleted at age ${result.depletionAge}` : "Sustained"],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(assumptions);
  for (let i = 1; i < assumptions.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: i, c: 1 });
    const cell = ws1[cellRef];
    if (!cell || typeof cell.v !== "number") continue;
    const label = String(assumptions[i][0]).toLowerCase();
    if (
      label.includes("rate") || label.includes("return") || label.includes("cagr") ||
      label.includes("step-up") || label.includes("allocation")
    ) {
      cell.z = pctFmt;
    } else if (label.includes("(₹)")) {
      cell.z = moneyFmt;
    }
  }
  ws1["!cols"] = [{ wch: 38 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Assumptions");

  // Year-by-year sheet — grouped per bucket (Start → Addition → Returns →
  // Transfer → Closing) so it scans the way the user reads the on-screen
  // detailed table. Raw rupee precision, no rounding.
  const summaryGroup = ["Summary", "Summary", "Summary", "Summary", "Summary", "Summary"];
  const accGroup = ["Accumulation", "Accumulation", "Accumulation", "Accumulation", "Accumulation"];
  const prepGroup = ["Preparation", "Preparation", "Preparation", "Preparation", "Preparation"];
  const withdGroup = isTwoBucket
    ? ["Withdrawal", "Withdrawal", "Withdrawal", "Withdrawal", "Withdrawal"]
    : ["Withdrawal", "Withdrawal", "Withdrawal", "Withdrawal", "Withdrawal", "Withdrawal"];
  const groupRow = isTwoBucket
    ? [...summaryGroup, ...accGroup, ...withdGroup, "Notes"]
    : [...summaryGroup, ...accGroup, ...prepGroup, ...withdGroup, "Notes"];

  const summaryHeaders = ["Year", "Age", "Phase", "Total corpus (₹)", "Expense (₹)", "Withdrawn (₹)"];
  const accHeaders = ["Acc start (₹)", "Acc addition (₹)", "Acc return %", "Acc growth (₹)", "Acc closing (₹)"];
  const prepHeaders = ["Prep start (₹)", "Prep addition (Acc→Prep) (₹)", "Prep return %", "Prep growth (₹)", "Prep closing (₹)"];
  const withdHeadersTwo = ["Withd start (₹)", "Inflow (Acc→Withd) (₹)", "Withd return %", "Withd growth (₹)", "Withd closing (₹)"];
  const withdHeadersThree = ["Withd start (₹)", "Inflow (Prep→Withd / Acc→Withd) (₹)", "Withd return %", "Withd growth (₹)", "Emergency reserve (₹)", "Withd closing (₹)"];
  const headers = isTwoBucket
    ? [...summaryHeaders, ...accHeaders, ...withdHeadersTwo, "Notes"]
    : [...summaryHeaders, ...accHeaders, ...prepHeaders, ...withdHeadersThree, "Notes"];

  const dataRows = result.rows.map((r) => {
    const bullets = (r.notes && r.notes.length > 0 ? r.notes : buildYearBullets(r, strategy)).join(" \n");
    if (isTwoBucket) {
      return [
        r.year, r.age, r.phase, r.total, r.expense, r.withdrawn,
        // Accumulation bucket
        r.accOpening, r.contribution, r.accReturnApplied, r.accGrowth, r.accumulation,
        // Withdrawal bucket
        r.withdOpening, r.accToWithd, input.withdrawalReturn, r.withdGrowth, r.withdrawal,
        bullets,
      ];
    }
    return [
      r.year, r.age, r.phase, r.total, r.expense, r.withdrawn,
      // Accumulation
      r.accOpening, r.contribution, r.accReturnApplied, r.accGrowth, r.accumulation,
      // Preparation
      r.prepOpening, r.accToPrep, input.prepReturn, r.prepGrowth, r.preparation,
      // Withdrawal
      r.withdOpening, r.prepToWithd + r.accToWithd, input.withdrawalReturn, r.withdGrowth, r.emergencyReserve, r.withdrawal,
      bullets,
    ];
  });

  const ws2 = XLSX.utils.aoa_to_sheet([groupRow, headers, ...dataRows]);
  const moneyColIdx = headers.map((h, i) => (h.includes("(₹)") ? i : -1)).filter((i) => i >= 0);
  const pctColIdx = headers.map((h, i) => (h.toLowerCase().includes("return %") ? i : -1)).filter((i) => i >= 0);
  for (let r = 2; r < dataRows.length + 2; r++) {
    for (const c of pctColIdx) {
      const cell = ws2[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === "number") cell.z = pctFmt;
    }
    for (const c of moneyColIdx) {
      const cell = ws2[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === "number") cell.z = moneyFmt;
    }
  }
  ws2["!cols"] = headers.map((h) => ({ wch: h === "Notes" ? 80 : Math.max(14, h.length + 2) }));
  ws2["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: dataRows.length, c: headers.length - 1 } }) };
  // Merge group-header cells across each section.
  const merges: XLSX.Range[] = [];
  let cursor = 0;
  const groupSizes = isTwoBucket
    ? [summaryHeaders.length, accHeaders.length, withdHeadersTwo.length, 1]
    : [summaryHeaders.length, accHeaders.length, prepHeaders.length, withdHeadersThree.length, 1];
  for (const size of groupSizes) {
    if (size > 1) merges.push({ s: { r: 0, c: cursor }, e: { r: 0, c: cursor + size - 1 } });
    cursor += size;
  }
  ws2["!merges"] = merges;

  // Scenario disclaimer for the year-by-year sheet (sequence + Monte Carlo).
  const isMC = input.stressEnabled && input.stressMode === "sequence" && input.sequenceMode === "montecarlo";
  if (isMC) {
    XLSX.utils.sheet_add_aoa(
      ws2,
      [[`This year-by-year schedule reflects ONE of ${input.monteCarloRuns.toLocaleString("en-IN")} Monte Carlo scenarios. See the "Monte Carlo" sheet for aggregate results across all runs.`]],
      { origin: { r: dataRows.length + 3, c: 0 } },
    );
  }
  XLSX.utils.book_append_sheet(wb, ws2, "Year-by-year");

  // Monte Carlo sheet (only present if MC mode is on).
  const mc = result.monteCarlo;
  if (mc) {
    const mcRows: (string | number)[][] = [
      ["Monte Carlo aggregate results"],
      [`Scenarios run: ${mc.runs.toLocaleString("en-IN")}`],
      [`Survived to life expectancy: ${mc.successCount.toLocaleString("en-IN")} (${(mc.successProbability * 100).toFixed(2)}%)`],
      [`Depleted before life expectancy: ${mc.failureCount.toLocaleString("en-IN")}`],
      [`Median depletion age (failed runs): ${mc.medianDepletionAge ?? "n/a"}`],
      [],
      ["Final corpus distribution across all runs"],
      ["Percentile", "Final corpus (₹)"],
      ["P10", mc.p10FinalCorpus],
      ["P25", mc.p25FinalCorpus],
      ["P50 (median)", mc.p50FinalCorpus],
      ["P75", mc.p75FinalCorpus],
      ["P90", mc.p90FinalCorpus],
      [],
      ["Note: the Year-by-year sheet shows ONE of these scenarios. Re-running or reshuffling will produce a different draw with the same aggregate distribution."],
    ];
    const wsMc = XLSX.utils.aoa_to_sheet(mcRows);
    for (let r = 8; r <= 12; r++) {
      const cell = wsMc[XLSX.utils.encode_cell({ r, c: 1 })];
      if (cell && typeof cell.v === "number") cell.z = moneyFmt;
    }
    wsMc["!cols"] = [{ wch: 28 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, wsMc, "Monte Carlo");
  }

  const fname = `${input.name ? input.name.replace(/\s+/g, "_") + "_" : ""}retirement_plan.xlsx`;
  XLSX.writeFile(wb, fname);
}
