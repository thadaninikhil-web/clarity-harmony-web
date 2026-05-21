import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StrategySwitcher } from "@/components/retirement/StrategySwitcher";
import { BetaBanner } from "@/components/retirement/BetaBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { IndianNumberInput } from "@/components/retirement/IndianNumberInput";
import { RotateCcw, AlertTriangle } from "lucide-react";
import {
  formatINR,
  project,
  projectTwoBucket,
  projectOneBucket,
  type MonteCarloResult,
  type RetirementInputs,
} from "@/lib/retirement";
import { runMonteCarloAsync } from "@/lib/retirement-mc";
import {
  readShared,
  subscribeShared,
  writeShared,
} from "@/lib/sharedInputs";
import { StrategyDifferenceNote } from "@/components/retirement/StrategyDifferenceNote";

const defaultRetireAge = 60;
const defaultMonthlyExpenses = 80000;

const baseInputs: RetirementInputs = {
  name: "",
  dob: "1985-01-01",
  currentMonthlyExpenses: defaultMonthlyExpenses,
  inflationRate: 0.07,
  currentCorpus: 2000000,
  monthlyInvestment: 50000,
  sipStepUpRate: 0.08,
  retirementAge: defaultRetireAge,
  lifeExpectancyYears: 30,
  lifeExpectancyAge: defaultRetireAge + 30,
  accEquityPct: 0.7,
  accReturn: 0.1,
  prepEquityPct: 0.3,
  prepReturn: 0.07,
  prepYearsBeforeRetirement: 2,
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

const THREE_KEY = "ba.lastInputs.threeBucket";
const TWO_KEY = "ba.lastInputs.twoBucket";

function readInputs(key: string, fallback: RetirementInputs): RetirementInputs {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function writeInputs(key: string, values: RetirementInputs) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    /* ignore */
  }
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function isValidLeg(x: unknown): x is RetirementInputs {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const required: Array<keyof RetirementInputs> = [
    "dob",
    "currentMonthlyExpenses",
    "inflationRate",
    "currentCorpus",
    "monthlyInvestment",
    "retirementAge",
  ];
  for (const k of required) if (!(k in o)) return false;
  if (typeof o.dob !== "string") return false;
  const numeric: Array<keyof RetirementInputs> = [
    "currentMonthlyExpenses",
    "inflationRate",
    "currentCorpus",
    "monthlyInvestment",
    "retirementAge",
  ];
  for (const k of numeric) {
    const v = o[k];
    if (typeof v !== "number" || !Number.isFinite(v)) return false;
  }
  return true;
}

function oneBucketDefaults(src: RetirementInputs): RetirementInputs {
  return {
    ...src,
    prepEquityPct: 0,
    prepYearsBeforeRetirement: 0,
    withdrawalYears: 0,
  };
}

const MC_TIMEOUT_MS = 60_000;

const CompareStrategies = () => {
  const [threeInputs, setThreeInputs] = useState<RetirementInputs>(baseInputs);
  const [twoInputs, setTwoInputs] = useState<RetirementInputs>({
    ...baseInputs,
    accEquityPct: 0.6,
    prepEquityPct: 0,
    prepYearsBeforeRetirement: 0,
    withdrawalYears: 3,
    withdrawalReturn: 0.055,
  });
  const [oneInputs, setOneInputs] = useState<RetirementInputs>(oneBucketDefaults(baseInputs));

  useEffect(() => {
    document.title = "Compare Retirement Strategies | Balancing Act";
    if (typeof window === "undefined") return;
    const sharedNow = readShared() ?? {};
    setThreeInputs((prev) => ({ ...readInputs(THREE_KEY, prev), ...sharedNow }));
    setTwoInputs((prev) => ({ ...readInputs(TWO_KEY, prev), ...sharedNow }));
    setOneInputs((prev) => oneBucketDefaults({ ...readInputs(THREE_KEY, prev), ...sharedNow }));
  }, []);

  useEffect(() => {
    return subscribeShared(() => {
      const shared = readShared();
      if (!shared) return;
      setThreeInputs((prev) => ({ ...prev, ...shared }));
      setTwoInputs((prev) => ({ ...prev, ...shared }));
      setOneInputs((prev) => oneBucketDefaults({ ...prev, ...shared }));
    });
  }, []);

  useEffect(() => {
    const s = Math.floor(Math.random() * 2 ** 31) || 1;
    setThreeInputs((v) => ({ ...v, sequenceSeed: s }));
    setTwoInputs((v) => ({ ...v, sequenceSeed: s }));
    setOneInputs((v) => ({ ...v, sequenceSeed: s }));
  }, []);

  const updateShared = useCallback(
    <K extends keyof RetirementInputs>(key: K, value: RetirementInputs[K]) => {
      setThreeInputs((prev) => {
        const next = { ...prev, [key]: value };
        writeInputs(THREE_KEY, next);
        writeShared(next);
        return next;
      });
      setTwoInputs((prev) => {
        const next = { ...prev, [key]: value };
        writeInputs(TWO_KEY, next);
        return next;
      });
      setOneInputs((prev) => oneBucketDefaults({ ...prev, [key]: value }));
    },
    [],
  );

  const resetToDefaults = useCallback(() => {
    setThreeInputs(baseInputs);
    setTwoInputs({
      ...baseInputs,
      accEquityPct: 0.6,
      prepEquityPct: 0,
      prepYearsBeforeRetirement: 0,
      withdrawalYears: 3,
      withdrawalReturn: 0.055,
    });
    setOneInputs(oneBucketDefaults(baseInputs));
    writeShared(baseInputs);
    writeInputs(THREE_KEY, baseInputs);
    writeInputs(TWO_KEY, baseInputs);
  }, []);

  const [threeMC, setThreeMC] = useState<MonteCarloResult | undefined>();
  const [twoMC, setTwoMC] = useState<MonteCarloResult | undefined>();
  const [oneMC, setOneMC] = useState<MonteCarloResult | undefined>();
  const [threeProgress, setThreeProgress] = useState({ done: 0, total: 0 });
  const [twoProgress, setTwoProgress] = useState({ done: 0, total: 0 });
  const [oneProgress, setOneProgress] = useState({ done: 0, total: 0 });
  const [mcRunning, setMcRunning] = useState(false);
  const [mcError, setMcError] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const runningRef = useRef(false);

  useEffect(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setMcRunning(true);
    setMcError(null);
    setThreeMC(undefined);
    setTwoMC(undefined);
    setOneMC(undefined);
    setThreeProgress({ done: 0, total: threeInputs.monteCarloRuns });
    setTwoProgress({ done: 0, total: twoInputs.monteCarloRuns });
    setOneProgress({ done: 0, total: oneInputs.monteCarloRuns });

    const ctrl = new AbortController();
    const timeout = setTimeout(() => {
      ctrl.abort();
      setMcError(
        "Monte Carlo simulation timed out. Try fewer runs (lower the MC runs slider) or click Retry.",
      );
      setMcRunning(false);
      runningRef.current = false;
    }, MC_TIMEOUT_MS);

    Promise.all([
      runMonteCarloAsync(oneInputs, projectOneBucket, {
        signal: ctrl.signal,
        strategy: "one-bucket",
        onProgress: (done, total) => setOneProgress({ done, total }),
      }),
      runMonteCarloAsync(threeInputs, project, {
        signal: ctrl.signal,
        strategy: "three-bucket",
        onProgress: (done, total) => setThreeProgress({ done, total }),
      }),
      runMonteCarloAsync(
        {
          ...twoInputs,
          prepEquityPct: 0,
          prepYearsBeforeRetirement: 0,
          withdrawalYears: 0,
        },
        projectTwoBucket,
        {
          signal: ctrl.signal,
          strategy: "two-bucket",
          onProgress: (done, total) => setTwoProgress({ done, total }),
        },
      ),
    ])
      .then(([o, a, b]) => {
        if (ctrl.signal.aborted) return;
        setOneMC(o);
        setThreeMC(a);
        setTwoMC(b);
        setMcRunning(false);
      })
      .catch((err: Error) => {
        if (ctrl.signal.aborted) return;
        setMcError(err?.message || "Monte Carlo run failed unexpectedly.");
        setMcRunning(false);
      })
      .finally(() => {
        clearTimeout(timeout);
        runningRef.current = false;
      });

    return () => {
      clearTimeout(timeout);
      ctrl.abort();
      runningRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threeInputs, twoInputs, oneInputs, runId]);

  const retryMC = () => setRunId((n) => n + 1);

  const pctOrDash = (mc?: MonteCarloResult) =>
    mc ? `${(mc.successProbability * 100).toFixed(1)}%` : "—";
  const medianOrDash = (mc?: MonteCarloResult) =>
    mc?.medianDepletionAge !== undefined ? `${mc.medianDepletionAge}` : "Never";

  const sharedRows: Array<[string, string, string, string]> = [
    ["Date of birth", oneInputs.dob || "—", twoInputs.dob || "—", threeInputs.dob || "—"],
    [
      "Current monthly expenses",
      formatINR(oneInputs.currentMonthlyExpenses),
      formatINR(twoInputs.currentMonthlyExpenses),
      formatINR(threeInputs.currentMonthlyExpenses),
    ],
    ["Inflation rate", pct(oneInputs.inflationRate), pct(twoInputs.inflationRate), pct(threeInputs.inflationRate)],
    ["Retirement corpus", formatINR(oneInputs.currentCorpus), formatINR(twoInputs.currentCorpus), formatINR(threeInputs.currentCorpus)],
    [
      "Monthly investment (SIP)",
      formatINR(oneInputs.monthlyInvestment),
      formatINR(twoInputs.monthlyInvestment),
      formatINR(threeInputs.monthlyInvestment),
    ],
    [
      "SIP annual step-up",
      pct(oneInputs.sipStepUpRate),
      pct(twoInputs.sipStepUpRate),
      pct(threeInputs.sipStepUpRate),
    ],
    ["Retirement age", String(oneInputs.retirementAge), String(twoInputs.retirementAge), String(threeInputs.retirementAge)],
    [
      "Life expectancy age",
      String(oneInputs.lifeExpectancyAge ?? oneInputs.retirementAge + oneInputs.lifeExpectancyYears),
      String(twoInputs.lifeExpectancyAge ?? twoInputs.retirementAge + twoInputs.lifeExpectancyYears),
      String(
        threeInputs.lifeExpectancyAge ??
          threeInputs.retirementAge + threeInputs.lifeExpectancyYears,
      ),
    ],
    [
      "Years planned post-retirement",
      String(oneInputs.lifeExpectancyYears),
      String(twoInputs.lifeExpectancyYears),
      String(threeInputs.lifeExpectancyYears),
    ],
    [
      "Emergency fund (months)",
      String(oneInputs.emergencyFundMonths ?? 0),
      String(twoInputs.emergencyFundMonths ?? 0),
      String(threeInputs.emergencyFundMonths ?? 0),
    ],
    ["Equity expected return", pct(oneInputs.accReturn), pct(twoInputs.accReturn), pct(threeInputs.accReturn)],
    [
      "Debt / withdrawal return",
      "—",
      pct(twoInputs.withdrawalReturn),
      pct(threeInputs.withdrawalReturn),
    ],
    [
      "Preparation bucket return",
      "—",
      "—",
      pct(threeInputs.prepReturn),
    ],
    [
      "Years funded in Preparation bucket",
      "—",
      "—",
      String(threeInputs.prepYearsBeforeRetirement),
    ],
    [
      "Years funded in Withdrawal bucket",
      "—",
      String(twoInputs.withdrawalYears),
      String(threeInputs.withdrawalYears),
    ],
  ];

  const strategyRows: Array<[string, string, string, string]> = [
    ["Preparation expected return", "—", "—", pct(threeInputs.prepReturn)],
    [
      "Years prep starts before retirement",
      "—",
      "—",
      String(threeInputs.prepYearsBeforeRetirement),
    ],
    [
      "Withdrawal bucket years parked",
      "—",
      String(twoInputs.withdrawalYears),
      String(threeInputs.withdrawalYears),
    ],
  ];

  const sequenceRows: Array<[string, string, string, string]> = [
    ["Sequence CAGR", pct(oneInputs.sequenceCagr), pct(twoInputs.sequenceCagr), pct(threeInputs.sequenceCagr)],
    [
      "Sequence min / max",
      `${pct(oneInputs.sequenceMinReturn)} / ${pct(oneInputs.sequenceMaxReturn)}`,
      `${pct(twoInputs.sequenceMinReturn)} / ${pct(twoInputs.sequenceMaxReturn)}`,
      `${pct(threeInputs.sequenceMinReturn)} / ${pct(threeInputs.sequenceMaxReturn)}`,
    ],
    [
      "Monte Carlo runs",
      oneInputs.monteCarloRuns.toLocaleString("en-IN"),
      twoInputs.monteCarloRuns.toLocaleString("en-IN"),
      threeInputs.monteCarloRuns.toLocaleString("en-IN"),
    ],
  ];

  const lifeAge =
    threeInputs.lifeExpectancyAge ??
    threeInputs.retirementAge + threeInputs.lifeExpectancyYears;
  const efMonths =
    threeInputs.emergencyFundMonths ??
    Math.round(
      (threeInputs.emergencyFundToday ?? 0) /
        Math.max(1, threeInputs.currentMonthlyExpenses),
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-6 bg-primary text-primary-foreground border-b border-primary-foreground/10">
        <div className="container mx-auto px-6 lg:px-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-caps text-gold mb-2 text-[10px]">Retirement Calculator</p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
              Strategy Comparison
            </h1>
            <div className="mt-4"><StrategySwitcher activeTab="compare" /></div>
          </div>
          <Button
            onClick={resetToDefaults}
            variant="ghost"
            size="sm"
            className="gap-1.5 h-8 text-xs text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </section>
      <BetaBanner />

      <main className="container mx-auto px-6 lg:px-8 py-8 space-y-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Base assumptions (shared)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Editing here updates both the Three-Bucket and Two-Bucket pages immediately.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="c-dob">Date of birth</Label>
              <Input
                id="c-dob"
                type="date"
                value={threeInputs.dob}
                onChange={(e) => updateShared("dob", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-exp">Monthly expenses (₹)</Label>
              <IndianNumberInput
                id="c-exp"
                value={threeInputs.currentMonthlyExpenses}
                onChange={(n) => {
                  updateShared("currentMonthlyExpenses", n);
                  const months = threeInputs.emergencyFundMonths ?? 0;
                  updateShared("emergencyFundToday", months * n);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-corpus">Current corpus (₹)</Label>
              <IndianNumberInput
                id="c-corpus"
                value={threeInputs.currentCorpus}
                onChange={(n) => updateShared("currentCorpus", n)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-sip">Monthly SIP (₹)</Label>
              <IndianNumberInput
                id="c-sip"
                value={threeInputs.monthlyInvestment}
                onChange={(n) => updateShared("monthlyInvestment", n)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-ret">Retirement age</Label>
              <Input
                id="c-ret"
                type="number"
                value={threeInputs.retirementAge}
                onChange={(e) => {
                  const age = Number(e.target.value) || 0;
                  updateShared("retirementAge", age);
                  const la =
                    threeInputs.lifeExpectancyAge ??
                    age + threeInputs.lifeExpectancyYears;
                  updateShared("lifeExpectancyYears", Math.max(0, la - age));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-life">Life expectancy (age)</Label>
              <Input
                id="c-life"
                type="number"
                value={lifeAge}
                onChange={(e) => {
                  const la = Number(e.target.value) || 0;
                  updateShared("lifeExpectancyAge", la);
                  updateShared(
                    "lifeExpectancyYears",
                    Math.max(0, la - threeInputs.retirementAge),
                  );
                }}
              />
              <p className="text-xs text-muted-foreground">
                Plan years post-retirement ={" "}
                {Math.max(0, lifeAge - threeInputs.retirementAge)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Inflation: {pct(threeInputs.inflationRate)}</Label>
              <Slider
                value={[threeInputs.inflationRate * 100]}
                min={2}
                max={12}
                step={0.5}
                onValueChange={(v) => updateShared("inflationRate", v[0] / 100)}
              />
            </div>
            <div className="space-y-2">
              <Label>SIP step-up: {pct(threeInputs.sipStepUpRate)}</Label>
              <Slider
                value={[threeInputs.sipStepUpRate * 100]}
                min={0}
                max={20}
                step={1}
                onValueChange={(v) => updateShared("sipStepUpRate", v[0] / 100)}
              />
            </div>
            <div className="space-y-2">
              <Label>Equity return: {pct(threeInputs.accReturn)}</Label>
              <Slider
                value={[threeInputs.accReturn * 100]}
                min={4}
                max={18}
                step={0.5}
                onValueChange={(v) => {
                  updateShared("accReturn", v[0] / 100);
                  updateShared("sequenceCagr", v[0] / 100);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Debt return: {pct(threeInputs.withdrawalReturn)}</Label>
              <Slider
                value={[threeInputs.withdrawalReturn * 100]}
                min={4}
                max={18}
                step={0.25}
                onValueChange={(v) => updateShared("withdrawalReturn", v[0] / 100)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-ef">Emergency fund (months of expenses)</Label>
              <Input
                id="c-ef"
                type="number"
                value={efMonths}
                onChange={(e) => {
                  const months = Number(e.target.value) || 0;
                  updateShared("emergencyFundMonths", months);
                  updateShared(
                    "emergencyFundToday",
                    months * threeInputs.currentMonthlyExpenses,
                  );
                }}
              />
              <p className="text-xs text-muted-foreground">
                ≈ ₹
                {(threeInputs.currentMonthlyExpenses * efMonths).toLocaleString(
                  "en-IN",
                )}{" "}
                today.
              </p>
            </div>
            <div className="space-y-2">
              <Label>
                MC runs: {threeInputs.monteCarloRuns.toLocaleString("en-IN")}
              </Label>
              <Slider
                value={[threeInputs.monteCarloRuns]}
                min={1000}
                max={10000}
                step={500}
                onValueChange={(v) => updateShared("monteCarloRuns", v[0])}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-serif text-2xl">Monte Carlo outcomes</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Higher success probability and a later (or "Never") median depletion age = more resilient plan.
                </p>
              </div>
              <Button onClick={retryMC} variant="outline" size="sm" disabled={mcRunning}>
                {mcRunning ? "Running…" : "Retry"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mcError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 flex items-start gap-2 text-sm">
                <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-destructive">Monte Carlo run failed</div>
                  <div className="text-muted-foreground">{mcError}</div>
                </div>
                <Button size="sm" variant="outline" onClick={retryMC}>
                  Retry
                </Button>
              </div>
            )}

            {mcRunning && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="text-xs label-caps mb-1">One-bucket</div>
                  <Progress
                    value={
                      oneProgress.total
                        ? Math.round((oneProgress.done / oneProgress.total) * 100)
                        : 0
                    }
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {oneProgress.done.toLocaleString("en-IN")} /{" "}
                    {oneProgress.total.toLocaleString("en-IN")} runs
                  </div>
                </div>
                <div>
                  <div className="text-xs label-caps mb-1">Two-bucket</div>
                  <Progress
                    value={
                      twoProgress.total
                        ? Math.round((twoProgress.done / twoProgress.total) * 100)
                        : 0
                    }
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {twoProgress.done.toLocaleString("en-IN")} /{" "}
                    {twoProgress.total.toLocaleString("en-IN")} runs
                  </div>
                </div>
                <div>
                  <div className="text-xs label-caps mb-1">Three-bucket</div>
                  <Progress
                    value={
                      threeProgress.total
                        ? Math.round((threeProgress.done / threeProgress.total) * 100)
                        : 0
                    }
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {threeProgress.done.toLocaleString("en-IN")} /{" "}
                    {threeProgress.total.toLocaleString("en-IN")} runs
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-border bg-card p-4">
                <div className="label-caps text-xs">One-bucket</div>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Success probability</div>
                    <div className="text-3xl font-serif tabular-nums">{pctOrDash(oneMC)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Median depletion age</div>
                    <div className="text-3xl font-serif tabular-nums">{medianOrDash(oneMC)}</div>
                  </div>
                </div>
              </div>
              <div className="border border-border bg-card p-4">
                <div className="label-caps text-xs">Two-bucket</div>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Success probability</div>
                    <div className="text-3xl font-serif tabular-nums">{pctOrDash(twoMC)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Median depletion age</div>
                    <div className="text-3xl font-serif tabular-nums">{medianOrDash(twoMC)}</div>
                  </div>
                </div>
              </div>
              <div className="border border-border bg-card p-4">
                <div className="label-caps text-xs">Three-bucket</div>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Success probability</div>
                    <div className="text-3xl font-serif tabular-nums">{pctOrDash(threeMC)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Median depletion age</div>
                    <div className="text-3xl font-serif tabular-nums">{medianOrDash(threeMC)}</div>
                  </div>
                </div>
              </div>
            </div>

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
                  {[
                    ["Success probability", pctOrDash(oneMC), pctOrDash(twoMC), pctOrDash(threeMC)],
                    [
                      "Run count",
                      oneMC ? oneMC.runs.toLocaleString("en-IN") : "—",
                      twoMC ? twoMC.runs.toLocaleString("en-IN") : "—",
                      threeMC ? threeMC.runs.toLocaleString("en-IN") : "—",
                    ],
                    [
                      "Successes (corpus survived)",
                      oneMC ? oneMC.successCount.toLocaleString("en-IN") : "—",
                      twoMC ? twoMC.successCount.toLocaleString("en-IN") : "—",
                      threeMC ? threeMC.successCount.toLocaleString("en-IN") : "—",
                    ],
                    [
                      "Failures (corpus depleted)",
                      oneMC ? oneMC.failureCount.toLocaleString("en-IN") : "—",
                      twoMC ? twoMC.failureCount.toLocaleString("en-IN") : "—",
                      threeMC ? threeMC.failureCount.toLocaleString("en-IN") : "—",
                    ],
                    ["Median depletion age (failed runs)", medianOrDash(oneMC), medianOrDash(twoMC), medianOrDash(threeMC)],
                    [
                      "Worst 10% expected corpus",
                      oneMC ? formatINR(oneMC.p10FinalCorpus) : "—",
                      twoMC ? formatINR(twoMC.p10FinalCorpus) : "—",
                      threeMC ? formatINR(threeMC.p10FinalCorpus) : "—",
                    ],
                    [
                      "Median expected corpus",
                      oneMC ? formatINR(oneMC.p50FinalCorpus) : "—",
                      twoMC ? formatINR(twoMC.p50FinalCorpus) : "—",
                      threeMC ? formatINR(threeMC.p50FinalCorpus) : "—",
                    ],
                    [
                      "Best 10% expected corpus",
                      oneMC ? formatINR(oneMC.p90FinalCorpus) : "—",
                      twoMC ? formatINR(twoMC.p90FinalCorpus) : "—",
                      threeMC ? formatINR(threeMC.p90FinalCorpus) : "—",
                    ],
                  ].map(([label, a, b, c]) => (
                    <TableRow key={label}>
                      <TableCell className="font-medium">{label}</TableCell>
                      <TableCell className="tabular-nums">{a}</TableCell>
                      <TableCell className="tabular-nums">{b}</TableCell>
                      <TableCell className="tabular-nums">{c}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Assumptions side-by-side</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AssumptionTable title="Base data" rows={sharedRows} />
            <AssumptionTable title="Strategy mechanics" rows={strategyRows} />
            <AssumptionTable title="Sequence-of-returns / Monte Carlo settings" rows={sequenceRows} />
          </CardContent>
        </Card>

        <SameSequenceComparison
          oneInputs={oneInputs}
          twoInputs={twoInputs}
          threeInputs={threeInputs}
        />

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">How to read this comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              The <span className="font-medium text-foreground">three-bucket strategy</span> splits your
              wealth into accumulation, preparation and withdrawal — to insulate near-term spending
              from equity drawdowns.
            </p>
            <p>
              The <span className="font-medium text-foreground">two-bucket strategy</span> uses a single
              Accumulation bucket that runs SIPs and growth right through to retirement. At retirement
              it seeds a Withdrawal bucket with a few years of expenses plus the emergency reserve,
              and refills that bucket from Accumulation each year as expenses are drawn.
            </p>
            <p>
              Confidence comes from running thousands of independent sequence-of-returns scenarios and
              counting the share that still have a positive corpus at end of life expectancy.
            </p>
            <p className="text-xs">Educational tool, not financial advice. Returns are nominal.</p>
          </CardContent>
        </Card>
      </main>
      <div className="container mx-auto px-6 lg:px-8 pb-10">
        <StrategyDifferenceNote />
      </div>
      <Footer />
    </div>
  );
};

function AssumptionTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string, string, string]>;
}) {
  return (
    <div>
      <h3 className="font-serif text-lg mb-2">{title}</h3>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Assumption</TableHead>
              <TableHead>One-bucket</TableHead>
              <TableHead>Two-bucket</TableHead>
              <TableHead>Three-bucket</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([label, a, b, c]) => (
              <TableRow key={label}>
                <TableCell className="font-medium">{label}</TableCell>
                <TableCell className="tabular-nums">{a}</TableCell>
                <TableCell className="tabular-nums">{b}</TableCell>
                <TableCell className="tabular-nums">{c}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default CompareStrategies;

function SameSequenceComparison({
  oneInputs,
  twoInputs,
  threeInputs,
}: {
  oneInputs: RetirementInputs;
  twoInputs: RetirementInputs;
  threeInputs: RetirementInputs;
}) {
  // Force a deterministic single-path projection by disabling MC mode but
  // keeping the sequence-of-returns generator with the shared seed.
  // The runners internally force sequence MC mode and the sequence
  // generator is deterministic for a given seed, so passing the same seed
  // through all three strategies gives identical year-by-year returns.
  const detInputs = (src: RetirementInputs): RetirementInputs => ({
    ...src,
    sequenceSeed: threeInputs.sequenceSeed,
  });
  const one = useMemo(() => projectOneBucket(detInputs(oneInputs)), [oneInputs, threeInputs.sequenceSeed]);
  const two = useMemo(() => projectTwoBucket(detInputs(twoInputs)), [twoInputs, threeInputs.sequenceSeed]);
  const three = useMemo(() => project(detInputs(threeInputs)), [threeInputs]);

  // Align rows by year
  const ages = useMemo(() => {
    const set = new Set<number>();
    [one.rows, two.rows, three.rows].forEach((rs) => rs.forEach((r) => set.add(r.age)));
    return Array.from(set).sort((a, b) => a - b);
  }, [one.rows, two.rows, three.rows]);

  const byAge = (rs: typeof one.rows) => {
    const m = new Map<number, (typeof rs)[number]>();
    rs.forEach((r) => m.set(r.age, r));
    return m;
  };
  const oneM = byAge(one.rows);
  const twoM = byAge(two.rows);
  const threeM = byAge(three.rows);

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">
          Advanced: same-sequence year-by-year comparison
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          All three strategies are run against the{" "}
          <span className="font-medium text-foreground">exact same sequence of market returns</span>{" "}
          (seed{" "}
          <span className="font-mono">{threeInputs.sequenceSeed}</span>) so you
          can compare how each one handles identical conditions. Expand to view.
        </p>
      </CardHeader>
      <CardContent>
        <details>
          <summary className="cursor-pointer select-none text-sm font-medium mb-3">
            Show year-by-year table
          </summary>
          <div className="rounded-md border overflow-auto max-h-[560px]">
            <table className="w-full text-xs caption-bottom border-collapse">
              <thead className="sticky top-0 bg-card border-b">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium text-muted-foreground">Age</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground text-right">One-bucket total</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground text-right">Two-bucket total</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground text-right">Three-bucket total</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground text-right">Annual expense</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground text-right">Return applied</th>
                </tr>
              </thead>
              <tbody>
                {ages.map((age) => {
                  const o = oneM.get(age);
                  const t = twoM.get(age);
                  const th = threeM.get(age);
                  const ret = th?.accReturnApplied ?? t?.accReturnApplied ?? o?.accReturnApplied ?? 0;
                  const exp = th?.expense ?? t?.expense ?? o?.expense ?? 0;
                  return (
                    <tr key={age} className="border-b hover:bg-muted/40">
                      <td className="px-3 py-1.5 tabular-nums">{age}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{o ? formatINR(o.total) : "—"}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{t ? formatINR(t.total) : "—"}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{th ? formatINR(th.total) : "—"}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{exp ? formatINR(exp) : "—"}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums font-mono text-muted-foreground">{(ret * 100).toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}