

# Implementation Plan

## Summary
Six changes: justify text alignment globally, add a Login button to the navbar, lighten the footer disclaimer, integrate Sanity CMS for insights and client stories, and enhance the premium feel with stronger gold accents on the existing cream base.

---

## 1. Justified Text Alignment
Add `text-align: justify` to paragraph base styles in `src/index.css` so all `<p>` tags default to justified. Specific elements (hero headlines, labels, centered disclaimers) will override with `text-center` or `text-left` as needed.

## 2. Login Button in Navbar
Add an external link button in `src/components/Navbar.tsx` pointing to `https://my-planner.in/login`, styled as a secondary/outline button next to the existing "Book a Call" CTA. Also add it to the mobile menu.

## 3. Lighter Footer Disclaimer
In `src/components/Footer.tsx`, increase the opacity of the SEBI registration and disclaimer text from `text-primary-foreground/25` and `/30` to `/50` and `/45` respectively for better readability.

## 4. Sanity CMS Integration (Insights + Client Stories)

This is the largest change. It replaces the static `src/data/insights.ts` and hardcoded client stories with content from Sanity CMS.

**Setup:**
- Connect Sanity MCP connector to discover project ID and configure CORS
- Install `@sanity/client` and `@sanity/image-url`
- Create `src/lib/sanity.ts` with the Sanity client config

**Insight Schema (in Sanity):**
- Title, slug, summary, category, publish_date, source, risk_note, is_featured, status
- `body` as Sanity's portable text (rich text with images, tables, charts)
- Optional: chart_url, pdf_resource, video_link

**Client Stories Schema (in Sanity):**
- Title, situation, strategy, outcome, display_order, is_featured

**Code changes:**
- Update `src/services/insightsService.ts` to fetch from Sanity instead of local data
- Create `src/services/clientStoriesService.ts` for fetching stories
- Update `src/hooks/useInsights.ts` to use Sanity queries
- Create `src/hooks/useClientStories.ts` with React Query hooks
- Install `@portabletext/react` for rendering rich text content (images, tables, etc.) in `InsightDetail.tsx`
- Update `src/pages/InsightDetail.tsx` to render portable text instead of plain markdown
- Update `src/pages/ClientStories.tsx` to dynamically load stories
- Update `src/components/home/ClientStoriesSection.tsx` to pull featured stories from Sanity
- Update `src/components/home/InsightsPreview.tsx` (already dynamic, just needs Sanity query swap)
- Keep `src/data/insights.ts` as fallback data

**Insights disclaimer:** Keep only the EducationalDisclaimer at the bottom of both `Insights.tsx` and `InsightDetail.tsx`. Remove any duplicate MutualFundDisclaimer from those pages.

## 5. Dynamic Client Stories Structure
The Sanity schema will support unlimited client stories with fields: title, situation, strategy, outcome, display_order, is_featured. The homepage shows only stories marked `is_featured`, while `/client-stories` shows all, sorted by display_order.

## 6. Premium Visual Enhancement (Cream Base + Stronger Gold)

Changes to `src/index.css` CSS variables:
- Intensify gold: `--gold: 37 45% 55%` (richer, more saturated)
- Add a new `--gold-bright: 40 60% 50%` for hover states
- Darken card backgrounds slightly: `--card: 40 20% 98%` for subtle contrast
- Strengthen border color: `--border: 216 56% 10% / 0.15`

Component-level enhancements:
- `Navbar.tsx`: Add a subtle gold bottom border when scrolled
- `HeroSection.tsx`: Make the gold accent line thicker, increase label-caps gold saturation
- `PhilosophySection.tsx`: Gold left-border on pillars more opaque
- `ServicesSection.tsx`: Gold icon backgrounds on hover more prominent
- `Footer.tsx`: Slightly warmer/richer gold for section headers
- Card borders across all sections: Use `border-gold/20` for a warmer feel vs generic border
- Button `variant="hero"`: Ensure gold background with dark text for maximum contrast

This will be presented for preview before deploying.

---

## Technical Notes
- Sanity CMS is free tier, supports rich text with embedded images/tables/charts natively
- The Sanity MCP connector will be used to get the project ID and add CORS origins
- `@portabletext/react` handles Word-like rich content rendering (headings, images, tables, lists)
- All Sanity queries use `useCdn: true` for fast, cached reads on Cloudflare
- Client stories and insights both use React Query with 5-minute stale time

## File Changes Summary
- **Modified:** `src/index.css`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/services/insightsService.ts`, `src/hooks/useInsights.ts`, `src/pages/Insights.tsx`, `src/pages/InsightDetail.tsx`, `src/pages/ClientStories.tsx`, `src/components/home/ClientStoriesSection.tsx`, `src/components/home/InsightsPreview.tsx`, `tailwind.config.ts`
- **Created:** `src/lib/sanity.ts`, `src/services/clientStoriesService.ts`, `src/hooks/useClientStories.ts`
- **Packages:** `@sanity/client`, `@sanity/image-url`, `@portabletext/react`

