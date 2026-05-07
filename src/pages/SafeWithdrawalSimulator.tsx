import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Wand2, RotateCcw } from "lucide-react";
import { IndianNumberInput } from "@/components/retirement/IndianNumberInput";
import { Results } from "@/components/retirement/Results";
import {
  ageFromDob,
  formatINR,
  project,
  projectTwoBucket,
  attachBullets,
  type RetirementInputs,
} from "@/lib/retirement";
import { runMonteCarloAsync } from "@/lib/retirement-mc";

type Strategy = "three-bucket" | "two-bucket";

const TODAY = new Date().toISOString().slice(0, 10);
const MIN_DOB = "1900-01-01";
const num = (v: string) => (v === "" ? 0 : Number(v));

interface SwrState {
  name: string;
  dob: string;
  retirementAge: number;
  planUntilAge: number;
  year1MonthlyExpenses: number;
  inflationRate: number;
  corpus: number;
  // shared bucket params
  sequenceCagr: number;
  sequenceMinReturn: number;
  sequenceMaxReturn: number;
  // 3-bucket
  prepYearsBeforeRetirement: number;
  prepReturn: number;
  prepEquityPct: number;
  withdrawalYears: number;
  withdrawalReturn: number;
  // 2-bucket
  accEquityPct: number;
  // emergency
  emergencyFundMonths: number;
  // MC
  monteCarloRuns: number;
  sequenceSeed: number;
}

const defaults: SwrState = {
  name: "",
  dob: "1965-01-01",
  retirementAge: 60,
  planUntilAge: 90,
  year1MonthlyExpenses: 100000,
  inflationRate: 0.07,
  corpus: 50000000,
  sequenceCagr: 0.1,
  sequenceMinReturn: -0.2,
  sequenceMaxReturn: 0.25,
  prepYearsBeforeRetirement: 3,
  prepReturn: 0.07,
  prepEquityPct: 0.3,
  withdrawalYears: 3,
  withdrawalReturn: 0.055,
  accEquityPct: 0.7,
  emergencyFundMonths: 12,
  monteCarloRuns: 5000,
  sequenceSeed: 1,
};

function toRetirementInputs(s: SwrState): RetirementInputs {
  const currentAge = ageFromDob(s.dob);
  const effectiveRetireAge = Math.max(currentAge, s.retirementAge);
  const yearsToRetirement = Math.max(0, effectiveRetireAge - currentAge);
  // Deflate year-1 retirement expenses back to today's rupees so the engine
  // (which inflates currentMonthlyExpenses to retirement) reproduces the
  // user's stated year-1 number.
  const currentMonthlyExpenses =
    s.year1MonthlyExpenses / Math.pow(1 + s.inflationRate, yearsToRetirement);
  return {
    name: s.name,
    dob: s.dob,
    currentMonthlyExpenses,
    inflationRate: s.inflationRate,
    currentCorpus: s.corpus,
    monthlyInvestment: 0,
    sipStepUpRate: 0,
    retirementAge: effectiveRetireAge,
    lifeExpectancyYears: Math.max(1, s.planUntilAge - effectiveRetireAge),
    lifeExpectancyAge: s.planUntilAge,
    accEquityPct: s.accEquityPct,
    accReturn: s.sequenceCagr,
    prepEquityPct: s.prepEquityPct,
    prepReturn: s.prepReturn,
    prepYearsBeforeRetirement: s.prepYearsBeforeRetirement,
    withdrawalYears: s.withdrawalYears,
    withdrawalReturn: s.withdrawalReturn,
    emergencyFundMonths: s.emergencyFundMonths,
    emergencyFundToday: s.emergencyFundMonths * currentMonthlyExpenses,
    transferMode: "annual-topup",
    stressEnabled: true,
    stressMode: "sequence",
    crashPct: 0.3,
    crashYearOffset: 10,
    recoveryYears: 3,
    stressedAccReturn: 0.04,
    sequenceCagr: s.sequenceCagr,
    sequenceMinReturn: s.sequenceMinReturn,
    sequenceMaxReturn: s.sequenceMaxReturn,
    sequenceMode: "montecarlo",
    monteCarloRuns: s.monteCarloRuns,
    sequenceSeed: s.sequenceSeed,
  };
}

