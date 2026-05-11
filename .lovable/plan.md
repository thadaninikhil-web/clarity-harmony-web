# Calculators restructure

## 1. Calculators landing page (`/calculators`)

Reduce from four tiles to **two**, in this exact order:

1. **Retirement Calculator** → `/calculators/retirementsimulator` (lands on Three-Bucket scenario, with switcher)
2. **Safe Withdrawal Calculator** → `/calculators/safewithdrawalsimulation` (lands on Three-Bucket SWR with switcher)

Icons: `PiggyBank` for Retirement, `LineChart` for SWR. Drop the One/Two/Three tiles from the landing page.

## 2. Retirement Calculator scenarios

Top of every retirement page shows the same **scenario switcher** in this order:
`One-Bucket · Two-Bucket · Three-Bucket · Compare`

- `/calculators/onebucket` → One-Bucket
- `/calculators/twobucket` → Two-Bucket
- `/calculators/retirementsimulator` → Three-Bucket
- `/calculators/compare` → Compare

Update `StrategySwitcher.tsx` so the rendered order is **One, Two, Three, Compare** (currently One, Three, Two, Compare).

## 3. Safe Withdrawal Calculator scenarios

Same switcher pattern, four tabs: One / Two / Three / Compare. Implement as routes so the switcher can be reused:

- `/calculators/safewithdrawalsimulation` → Three-Bucket SWR (default)
- `/calculators/safewithdrawalsimulation/onebucket` → One-Bucket SWR
- `/calculators/safewithdrawalsimulation/twobucket` → Two-Bucket SWR
- `/calculators/safewithdrawalsimulation/compare` → SWR Compare

Refactor: the existing `SafeWithdrawalSimulator.tsx` already has internal `strategy` state; convert it to read scenario from a route param (or use a small wrapper component per route that passes `strategy`). Replace the inline pill switcher with a new `SwrStrategySwitcher` matching the retirement one, in order One/Two/Three/Compare.

## 4. Per-scenario input rules (already mostly enforced — verify)

- **One-Bucket**: only Retirement Corpus + Emergency Fund + sequence inputs. Hide all preparation, withdrawal-bucket, SIP, prep-years questions in the guided chat. Single `accumulation` corpus column. Confirmed: `OneBucketSimulator.tsx` already does this; verify SWR One-Bucket path also forces `prepEquityPct=0`, `prepYears=0`, `withdrawalYears=0` like the retirement page does.
- **Two-Bucket**: no preparation column. Already enforced in `TwoBucketSimulator.tsx`; verify Results table hides the preparation column for `strategy === "two-bucket"` (and same for the SWR two-bucket view).
- **Three-Bucket**: unchanged.

## 5. Compare page — add One-Bucket column

Rewrite `CompareStrategies.tsx` so the comparison runs **three legs** in the order **One, Two, Three** (and emits a third Monte Carlo run via `projectOneBucket`). Each comparison table row gains a third column. The shareable hash schema bumps to `v: 2` with `{ one, two, three }`; v1 hashes still decode (one-bucket gets cloned from `two`). Per-run table and percentile cards reuse the existing components for the new column with no formatting changes.

A separate `SwrCompare` page mirrors the same three-column layout but solves SWR per leg (binary search on each strategy in parallel) and shows the resulting safe year-1 monthly withdrawal + SWR % per column.

## 6. Verify One-Bucket UI parity

Audit `Results.tsx` and `MonteCarloPanel.tsx`:
- Chart: same `<AreaChart>` series; for one-bucket only the accumulation series is plotted (already the case via the single corpus column).
- Percentile cards: identical card grid (P10/P25/P50/P75/P90 + success probability).
- Per-run table: identical column set; for one-bucket the prep / withdrawal columns collapse to "—" or are hidden by the `strategy` prop.

Add small fixes wherever a column or label still references "preparation" / "withdrawal bucket" for the one-bucket view.

## 7. E2E tests

Add Playwright specs under `tests/e2e/`:

- `calculators.spec.ts` — landing page renders exactly two tiles in the right order, both links navigate.
- `onebucket.spec.ts` — `/calculators/onebucket` loads, guided chat skips SIP / prep / withdrawal questions, Results section appears after completion, Monte Carlo percentile cards render, per-run table present.
- `swr-onebucket.spec.ts` — `/calculators/safewithdrawalsimulation/onebucket` loads, goal-seek button appears, switcher highlights correct tab.
- `compare.spec.ts` — `/calculators/compare` shows three columns with headers One / Two / Three, share-link copy works.
- `a11y.spec.ts` — keyboard `Tab` reaches scenario switcher, sticky section nav, guided chat input, and Results action buttons on both `/calculators/retirementsimulator` and `/calculators/safewithdrawalsimulation`. Uses `axe-core/playwright` for a basic violations check on each page.

## 8. Footer / nav

No change beyond the existing Calculators link — confirm it points to `/calculators` only.

## Out of scope

- Goal-seek behavior changes.
- PDF/XLSX export schema changes (one-bucket already exports today via the existing path).
- Sanity / CMS / insights.

## Technical notes

- `StrategySwitcher` order change.
- New `SwrStrategySwitcher` component (or a `mode: "retirement" | "swr"` prop on the existing one).
- `SafeWithdrawalSimulator` refactored to accept a `strategy` prop and registered four times in `App.tsx`.
- `CompareStrategies` adds `oneInputs` state, third MC promise via `projectOneBucket`, third column rendered in every `<Table>` row map (`sharedRows`, `strategyRows`, `sequenceRows`, `Per-leg Results`).
- New `SwrCompareStrategies` page reusing the binary-search solver from `SafeWithdrawalSimulator`.
- New `playwright.config.ts` already exists; add specs and ensure dev server is started by the existing fixture.
