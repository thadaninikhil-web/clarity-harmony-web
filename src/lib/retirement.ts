// Three-bucket retirement strategy calculator engine.
// All monetary values are in INR. All rates are decimals (e.g. 0.12 = 12%).
//
// See METHODOLOGY.md for the full write-up of the rules implemented here.

export type TransferMode = "annual-topup" | "sequential";
export type StressMode = "crash" | "sequence";
export type SequenceMode = "controlled" | "montecarlo";

export interface MonteCarloResult {
  runs: number;
  successProbability: number;
  successCount: number;
  failureCount: number;
  medianDepletionAge?: number;
  /** Percentiles of depletion age across failed runs (sorted ascending). */
  depletionAgeP10?: number;
  depletionAgeP25?: number;
  depletionAgeP50?: number;
  depletionAgeP75?: number;
  depletionAgeP90?: number;
  p10FinalCorpus: number;
  p25FinalCorpus: number;
  p50FinalCorpus: number;
  p75FinalCorpus: number;
  p90FinalCorpus: number;
  /** Sample of per-run details (capped) for the per-run table view. */
  perRun?: Array<{
    index: number;
    seed: number;
    cagr: number;
    finalCorpus: number;
    depleted: boolean;
    depletionAge?: number;
  }>;
}

export interface RetirementInputs {
  name: string;
  dob: string;
  currentMonthlyExpenses: number;
  inflationRate: number;
  currentCorpus: number;
  monthlyInvestment: number;
  sipStepUpRate: number;
  retirementAge: number;
  lifeExpectancyYears: number;
  lifeExpectancyAge?: number;

  accEquityPct: number;
  accReturn: number;

  prepEquityPct: number;
  prepReturn: number;
  prepYearsBeforeRetirement: number;

  withdrawalYears: number;
  withdrawalReturn: number;

  emergencyFundMonths?: number;
  emergencyFundToday?: number;

  transferMode?: TransferMode;

  stressEnabled: boolean;
  stressMode: StressMode;

  crashPct: number;
  crashYearOffset: number;
  recoveryYears: number;
  stressedAccReturn: number;

  sequenceCagr: number;
  sequenceMinReturn: number;
  sequenceMaxReturn: number;
  sequenceMode: SequenceMode;
  monteCarloRuns: number;
  sequenceSeed: number;
}

export interface YearRow {
  year: number;
  age: number;
  phase: "accumulation" | "retirement";
  accumulation: number;
  preparation: number;
  withdrawal: number;
  total: number;
  contribution: number;
  expense: number;
  withdrawn: number;
  accToPrep: number;
  prepToWithd: number;
  accToWithd: number;
  accReturnApplied: number;
  accOpening: number;
  accGrowth: number;
  prepOpening: number;
  prepGrowth: number;
  withdOpening: number;
  withdGrowth: number;
  emergencyReserve: number;
  emergencyUsed: number;
  note?: string;
  notes?: string[];
}

export interface ProjectionResult {
  rows: YearRow[];
  ageAtStart: number;
  yearsToRetirement: number;
  corpusAtRetirement: number;
  monthlyExpenseAtRetirement: number;
  emergencyFundAtRetirement: number;
  depleted: boolean;
  depletionAge?: number;
  finalCorpus: number;
  emergencyUsedFirstYear?: number;
  emergencyUsedFirstAge?: number;
  emergencyUsedTotal: number;
  currentRunCagr?: number;
  monteCarlo?: MonteCarloResult;
}

const clampMonteCarloRuns = (runs: number) =>
  Math.max(1000, Math.min(10000, Math.round(runs / 100) * 100));

export function emergencyAmountToday(input: RetirementInputs): number {
  if (typeof input.emergencyFundMonths === "number" && input.emergencyFundMonths > 0) {
    return input.currentMonthlyExpenses * input.emergencyFundMonths;
  }
  return input.emergencyFundToday ?? 0;
}

export function emergencyAmountAtRetirement(input: RetirementInputs, yearsToRetirement: number): number {
  return emergencyAmountToday(input) * Math.pow(1 + input.inflationRate, yearsToRetirement);
}

// Going forward all calculators treat the entered corpus as the value on
// retirement day and start the projection at retirement age. SIP / step-up
// questions are intentionally not asked, but if any caller still passes
// them they are zeroed out here so they cannot leak into the math.
function normaliseStartAtRetirement<T extends RetirementInputs>(input: T): T {
  return {
    ...input,
    monthlyInvestment: 0,
    sipStepUpRate: 0,
    prepYearsBeforeRetirement: 0,
  };
}

export function planYears(input: Pick<RetirementInputs, "lifeExpectancyAge" | "lifeExpectancyYears" | "retirementAge">): number {
  if (typeof input.lifeExpectancyAge === "number" && input.lifeExpectancyAge > input.retirementAge) {
    return input.lifeExpectancyAge - input.retirementAge;
  }
  return Math.max(0, input.lifeExpectancyYears || 0);
}

const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return 0;
  const index = (sorted.length - 1) * p;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) return sorted[low];
  return sorted[low] + (sorted[high] - sorted[low]) * (index - low);
};

