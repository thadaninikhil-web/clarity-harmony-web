// In-memory Monte Carlo result cache.

import type { MonteCarloResult, RetirementInputs } from "@/lib/retirement";

const MC_KEYS: Array<keyof RetirementInputs> = [
  "dob", "currentMonthlyExpenses", "inflationRate", "currentCorpus",
  "monthlyInvestment", "sipStepUpRate", "retirementAge",
  "lifeExpectancyYears", "lifeExpectancyAge",
  "accEquityPct", "accReturn", "prepEquityPct", "prepReturn",
  "prepYearsBeforeRetirement", "withdrawalYears", "withdrawalReturn",
  "emergencyFundMonths", "emergencyFundToday",
  "stressEnabled", "stressMode", "crashPct", "crashYearOffset",
  "recoveryYears", "stressedAccReturn",
  "sequenceCagr", "sequenceMinReturn", "sequenceMaxReturn",
  "sequenceMode", "monteCarloRuns", "sequenceSeed",
];

export function mcCacheKey(input: RetirementInputs, strategy: "three-bucket" | "two-bucket" | "one-bucket"): string {
  const slice: Record<string, unknown> = { strategy };
  for (const k of MC_KEYS) slice[k as string] = input[k];
  return JSON.stringify(slice);
}

interface CacheEntry { key: string; value: MonteCarloResult }
const MAX_ENTRIES = 20;
const cache: CacheEntry[] = [];

export function getCachedMC(key: string): MonteCarloResult | undefined {
  const idx = cache.findIndex((e) => e.key === key);
  if (idx < 0) return undefined;
  const [hit] = cache.splice(idx, 1);
  cache.push(hit);
  return hit.value;
}

export function setCachedMC(key: string, value: MonteCarloResult): void {
  const idx = cache.findIndex((e) => e.key === key);
  if (idx >= 0) cache.splice(idx, 1);
  cache.push({ key, value });
  while (cache.length > MAX_ENTRIES) cache.shift();
}

export function clearMCCache(): void {
  cache.length = 0;
}