import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Shuffle, FileSpreadsheet, Info, AlertTriangle } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { formatINR, type ProjectionResult, type RetirementInputs } from "@/lib/retirement";
import { exportRetirementPDF } from "@/lib/retirement-pdf";
import { exportRetirementXLSX } from "@/lib/retirement-xlsx";
import { MonteCarloPanel } from "@/components/retirement/MonteCarloPanel";

interface Props {
  result: ProjectionResult;
  name: string;
  inputs: RetirementInputs;
  strategy?: "three-bucket" | "two-bucket";
  onReshuffleSequence?: () => void;
  onSipSolved?: (sip: number) => void;
}

// Replace NaN/undefined with 0 — Recharts can break axis ticks if a series
// value is non-finite. Using 0 keeps the chart shape honest.
const safeNum = (n: unknown): number => {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
};

export function Results({
  result,
  name,
  inputs,
  strategy = "three-bucket",
  onReshuffleSequence,
  onSipSolved,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const isTwoBucket = strategy === "two-bucket";

  // Defer name-prefixed strings until after mount to avoid SSR/CSR hydration
  // mismatch (name comes from localStorage which is client-only).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const displayName = mounted ? name : "";

  // Guarded chart series — never let NaN/undefined leak into Recharts.
  const data = useMemo(
    () =>
      result.rows.map((r, i) => ({
        age: safeNum(r.age),
        Accumulation: Math.round(safeNum(r.accumulation)),
        ...(isTwoBucket ? {} : { Preparation: Math.round(safeNum(r.preparation)) }),
        Withdrawal: Math.round(safeNum(r.withdrawal)),
        AccReturnPct: i === 0 ? null : Number((safeNum(r.accReturnApplied) * 100).toFixed(2)),
      })),
    [result.rows, isTwoBucket],
  );

  // Right axis is pinned to user range (so reshuffles are comparable). Left
  // axis is left to Recharts (auto) — passing an explicit range here was the
  // bug that broke tick rendering.
  const rightDomain: [number, number] = [
    Math.floor(safeNum(inputs.sequenceMinReturn) * 100),
    Math.ceil(safeNum(inputs.sequenceMaxReturn) * 100),
  ];

  // Realised CAGR audit — geometric mean of (1+r) over the years where a
  // return was actually applied (i.e. excluding the seed row).
  const realisedCagr = useMemo(() => {
    const rs = result.rows.slice(1).map((r) => 1 + safeNum(r.accReturnApplied));
    if (rs.length === 0) return 0;
    const product = rs.reduce((a, b) => a * b, 1);
    return Math.pow(product, 1 / rs.length) - 1;
  }, [result.rows]);

  // Identify retirement years where the emergency reserve was actually tapped
  // — these get an amber visual warning treatment in the table.
  const tappedYears = useMemo(
    () => new Set(result.rows.filter((r) => safeNum(r.emergencyUsed) > 0).map((r) => r.year)),
    [result.rows],
  );
  // Identify retirement years where regular funds ran short — i.e. the
  // requested expense was NOT fully met (withdrawn < expense, after all
  // sources including the emergency reserve). These get a stronger
  // "no funds available" visual treatment, distinct from emergency-tap rows.
  const shortfallYears = useMemo(
    () =>
      new Set(
        result.rows
          .filter(
            (r) =>
              r.phase === "retirement" &&
              safeNum(r.expense) > 0 &&
              safeNum(r.withdrawn) + 1 < safeNum(r.expense),
          )
          .map((r) => r.year),
      ),
    [result.rows],
  );

  const stickyCol = "sticky left-0 z-20 bg-card shadow-[1px_0_0_0_var(--border)]";
  const stickyColHead = "sticky left-0 z-30 bg-card shadow-[1px_0_0_0_var(--border)]";

  return (
    <div className="space-y-4">
      {/* 1. Basic data — summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Years to retirement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{result.yearsToRetirement}</div>
            <div className="text-xs text-muted-foreground">
              Current age {result.ageAtStart}
              {inputs.lifeExpectancyAge ? ` · plan to ${inputs.lifeExpectancyAge}` : ""}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Monthly expense at retirement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatINR(result.monthlyExpenseAtRetirement)}</div>
            <div className="text-xs text-muted-foreground">inflation-adjusted</div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Monte Carlo aggregate results (incl. solver inside the panel) */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Monte Carlo aggregate results</CardTitle>
          <p className="text-sm text-muted-foreground">
            The numbers below summarise <span className="font-semibold">all {inputs.monteCarloRuns.toLocaleString("en-IN")}</span>{" "}
            sequence-of-returns scenarios — not just the one shown in the chart and table further below.
          </p>
        </CardHeader>
        <CardContent>
          <MonteCarloPanel
            inputs={inputs}
            result={result}
            strategy={strategy}
            onReshuffle={onReshuffleSequence}
            onSipSolved={onSipSolved}
          />
        </CardContent>
      </Card>

      {/* 3. Chart — one of N sample paths */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{displayName ? `${displayName}'s ` : ""}{isTwoBucket ? "Two-bucket" : "Three-bucket"} projection</CardTitle>
            {onReshuffleSequence && (
              <Button variant="outline" size="sm" onClick={onReshuffleSequence} className="gap-2">
                <Shuffle className="size-4" />
                Reshuffle sequence
              </Button>
            )}
          </div>
          <div className="mt-2 flex items-start gap-2 rounded-md border border-accent/40 bg-accent/10 p-3 text-xs text-foreground">
            <Info className="size-4 shrink-0 text-accent mt-0.5" />
            <div>
              The chart below is <span className="font-semibold">just one</span> of{" "}
              <span className="font-semibold">{inputs.monteCarloRuns.toLocaleString("en-IN")}</span>{" "}
              possible return-sequence paths. To see how a different ordering of
              returns affects your corpus, click{" "}
              <span className="font-semibold">Reshuffle sequence</span>.
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[380px] w-full">
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--bucket-accumulation)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--bucket-accumulation)" stopOpacity={0.15} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--bucket-preparation)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--bucket-preparation)" stopOpacity={0.15} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--bucket-withdrawal)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--bucket-withdrawal)" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="age" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(v) => formatINR(safeNum(v))}
                  width={80}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                  width={48}
                  domain={rightDomain}
                />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 4 }}
                  formatter={(v, n) =>
                    n === "Acc return %" ? `${Number(v).toFixed(2)}%` : formatINR(Number(v))
                  }
                  labelFormatter={(l) => `Age ${l}`}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="Accumulation" stackId="1" stroke="var(--bucket-accumulation)" fill="url(#g1)" />
                {!isTwoBucket && <Area yAxisId="left" type="monotone" dataKey="Preparation" stackId="1" stroke="var(--bucket-preparation)" fill="url(#g2)" />}
                <Area yAxisId="left" type="monotone" dataKey="Withdrawal" stackId="1" stroke="var(--bucket-withdrawal)" fill="url(#g3)" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="AccReturnPct"
                  name="Acc return %"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 4. Year-by-year table */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Year-by-year</CardTitle>
            <div className="mt-2 flex items-start gap-2 rounded-md border border-accent/40 bg-accent/10 p-3 text-xs text-foreground">
              <Info className="size-4 shrink-0 text-accent mt-0.5" />
              <div>
                This table reflects the <span className="font-semibold">same single scenario</span> as the chart
                — one of {inputs.monteCarloRuns.toLocaleString("en-IN")} runs.
              </div>
            </div>
            {result.emergencyUsedTotal > 0 && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs">
                <AlertTriangle className="size-4 shrink-0 text-destructive mt-0.5" />
                <div>
                  <div className="font-medium text-destructive">
                    Emergency reserve was tapped in this scenario
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    First used at age <span className="font-semibold text-foreground">{result.emergencyUsedFirstAge}</span>{" "}
                    (year <span className="font-semibold text-foreground">{result.emergencyUsedFirstYear}</span>).
                    Total consumed: <span className="font-semibold text-foreground">{formatINR(result.emergencyUsedTotal)}</span>.
                  </div>
                  <div className="text-muted-foreground mt-1.5 grid gap-1">
                    <div>
                      <span className="inline-block size-2 rounded-sm bg-amber-500 align-middle mr-1" />
                      <span className="font-semibold text-foreground">Amber rows</span> = regular funds short, covered from the emergency reserve.
                    </div>
                    <div>
                      <span className="inline-block size-2 rounded-sm bg-destructive align-middle mr-1" />
                      <span className="font-semibold text-foreground">Red strike-through rows</span> = no funds available; that year's expenses could not be met.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="show-detail"
                checked={showDetails}
                onCheckedChange={setShowDetails}
              />
              <Label htmlFor="show-detail" className="text-xs">Show calculation details</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportRetirementXLSX(inputs, result, { strategy })}
              className="gap-2"
            >
              <FileSpreadsheet className="size-4" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportRetirementPDF(inputs, result, { showCalculation: showDetails, strategy })}
              className="gap-2"
            >
              <Download className="size-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[480px] w-full overflow-auto rounded-md border">
            <table className="w-full caption-bottom text-sm border-collapse">
              <thead className="sticky top-0 z-30 bg-card shadow-[0_1px_0_0_var(--border)] [&_th]:bg-card">
                <tr className="border-b">
                  <th className={`${stickyColHead} h-10 px-2 text-left align-middle font-medium text-muted-foreground`}>Year</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Age</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Phase</th>
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Acc Ret</th>
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Accumulation</th>
                  {!isTwoBucket && <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Preparation</th>}
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Withdrawal</th>
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Total</th>
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Contribution</th>
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Expense</th>
                  {!isTwoBucket && <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Acc → Prep</th>}
                  {!isTwoBucket && <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Prep → Withd</th>}
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">{isTwoBucket ? "Eq → Debt" : "Acc → Withd"}</th>
                  {showDetails && (
                    <>
                      <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Acc opening</th>
                      <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Acc growth</th>
                      {!isTwoBucket && <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Prep opening</th>}
                      {!isTwoBucket && <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Prep growth</th>}
                      <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Withd opening</th>
                      <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Withd growth</th>
                      <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Withdrawn</th>
                      <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Emergency</th>
                    </>
                  )}
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground min-w-[280px]">Note</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => {
                  const isTapped = tappedYears.has(r.year);
                  const isShortfall = shortfallYears.has(r.year);
                  // Shortfall (no funds available) wins over emergency-tap
                  // styling — it's a stronger signal.
                  const rowCls = isShortfall
                    ? "border-b bg-destructive/15 hover:bg-destructive/20 border-l-4 border-l-destructive text-destructive [&_td]:line-through [&_td]:decoration-destructive/40"
                    : isTapped
                      ? "border-b bg-amber-500/10 hover:bg-amber-500/15 border-l-2 border-l-amber-500"
                      : "border-b transition-colors hover:bg-muted/50";
                  return (
                    <tr key={r.year} className={rowCls}>
                      <td className={`${stickyCol} p-2 align-middle`}>{r.year}</td>
                      <td className="p-2 align-middle">{r.age}</td>
                      <td className="p-2 align-middle">
                        <Badge variant={r.phase === "retirement" ? "secondary" : "outline"} className="text-[10px]">
                          {r.phase}
                        </Badge>
                        {isShortfall ? (
                          <Badge variant="destructive" className="ml-1 text-[10px]">no funds</Badge>
                        ) : isTapped ? (
                          <Badge className="ml-1 text-[10px] bg-amber-500 text-white hover:bg-amber-500">emergency</Badge>
                        ) : null}
                      </td>
                      <td className="p-2 align-middle text-right tabular-nums text-muted-foreground">
                        {r.year === result.rows[0].year ? "—" : `${(safeNum(r.accReturnApplied) * 100).toFixed(1)}%`}
                      </td>
                      <td className="p-2 align-middle text-right tabular-nums">{formatINR(r.accumulation)}</td>
                      {!isTwoBucket && <td className="p-2 align-middle text-right tabular-nums">{formatINR(r.preparation)}</td>}
                      <td className="p-2 align-middle text-right tabular-nums">{formatINR(r.withdrawal)}</td>
                      <td className="p-2 align-middle text-right tabular-nums font-medium">{formatINR(r.total)}</td>
                      <td className="p-2 align-middle text-right tabular-nums text-muted-foreground">
                        {r.contribution ? formatINR(r.contribution) : "—"}
                      </td>
                      <td className="p-2 align-middle text-right tabular-nums text-muted-foreground">
                        {r.expense ? formatINR(r.expense) : "—"}
                      </td>
                      {!isTwoBucket && <td className="p-2 align-middle text-right tabular-nums text-muted-foreground">
                        {r.accToPrep ? formatINR(r.accToPrep) : "—"}
                      </td>}
                      {!isTwoBucket && <td className="p-2 align-middle text-right tabular-nums text-muted-foreground">
                        {r.prepToWithd ? formatINR(r.prepToWithd) : "—"}
                      </td>}
                      <td className="p-2 align-middle text-right tabular-nums text-muted-foreground">
                        {r.accToWithd ? formatINR(r.accToWithd) : "—"}
                      </td>
                      {showDetails && (
                        <>
                          <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-muted/10">{formatINR(r.accOpening)}</td>
                          <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-muted/10">{r.accGrowth ? formatINR(r.accGrowth) : "—"}</td>
                          {!isTwoBucket && <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-muted/10">{formatINR(r.prepOpening)}</td>}
                          {!isTwoBucket && <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-muted/10">{r.prepGrowth ? formatINR(r.prepGrowth) : "—"}</td>}
                          <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-muted/10">{formatINR(r.withdOpening)}</td>
                          <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-muted/10">{r.withdGrowth ? formatINR(r.withdGrowth) : "—"}</td>
                          <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-muted/10">{r.withdrawn ? formatINR(r.withdrawn) : "—"}</td>
                          <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-muted/10">
                            {r.emergencyReserve ? formatINR(r.emergencyReserve) : "—"}
                            {r.emergencyUsed > 0 && (
                              <span className="block text-[10px] text-destructive">used {formatINR(r.emergencyUsed)}</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="p-2 align-middle text-xs text-muted-foreground">{r.note ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CAGR audit annex — proof-of-concept for sequence generator. Collapsed by default. */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">CAGR audit (annex)</CardTitle>
          <p className="text-xs text-muted-foreground">
            Proof-of-concept showing that the bias-corrected sequence generator delivers
            the requested CAGR exactly. Not part of the core results.
          </p>
        </CardHeader>
        <CardContent>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">Show formula and realised CAGR for this seed</summary>
            <div className="mt-3 space-y-3 text-muted-foreground leading-relaxed">
              <p>
                CAGR is the geometric mean of annual growth factors:
              </p>
              <pre className="rounded bg-muted p-3 text-xs overflow-x-auto">
{`CAGR = ( ∏ (1 + r_i) ) ^ (1 / N) − 1
     where r_i is the year-i return and N is the number of years`}
              </pre>
              {(() => {
                const target = safeNum(inputs.sequenceCagr);
                const tolerance = Math.max(0.0005, Math.abs(target) * 0.05); // ±5% of target, min 5 bps
                const diff = realisedCagr - target;
                const withinTol = Math.abs(diff) <= tolerance;
                return (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md border bg-muted/30 p-3">
                        <div className="label-caps text-xs">Target CAGR (input)</div>
                        <div className="text-lg font-semibold tabular-nums">{(target * 100).toFixed(2)}%</div>
                      </div>
                      <div className="rounded-md border bg-muted/30 p-3">
                        <div className="label-caps text-xs">Realised CAGR (this path)</div>
                        <div className={`text-lg font-semibold tabular-nums ${withinTol ? "text-foreground" : "text-destructive"}`}>
                          {(realisedCagr * 100).toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Δ {(diff * 100 >= 0 ? "+" : "")}{(diff * 100).toFixed(2)} pp
                        </div>
                      </div>
                      <div className="rounded-md border bg-muted/30 p-3">
                        <div className="label-caps text-xs">Years compounded</div>
                        <div className="text-lg font-semibold tabular-nums">{result.rows.length - 1}</div>
                      </div>
                    </div>
                    <div className={`rounded-md border p-3 text-xs ${withinTol ? "border-emerald-600/40 bg-emerald-500/5" : "border-destructive/40 bg-destructive/5"}`}>
                      <div className="font-medium text-foreground">
                        Tolerance: ±5% of target = ±{(tolerance * 100).toFixed(2)} pp
                        (band {((target - tolerance) * 100).toFixed(2)}% – {((target + tolerance) * 100).toFixed(2)}%)
                        {" "}— {withinTol ? "✅ within tolerance" : "⚠ outside tolerance"}
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        A small drift is expected because annual returns are{" "}
                        <span className="font-medium text-foreground">hard-clamped</span> to your
                        min ({(safeNum(inputs.sequenceMinReturn) * 100).toFixed(0)}%) and max ({(safeNum(inputs.sequenceMaxReturn) * 100).toFixed(0)}%) bounds. When many years
                        bunch up against a cap there is no headroom left to fully shift the geometric
                        mean back to the target. If the realised CAGR is consistently outside the band,
                        widen the min/max range so the generator has room to compensate.
                      </p>
                    </div>
                    <p className="text-xs">
                      The generator samples log-returns around log(1 + CAGR) with spread set by your
                      min/max, clamps each year to the bounds, then iteratively bias-corrects the
                      remaining years so the realised geometric mean lands within tolerance of the
                      target — not just on average across many runs.
                    </p>
                  </>
                );
              })()}
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
