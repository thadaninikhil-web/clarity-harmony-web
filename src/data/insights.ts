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
      "Decades of Indian market data confirm that deciding how to divide wealth across equities, debt, and gold generates far more of your long-term return than which individual stock you pick. Here is the evidence — and a framework built for Indian families.",
    category: "Financial Planning",
    publish_date: "March 2026",
    insight_url: "",
    source: "AMFI / NSE / FundsIndia Research / Mirae Asset MF",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
    content: `Every year, millions of Indian investors spend enormous energy hunting for the next Infosys or the next multibagger small-cap. It is an intellectually satisfying pursuit — but research consistently shows it is the wrong game to be playing.

The most consequential investment decision you will ever make is not which company to own. It is how much of your total wealth to place in equities versus debt versus gold versus cash. This allocation decision, made once and reviewed periodically, explains the overwhelming majority of the variation in long-term portfolio returns — across asset managers, across countries, and across decades of Indian market history.

**The research behind the principle**

The landmark 1986 study by Brinson, Hood and Beebower found that asset allocation accounts for roughly 90–94% of the variability in a portfolio's long-term return. Individual security selection and market timing account for the remainder. Indian market data since 1991 broadly validates this finding. Whether you are a salaried professional in Bengaluru, an NRI remitting from Dubai, or a joint-family managing ancestral wealth, the principle holds with equal force.

**What India's 35-year return history tells us**

The Nifty 50 is now old enough to have data across every conceivable crisis: the 1997 Asian contagion, the dot-com bust, the 2008 Global Financial Crisis, demonetisation, and COVID-19. Through each of these, the long-run pattern has remained remarkably consistent.

At a one-year horizon, the Nifty 50 has returned anywhere from −60% to +80% — a range so wide as to be practically useless for planning. But stretch that horizon to 20 years, and every observed rolling CAGR has fallen in a tight band between 8% and 15%, with an average of around 11.8%. The standard deviation collapses from 35% at one year to under 2% at twenty years.

Based on historical Nifty 50 rolling return data, every rolling 7-year SIP investment in the index since 1991 has produced a positive real return. There has been no seven-year period in which a disciplined investor in Indian large-cap equities lost money in inflation-adjusted terms.

**The four asset classes — a 20-year Indian scorecard**

• Indian Equities (Nifty 50 TRI): ~13–16% CAGR over 20 years. Primary engine of long-term wealth creation.
• Gold (INR): ~12–15% CAGR over 20 years. Hedge, crisis insurance, and INR depreciation buffer. Gold delivered approximately 15% CAGR in rupee terms over the 20 years to 2025, per FundsIndia Research.
• Debt Mutual Funds: ~7–8% CAGR. Provides stability, liquidity, and reduced portfolio drawdown.
• Fixed Deposits / Bank Savings: ~6–7% CAGR. Appropriate for emergency funds and capital preservation only.

**Gold's unique role for Indian investors**

Gold occupies a position in Indian portfolios that is unlike any other market. Over the 20 years to 2025, gold delivered approximately 15% CAGR in rupee terms. But these headline numbers can be misleading in isolation.

What gold does uniquely well is reduce portfolio drawdown during equity crises. In 2008, when the Nifty 50 fell over 50%, gold in rupees rose significantly. A portfolio that held 10–15% gold sustained a materially smaller drawdown than a pure equity portfolio. Gold also provides a natural hedge against INR depreciation — as the rupee weakens against the dollar, domestic gold prices rise correspondingly.

A 50:50 portfolio of gold and Nifty 50, rebalanced annually, has been shown to outperform standalone investments in either asset over two decades — the benefit of combining assets with low correlation.

**Allocation frameworks for different investor profiles**

**Young Professional (25–35)**
65–70% Equity / 15–20% Debt / 10% Gold / 5% Cash

**Family (35–50)**
55–60% Equity / 25–30% Debt / 10–15% Gold / 5% FD

**NRI (Any Age)**
40–50% Indian Equity / 20–25% Debt / 15% Gold ETF / 15–20% International Equity

**Pre-Retiree (50–60)**
35–40% Equity / 40–45% Debt / 10% Gold / 10% Liquid

These are illustrative starting points, not prescriptive recommendations. Individual circumstances vary materially.

**The AMFI picture: how India's ₹82 lakh crore industry allocates**

As of February 2026, the Indian mutual fund industry crossed ₹82 lakh crore in AUM — more than six times its size a decade ago. SIP contributions jumped 45% year-on-year in FY25 to ₹2.89 lakh crore, demonstrating a structural shift toward disciplined, allocation-aware investing. Hybrid funds — those that hold a mandated mix of equity and debt — grew 22% year-on-year to ₹8.83 lakh crore in March 2025.

**Rebalancing: the discipline that compounds**

An asset allocation is not a one-time decision. Markets drift allocations over time. After an equity bull run, a 60/20/20 portfolio might drift to 75/15/10 — concentrating risk precisely when valuations are extended. Annual rebalancing — selling the outperformer and buying the underperformer — is the mechanical embodiment of "buy low, sell high" without requiring any market-timing skill.

**What stock picking actually contributes**

Within the equity portion of a well-structured portfolio, active management can add value — particularly in India's mid- and small-cap space where market inefficiencies persist. But there is an ordering that matters. First, get the allocation right. Second, implement efficiently through index funds or quality actively managed funds. Third, if you wish to hold individual stocks, limit them to 5–10% of the equity allocation.

Most investors reverse this order. They spend 95% of their energy on stock selection and 5% on allocation. Evidence-based investors do the opposite.

**Three conclusions worth keeping close**

1. Time in market matters far more than timing. A ₹1 lakh investment in Nifty 50 in 1991 would have grown to approximately ₹64 lakh by early 2026 — a 35-year CAGR of 12.7% through every crisis imaginable.

2. Gold is not optional for Indian investors. The combination of INR depreciation hedging and negative correlation to equities makes a 10–20% gold allocation mathematically and behaviourally defensible.

3. Allocation is a decision, not a default. Most Indian investors hold 60–70% of their wealth in real estate and bank deposits by default — not by design. An explicit, evidence-based allocation to equity, debt, and gold is a correction of a structural imbalance that erodes real wealth over time.

Begin with the allocation. Let it compound. That is the work.

*This content is for investor education and awareness purposes only. It does not constitute investment advice. Past performance may or may not be sustained in the future. Data sources: AMFI FY2025 Annual Report, NSE India, FundsIndia Research (December 2025), Mirae Asset MF, BusinessToday (August 2024), Capitalmind Research.*`,
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
