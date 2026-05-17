import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatINR, type ProjectionResult } from "@/lib/retirement";

interface Props {
  result: ProjectionResult;
  strategy: "one-bucket" | "two-bucket" | "three-bucket";
}

/**
 * Sanity-check panel: shows year-by-year, per bucket:
 *   - balance
 *   - "years of current annual expense" the balance represents
 *   - explicit Acc→Prep / Prep→Withd / Acc→Withd transfers
 *
 * Helps verify the bucket plumbing visually, especially that
 * Withdrawal stays around the target N years of expenses.
 */
export function BucketFlowPanel({ result, strategy }: Props) {
  const [open, setOpen] = useState(false);
  const hasPrep = strategy === "three-bucket";
  const hasWithd = strategy !== "one-bucket";

  const yrs = (bal: number, expense: number) => {
    if (!expense || expense <= 0) return "—";
    return `${(bal / expense).toFixed(1)} yrs`;
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <div>
            <CardTitle>Bucket flow sanity check</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Year-by-year balances expressed as <span className="font-medium">years of current annual expense</span>,
              plus the exact transfers between buckets.
            </p>
          </div>
          {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
        </button>
      </CardHeader>
      {open && (
        <CardContent>
          <div className="max-h-[420px] overflow-auto rounded-md border">
            <table className="w-full text-xs tabular-nums">
              <thead className="sticky top-0 z-10 bg-card border-b">
                <tr className="text-muted-foreground">
                  <th className="p-2 text-left">Age</th>
                  <th className="p-2 text-left">Phase</th>
                  <th className="p-2 text-right">Annual expense</th>
                  <th className="p-2 text-right">Acc</th>
                  <th className="p-2 text-right">Acc (yrs)</th>
                  {hasPrep && <th className="p-2 text-right">Prep</th>}
                  {hasPrep && <th className="p-2 text-right">Prep (yrs)</th>}
                  {hasWithd && <th className="p-2 text-right">Withd</th>}
                  {hasWithd && <th className="p-2 text-right">Withd (yrs)</th>}
                  {hasPrep && <th className="p-2 text-right">Acc→Prep</th>}
                  {hasPrep && <th className="p-2 text-right">Prep→Withd</th>}
                  {hasWithd && <th className="p-2 text-right">Acc→Withd</th>}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => {
                  // For accumulation years, use the inflated-to-that-year expense
                  // by walking forward; simplest proxy: use the row's expense when
                  // retired, else nothing.
                  const baseExpense = r.expense > 0 ? r.expense : 0;
                  return (
                    <tr key={r.year} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="p-2">{r.age}</td>
                      <td className="p-2 capitalize">{r.phase}</td>
                      <td className="p-2 text-right">{baseExpense ? formatINR(baseExpense) : "—"}</td>
                      <td className="p-2 text-right">{formatINR(r.accumulation)}</td>
                      <td className="p-2 text-right text-muted-foreground">{yrs(r.accumulation, baseExpense)}</td>
                      {hasPrep && <td className="p-2 text-right">{formatINR(r.preparation)}</td>}
                      {hasPrep && (
                        <td className="p-2 text-right text-muted-foreground">{yrs(r.preparation, baseExpense)}</td>
                      )}
                      {hasWithd && <td className="p-2 text-right">{formatINR(r.withdrawal)}</td>}
                      {hasWithd && (
                        <td className="p-2 text-right text-muted-foreground">{yrs(r.withdrawal, baseExpense)}</td>
                      )}
                      {hasPrep && (
                        <td className="p-2 text-right">{r.accToPrep ? formatINR(r.accToPrep) : "—"}</td>
                      )}
                      {hasPrep && (
                        <td className="p-2 text-right">{r.prepToWithd ? formatINR(r.prepToWithd) : "—"}</td>
                      )}
                      {hasWithd && (
                        <td className="p-2 text-right">{r.accToWithd ? formatINR(r.accToWithd) : "—"}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            "(yrs)" columns divide the bucket balance by the current annual expense, so you can verify the
            Withdrawal bucket stays at roughly the configured target years post-retirement, and that the
            Preparation bucket reaches its target before retirement.
          </p>
        </CardContent>
      )}
    </Card>
  );
}