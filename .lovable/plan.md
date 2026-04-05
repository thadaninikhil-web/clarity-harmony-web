

# Plan: Regulatory Rewording + Build Fix + Button Consistency

## Build Fix (Type Errors)

Two small changes to `src/types/insight.ts`:
- `content?: any[]` → `content?: any[] | string` (allows both PortableText arrays from Sanity and plain strings from static data)
- Add `status?: string` field (used in static data but missing from the interface)

This does NOT affect how Sanity PortableText content is fetched or rendered. Your rich formatting from Sanity is preserved as-is.

## Regulatory Rewording (Site-Wide)

Replace "Financial Planner," "Financial Planning" (when used as a service/title), and "Advisor" with compliant alternatives. Key changes:

| File | What changes |
|------|-------------|
| `src/config/site.ts` | Author role → "Founder, Balancing Act" |
| `PhilosophySection.tsx` | Heading → "Disciplined Investing Without Product Bias"; reword paragraph |
| `ServicesSection.tsx` | Heading → "What We Do For You"; "Goal Based Financial Planning" → "Goal Based Investment Strategy"; "Ongoing Financial Life Management" → "Ongoing Review & Guidance" |
| `FrameworkSection.tsx` | Quote: "Financial planning is not…" → "Building financial clarity is not…" |
| `Services.tsx` | Same heading/title changes as ServicesSection + reword descriptions |
| `Process.tsx` | Heading → "How We Work Together"; subtitle reworded; Step 4 desc: "financial plan" → "financial strategy" |
| `About.tsx` | Core belief reworded; founder title → "Founder, Balancing Act"; "disciplined planning" → "disciplined investing" |
| `Book.tsx` | "planning strategies" → "investment strategies" |
| `Insights.tsx` | Subtitle: remove "financial planning" → "disciplined decision-making" |
| `Footer.tsx` | "financial advisor" → "advisor" |

## Button Consistency

- `ClientStories.tsx`: Change `variant="gold"` → `variant="hero"` on the Discovery Call button
- `Insights.tsx`: Add a "Book a Discovery Call" button (variant="hero") before the footer

## Files to Edit: 12 files total

