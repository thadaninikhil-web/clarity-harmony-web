// Shared Monte Carlo results panel — used by both the Three-bucket and
// Two-bucket pages so any future change (UI, copy, metrics) flows to both.

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RefreshCw, Wand2 } from "lucide-react";
import {
  formatINR,
  project,
  projectTwoBucket,
  projectOneBucket,
  type MonteCarloResult,
  type ProjectionResult,
  type RetirementInputs,
} from "@/lib/retirement";
import { runMonteCarloAsync } from "@/lib/retirement-mc";

interface Props {
  inputs: RetirementInputs;
  result: ProjectionResult;
  strategy: "three-bucket" | "two-bucket" | "one-bucket";
  onReshuffle?: () => void;
  onSipSolved?: (monthlySip: number) => void;
  onMonteCarloRunsChange?: (runs: number) => void;
  onSelectRun?: (seed: number) => void;
  /** Fires whenever the MC pass finishes so parents (e.g. OutcomeCard) can
   *  display the same confidence/percentile numbers as this panel. */
  onMcResult?: (mc: MonteCarloResult | undefined) => void;
}

export function MonteCarloPanel({ inputs, result, strategy, onReshuffle, onSipSolved, onMonteCarloRunsChange, onSelectRun, onMcResult }: Props) {

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
    // Inputs changed — any prior solver output is no longer valid.
    setSolverResult(null);
    setSolverProgress(null);
    solverAbortRef.current?.abort();
    const runner = strategy === "one-bucket" ? projectOneBucket : strategy === "two-bucket" ? projectTwoBucket : project;
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
          onMcResult?.(r);
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
    const runner = strategy === "one-bucket" ? projectOneBucket : strategy === "two-bucket" ? projectTwoBucket : project;
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

      {/* Final-corpus bands — plain-English labels (Worst 10% / Median / Best 10%) */}
      {mc && !progress.running && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Worst 10% expected corpus", v: mc.p10FinalCorpus, hint: "Only 10% of futures ended below this" },
            { label: "Median expected corpus", v: mc.p50FinalCorpus, hint: "Half of futures landed above, half below" },
            { label: "Best 10% expected corpus", v: mc.p90FinalCorpus, hint: "Only 10% of futures ended above this" },
          ].map(({ label, v, hint }) => (
            <div key={label} className="rounded-md border border-border bg-muted/30 p-3">
              <div className="label-caps">{label}</div>
              <div className="text-base font-semibold">{formatINR(v)}</div>
              <div className="text-xs text-muted-foreground">{hint}</div>
            </div>
          ))}
        </div>
      )}

      {/* Depletion-age percentiles for failed runs */}
      {mc && !progress.running && mc.failureCount > 0 && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-medium text-sm text-destructive">Depletion age — failed runs only</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Of the {mc.failureCount.toLocaleString("en-IN")} runs where the corpus ran out,
                here's the age at which it happened. Median ={" "}
                <span className="font-semibold text-foreground">{mc.medianDepletionAge}</span>.
              </p>
            </div>
          </div>
          <div className="grid gap-2 grid-cols-3">
            {[
              { label: "Worst 10% depletion age", v: mc.depletionAgeP10, hint: "Earliest 10% of failures" },
              { label: "Median depletion age", v: mc.depletionAgeP50, hint: "Typical failure age" },
              { label: "Best 10% depletion age", v: mc.depletionAgeP90, hint: "Latest 10% of failures" },
            ].map(({ label, v, hint }) => (
              <div key={label} className="rounded-md bg-card border border-border p-2 text-center">
                <div className="label-caps">{label}</div>
                <div className="text-base font-semibold">{v ?? "—"}</div>
                <div className="text-[10px] text-muted-foreground">{hint}</div>
              </div>
            ))}
          </div>
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">How are these depletion-age percentiles computed?</summary>
            <div className="mt-2 space-y-1.5 leading-relaxed">
              <p>
                We isolate the runs whose corpus hit zero before the planning age. For each such
                run we record the age at depletion, then sort that list ascending.
              </p>
              <p>
                <span className="font-medium">Worst 10%</span> means the earliest 10% of failed
                runs — i.e. the unlucky scenarios where the corpus depleted soonest.
                <span className="font-medium"> Best 10%</span> is the latest 10% of failed runs
                (corpus lasted longest before depleting). <span className="font-medium">Median</span>{" "}
                is the typical failure age.
              </p>
            </div>
          </details>
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

      {/* Monte Carlo runs slider — keep it next to the MC output */}
      {onMonteCarloRunsChange && (
        <div className="rounded-md border border-border bg-card p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs">
              Simulated futures:{" "}
              <span className="font-semibold text-foreground">
                {inputs.monteCarloRuns.toLocaleString("en-IN")}
              </span>
            </Label>
            <span className="text-[11px] text-muted-foreground">More futures → smoother estimate, slower.</span>
          </div>
          <Slider
            value={[inputs.monteCarloRuns]}
            min={1000}
            max={10000}
            step={500}
            onValueChange={(v) => onMonteCarloRunsChange(v[0])}
            aria-label="Number of simulated futures"
          />
          <p className="text-[11px] text-muted-foreground">
            A <em>Monte Carlo</em> simulation is used to play out{" "}
            <span className="font-medium text-foreground">
              {inputs.monteCarloRuns.toLocaleString("en-IN")}
            </span>{" "}
            independent &quot;what-if&quot; futures with random market returns.
          </p>
        </div>
      )}

      {/* Per-run details — first 50 paths, collapsed by default (advanced users) */}
      {mc?.perRun && mc.perRun.length > 0 && !progress.running && (
        <details className="rounded-md border border-border bg-card">
          <summary className="flex cursor-pointer items-center justify-between gap-2 border-b p-3 select-none">
            <div>
              <div className="font-medium text-sm">Advanced: per-run details</div>
              <p className="text-[11px] text-muted-foreground">
                Showing first {mc.perRun.length} of {mc.runs.toLocaleString("en-IN")} runs.
                Click a row to load that path into the chart and table above.
              </p>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Target CAGR{" "}
              <span className="font-mono text-foreground">{(inputs.sequenceCagr * 100).toFixed(2)}%</span>
            </div>
          </summary>
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-xs" aria-label="Monte Carlo per-run details">
              <caption className="sr-only">
                First {mc.perRun.length} of {mc.runs.toLocaleString("en-IN")} Monte
                Carlo runs. Click a row to load that path into the chart and
                year-by-year table.
              </caption>
              <thead className="sticky top-0 bg-card border-b">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium text-muted-foreground">#</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground text-right">CAGR</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground text-right">Δ vs target</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Match</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground text-right">Final corpus</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Outcome</th>
                  {onSelectRun && <th className="px-3 py-2 font-medium text-muted-foreground"></th>}
                </tr>
              </thead>
              <tbody>
                {mc.perRun.map((r) => {
                  const delta = r.cagr - inputs.sequenceCagr;
                  const matches = Math.abs(delta) < 0.0005; // within 0.05pp
                  const isActive = inputs.sequenceSeed === r.seed;
                  return (
                    <tr
                      key={r.index}
                      tabIndex={onSelectRun ? 0 : undefined}
                      role={onSelectRun ? "button" : undefined}
                      aria-label={onSelectRun ? `Load Monte Carlo run ${r.index}` : undefined}
                      aria-pressed={onSelectRun ? isActive : undefined}
                      className={`border-b last:border-0 ${isActive ? "bg-primary/10" : "hover:bg-muted/40"} ${onSelectRun ? "cursor-pointer" : ""}`}
                      onClick={() => onSelectRun?.(r.seed)}
                      onKeyDown={(e) => {
                        if (!onSelectRun) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectRun(r.seed);
                        }
                      }}
                    >
                      <td className="px-3 py-1.5 tabular-nums">{r.index}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums font-mono">{(r.cagr * 100).toFixed(2)}%</td>
                      <td className="px-3 py-1.5 text-right tabular-nums font-mono text-muted-foreground">
                        {(delta * 100 >= 0 ? "+" : "") + (delta * 100).toFixed(2)} pp
                      </td>
                      <td className="px-3 py-1.5">
                        {matches ? (
                          <span className="text-accent">✓</span>
                        ) : (
                          <span className="text-muted-foreground">≈</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{formatINR(r.finalCorpus)}</td>
                      <td className="px-3 py-1.5">
                        {r.depleted ? (
                          <span className="text-destructive">depleted{r.depletionAge ? ` @ ${r.depletionAge}` : ""}</span>
                        ) : (
                          <span className="text-muted-foreground">survived</span>
                        )}
                      </td>
                      {onSelectRun && (
                        <td className="px-3 py-1.5">
                          <Button
                            size="sm"
                            variant={isActive ? "secondary" : "ghost"}
                            className="h-7 text-[11px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRun(r.seed);
                            }}
                          >
                            {isActive ? "Loaded" : "Load"}
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
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
              ? "the seeding and yearly refill of the Withdrawal bucket from Accumulation"
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
