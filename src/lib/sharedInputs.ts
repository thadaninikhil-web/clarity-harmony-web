import type { RetirementInputs } from "@/lib/retirement";

export const SHARED_INPUTS_KEY = "ba.sharedInputs";
const SHARED_INPUTS_EVENT = "ba:shared-inputs-changed";

export const SHARED_KEYS = [
  "name",
  "dob",
  "currentMonthlyExpenses",
  "inflationRate",
  "currentCorpus",
  "monthlyInvestment",
  "sipStepUpRate",
  "retirementAge",
  "lifeExpectancyYears",
  "lifeExpectancyAge",
  "emergencyFundToday",
  "emergencyFundMonths",
  "accEquityPct",
  "accReturn",
  "prepEquityPct",
  "prepReturn",
  "prepYearsBeforeRetirement",
  "withdrawalYears",
  "withdrawalReturn",
  "transferMode",
  "stressEnabled",
  "stressMode",
  "crashPct",
  "crashYearOffset",
  "recoveryYears",
  "stressedAccReturn",
  "sequenceCagr",
  "sequenceMinReturn",
  "sequenceMaxReturn",
  "sequenceMode",
  "monteCarloRuns",
] as const;

export type SharedInputs = Pick<RetirementInputs, (typeof SHARED_KEYS)[number]>;

export function pickShared(values: RetirementInputs): SharedInputs {
  const out = {} as SharedInputs;
  for (const k of SHARED_KEYS) {
    (out as Record<string, unknown>)[k] = values[k];
  }
  return out;
}

export function readShared(): Partial<SharedInputs> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHARED_INPUTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SharedInputs>;
  } catch {
    return null;
  }
}

export function writeShared(values: RetirementInputs): void {
  if (typeof window === "undefined") return;
  try {
    const payload = pickShared(values);
    window.localStorage.setItem(SHARED_INPUTS_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(SHARED_INPUTS_EVENT));
  } catch {
    // ignore
  }
}

export function subscribeShared(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === SHARED_INPUTS_KEY) handler();
  };
  const onCustom = () => handler();
  window.addEventListener("storage", onStorage);
  window.addEventListener(SHARED_INPUTS_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SHARED_INPUTS_EVENT, onCustom);
  };
}