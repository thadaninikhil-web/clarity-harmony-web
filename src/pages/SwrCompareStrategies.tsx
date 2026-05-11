import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StrategySwitcher } from "@/components/retirement/StrategySwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatINR,
  project,
  projectTwoBucket,
  projectOneBucket,
  ageFromDob,
  type RetirementInputs,
} from "@/lib/retirement";
import { runMonteCarloAsync } from "@/lib/retirement-mc";

type Strategy = "one-bucket" | "two-bucket" | "three-bucket";

const defaultMonthlyExpenses = 100000;
const defaultRetireAge = 60;
const baseInputs: RetirementInputs = {
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
  prepYearsBeforeRetirement: 0,
  withdrawalYears: 0,
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
  monteCarloRuns: 2000,
  sequenceSeed: 1,
};

function inputsFor(s: Strategy, base: RetirementInputs): RetirementInputs {
  if (s === "one-bucket") {
    return { ...base, accEquityPct: 1, prepEquityPct: 0, prepYearsBeforeRetirement: 0, withdrawalYears: 0 };
  }
  if (s === "two-bucket") {
    return { ...base, accEquityPct: 0.6, prepEquityPct: 0, prepYearsBeforeRetirement: 0, withdrawalYears: 0 };
  }
  return base;
}

function runnerFor(s: Strategy) {
  if (s === "one-bucket") return projectOneBucket;
  if (s === "two-bucket") return projectTwoBucket;
  return project;
}

interface SolveOutcome {
  expense: number;
  conf: number;
  swrPct: number;
}

async function solveFor(
  base: RetirementInputs,
  strategy: Strategy,
  targetPct: number,
  signal: AbortSignal,
  onProgress: (done: number, total: number) => void,
): Promise<SolveOutcome | null> {
  const target = Math.max(0.01, Math.min(0.99, targetPct / 100));
  const inputs = inputsFor(strategy, base);
  const runner = runnerFor(strategy);
  const probeRuns = Math.min(800, inputs.monteCarloRuns);
  const yearsToRetirement = Math.max(0, inputs.retirementAge - ageFromDob(inputs.dob));

  const probe = async (year1: number): Promise<number> => {
    const current = year1 / Math.pow(1 + inputs.inflationRate, yearsToRetirement);
    const r = await runMonteCarloAsync(
      { ...inputs, currentMonthlyExpenses: current, monteCarloRuns: probeRuns },
      runner,
      { signal, strategy },
    );
    return r?.successProbability ?? 0;
  };

  let lo = 1000;
  let hi = 200000;
  let iter = 0;
  const totalIter = 14;
  for (let i = 0; i < 6; i++) {
    const c = await probe(hi);
    if (signal.aborted) return null;
    onProgress(++iter, totalIter);
    if (c < target) break;
    lo = hi;
    hi *= 2;
    if (hi > 50_000_000) break;
  }
  let best = { expense: lo, conf: 0 };
  for (let i = 0; i < 12; i++) {
    if (signal.aborted) return null;
    const mid = (lo + hi) / 2;
    const c = await probe(mid);
    onProgress(Math.min(++iter, totalIter), totalIter);
    if (c >= target) {
      best = { expense: mid, conf: c };
      lo = mid;
    } else {
      hi = mid;
    }
    if (hi - lo < 500) break;
  }
  const expense = Math.round(best.expense / 100) * 100;
  const swrPct = inputs.currentCorpus > 0 ? (expense * 12 / inputs.currentCorpus) * 100 : 0;
  return { expense, conf: best.conf, swrPct };
}