function attachMonteCarlo(
  input: RetirementInputs,
  runProjection: (next: RetirementInputs) => ProjectionResult,
): MonteCarloResult | undefined {
  if (!input.stressEnabled || input.stressMode !== "sequence" || input.sequenceMode !== "montecarlo") {
    return undefined;
  }
  const runs = clampMonteCarloRuns(input.monteCarloRuns);
  const finals: number[] = [];
  const depletionAges: number[] = [];
  let successes = 0;
  for (let i = 0; i < runs; i++) {
    const projected = runProjection({
      ...input,
      sequenceMode: "controlled",
      sequenceSeed: (input.sequenceSeed + i * 1013904223) >>> 0,
    });
    finals.push(projected.finalCorpus);
    if (!projected.depleted) {
      successes += 1;
    } else if (projected.depletionAge !== undefined) {
      depletionAges.push(projected.depletionAge);
    }
  }
  finals.sort((a, b) => a - b);
  depletionAges.sort((a, b) => a - b);
  return {
    runs,
    successProbability: successes / runs,
    successCount: successes,
    failureCount: runs - successes,
    medianDepletionAge:
      depletionAges.length > 0 ? depletionAges[Math.floor(depletionAges.length / 2)] : undefined,
    depletionAgeP10: depletionAges.length > 0 ? Math.round(percentile(depletionAges, 0.1)) : undefined,
    depletionAgeP25: depletionAges.length > 0 ? Math.round(percentile(depletionAges, 0.25)) : undefined,
    depletionAgeP50: depletionAges.length > 0 ? Math.round(percentile(depletionAges, 0.5)) : undefined,
    depletionAgeP75: depletionAges.length > 0 ? Math.round(percentile(depletionAges, 0.75)) : undefined,
    depletionAgeP90: depletionAges.length > 0 ? Math.round(percentile(depletionAges, 0.9)) : undefined,
    p10FinalCorpus: percentile(finals, 0.1),
    p25FinalCorpus: percentile(finals, 0.25),
    p50FinalCorpus: percentile(finals, 0.5),
    p75FinalCorpus: percentile(finals, 0.75),
    p90FinalCorpus: percentile(finals, 0.9),
  };
}

export interface ValidationIssue {
  field: string;
  message: string;
  rule: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
}

export function validateInputs(input: RetirementInputs): ValidationResult {
  const errors: ValidationIssue[] = [];
  const nowYear = new Date().getFullYear();
  if (!input.dob) {
    errors.push({ field: "dob", rule: "dob is required", message: "Please enter your date of birth." });
  } else {
    const d = new Date(input.dob);
    const yr = d.getFullYear();
    if (isNaN(d.getTime()) || yr < 1900 || yr > nowYear) {
      errors.push({
        field: "dob",
        rule: "1900 <= dob.year <= current year",
        message: `Date of birth year must be between 1900 and ${nowYear} (got ${yr}).`,
      });
    }
  }
  if (!Number.isFinite(input.retirementAge) || input.retirementAge < 18 || input.retirementAge > 100) {
    errors.push({
      field: "retirementAge",
      rule: "18 <= retirementAge <= 100",
      message: `Retirement age must be between 18 and 100 (got ${input.retirementAge}).`,
    });
  }
  const lifeAge = input.lifeExpectancyAge ?? input.retirementAge + (input.lifeExpectancyYears || 0);
  if (!Number.isFinite(lifeAge) || lifeAge <= input.retirementAge) {
    errors.push({
      field: "lifeExpectancyAge",
      rule: "lifeExpectancyAge > retirementAge",
      message: `Life expectancy (${lifeAge}) must be greater than retirement age (${input.retirementAge}).`,
    });
  }
  if (lifeAge > 120) {
    errors.push({
      field: "lifeExpectancyAge",
      rule: "lifeExpectancyAge <= 120",
      message: `Life expectancy of ${lifeAge} is unrealistic. Use a value <= 120.`,
    });
  }
  const ageAtStart = ageFromDob(input.dob);
  const projectionYears = Math.max(0, lifeAge - ageAtStart);
  if (projectionYears > 150) {
    errors.push({
      field: "dob",
      rule: "(lifeExpectancyAge - currentAge) <= 150",
      message: `Total projection horizon of ${projectionYears} years exceeds the 150-year cap.`,
    });
  }
  const finiteFields: Array<[keyof RetirementInputs, string]> = [
    ["currentMonthlyExpenses", "currentMonthlyExpenses"],
    ["inflationRate", "inflationRate"],
    ["currentCorpus", "currentCorpus"],
    ["monthlyInvestment", "monthlyInvestment"],
    ["sipStepUpRate", "sipStepUpRate"],
    ["accReturn", "accReturn"],
    ["withdrawalReturn", "withdrawalReturn"],
    ["sequenceCagr", "sequenceCagr"],
    ["sequenceMinReturn", "sequenceMinReturn"],
    ["sequenceMaxReturn", "sequenceMaxReturn"],
  ];
  for (const [k, label] of finiteFields) {
    const v = input[k] as number;
    if (!Number.isFinite(v)) {
      errors.push({ field: label, rule: `${label} must be a finite number`, message: `${label} is missing or non-numeric.` });
    }
  }
  if (input.sequenceMinReturn > input.sequenceMaxReturn) {
    errors.push({
      field: "sequenceMinReturn",
      rule: "sequenceMinReturn <= sequenceMaxReturn",
      message: "Min year return cannot be greater than max year return.",
    });
  }
  if (input.sequenceCagr < input.sequenceMinReturn || input.sequenceCagr > input.sequenceMaxReturn) {
    errors.push({
      field: "sequenceCagr",
      rule: "sequenceMinReturn <= sequenceCagr <= sequenceMaxReturn",
      message: "Target CAGR must sit inside the bad-year / good-year return range.",
    });
  }
  if (input.emergencyFundMonths !== undefined && (input.emergencyFundMonths < 0 || !Number.isFinite(input.emergencyFundMonths))) {
    errors.push({
      field: "emergencyFundMonths",
      rule: "emergencyFundMonths >= 0",
      message: "Emergency fund (months) must be zero or a positive whole number.",
    });
  }
  return { ok: errors.length === 0, errors };
}

