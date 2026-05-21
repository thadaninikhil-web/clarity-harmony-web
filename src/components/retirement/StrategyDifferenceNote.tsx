/**
 * Plain-text footnote explaining why confidence percentages differ across
 * One-, Two- and Three-bucket strategies. Rendered as a quiet "Notes" block
 * at the bottom of each calculator page — no icons, no tinted card.
 */
export function StrategyDifferenceNote() {
  return (
    <section aria-labelledby="notes-heading" className="border-t border-border pt-6">
      <h2
        id="notes-heading"
        className="label-caps text-xs text-muted-foreground mb-3"
      >
        Notes
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground text-justify max-w-3xl">
        <p>
          <span className="font-medium text-foreground">
            Why percentages differ across One-, Two- and Three-bucket.
          </span>{" "}
          Each additional bucket parks a few years of expenses in safer
          assets — debt or liquid funds — that earn lower returns than
          equity. A Three-bucket plan therefore trades a little long-term
          growth for steadier income in bad market years. This usually
          shows up as a similar or slightly lower headline confidence
          number, but with a later shortfall age in the worst cases.
        </p>
        <p>
          Equity is volatile but rewarding; moving money into safer
          buckets cushions sequence-of-returns risk at the cost of some
          upside. Over-engineering with too many buckets rarely helps —
          the volatility of equity does not justify it.
        </p>
      </div>
    </section>
  );
}
