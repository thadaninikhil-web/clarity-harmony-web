import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuidedInputsChat } from "@/components/retirement/GuidedInputsChat";
import { InputsErrorBoundary } from "@/components/retirement/InputsErrorBoundary";
import { Results } from "@/components/retirement/Results";
import { Methodology } from "@/components/retirement/Methodology";
import { HowToUse } from "@/components/retirement/HowToUse";
import { CalculatorSectionNav } from "@/components/retirement/CalculatorSectionNav";
import { ValidationBanner } from "@/components/retirement/ValidationBanner";
import { StrategySwitcher } from "@/components/retirement/StrategySwitcher";
import {
  projectOneBucket,
  validateInputs,
  attachBullets,
  type RetirementInputs,
} from "@/lib/retirement";

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
  accEquityPct: 1,
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

// One-bucket only needs the corpus + sequence inputs. Skip the
// growth/SIP/preparation/withdrawal questions entirely.
const SKIP = [
  "monthlyInvestment",
  "sipStepUpRate",
  "prepYearsBeforeRetirement",
  "prepReturn",
  "prepEquityPct",
  "withdrawalYears",
  "withdrawalReturn",
];

const OneBucketSimulator = () => {
  const [values, setValues] = useState<RetirementInputs>(defaults);
  const safeValues = useMemo(
    () => ({ ...values, monthlyInvestment: 0, sipStepUpRate: 0, accEquityPct: 1 }),
    [values],
  );
  const validation = useMemo(() => validateInputs(safeValues), [safeValues]);
  const result = useMemo(
    () =>
      attachBullets(
        validation.ok ? projectOneBucket(safeValues) : projectOneBucket(defaults),
        "one-bucket",
      ),
    [safeValues, validation.ok],
  );
  const [completed, setCompleted] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const reshuffleSequence = useCallback(() => {
    setValues((v) => ({ ...v, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 }));
  }, []);
  const resetToDefaults = useCallback(() => setValues(defaults), []);

  useEffect(() => {
    document.title = "One-Bucket Retirement Simulator | Balancing Act";
    setValues((v) => ({ ...v, sequenceSeed: Math.floor(Math.random() * 2 ** 31) || 1 }));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-10 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <p className="label-caps text-gold mb-3">Calculator</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            One-Bucket Retirement Simulator
          </h1>
          <p className="max-w-2xl mx-auto text-base text-primary-foreground/80">
            A single retirement corpus that grows, gets spent down, and is
            stress-tested for sequence-of-returns risk — no equity / debt
            split, no buckets.
          </p>
          <StrategySwitcher activeTab="one" />
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 max-w-full overflow-x-hidden">
        <CalculatorSectionNav />
        <section id="how-to-use" className="scroll-mt-40">
          <HowToUse strategy="one-bucket" />
        </section>

        <InputsErrorBoundary>
          <GuidedInputsChat
            values={values}
            onChange={setValues}
            completed={completed}
            skipQuestionIds={SKIP}
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
              name={values.name}
              inputs={safeValues}
              strategy="one-bucket"
              onReshuffleSequence={reshuffleSequence}
              onMonteCarloRunsChange={(runs) => setValues((v) => ({ ...v, monteCarloRuns: runs }))}
              onSelectRun={(seed) => setValues((v) => ({ ...v, sequenceSeed: seed }))}
            />
            <SaveCompare inputs={safeValues} result={result} onLoad={setValues} />
          </div>
        )}
        <section id="how-it-works" className="scroll-mt-40">
          <Methodology strategy="one-bucket" />
        </section>
        <p className="mt-12 text-center text-xs text-muted-foreground">
          Educational calculator — not investment advice. The corpus you enter
          is treated as the value on retirement day; the simulation begins
          there and runs to your plan-until age.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default OneBucketSimulator;
