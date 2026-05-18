# Retirement Calculator Redesign Plan

A focused, multi-pass refactor to make the four tabs (One-/Two-/Three-Bucket, Compare) trustworthy and beginner-friendly while preserving analytical depth via progressive disclosure.

## Scope & Principles

- **Progressive disclosure**: Summary → Details → Expert diagnostics.
- **Model-relevant inputs only**: Hide fields a model doesn't use.
- **Plain English everywhere**: Friendly labels, helper text, glossary tooltips.
- **No dead fields**: Remove `prepEquityPct` entirely (and audit others).
- **Premium wealth-mgmt aesthetic**: Calm, conservative, no startup gradients.

---

## 1. Input Architecture

### Group inputs into three sections (in `GuidedInputsChat` + summary view)
1. **Basic details** — name, DOB, current monthly expenses, savings already built, monthly SIP, SIP step-up, retirement age, plan-until age.
2. **Retirement assumptions** — inflation, accumulation CAGR, emergency fund months.
3. **Advanced settings** (collapsed by default) — stress/sequence config, Monte Carlo runs, seed, transfer mode.

### Per-tab field visibility map
| Field | One | Two | Three |
|---|---|---|---|
| Withdrawal bucket years/return | — | ✓ | ✓ |
| Prep bucket years/return | — | — | ✓ |
| Transfer mode | — | ✓ | ✓ |
| `prepEquityPct` | **REMOVED** | **REMOVED** | **REMOVED** |
| `accEquityPct` | hidden (unused in current math) | hidden | hidden |

Fields not used by the active tab are **hidden**, not greyed. The summary review screen shows a small "Used in this model" badge list.

### Friendly labels (examples)
- `currentMonthlyExpenses` → "Monthly expenses today"
- `currentCorpus` → "Savings already built"
- `retirementAge` → "Age you want to retire"
- `lifeExpectancyAge` → "Plan until age"
- `withdrawalReturn` → "Safe bucket return (after tax)"
- `prepReturn` → "Preparation bucket return"
- `accReturn` → "Growth bucket return"
- `sipStepUpRate` → "Annual SIP increase"

Each advanced field gets a one-line helper in plain English + an info `(?)` tooltip glossary.

---

## 2. Outputs — Progressive Disclosure

Reorder `Results.tsx` into three tiers:

### Tier 1 — Outcome Card (always visible, top)
- **"Will your money likely last?"** — Yes / At Risk / No (color-coded calm tones).
- **Confidence score** — % of Monte Carlo runs lasting to plan-until age.
- **Likely shortfall age (bad case)** — P10 depletion age.
- **Estimated monthly SIP needed** — solver result.
- Plain-English subtext: e.g. *"In 78% of simulated futures, your money lasted to age 90."*

### Tier 2 — Details (expanded by default)
- Bucket balances chart (existing).
- Year-by-year table with **friendly column names** + sticky header + zebra rows.
- Percentile translations: P10 = "Poor outcome", P50 = "Middle outcome", P90 = "Strong outcome".

### Tier 3 — Expert Diagnostics (collapsed)
- Monte Carlo per-run list / scenario picker.
- BucketFlowPanel (year-by-year transfer diagnostics).
- Stress/sequence config readout.
- Assumption audit (see §5).

---

## 3. Compare Tab

- **Comparison matrix** (rows = models, cols = key metrics: Final corpus P50, Confidence %, Shortfall age P10, Required SIP).
- **Used / Ignored assumption map** — small table per model showing which inputs feed it.
- **Plain-English "Why results differ"** block — 2–3 sentences explaining the structural reason (e.g. *"Three-Bucket cushions sequence risk via the Prep bucket, raising confidence in volatile decades."*).
- Base Data section: keep Prep + Withdrawal rows visible only when relevant model is in the comparison.

---

## 4. Onboarding & Glossary

- "What should I look at first?" strip at top of each calculator (3 bullets: Confidence → Required SIP → Shortfall age).
- New `GlossaryTooltip` component wrapping terms: CAGR, Monte Carlo, depletion age, sequence-of-returns risk, P10/P50/P90, SIP step-up, emergency reserve.

---

## 5. Dead-Field Audit & Debug Mode

- Remove `prepEquityPct` from: `RetirementInputs` type, all defaults, `InputsForm`, `TwoBucketInputsForm`, `GuidedInputsChat` questions, `Compare` base data, PDF/XLSX exporters, `sharedInputs.ts`, tests.
- Audit `accEquityPct` — currently unused by math; either remove or wire into return calc. Plan: **remove** (cleaner, math unchanged).
- Add a dev-only `?audit=1` query flag that renders an "Assumption Audit" panel listing every input with **Used / Ignored / Derived** status per active tab.

---

## 6. Visual Design

- Keep brand palette (Navy / Gold / Cream). No gradients.
- Outcome card uses subtle status colors: emerald (Yes), amber (At Risk), rose (No) — all desaturated, wealth-mgmt feel.
- Tables: sticky header, generous row padding, right-aligned numbers, monospace numerals (`tabular-nums`).
- Mobile: outcome card stacks; tables become horizontally scrollable with a hint.

---

## 7. Implementation Passes

**Pass A (this pass)** — Dead-field removal + input visibility + friendly labels + outcome card + Compare matrix.

**Pass B** — Glossary tooltips, onboarding strip, expert-section collapses, table polish.

**Pass C** — Assumption audit panel + final QA across One/Two/Three/Compare.

---

## Files to Touch (Pass A)

- `src/lib/retirement.ts` — drop `prepEquityPct` (+ `accEquityPct`) from type & validation.
- `src/lib/sharedInputs.ts` — remove dead keys.
- `src/components/retirement/GuidedInputsChat.tsx` — section grouping, friendly labels, helper text, drop dead Qs.
- `src/components/retirement/InputsForm.tsx`, `TwoBucketInputsForm.tsx` — drop equity sliders, group sections.
- `src/components/retirement/Results.tsx` — new OutcomeCard tier, collapse expert panels.
- New: `src/components/retirement/OutcomeCard.tsx`, `GlossaryTooltip.tsx`.
- `src/pages/CompareStrategies.tsx` — matrix + Used/Ignored map + plain-English summary.
- `src/pages/OneBucketSimulator.tsx`, `TwoBucketSimulator.tsx`, `RetirementSimulator.tsx` — defaults cleanup, per-tab `skipQuestionIds`.
- `src/lib/retirement-pdf.ts`, `retirement-xlsx.ts` — drop dead-field columns.
- `src/test/retirement-audit.test.ts` — update fixtures.

## Risks

- Removing `accEquityPct` / `prepEquityPct` is a breaking type change; localStorage scenarios from older runs will ignore them harmlessly.
- Outcome card depends on Monte Carlo always being computed — confirm MC runs on initial render for all three tabs.

## Out of Scope

- Safe Withdrawal Calculator (next pass, per prior agreement).
- Any change to CAGR / random-returns / Monte Carlo math.
