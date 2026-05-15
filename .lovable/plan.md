# Next-pass prompt: Rebuild Retirement Calculator math (One/Two/Three Bucket)

## Correct mental model (authoritative)

All three strategies have an **Accumulation phase with SIP** before retirement and a **Withdrawal phase** after. Differences are only in how many buckets exist and how money moves between them in retirement.

### One-Bucket
- Accumulation: single corpus. Add SIP (with annual step-up). Grow at `accReturn` (sequence-sampled).
- Retirement: withdraw the year's expense directly from the single corpus.
- Emergency reserve: months × today's expenses, inflation-indexed; tapped only if the corpus can't cover the spend.
- No buckets, no transfers.

### Two-Bucket (Accumulation + Withdrawal)
- Accumulation: SIP into Accumulation bucket only. Grow at `accReturn`.
- Preparation does **not** exist (no Prep bucket, no glide-path).
- At retirement (year 0): move `Y = withdrawalYears` × annual retirement expense from Accumulation → Withdrawal. Also seed Withdrawal with the inflated emergency reserve.
- Each retirement year:
  1. Grow Accumulation at `accReturn` (sampled), Withdrawal at `withdrawalReturn`.
  2. Spend from Withdrawal (excluding the fenced emergency reserve).
  3. Refill Withdrawal from Accumulation back up to `Y × next-year expense + emergency reserve`.
  4. If still short → tap emergency reserve.
  5. If still short → last-resort draw from Accumulation directly to spending.
- No equity/debt rebalancing. The two buckets are managed separately.

### Three-Bucket (Accumulation + Preparation + Withdrawal)
- Accumulation: SIP into Accumulation bucket. Grow at `accReturn`.
- Glide path during accumulation: starting `prepYearsBeforeRetirement` years before retirement, move money from Accumulation → Preparation each year so that at retirement Preparation holds `X = prepYearsBeforeRetirement` × retirement-year expense. Preparation grows at `prepReturn`.
- At retirement (year 0): move `Y = withdrawalYears` × retirement expense + emergency reserve from Preparation → Withdrawal (top up from Accumulation if Preparation runs short).
- Each retirement year:
  1. Grow Acc/Prep/Withd at their respective returns.
  2. Spend from Withdrawal (excluding the fenced emergency reserve).
  3. Refill Withdrawal from Preparation up to `Y × next-year expense + emergency reserve`.
  4. Refill Preparation from Accumulation up to `X × next-year expense`.
  5. If still short → tap emergency reserve.
  6. If still short → last-resort Accumulation → spending.

## Tasks for the next pass

### 1. `src/lib/retirement.ts` — rewrite `projectOneBucket` and `projectTwoBucket`; patch `project` (three-bucket)

- **Remove `normaliseStartAtRetirement`** entirely. All three strategies must run an accumulation phase using `yearsToRetirement = max(0, retirementAge - ageFromDob(dob))` and apply SIP + step-up.
- **`projectOneBucket`**:
  - Restore accumulation loop: each pre-retirement year, `acc = acc * (1 + accReturn) + monthlyInvestment * 12`, then step up the SIP.
  - Retirement loop unchanged in shape (single sleeve, spend, emergency-reserve fallback).
  - Use sampled `accReturn` from `buildSequenceReturns` exactly as today.
- **`projectTwoBucket`**: rewrite as a true two-bucket model — DELETE the rebalancing logic. Mirror the three-bucket flow but with no Preparation:
  - Accumulation phase: SIP into `acc`, grow at `accReturn`. `withd = 0` until retirement.
  - Year 0 of retirement: seed `withd = Y × annualExpense + emergencyAtRetirement`, drawn from `acc`.
  - Each retirement year: grow both, spend from `withd` (excl. reserve), refill `withd` from `acc` up to target, then emergency, then last-resort `acc` → spending.
  - `accToWithd` transfer field captures both seeding and refill amounts.
- **`project` (three-bucket)** — fix:
  - Emergency reserve inflated only from year 2 onward (currently inflated in year 1 too, double-counting).
  - Prep refill target uses **current** year's annual expense, not `nextExpense`.
  - Glide-path FV calc: compute `prepFvNoTopup` **before** applying the in-year prep growth, OR use exponent `yearsToGrow - 1`. Don't double-count the in-year growth.
- **Do NOT touch** `buildSequenceReturns`, `mulberry32`, percentile math, `attachMonteCarlo`, or the seed scheme.

### 2. Inputs flow — re-enable SIP everywhere

- `src/pages/OneBucketSimulator.tsx`: remove `monthlyInvestment` and `sipStepUpRate` from `skipQuestionIds`. Drop the `safeValues` overrides that zero SIP and force `accEquityPct = 1`. Update the page subhead to reflect "single accumulation/retirement bucket" rather than "starts at retirement day".
- `src/pages/TwoBucketSimulator.tsx`: keep skipping `prepYearsBeforeRetirement`, `prepReturn`, `prepEquityPct`. Continue asking `withdrawalYears` (Y) and `withdrawalReturn`. Drop the `prepEquityPct: 0` / rebalancing assumption — two-bucket no longer cares about an equity/debt split.
- `src/pages/RetirementSimulator.tsx` (three-bucket): asks all questions including `prepYearsBeforeRetirement` (X), `withdrawalYears` (Y), `prepReturn`, `withdrawalReturn`. ✅
- In `GuidedInputsChat.tsx` reword the `accReturn` prompt to "expected annual return on your retirement corpus / accumulation bucket" so it reads correctly across all three.

### 3. Results UI (`src/components/retirement/Results.tsx`)

- One-bucket: show single sleeve only (no Prep, no Withd columns or chart series). ✅ already correct.
- Two-bucket: show Accumulation + Withdrawal series only. Relabel chart legend to "Accumulation" + "Withdrawal" (drop the equity/debt sleeve naming once the math is rewritten).
- Three-bucket: show all three series. ✅
- Year-by-year table: ensure transfer columns (`accToPrep`, `prepToWithd`, `accToWithd`) only render when relevant to the strategy.

### 4. Compare page (`src/pages/CompareStrategies.tsx`)

- Remove dead Share-Link code: `copyShareLink`, `copied`, `linkError`, `encodeStateToHash`, `decodeStateFromHash` and their UI/effect references.
- Column order: One → Two → Three across every table. Verify input rows show SIP for all three strategies (not "—" for one-bucket).
- Strategy-specific rows:
  - "Years moved Acc → Prep (X)" — only three-bucket.
  - "Years moved into Withdrawal (Y)" — two- and three-bucket.
  - "Preparation expected return" — only three-bucket.

### 5. Tests (`src/test/retirement-audit.test.ts`)

Add deterministic unit tests (fixed seed, stress disabled or single sequence) that assert:
- One-bucket: SIP accumulation produces the expected corpus at retirement; single-sleeve withdrawal depletes correctly.
- Two-bucket: Withdrawal bucket seeded with `Y × annualExpense + emergency` at year 0; refill flows from Acc to Withd; no rebalancing.
- Three-bucket: Prep holds ≈ `X × annualExpense` at retirement after glide path; emergency reserve not inflated in year 1; refill chain Acc→Prep→Withd works.

### 6. Verify

- `bunx vitest run src/test/retirement-audit.test.ts`.
- Manually walk all three calculators end-to-end: confirm SIP question asked everywhere, charts render the right number of series, year-by-year table shows correct transfers, Compare page lines up.

## Out of scope for this pass
- Safe Withdrawal Calculator (next pass).
- CAGR / Monte Carlo / random-return generation (do not modify).
- Visual restyling beyond legend labels and removing dead Share-Link UI.
