import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { formatINR, type MonteCarloResult, type ProjectionResult, type RetirementInputs } from "@/lib/retirement";

interface Props {
  result: ProjectionResult;
  inputs: RetirementInputs;
  /** Override the MC numbers with the live aggregate from MonteCarloPanel,
   *  so the headline matches the panel below it exactly. */
  mcOverride?: MonteCarloResult;
}

function statusFor(confidence: number) {
  if (confidence >= 0.85) {
    return {
      label: "Likely on track",
      tone: "ok" as const,
      Icon: CheckCircle2,
      copy: "Most simulated futures see your money last to the age you planned for.",
    };
  }
  if (confidence >= 0.6) {
    return {
      label: "At risk",
      tone: "warn" as const,
      Icon: AlertTriangle,
      copy: "Many futures work out, but a meaningful share fall short. Consider raising SIP or trimming expenses.",
    };
  }
  return {
    label: "Unlikely to last",
    tone: "bad" as const,
    Icon: ShieldAlert,
    copy: "In most simulated futures, the corpus runs out before your planned age.",
  };
}

const toneClasses: Record<"ok" | "warn" | "bad", string> = {
  ok: "border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
  warn: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  bad: "border-rose-600/40 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200",
};

export function OutcomeCard({ result, inputs, mcOverride }: Props) {
  const mc = mcOverride ?? result.monteCarlo;
  const planAge =
    inputs.lifeExpectancyAge ?? inputs.retirementAge + inputs.lifeExpectancyYears;
  const confidence = mc?.successProbability ?? (result.depleted ? 0 : 1);
  const status = statusFor(confidence);
  const Icon = status.Icon;
  const shortfallAge = mc?.depletionAgeP10 ?? result.depletionAge;

  return (
    <Card className={`border-2 shadow-[var(--shadow-card)] ${toneClasses[status.tone]}`}>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start gap-3">
          <Icon className="size-7 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Will your money likely last?
              </h2>
              <Badge variant="outline" className="border-current text-current">
                {status.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm opacity-90">{status.copy}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-70">
              Confidence score
            </div>
            <div className="font-display text-3xl font-semibold tabular-nums">
              {Math.round(confidence * 100)}%
            </div>
            <div className="mt-1 text-xs opacity-80">
              In {Math.round(confidence * 100)}% of simulated futures, your money lasted to age {planAge}.
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide opacity-70">
              Shortfall age (poor outcome)
            </div>
            <div className="font-display text-3xl font-semibold tabular-nums">
              {shortfallAge ?? "Never"}
            </div>
            <div className="mt-1 text-xs opacity-80">
              In the worst 10% of futures, money runs out around this age.
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide opacity-70">
              Likely corpus at retirement
            </div>
            <div className="font-display text-3xl font-semibold tabular-nums">
              {formatINR(result.corpusAtRetirement)}
            </div>
            <div className="mt-1 text-xs opacity-80">
              Single-scenario estimate; the chart below shows the spread.
            </div>
          </div>
        </div>

        <div className="rounded-md border border-current/20 bg-background/40 p-3 text-xs flex items-start gap-2">
          <Info className="size-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">What to look at first:</span>{" "}
            confidence score (above) → required monthly SIP (in Monte Carlo panel) → shortfall age.
            Everything below is detail you can explore as needed.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}