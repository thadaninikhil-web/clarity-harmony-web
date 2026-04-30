import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  strategy?: "three-bucket" | "two-bucket";
}

export function Methodology({ strategy = "three-bucket" }: Props) {
  const isTwoBucket = strategy === "two-bucket";

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">How the calculator works</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          A plain-English summary of the rules the calculator uses to grow your
          money, move it between {isTwoBucket ? "sleeves" : "buckets"}, and
          decide whether your plan survives.
        </p>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="m1">
            <AccordionTrigger>
              1 · {isTwoBucket ? "Two sleeves and how they're spent" : "Three buckets and how they're spent"}
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              {isTwoBucket ? (
                <>
                  <p><strong>Equity sleeve</strong> — the growth engine. This is what swings up and down.</p>
                  <p><strong>Debt sleeve</strong> — the safer side. We spend from here first and also keep the emergency fund here.</p>
                  <p>Each year both sleeves grow at their own returns, then the portfolio is rebalanced back to your target mix.</p>
                </>
              ) : (
                <>
                  <p><strong>Accumulation</strong> — your equity-heavy growth pot. You never spend from it directly. It feeds Preparation.</p>
                  <p><strong>Preparation</strong> — a balanced buffer. <strong>Never spent directly.</strong> Its only job is to refill Withdrawal.</p>
                  <p><strong>Withdrawal</strong> — debt-only. The <strong>only</strong> place your day-to-day spending comes from. Holds <em>N</em> years of expenses plus the emergency fund.</p>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {!isTwoBucket && (
            <AccordionItem value="m2">
              <AccordionTrigger>2 · Moving money from Accumulation to Preparation</AccordionTrigger>
              <AccordionContent className="text-sm space-y-2">
                <p>
                  In the few years before you retire, we start moving some money
                  from Accumulation into Preparation so that Preparation has
                  enough on day-1 of retirement.
                </p>
                <p>
                  Each year we ask: "if I added nothing more, what would
                  Preparation be worth at retirement?" Whatever the gap is to the
                  target, we discount it back to today and move only that
                  fraction this year. This avoids over-shifting early and
                  matches the target neatly.
                </p>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="m3">
            <AccordionTrigger>3 · Spending order in retirement</AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              {isTwoBucket ? (
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Both sleeves grow at their own returns.</li>
                  <li>Spend from debt first (but don't touch the emergency reserve).</li>
                  <li>If debt isn't enough, draw from equity.</li>
                  <li>If still short, break into the emergency reserve.</li>
                  <li>Rebalance back to the target equity / debt mix.</li>
                </ol>
              ) : (
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Spend from Withdrawal (but don't touch the emergency reserve).</li>
                  <li>Refill Withdrawal from Preparation.</li>
                  <li>If still short, use the spendable part of Withdrawal again.</li>
                  <li>If still short, break into the emergency reserve.</li>
                  <li>Refill Preparation from Accumulation.</li>
                  <li>As an absolute last resort, take money straight from Accumulation.</li>
                </ol>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="m4">
            <AccordionTrigger>4 · Emergency fund</AccordionTrigger>
            <AccordionContent className="text-sm">
              You enter it as a number of months of <em>today's</em> expenses.
              We grow it with inflation up to retirement, park it inside the{" "}
              {isTwoBucket ? "debt sleeve" : "Withdrawal bucket"} on day-1 of
              retirement, and only touch it after every other source has run out.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="m5">
            <AccordionTrigger>
              5 · Sequence-of-returns risk on {isTwoBucket ? "the equity sleeve" : "Accumulation"}
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <p>
                Real markets don't return the same number each year. Two
                portfolios with the same long-term average can end up very
                differently if the bad years come early in retirement vs late.
                That's <em>sequence-of-returns risk</em>.
              </p>
              <p>
                We model it by generating a year-by-year return series for{" "}
                {isTwoBucket ? "the equity sleeve" : "Accumulation"} that swings
                between your min and max returns but is bias-corrected so the
                long-run CAGR is exactly what you set. The conservative{" "}
                {isTwoBucket ? "debt sleeve" : "Preparation and Withdrawal buckets"}{" "}
                are insulated by design and grow at their own steady returns.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="m6">
            <AccordionTrigger>6 · Monte Carlo — the confidence number</AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <p>
                One single sample of returns is just one possible future. To get
                a real sense of risk we run the same plan thousands of times
                (you can pick anywhere from 1,000 to 10,000 runs), each with a
                different random ordering of yearly returns drawn from your
                CAGR / min / max settings.
              </p>
              <p>
                In each run we step through every year, apply contributions,
                expenses, transfers, and the emergency fund, and check whether
                your money lasts till the age you want to plan to.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Survives</strong> — corpus stays positive every year. Counts as a success.</li>
                <li><strong>Depletes early</strong> — corpus hits zero before life expectancy. Counts as a failure, and we record the age at which it ran out.</li>
              </ul>
              <p>
                The headline <strong>confidence</strong> = successes ÷ runs. We
                also report the spread of where your final corpus lands: P10
                (only 10% of runs ended below this), P25, P50 (median), P75 and
                P90. A wide gap between P10 and P90 means your plan is highly
                path-dependent — the order in which good and bad years arrive
                matters a lot.
              </p>
              <p>
                Each page load starts a fresh random simulation. Use the
                <strong> Reshuffle</strong> button to re-run with a different
                set of random paths in the same session. Results are not saved
                between reloads — refresh = brand new run.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
