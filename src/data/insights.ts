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
      "Decades of Indian market data confirm what institutional investors have always known: deciding how to divide your wealth across equities, debt, and gold generates far more of your long-term return than which individual stock you pick. Here is the evidence — and a framework built for Indian families.",
    category: "Financial Planning",
    publish_date: "March 2026",
    insight_url: "",
    source: "AMFI / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
    content: `<!-- STAT BAND -->
	<div class="stat-band">
	  <div class="stat-band-inner">
	    <div class="stat-item">
	      <div class="stat-num">11.1<span class="pct">%</span></div>
	      <div class="stat-label">Nifty 50 20-Year CAGR<br>(as of 2026)</div>
	      <div class="stat-source">Source: NSE / BMSMoney Research</div>
	    </div>
	    <div class="stat-item">
	      <div class="stat-num">15<span class="pct">%</span></div>
	      <div class="stat-label">Gold 20-Year CAGR<br>(INR, to 2025)</div>
	      <div class="stat-source">Source: FundsIndia Research 2025</div>
	    </div>
	    <div class="stat-item">
	      <div class="stat-num">7.4<span class="pct">%</span></div>
	      <div class="stat-label">Debt Funds 20-Year<br>Average Return</div>
	      <div class="stat-source">Source: BusinessToday / AMFI</div>
	    </div>
	    <div class="stat-item">
	      <div class="stat-num">₹82<span style="font-size:20px">L Cr</span></div>
	      <div class="stat-label">Indian MF Industry AUM<br>(Feb 2026)</div>
	      <div class="stat-source">Source: AMFI Feb 2026</div>
	    </div>
	  </div>
	</div>

<!-- ARTICLE BODY -->
<div class="container">
<div class="article-body">

  <!-- SECTION 1 -->
  <h2 class="section-head">The Most Expensive Mistake in Investing</h2>

  <p class="drop-cap">Every year, millions of Indian investors spend enormous energy hunting for the next Infosys or the next multibagger small-cap. They pore over quarterly results, track promoter pledging, and debate P/E ratios with the fervour of a cricket commentator. It is an intellectually satisfying pursuit — but research consistently shows it is the wrong game to be playing.</p>

  <p>The most consequential investment decision you will ever make is not which company to own. It is how much of your total wealth to place in equities versus debt versus gold versus cash. This allocation decision, made once and reviewed periodically, explains the overwhelming majority of the variation in long-term portfolio returns — across asset managers, across countries, and across decades of Indian market history.</p>

  <div class="pull-quote">
    <p>"The decision to be 70% in equities vs 50% is worth more than years of stock-screening effort. Asset allocation is the one lever that every investor actually controls."</p>
    <cite>A principle confirmed by both Brinson, Hood &amp; Beebower (1986) and three decades of Nifty 50 data</cite>
  </div>

  <p>The landmark 1986 study by Brinson, Hood and Beebower — later replicated across multiple markets — found that asset allocation accounts for roughly 90–94% of the variability in a portfolio's long-term return. Individual security selection and market timing account for the remainder. Indian market data since 1991 broadly validates this finding. Whether you are a salaried professional in Bengaluru, an NRI remitting from Dubai, or a joint-family managing ancestral wealth in Rajasthan, the principle holds with equal force.</p>

  <!-- SECTION 2 -->
  <h2 class="section-head">What India's 35-Year Return History Tells Us</h2>

  <p>The Nifty 50 is now old enough to have data across every conceivable crisis: the 1997 Asian contagion, the dot-com bust, the 2008 Global Financial Crisis, demonetisation, and COVID-19. Through each of these, the long-run pattern has remained remarkably consistent.</p>

  <div class="chart-block">
    <div class="chart-title">Long-horizon CAGR bands — Nifty 50 TRI (rolling observations, 1991–2026)</div>
    <div class="chart-sub">Shaded bands show min/max range of rolling CAGRs at each horizon. Longer time frames compress risk dramatically.</div>
    <div style="position:relative; width:100%; height:280px;">
      <canvas id="cagr-chart"></canvas>
    </div>
    <div class="chart-source">Data: NSE India, BMSMoney Research. Past performance does not guarantee future results.</div>
  </div>

  <p>The numbers are striking in what they reveal about time as a risk-reduction tool. At a one-year horizon, the Nifty 50 has returned anywhere from −60% to +80% — a range so wide as to be practically useless for planning. But stretch that horizon to 20 years, and every observed rolling CAGR has fallen in a tight band between 8% and 15%, with an average of around 11.8%. The standard deviation collapses from 35% at one year to under 2% at twenty years.</p>

  <p>This is not merely a statistical artefact. It reflects a fundamental truth about equity as an asset class: short-term prices are driven by sentiment, liquidity, and geopolitical noise, while long-term prices are anchored to earnings growth and economic expansion. India's nominal GDP has grown at roughly 12–14% per year since liberalisation, and equity markets — over long enough periods — tend to track that growth.</p>

  <div class="callout">
    <div class="callout-head">Key Insight: The 7-Year Rule</div>
    <p>Based on historical Nifty 50 rolling return data, every rolling 7-year SIP investment in the index since 1991 has produced a positive real return. There has been no seven-year period in which a disciplined investor in Indian large-cap equities lost money in inflation-adjusted terms. This does not mean seven years is sufficient for everyone — but it establishes a meaningful minimum horizon for equity allocation.</p>
  </div>

  <!-- ASSET CLASS COMPARISON TABLE -->
  <h3 class="sub-head">The four asset classes — a 20-year Indian scorecard</h3>
  <p>Before choosing how to allocate, investors must understand what each asset class has actually delivered — and what role each plays beyond its headline return number.</p>

  <div class="data-table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>Asset Class</th>
          <th>20-Year CAGR</th>
          <th>Role in Portfolio</th>
          <th>Key Risk</th>
          <th>Relative Return (bar)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="td-asset">Indian Equities (Nifty 50 TRI)</td>
          <td class="td-highlight">~13–16%</td>
          <td>Long-term wealth creation</td>
          <td>Volatility, sequence risk</td>
          <td>
            <div class="bar-cell">
              <div class="bar-bg"><div class="bar-fill b-teal" style="width:100%"></div></div>
              <span style="font-size:12px;color:var(--teal)">Highest</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="td-asset">Gold (INR)</td>
          <td class="td-highlight">~12–15%</td>
          <td>Hedge, crisis insurance, INR depreciation buffer</td>
          <td>Long dormant periods, no yield</td>
          <td>
            <div class="bar-cell">
              <div class="bar-bg"><div class="bar-fill b-gold" style="width:90%"></div></div>
              <span style="font-size:12px;color:var(--gold)">High</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="td-asset">Debt Mutual Funds</td>
          <td>~7–8%</td>
          <td>Stability, liquidity, reduced drawdown</td>
          <td>Interest rate risk, credit risk</td>
          <td>
            <div class="bar-cell">
              <div class="bar-bg"><div class="bar-fill b-blue" style="width:50%"></div></div>
              <span style="font-size:12px;color:var(--blue)">Moderate</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="td-asset">Fixed Deposits / Bank Savings</td>
          <td>~6–7%</td>
          <td>Emergency fund, capital preservation</td>
          <td>Inflation erosion, tax drag</td>
          <td>
            <div class="bar-cell">
              <div class="bar-bg"><div class="bar-fill b-muted" style="width:38%"></div></div>
              <span style="font-size:12px;color:#888">Lower</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="td-asset">Real Estate</td>
          <td>~7–8%</td>
          <td>Long-term store of value, income</td>
          <td>Illiquidity, concentration risk</td>
          <td>
            <div class="bar-cell">
              <div class="bar-bg"><div class="bar-fill b-muted2" style="width:45%"></div></div>
              <span style="font-size:12px;color:#aaa">Moderate</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p style="font-size:13px;color:var(--ink-faint);margin-top:-20px;">Note: Return ranges reflect variation across measurement periods and methodologies cited in sources. FundsIndia Research (2025), BusinessToday (2024), Mirae Asset MF data.</p>

  <!-- SECTION 3 -->
  <h2 class="section-head">Gold's Unique Role for Indian Investors</h2>

  <p>Gold occupies a position in Indian portfolios that is unlike any other market. Indian households hold an estimated 25,000 tonnes of gold — more than the combined gold reserves of the world's central banks. This cultural affinity is financially justified by the data.</p>

  <p>Over the 20 years to 2025, gold delivered approximately 15% CAGR in rupee terms against the Nifty 50's 13.5%, according to FundsIndia Research. Over shorter periods like the five years to 2025, gold's CAGR reached 23.2%. But these headline numbers can be misleading if studied in isolation.</p>

  <div class="myth-fact-grid">
    <div class="myth-col">
      <div class="myth-head">⚠ Common Misconception</div>
      <p>"Gold has beaten equities recently, so I should shift most of my portfolio to gold."</p>
    </div>
    <div class="fact-col">
      <div class="fact-head">✓ What the data shows</div>
      <p>Between 1980 and 2000, gold lost over 61% of its value in USD over 20.5 years. In INR, no negative decade has occurred (rupee depreciation provides a cushion), but gold regularly lies dormant for 3–5 year stretches. PrimeInvestor's rolling return analysis shows gold averages 9–10% CAGR over 10-year periods — healthy, but below long-run equity returns.</p>
    </div>
  </div>

  <p>What gold does uniquely well is reduce portfolio drawdown during equity crises. In 2008, when the Nifty 50 fell over 50%, gold in rupees rose significantly. A portfolio that held 10–15% gold sustained a materially smaller drawdown than a pure equity portfolio. For Indian investors, gold also provides a natural hedge against INR depreciation — as the rupee weakens against the dollar, domestic gold prices rise correspondingly. Capitalmind's analysis shows that a 50:50 portfolio of gold and Nifty 50, rebalanced annually, outperformed standalone investments in either asset over two decades — the magic of combining negatively correlated assets.</p>

  <!-- SECTION 4 -->
  <h2 class="section-head">The Maths of Allocation: Three Hypothetical Portfolios</h2>

  <p>To make the allocation question concrete, consider three Indian investors who each invested ₹10 lakh in 2005 and held their allocation for 20 years. The difference in outcome is driven almost entirely by asset allocation — all three owned the same underlying Nifty 50 index fund for their equity portion.</p>

  <div class="scenario-grid">
    <div class="scenario-card">
      <div class="scenario-badge">Concentrated</div>
      <div class="scenario-name">Equity-Only</div>
      <div class="alloc-visual">
        <div class="alloc-seg seg-eq" style="flex:9">Eq 90%</div>
        <div class="alloc-seg seg-cash" style="flex:1">10</div>
      </div>
      <div class="scenario-alloc">90% Nifty 50 index · 10% liquid fund</div>
      <div class="scenario-result">~₹85–95L</div>
      <div class="scenario-note">Higher terminal value but experienced −50% drawdown in 2008. Required iron nerve to stay invested.</div>
    </div>
    <div class="scenario-card featured">
      <div class="scenario-badge">Balanced</div>
      <div class="scenario-name">Classic 60/20/20</div>
      <div class="alloc-visual">
        <div class="alloc-seg seg-eq" style="flex:6">Eq 60%</div>
        <div class="alloc-seg seg-debt" style="flex:2">Debt</div>
        <div class="alloc-seg seg-gold" style="flex:2">Gold</div>
      </div>
      <div class="scenario-alloc">60% Nifty 50 · 20% debt funds · 20% gold</div>
      <div class="scenario-result">~₹80–90L</div>
      <div class="scenario-note">Comparable terminal corpus. Max drawdown roughly half the equity-only portfolio. Stayed course through 2008 and COVID with far less stress.</div>
    </div>
    <div class="scenario-card">
      <div class="scenario-badge">Conservative</div>
      <div class="scenario-name">40/40/20</div>
      <div class="alloc-visual">
        <div class="alloc-seg seg-eq" style="flex:4">Eq 40%</div>
        <div class="alloc-seg seg-debt" style="flex:4">Debt 40%</div>
        <div class="alloc-seg seg-gold" style="flex:2">Gold</div>
      </div>
      <div class="scenario-alloc">40% Nifty 50 · 40% debt funds · 20% gold</div>
      <div class="scenario-result">~₹50–60L</div>
      <div class="scenario-note">Significantly lower terminal value. Appropriate for investors within 5–7 years of a major financial goal. Not a default allocation for wealth creation.</div>
    </div>
  </div>

  <p>The striking insight from this exercise is how close the 60/20/20 portfolio's corpus comes to the 90% equity portfolio's — while delivering roughly half the peak drawdown. The balanced investor was far more likely to stay the course, avoid panic-selling at the bottom, and actually realise those returns. Behavioural endurance is itself an asset that deserves to be allocated for.</p>

  <!-- SECTION 5 -->
  <h2 class="section-head">The AMFI Picture: How India's ₹82 Lakh Crore Industry Allocates</h2>

  <p>Understanding where sophisticated institutional flows are going provides a useful calibration for individual investors. As of February 2026, the Indian mutual fund industry crossed ₹82 lakh crore in AUM — more than six times its size a decade ago, and roughly three times its size in 2021, according to AMFI's latest data.</p>

  <div class="chart-block">
    <div class="chart-title">Indian mutual fund AUM composition — March 2025 (AMFI Annual Report)</div>
    <div class="chart-sub">Equity's rising share reflects a structural shift in household savings from physical assets to financial instruments.</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center;">
      <div style="position:relative;width:100%;height:220px;">
        <canvas id="aum-chart"></canvas>
      </div>
      <div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
            <span style="width:12px;height:12px;border-radius:2px;background:#126b5e;flex-shrink:0;display:inline-block;"></span>
            <span style="color:var(--ink-muted);">Equity-oriented — <strong style="color:var(--ink)">~46%</strong> of AUM (₹30+ L Cr)</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
            <span style="width:12px;height:12px;border-radius:2px;background:#1a4f8a;flex-shrink:0;display:inline-block;"></span>
            <span style="color:var(--ink-muted);">Debt-oriented — <strong style="color:var(--ink)">~23%</strong> of AUM (₹15+ L Cr)</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
            <span style="width:12px;height:12px;border-radius:2px;background:#c8900a;flex-shrink:0;display:inline-block;"></span>
            <span style="color:var(--ink-muted);">Hybrid funds — <strong style="color:var(--ink)">~13%</strong> of AUM (₹8.83 L Cr)</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
            <span style="width:12px;height:12px;border-radius:2px;background:#7a7268;flex-shrink:0;display:inline-block;"></span>
            <span style="color:var(--ink-muted);">Passive/ETF — <strong style="color:var(--ink)">~17%</strong></span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
            <span style="width:12px;height:12px;border-radius:2px;background:#c0bdb5;flex-shrink:0;display:inline-block;"></span>
            <span style="color:var(--ink-muted);">Others — <strong style="color:var(--ink)">~1%</strong></span>
          </div>
        </div>
        <p style="font-size:12px;color:var(--ink-faint);margin-top:14px;max-width:none;">Notably, SIP contributions jumped 45% year-on-year in FY25 to ₹2.89 lakh crore, demonstrating a structural shift toward disciplined, allocation-aware investing.</p>
      </div>
    </div>
    <div class="chart-source">Source: AMFI Annual Report FY2025, AMFI Monthly Note.</div>
  </div>

  <p>Two trends from the AMFI data deserve particular attention. First, hybrid funds — those that hold a mandated mix of equity and debt — grew 22% year-on-year to ₹8.83 lakh crore in March 2025, with multi-asset allocation funds growing 153% in FY24. Indian investors are increasingly choosing funds that force asset allocation discipline, rather than doing it themselves across separate funds. Second, Gold ETFs demonstrated resilience in December 2024 when equity markets corrected — a real-time validation of gold's diversification role.</p>

  <!-- SECTION 6 -->
  <h2 class="section-head">Allocation Frameworks for Different Investor Profiles</h2>

  <p>There is no universally correct asset allocation. The appropriate mix depends on three factors: investment horizon, income stability, and the specific financial goal being funded. Below are starting-point frameworks for four common Indian investor profiles. These are illustrative, not prescriptive — a SEBI-registered investment advisor should be consulted before implementing any allocation.</p>

  <div class="profile-strip">
    <div class="profile-card">
      <div class="profile-icon">👨‍💼</div>
      <div class="profile-name">Young Professional (25–35)</div>
      <div class="profile-desc">15–20 year horizon. Steady income. Accumulation phase.</div>
      <div class="profile-alloc-row">Equity <span>65–70%</span></div>
      <div class="profile-alloc-row">Debt Funds <span>15–20%</span></div>
      <div class="profile-alloc-row">Gold <span>10%</span></div>
      <div class="profile-alloc-row">Emergency Cash <span>5%</span></div>
    </div>
    <div class="profile-card">
      <div class="profile-icon">👨‍👩‍👧</div>
      <div class="profile-name">Family (35–50)</div>
      <div class="profile-desc">10–15 yr horizon. Education / retirement goals. Dual income.</div>
      <div class="profile-alloc-row">Equity <span>55–60%</span></div>
      <div class="profile-alloc-row">Debt Funds <span>25–30%</span></div>
      <div class="profile-alloc-row">Gold <span>10–15%</span></div>
      <div class="profile-alloc-row">Cash / FD <span>5%</span></div>
    </div>
    <div class="profile-card">
      <div class="profile-icon">🌍</div>
      <div class="profile-name">NRI (Any Age)</div>
      <div class="profile-desc">India-linked goals. INR/USD currency consideration. Remittance planning.</div>
      <div class="profile-alloc-row">Indian Equity <span>40–50%</span></div>
      <div class="profile-alloc-row">Debt Funds <span>20–25%</span></div>
      <div class="profile-alloc-row">Gold ETF <span>15%</span></div>
      <div class="profile-alloc-row">International Equity <span>15–20%</span></div>
    </div>
    <div class="profile-card">
      <div class="profile-icon">🧓</div>
      <div class="profile-name">Pre-Retiree (50–60)</div>
      <div class="profile-desc">5–10 yr horizon. Capital preservation. Income generation.</div>
      <div class="profile-alloc-row">Equity <span>35–40%</span></div>
      <div class="profile-alloc-row">Debt Funds <span>40–45%</span></div>
      <div class="profile-alloc-row">Gold <span>10%</span></div>
      <div class="profile-alloc-row">Liquid / FD <span>10%</span></div>
    </div>
  </div>

  <div class="callout">
    <div class="callout-head">Special Note for NRI Investors</div>
    <p>NRIs face an additional layer of allocation complexity. Rupee depreciation has historically added 3–4% per year to gold's INR returns — a benefit that partially compensates for currency risk on INR-denominated assets. NRIs with goals in India (property purchase, retirement, children's education) can treat their NRE/NRO fixed deposits as their debt allocation, while Gold ETFs (held in a demat account through an NRE-linked brokerage) provide the gold exposure without physical storage concerns. For NRIs with goals in their country of residence, maintaining separate local-currency allocations to avoid currency mismatch risk is essential.</p>
  </div>

  <!-- SECTION 7 -->
  <h2 class="section-head">Rebalancing: The Discipline That Compounds</h2>

  <p>An asset allocation is not a one-time decision. Markets drift allocations over time. After an equity bull run, a 60/20/20 portfolio might drift to 75/15/10 — concentrating risk precisely when valuations are extended. Annual rebalancing — selling the outperformer and buying the underperformer — is the mechanical embodiment of "buy low, sell high" without requiring any market-timing skill.</p>

  <h3 class="sub-head">A sample rebalancing review — December 2024</h3>
  <p>Consider an investor who set a 60% equity / 20% debt / 20% gold target. After the equity market's 2024 run and gold's strong performance, their portfolio has drifted:</p>

  <div class="rebal-table">
    <div class="rebal-row header">
      <div>Asset Class</div>
      <div>Target</div>
      <div>Actual</div>
      <div>Action</div>
    </div>
    <div class="rebal-row">
      <div class="td-asset">Indian Equity (Nifty 50 Index Fund)</div>
      <div>60%</div>
      <div>68%</div>
      <div class="action-sell">Trim ↓</div>
    </div>
    <div class="rebal-row">
      <div class="td-asset">Debt Funds (Short Duration)</div>
      <div>20%</div>
      <div>16%</div>
      <div class="action-buy">Add ↑</div>
    </div>
    <div class="rebal-row">
      <div class="td-asset">Gold ETF</div>
      <div>20%</div>
      <div>16%</div>
      <div class="action-buy">Add ↑</div>
    </div>
  </div>

  <p>The rebalancing action here is counterintuitive: selling equity after a good run and adding to debt and gold when both have underperformed. This is precisely the point — systematic rebalancing enforces contrarian discipline that most investors abandon when driven by recency bias. Capitalmind's research shows that an annually rebalanced 50/50 gold and equity portfolio outperformed buy-and-hold positions in either asset alone over two decades — the compounding benefit of systematic rebalancing.</p>

  <!-- SECTION 8 -->
  <h2 class="section-head">What Stock Picking Actually Contributes</h2>

  <p>This article should not be read as dismissing active stock selection entirely. Within the equity portion of a well-structured portfolio, active management can add value — particularly in India's mid- and small-cap space where market inefficiencies persist. The Nifty Midcap 150 TRI has delivered a 20-year CAGR of 16.5%, materially ahead of the Nifty 50's 13–14% over the same period, according to FundsIndia Research (2025).</p>

  <p>But there is an ordering that matters. First, get the allocation right. Second, implement efficiently through index funds or quality actively managed funds. Third, if you wish to hold individual stocks, limit them to 5–10% of the equity allocation — the portion where your research edge, if any, can add value without threatening the portfolio's structural integrity.</p>

  <div class="pull-quote">
    <p>"Most investors reverse this order. They spend 95% of their energy on stock selection and 5% on allocation. Evidence-based investors do the opposite."</p>
    <cite>A principle applicable to Indian, NRI, and global portfolios equally</cite>
  </div>

  <p>Market corrections of 10–20% occur almost every single year in Indian markets, yet 75–80% of calendar years end positively for the Nifty 50. Large declines over 30% have historically recovered within one to three years, often followed by strong upside. The investor who panics and sells during corrections — typically the investor over-concentrated in a handful of speculative stocks — is the one who destroys the compounding engine. A well-allocated, diversified portfolio is the structural guardrail against that behaviour.</p>

  <!-- CLOSING -->
  <div class="chapter-div"></div>

  <h2 class="section-head" style="margin-top:48px;">The Takeaway for Indian Families</h2>

  <p>The Indian mutual fund industry's six-fold growth in a decade — from ₹12 lakh crore in 2016 to ₹82 lakh crore in 2026 — represents a fundamental transformation in how Indian households build wealth. The investors who have benefited most are not those who picked the best stocks. They are those who committed to an allocation, systematised their contributions through SIPs, and stayed invested through noise.</p>

  <p>Three conclusions from the data are worth keeping close:</p>

  <p><strong>1. Time in market matters far more than timing.</strong> A ₹1 lakh investment in Nifty 50 in 1991 would have grown to approximately ₹64 lakh by early 2026 — a 35-year CAGR of 12.7% through every crisis imaginable. The compounding only worked for investors who stayed.</p>

  <p><strong>2. Gold is not optional for Indian investors.</strong> The combination of cultural relevance, INR depreciation hedging, and negative correlation to equities makes a 10–20% gold allocation mathematically defensible and behaviorally valuable for Indian households.</p>

  <p><strong>3. Allocation is a decision, not a default.</strong> Most Indian investors hold 60–70% of their wealth in real estate and bank deposits by default — not by design. That is itself an allocation: one heavily concentrated in low-returning, illiquid assets. An explicit, evidence-based allocation to equity, debt, and gold is not an aggressive move. It is a correction of a structural imbalance that erodes real wealth over time.</p>

  <p>Begin with the allocation. Let it compound. That is the work.</p>

</div>
</div>



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
