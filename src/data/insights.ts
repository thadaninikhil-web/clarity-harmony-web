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
    publishedAt: "March 2026",
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
      "Market downturns trigger powerful emotional responses that can lead even experienced investors to make impulsive decisions. Understanding the psychological forces at play during market declines is crucial for maintaining a disciplined investment strategy and avoiding costly mistakes.",
    category: "Behavioral Finance",
    publishedAt: "March 2026",
    insight_url: "",
    source: "Behavioral Finance Research / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
    content: `Market downturns trigger powerful emotional responses that can lead even experienced investors to make impulsive decisions. Understanding the psychological forces at play during market declines is crucial for maintaining a disciplined investment strategy and avoiding costly mistakes.

**The Fear Response: Why We Want to Sell**

When markets decline, our brains activate the same fight-or-flight response that helped our ancestors survive physical threats. This evolutionary mechanism, while useful for avoiding predators, works against us in financial markets. The amygdala—the brain's fear center—triggers an emotional reaction before our rational mind can process the situation.

Loss aversion, a concept identified by behavioral economists Daniel Kahneman and Amos Tversky, explains why losses feel roughly twice as painful as equivalent gains feel pleasurable. During a market decline, watching your portfolio value drop creates intense psychological discomfort, making selling seem like the only way to stop the pain.

**Common Psychological Traps**

**Recency Bias**: Investors tend to overweight recent events when making decisions. After experiencing losses, we convince ourselves that markets will continue declining indefinitely, forgetting the long-term upward trajectory of equity markets.

**Herd Mentality**: Seeing others panic and sell creates social proof that selling is the right decision. This collective behavior can turn moderate declines into severe crashes, as witnessed during the 2008 financial crisis and the March 2020 pandemic selloff.

**Mental Accounting**: We tend to treat money differently based on where it came from or where it's kept. During downturns, investors may irrationally protect certain accounts while selling from others, rather than considering their entire portfolio holistically.

**The Cost of Emotional Selling**

Research consistently shows that investors who sell during market declines underperform those who stay invested. A study by Dalbar Inc. found that over the 20-year period ending in 2019, the average equity fund investor earned just 4.3% annually while the S&P 500 returned 6.1%—a gap largely attributed to poor timing driven by emotional decisions.

The timing challenge is particularly acute because markets often recover quickly. Missing just the 10 best days in the market over a 20-year period can reduce returns by more than half. Unfortunately, these best days often occur shortly after the worst days, when fear is highest and investors have already sold.

**Strategies to Combat Fear-Based Selling**

**Create a Written Investment Plan**: Before the next downturn hits, document your investment strategy, risk tolerance, and goals. Include specific guidelines for rebalancing during declines. When fear strikes, you'll have a rational roadmap created during calm periods.

**Limit Information Consumption**: Constant monitoring of portfolio values and financial news amplifies emotional responses. Consider checking your accounts less frequently during volatile periods and avoiding sensationalist financial media.

**Reframe Declines as Opportunities**: Instead of viewing market drops as disasters, see them as sales on quality investments. Dollar-cost averaging—investing fixed amounts regularly—automatically buys more shares when prices are low.

**Seek Perspective Through Data**: Historical data shows that markets have recovered from every downturn, including the Great Depression, multiple wars, and the 2008 financial crisis. Reviewing long-term charts can provide reassurance when short-term volatility feels overwhelming.

**Consider Professional Guidance**: A financial advisor can serve as a behavioral coach, providing objective counsel when emotions run high. Studies show that investors who work with advisors tend to stay invested during downturns and achieve better long-term results.

**The Power of Rational Patience**

The most successful investors aren't those who never feel fear—they're those who recognize fear's influence and refuse to let it dictate their actions. Warren Buffett's famous advice to "be fearful when others are greedy and greedy when others are fearful" encapsulates this contrarian mindset.

Understanding that market volatility is the price we pay for long-term equity returns helps reframe declines from threats to expected occurrences. The S&P 500 has experienced a 10% correction in about one of every two years and a bear market (20%+ decline) roughly once every five years. These aren't aberrations—they're normal features of market cycles.

By preparing psychologically for inevitable downturns, creating systematic strategies that remove emotional decision-making, and maintaining focus on long-term goals rather than short-term fluctuations, investors can overcome the natural impulse to sell during declines and position themselves for the wealth creation that comes from patient, disciplined investing.

*This content is for investor education and awareness purposes only. It does not constitute investment advice.*`,
  }),
  makeInsight({
    id: "INS003",
    title: "When Should You Start Planning for Retirement?",
    summary:
      "The question of when to start retirement planning has a simple answer: as early as possible. However, the complexity lies in understanding why early planning matters so profoundly and how the strategies differ across various life stages.",
    category: "Financial Planning",
    publishedAt: "March 2026",
    insight_url: "",
    source: "AMFI / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
    content: `The question of when to start retirement planning has a simple answer: as early as possible. However, the complexity lies in understanding why early planning matters so profoundly and how the strategies differ across various life stages. Whether you're in your twenties or approaching retirement, there's always an optimal strategy for your current situation.

**The Compound Interest Advantage**

Einstein allegedly called compound interest "the eighth wonder of the world." While the attribution is disputed, the principle is undeniable. The mathematics of compounding creates a dramatic advantage for early starters that can never be fully recovered by late savers, regardless of how aggressively they save.

Consider two investors: Priya starts investing ₹5,000 monthly at age 25, while Raj begins at age 35 with the same amount. Assuming an 8% annual return, by age 60, Priya will have accumulated approximately ₹1.12 crore, while Raj will have only ₹74 lakhs—a difference of ₹38 lakhs despite Priya investing just ₹6 lakhs more in total contributions.

The power becomes even more striking when you consider someone who invests early but stops. If Priya invests ₹5,000 monthly from age 25 to 35 (only 10 years) then never contributes again, she'll still have approximately ₹87 lakhs at 60—more than Raj who contributed for 25 years but started later.

**Retirement Planning by Life Stage**

**In Your 20s: Building the Foundation**

This is the golden decade for retirement planning, even though retirement seems impossibly distant. Your twenties offer something priceless: time. Start with these priorities:

• Enroll in your employer's EPF (Employee Provident Fund) and contribute the maximum allowed if possible
• Start a monthly SIP (Systematic Investment Plan) in equity mutual funds, even if it's just ₹1,000-2,000
• Open a PPF (Public Provident Fund) account for tax-free long-term savings
• Establish an emergency fund covering 3-6 months of expenses
• Purchase basic term life insurance if you have dependents

At this stage, aggressive growth through equity investments makes sense because you have 30-40 years to weather market volatility. The goal is consistency over amount—building the saving habit matters more than the specific sum.

**In Your 30s: Accelerating Growth**

Career advancement typically brings higher income in your thirties, making this the decade to significantly increase retirement contributions. As salary rises, commit to saving at least 50% of each raise for retirement before lifestyle inflation consumes it.

• Increase SIP contributions with each salary increment
• Consider opening a National Pension System (NPS) account for additional tax benefits under Section 80CCD(1B)
• Diversify beyond domestic equities into international funds (within the LRS limit)
• Review and update your asset allocation annually
• Purchase adequate health insurance to protect retirement savings from medical emergencies

This is also the time to calculate your retirement corpus target. A common rule suggests you'll need 25-30 times your annual expenses in retirement. If you plan to spend ₹10 lakhs annually, you'll need ₹2.5-3 crore, adjusted for inflation.

**In Your 40s: Course Correction and Optimization**

Peak earning years require maximum contribution rates. This is also the critical decade for course correction if you started late.

• Maximize contributions to all tax-advantaged accounts (EPF, PPF, NPS)
• Begin gradually shifting allocation from pure equity to balanced funds
• Create a detailed retirement budget accounting for healthcare, travel, and lifestyle expenses
• Consider consulting a SEBI-registered investment advisor for comprehensive planning
• Ensure your portfolio is adequately diversified across asset classes

If you're behind on retirement savings, this is the decade to make aggressive catch-up contributions. You still have 15-20 years of compounding ahead, but the window is narrowing.

**In Your 50s: Preservation and De-Risking**

The final working decade requires a shift from accumulation to preservation. Major market losses now have less time to recover.

• Continue maximum contributions but gradually reduce equity allocation to 50-60% of portfolio
• Build a 2-3 year cash buffer in liquid funds for early retirement expenses
• Review pension options and annuity products available from NPS
• Create a comprehensive estate plan including will and nominee updates
• Calculate exact retirement date based on accumulated corpus and income needs

Develop your withdrawal strategy well before retirement. The sequence of returns—the order in which you experience gains and losses—becomes critical when you start drawing down your portfolio.

**What If You're Starting Late?**

Starting retirement planning in your 40s or 50s doesn't mean you've missed the boat, but it requires more aggressive action and realistic expectations.

• Save 30-40% of your gross income if you're starting in your 40s
• Consider working 2-3 years longer than originally planned
• Develop skills for potential part-time work in retirement to supplement income
• Be prepared to adjust retirement lifestyle expectations if necessary
• Avoid taking on new debt, especially for depreciating assets

Late starters should also consider alternative retirement funding sources: downsizing homes, relocating to lower-cost areas, or monetizing skills through consulting.

**The Bottom Line**

The best time to start retirement planning was yesterday. The second-best time is today. Every year of delay costs exponentially more in required future contributions. A 25-year-old who invests ₹3,000 monthly will have the same retirement corpus as a 35-year-old investing ₹6,500 monthly—the late starter must contribute more than double for the same result.

Regardless of your age, start where you are. Calculate your retirement needs, understand your current trajectory, and create a realistic plan to close any gap. The math is unforgiving, but it's also unambiguous: earlier is always better, but today is always better than tomorrow.

*This content is for investor education and awareness purposes only. It does not constitute investment advice. Past performance may or may not be sustained in the future.*`,
  }),
  makeInsight({
    id: "INS004",
    title: "Why Global Investing is Relevant for Indians?",
    summary:
      "For decades, Indian investors primarily limited their portfolios to domestic assets. However, the investment landscape has evolved dramatically. Global investing, once accessible only to the ultra-wealthy, is now available to everyday Indian investors through multiple channels.",
    category: "Financial Planning",
    publishedAt: "March 2026",
    insight_url: "",
    source: "AMFI / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
    content: `For decades, Indian investors primarily limited their portfolios to domestic assets—stocks listed on the NSE or BSE, Indian mutual funds, fixed deposits, and gold. However, the investment landscape has evolved dramatically. Global investing, once accessible only to the ultra-wealthy, is now available to everyday Indian investors through multiple channels. The question is no longer whether you can invest globally, but whether you should—and the answer is increasingly yes.

**The Diversification Imperative**

Diversification is often called the only free lunch in investing, and geographical diversification offers one of its most powerful forms. No matter how well-diversified your holdings across Indian sectors, you're still exposed to India-specific risks: domestic political uncertainty, regulatory changes, currency depreciation, and economic cycles unique to emerging markets.

The Indian stock market, while robust, represents less than 3% of global market capitalization. By investing exclusively in India, you're limiting yourself to a small fraction of global opportunities. The remaining 97% includes companies, sectors, and innovations you simply cannot access through domestic markets.

Correlation data reinforces this point. Indian markets don't move in lockstep with developed markets. During periods when the Sensex or Nifty decline, global markets may be rising, and vice versa. This imperfect correlation means international investments can smooth your portfolio's volatility and reduce overall risk.

**Access to Global Leaders and Innovation**

Many of the world's most dominant companies simply aren't available in Indian markets. If you want to own shares in Apple, Microsoft, Amazon, Google, Tesla, or Nvidia—companies that shape global technology and innovation—you must invest internationally.

This matters because these companies often drive global economic growth and generate substantial returns. Over the past decade, the NASDAQ 100 (dominated by US tech companies) has significantly outperformed most global indices, including Indian markets during many periods. Missing out on these growth engines means potentially leaving significant returns on the table.

Beyond technology, international investing provides exposure to sectors where India is underrepresented. Advanced healthcare and biotechnology companies, cutting-edge semiconductor manufacturers, global luxury brands, and mature consumer staples companies offer investment opportunities that domestic markets can't replicate.

**Currency Hedging and Protection**

The rupee has depreciated against major currencies over long periods. From 2000 to 2023, the rupee declined from approximately ₹45 per dollar to over ₹83—a depreciation of more than 80%. This long-term trend, while not guaranteed to continue, represents a significant consideration for wealth preservation.

When you invest in foreign assets, currency movements can work in your favor. If you invest $1,000 when the exchange rate is ₹75 per dollar, and the rupee later depreciates to ₹85 per dollar, your investment is worth more in rupee terms even if the underlying asset price remains unchanged. This currency appreciation acts as a natural hedge against rupee depreciation.

For Indians with foreign currency obligations—children studying abroad, plans to retire overseas, or global travel aspirations—this currency matching becomes even more important. Having assets in dollars or euros directly offsets these future liabilities.

**Risk Mitigation Through Geographic Spread**

Concentrating all investments in a single country is a concentrated bet on that country's continued prosperity and stability. While India's long-term growth story remains compelling, unexpected events can derail even the most promising trajectories.

Geopolitical tensions, regulatory overreach, financial crises, or sudden policy changes can impact domestic markets severely. We've seen this with demonetisation in 2016, the COVID-19 lockdowns, and various regulatory actions that temporarily roiled Indian markets. International diversification provides a buffer against such country-specific shocks.

Developed markets, particularly the US, offer deeper liquidity, stronger regulatory frameworks, and greater transparency. While no market is immune to volatility, mature markets typically offer better investor protection and more stable governance structures.

**How Indians Can Invest Globally**

Several routes now enable Indian investors to gain international exposure:

**International Mutual Funds and ETFs**: The simplest path for most investors. Indian AMCs offer funds that invest in global equities. These funds handle currency conversion, compliance, and tax implications on your behalf. Options include funds focused on the US market, global technology, emerging markets excluding India, and diversified international portfolios.

**Direct Investment Through LRS**: Under the Liberalised Remittance Scheme, Indian residents can remit up to $250,000 per financial year for any permissible purpose, including overseas investments. You can open accounts with international brokers and directly purchase foreign stocks, ETFs, or bonds.

**Indian Stocks with Global Exposure**: Some Indian companies derive substantial revenue from international markets (IT services, pharmaceuticals). While not pure international investing, these provide indirect global exposure.

**Tax Implications and Considerations**

International investing comes with specific tax treatment in India. Gains from international equity funds are taxed as debt funds: short-term gains (held less than 3 years) are added to your income and taxed at your slab rate, while long-term gains are taxed at 20% with indexation benefit.

Direct investments through LRS require TCS (Tax Collected at Source) of 5-20% depending on the amount remitted, though this is adjustable against your final tax liability. You must also report foreign assets in your ITR and maintain detailed records of transactions for currency conversion calculations.

Estate planning becomes more complex with international assets, and currency conversion introduces timing decisions that don't exist with purely domestic investments. These factors don't negate the benefits of global investing, but they require proper planning and often professional tax advice.

**What Allocation Makes Sense?**

Financial advisors typically suggest 10-30% international allocation for Indian investors, depending on individual circumstances, age, and risk tolerance. Younger investors with longer time horizons might skew toward the higher end, while those nearing retirement might prefer conservative allocations.

The key is viewing international investments as a complement to, not a replacement for, domestic holdings. India's growth story remains compelling, but that growth can be better captured when your overall portfolio is balanced with global diversification.

**The Globalised Future of Investing**

The Indian investor of 2024 operates in a fundamentally different environment than previous generations. Technology has democratised access to global markets, regulations have liberalised to permit international investing, and information flows freely across borders.

In this interconnected world, restricting your investments to a single country—no matter how promising—represents an unnecessary concentration of risk and a limitation of opportunity. Global investing isn't just relevant for Indians; it's increasingly essential for building robust, resilient portfolios positioned to weather domestic challenges and capitalise on worldwide growth.

The question is no longer whether to invest globally, but how much, through which vehicles, and starting when. For most Indian investors, the answer to "when" should be: as soon as possible.

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
