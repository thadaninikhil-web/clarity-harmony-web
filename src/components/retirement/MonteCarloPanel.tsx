// Shared Monte Carlo results panel — used by both the Three-bucket and
// Two-bucket pages so any future change (UI, copy, metrics) flows to both.

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Wand2 } from "lucide-react";
import {
  formatINR,
  project,
  projectTwoBucket,
  type MonteCarloResult,
  type ProjectionResult,
  type RetirementInputs,
} from "@/lib/retirement";
import { runMonteCarloAsync } from "@/lib/retirement-mc";

interface Props {
  inputs: RetirementInputs;
  result: ProjectionResult;
  strategy: "three-bucket" | "two-bucket";
  onReshuffle?: () => void;
  onSipSolved?: (monthlySip: number) => void;
}

export function MonteCarloPanel({ inputs, result, strategy, onReshuffle, onSipSolved }: Props) {

  const [mc, setMc] = useState<MonteCarloResult | undefined>(result.monteCarlo);
  const [progress, setProgress] = useState({ done: 0, total: 0, running: false });
  
  const abortRef = useRef<AbortController | null>(null);

  // Solver state
  const [targetPct, setTargetPct] = useState<number>(85);
  const [solving, setSolving] = useState(false);
  const [solverProgress, setSolverProgress] = useState<{ iter: number; sip: number; conf: number } | null>(null);
  const [solverResult, setSolverResult] = useState<{ sip: number; conf: number } | null>(null);
  const solverAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setProgress({ done: 0, total: inputs.monteCarloRuns, running: true });
    const runner = strategy === "two-bucket" ? projectTwoBucket : project;
    // Force MC-mode inputs for the runner regardless of saved state.
    const mcInputs = {
      ...inputs,
      stressEnabled: true,
      stressMode: "sequence" as const,
      sequenceMode: "montecarlo" as const,
    };
    runMonteCarloAsync(mcInputs, runner, {
      signal: ctrl.signal,
      strategy,
      onProgress: (done, total) => setProgress({ done, total, running: done < total }),
    })
      .then((r) => {
        if (!ctrl.signal.aborted) {
          setMc(r);
          setProgress((p) => ({ ...p, running: false }));
        }
      })
      .catch(() => {
        /* aborted */
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputs.monteCarloRuns,
    inputs.sequenceSeed,
    inputs.sequenceCagr,
    inputs.sequenceMinReturn,
    inputs.sequenceMaxReturn,
    inputs.accReturn,
    inputs.accEquityPct,
    inputs.withdrawalReturn,
    inputs.currentCorpus,
    inputs.monthlyInvestment,
    inputs.sipStepUpRate,
    inputs.currentMonthlyExpenses,
    inputs.inflationRate,
    inputs.retirementAge,
    inputs.lifeExpectancyYears,
    inputs.lifeExpectancyAge,
    inputs.emergencyFundToday,
    inputs.emergencyFundMonths,
    inputs.dob,
    strategy,
  ]);

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  const reshuffle = () => {
    onReshuffle?.();
  };

  // Solver: binary search the monthly SIP that hits the target probability.
  // Use a smaller-but-fast MC pass per probe (cap at 1500 runs) for speed.
  const runSolver = async () => {
    if (solving) return;
    setSolverResult(null);
    setSolving(true);
    const ctrl = new AbortController();
    solverAbortRef.current?.abort();
    solverAbortRef.current = ctrl;
    const target = Math.max(0.01, Math.min(0.99, targetPct / 100));
    const runner = strategy === "two-bucket" ? projectTwoBucket : project;
    const probeRuns = Math.min(1500, inputs.monteCarloRuns);

    const probe = async (sip: number): Promise<number> => {
      const r = await runMonteCarloAsync(
        { ...inputs, monthlyInvestment: sip, monteCarloRuns: probeRuns },
        runner,
        { signal: ctrl.signal, strategy },
      );
      return r?.successProbability ?? 0;
    };

    try {
      let lo = 0;
      let hi = Math.max(inputs.monthlyInvestment * 2, 100000);
      // Expand hi until we likely exceed target
      for (let i = 0; i < 6; i++) {
        const c = await probe(hi);
        if (ctrl.signal.aborted) return;
        setSolverProgress({ iter: i + 1, sip: hi, conf: c });
        if (c >= target) break;
        lo = hi;
        hi *= 2;
        if (hi > 5_000_000) break;
      }
      // Binary search ~12 iterations
      let best = { sip: hi, conf: 0 };
      for (let i = 0; i < 12; i++) {
        if (ctrl.signal.aborted) return;
        const mid = (lo + hi) / 2;
        const c = await probe(mid);
        setSolverProgress({ iter: i + 7, sip: mid, conf: c });
        if (c >= target) {
          best = { sip: mid, conf: c };
          hi = mid;
        } else {
          lo = mid;
        }
        if (hi - lo < 500) break;
      }
      setSolverResult({ sip: Math.round(best.sip / 100) * 100, conf: best.conf });
    } finally {
      setSolving(false);
      setSolverProgress(null);
    }
  };

  const applySolved = () => {
    if (!solverResult || !onSipSolved) return;
    onSipSolved(solverResult.sip);
  };

  return (
    <div className="space-y-4">
      {/* Confidence + progress */}
      <div className="rounded-md border border-border bg-primary/5 p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="label-caps">Confidence portfolio outlasts life expectancy</div>
            <div className="mt-1 text-3xl font-serif tabular-nums">
              {progress.running || !mc
                ? "…"
                : `${(mc.successProbability * 100).toFixed(1)}%`}
            </div>
            {mc && !progress.running && (
              <div className="mt-1 text-xs text-muted-foreground">
                {mc.successCount.toLocaleString("en-IN")} survived ·{" "}
                {mc.failureCount.toLocaleString("en-IN")} depleted of {mc.runs.toLocaleString("en-IN")} runs
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <div>
              {progress.done.toLocaleString("en-IN")} /{" "}
              {progress.total.toLocaleString("en-IN")} runs
            </div>
            {mc?.medianDepletionAge !== undefined && !progress.running && (
              <div className="mt-1">
                Median depletion age (failed runs):{" "}
                <span className="font-medium text-foreground">{mc.medianDepletionAge}</span>
              </div>
            )}
          </div>
        </div>
        {progress.running && (
          <div className="mt-3">
            <Progress value={pct} />
            <p className="mt-1 text-xs text-muted-foreground">
              Simulating sequence-of-returns scenarios…
            </p>
          </div>
        )}
      </div>

      {/* Percentile bands — now showing P10/P25/P50/P75/P90 */}
      {mc && !progress.running && (
        <div className="grid gap-3 sm:grid-cols-5">
          {[
            { label: "P10", v: mc.p10FinalCorpus, hint: "10% ended below" },
            { label: "P25", v: mc.p25FinalCorpus, hint: "Lower quartile" },
            { label: "P50", v: mc.p50FinalCorpus, hint: "Median" },
            { label: "P75", v: mc.p75FinalCorpus, hint: "Upper quartile" },
            { label: "P90", v: mc.p90FinalCorpus, hint: "10% ended above" },
          ].map(({ label, v, hint }) => (
            <div key={label} className="rounded-md border border-border bg-muted/30 p-3">
              <div className="label-caps">{label} final corpus</div>
              <div className="text-base font-semibold">{formatINR(v)}</div>
              <div className="text-xs text-muted-foreground">{hint}</div>
            </div>
          ))}
        </div>
      )}

      {/* Reshuffle control — re-rolls the random paths within this session.
          Refreshing the page also yields a new random run. */}
      {onReshuffle && (
        <div className="rounded-md border border-border bg-muted/20 p-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Click <span className="font-medium text-foreground">Reshuffle</span> to
            re-run the simulation with a fresh set of random return paths. Results
            are not saved between reloads.
          </p>
          <Button variant="outline" size="sm" onClick={reshuffle} className="gap-2">
            <RefreshCw className="size-4" />
            Reshuffle
          </Button>
        </div>
      )}

      {/* Solver: target probability → required monthly SIP */}
      {onSipSolved && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Wand2 className="size-4 text-accent" />
            <div className="font-medium">Solve for required monthly SIP</div>
          </div>
          <p className="text-xs text-muted-foreground">
            Pick a target confidence level. The tool searches for the monthly investment
            (with everything else constant) that achieves it. Uses a fast {Math.min(1500, inputs.monteCarloRuns)}-run pass per probe.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="solver-target" className="text-xs">Target confidence (%)</Label>
              <Input
                id="solver-target"
                type="number"
                min={1}
                max={99}
                step={1}
                value={targetPct}
                onChange={(e) => setTargetPct(Number(e.target.value) || 0)}
                className="w-28"
              />
            </div>
            <Button onClick={runSolver} disabled={solving} size="sm">
              {solving ? "Solving…" : "Find required SIP"}
            </Button>
            {solverResult && (
              <Button onClick={applySolved} variant="secondary" size="sm">
                Apply {formatINR(solverResult.sip)}/month
              </Button>
            )}
          </div>
          {solverProgress && (
            <p className="text-xs text-muted-foreground">
              Iter {solverProgress.iter} · trying SIP {formatINR(solverProgress.sip)} → {(solverProgress.conf * 100).toFixed(1)}%
            </p>
          )}
          {solverResult && (
            <div className="rounded-md bg-muted/30 p-3 text-sm">
              Required monthly SIP ≈ <span className="font-semibold">{formatINR(solverResult.sip)}</span>{" "}
              for ≈ <span className="font-semibold">{(solverResult.conf * 100).toFixed(1)}%</span> confidence.
              Current SIP: {formatINR(inputs.monthlyInvestment)}.
            </div>
          )}
        </div>
      )}

      {/* Explainer */}
      <details className="rounded-md border border-border bg-card p-3 text-sm">
        <summary className="cursor-pointer font-medium">
          How is success probability computed?
        </summary>
        <div className="mt-3 space-y-2 text-muted-foreground leading-relaxed">
          <p>
            We run <span className="font-medium text-foreground">N independent scenarios</span>{" "}
            (currently {inputs.monteCarloRuns.toLocaleString("en-IN")}). In each scenario we
            generate a fresh sequence of annual{" "}
            {strategy === "two-bucket" ? "equity-sleeve" : "Accumulation-bucket"} returns
            around your CAGR ({(inputs.sequenceCagr * 100).toFixed(1)}%) with volatility set
            by the min ({(inputs.sequenceMinReturn * 100).toFixed(0)}%) and max (
            {(inputs.sequenceMaxReturn * 100).toFixed(0)}%) inputs.
          </p>
          <p>
            For each scenario we step through every year from today until age{" "}
            {result.ageAtStart + result.yearsToRetirement + (inputs.lifeExpectancyAge ? Math.max(0, inputs.lifeExpectancyAge - inputs.retirementAge) : inputs.lifeExpectancyYears)},
            applying SIPs, expenses,{" "}
            {strategy === "two-bucket"
              ? "annual rebalancing between equity and debt sleeves"
              : "bucket transfers, glide-path top-ups and the emergency reserve"}
            .
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="font-medium text-foreground">Survives</span> — corpus stays
              positive every single year through life expectancy. Counts as a success.
            </li>
            <li>
              <span className="font-medium text-foreground">Depletes early</span> — corpus
              hits zero in some year before life expectancy. Counts as a failure, and we
              record the age at which it ran out. The median across all failed runs is
              shown above.
            </li>
          </ul>
          <p>
            Confidence = successes ÷ N. P10 / P25 / P50 / P75 / P90 describe the spread of{" "}
            <span className="font-medium text-foreground">final corpus values</span> across
            all runs (including the ones that hit zero, which contribute 0). A wide gap
            between P10 and P90 means your plan is highly path-dependent.
          </p>
        </div>
      </details>
    </div>
  );
}

// Helper exposed for the compare page to derive a stable Y-axis cap from MC.
export function useMcYMax(mc: MonteCarloResult | undefined, corpusAtRetire: number): number | undefined {
  return useMemo(() => {
    if (!mc) return undefined;
    return Math.max(mc.p90FinalCorpus, corpusAtRetire) * 1.1;
  }, [mc, corpusAtRetire]);
}
