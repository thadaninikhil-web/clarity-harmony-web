import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuidedInputsChat } from "@/components/retirement/GuidedInputsChat";
import { InputsErrorBoundary } from "@/components/retirement/InputsErrorBoundary";
import { Results } from "@/components/retirement/Results";
import { SaveCompare } from "@/components/retirement/SaveCompare";
import { ValidationBanner } from "@/components/retirement/ValidationBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import {
  formatINR,
  project,
  projectTwoBucket,
  validateInputs,
  attachBullets,
  type RetirementInputs,
} from "@/lib/retirement";
import { runMonteCarloAsync } from "@/lib/retirement-mc";
import { decodeInputsFromHash } from "@/lib/scenarios";

type Strategy = "three-bucket" | "two-bucket";

const defaultMonthlyExpenses = 100000;
const defaultRetireAge = 60;
const defaults: RetirementInputs = {
  name: "",
  dob: "1965-01-01",
  currentMonthlyExpenses: defaultMonthlyExpenses,
  inflationRate: 0.07,
  currentCorpus: 50000000,
  monthlyInvestment: 0,
  sipStepUpRate: 0,
  retirementAge: defaultRetireAge,
  lifeExpectancyYears: 30,
  lifeExpectancyAge: defaultRetireAge + 30,
  accEquityPct: 0.7,
  accReturn: 0.1,
  prepEquityPct: 0.3,
  prepReturn: 0.07,
  prepYearsBeforeRetirement: 3,
  withdrawalYears: 3,
  withdrawalReturn: 0.055,
  emergencyFundMonths: 12,
  emergencyFundToday: defaultMonthlyExpenses * 12,
  transferMode: "annual-topup",
  stressEnabled: true,
  stressMode: "sequence",
  crashPct: 0.3,
  crashYearOffset: 10,
  recoveryYears: 3,
  stressedAccReturn: 0.04,
  sequenceCagr: 0.1,
  sequenceMinReturn: -0.2,
  sequenceMaxReturn: 0.25,
  sequenceMode: "montecarlo",
  monteCarloRuns: 5000,
  sequenceSeed: 1,
};

// SWR doesn't take SIP/step-up — user is already retired (or evaluating
// solely the corpus). Skip those questions in the guided chat.
const SKIP_QUESTIONS = ["monthlyInvestment", "sipStepUpRate"];

