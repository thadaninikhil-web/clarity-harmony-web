import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IndianNumberInput } from "@/components/retirement/IndianNumberInput";
import type { RetirementInputs } from "@/lib/retirement";

interface Props {
  values: RetirementInputs;
  onChange: (next: RetirementInputs) => void;
  onReset?: () => void;
}

const num = (v: string) => (v === "" ? 0 : Number(v));
const TODAY = new Date().toISOString().slice(0, 10);
const MIN_DOB = "1900-01-01";

export function InputsForm({ values, onChange, onReset }: Props) {
  const set = <K extends keyof RetirementInputs>(k: K, v: RetirementInputs[K]) =>
    onChange({ ...values, [k]: v });

  const lifeAge = values.lifeExpectancyAge ?? values.retirementAge + values.lifeExpectancyYears;
  const lifeInvalid = lifeAge <= values.retirementAge;

  return (
    <div className="space-y-4">
      {onReset && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="size-4" />
            Reset to defaults
          </Button>
        </div>
      )}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="font-serif">About you</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              data-field="dob"
              type="date"
              min={MIN_DOB}
              max={TODAY}
              value={values.dob}
              onChange={(e) => {
                const v = e.target.value;
                // Allow free typing — the browser only emits a value once
                // the date parses, so "1" or partial entries never reach
                // here. Only guard against a fully formed but out-of-range
                // year (e.g. 19761) which the browser would still emit.
                if (v) {
                  const yr = Number(v.slice(0, 4));
                  if (!Number.isFinite(yr) || yr > 9999) return;
                }
                set("dob", v);
              }}
            />
            <p className="text-xs text-muted-foreground">Use a date between {MIN_DOB} and today.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp">Current monthly expenses (₹)</Label>
            <IndianNumberInput id="exp" value={values.currentMonthlyExpenses} onChange={(n) => set("currentMonthlyExpenses", n)} />
          </div>
          <div className="space-y-2">
            <Label>Inflation rate: {(values.inflationRate * 100).toFixed(1)}%</Label>
            <Slider value={[values.inflationRate * 100]} min={2} max={12} step={0.5} onValueChange={(v) => set("inflationRate", v[0] / 100)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="corpus">Current Retirement Corpus (₹)</Label>
            <IndianNumberInput id="corpus" value={values.currentCorpus} onChange={(n) => set("currentCorpus", n)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sip">Monthly investment (₹)</Label>
            <IndianNumberInput id="sip" value={values.monthlyInvestment} onChange={(n) => set("monthlyInvestment", n)} />
          </div>
          <div className="space-y-2">
            <Label>SIP annual step-up: {(values.sipStepUpRate * 100).toFixed(0)}%</Label>
            <Slider value={[values.sipStepUpRate * 100]} min={0} max={20} step={1} onValueChange={(v) => set("sipStepUpRate", v[0] / 100)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ret">Retirement age</Label>
            <Input id="ret" data-field="retirementAge" type="number" min={18} max={100} value={values.retirementAge} onChange={(e) => set("retirementAge", num(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="life-age">Life expectancy (age)</Label>
            <Input
              id="life-age"
              data-field="lifeExpectancyAge"
              type="number"
              min={values.retirementAge + 1}
              max={120}
              aria-invalid={lifeInvalid}
              className={lifeInvalid ? "border-destructive" : undefined}
              value={lifeAge}
              onChange={(e) => {
                const age = num(e.target.value);
                onChange({
                  ...values,
                  lifeExpectancyAge: age,
                  lifeExpectancyYears: Math.max(0, age - values.retirementAge),
                });
              }}
            />
            {lifeInvalid ? (
              <p className="text-xs text-destructive">
                Life expectancy must be greater than retirement age ({values.retirementAge}).
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Plan years post-retirement = {Math.max(0, lifeAge - values.retirementAge)}
              </p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ef-mo">Emergency fund (months of current expenses)</Label>
            <Input
              id="ef-mo"
              type="number"
              value={values.emergencyFundMonths ?? Math.round((values.emergencyFundToday ?? 0) / Math.max(1, values.currentMonthlyExpenses))}
              onChange={(e) => {
                const months = num(e.target.value);
                onChange({
                  ...values,
                  emergencyFundMonths: months,
                  emergencyFundToday: months * values.currentMonthlyExpenses,
                });
              }}
            />
            <p className="text-xs text-muted-foreground">
              ≈ {(values.currentMonthlyExpenses * (values.emergencyFundMonths ?? Math.round((values.emergencyFundToday ?? 0) / Math.max(1, values.currentMonthlyExpenses)))).toLocaleString("en-IN")} ₹ today. Inflated to retirement and parked inside the Withdrawal bucket.
            </p>
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["b1", "b2", "b3"]} className="space-y-4">
        <AccordionItem value="b1" className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <AccordionTrigger className="px-6">
            <span className="flex items-center gap-3">
              <span className="size-3 rounded-full bg-bucket-accumulation" />
              Bucket 1 — Accumulation (high risk · high return)
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Equity allocation: {(values.accEquityPct * 100).toFixed(0)}%</Label>
                <Slider value={[values.accEquityPct * 100]} min={0} max={100} step={5} onValueChange={(v) => set("accEquityPct", v[0] / 100)} />
              </div>
              <div className="space-y-2">
                <Label>Expected CAGR: {(values.sequenceCagr * 100).toFixed(1)}%</Label>
                <Slider
                  value={[values.sequenceCagr * 100]}
                  min={2}
                  max={18}
                  step={0.5}
                  onValueChange={(v) => onChange({ ...values, sequenceCagr: v[0] / 100, accReturn: v[0] / 100 })}
                />
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted/20 p-4 space-y-4">
              <div>
                <div className="font-medium text-sm">Sequence-of-returns risk (always on)</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Year-to-year returns swing between the min and max below while
                  averaging to the CAGR you set. We then run thousands of these
                  random orderings (Monte Carlo) and report how often your corpus
                  lasts till life expectancy.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Min year return: {(values.sequenceMinReturn * 100).toFixed(0)}%</Label>
                  <Slider value={[values.sequenceMinReturn * 100]} min={-50} max={5} step={1} onValueChange={(v) => set("sequenceMinReturn", v[0] / 100)} />
                </div>
                <div className="space-y-2">
                  <Label>Max year return: {(values.sequenceMaxReturn * 100).toFixed(0)}%</Label>
                  <Slider value={[values.sequenceMaxReturn * 100]} min={5} max={50} step={1} onValueChange={(v) => set("sequenceMaxReturn", v[0] / 100)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Monte Carlo runs: {values.monteCarloRuns.toLocaleString("en-IN")}</Label>
                  <Slider value={[values.monteCarloRuns]} min={1000} max={10000} step={500} onValueChange={(v) => set("monteCarloRuns", v[0])} />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="b2" className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <AccordionTrigger className="px-6">
            <span className="flex items-center gap-3">
              <span className="size-3 rounded-full bg-bucket-preparation" />
              Bucket 2 — Preparation (buffer)
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Equity allocation: {(values.prepEquityPct * 100).toFixed(0)}%</Label>
                <Slider value={[values.prepEquityPct * 100]} min={0} max={100} step={5} onValueChange={(v) => set("prepEquityPct", v[0] / 100)} />
              </div>
              <div className="space-y-2">
                <Label>Expected return: {(values.prepReturn * 100).toFixed(1)}%</Label>
                <Slider value={[values.prepReturn * 100]} min={4} max={18} step={0.5} onValueChange={(v) => set("prepReturn", v[0] / 100)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Start shifting from accumulation: {values.prepYearsBeforeRetirement} years before retirement</Label>
                <Slider value={[values.prepYearsBeforeRetirement]} min={0} max={8} step={1} onValueChange={(v) => set("prepYearsBeforeRetirement", v[0])} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="b3" className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <AccordionTrigger className="px-6">
            <span className="flex items-center gap-3">
              <span className="size-3 rounded-full bg-bucket-withdrawal" />
              Bucket 3 — Withdrawal (debt only)
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Years of expenses parked here: {values.withdrawalYears}</Label>
                <Slider value={[values.withdrawalYears]} min={0} max={8} step={1} onValueChange={(v) => set("withdrawalYears", v[0])} />
              </div>
              <div className="space-y-2">
                <Label>Equity allocation: 0% (debt-only by design)</Label>
                <Slider value={[0]} min={0} max={100} step={5} disabled />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Expected return: {(values.withdrawalReturn * 100).toFixed(2)}%</Label>
                <Slider value={[values.withdrawalReturn * 100]} min={4} max={18} step={0.25} onValueChange={(v) => set("withdrawalReturn", v[0] / 100)} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