export class InputValidationError extends Error {
  issues: ValidationIssue[];
  constructor(issues: ValidationIssue[]) {
    super(issues[0]?.message ?? "Invalid inputs");
    this.name = "InputValidationError";
    this.issues = issues;
  }
}

export const ageFromDob = (dob: string): number => {
  if (!dob) return 0;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return 0;
  const now = new Date();
  const year = d.getFullYear();
  if (year < 1900 || year > now.getFullYear()) return 0;
  let age = now.getFullYear() - year;
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return Math.max(0, Math.min(120, age));
};

const indianGrouping = (n: number): string =>
  Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const formatINR = (n: number): string => {
  if (!isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  return `${sign}₹${indianGrouping(abs)}`;
};

export const formatINRExact = (n: number): string => {
  if (!isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  return `${sign}₹${indianGrouping(Math.abs(n))}`;
};

export const formatDisplayDate = (value: string): string => {
  if (!value) return "—";
  const [yyyy, mm, dd] = value.split("-").map(Number);
  if (!yyyy || !mm || !dd) return value;
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase().replace(/ /g, "-");
};

export const formatINRPdf = (n: number): string => {
  if (!isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${sign}Rs. ${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}Rs. ${(abs / 1e5).toFixed(2)} L`;
  return `${sign}Rs. ${indianGrouping(abs)}`;
};

export const formatINRExactPdf = (n: number): string => {
  if (!isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  return `${sign}Rs. ${indianGrouping(Math.abs(n))}`;
};

const emptyTransfers = () => ({ accToPrep: 0, prepToWithd: 0, accToWithd: 0 });

// Build a short, scannable bullet list describing what happened in a single
// year. Used by both the on-screen table and the PDF/XLSX exports so the
// "Note" column stays consistent across surfaces.
export function buildYearBullets(
  r: YearRow,
  strategy: "three-bucket" | "two-bucket" | "one-bucket" = "three-bucket",
): string[] {
  const lines: string[] = [];
  const fmt = (n: number) => formatINR(n);
  if (strategy === "one-bucket") {
    if (r.phase === "retirement") {
      lines.push(`Expense: ${fmt(r.expense)}${r.withdrawn < r.expense - 1 ? ` · withdrawn ${fmt(r.withdrawn)} (shortfall)` : ""}`);
      if (r.accGrowth) lines.push(`Corpus growth (${(r.accReturnApplied * 100).toFixed(1)}%): ${fmt(r.accGrowth)}`);
      if (r.emergencyUsed > 0) lines.push(`⚠ Emergency reserve used: ${fmt(r.emergencyUsed)}`);
    }
    return lines;
  }
  if (r.phase === "accumulation") {
    if (r.contribution > 0) lines.push(`SIP contribution: ${fmt(r.contribution)}`);
    if (r.accGrowth) lines.push(`Accumulation growth (${(r.accReturnApplied * 100).toFixed(1)}%): ${fmt(r.accGrowth)}`);
    if (strategy === "three-bucket") {
      if (r.prepGrowth) lines.push(`Preparation growth: ${fmt(r.prepGrowth)}`);
      if (r.accToPrep) lines.push(`Glide-path Acc → Prep: ${fmt(r.accToPrep)}`);
    } else if (r.withdGrowth) {
      lines.push(`Debt sleeve growth: ${fmt(r.withdGrowth)}`);
    }
  } else {
    // retirement
    lines.push(`Expense: ${fmt(r.expense)}${r.withdrawn < r.expense - 1 ? ` · withdrawn ${fmt(r.withdrawn)} (shortfall)` : ""}`);
    if (r.accGrowth) lines.push(`Accumulation growth (${(r.accReturnApplied * 100).toFixed(1)}%): ${fmt(r.accGrowth)}`);
    if (strategy === "three-bucket") {
      if (r.prepGrowth) lines.push(`Preparation growth: ${fmt(r.prepGrowth)}`);
      if (r.withdGrowth) lines.push(`Withdrawal growth: ${fmt(r.withdGrowth)}`);
      if (r.prepToWithd) lines.push(`Refill Prep → Withd: ${fmt(r.prepToWithd)}`);
      if (r.accToPrep) lines.push(`Refill Acc → Prep: ${fmt(r.accToPrep)}`);
      if (r.accToWithd) lines.push(`Last-resort Acc → spend: ${fmt(r.accToWithd)}`);
    } else {
      if (r.withdGrowth) lines.push(`Debt sleeve growth: ${fmt(r.withdGrowth)}`);
      if (r.accToWithd) lines.push(`Rebalance: ${fmt(r.accToWithd)} equity → debt`);
    }
    if (r.emergencyUsed > 0) lines.push(`⚠ Emergency reserve used: ${fmt(r.emergencyUsed)}`);
  }
  return lines;
}

// Attach `notes[]` to every row in a result. Idempotent; safe to call
// multiple times.
export function attachBullets(
  result: ProjectionResult,
  strategy: "three-bucket" | "two-bucket" | "one-bucket" = "three-bucket",
): ProjectionResult {
  for (const r of result.rows) {
    if (!r.notes || r.notes.length === 0) {
      r.notes = buildYearBullets(r, strategy);
    }
  }
  return result;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSequenceReturns(
  years: number,
  cagr: number,
  lo: number,
  hi: number,
  seed: number,
): number[] {
  if (years <= 0) return [];
  const rand = mulberry32(seed >>> 0);
  const safeLo = Math.max(-0.999999, Math.min(lo, hi));
  const safeHi = Math.max(safeLo + 0.000001, hi);
  const safeCagr = Math.max(safeLo, Math.min(safeHi, cagr));
  const loLog = Math.log1p(safeLo);
  const hiLog = Math.log1p(safeHi);
  const targetLog = Math.log1p(safeCagr);

  if (targetLog <= loLog + 1e-12) return Array(years).fill(safeLo);
  if (targetLog >= hiLog - 1e-12) return Array(years).fill(safeHi);

  // Work in log-return space so the arithmetic mean of log(1+r) is exactly the
  // requested CAGR. Pairwise random transfers keep the total log-return fixed,
  // so every generated path has: ∏(1+rᵢ) = (1 + target CAGR)^years. Because we
  // never clamp after the fact, values stay inside the user's min/max range
  // without piling up at either boundary.
  const logs = Array(years).fill(targetLog);
  const iterations = Math.max(200, years * 80);
  for (let iter = 0; iter < iterations; iter++) {
    const i = Math.floor(rand() * years);
    let j = Math.floor(rand() * (years - 1));
    if (j >= i) j += 1;
    const minDelta = Math.max(loLog - logs[i], logs[j] - hiLog);
    const maxDelta = Math.min(hiLog - logs[i], logs[j] - loLog);
    if (maxDelta <= minDelta) continue;
    const delta = minDelta + rand() * (maxDelta - minDelta);
    logs[i] += delta;
    logs[j] -= delta;
  }
  return logs.map((v) => Math.exp(v) - 1);
}

export function projectTwoBucket(rawInput: RetirementInputs): ProjectionResult {
  const input: RetirementInputs = {
    ...normaliseStartAtRetirement(rawInput),
    stressEnabled: true,
    stressMode: "sequence",
    sequenceMode: "montecarlo",
  };
  const ageAtStart = Math.max(ageFromDob(input.dob), input.retirementAge);
  const yearsToRetirement = 0;
  const totalYears = Math.min(150, yearsToRetirement + planYears(input));
  const startYear = new Date().getFullYear();
  const equityWeight = Math.max(0, Math.min(1, input.accEquityPct));
  const debtWeight = 1 - equityWeight;
  let equity = input.currentCorpus * equityWeight;
  let debt = input.currentCorpus * debtWeight;
  let monthlySip = input.monthlyInvestment;
  let emergencyReserve = 0;
  let emergencyUsedTotal = 0;
  let emergencyUsedFirstYear: number | undefined;
  let emergencyUsedFirstAge: number | undefined;
  const emergencyAtRetirement = emergencyAmountAtRetirement(input, yearsToRetirement);
  const sequenceReturns =
    input.stressEnabled && input.stressMode === "sequence"
      ? buildSequenceReturns(totalYears, input.sequenceCagr, input.sequenceMinReturn, input.sequenceMaxReturn, input.sequenceSeed || 1)
      : null;
  const rows: YearRow[] = [];
  let depleted = false;
  let depletionAge: number | undefined;
  rows.push({
    year: startYear, age: ageAtStart, phase: "accumulation",
    accumulation: equity, preparation: 0, withdrawal: debt,
    total: equity + debt, contribution: 0, expense: 0, withdrawn: 0,
    ...emptyTransfers(),
    accReturnApplied: 0, accOpening: equity, accGrowth: 0,
    prepOpening: 0, prepGrowth: 0,
    withdOpening: debt, withdGrowth: 0,
    emergencyReserve: 0, emergencyUsed: 0,
    note: `Starting position — ${(equityWeight * 100).toFixed(0)}/${(debtWeight * 100).toFixed(0)} split`,
  });
  for (let y = 1; y <= totalYears; y++) {
    const age = ageAtStart + y;
    const isRetired = y > yearsToRetirement;
    const yrsSinceRetire = y - yearsToRetirement - 1;
    const equityOpening = equity;
    const debtOpening = debt;
    let equityReturn = input.accReturn;
    let stressNote: string | undefined;
    if (input.stressEnabled) {
      if (input.stressMode === "crash") {
        if (y === input.crashYearOffset) {
          const lossAmount = equity * input.crashPct;
          equity -= lossAmount;
          stressNote = `Equity crash: -${(input.crashPct * 100).toFixed(0)}% (${formatINR(lossAmount)} loss)`;
        }
        const inStress = y >= input.crashYearOffset && y < input.crashYearOffset + input.recoveryYears + 1;
        if (inStress) equityReturn = input.stressedAccReturn;
      } else if (input.stressMode === "sequence" && sequenceReturns) {
        equityReturn = sequenceReturns[y - 1];
        stressNote = `Sequence year: equity return ${(equityReturn * 100).toFixed(1)}%`;
      }
    }
    let contribution = 0;
    let expense = 0;
    let withdrawn = 0;
    let emergencyUsed = 0;
    const transfers = emptyTransfers();
    const notes: string[] = [];
    if (stressNote) notes.push(stressNote);
    equity = equity * (1 + equityReturn);
    debt = debt * (1 + input.withdrawalReturn);
    if (!isRetired) {
      const annualSip = monthlySip * 12;
      equity += annualSip * equityWeight;
      debt += annualSip * debtWeight;
      contribution = annualSip;
      notes.push(`SIP ${formatINR(annualSip)} split ${(equityWeight * 100).toFixed(0)}/${(debtWeight * 100).toFixed(0)}`);
      monthlySip = monthlySip * (1 + input.sipStepUpRate);
    } else {
      if (yrsSinceRetire === 0) {
        emergencyReserve = emergencyAtRetirement;
        notes.push(`Parked ${formatINR(emergencyReserve)} emergency reserve in debt sleeve`);
      } else {
        emergencyReserve = emergencyReserve * (1 + input.inflationRate);
      }
      const annualExpense = input.currentMonthlyExpenses * 12 * Math.pow(1 + input.inflationRate, yearsToRetirement + yrsSinceRetire);
      expense = annualExpense;
      let remaining = annualExpense;
      const spendableDebt = Math.max(0, debt - emergencyReserve);
      const fromDebt = Math.min(spendableDebt, remaining);
      debt -= fromDebt;
      withdrawn += fromDebt;
      remaining -= fromDebt;
      if (remaining > 0) {
        const fromEquity = Math.min(equity, remaining);
        equity -= fromEquity;
        withdrawn += fromEquity;
        remaining -= fromEquity;
        if (fromEquity > 0) notes.push(`Drew ${formatINR(fromEquity)} from equity sleeve`);
      }
      if (remaining > 0 && debt > 0) {
        const fromEmergency = Math.min(debt, remaining);
        debt -= fromEmergency;
        emergencyReserve = Math.max(0, emergencyReserve - fromEmergency);
        withdrawn += fromEmergency;
        remaining -= fromEmergency;
        emergencyUsed = fromEmergency;
        emergencyUsedTotal += fromEmergency;
        if (emergencyUsedFirstYear === undefined) {
          emergencyUsedFirstYear = startYear + y;
          emergencyUsedFirstAge = age;
        }
        notes.push(`⚠ Used emergency reserve: ${formatINR(fromEmergency)}`);
      }
      notes.push(`Spent ${formatINR(annualExpense)}`);
    }
    const portfolio = equity + debt;
    if (portfolio > 0) {
      const targetEquity = portfolio * equityWeight;
      const minDebt = Math.min(debt, emergencyReserve);
      const equityCap = portfolio - minDebt;
      const newEquity = Math.max(0, Math.min(equityCap, targetEquity));
      const newDebt = portfolio - newEquity;
      const flow = newEquity - equity;
      if (Math.abs(flow) > 1) {
        if (flow > 0) {
          transfers.accToWithd = 0;
          notes.push(`Rebalance: ${formatINR(flow)} debt → equity`);
        } else {
          transfers.accToWithd = -flow;
          notes.push(`Rebalance: ${formatINR(-flow)} equity → debt`);
        }
      }
      equity = newEquity;
      debt = newDebt;
    }
    if (equity + debt <= 0 && !depleted) {
      depleted = true;
      depletionAge = age;
      notes.push("⚠ Corpus depleted");
    }
    equity = Math.max(0, equity);
    debt = Math.max(0, debt);
    const accGrowth = equityOpening * equityReturn;
    const withdGrowth = debtOpening * input.withdrawalReturn;
    rows.push({
      year: startYear + y, age,
      phase: isRetired ? "retirement" : "accumulation",
      accumulation: equity, preparation: 0, withdrawal: debt,
      total: equity + debt, contribution, expense, withdrawn,
      ...transfers,
      accReturnApplied: equityReturn,
      accOpening: equityOpening, accGrowth,
      prepOpening: 0, prepGrowth: 0,
      withdOpening: debtOpening, withdGrowth,
      emergencyReserve, emergencyUsed,
      note: notes.join(" · ") || undefined,
    });
  }
  const appliedReturns = rows.slice(1).map((row) => row.accReturnApplied);
  const currentRunCagr = appliedReturns.length
    ? Math.exp(appliedReturns.reduce((sum, r) => sum + Math.log1p(r), 0) / appliedReturns.length) - 1
    : undefined;
  const retireRow = rows[yearsToRetirement] ?? rows[rows.length - 1];
  const output: ProjectionResult = {
    rows, ageAtStart, yearsToRetirement,
    corpusAtRetirement: retireRow.total,
    monthlyExpenseAtRetirement: input.currentMonthlyExpenses * Math.pow(1 + input.inflationRate, yearsToRetirement),
    emergencyFundAtRetirement: emergencyAtRetirement,
    depleted, depletionAge,
    finalCorpus: rows[rows.length - 1].total,
    emergencyUsedFirstYear, emergencyUsedFirstAge, emergencyUsedTotal, currentRunCagr,
  };
  void attachMonteCarlo;
  return output;
}

export function project(rawInput: RetirementInputs): ProjectionResult {
  const input: RetirementInputs = {
    ...normaliseStartAtRetirement(rawInput),
    stressEnabled: true,
    stressMode: "sequence",
    sequenceMode: "montecarlo",
  };
  const ageAtStart = Math.max(ageFromDob(input.dob), input.retirementAge);
  const yearsToRetirement = 0;
  const totalYears = Math.min(150, yearsToRetirement + planYears(input));
  const startYear = new Date().getFullYear();
  let acc = input.currentCorpus;
  let prep = 0;
  let withd = 0;
  let monthlySip = input.monthlyInvestment;
  let emergencyReserve = 0;
  let emergencyUsedTotal = 0;
  let emergencyUsedFirstYear: number | undefined;
  let emergencyUsedFirstAge: number | undefined;
  const emergencyAtRetirement = emergencyAmountAtRetirement(input, yearsToRetirement);
  const sequenceReturns =
    input.stressEnabled && input.stressMode === "sequence"
      ? buildSequenceReturns(totalYears, input.sequenceCagr, input.sequenceMinReturn, input.sequenceMaxReturn, input.sequenceSeed || 1)
      : null;
  const rows: YearRow[] = [];
  let depleted = false;
  let depletionAge: number | undefined;
  rows.push({
    year: startYear, age: ageAtStart, phase: "accumulation",
    accumulation: acc, preparation: 0, withdrawal: 0,
    total: acc, contribution: 0, expense: 0, withdrawn: 0,
    ...emptyTransfers(),
    accReturnApplied: 0,
    accOpening: acc, accGrowth: 0,
    prepOpening: 0, prepGrowth: 0,
    withdOpening: 0, withdGrowth: 0,
    emergencyReserve: 0, emergencyUsed: 0,
    note: "Starting position",
  });
  for (let y = 1; y <= totalYears; y++) {
    const age = ageAtStart + y;
    const isRetired = y > yearsToRetirement;
    const yrsSinceRetire = y - yearsToRetirement - 1;
    const accOpening = acc;
    const prepOpening = prep;
    const withdOpening = withd;
    let accReturn = input.accReturn;
    let stressNote: string | undefined;
    if (input.stressEnabled) {
      if (input.stressMode === "crash") {
        if (y === input.crashYearOffset) {
          const lossAmount = acc * input.crashPct;
          acc = acc - lossAmount;
          stressNote = `Market crash on Acc: -${(input.crashPct * 100).toFixed(0)}% (${formatINR(lossAmount)} loss)`;
        }
        const inStress = y >= input.crashYearOffset && y < input.crashYearOffset + input.recoveryYears + 1;
        if (inStress) accReturn = input.stressedAccReturn;
      } else if (input.stressMode === "sequence" && sequenceReturns) {
        accReturn = sequenceReturns[y - 1];
        stressNote = `Sequence year: Acc return ${(accReturn * 100).toFixed(1)}%`;
      }
    }
    let contribution = 0;
    let expense = 0;
    let withdrawn = 0;
    let emergencyUsed = 0;
    const transfers = emptyTransfers();
    const notes: string[] = [];
    if (stressNote) notes.push(stressNote);
    if (!isRetired) {
      const annualSip = monthlySip * 12;
      acc = acc * (1 + accReturn) + annualSip;
      contribution = annualSip;
      const yearsLeft = yearsToRetirement - y;
      if (yearsLeft >= 0 && yearsLeft < input.prepYearsBeforeRetirement) {
        prep = prep * (1 + input.prepReturn);
        const expensesAtRetire = input.currentMonthlyExpenses * 12 * Math.pow(1 + input.inflationRate, yearsToRetirement);
        const prepTarget = expensesAtRetire * input.prepYearsBeforeRetirement;
        const yearsToGrow = yearsLeft;
        const prepFvNoTopup = prep * Math.pow(1 + input.prepReturn, yearsToGrow);
        const fvGap = Math.max(0, prepTarget - prepFvNoTopup);
        const slicesLeft = yearsLeft + 1;
        const pvOfGap = yearsToGrow === 0 ? fvGap : fvGap / Math.pow(1 + input.prepReturn, yearsToGrow);
        const moveThisYear = Math.max(0, Math.min(acc, pvOfGap / slicesLeft));
        acc -= moveThisYear;
        prep += moveThisYear;
        transfers.accToPrep = moveThisYear;
        if (moveThisYear > 0) notes.push(`Glide-path: moved ${formatINR(moveThisYear)} Acc → Prep`);
      } else {
        prep = prep * (1 + input.prepReturn);
      }
      notes.push(`SIP: ${formatINR(annualSip)}`);
      monthlySip = monthlySip * (1 + input.sipStepUpRate);
    } else {
      const annualExpense = input.currentMonthlyExpenses * 12 * Math.pow(1 + input.inflationRate, yearsToRetirement + yrsSinceRetire);
      expense = annualExpense;
      if (yrsSinceRetire === 0) {
        emergencyReserve = emergencyAtRetirement;
        const target = annualExpense * input.withdrawalYears + emergencyReserve;
        const fromPrep = Math.min(prep, target);
        prep -= fromPrep;
        withd += fromPrep;
        transfers.prepToWithd += fromPrep;
        const remaining = target - fromPrep;
        if (remaining > 0) {
          const fromAcc = Math.min(acc, remaining);
          acc -= fromAcc;
          withd += fromAcc;
          transfers.accToWithd += fromAcc;
        }
        notes.push(`Funded Withdrawal with ${formatINR(target)} (${input.withdrawalYears} yrs of expenses + ${formatINR(emergencyReserve)} emergency reserve)`);
      }
      acc = acc * (1 + accReturn);
      prep = prep * (1 + input.prepReturn);
      withd = withd * (1 + input.withdrawalReturn);
      emergencyReserve = emergencyReserve * (1 + input.inflationRate);
      {
        const spendable = Math.max(0, withd - emergencyReserve);
        const fromW = Math.min(spendable, annualExpense);
        withd -= fromW;
        withdrawn = fromW;
        let short = annualExpense - fromW;
        const nextExpense = annualExpense * (1 + input.inflationRate);
        const withdTargetAfterSpend = nextExpense * input.withdrawalYears + emergencyReserve;
        const refillW = Math.min(prep, Math.max(0, withdTargetAfterSpend - withd));
        prep -= refillW;
        withd += refillW;
        transfers.prepToWithd += refillW;
        if (refillW > 0) notes.push(`Refilled Withdrawal with ${formatINR(refillW)} from Prep`);
        if (short > 0) {
          const extraFromW = Math.min(Math.max(0, withd - emergencyReserve), short);
          withd -= extraFromW;
          withdrawn += extraFromW;
          short -= extraFromW;
          if (extraFromW > 0) notes.push(`Shortfall covered from Withdrawal: ${formatINR(extraFromW)}`);
        }
        if (short > 0 && withd > 0) {
          const fromEmergency = Math.min(withd, short);
          withd -= fromEmergency;
          emergencyReserve = Math.max(0, emergencyReserve - fromEmergency);
          withdrawn += fromEmergency;
          short -= fromEmergency;
          emergencyUsed += fromEmergency;
          emergencyUsedTotal += fromEmergency;
          if (emergencyUsedFirstYear === undefined) {
            emergencyUsedFirstYear = startYear + y;
            emergencyUsedFirstAge = age;
          }
          notes.push(`⚠ Used emergency reserve: ${formatINR(fromEmergency)}`);
        }
        const prepTarget = nextExpense * input.prepYearsBeforeRetirement;
        const refillP = Math.min(acc, Math.max(0, prepTarget - prep));
        acc -= refillP;
        prep += refillP;
        transfers.accToPrep += refillP;
        if (refillP > 0) notes.push(`Refilled Preparation with ${formatINR(refillP)} from Acc`);
        if (short > 0 && acc > 0) {
          const fromA = Math.min(acc, short);
          acc -= fromA;
          withdrawn += fromA;
          transfers.accToWithd += fromA;
          notes.push(`⚠ Last-resort: ${formatINR(fromA)} Acc → spending`);
        }
        notes.push(`Spent ${formatINR(annualExpense)}`);
      }
      if (acc + prep + withd <= 0 && !depleted) {
        depleted = true;
        depletionAge = age;
        notes.push("⚠ Corpus depleted");
      }
    }
    acc = Math.max(0, acc);
    prep = Math.max(0, prep);
    withd = Math.max(0, withd);
    const accGrowth = accOpening * accReturn;
    const prepGrowth = prepOpening * input.prepReturn;
    const withdGrowth = isRetired ? withdOpening * input.withdrawalReturn : 0;
    rows.push({
      year: startYear + y, age,
      phase: isRetired ? "retirement" : "accumulation",
      accumulation: acc, preparation: prep, withdrawal: withd,
      total: acc + prep + withd, contribution, expense, withdrawn,
      ...transfers,
      accReturnApplied: accReturn,
      accOpening, accGrowth, prepOpening, prepGrowth, withdOpening, withdGrowth,
      emergencyReserve, emergencyUsed,
      note: notes.join(" · ") || undefined,
    });
  }
  const appliedReturns = rows.slice(1).map((row) => row.accReturnApplied);
  const currentRunCagr = appliedReturns.length
    ? Math.exp(appliedReturns.reduce((sum, r) => sum + Math.log1p(r), 0) / appliedReturns.length) - 1
    : undefined;
  const retireRow = rows[yearsToRetirement] ?? rows[rows.length - 1];
  const output: ProjectionResult = {
    rows, ageAtStart, yearsToRetirement,
    corpusAtRetirement: retireRow.total,
    monthlyExpenseAtRetirement: input.currentMonthlyExpenses * Math.pow(1 + input.inflationRate, yearsToRetirement),
    emergencyFundAtRetirement: emergencyAtRetirement,
    depleted, depletionAge,
    finalCorpus: rows[rows.length - 1].total,
    emergencyUsedFirstYear, emergencyUsedFirstAge, emergencyUsedTotal, currentRunCagr,
  };
  return output;
}

// One-Bucket: a single sleeve. The entered corpus is the value on retirement
// day. Each year: grow at the sampled return, deduct that year's expenses,
// only break the emergency reserve (months × today's expenses) when the
// remaining corpus can't cover the spend.
export function projectOneBucket(rawInput: RetirementInputs): ProjectionResult {
  const input: RetirementInputs = {
    ...normaliseStartAtRetirement(rawInput),
    stressEnabled: true,
    stressMode: "sequence",
    sequenceMode: "montecarlo",
  };
  const ageAtStart = Math.max(ageFromDob(input.dob), input.retirementAge);
  const yearsToRetirement = 0;
  const totalYears = Math.min(150, planYears(input));
  const startYear = new Date().getFullYear();
  let corpus = input.currentCorpus;
  let emergencyReserve = emergencyAmountToday(input);
  let emergencyUsedTotal = 0;
  let emergencyUsedFirstYear: number | undefined;
  let emergencyUsedFirstAge: number | undefined;
  const sequenceReturns = buildSequenceReturns(
    totalYears,
    input.sequenceCagr,
    input.sequenceMinReturn,
    input.sequenceMaxReturn,
    input.sequenceSeed || 1,
  );
  const rows: YearRow[] = [];
  let depleted = false;
  let depletionAge: number | undefined;
  rows.push({
    year: startYear, age: ageAtStart, phase: "retirement",
    accumulation: corpus, preparation: 0, withdrawal: 0,
    total: corpus, contribution: 0, expense: 0, withdrawn: 0,
    ...emptyTransfers(),
    accReturnApplied: 0, accOpening: corpus, accGrowth: 0,
    prepOpening: 0, prepGrowth: 0,
    withdOpening: 0, withdGrowth: 0,
    emergencyReserve, emergencyUsed: 0,
    note: `Starting position at retirement (incl. ${formatINR(emergencyReserve)} emergency reserve)`,
  });
  for (let y = 1; y <= totalYears; y++) {
    const age = ageAtStart + y;
    const opening = corpus;
    const ret = sequenceReturns[y - 1] ?? input.sequenceCagr;
    corpus = corpus * (1 + ret);
    emergencyReserve = emergencyReserve * (1 + input.inflationRate);
    const annualExpense = input.currentMonthlyExpenses * 12 * Math.pow(1 + input.inflationRate, y - 1);
    const notes: string[] = [`Sequence year: return ${(ret * 100).toFixed(1)}%`];
    let withdrawn = 0;
    let emergencyUsed = 0;
    const spendable = Math.max(0, corpus - emergencyReserve);
    const fromCorpus = Math.min(spendable, annualExpense);
    corpus -= fromCorpus;
    withdrawn = fromCorpus;
    let short = annualExpense - fromCorpus;
    if (short > 0 && corpus > 0) {
      const fromReserve = Math.min(corpus, short);
      corpus -= fromReserve;
      emergencyReserve = Math.max(0, emergencyReserve - fromReserve);
      withdrawn += fromReserve;
      short -= fromReserve;
      emergencyUsed = fromReserve;
      emergencyUsedTotal += fromReserve;
      if (emergencyUsedFirstYear === undefined) {
        emergencyUsedFirstYear = startYear + y;
        emergencyUsedFirstAge = age;
      }
      notes.push(`⚠ Used emergency reserve: ${formatINR(fromReserve)}`);
    }
    notes.push(`Spent ${formatINR(annualExpense)}${withdrawn < annualExpense - 1 ? ` (shortfall ${formatINR(annualExpense - withdrawn)})` : ""}`);
    if (corpus <= 0 && !depleted) {
      depleted = true;
      depletionAge = age;
      notes.push("⚠ Corpus depleted");
    }
    corpus = Math.max(0, corpus);
    rows.push({
      year: startYear + y, age,
      phase: "retirement",
      accumulation: corpus, preparation: 0, withdrawal: 0,
      total: corpus, contribution: 0, expense: annualExpense, withdrawn,
      ...emptyTransfers(),
      accReturnApplied: ret,
      accOpening: opening, accGrowth: opening * ret,
      prepOpening: 0, prepGrowth: 0,
      withdOpening: 0, withdGrowth: 0,
      emergencyReserve, emergencyUsed,
      note: notes.join(" · "),
    });
  }
  const appliedReturns = rows.slice(1).map((r) => r.accReturnApplied);
  const currentRunCagr = appliedReturns.length
    ? Math.exp(appliedReturns.reduce((s, r) => s + Math.log1p(r), 0) / appliedReturns.length) - 1
    : undefined;
  return {
    rows, ageAtStart, yearsToRetirement,
    corpusAtRetirement: input.currentCorpus,
    monthlyExpenseAtRetirement: input.currentMonthlyExpenses,
    emergencyFundAtRetirement: emergencyAmountToday(input),
    depleted, depletionAge,
    finalCorpus: rows[rows.length - 1].total,
    emergencyUsedFirstYear, emergencyUsedFirstAge, emergencyUsedTotal, currentRunCagr,
  };
}