const SafeWithdrawalSimulator = () => {
  const [strategy, setStrategy] = useState<Strategy>("three-bucket");

  // If a share-link hash is present, hydrate from it and start in summary view.
  const initialFromHash = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!window.location.hash.startsWith("#s=")) return null;
    return decodeInputsFromHash(window.location.hash);
  }, []);
  const [values, setValues] = useState<RetirementInputs>(() =>
    initialFromHash ? { ...defaults, ...initialFromHash, monthlyInvestment: 0, sipStepUpRate: 0 } : defaults,
  );
  const hasPrefilled = !!initialFromHash;
  const [completed, setCompleted] = useState(hasPrefilled);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Force SIP fields to zero so accidental imports never re-introduce them.
  const safeValues = useMemo(
    () => ({ ...values, monthlyInvestment: 0, sipStepUpRate: 0 }),
    [values],
  );
  const validation = useMemo(() => validateInputs(safeValues), [safeValues]);
  const result = useMemo(
    () =>
      attachBullets(
        validation.ok
          ? (strategy === "two-bucket" ? projectTwoBucket : project)(safeValues)
          : (strategy === "two-bucket" ? projectTwoBucket : project)(defaults),
        strategy,
      ),
    [safeValues, strategy, validation.ok],
  );

  const reshuffleSequence = useCallback(() => {
    setValues((v) => ({ ...v, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setValues({ ...defaults, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 });
  }, []);

  useEffect(() => {
    document.title = "Safe Withdrawal Simulator | Balancing Act";
    setValues((v) => ({ ...v, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 }));
  }, []);

  // Goal seek — find the year-1 monthly expense that yields target confidence.
  const [targetPct, setTargetPct] = useState(85);
  const [solving, setSolving] = useState(false);
  const [solverProgress, setSolverProgress] = useState<{ iter: number; expense: number; conf: number } | null>(null);
  const [solverResult, setSolverResult] = useState<{ expense: number; conf: number } | null>(null);
  const solverAbortRef = useRef<AbortController | null>(null);

  // Year-1 monthly expense (in retirement-year rupees) currently implied by inputs
  const yearsToRetirement = result.yearsToRetirement;
  const year1Monthly = result.monthlyExpenseAtRetirement;
  const year1Year = new Date().getFullYear() + yearsToRetirement;

  const runSolver = async () => {
    if (solving) return;
    setSolverResult(null);
    setSolving(true);
    const ctrl = new AbortController();
    solverAbortRef.current?.abort();
    solverAbortRef.current = ctrl;
    const target = Math.max(0.01, Math.min(0.99, targetPct / 100));
    const runner = strategy === "two-bucket" ? projectTwoBucket : project;
    const probeRuns = Math.min(1500, safeValues.monteCarloRuns);

    // Probe takes a year-1 monthly expense and returns success probability.
    // Convert it to "currentMonthlyExpenses" by deflating with inflation.
    const probe = async (year1: number): Promise<number> => {
      const current = year1 / Math.pow(1 + safeValues.inflationRate, yearsToRetirement);
      const r = await runMonteCarloAsync(
        { ...safeValues, currentMonthlyExpenses: current, monteCarloRuns: probeRuns },
        runner,
        { signal: ctrl.signal, strategy },
      );
      return r?.successProbability ?? 0;
    };

    try {
      let lo = 1000;
      let hi = Math.max(year1Monthly * 2, 200000);
      const cLo = await probe(lo);
      if (ctrl.signal.aborted) return;
      setSolverProgress({ iter: 1, expense: lo, conf: cLo });
      if (cLo < target) {
        setSolverResult({ expense: 0, conf: cLo });
        return;
      }
      for (let i = 0; i < 6; i++) {
        const c = await probe(hi);
        if (ctrl.signal.aborted) return;
        setSolverProgress({ iter: i + 2, expense: hi, conf: c });
        if (c < target) break;
        lo = hi;
        hi *= 2;
        if (hi > 50_000_000) break;
      }
      let best = { expense: lo, conf: 0 };
      for (let i = 0; i < 14; i++) {
        if (ctrl.signal.aborted) return;
        const mid = (lo + hi) / 2;
        const c = await probe(mid);
        setSolverProgress({ iter: i + 8, expense: mid, conf: c });
        if (c >= target) {
          best = { expense: mid, conf: c };
          lo = mid;
        } else {
          hi = mid;
        }
        if (hi - lo < 500) break;
      }
      setSolverResult({ expense: Math.round(best.expense / 100) * 100, conf: best.conf });
    } finally {
      setSolving(false);
      setSolverProgress(null);
    }
  };

  const applySolved = () => {
    if (!solverResult || solverResult.expense <= 0) return;
    const current = solverResult.expense / Math.pow(1 + safeValues.inflationRate, yearsToRetirement);
    setValues((v) => ({ ...v, currentMonthlyExpenses: current }));
  };

  const swrPct = solverResult && safeValues.currentCorpus > 0
    ? (solverResult.expense * 12 / safeValues.currentCorpus) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-10 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <p className="label-caps text-gold mb-3">Calculator</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            Safe Withdrawal Rate Simulator
          </h1>
          <p className="max-w-2xl mx-auto text-base text-primary-foreground/80">
            Stress-test how long your retirement corpus lasts at a given monthly
            withdrawal — and goal-seek the safe withdrawal amount for a target
            confidence level.
          </p>
          <div className="mt-6 inline-flex rounded-full border border-primary-foreground/30 bg-primary-foreground/10 p-1">
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${strategy === "three-bucket" ? "bg-gold text-primary" : "text-primary-foreground/80 hover:bg-primary-foreground/10"}`}
              onClick={() => setStrategy("three-bucket")}
            >
              Three-Bucket
            </button>
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${strategy === "two-bucket" ? "bg-gold text-primary" : "text-primary-foreground/80 hover:bg-primary-foreground/10"}`}
              onClick={() => setStrategy("two-bucket")}
            >
              Two-Bucket
            </button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 max-w-full overflow-x-hidden">
        <InputsErrorBoundary>
          <GuidedInputsChat
            values={safeValues}
            onChange={setValues}
            completed={completed}
            startInSummary={hasPrefilled}
            skipQuestionIds={SKIP_QUESTIONS}
            onComplete={() => {
              setCompleted(true);
              setValues((v) => ({ ...v, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 }));
              setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
            }}
            onRestart={() => {
              setCompleted(false);
              resetToDefaults();
            }}
          />
        </InputsErrorBoundary>

        {completed && (
          <div ref={resultsRef} className="space-y-6 scroll-mt-24">
            <ValidationBanner issues={validation.errors} />
            <Results
              result={result}
              name={safeValues.name}
              inputs={safeValues}
              strategy={strategy}
              onReshuffleSequence={reshuffleSequence}
              onMonteCarloRunsChange={(runs) => setValues((v) => ({ ...v, monteCarloRuns: runs }))}
              onSelectRun={(seed) => setValues((v) => ({ ...v, sequenceSeed: seed }))}
            />

            {/* Goal-seek: Safe Withdrawal Rate */}
            <Card className="shadow-[var(--shadow-card)] border-accent/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wand2 className="size-4 text-accent" />
                  Goal seek — safe withdrawal in year 1 ({year1Year})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Pick a target confidence level. We binary-search the year-1 monthly
                  withdrawal that keeps the corpus solvent through age{" "}
                  {safeValues.lifeExpectancyAge} with that probability. Uses a fast{" "}
                  {Math.min(1500, safeValues.monteCarloRuns)}-run pass per probe.
                </p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="swr-tgt" className="text-xs">Target confidence (%)</Label>
                    <Input id="swr-tgt" type="number" min={1} max={99} step={1} value={targetPct}
                      onChange={(e) => setTargetPct(Number(e.target.value) || 0)} className="w-28" />
                  </div>
                  <Button size="sm" onClick={runSolver} disabled={solving}>
                    {solving ? "Solving…" : "Find safe withdrawal"}
                  </Button>
                  {solverResult && solverResult.expense > 0 && (
                    <Button size="sm" variant="secondary" onClick={applySolved}>
                      Apply {formatINR(solverResult.expense)}/month
                    </Button>
                  )}
                </div>
                {solverProgress && (
                  <p className="text-xs text-muted-foreground">
                    Iter {solverProgress.iter} · trying {formatINR(solverProgress.expense)}/mo →{" "}
                    {(solverProgress.conf * 100).toFixed(1)}%
                  </p>
                )}
                {solverResult && (
                  <div className="rounded-md bg-muted/30 p-3 text-sm space-y-1">
                    {solverResult.expense > 0 ? (
                      <>
                        <div>
                          Safe year-1 monthly withdrawal ≈{" "}
                          <span className="font-semibold">{formatINR(solverResult.expense)}</span>{" "}
                          ({(solverResult.conf * 100).toFixed(1)}% confidence).
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Year-1 annual withdrawal ≈ {formatINR(solverResult.expense * 12)} ·{" "}
                          Safe withdrawal rate ≈{" "}
                          <span className="font-semibold text-foreground">{swrPct.toFixed(2)}%</span>{" "}
                          of corpus in year 1.
                        </div>
                      </>
                    ) : (
                      <div>
                        Even a tiny withdrawal didn't reach {targetPct}% confidence with
                        these inputs. Try a smaller plan-until age or higher CAGR.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <SaveCompare
              inputs={safeValues}
              result={result}
              onLoad={setValues}
              kind="swr"
              shareBasePath="/calculators/safewithdrawalsimulation"
            />
          </div>
        )}

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Educational calculator — not investment advice. Returns shown are nominal
          and exclude taxes.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default SafeWithdrawalSimulator;