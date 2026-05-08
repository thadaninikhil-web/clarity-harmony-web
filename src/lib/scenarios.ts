import type { RetirementInputs, ProjectionResult } from "@/lib/retirement";

export interface SavedScenario {
  id: string;
  name: string;
  savedAt: number;
  /** Optional namespace so SWR scenarios don't mix with retirement ones. */
  kind?: string;
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

export const loadScenarios = (kind?: string): SavedScenario[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const all = raw ? (JSON.parse(raw) as SavedScenario[]) : [];
    if (!kind) return all.filter((s) => !s.kind);
    return all.filter((s) => s.kind === kind);
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
  kind?: string,
): SavedScenario[] => {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
  const all: SavedScenario[] = raw ? JSON.parse(raw) : [];
  const scenario: SavedScenario = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || `Scenario ${all.length + 1}`,
    savedAt: Date.now(),
    kind,
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
  const next = [scenario, ...all].slice(0, 24);
  persistScenarios(next);
  return kind ? next.filter((s) => s.kind === kind) : next.filter((s) => !s.kind);
};

export const deleteScenario = (id: string, kind?: string): SavedScenario[] => {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
  const all: SavedScenario[] = raw ? JSON.parse(raw) : [];
  const next = all.filter((s) => s.id !== id);
  persistScenarios(next);
  return kind ? next.filter((s) => s.kind === kind) : next.filter((s) => !s.kind);
};

/**
 * Encode inputs into a compact base64 string suitable for URL fragments.
 * Lives here so any calculator can build a shareable link.
 */
export const encodeInputsToHash = (inputs: RetirementInputs): string => {
  try {
    const json = JSON.stringify(inputs);
    const b64 = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(json))) : "";
    return b64.replace(/=+$/, "");
  } catch {
    return "";
  }
};

export const decodeInputsFromHash = (hash: string): Partial<RetirementInputs> | null => {
  try {
    const clean = hash.replace(/^#?s=/, "").trim();
    if (!clean) return null;
    const padded = clean + "===".slice((clean.length + 3) % 4);
    const json = decodeURIComponent(escape(window.atob(padded)));
    return JSON.parse(json) as Partial<RetirementInputs>;
  } catch {
    return null;
  }
};