const SwrCompareStrategies = () => {
  const [base, setBase] = useState<RetirementInputs>(baseInputs);
  const [targetPct, setTargetPct] = useState(85);
  const [results, setResults] = useState<Record<Strategy, SolveOutcome | null>>({
    "one-bucket": null,
    "two-bucket": null,
    "three-bucket": null,
  });
  const [progress, setProgress] = useState<Record<Strategy, { done: number; total: number }>>({
    "one-bucket": { done: 0, total: 0 },
    "two-bucket": { done: 0, total: 0 },
    "three-bucket": { done: 0, total: 0 },
  });
  const [running, setRunning] = useState(false);
  const ctrlRef = useRef<AbortController | null>(null);

  useEffect(() => {
    document.title = "Compare Safe Withdrawal Strategies | Balancing Act";
  }, []);

  const run = async () => {
    if (running) return;
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setRunning(true);
    setResults({ "one-bucket": null, "two-bucket": null, "three-bucket": null });
    const strategies: Strategy[] = ["one-bucket", "two-bucket", "three-bucket"];
    try {
      const all = await Promise.all(
        strategies.map((s) =>
          solveFor(base, s, targetPct, ctrl.signal, (done, total) =>
            setProgress((p) => ({ ...p, [s]: { done, total } })),
          ),
        ),
      );
      if (ctrl.signal.aborted) return;
      setResults({
        "one-bucket": all[0],
        "two-bucket": all[1],
        "three-bucket": all[2],
      });
    } finally {
      setRunning(false);
    }
  };

  const update = <K extends keyof RetirementInputs>(k: K, v: RetirementInputs[K]) =>
    setBase((b) => ({ ...b, [k]: v }));

  const cell = (r: SolveOutcome | null) =>
    r
      ? (
          <>
            <div className="font-semibold">{formatINR(r.expense)}/mo</div>
            <div className="text-xs text-muted-foreground">
              SWR ≈ {r.swrPct.toFixed(2)}% · {(r.conf * 100).toFixed(1)}% conf
            </div>
          </>
        )
      : "—";

  const lifeAge = base.lifeExpectancyAge ?? base.retirementAge + base.lifeExpectancyYears;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-10 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <p className="label-caps text-gold mb-3">Calculator</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            Compare Safe Withdrawals
          </h1>
          <p className="max-w-2xl mx-auto text-base text-primary-foreground/80">
            Solve the safe year-1 monthly withdrawal under each strategy, side by side.
          </p>
          <StrategySwitcher mode="swr" activeTab="compare" />
        </div>
      </section>

      <main className="container mx-auto px-6 lg:px-8 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Base assumptions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cs-dob">Date of birth</Label>
              <Input id="cs-dob" type="date" value={base.dob} onChange={(e) => update("dob", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs-corpus">Retirement corpus (₹)</Label>
              <Input
                id="cs-corpus"
                type="number"
                value={base.currentCorpus}
                onChange={(e) => update("currentCorpus", Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs-ret">Retirement age</Label>
              <Input id="cs-ret" type="number" value={base.retirementAge}
                onChange={(e) => update("retirementAge", Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs-life">Life expectancy (age)</Label>
              <Input id="cs-life" type="number" value={lifeAge}
                onChange={(e) => {
                  const la = Number(e.target.value) || 0;
                  update("lifeExpectancyAge", la);
                  update("lifeExpectancyYears", Math.max(0, la - base.retirementAge));
                }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs-inf">Inflation rate</Label>
              <Input id="cs-inf" type="number" step="0.005" value={base.inflationRate}
                onChange={(e) => update("inflationRate", Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs-cagr">Sequence CAGR</Label>
              <Input id="cs-cagr" type="number" step="0.005" value={base.sequenceCagr}
                onChange={(e) => {
                  const n = Number(e.target.value) || 0;
                  update("sequenceCagr", n);
                  update("accReturn", n);
                }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs-tgt">Target confidence (%)</Label>
              <Input id="cs-tgt" type="number" min={1} max={99} value={targetPct}
                onChange={(e) => setTargetPct(Number(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="font-serif text-2xl">Safe withdrawal — per strategy</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Each leg binary-searches the year-1 monthly withdrawal that hits the target confidence.
              </p>
            </div>
            <Button onClick={run} disabled={running}>{running ? "Solving…" : "Solve"}</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {running && (
              <div className="grid gap-3 sm:grid-cols-3">
                {(["one-bucket", "two-bucket", "three-bucket"] as Strategy[]).map((s) => (
                  <div key={s}>
                    <div className="text-xs label-caps mb-1">{s}</div>
                    <Progress value={progress[s].total ? Math.round((progress[s].done / progress[s].total) * 100) : 0} />
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Metric</TableHead>
                    <TableHead>One-bucket</TableHead>
                    <TableHead>Two-bucket</TableHead>
                    <TableHead>Three-bucket</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Safe year-1 withdrawal</TableCell>
                    <TableCell>{cell(results["one-bucket"])}</TableCell>
                    <TableCell>{cell(results["two-bucket"])}</TableCell>
                    <TableCell>{cell(results["three-bucket"])}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              Results re-compute on click. Each leg uses up to 800 Monte Carlo runs per probe for speed; for production accuracy run each strategy individually with full MC runs.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SwrCompareStrategies;