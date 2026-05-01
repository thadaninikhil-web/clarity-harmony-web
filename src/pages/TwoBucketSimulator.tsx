import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TwoBucketInputsForm } from "@/components/retirement/TwoBucketInputsForm";
import { InputsErrorBoundary } from "@/components/retirement/InputsErrorBoundary";
import { Results } from "@/components/retirement/Results";
import { Methodology } from "@/components/retirement/Methodology";
import { HowToUse } from "@/components/retirement/HowToUse";
import { SaveCompare } from "@/components/retirement/SaveCompare";
import { ValidationBanner } from "@/components/retirement/ValidationBanner";
import { StrategySwitcher } from "@/components/retirement/StrategySwitcher";
import {
  projectTwoBucket,
  validateInputs,
  type RetirementInputs,
} from "@/lib/retirement";
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
  accEquityPct: 0.6,
  accReturn: 0.1,
  prepEquityPct: 0,
  prepReturn: 0.07,
  prepYearsBeforeRetirement: 0,
  withdrawalYears: 0,
  withdrawalReturn: 0.07,
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

const TwoBucketSimulator = () => {
  const [values, setValues] = useState<RetirementInputs>(() => {
    const shared = readShared();
    return shared ? { ...defaults, ...shared } : defaults;
  });
  const skipNextWriteRef = useRef(false);

  // Force prep fields off so any inputs flowing in from shared / saved
  // scenarios cannot accidentally re-introduce a third bucket.
  const safeValues = useMemo(
    () => ({
      ...values,
      prepYearsBeforeRetirement: 0,
      prepEquityPct: 0,
      withdrawalYears: 0,
    }),
    [values],
  );
  const validation = useMemo(() => validateInputs(safeValues), [safeValues]);
  const result = useMemo(
    () =>
      validation.ok ? projectTwoBucket(safeValues) : projectTwoBucket(defaults),
    [safeValues, validation.ok],
  );

  const reshuffleSequence = useCallback(() => {
    setValues((v) => ({
      ...v,
      sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1,
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setValues(defaults);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "ba.lastInputs.twoBucket",
        JSON.stringify(safeValues),
      );
    } catch {
      // ignore
    }
    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      return;
    }
    writeShared(safeValues);
  }, [safeValues]);

  useEffect(() => {
    return subscribeShared(() => {
      const shared = readShared();
      if (!shared) return;
      setValues((prev) => {
        const prevAny = prev as unknown as Record<string, unknown>;
        const sharedAny = shared as Record<string, unknown>;
        const same = Object.keys(sharedAny).every(
          (k) => prevAny[k] === sharedAny[k],
        );
        if (same) return prev;
        skipNextWriteRef.current = true;
        return { ...prev, ...shared };
      });
    });
  }, []);

  useEffect(() => {
    setValues((v) => ({
      ...v,
      sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1,
    }));
    document.title = "Two-Bucket Retirement Simulator | Balancing Act";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-10 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <p className="label-caps text-gold mb-3">Calculator</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            Two-Bucket Retirement Simulator
          </h1>
          <p className="max-w-2xl mx-auto text-base text-primary-foreground/80">
            One rebalanced portfolio with a target equity / debt split — no
            preparation bucket, no glide path.
          </p>
          <StrategySwitcher activeTab="two" />
        </div>
      </section>

      <main className="container mx-auto px-6 lg:px-8 py-10 space-y-6">
        <HowToUse strategy="two-bucket" />
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside>
            <InputsErrorBoundary>
              <TwoBucketInputsForm
                values={values}
                onChange={setValues}
                onReset={resetToDefaults}
              />
            </InputsErrorBoundary>
          </aside>
          <section className="space-y-6">
            <ValidationBanner issues={validation.errors} />
            <Results
              result={result}
              name={values.name}
              inputs={safeValues}
              strategy="two-bucket"
              onReshuffleSequence={reshuffleSequence}
              onSipSolved={(sip) =>
                setValues((v) => ({ ...v, monthlyInvestment: sip }))
              }
            />
            <SaveCompare inputs={safeValues} result={result} onLoad={setValues} />
            <Methodology strategy="two-bucket" />
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

export default TwoBucketSimulator;