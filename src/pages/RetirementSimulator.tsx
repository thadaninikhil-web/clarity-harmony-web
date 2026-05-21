import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InputsErrorBoundary } from "@/components/retirement/InputsErrorBoundary";
import { InputsForm } from "@/components/retirement/InputsForm";
import { Results } from "@/components/retirement/Results";
import { Methodology } from "@/components/retirement/Methodology";
import { HowToUse } from "@/components/retirement/HowToUse";
import { CalculatorSectionNav } from "@/components/retirement/CalculatorSectionNav";
import { ValidationBanner } from "@/components/retirement/ValidationBanner";
import { StrategySwitcher } from "@/components/retirement/StrategySwitcher";
import { BetaBanner } from "@/components/retirement/BetaBanner";
import { StrategyDifferenceNote } from "@/components/retirement/StrategyDifferenceNote";
import { project, validateInputs, attachBullets, type RetirementInputs } from "@/lib/retirement";
import { readShared, subscribeShared, writeShared } from "@/lib/sharedInputs";

const defaultMonthlyExpenses = 80000;
const defaultRetireAge = 60;
const defaults: RetirementInputs = {
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

const RetirementSimulator = () => {
  // Load any previously-entered shared inputs so the user doesn't have to
  // re-answer the same questions on the two-bucket / compare tabs.
  const initialShared = useMemo(() => readShared(), []);
  const [values, setValues] = useState<RetirementInputs>(() =>
    initialShared ? { ...defaults, ...initialShared } : defaults,
  );
  const validation = useMemo(() => validateInputs(values), [values]);
  const result = useMemo(
    () => attachBullets(validation.ok ? project(values) : project(defaults), "three-bucket"),
    [values, validation.ok],
  );
  const skipNextWriteRef = useRef(false);

  const reshuffleSequence = useCallback(() => {
    setValues((v) => ({ ...v, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setValues(defaults);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("ba.lastInputs.threeBucket", JSON.stringify(values));
    } catch {
      // ignore
    }
    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      return;
    }
    writeShared(values);
  }, [values]);

  useEffect(() => {
    return subscribeShared(() => {
      const shared = readShared();
      if (!shared) return;
      setValues((prev) => {
        const prevAny = prev as unknown as Record<string, unknown>;
        const sharedAny = shared as Record<string, unknown>;
        const same = Object.keys(sharedAny).every((k) => prevAny[k] === sharedAny[k]);
        if (same) return prev;
        skipNextWriteRef.current = true;
        return { ...prev, ...shared };
      });
    });
  }, []);

  useEffect(() => {
    setValues((v) => ({ ...v, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 }));
    document.title = "Retirement Simulator | Balancing Act";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-6 bg-primary text-primary-foreground border-b border-primary-foreground/10">
        <div className="container mx-auto px-6 lg:px-8">
          <p className="label-caps text-gold mb-2 text-[10px]">Retirement Calculator</p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            Three-Bucket Simulator
          </h1>
          <div className="mt-4"><StrategySwitcher activeTab="three" /></div>
        </div>
      </section>
      <BetaBanner />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-full overflow-x-hidden">
        <CalculatorSectionNav />
        <section id="how-to-use" className="scroll-mt-40 mt-4">
          <HowToUse strategy="three-bucket" />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1">
            <InputsErrorBoundary>
              <InputsForm values={values} onChange={setValues} onReset={resetToDefaults} strategy="three-bucket" />
            </InputsErrorBoundary>
          </aside>
          <div className="min-w-0 space-y-4">
            <ValidationBanner issues={validation.errors} />
            <Results
              result={result}
              name={values.name}
              inputs={values}
              strategy="three-bucket"
              onReshuffleSequence={reshuffleSequence}
              onSipSolved={(sip) => setValues((v) => ({ ...v, monthlyInvestment: sip }))}
              onMonteCarloRunsChange={(runs) => setValues((v) => ({ ...v, monteCarloRuns: runs }))}
              onSelectRun={(seed) => setValues((v) => ({ ...v, sequenceSeed: seed }))}
            />
          </div>
        </div>

        <section id="how-it-works" className="scroll-mt-40 mt-10">
          <Methodology strategy="three-bucket" />
        </section>
        <StrategyDifferenceNote />
      </main>
      <Footer />
    </div>
  );
};

export default RetirementSimulator;