import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
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
  const efMonths =
    values.emergencyFundMonths ??
    Math.round((values.emergencyFundToday ?? 0) / Math.max(1, values.currentMonthlyExpenses));

  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h2 className="label-caps text-xs">Inputs</h2>
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      <section className="space-y-3">
        <h3 className="label-caps text-[10px]">About you</h3>
        <div className="grid gap-3 grid-cols-2">
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
              <Label htmlFor="life-age" className="text-xs">Plan until age</Label>
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
      </section>

      <section className="space-y-3">
        <h3 className="label-caps text-[10px]">Cash flow &amp; reserves</h3>
        <div className="grid gap-3 grid-cols-1">
            <div className="space-y-1.5">
              <Label htmlFor="exp" className="text-xs">Monthly expenses today (₹)</Label>
              <IndianNumberInput id="exp" value={values.currentMonthlyExpenses} onChange={(n) => set("currentMonthlyExpenses", n)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex justify-between"><span>Inflation</span><span className="tabular-nums">{(values.inflationRate * 100).toFixed(1)}%</span></Label>
              <Slider value={[values.inflationRate * 100]} min={2} max={12} step={0.5} onValueChange={(v) => set("inflationRate", v[0] / 100)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ef-mo" className="text-xs">Emergency reserve (months of expenses)</Label>
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
              <p className="text-[10px] text-muted-foreground tabular-nums">≈ ₹{(values.currentMonthlyExpenses * efMonths).toLocaleString("en-IN")} today</p>
            </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="label-caps text-[10px]">Savings &amp; investments</h3>
        <div className="grid gap-3 grid-cols-1">
            <div className="space-y-1.5">
              <Label htmlFor="corpus" className="text-xs">Savings already built (₹)</Label>
              <IndianNumberInput id="corpus" value={values.currentCorpus} onChange={(n) => set("currentCorpus", n)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sip" className="text-xs">Monthly SIP (₹)</Label>
              <IndianNumberInput id="sip" value={values.monthlyInvestment} onChange={(n) => set("monthlyInvestment", n)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex justify-between"><span>Annual SIP step-up</span><span className="tabular-nums">{(values.sipStepUpRate * 100).toFixed(0)}%</span></Label>
              <Slider value={[values.sipStepUpRate * 100]} min={0} max={20} step={1} onValueChange={(v) => set("sipStepUpRate", v[0] / 100)} />
            </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="label-caps text-[10px]">Growth bucket (equity)</h3>
        <div className="space-y-1.5">
          <Label className="text-xs flex justify-between"><span>Expected return (CAGR)</span><span className="tabular-nums">{(values.sequenceCagr * 100).toFixed(1)}%</span></Label>
          <Slider
            value={[values.sequenceCagr * 100]}
            min={2}
            max={18}
            step={0.5}
            onValueChange={(v) => onChange({ ...values, sequenceCagr: v[0] / 100, accReturn: v[0] / 100 })}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="label-caps text-[10px]">Preparation bucket</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between"><span>Expected return</span><span className="tabular-nums">{(values.prepReturn * 100).toFixed(1)}%</span></Label>
            <Slider value={[values.prepReturn * 100]} min={4} max={18} step={0.5} onValueChange={(v) => set("prepReturn", v[0] / 100)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between"><span>Glide-down starts before retirement</span><span className="tabular-nums">{values.prepYearsBeforeRetirement} yrs</span></Label>
            <Slider value={[values.prepYearsBeforeRetirement]} min={0} max={8} step={1} onValueChange={(v) => set("prepYearsBeforeRetirement", v[0])} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="label-caps text-[10px]">Withdrawal bucket (debt)</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between"><span>Years of expenses parked</span><span className="tabular-nums">{values.withdrawalYears}</span></Label>
            <Slider value={[values.withdrawalYears]} min={0} max={8} step={1} onValueChange={(v) => set("withdrawalYears", v[0])} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between"><span>Expected return</span><span className="tabular-nums">{(values.withdrawalReturn * 100).toFixed(2)}%</span></Label>
            <Slider value={[values.withdrawalReturn * 100]} min={4} max={18} step={0.25} onValueChange={(v) => set("withdrawalReturn", v[0] / 100)} />
          </div>
        </div>
      </section>

      <details className="border-t border-border pt-3">
        <summary className="label-caps text-[10px] cursor-pointer text-muted-foreground hover:text-foreground">Advanced · sequence of returns</summary>
        <div className="mt-3 grid gap-3 grid-cols-1">
          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between"><span>Bad-year return</span><span className="tabular-nums">{(values.sequenceMinReturn * 100).toFixed(0)}%</span></Label>
            <Slider value={[values.sequenceMinReturn * 100]} min={-50} max={5} step={1} onValueChange={(v) => set("sequenceMinReturn", v[0] / 100)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between"><span>Good-year return</span><span className="tabular-nums">{(values.sequenceMaxReturn * 100).toFixed(0)}%</span></Label>
            <Slider value={[values.sequenceMaxReturn * 100]} min={5} max={50} step={1} onValueChange={(v) => set("sequenceMaxReturn", v[0] / 100)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex justify-between"><span>Simulated futures</span><span className="tabular-nums">{values.monteCarloRuns.toLocaleString("en-IN")}</span></Label>
            <Slider value={[values.monteCarloRuns]} min={1000} max={10000} step={500} onValueChange={(v) => set("monteCarloRuns", v[0])} />
          </div>
        </div>
      </details>
    </div>
  );
}
