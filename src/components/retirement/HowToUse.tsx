import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  strategy?: "three-bucket" | "two-bucket" | "one-bucket";
}

export function HowToUse({ strategy = "three-bucket" }: Props) {
  const isTwoBucket = strategy === "two-bucket";
  const isOneBucket = strategy === "one-bucket";

  return (
    <Card className="shadow-[var(--shadow-card)] border-border">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">How to use this calculator</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-4 leading-relaxed">
        <p>
          <strong>What it does.</strong> It checks whether your savings, monthly
          investment and the way you split your money will be enough to fund
          your retirement — and shows you how that money should be{" "}
          {isOneBucket
            ? "grown in a single corpus and then drawn down for living expenses"
            : isTwoBucket
              ? "moved between an Accumulation bucket and a Withdrawal bucket"
              : "split across three pots of money with different risk levels"}.
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Tell us about you.</strong> Your name, date of birth, current
            monthly expenses, what you have saved so far, what you invest each
            month, the age you want to retire, and the age you want to plan up
            to (life expectancy).
          </li>
          <li>
            {isOneBucket ? (
              <>
                <strong>Set up the single bucket.</strong> Your current corpus
                plus every SIP grows in one investment sleeve at the return you
                set, all the way through retirement. Annual expenses are
                withdrawn directly from this same bucket each year.
              </>
            ) : isTwoBucket ? (
              <>
                <strong>Set up the two buckets.</strong>{" "}
                <span className="font-medium">Bucket 1 (Accumulation)</span> holds
                your current corpus and every SIP you make, growing through to
                retirement.{" "}
                <span className="font-medium">Bucket 2 (Withdrawal)</span> is the
                safer bucket you actually live off — at retirement it is seeded
                with N years of expenses plus the emergency reserve, and is
                refilled each year from Accumulation.
              </>
            ) : (
              <>
                <strong>Set up the three buckets.</strong>{" "}
                <span className="font-medium">Bucket 1 (Accumulation)</span> is
                the engine — equity-heavy, and you never spend from it directly.{" "}
                <span className="font-medium">Bucket 2 (Preparation)</span> is a
                middle buffer — its only job is to refill Bucket 3.{" "}
                <span className="font-medium">Bucket 3 (Withdrawal)</span> is the
                safe pot you actually live off in retirement.
              </>
            )}
          </li>
          <li>
            <strong>Add an emergency fund</strong> in months of today's expenses.
            We grow that with inflation and park it inside the{" "}
            {isOneBucket ? "single corpus" : "Withdrawal bucket"} so it's only
            touched as a last resort.
          </li>
          <li>
            <strong>Set the swing in returns.</strong> No real portfolio earns
            the same return every year. Pick a CAGR (the long-term average) and
            a min/max range that returns can swing between year-to-year. The
            calculator then runs thousands of random orderings of those returns
            (Monte Carlo) and tells you how often your money lasts.
          </li>
          <li>
            <strong>Read the results.</strong> Look at the Monte Carlo number
            first — that's your <em>confidence</em> the plan works across many
            possible futures. The chart and the year-by-year table show one
            example path; click <em>Reshuffle sequence</em> to see a different
            ordering. Use <em>Export PDF</em> or <em>Export Excel</em> to save
            the full plan.
          </li>
        </ol>
        <p className="text-xs text-muted-foreground">
          This is an educational tool, not investment advice. Real returns vary.
          Try different assumptions to see how sensitive your plan is.
        </p>
      </CardContent>
    </Card>
  );
}
