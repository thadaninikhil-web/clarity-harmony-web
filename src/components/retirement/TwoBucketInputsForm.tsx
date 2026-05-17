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

export function TwoBucketInputsForm({ values, onChange, onReset }: Props) {
  const set = <K extends keyof RetirementInputs>(k: K, v: RetirementInputs[K]) =>
    onChange({ ...values, [k]: v });

  const lifeAge = values.lifeExpectancyAge ?? values.retirementAge + values.lifeExpectancyYears;
  const lifeInvalid = lifeAge <= values.retirementAge;
  const planYears = Math.max(1, lifeAge - values.retirementAge);
  const withdrawalMax = Math.min(10, planYears);
  const withdrawalInvalid =
    values.withdrawalYears < 1 || values.withdrawalYears > planYears;
  const efMonths =
    values.emergencyFundMonths ??
    Math.round((values.emergencyFundToday ?? 0) / Math.max(1, values.currentMonthlyExpenses));

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
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-base">About you</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1 — Profile */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-xs">Date of birth</Label>
              <Input
                id="dob"
                data-field="dob"
                type="date"
                min={MIN_DOB}
                max={TODAY}
                value={values.dob}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) {
                    const yr = Number(v.slice(0, 4));
                    if (!Number.isFinite(yr) || yr > 9999) return;
                  }
                  set("dob", v);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ret" className="text-xs">Retirement age</Label>
              <Input id="ret" data-field="retirementAge" type="number" min={18} max={100} value={values.retirementAge} onChange={(e) => set("retirementAge", num(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="life-age" className="text-xs">Life expectancy (age)</Label>
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
              {lifeInvalid && (
                <p className="text-[10px] text-destructive">Must be &gt; {values.retirementAge}</p>
              )}
            </div>
          </div>

          {/* Row 2 — Expenses + inflation + emergency */}
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="exp" className="text-xs">Current monthly expenses (₹)</Label>
              <IndianNumberInput id="exp" value={values.currentMonthlyExpenses} onChange={(n) => set("currentMonthlyExpenses", n)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Inflation rate: {(values.inflationRate * 100).toFixed(1)}%</Label>
              <Slider value={[values.inflationRate * 100]} min={2} max={12} step={0.5} onValueChange={(v) => set("inflationRate", v[0] / 100)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ef-mo" className="text-xs">Emergency fund (months of expenses)</Label>
              <Input
                id="ef-mo"
                type="number"
                value={efMonths}
                onChange={(e) => {
                  const months = num(e.target.value);
                  onChange({
                    ...values,
                    emergencyFundMonths: months,
                    emergencyFundToday: months * values.currentMonthlyExpenses,
                  });
                }}
              />
              <p className="text-[10px] text-muted-foreground">≈ ₹{(values.currentMonthlyExpenses * efMonths).toLocaleString("en-IN")} today</p>
            </div>
          </div>

          {/* Row 3 — Investments */}
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="corpus" className="text-xs">Current Retirement Corpus (₹)</Label>
              <IndianNumberInput id="corpus" value={values.currentCorpus} onChange={(n) => set("currentCorpus", n)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sip" className="text-xs">Monthly investment (₹)</Label>
              <IndianNumberInput id="sip" value={values.monthlyInvestment} onChange={(n) => set("monthlyInvestment", n)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">SIP annual step-up: {(values.sipStepUpRate * 100).toFixed(0)}%</Label>
              <Slider value={[values.sipStepUpRate * 100]} min={0} max={20} step={1} onValueChange={(v) => set("sipStepUpRate", v[0] / 100)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["alloc", "returns"]} className="space-y-4">
        <AccordionItem value="alloc" className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <AccordionTrigger className="px-6">
            <span className="flex items-center gap-3">
              <span className="size-3 rounded-full bg-bucket-accumulation" />
              Bucket setup — Accumulation &amp; Withdrawal
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-2">
              <Label className="text-xs">
                Years of expenses parked in Withdrawal bucket: {values.withdrawalYears}
              </Label>
              <Slider
                value={[Math.min(values.withdrawalYears, withdrawalMax)]}
                min={1}
                max={withdrawalMax}
                step={1}
                onValueChange={(v) => set("withdrawalYears", v[0])}
              />
              {withdrawalInvalid && (
                <p className="text-[10px] text-destructive">
                  Must be between 1 and {planYears} (your retirement horizon).
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Accumulation holds your corpus + SIPs and grows through to retirement. At retirement we move this many years of expenses (plus your emergency reserve) into the Withdrawal bucket. Each retirement year, spending comes from Withdrawal and Accumulation refills it back to target.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="returns" className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <AccordionTrigger className="px-6">Expected returns &amp; sequence risk</AccordionTrigger>
          <AccordionContent className="px-6 space-y-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Accumulation CAGR: {(values.sequenceCagr * 100).toFixed(1)}%</Label>
                <Slider
                  value={[values.sequenceCagr * 100]}
                  min={2}
                  max={18}
                  step={0.5}
                  onValueChange={(v) => onChange({ ...values, sequenceCagr: v[0] / 100, accReturn: v[0] / 100 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Withdrawal bucket return: {(values.withdrawalReturn * 100).toFixed(2)}%</Label>
                <Slider value={[values.withdrawalReturn * 100]} min={4} max={18} step={0.25} onValueChange={(v) => set("withdrawalReturn", v[0] / 100)} />
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted/20 p-4 space-y-3">
              <div>
                <div className="font-medium text-sm">Sequence-of-returns risk (always on)</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Year-to-year Accumulation returns swing between min and max while averaging the CAGR.
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Min year return: {(values.sequenceMinReturn * 100).toFixed(0)}%</Label>
                  <Slider value={[values.sequenceMinReturn * 100]} min={-50} max={5} step={1} onValueChange={(v) => set("sequenceMinReturn", v[0] / 100)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max year return: {(values.sequenceMaxReturn * 100).toFixed(0)}%</Label>
                  <Slider value={[values.sequenceMaxReturn * 100]} min={5} max={50} step={1} onValueChange={(v) => set("sequenceMaxReturn", v[0] / 100)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Monte Carlo runs: {values.monteCarloRuns.toLocaleString("en-IN")}</Label>
                  <Slider value={[values.monteCarloRuns]} min={1000} max={10000} step={500} onValueChange={(v) => set("monteCarloRuns", v[0])} />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
