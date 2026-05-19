import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RetirementInputs } from "@/lib/retirement";

interface Props {
  inputs: RetirementInputs;
  strategy: "one-bucket" | "two-bucket" | "three-bucket";
}

type Status = "used" | "ignored" | "derived";

interface Row {
  key: string;
  label: string;
  status: Status;
  note?: string;
}

function buildRows(strategy: Props["strategy"]): Row[] {
  const base: Row[] = [
    { key: "dob", label: "Date of birth", status: "used" },
    { key: "currentMonthlyExpenses", label: "Monthly expenses today", status: "used" },
    { key: "inflationRate", label: "Inflation rate", status: "used" },
    { key: "currentCorpus", label: "Savings already built", status: "used" },
    { key: "monthlyInvestment", label: "Monthly SIP", status: "used" },
    { key: "sipStepUpRate", label: "SIP annual step-up", status: "used" },
    { key: "retirementAge", label: "Retirement age", status: "used" },
    { key: "lifeExpectancyAge", label: "Plan until age", status: "used" },
    { key: "lifeExpectancyYears", label: "Years post-retirement", status: "derived", note: "Derived from retirement age & plan-until age." },
    { key: "emergencyFundMonths", label: "Emergency fund (months)", status: "used" },
    { key: "emergencyFundToday", label: "Emergency fund (₹)", status: "derived", note: "Months × monthly expenses." },
    { key: "accReturn", label: "Growth bucket return (point estimate)", status: "derived", note: "Mirrors Sequence CAGR for single-scenario chart." },
    { key: "sequenceCagr", label: "Sequence CAGR", status: "used" },
    { key: "sequenceMinReturn", label: "Bad-year return", status: "used" },
    { key: "sequenceMaxReturn", label: "Good-year return", status: "used" },
    { key: "monteCarloRuns", label: "Monte Carlo runs", status: "used" },
    { key: "sequenceSeed", label: "Sequence seed", status: "used", note: "Picks which single-scenario path is shown." },
  ];
  if (strategy === "one-bucket") {
    return [
      ...base,
      { key: "prepReturn", label: "Preparation bucket return", status: "ignored", note: "One-bucket has no Preparation bucket." },
      { key: "prepYearsBeforeRetirement", label: "Years before retirement to de-risk", status: "ignored", note: "One-bucket has no glide path." },
      { key: "withdrawalYears", label: "Years parked in Withdrawal bucket", status: "ignored", note: "One-bucket has no separate Withdrawal bucket." },
      { key: "withdrawalReturn", label: "Withdrawal bucket return", status: "ignored", note: "One-bucket has no separate Withdrawal bucket." },
      { key: "accEquityPct", label: "Equity % in Accumulation", status: "ignored", note: "Deprecated — return is used directly." },
      { key: "prepEquityPct", label: "Equity % during de-risking", status: "ignored", note: "Removed — was never used in calculation." },
    ];
  }
  if (strategy === "two-bucket") {
    return [
      ...base,
      { key: "withdrawalYears", label: "Years parked in Withdrawal bucket", status: "used" },
      { key: "withdrawalReturn", label: "Withdrawal bucket return", status: "used" },
      { key: "prepReturn", label: "Preparation bucket return", status: "ignored", note: "Two-bucket has no Preparation bucket." },
      { key: "prepYearsBeforeRetirement", label: "Years before retirement to de-risk", status: "ignored", note: "Two-bucket has no glide path — money seeds Withdrawal on day-1 of retirement." },
      { key: "accEquityPct", label: "Equity % in Accumulation", status: "ignored", note: "Deprecated — return is used directly." },
      { key: "prepEquityPct", label: "Equity % during de-risking", status: "ignored", note: "Removed — was never used in calculation." },
    ];
  }
  return [
    ...base,
    { key: "prepReturn", label: "Preparation bucket return", status: "used" },
    { key: "prepYearsBeforeRetirement", label: "Years before retirement to de-risk", status: "used" },
    { key: "withdrawalYears", label: "Years parked in Withdrawal bucket", status: "used" },
    { key: "withdrawalReturn", label: "Withdrawal bucket return", status: "used" },
    { key: "accEquityPct", label: "Equity % in Accumulation", status: "ignored", note: "Deprecated — return is used directly." },
    { key: "prepEquityPct", label: "Equity % during de-risking", status: "ignored", note: "Removed — was never used in calculation." },
  ];
}

function useAuditFlag(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () =>
      setOn(new URLSearchParams(window.location.search).get("audit") === "1");
    check();
    window.addEventListener("popstate", check);
    return () => window.removeEventListener("popstate", check);
  }, []);
  return on;
}

const toneFor = (s: Status) =>
  s === "used"
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : s === "derived"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
      : "bg-muted text-muted-foreground line-through";

/** Hidden by default. Append `?audit=1` to the URL to reveal which inputs
 *  this strategy actually consumes, which are derived, and which are ignored. */
export function AssumptionAuditPanel({ inputs, strategy }: Props) {
  const visible = useAuditFlag();
  if (!visible) return null;
  const rows = buildRows(strategy);
  const valueOf = (key: string): string => {
    const v = (inputs as Record<string, unknown>)[key];
    if (v === undefined || v === null || v === "") return "—";
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(4);
    return String(v);
  };
  const counts = rows.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {} as Record<Status, number>,
  );
  return (
    <Card className="border-dashed border-2">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">
            Assumption audit · {strategy}
          </CardTitle>
          <div className="flex gap-1.5 text-xs">
            <Badge variant="outline" className={toneFor("used")}>used {counts.used ?? 0}</Badge>
            <Badge variant="outline" className={toneFor("derived")}>derived {counts.derived ?? 0}</Badge>
            <Badge variant="outline" className={toneFor("ignored")}>ignored {counts.ignored ?? 0}</Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Debug view (URL flag <code>?audit=1</code>). Shows which inputs this strategy actually consumes.
        </p>
      </CardHeader>
      <CardContent className="overflow-auto">
        <table className="w-full text-xs tabular-nums">
          <thead className="text-muted-foreground">
            <tr className="border-b">
              <th className="p-2 text-left font-medium">Status</th>
              <th className="p-2 text-left font-medium">Field</th>
              <th className="p-2 text-left font-medium">Current value</th>
              <th className="p-2 text-left font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b last:border-0">
                <td className="p-2">
                  <Badge variant="outline" className={toneFor(r.status)}>
                    {r.status}
                  </Badge>
                </td>
                <td className="p-2 text-foreground">{r.label}</td>
                <td className="p-2 text-muted-foreground">{valueOf(r.key)}</td>
                <td className="p-2 text-muted-foreground">{r.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
