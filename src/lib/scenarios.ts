import type { RetirementInputs, ProjectionResult } from "@/lib/retirement";

export interface SavedScenario {
  id: string;
  name: string;
  savedAt: number;
  inputs: RetirementInputs;
  summary: {
    yearsToRetirement: number;
    corpusAtRetirement: number;
    monthlyExpenseAtRetirement: number;
    finalCorpus: number;
    depleted: boolean;
    depletionAge?: number;
  };
}

const KEY = "balancing-act:saved-scenarios:v1";

export const loadScenarios = (): SavedScenario[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedScenario[]) : [];
  } catch {
    return [];
  }
};

export const persistScenarios = (list: SavedScenario[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
};

export const saveScenario = (
  name: string,
  inputs: RetirementInputs,
  result: ProjectionResult,
): SavedScenario[] => {
  const list = loadScenarios();
  const scenario: SavedScenario = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || `Scenario ${list.length + 1}`,
    savedAt: Date.now(),
    inputs,
    summary: {
      yearsToRetirement: result.yearsToRetirement,
      corpusAtRetirement: result.corpusAtRetirement,
      monthlyExpenseAtRetirement: result.monthlyExpenseAtRetirement,
      finalCorpus: result.finalCorpus,
      depleted: result.depleted,
      depletionAge: result.depletionAge,
    },
  };
  const next = [scenario, ...list].slice(0, 12);
  persistScenarios(next);
  return next;
};

export const deleteScenario = (id: string): SavedScenario[] => {
  const next = loadScenarios().filter((s) => s.id !== id);
  persistScenarios(next);
  return next;
};