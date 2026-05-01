import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InputsForm } from "@/components/retirement/InputsForm";
import { InputsErrorBoundary } from "@/components/retirement/InputsErrorBoundary";
import { Results } from "@/components/retirement/Results";
import { Methodology } from "@/components/retirement/Methodology";
import { HowToUse } from "@/components/retirement/HowToUse";
import { SaveCompare } from "@/components/retirement/SaveCompare";
import { ValidationBanner } from "@/components/retirement/ValidationBanner";
import { StrategySwitcher } from "@/components/retirement/StrategySwitcher";
import { project, validateInputs, type RetirementInputs } from "@/lib/retirement";
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

const RetirementSimulator = () => {
  const [values, setValues] = useState<RetirementInputs>(() => {
    const shared = readShared();
    return shared ? { ...defaults, ...shared } : defaults;
  });
  const validation = useMemo(() => validateInputs(values), [values]);
  const result = useMemo(
    () => (validation.ok ? project(values) : project(defaults)),
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
      {/* Slim page banner — sits below the global Navbar */}
      <section className="pt-32 pb-10 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <p className="label-caps text-gold mb-3">Calculator</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            Three-Bucket Retirement Simulator
          </h1>
          <p className="max-w-2xl mx-auto text-base text-primary-foreground/80">
            Plan your retirement using the accumulation, preparation and
            withdrawal bucket framework — with sequence-of-returns stress
            testing and a year-by-year projection.
          </p>
          <StrategySwitcher activeTab="three" />
        </div>
      </section>

      <main className="container mx-auto px-6 lg:px-8 py-10 space-y-6">
        <HowToUse strategy="three-bucket" />
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside>
            <InputsErrorBoundary>
              <InputsForm values={values} onChange={setValues} onReset={resetToDefaults} />
            </InputsErrorBoundary>
          </aside>
          <section className="space-y-6">
            <ValidationBanner issues={validation.errors} />
            <Results
              result={result}
              name={values.name}
              inputs={values}
              strategy="three-bucket"
              onReshuffleSequence={reshuffleSequence}
              onSipSolved={(sip) => setValues((v) => ({ ...v, monthlyInvestment: sip }))}
            />
            <SaveCompare inputs={values} result={result} onLoad={setValues} />
            <Methodology strategy="three-bucket" />
          </section>
        </div>
        <p className="mt-12 text-center text-xs text-muted-foreground">
          Educational calculator — not investment advice. Returns shown are
          nominal and assume constant rates apart from the configured stress
          scenario.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default RetirementSimulator;