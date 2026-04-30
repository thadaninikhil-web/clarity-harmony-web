// Async / chunked Monte Carlo runner.

import type { MonteCarloResult, ProjectionResult, RetirementInputs } from "@/lib/retirement";
import { getCachedMC, mcCacheKey, setCachedMC } from "@/lib/retirement-mc-cache";

const CHUNK = 100;

const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return 0;
  const index = (sorted.length - 1) * p;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) return sorted[low];
  return sorted[low] + (sorted[high] - sorted[low]) * (index - low);
};

const clampRuns = (runs: number) =>
  Math.max(1000, Math.min(10000, Math.round(runs / 100) * 100));

export interface RunMonteCarloOptions {
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
  strategy?: "three-bucket" | "two-bucket";
}

type Schedule = (cb: () => void) => void;
const schedule: Schedule =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (cb) => (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(cb)
    : (cb) => setTimeout(cb, 0);

export function runMonteCarloAsync(
  input: RetirementInputs,
  runProjection: (next: RetirementInputs) => ProjectionResult,
  options: RunMonteCarloOptions = {},
): Promise<MonteCarloResult | undefined> {
  return new Promise((resolve, reject) => {
    if (
      !input.stressEnabled ||
      input.stressMode !== "sequence" ||
      input.sequenceMode !== "montecarlo"
    ) {
      resolve(undefined);
      return;
    }
    const cacheKey = options.strategy ? mcCacheKey(input, options.strategy) : null;
    if (cacheKey) {
      const hit = getCachedMC(cacheKey);
      if (hit) {
        options.onProgress?.(hit.runs, hit.runs);
        resolve(hit);
        return;
      }
    }
    const runs = clampRuns(input.monteCarloRuns);
    const finals: number[] = [];
    const depletionAges: number[] = [];
    let successes = 0;
    let i = 0;
    const tick = () => {
      if (options.signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      const end = Math.min(i + CHUNK, runs);
      for (; i < end; i++) {
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
      options.onProgress?.(i, runs);
      if (i < runs) {
        schedule(tick);
      } else {
        finals.sort((a, b) => a - b);
        depletionAges.sort((a, b) => a - b);
        const result: MonteCarloResult = {
          runs,
          successProbability: successes / runs,
          successCount: successes,
          failureCount: runs - successes,
          medianDepletionAge:
            depletionAges.length > 0
              ? depletionAges[Math.floor(depletionAges.length / 2)]
              : undefined,
          p10FinalCorpus: percentile(finals, 0.1),
          p25FinalCorpus: percentile(finals, 0.25),
          p50FinalCorpus: percentile(finals, 0.5),
          p75FinalCorpus: percentile(finals, 0.75),
          p90FinalCorpus: percentile(finals, 0.9),
        };
        if (cacheKey) setCachedMC(cacheKey, result);
        resolve(result);
      }
    };
    schedule(tick);
  });
}