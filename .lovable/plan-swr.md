# Safe Withdrawal Calculator — Redesign Plan

Mirror the polish pass we just shipped on the One/Two/Three-bucket simulators
onto the Safe Withdrawal Rate (SWR) flow so the entire calculator suite feels
consistent.

## Scope

SWR has its own page (`src/pages/SafeWithdrawalSimulator.tsx`) and its own
compare page (`src/pages/SwrCompareStrategies.tsx`). Both should adopt the
same beginner-friendly language, percentile labels, collapsed-by-default
advanced sections, and the "why strategies differ" explainer.

## Pass 1 — Terminology & UI parity (small prompts)

1. **Replace P10 / P25 / P50 / P75 / P90** in SWR results and SWR compare
   with the new plain-English labels:
   - Worst 10% expected corpus / Median expected corpus / Best 10% expected corpus
   - Worst 10% depletion age / Median depletion age / Best 10% depletion age
   - Drop P25 and P75 columns/cards entirely.
2. **Rename "Monte Carlo"** in user-facing copy to "simulated futures"
   wherever it appears in SWR. Keep a one-line footnote: *"Monte Carlo
   simulation is used across N runs."*
3. **Center-align the Beta banner** (already done globally via BetaBanner).
   Just confirm SWR uses the shared component.
4. **Collapse the per-run table** in SWR results by default (re-uses
   `MonteCarloPanel`, so already inherited — verify).
5. **Add `<StrategyDifferenceNote />`** above results on the SWR page and on
   the SWR Compare page to explain the safer-bucket trade-off in plain
   English.

## Pass 2 — SWR-specific defaults & inputs

1. **Default withdrawal rate**: prefill a sensible India-context rate
   (e.g. 3.5% — to be confirmed with Nikhil) instead of relying on raw
   corpus / expense ratio.
2. **Default years in withdrawal bucket** = 3 (match other calculators).
3. **Default prep return** = 7%, **default withdrawal return** = 5.5%.
4. **Remove unused fields** the way we did on the bucket simulators:
   `prepEquityPct`, `accEquityPct`, and any field the active strategy
   ignores. Re-use `AssumptionAuditPanel` to surface which inputs are used
   vs ignored.
5. **Validation**: ensure `currentCorpus`, `currentMonthlyExpenses`,
   `lifeExpectancyAge >= retirementAge`, and bucket years stay within
   `lifeExpectancyAge - retirementAge`.

## Pass 3 — Same-sequence comparison on SWR Compare

Add the **"Advanced: same-sequence year-by-year comparison"** card to
`SwrCompareStrategies.tsx` (mirror the one we just added to
`CompareStrategies.tsx`). All three strategies share `sequenceSeed` so the
three runners produce the same yearly return path — collapse by default.

## Pass 4 — Outcome storytelling

1. **Plain-English headline** above the Monte Carlo card:
   *"In X% of simulated futures, ₹{corpus} lasted to age {planAge} at a
   {withdrawal-rate}% withdrawal rate."*
2. **Max safe withdrawal solver** (mirrors the SIP solver): given a target
   confidence, find the highest monthly withdrawal the corpus supports.
3. **Inflation-adjusted vs nominal toggle** on the year-by-year table
   (optional, defer if heavy).

## Pass 5 — Exports & docs

1. Drop P25/P75 columns from `retirement-xlsx.ts` and `retirement-pdf.ts`
   for SWR exports; rename headers to match the new labels.
2. Update `HowToUse` and `Methodology` SWR sections to:
   - explain SWR vs accumulation-phase calculators in one paragraph,
   - call out the same-sequence comparison feature,
   - keep terminology consistent with the bucket pages.

## Files likely to touch

- `src/pages/SafeWithdrawalSimulator.tsx`
- `src/pages/SwrCompareStrategies.tsx`
- `src/components/retirement/MonteCarloPanel.tsx` (already updated — verify
  SWR doesn't override labels)
- `src/components/retirement/HowToUse.tsx`
- `src/components/retirement/Methodology.tsx`
- `src/lib/retirement-pdf.ts`, `src/lib/retirement-xlsx.ts`
- New: SWR-specific solver helper if Pass 4.2 is in scope.

## Suggested prompt sequence (one prompt per pass)

1. "Apply the new percentile labels and collapsed per-run table to the SWR
   pages."
2. "Set SWR defaults: 3.5% WR, 3 years withdrawal, 7% prep, 5.5% withdrawal
   return; remove unused fields."
3. "Add the same-sequence year-by-year comparison card to SWR Compare."
4. "Add the plain-English SWR headline and a max-safe-withdrawal solver."
5. "Clean up SWR exports and docs to match the new labels."

## Out of scope

- Any change to the underlying CAGR / random-returns / Monte Carlo math.
- Multi-currency or tax-bracket modelling.