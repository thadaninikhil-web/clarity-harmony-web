import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formatINRPdf,
  formatINRExactPdf,
  type ProjectionResult,
  type RetirementInputs,
} from "@/lib/retirement";
import { buildYearBullets } from "@/lib/retirement";

const INK: [number, number, number] = [20, 20, 20];
const HEAD: [number, number, number] = [40, 40, 40];

function sanitizeForPdf(s: string): string {
  return s
    .replace(/₹/g, "Rs.")
    .replace(/[·•]/g, "-")
    .replace(/[→›]/g, "->")
    .replace(/[←‹]/g, "<-")
    .replace(/⚠/g, "!")
    .replace(/[—–]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E]/g, "");
}

interface ExportOptions {
  showCalculation?: boolean;
  strategy?: "three-bucket" | "two-bucket" | "one-bucket";
}

export function exportRetirementPDF(input: RetirementInputs, result: ProjectionResult, options: ExportOptions = {}) {
  const isTwoBucket = options.strategy === "two-bucket";
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text(isTwoBucket ? "Two-Bucket Retirement Plan" : "Three-Bucket Retirement Plan", 40, 56);

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(
    `${input.name ? input.name + "  -  " : ""}Generated ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
    40,
    74,
  );
  doc.setTextColor(...INK);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("How to use this model", 40, 108);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const howToLines = [
    "Objective: decide if your savings, monthly investment and asset mix are enough to fund retirement",
    isTwoBucket
      ? "without running out of money - using one rebalanced equity/debt portfolio."
      : "without running out of money - and visualise how money should split across three risk buckets.",
    "",
    "1. Enter your personal details and current monthly expenses.",
    isTwoBucket ? "2. Set the equity/debt split and expected sleeve returns." : "2. Set the three buckets:",
    ...(isTwoBucket
      ? ["   - Equity sleeve carries growth risk; debt sleeve funds withdrawals first."]
      : [
          "   - Bucket 1 (Accumulation) - growth engine, equity-heavy, never spent directly.",
          "   - Bucket 2 (Preparation) - balanced buffer, only refills Bucket 3.",
          "   - Bucket 3 (Withdrawal) - debt-only spending account; living expenses come from here.",
        ]),
    isTwoBucket ? "3. Add an emergency fund at today's prices - inflated to retirement and parked in debt." : "3. Add an emergency fund at today's prices - inflated to retirement and parked in Bucket 3.",
    "4. (Optional) Stress-test Accumulation: a one-time crash OR sequence-of-returns risk.",
    "   The conservative buckets (Prep, Withdrawal) are insulated by design.",
    "5. Read the chart, the year-by-year table, and this PDF.",
  ];
  let y = 126;
  for (const line of howToLines) {
    doc.text(line, 40, y);
    y += 14;
  }

  const summary: [string, string][] = [
    ["Current age", String(result.ageAtStart)],
    ["Retirement age", String(input.retirementAge)],
    ["Years to retirement", String(result.yearsToRetirement)],
    ["Life expectancy age", String(input.lifeExpectancyAge ?? (input.retirementAge + input.lifeExpectancyYears))],
    ["Years planned post-retirement", String(input.lifeExpectancyYears)],
    ["Current monthly expenses", formatINRExactPdf(input.currentMonthlyExpenses)],
    ["Inflation", `${(input.inflationRate * 100).toFixed(1)}%`],
    ["Current Retirement Corpus", formatINRExactPdf(input.currentCorpus)],
    ["Monthly SIP", formatINRExactPdf(input.monthlyInvestment)],
    ["SIP step-up", `${(input.sipStepUpRate * 100).toFixed(0)}%`],
    ["Emergency fund (months of expenses)", String(input.emergencyFundMonths || 0)],
    ["Emergency fund (today)", formatINRExactPdf(input.emergencyFundToday ?? input.currentMonthlyExpenses * (input.emergencyFundMonths || 0))],
    ["Emergency fund at retirement", formatINRExactPdf(result.emergencyFundAtRetirement)],
    ["Corpus at retirement", formatINRPdf(result.corpusAtRetirement)],
    ["Monthly expense at retirement", formatINRPdf(result.monthlyExpenseAtRetirement)],
    [
      "Outcome",
      result.depleted
        ? `Depleted at age ${result.depletionAge}`
        : `Sustained - Final corpus ${formatINRPdf(result.finalCorpus)}`,
    ],
  ];

  autoTable(doc, {
    startY: y + 12,
    head: [["Assumption", "Value"]],
    body: summary,
    theme: "grid",
    headStyles: { fillColor: HEAD, textColor: 255 },
    styles: { fontSize: 9, cellPadding: 4, font: "helvetica" },
    columnStyles: { 0: { cellWidth: 240 }, 1: { cellWidth: 220 } },
    margin: { left: 40, right: 40 },
  });

  const buckets: [string, string, string][] = isTwoBucket ? [
    ["Equity sleeve", `${(input.accEquityPct * 100).toFixed(0)}% of portfolio`, `${(input.accReturn * 100).toFixed(1)}% expected`],
    ["Debt sleeve", `${((1 - input.accEquityPct) * 100).toFixed(0)}% of portfolio - rebalanced yearly`, `${(input.withdrawalReturn * 100).toFixed(2)}% expected`],
  ] : [
    ["Accumulation", `${(input.accEquityPct * 100).toFixed(0)}% equity`, `${(input.accReturn * 100).toFixed(1)}% expected`],
    ["Preparation", `${(input.prepEquityPct * 100).toFixed(0)}% equity - starts ${input.prepYearsBeforeRetirement} yrs pre-retirement`, `${(input.prepReturn * 100).toFixed(1)}% expected`],
    ["Withdrawal", `${input.withdrawalYears} yrs of expenses parked - debt only`, `${(input.withdrawalReturn * 100).toFixed(2)}% expected`],
  ];

  let stressLine = "Stress test: disabled";
  if (input.stressEnabled) {
    if (input.stressMode === "crash") {
      stressLine = `Stress test (crash): -${(input.crashPct * 100).toFixed(0)}% in year ${input.crashYearOffset}, ${input.recoveryYears} yr recovery at ${(input.stressedAccReturn * 100).toFixed(1)}%`;
    } else {
      stressLine = `Stress test (sequence risk): CAGR ${(input.sequenceCagr * 100).toFixed(1)}%, min ${(input.sequenceMinReturn * 100).toFixed(0)}%, max ${(input.sequenceMaxReturn * 100).toFixed(0)}%`;
    }
  }

  doc.addPage();
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("Bucket strategy", 40, 44);

  autoTable(doc, {
    startY: 60,
    head: [["Bucket", "Allocation / Strategy", "Return"]],
    body: buckets,
    theme: "grid",
    headStyles: { fillColor: HEAD, textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5, font: "helvetica" },
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: "auto" }, 2: { cellWidth: 130 } },
    margin: { left: 40, right: 40 },
  });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(stressLine, 40, pageHeight - 24);
  doc.setTextColor(...INK);

  doc.addPage();
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text("Year-by-year projection", 40, 44);

  // Scenario disclaimer at top of the year-by-year section.
  const isMC = input.stressEnabled && input.stressMode === "sequence" && input.sequenceMode === "montecarlo";
  if (isMC) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(
      `Showing one of ${input.monteCarloRuns.toLocaleString("en-IN")} Monte Carlo scenarios. See the Monte Carlo summary on the next page for aggregate results.`,
      40,
      58,
    );
    doc.setTextColor(...INK);
  }

  const baseColumns = isTwoBucket
    ? ["Year", "Age", "Phase", "Eq Ret", "Equity", "Debt", "Total", "Contribution", "Expense", "Eq>Debt", "Note"]
    : ["Year", "Age", "Phase", "Acc Ret", "Accumulation", "Preparation", "Withdrawal", "Total", "Contribution", "Expense", "Acc>Prep", "Prep>Withd", "Acc>Withd", "Note"];
  const detailColumns = isTwoBucket
    ? ["Eq open", "Eq growth", "Debt open", "Debt growth", "Withdrawn", "Emergency"]
    : ["Acc open", "Acc growth", "Prep open", "Prep growth", "Withd open", "Withd growth", "Withdrawn", "Emergency"];
  const head = options.showCalculation
    ? [...baseColumns.slice(0, -1), ...detailColumns, "Note"]
    : baseColumns;
  const body = result.rows.map((r) => {
    const base = isTwoBucket ? [
      String(r.year), String(r.age), r.phase,
      `${(r.accReturnApplied * 100).toFixed(1)}%`,
      formatINRPdf(r.accumulation), formatINRPdf(r.withdrawal), formatINRPdf(r.total),
      r.contribution ? formatINRPdf(r.contribution) : "-",
      r.expense ? formatINRPdf(r.expense) : "-",
      r.accToWithd ? formatINRPdf(r.accToWithd) : "-",
    ] : [
      String(r.year), String(r.age), r.phase,
      `${(r.accReturnApplied * 100).toFixed(1)}%`,
      formatINRPdf(r.accumulation), formatINRPdf(r.preparation), formatINRPdf(r.withdrawal),
      formatINRPdf(r.total),
      r.contribution ? formatINRPdf(r.contribution) : "-",
      r.expense ? formatINRPdf(r.expense) : "-",
      r.accToPrep ? formatINRPdf(r.accToPrep) : "-",
      r.prepToWithd ? formatINRPdf(r.prepToWithd) : "-",
      r.accToWithd ? formatINRPdf(r.accToWithd) : "-",
    ];
    const detail = isTwoBucket ? [
      formatINRPdf(r.accOpening),
      r.accGrowth ? formatINRPdf(r.accGrowth) : "-",
      formatINRPdf(r.withdOpening),
      r.withdGrowth ? formatINRPdf(r.withdGrowth) : "-",
      r.withdrawn ? formatINRPdf(r.withdrawn) : "-",
      r.emergencyReserve ? formatINRPdf(r.emergencyReserve) : "-",
    ] : [
      formatINRPdf(r.accOpening),
      r.accGrowth ? formatINRPdf(r.accGrowth) : "-",
      formatINRPdf(r.prepOpening),
      r.prepGrowth ? formatINRPdf(r.prepGrowth) : "-",
      formatINRPdf(r.withdOpening),
      r.withdGrowth ? formatINRPdf(r.withdGrowth) : "-",
      r.withdrawn ? formatINRPdf(r.withdrawn) : "-",
      r.emergencyReserve ? formatINRPdf(r.emergencyReserve) : "-",
    ];
    const noteBullets = (r.notes && r.notes.length > 0
      ? r.notes
      : buildYearBullets(r, isTwoBucket ? "two-bucket" : "three-bucket")
    ).map((s) => `- ${s}`).join("\n");
    return options.showCalculation ? [...base, ...detail, noteBullets] : [...base, noteBullets];
  });

  autoTable(doc, {
    startY: isMC ? 70 : 60,
    head: [[...head]],
    body: body.map((row) => row.map((cell, i) =>
      i === row.length - 1 ? sanitizeForPdf((cell as string) ?? "") : cell,
    )),
    theme: "striped",
    showHead: "everyPage",
    rowPageBreak: "avoid",
    headStyles: { fillColor: HEAD, textColor: 255, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak", font: "helvetica" },
    columnStyles: options.showCalculation
      ? { 0: { cellWidth: 28 }, 1: { cellWidth: 22 }, 2: { cellWidth: 42 } }
      : { 0: { cellWidth: 36 }, 1: { cellWidth: 28 }, 2: { cellWidth: 56 }, 3: { cellWidth: 42, halign: "right" } },
    tableWidth: "auto",
    margin: { left: 20, right: 20 },
    didDrawPage: () => {
      const ph = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text("Educational projection - not investment advice. Returns are nominal.", 40, ph - 16);
      doc.setTextColor(...INK);
    },
  });

  // Monte Carlo aggregate page — separate section, only when MC is on.
  if (isMC && result.monteCarlo) {
    const mc = result.monteCarlo;
    doc.addPage();
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("Monte Carlo aggregate results", 40, 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `These figures summarise all ${mc.runs.toLocaleString("en-IN")} sequence-of-returns scenarios — not just the one shown in the year-by-year table.`,
      40,
      64,
    );
    autoTable(doc, {
      startY: 84,
      head: [["Metric", "Value"]],
      body: [
        ["Scenarios run", mc.runs.toLocaleString("en-IN")],
        ["Survived to life expectancy", `${mc.successCount.toLocaleString("en-IN")} (${(mc.successProbability * 100).toFixed(2)}%)`],
        ["Depleted before life expectancy", mc.failureCount.toLocaleString("en-IN")],
        ["Median depletion age (failed runs)", mc.medianDepletionAge !== undefined ? String(mc.medianDepletionAge) : "n/a"],
      ],
      theme: "grid",
      headStyles: { fillColor: HEAD, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5, font: "helvetica" },
      columnStyles: { 0: { cellWidth: 280 }, 1: { cellWidth: 220 } },
      margin: { left: 40 },
    });
    autoTable(doc, {
      head: [["Percentile", "Final corpus"]],
      body: [
        ["P10 (10% ended below)", formatINRExactPdf(mc.p10FinalCorpus)],
        ["P25 (lower quartile)", formatINRExactPdf(mc.p25FinalCorpus)],
        ["P50 (median)", formatINRExactPdf(mc.p50FinalCorpus)],
        ["P75 (upper quartile)", formatINRExactPdf(mc.p75FinalCorpus)],
        ["P90 (10% ended above)", formatINRExactPdf(mc.p90FinalCorpus)],
      ],
      theme: "grid",
      headStyles: { fillColor: HEAD, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5, font: "helvetica" },
      columnStyles: { 0: { cellWidth: 280 }, 1: { cellWidth: 220 } },
      margin: { left: 40 },
    });
  }

  const fname = `${input.name ? input.name.replace(/\s+/g, "_") + "_" : ""}retirement_plan.pdf`;
  doc.save(fname);
}