const SafeWithdrawalSimulator = () => {
  const [strategy, setStrategy] = useState<Strategy>("three-bucket");
  const [s, setS] = useState<SwrState>(defaults);

  useEffect(() => {
    document.title = "Safe Withdrawal Simulator | Balancing Act";
    setS((p) => ({ ...p, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 }));
  }, []);

  const inputs = useMemo(() => toRetirementInputs(s), [s]);
  const currentAge = ageFromDob(s.dob);
  const yearsToRetirement = Math.max(0, s.retirementAge - currentAge);
  const year1Year = new Date().getFullYear() + yearsToRetirement;

  const result = useMemo(() => {
    const runner = strategy === "two-bucket" ? projectTwoBucket : project;
    return attachBullets(runner(inputs), strategy);
  }, [inputs, strategy]);

  const set = <K extends keyof SwrState>(k: K, v: SwrState[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  const reset = () => setS(defaults);
  const reshuffle = useCallback(
    () => setS((p) => ({ ...p, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 })),
    [],
  );

  // Goal-seek: binary search year-1 monthly expense for target probability
  const [targetPct, setTargetPct] = useState(85);
  const [solving, setSolving] = useState(false);
  const [solverProgress, setSolverProgress] = useState<{ iter: number; expense: number; conf: number } | null>(null);
  const [solverResult, setSolverResult] = useState<{ expense: number; conf: number } | null>(null);
  const solverAbortRef = useRef<AbortController | null>(null);

  const runSolver = async () => {
    if (solving) return;
    setSolverResult(null);
    setSolving(true);
    const ctrl = new AbortController();
    solverAbortRef.current?.abort();
    solverAbortRef.current = ctrl;
    const target = Math.max(0.01, Math.min(0.99, targetPct / 100));
    const runner = strategy === "two-bucket" ? projectTwoBucket : project;
    const probeRuns = Math.min(1500, s.monteCarloRuns);

    const probe = async (year1Monthly: number): Promise<number> => {
      const probeState: SwrState = { ...s, year1MonthlyExpenses: year1Monthly };
      const inp = toRetirementInputs(probeState);
      const r = await runMonteCarloAsync(
        { ...inp, monteCarloRuns: probeRuns },
        runner,
        { signal: ctrl.signal, strategy },
      );
      return r?.successProbability ?? 0;
    };

    try {
      // Year-1 expense in retirement-year rupees. Bracket: lo=very small, hi=high.
      let lo = 1000;
      let hi = Math.max(s.year1MonthlyExpenses * 2, 200000);
      // Confirm hi yields below target (else expand downward by halving lo... but lo is already tiny)
      // Confirm lo yields >= target; if not, we can't satisfy at all
      const cLo = await probe(lo);
      if (ctrl.signal.aborted) return;
      setSolverProgress({ iter: 1, expense: lo, conf: cLo });
      if (cLo < target) {
        setSolverResult({ expense: 0, conf: cLo });
        return;
      }
      // Expand hi until success drops below target (lower expense ⇒ higher prob)
      for (let i = 0; i < 6; i++) {
        const c = await probe(hi);
        if (ctrl.signal.aborted) return;
        setSolverProgress({ iter: i + 2, expense: hi, conf: c });
        if (c < target) break;
        lo = hi;
        hi *= 2;
        if (hi > 50_000_000) break;
      }
      // Binary search: find max expense with conf >= target
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
    set("year1MonthlyExpenses", solverResult.expense);
  };

  // Annual % of corpus for the solver result
  const swrPct = solverResult && s.corpus > 0
    ? (solverResult.expense * 12 / s.corpus) * 100
    : 0;

  const isTwo = strategy === "two-bucket";

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
        {/* INPUTS */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-base">Your retirement inputs</CardTitle>
            <Button variant="outline" size="sm" onClick={reset} className="gap-2">
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="swr-name" className="text-xs">Name</Label>
                <Input id="swr-name" value={s.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="swr-dob" className="text-xs">Date of birth</Label>
                <Input id="swr-dob" type="date" min={MIN_DOB} max={TODAY} value={s.dob}
                  onChange={(e) => set("dob", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="swr-ret" className="text-xs">Retirement age</Label>
                <Input id="swr-ret" type="number" min={18} max={100} value={s.retirementAge}
                  onChange={(e) => set("retirementAge", num(e.target.value))} />
                <p className="text-[10px] text-muted-foreground">Current age {currentAge}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="swr-plan" className="text-xs">Plan until age</Label>
                <Input id="swr-plan" type="number" min={s.retirementAge + 1} max={120} value={s.planUntilAge}
                  onChange={(e) => set("planUntilAge", num(e.target.value))} />
              </div>
            </div>

            <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="swr-y1" className="text-xs">
                  Monthly expenses in year 1 of retirement ({year1Year}) (₹)
                </Label>
                <IndianNumberInput id="swr-y1" value={s.year1MonthlyExpenses}
                  onChange={(n) => set("year1MonthlyExpenses", n)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Inflation rate: {(s.inflationRate * 100).toFixed(1)}%</Label>
                <Slider value={[s.inflationRate * 100]} min={2} max={12} step={0.5}
                  onValueChange={(v) => set("inflationRate", v[0] / 100)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="swr-corpus" className="text-xs">Retirement corpus (₹)</Label>
                <IndianNumberInput id="swr-corpus" value={s.corpus} onChange={(n) => set("corpus", n)} />
              </div>
            </div>

            {/* Bucket 1 / Equity sleeve */}
            <div className="rounded-md border border-border bg-muted/20 p-4 space-y-3">
              <div className="font-medium text-sm">
                {isTwo ? "Equity sleeve" : "Bucket 1 — Accumulation (high risk · high return)"}
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Equity allocation: {(s.accEquityPct * 100).toFixed(0)}%</Label>
                  <Slider value={[s.accEquityPct * 100]} min={0} max={100} step={5}
                    onValueChange={(v) => set("accEquityPct", v[0] / 100)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Expected CAGR: {(s.sequenceCagr * 100).toFixed(1)}%</Label>
                  <Slider value={[s.sequenceCagr * 100]} min={2} max={18} step={0.5}
                    onValueChange={(v) => set("sequenceCagr", v[0] / 100)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Min year return: {(s.sequenceMinReturn * 100).toFixed(0)}% · Max: {(s.sequenceMaxReturn * 100).toFixed(0)}%
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Slider value={[s.sequenceMinReturn * 100]} min={-50} max={5} step={1}
                      onValueChange={(v) => set("sequenceMinReturn", v[0] / 100)} />
                    <Slider value={[s.sequenceMaxReturn * 100]} min={5} max={50} step={1}
                      onValueChange={(v) => set("sequenceMaxReturn", v[0] / 100)} />
                  </div>
                </div>
              </div>
            </div>

            {!isTwo && (
              <>
                <div className="rounded-md border border-border bg-muted/20 p-4 space-y-3">
                  <div className="font-medium text-sm">Bucket 2 — Preparation (buffer)</div>
                  <div className="grid gap-3 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Equity allocation: {(s.prepEquityPct * 100).toFixed(0)}%</Label>
                      <Slider value={[s.prepEquityPct * 100]} min={0} max={100} step={5}
                        onValueChange={(v) => set("prepEquityPct", v[0] / 100)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Expected return: {(s.prepReturn * 100).toFixed(1)}%</Label>
                      <Slider value={[s.prepReturn * 100]} min={4} max={18} step={0.5}
                        onValueChange={(v) => set("prepReturn", v[0] / 100)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Shift starts: {s.prepYearsBeforeRetirement} yrs before retirement</Label>
                      <Slider value={[s.prepYearsBeforeRetirement]} min={0} max={8} step={1}
                        onValueChange={(v) => set("prepYearsBeforeRetirement", v[0])} />
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-border bg-muted/20 p-4 space-y-3">
                  <div className="font-medium text-sm">Bucket 3 — Withdrawal (debt only)</div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Years of expenses parked here: {s.withdrawalYears}</Label>
                      <Slider value={[s.withdrawalYears]} min={0} max={8} step={1}
                        onValueChange={(v) => set("withdrawalYears", v[0])} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Expected return: {(s.withdrawalReturn * 100).toFixed(2)}%</Label>
                      <Slider value={[s.withdrawalReturn * 100]} min={4} max={18} step={0.25}
                        onValueChange={(v) => set("withdrawalReturn", v[0] / 100)} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {isTwo && (
              <div className="rounded-md border border-border bg-muted/20 p-4 space-y-3">
                <div className="font-medium text-sm">Debt sleeve</div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Expected return: {(s.withdrawalReturn * 100).toFixed(2)}%</Label>
                  <Slider value={[s.withdrawalReturn * 100]} min={4} max={18} step={0.25}
                    onValueChange={(v) => set("withdrawalReturn", v[0] / 100)} />
                </div>
              </div>
            )}

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Emergency fund (months of expenses): {s.emergencyFundMonths}</Label>
                <Slider value={[s.emergencyFundMonths]} min={0} max={36} step={1}
                  onValueChange={(v) => set("emergencyFundMonths", v[0])} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal-seek: Safe Withdrawal Rate */}
        <Card className="shadow-[var(--shadow-card)] border-accent/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="size-4 text-accent" />
              Goal seek — safe withdrawal in year 1
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Pick a target confidence level. We binary-search the year-1 monthly
              withdrawal that keeps the corpus solvent through age {s.planUntilAge}{" "}
              with that probability. Uses a fast {Math.min(1500, s.monteCarloRuns)}-run pass per probe.
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
                    Even a tiny withdrawal didn't reach {targetPct}% confidence with these
                    inputs. Try a smaller corpus drawdown horizon, lower planning age, or
                    a higher CAGR.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RESULTS — reuses MC panel, chart, table from the Retirement Simulator */}
        <Results
          result={result}
          name={s.name}
          inputs={inputs}
          strategy={strategy}
          onReshuffleSequence={reshuffle}
          onMonteCarloRunsChange={(runs) => set("monteCarloRuns", runs)}
          onSelectRun={(seed) => set("sequenceSeed", seed)}
        />

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Educational calculator — not investment advice. Returns shown are
          nominal and exclude taxes.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default SafeWithdrawalSimulator;