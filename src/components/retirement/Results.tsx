import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Shuffle, FileSpreadsheet, AlertTriangle } from "lucide-react";
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
import {
  buildYearBullets,
  formatINR,
  formatINRExact,
  type ProjectionResult,
  type RetirementInputs,
} from "@/lib/retirement";
import { exportRetirementPDF } from "@/lib/retirement-pdf";
import { exportRetirementXLSX } from "@/lib/retirement-xlsx";
import { MonteCarloPanel } from "@/components/retirement/MonteCarloPanel";
import { BucketFlowPanel } from "@/components/retirement/BucketFlowPanel";
import { AssumptionAuditPanel } from "@/components/retirement/AssumptionAuditPanel";

interface Props {
  result: ProjectionResult;
  name: string;
  inputs: RetirementInputs;
  strategy?: "three-bucket" | "two-bucket" | "one-bucket";
  onReshuffleSequence?: () => void;
  onSipSolved?: (sip: number) => void;
  onMonteCarloRunsChange?: (runs: number) => void;
  onSelectRun?: (seed: number) => void;
}

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
  onMonteCarloRunsChange,
  onSelectRun,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const isTwoBucket = strategy === "two-bucket";
  const isOneBucket = strategy === "one-bucket";
  const hasPrep = strategy === "three-bucket";
  const hasWithd = strategy !== "one-bucket";
  const accLabel = isOneBucket ? "Retirement corpus" : "Accumulation";

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const displayName = mounted ? name : "";

  const data = useMemo(
    () =>
      result.rows.map((r, i) => ({
        age: safeNum(r.age),
        [accLabel]: Math.round(safeNum(r.accumulation)),
        ...(hasPrep ? { Preparation: Math.round(safeNum(r.preparation)) } : {}),
        ...(hasWithd ? { Withdrawal: Math.round(safeNum(r.withdrawal)) } : {}),
        AccReturnPct: i === 0 ? null : Number((safeNum(r.accReturnApplied) * 100).toFixed(2)),
      })),
    [result.rows, hasPrep, hasWithd, accLabel],
  );

  // Symmetric domain centred on 0 so the right-axis 0% line sits in the middle
  const rightDomain: [number, number] = (() => {
    const lo = Math.abs(safeNum(inputs.sequenceMinReturn) * 100);
    const hi = Math.abs(safeNum(inputs.sequenceMaxReturn) * 100);
    const m = Math.max(5, Math.ceil(Math.max(lo, hi)));
    return [-m, m];
  })();
  const rightTicks = (() => {
    const m = rightDomain[1];
    const step = m <= 10 ? 5 : m <= 30 ? 10 : 20;
    const out: number[] = [];
    for (let v = -m; v <= m + 0.0001; v += step) out.push(Math.round(v));
    return out;
  })();

  const tappedYears = useMemo(
    () => new Set(result.rows.filter((r) => safeNum(r.emergencyUsed) > 0).map((r) => r.year)),
    [result.rows],
  );
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
  const currentRunCagr = result.currentRunCagr ?? 0;
  const cagrDelta = currentRunCagr - inputs.sequenceCagr;

  const scenarioBanner = (
    <p className="mt-2 text-[11px] text-muted-foreground">
      Showing{" "}
      <span className="text-foreground tabular-nums">1 of {inputs.monteCarloRuns.toLocaleString("en-IN")}</span>{" "}
      simulated futures. The outcome panel above aggregates all of them.
    </p>
  );

  return (
    <div className="space-y-8 max-w-full">
      {/* Top action bar — exports always visible */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {displayName ? `${displayName}'s ` : ""}
            {isOneBucket ? "One-bucket" : isTwoBucket ? "Two-bucket" : "Three-bucket"} projection
          </h2>
          <p className="text-xs text-muted-foreground">
            Across <span className="tabular-nums">{inputs.monteCarloRuns.toLocaleString("en-IN")}</span> simulated futures.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportRetirementXLSX(inputs, result, { strategy })}
            className="gap-1.5 text-xs h-8"
          >
            <FileSpreadsheet className="size-3.5" />
            Excel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportRetirementPDF(inputs, result, { showCalculation: showDetails, strategy })}
            className="gap-1.5 text-xs h-8"
          >
            <Download className="size-3.5" />
            PDF
          </Button>
        </div>
      </div>

      <AssumptionAuditPanel inputs={inputs} strategy={strategy} />

      {/* OUTCOME — Monte Carlo summary */}
      <section>
        <header className="mb-3">
          <h3 className="label-caps text-xs">Outcome</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Summary across <span className="tabular-nums">{inputs.monteCarloRuns.toLocaleString("en-IN")}</span>{" "}
            simulated futures.
          </p>
        </header>
        <MonteCarloPanel
            inputs={inputs}
            result={result}
            strategy={strategy}
            onReshuffle={onReshuffleSequence}
            onSipSolved={onSipSolved}
            onMonteCarloRunsChange={onMonteCarloRunsChange}
            onSelectRun={onSelectRun}
          />
      </section>

      {/* SCENARIO HEADLINE — Chart + Year-by-year together (one of N) */}
      <section className="space-y-6">
        <div className="grid gap-0 sm:grid-cols-2 border border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="p-4">
            <div className="label-caps text-[10px]">Years to retirement</div>
            <div className="text-2xl font-display tabular-nums mt-1">{result.yearsToRetirement}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Current age {result.ageAtStart}
              {inputs.lifeExpectancyAge ? ` · plan to ${inputs.lifeExpectancyAge}` : ""}
            </div>
          </div>
          <div className="p-4">
            <div className="label-caps text-[10px]">Monthly expense at retirement</div>
            <div className="text-2xl font-display tabular-nums mt-1">{formatINR(result.monthlyExpenseAtRetirement)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">inflation-adjusted</div>
          </div>
        </div>

        <div>
          <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="label-caps text-xs">Corpus over time — single scenario</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Current run CAGR{" "}
                <span className="font-mono text-foreground tabular-nums">{(currentRunCagr * 100).toFixed(2)}%</span>
                {` · target ${(inputs.sequenceCagr * 100).toFixed(1)}%`}
              </p>
            </div>
            {onReshuffleSequence && (
              <Button variant="ghost" size="sm" onClick={onReshuffleSequence} className="gap-1.5 h-8 text-xs">
                <Shuffle className="size-3.5" />
                Reshuffle
              </Button>
            )}
          </header>
          {scenarioBanner}
          <div className="border border-border p-3 mt-2">
              <div className="h-[380px] w-full">
                <ResponsiveContainer>
                  <ComposedChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-bucket-accumulation)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-bucket-accumulation)" stopOpacity={0.15} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-bucket-preparation)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-bucket-preparation)" stopOpacity={0.15} />
                      </linearGradient>
                      <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-bucket-withdrawal)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-bucket-withdrawal)" stopOpacity={0.15} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="age" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(v) => formatINR(safeNum(v))}
                      width={80}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                      width={48}
                      domain={rightDomain}
                      ticks={rightTicks}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 4,
                      }}
                      formatter={(v, n) =>
                        n === "Acc return %" ? `${Number(v).toFixed(2)}%` : formatINR(Number(v))
                      }
                      labelFormatter={(l) => `Age ${l}`}
                    />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey={accLabel} stackId="1" stroke="var(--color-bucket-accumulation)" fill="url(#g1)" />
                    {hasPrep && (
                      <Area yAxisId="left" type="monotone" dataKey="Preparation" stackId="1" stroke="var(--color-bucket-preparation)" fill="url(#g2)" />
                    )}
                    {hasWithd && (
                      <Area yAxisId="left" type="monotone" dataKey="Withdrawal" stackId="1" stroke="var(--color-bucket-withdrawal)" fill="url(#g3)" />
                    )}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="AccReturnPct"
                      name="Acc return %"
                      stroke="var(--color-accent-raw)"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
          </div>
        </div>

          {result.emergencyUsedTotal > 0 && (
            <div className="flex items-start gap-2 border-l-2 border-destructive bg-card p-3 text-xs">
              <AlertTriangle className="size-4 shrink-0 text-destructive mt-0.5" />
              <div>
                <div className="font-medium text-destructive">Emergency reserve was tapped in this scenario</div>
                <div className="text-muted-foreground mt-0.5">
                  First used at age <span className="font-semibold text-foreground">{result.emergencyUsedFirstAge}</span>
                  . Total consumed: <span className="font-semibold text-foreground">{formatINR(result.emergencyUsedTotal)}</span>.
                </div>
              </div>
            </div>
          )}

        <details className="border border-border bg-card">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium">
            Advanced: year-by-year bucket flow diagnostics
          </summary>
          <div className="px-4 pb-4">
            <BucketFlowPanel result={result} strategy={strategy} />
          </div>
        </details>

        {/* YEAR-BY-YEAR */}
        <div>
          <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="label-caps text-xs">Year-by-year</h3>
            <div className="flex items-center gap-2">
              <Switch id="show-detail" checked={showDetails} onCheckedChange={setShowDetails} />
              <Label htmlFor="show-detail" className="text-xs text-muted-foreground">
                Detailed view (per-bucket Start → Add → Returns → Closing)
              </Label>
            </div>
          </header>
          {scenarioBanner}
          <div className="relative h-[480px] w-full overflow-auto border border-border mt-2">
                <table className="caption-bottom text-sm border-collapse">
                  {showDetails ? (
                    <DetailedHead isTwoBucket={isTwoBucket} hasPrep={hasPrep} hasWithd={hasWithd} accLabel={accLabel} stickyColHead={stickyColHead} />
                  ) : (
                    <SimpleHead stickyColHead={stickyColHead} isTwoBucket={isTwoBucket} hasPrep={hasPrep} hasWithd={hasWithd} accLabel={accLabel} />
                  )}
                  <tbody>
                    {result.rows.map((r) => {
                      const isTapped = tappedYears.has(r.year);
                      const isShortfall = shortfallYears.has(r.year);
                      const rowCls = isShortfall
                        ? "border-b bg-destructive/15 hover:bg-destructive/20 border-l-4 border-l-destructive text-destructive"
                        : isTapped
                          ? "border-b bg-amber-500/10 hover:bg-amber-500/15 border-l-2 border-l-amber-500"
                          : "border-b transition-colors hover:bg-muted/50";
                      const bullets =
                        r.notes && r.notes.length > 0
                          ? r.notes
                          : buildYearBullets(r, strategy);
                      return (
                        <tr key={r.year} className={rowCls}>
                          {/* Summary block */}
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
                          <td className="p-2 align-middle text-right tabular-nums font-medium">{formatINR(r.total)}</td>
                          <td className="p-2 align-middle text-right tabular-nums text-muted-foreground">
                            {r.expense ? formatINR(r.expense) : "—"}
                          </td>
                          <td className="p-2 align-middle text-right tabular-nums text-muted-foreground">
                            {r.withdrawn ? formatINR(r.withdrawn) : "—"}
                          </td>

                          {!showDetails && (
                            <>
                              <td className="p-2 align-middle text-right tabular-nums bg-bucket-accumulation/5">{formatINR(r.accumulation)}</td>
                              {hasPrep && (
                                <td className="p-2 align-middle text-right tabular-nums bg-bucket-preparation/5">{formatINR(r.preparation)}</td>
                              )}
                              {hasWithd && (
                                <td className="p-2 align-middle text-right tabular-nums bg-bucket-withdrawal/5">{formatINR(r.withdrawal)}</td>
                              )}
                            </>
                          )}

                          {showDetails ? (
                            <>
                              {/* Accumulation block */}
                              <td className="p-2 align-middle text-right tabular-nums bg-bucket-accumulation/5">{formatINR(r.accOpening)}</td>
                              <td className="p-2 align-middle text-right tabular-nums bg-bucket-accumulation/5">
                                {r.contribution ? formatINR(r.contribution) : "—"}
                              </td>
                              <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-bucket-accumulation/5">
                                {r.year === result.rows[0].year ? "—" : `${(safeNum(r.accReturnApplied) * 100).toFixed(1)}%`}
                              </td>
                              <td className="p-2 align-middle text-right tabular-nums bg-bucket-accumulation/5">
                                {r.accGrowth ? formatINR(r.accGrowth) : "—"}
                              </td>
                              <td className="p-2 align-middle text-right tabular-nums font-medium bg-bucket-accumulation/5">{formatINR(r.accumulation)}</td>

                              {/* Preparation block (3-bucket only) */}
                              {hasPrep && (
                                <>
                                  <td className="p-2 align-middle text-right tabular-nums bg-bucket-preparation/5">{formatINR(r.prepOpening)}</td>
                                  <td className="p-2 align-middle text-right tabular-nums bg-bucket-preparation/5">
                                    {r.accToPrep ? formatINR(r.accToPrep) : "—"}
                                  </td>
                                  <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-bucket-preparation/5">
                                    {(inputs.prepReturn * 100).toFixed(1)}%
                                  </td>
                                  <td className="p-2 align-middle text-right tabular-nums bg-bucket-preparation/5">
                                    {r.prepGrowth ? formatINR(r.prepGrowth) : "—"}
                                  </td>
                                  <td className="p-2 align-middle text-right tabular-nums font-medium bg-bucket-preparation/5">{formatINR(r.preparation)}</td>
                                </>
                              )}

                              {/* Withdrawal / Debt block */}
                              {hasWithd && (<>
                              <td className="p-2 align-middle text-right tabular-nums bg-bucket-withdrawal/5">{formatINR(r.withdOpening)}</td>
                              <td className="p-2 align-middle text-right tabular-nums bg-bucket-withdrawal/5">
                                {(isTwoBucket ? r.accToWithd : r.prepToWithd + r.accToWithd) > 0
                                  ? formatINR(isTwoBucket ? r.accToWithd : r.prepToWithd + r.accToWithd)
                                  : "—"}
                              </td>
                              <td className="p-2 align-middle text-right tabular-nums text-muted-foreground bg-bucket-withdrawal/5">
                                {(inputs.withdrawalReturn * 100).toFixed(2)}%
                              </td>
                              <td className="p-2 align-middle text-right tabular-nums bg-bucket-withdrawal/5">
                                {r.withdGrowth ? formatINR(r.withdGrowth) : "—"}
                              </td>
                              {hasPrep && (
                                <td className="p-2 align-middle text-right tabular-nums bg-bucket-withdrawal/5">
                                  {r.emergencyReserve ? formatINR(r.emergencyReserve) : "—"}
                                  {r.emergencyUsed > 0 && (
                                    <span className="block text-[10px] text-destructive">used {formatINR(r.emergencyUsed)}</span>
                                  )}
                                </td>
                              )}
                              <td className="p-2 align-middle text-right tabular-nums font-medium bg-bucket-withdrawal/5">{formatINR(r.withdrawal)}</td>
                              </>)}
                            </>
                          ) : null}

                          {/* Notes (bullets) */}
                          <td className="p-2 align-top text-xs text-muted-foreground min-w-[260px]">
                            <ul className="list-disc list-inside space-y-0.5">
                              {bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                All values shown using lakh/crore formatting. The Excel export uses full rupee precision and
                reconciles exactly to these on-screen values.{" "}
                Hover any total: see <span className="font-medium text-foreground">{formatINRExact(result.finalCorpus)}</span>{" "}
                as the precise final corpus.
              </p>
        </div>
      </section>
    </div>
  );
}

function SimpleHead({
  stickyColHead,
  isTwoBucket,
  hasPrep,
  hasWithd,
  accLabel,
}: {
  stickyColHead: string;
  isTwoBucket: boolean;
  hasPrep: boolean;
  hasWithd: boolean;
  accLabel: string;
}) {
  return (
    <thead className="sticky top-0 z-30 bg-card shadow-[0_1px_0_0_var(--border)] [&_th]:bg-card">
      <tr className="border-b">
        <th className={`${stickyColHead} h-10 px-2 text-left align-middle font-medium text-muted-foreground`}>Year</th>
        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Age</th>
        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Phase</th>
        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Total corpus</th>
        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Expense</th>
        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Withdrawn</th>
        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground bg-bucket-accumulation/5">{accLabel}</th>
        {hasPrep && (
          <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground bg-bucket-preparation/5">Preparation</th>
        )}
        {hasWithd && (
          <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground bg-bucket-withdrawal/5">Withdrawal</th>
        )}
        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground min-w-[260px]">What happened</th>
      </tr>
    </thead>
  );
}

function DetailedHead({
  isTwoBucket,
  hasPrep,
  hasWithd,
  accLabel,
  stickyColHead,
}: {
  isTwoBucket: boolean;
  hasPrep: boolean;
  hasWithd: boolean;
  accLabel: string;
  stickyColHead: string;
}) {
  const accCols = 5; // start, add, ret, growth, closing
  const prepCols = 5;
  const withdCols = isTwoBucket ? 5 : 6; // include emergency for 3-bucket
  return (
    <thead className="sticky top-0 z-30 bg-card shadow-[0_1px_0_0_var(--border)] [&_th]:bg-card">
      <tr className="border-b">
        <th colSpan={6} className={`${stickyColHead} h-9 px-2 text-left align-middle text-xs font-semibold text-foreground bg-muted/40`}>
          Summary
        </th>
        <th colSpan={accCols} className="h-9 px-2 text-left align-middle text-xs font-semibold bg-bucket-accumulation/15 text-foreground">
          {accLabel}
        </th>
        {hasPrep && (
          <th colSpan={prepCols} className="h-9 px-2 text-left align-middle text-xs font-semibold bg-bucket-preparation/15 text-foreground">
            Preparation
          </th>
        )}
        {hasWithd && (
          <th colSpan={withdCols} className="h-9 px-2 text-left align-middle text-xs font-semibold bg-bucket-withdrawal/15 text-foreground">
            Withdrawal
          </th>
        )}
        <th rowSpan={2} className="h-9 px-2 text-left align-middle font-medium text-muted-foreground min-w-[260px]">
          What happened
        </th>
      </tr>
      <tr className="border-b">
        <th className={`${stickyColHead} h-9 px-2 text-left align-middle text-[11px] font-medium text-muted-foreground`}>Year</th>
        <th className="h-9 px-2 text-left align-middle text-[11px] font-medium text-muted-foreground">Age</th>
        <th className="h-9 px-2 text-left align-middle text-[11px] font-medium text-muted-foreground">Phase</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground">Total</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground">Expense</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground">Withdrawn</th>
        {/* Acc */}
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-accumulation/5">Start</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-accumulation/5">SIP</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-accumulation/5">Ret %</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-accumulation/5">Growth</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-accumulation/5">Closing</th>
        {/* Prep */}
        {hasPrep && (
          <>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Start</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Acc → Prep</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Ret %</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Growth</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Closing</th>
          </>
        )}
        {/* Withd / Debt */}
        {hasWithd && (
          <>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Start</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">{isTwoBucket ? "Eq → Debt" : "Inflow"}</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Ret %</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Growth</th>
            {hasPrep && (
              <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Emergency</th>
            )}
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Closing</th>
          </>
        )}
      </tr>
    </thead>
  );
}