import { Info } from "lucide-react";

/**
 * Plain-English explainer shown on every calculator (One/Two/Three bucket
 * and Compare) so users understand why the confidence percentage drops as
 * you add more "safety" buckets.
 */
export function StrategyDifferenceNote() {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-4 text-sm leading-relaxed">
      <div className="flex items-start gap-2">
        <Info className="size-4 shrink-0 mt-0.5 text-accent" />
        <div className="space-y-2">
          <div className="font-medium text-foreground">
            Why do the percentages differ across One-, Two- and Three-bucket?
          </div>
          <p className="text-muted-foreground">
            Each extra bucket parks a few years of expenses in
            <span className="font-medium text-foreground"> safer assets</span>
            {" "}(debt / liquid funds) that earn{" "}
            <span className="font-medium text-foreground">lower returns</span>
            {" "}than equity. So a Three-bucket plan trades a little long-term
            growth for a much steadier income in bad market years — which
            usually shows up as a slightly lower or similar headline confidence
            number, but with a later shortfall age in the worst cases.
          </p>
          <p className="text-muted-foreground">
            In short: equity is volatile but rewarding; moving money to safer
            buckets cushions sequence-of-returns risk at the cost of some
            upside. Over-engineering with too many buckets rarely helps — the
            volatility of equity doesn&apos;t justify it.
          </p>
        </div>
      </div>
    </div>
  );
}
