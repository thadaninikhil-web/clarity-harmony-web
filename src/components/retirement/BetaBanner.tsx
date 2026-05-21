/**
 * Quiet, neutral notice that the calculator is in beta. No icons, no colour
 * — it should read like a footnote on a research report, not a system alert.
 */
export function BetaBanner() {
  return (
    <div className="border-b border-border bg-muted/40 text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 text-[11px] sm:text-xs text-center tracking-wide">
        <span className="uppercase font-medium text-foreground/70 mr-2">Beta</span>
        Calculator under testing. Numbers may change as the model is refined — please consult your financial advisor.
      </div>
    </div>
  );
}