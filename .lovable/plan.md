# Plan

## 1. One Bucket scenario (new strategy)

**Inputs (only):** Name, DOB, Retirement Age, Plan-Until Age, Year-1 Monthly Expenses, Inflation, Retirement Corpus, Emergency Fund (months), and the sequence block (CAGR, Min, Max, Monte Carlo runs).

**Math:** Single sleeve. Each year: grow corpus at sampled return, deduct that year's inflated expenses, only break the emergency reserve (months × today's expenses, inflated) when corpus is otherwise empty. Survive = corpus > 0 at plan-until age.

**Where it shows up:**
- New tab in `StrategySwitcher` (order: One / Two / Three Bucket).
- New page `src/pages/OneBucketSimulator.tsx` at `/calculators/onebucketsimulator`.
- Same wiring as the Two/Three pages: Guided chat, `Results`, `MonteCarloPanel`, `SaveCompare`, sticky nav, How-to-use, Methodology.
- Same setup added to **Safe Withdrawal** (strategy switcher + One Bucket math path).
- Compare page becomes 3 columns in order: One / Two / Three Bucket.

## 2. Start every strategy from the date of retirement

Per your answer "Apply same rule to Two and Three Bucket too":
- Remove SIP-related inputs from the chat (monthly investment, SIP step-up).
- Remove "years before retirement" prep transfers from Three Bucket inputs.
- The entered **Retirement Corpus** is treated as the value on retirement day.
- For Three Bucket: split that corpus across Accumulation / Preparation / Withdrawal at retirement using existing target-equity rules (no transfers needed).
- Year 0 of the projection = retirement year. Charts/tables start there.
- Goal Seek will solve for required **starting corpus** (instead of SIP) on retirement-only flows, except SWR which still solves for safe withdrawal % as today.

## 3. Sticky section nav UX

- Smooth scroll on click (`scroll-behavior: smooth` or `scrollIntoView({behavior:"smooth"})`).
- Active link highlight using `IntersectionObserver` on `#how-to-use` and `#how-it-works`. Active = bold + gold underline.

## 4. Accessibility audit pass

- Verify every interactive element on Retirement and SWR pages has visible focus ring, aria-label where icon-only, sane tab order, and that the per-run table rows expose `aria-pressed` and a meaningful row label.
- Add skip-link target on main, `aria-current="page"` to active sticky link, role/labels on the MC slider, and `<caption>` on per-run tables.

## 5. Footer cleanup

Remove the "Calculators · Privacy Policy · Terms" line at the bottom — keep Calculators only in the Resources column.

## 6. Calculators landing page

Add a professional icon next to each calculator (no people). Use `lucide-react`:
- Retirement simulator → `PiggyBank`
- Safe withdrawal simulator → `LineChart`
- One bucket simulator → `Wallet`
Icons in a gold rounded square to match brand.

## Technical notes

- `src/lib/retirement.ts`: add `OneBucketInputs` shape + `projectOneBucket()` deterministic projection; refactor existing project() to accept corpus-at-retirement and skip pre-retirement loop when SIP fields absent.
- `src/lib/retirement-mc.ts`: add `runOneBucketMC()` reusing the same return-sampling util; per-run record keeps same shape so `MonteCarloPanel` works unchanged.
- `src/components/retirement/StrategySwitcher.tsx`: add `one` tab.
- `src/components/retirement/GuidedInputsChat.tsx`: gate SIP / step-up / prep-years questions behind a `strategy` prop and skip them entirely; remove from `defaults`.
- New `OneBucketInputsForm` not required — guided chat covers it.
- `src/pages/CompareStrategies.tsx`: third column.
- `App.tsx`: route for `/calculators/onebucketsimulator`.
- `Calculators.tsx`: third tile + icons.

## Out of scope (will not touch)

- Existing exports, CMS, Sanity wiring, anything outside the calculators flow.
- Goal Seek behavior change beyond what's needed for "no SIP".
