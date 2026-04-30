// Excel export using raw numbers and money/percentage formats.

import * as XLSX from "xlsx";
import type { ProjectionResult, RetirementInputs } from "@/lib/retirement";

interface Options {
  strategy?: "three-bucket" | "two-bucket";
}

const moneyFmt = '_-₹* #,##0_-;-₹* #,##0_-;_-₹* "-"_-;_-@_-';
const pctFmt = "0.00%";

export function exportRetirementXLSX(
  input: RetirementInputs,
  result: ProjectionResult,
  options: Options = {},
) {
  const isTwoBucket = options.strategy === "two-bucket";
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
    ["Equity allocation (acc / equity sleeve)", input.accEquityPct],
    ["Accumulation expected return", input.accReturn],
    ...(isTwoBucket
      ? [["Debt sleeve expected return", input.withdrawalReturn] as (string | number)[]]
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

  const headers = isTwoBucket
    ? [
        "Year", "Age", "Phase", "Eq Return", "Equity (₹)", "Debt (₹)", "Total (₹)",
        "Contribution (₹)", "Expense (₹)", "Eq → Debt rebalance (₹)",
        "Eq opening (₹)", "Eq growth (₹)", "Debt opening (₹)", "Debt growth (₹)",
        "Withdrawn (₹)", "Emergency reserve (₹)", "Note",
      ]
    : [
        "Year", "Age", "Phase", "Acc Return",
        "Accumulation (₹)", "Preparation (₹)", "Withdrawal (₹)", "Total (₹)",
        "Contribution (₹)", "Expense (₹)",
        "Acc → Prep (₹)", "Prep → Withd (₹)", "Acc → Withd (₹)",
        "Acc opening (₹)", "Acc growth (₹)",
        "Prep opening (₹)", "Prep growth (₹)",
        "Withd opening (₹)", "Withd growth (₹)",
        "Withdrawn (₹)", "Emergency reserve (₹)", "Note",
      ];

  const dataRows = result.rows.map((r) =>
    isTwoBucket
      ? [
          r.year, r.age, r.phase, r.accReturnApplied,
          Math.round(r.accumulation), Math.round(r.withdrawal), Math.round(r.total),
          Math.round(r.contribution), Math.round(r.expense), Math.round(r.accToWithd),
          Math.round(r.accOpening), Math.round(r.accGrowth),
          Math.round(r.withdOpening), Math.round(r.withdGrowth),
          Math.round(r.withdrawn), Math.round(r.emergencyReserve),
          r.note ?? "",
        ]
      : [
          r.year, r.age, r.phase, r.accReturnApplied,
          Math.round(r.accumulation), Math.round(r.preparation), Math.round(r.withdrawal),
          Math.round(r.total),
          Math.round(r.contribution), Math.round(r.expense),
          Math.round(r.accToPrep), Math.round(r.prepToWithd), Math.round(r.accToWithd),
          Math.round(r.accOpening), Math.round(r.accGrowth),
          Math.round(r.prepOpening), Math.round(r.prepGrowth),
          Math.round(r.withdOpening), Math.round(r.withdGrowth),
          Math.round(r.withdrawn), Math.round(r.emergencyReserve),
          r.note ?? "",
        ],
  );

  const ws2 = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  const moneyColIdx = headers.map((h, i) => (h.includes("(₹)") ? i : -1)).filter((i) => i >= 0);
  for (let r = 1; r <= dataRows.length; r++) {
    const retCell = ws2[XLSX.utils.encode_cell({ r, c: 3 })];
    if (retCell && typeof retCell.v === "number") retCell.z = pctFmt;
    for (const c of moneyColIdx) {
      const cell = ws2[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === "number") cell.z = moneyFmt;
    }
  }
  ws2["!cols"] = headers.map((h) => ({ wch: h === "Note" ? 60 : Math.max(12, h.length + 2) }));
  ws2["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: dataRows.length, c: headers.length - 1 } }) };
  XLSX.utils.book_append_sheet(wb, ws2, "Year-by-year");

  const fname = `${input.name ? input.name.replace(/\s+/g, "_") + "_" : ""}retirement_plan.xlsx`;
  XLSX.writeFile(wb, fname);
}
