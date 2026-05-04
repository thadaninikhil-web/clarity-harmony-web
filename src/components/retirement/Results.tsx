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
import {
  buildYearBullets,
  formatDisplayDate,
  formatINR,
  formatINRExact,
  type ProjectionResult,
  type RetirementInputs,
} from "@/lib/retirement";
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const displayName = mounted ? name : "";

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
    <div className="mt-2 flex items-start gap-2 rounded-md border border-accent/40 bg-accent/10 p-3 text-xs text-foreground">
      <Info className="size-4 shrink-0 text-accent mt-0.5" />
      <div>
        Showing <span className="font-semibold">1 of {inputs.monteCarloRuns.toLocaleString("en-IN")}</span>{" "}
        Monte Carlo scenarios. The Monte Carlo tab summarises all of them.
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-full">
      {/* Top action bar — exports always visible */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">
            {displayName ? `${displayName}'s ` : ""}
            {isTwoBucket ? "Two-bucket" : "Three-bucket"} projection
          </h2>
          <p className="text-xs text-muted-foreground">
            Sequence-of-returns Monte Carlo · {inputs.monteCarloRuns.toLocaleString("en-IN")} runs
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportRetirementXLSX(inputs, result, { strategy })}
            className="gap-2"
          >
            <FileSpreadsheet className="size-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportRetirementPDF(inputs, result, { showCalculation: showDetails, strategy })}
            className="gap-2"
          >
            <Download className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* INPUT SUMMARY */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Input summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <SummaryRow label="Date of birth" value={formatDisplayDate(inputs.dob)} />
            <SummaryRow label="Current monthly expenses" value={formatINR(inputs.currentMonthlyExpenses)} />
            <SummaryRow label="Inflation" value={`${(inputs.inflationRate * 100).toFixed(1)}%`} />
            <SummaryRow label="Current corpus" value={formatINR(inputs.currentCorpus)} />
            <SummaryRow label="Monthly SIP" value={formatINR(inputs.monthlyInvestment)} />
            <SummaryRow label="SIP step-up" value={`${(inputs.sipStepUpRate * 100).toFixed(0)}%`} />
            <SummaryRow label="Retirement age" value={String(inputs.retirementAge)} />
            <SummaryRow label="Life expectancy" value={String(inputs.lifeExpectancyAge ?? inputs.retirementAge + inputs.lifeExpectancyYears)} />
            <SummaryRow label="Emergency fund" value={`${inputs.emergencyFundMonths ?? 0} mo`} />
            <SummaryRow label="Target equity CAGR" value={`${(inputs.sequenceCagr * 100).toFixed(1)}%`} />
            <SummaryRow label="Current run CAGR" value={`${(currentRunCagr * 100).toFixed(2)}%`} />
            <SummaryRow label="Return range" value={`${(inputs.sequenceMinReturn * 100).toFixed(0)}% to ${(inputs.sequenceMaxReturn * 100).toFixed(0)}%`} />
            {!isTwoBucket && (
              <>
                <SummaryRow label="Prep equity" value={`${(inputs.prepEquityPct * 100).toFixed(0)}%`} />
                <SummaryRow label="Withdrawal years" value={String(inputs.withdrawalYears)} />
              </>
            )}
            <SummaryRow label="Monte Carlo runs" value={inputs.monteCarloRuns.toLocaleString("en-IN")} />
          </div>
        </CardContent>
      </Card>

      {/* CAGR explanation */}
      <Card className="shadow-[var(--shadow-card)] border-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="size-4 text-accent" />
            How CAGR is computed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>
            Each Monte Carlo path varies yearly equity returns between{" "}
            <span className="font-mono text-foreground">{(inputs.sequenceMinReturn * 100).toFixed(0)}%</span>{" "}
            and{" "}
            <span className="font-mono text-foreground">{(inputs.sequenceMaxReturn * 100).toFixed(0)}%</span>.
            The path is generated in log-return space so the realised{" "}
            <em>geometric mean</em> of this run matches your target CAGR of{" "}
            <span className="font-mono text-foreground">{(inputs.sequenceCagr * 100).toFixed(1)}%</span>.
          </p>
          <p>
            Current run CAGR: <span className="font-mono text-foreground">{(currentRunCagr * 100).toFixed(2)}%</span>
            {` · difference ${(cagrDelta * 100).toFixed(3)} pp`}.
          </p>
          <p className="font-mono text-foreground">
            CAGR = (∏ (1 + rₜ))<sup>1/N</sup> − 1
          </p>
          <p>
            Where <span className="font-mono">rₜ</span> is the year-t return and{" "}
            <span className="font-mono">N</span> is the number of years. This avoids
            the “volatility drag” that would otherwise pull the realised return below
            the simple average of the bad-year and good-year inputs.
          </p>
        </CardContent>
      </Card>

      {/* MONTE CARLO */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Monte Carlo aggregate results</CardTitle>
          <p className="text-sm text-muted-foreground">
            Summary across all{" "}
            <span className="font-semibold">{inputs.monteCarloRuns.toLocaleString("en-IN")}</span>{" "}
            sequence-of-returns scenarios.
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

      {/* SCENARIO HEADLINE — Chart + Year-by-year together (one of N) */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Years to retirement
                </CardTitle>
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
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Monthly expense at retirement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{formatINR(result.monthlyExpenseAtRetirement)}</div>
                <div className="text-xs text-muted-foreground">inflation-adjusted</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Corpus over time — single scenario</CardTitle>
              {scenarioBanner}
            </CardHeader>
            <CardContent>
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
                    <Area yAxisId="left" type="monotone" dataKey="Accumulation" stackId="1" stroke="var(--color-bucket-accumulation)" fill="url(#g1)" />
                    {!isTwoBucket && (
                      <Area yAxisId="left" type="monotone" dataKey="Preparation" stackId="1" stroke="var(--color-bucket-preparation)" fill="url(#g2)" />
                    )}
                    <Area yAxisId="left" type="monotone" dataKey="Withdrawal" stackId="1" stroke="var(--color-bucket-withdrawal)" fill="url(#g3)" />
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
            </CardContent>
          </Card>

          {result.emergencyUsedTotal > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs">
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

        {/* YEAR-BY-YEAR */}
        <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Year-by-year</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch id="show-detail" checked={showDetails} onCheckedChange={setShowDetails} />
                  <Label htmlFor="show-detail" className="text-xs">
                    Detailed view (per-bucket Start → Add → Returns → Closing)
                  </Label>
                </div>
              </div>
              {scenarioBanner}
            </CardHeader>
            <CardContent>
              <div className="relative h-[480px] w-full overflow-auto rounded-md border">
                <table className="caption-bottom text-sm border-collapse">
                  {showDetails ? (
                    <DetailedHead isTwoBucket={isTwoBucket} stickyColHead={stickyColHead} />
                  ) : (
                    <SimpleHead stickyColHead={stickyColHead} isTwoBucket={isTwoBucket} />
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
                              {!isTwoBucket && (
                                <td className="p-2 align-middle text-right tabular-nums bg-bucket-preparation/5">{formatINR(r.preparation)}</td>
                              )}
                              <td className="p-2 align-middle text-right tabular-nums bg-bucket-withdrawal/5">{formatINR(r.withdrawal)}</td>
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
                              {!isTwoBucket && (
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
                              {!isTwoBucket && (
                                <td className="p-2 align-middle text-right tabular-nums bg-bucket-withdrawal/5">
                                  {r.emergencyReserve ? formatINR(r.emergencyReserve) : "—"}
                                  {r.emergencyUsed > 0 && (
                                    <span className="block text-[10px] text-destructive">used {formatINR(r.emergencyUsed)}</span>
                                  )}
                                </td>
                              )}
                              <td className="p-2 align-middle text-right tabular-nums font-medium bg-bucket-withdrawal/5">{formatINR(r.withdrawal)}</td>
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
              <p className="mt-2 text-xs text-muted-foreground">
                All values shown using lakh/crore formatting. The Excel export uses full rupee precision and
                reconciles exactly to these on-screen values.{" "}
                Hover any total: see <span className="font-medium text-foreground">{formatINRExact(result.finalCorpus)}</span>{" "}
                as the precise final corpus.
              </p>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/40 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  );
}

function SimpleHead({ stickyColHead, isTwoBucket }: { stickyColHead: string; isTwoBucket: boolean }) {
  return (
    <thead className="sticky top-0 z-30 bg-card shadow-[0_1px_0_0_var(--border)] [&_th]:bg-card">
      <tr className="border-b">
        <th className={`${stickyColHead} h-10 px-2 text-left align-middle font-medium text-muted-foreground`}>Year</th>
        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Age</th>
        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Phase</th>
        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Total corpus</th>
        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Expense</th>
        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Withdrawn</th>
        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground bg-bucket-accumulation/5">Accumulation</th>
        {!isTwoBucket && (
          <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground bg-bucket-preparation/5">Preparation</th>
        )}
        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground bg-bucket-withdrawal/5">{isTwoBucket ? "Debt sleeve" : "Withdrawal"}</th>
        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground min-w-[260px]">What happened</th>
      </tr>
    </thead>
  );
}

function DetailedHead({ isTwoBucket, stickyColHead }: { isTwoBucket: boolean; stickyColHead: string }) {
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
          Accumulation
        </th>
        {!isTwoBucket && (
          <th colSpan={prepCols} className="h-9 px-2 text-left align-middle text-xs font-semibold bg-bucket-preparation/15 text-foreground">
            Preparation
          </th>
        )}
        <th colSpan={withdCols} className="h-9 px-2 text-left align-middle text-xs font-semibold bg-bucket-withdrawal/15 text-foreground">
          {isTwoBucket ? "Debt sleeve" : "Withdrawal"}
        </th>
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
        {!isTwoBucket && (
          <>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Start</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Acc → Prep</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Ret %</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Growth</th>
            <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-preparation/5">Closing</th>
          </>
        )}
        {/* Withd / Debt */}
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Start</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">{isTwoBucket ? "Eq → Debt" : "Inflow"}</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Ret %</th>
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Growth</th>
        {!isTwoBucket && (
          <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Emergency</th>
        )}
        <th className="h-9 px-2 text-right align-middle text-[11px] font-medium text-muted-foreground bg-bucket-withdrawal/5">Closing</th>
      </tr>
    </thead>
  );
}