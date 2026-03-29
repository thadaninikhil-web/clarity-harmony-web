import type { Insight } from "@/types/insight";

/**
 * Static insights data — managed locally for Cloudflare-hosted static site.
 * To add a new insight:
 *   1. Add a new entry to the `insights` array below.
 *   2. Set status to "PUBLISHED" to make it live.
 *   3. The `content` field supports full article text (plain text or markdown).
 *   4. The `slug` is auto-generated from the title — keep titles unique.
 */

import { generateSlug } from "@/types/insight";

function makeInsight(data: Omit<Insight, "slug"> & { slug?: string }): Insight {
  return {
    ...data,
    slug: data.slug || generateSlug(data.title),
  };
}

export const insights: Insight[] = [
  makeInsight({
    id: "INS001",
    title: "Why Asset Allocation Matters More Than Stock Picking",
    summary:
      "Historical evidence suggests that long-term portfolio returns are driven primarily by how assets are allocated across asset classes, rather than by individual stock selection.",
    category: "Financial Planning",
    publish_date: "March 2026",
    insight_url: "",
    source: "AMFI / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
    content: `Asset allocation — how your portfolio is divided between equities, debt, gold, and other asset classes — has consistently been shown to be the primary driver of long-term investment returns.

A landmark study by Brinson, Hood, and Beebower (1986) found that over 90% of the variability in portfolio returns could be attributed to asset allocation decisions, rather than individual security selection or market timing.

**What does this mean for individual investors?**

Rather than spending time trying to pick the next winning stock, investors may benefit more from:

• Defining a clear asset allocation based on their goals, risk tolerance, and time horizon
• Maintaining discipline through market cycles
• Rebalancing periodically to stay aligned with their target allocation

At Balancing Act, asset allocation is the foundation of every financial plan. It is not about predicting which stock will outperform — it is about building a diversified framework that can weather different market conditions.

*This content is for investor education and awareness purposes only. It does not constitute investment advice. Past performance may or may not be sustained in the future.*`,
  }),
  makeInsight({
    id: "INS002",
    title: "The Psychology of Selling During Market Declines",
    summary:
      "Understanding why investors may sell during market downturns — and how disciplined planning frameworks can help manage emotional decision-making.",
    category: "Behavioral Finance",
    publish_date: "February 2026",
    insight_url: "",
    source: "Behavioral Finance Research / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
    content: `Market declines trigger a powerful emotional response. When portfolio values drop, the instinct to "stop the bleeding" can feel overwhelming. This behavior — known as loss aversion — is deeply wired into human psychology.

**Why do investors sell at the wrong time?**

Research by Daniel Kahneman and Amos Tversky demonstrated that the pain of losing money is approximately twice as powerful as the pleasure of gaining it. During market downturns:

• Fear replaces rational analysis
• Short-term losses feel permanent
• Media narratives amplify anxiety
• Peer behavior creates herd mentality

**What can help?**

A well-structured financial plan serves as an emotional anchor during volatile periods:

• Having a predetermined asset allocation reduces the need for reactive decisions
• Understanding your risk tolerance before a downturn — not during one — is critical
• Regular reviews with a financial advisor can provide perspective and prevent impulsive actions
• Historical data consistently shows that markets recover, though the timing is unpredictable

The discipline to stay invested during difficult periods is often what separates long-term wealth creation from repeated cycles of buying high and selling low.

*This content is for investor education and awareness purposes only. It does not constitute investment advice.*`,
  }),
  makeInsight({
    id: "INS003",
    title: "When Should You Start Planning for Retirement?",
    summary:
      "Starting early allows more time for the potential benefits of compounding. This article explores the role of time horizon in retirement planning.",
    category: "Financial Planning",
    publish_date: "January 2026",
    insight_url: "",
    source: "AMFI / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
    content: `The most common answer to "when should I start planning for retirement?" is simple: as early as possible. But why does timing matter so much?

**The power of compounding over time**

Compounding allows your returns to generate their own returns. The longer your money is invested, the more time it has to potentially grow. Even modest monthly investments, started early, can accumulate significantly over two or three decades.

Consider a simple illustration:

• Investor A starts investing ₹10,000/month at age 25
• Investor B starts investing ₹20,000/month at age 35
• Both retire at 60

Despite investing half the monthly amount, Investor A may end up with a larger corpus — purely because of the additional 10 years of compounding.

**Key principles for retirement planning:**

• Define your retirement lifestyle and estimate the corpus needed
• Account for inflation — today's expenses will likely be higher in the future
• Start with whatever amount is comfortable, and increase systematically
• Choose an appropriate asset allocation based on your time horizon
• Review and adjust your plan periodically as life circumstances change

The best time to start retirement planning was 10 years ago. The second best time is now.

*This content is for investor education and awareness purposes only. It does not constitute investment advice. Past performance may or may not be sustained in the future.*`,
  }),
];

export function getPublishedInsights(): Insight[] {
  return insights.filter((i) => i.status === "PUBLISHED");
}

export function getFeaturedInsights(): Insight[] {
  return getPublishedInsights().filter((i) => i.is_featured);
}

export function getInsightBySlug(slug: string): Insight | null {
  return getPublishedInsights().find((i) => i.slug === slug) || null;
}

export function getInsightsByCategory(category: string): Insight[] {
  const published = getPublishedInsights();
  if (category === "All") return published;
  return published.filter((i) => i.category === category);
}
