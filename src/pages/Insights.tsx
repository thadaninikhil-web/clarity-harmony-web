import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EducationalDisclaimer, MutualFundDisclaimer, SourceAttribution } from "@/components/MutualFundDisclaimer";

const articles = [
  {
    cat: "Investing",
    title: "Why Asset Allocation Matters More Than Stock Picking",
    excerpt: "Historical evidence suggests that long-term portfolio returns are driven primarily by how assets are allocated across asset classes, rather than by individual stock selection.",
    date: "March 2026",
    source: "AMFI / Public Data",
  },
  {
    cat: "Behavioral Finance",
    title: "The Psychology of Selling During Market Declines",
    excerpt: "Understanding why investors may sell during market downturns — and how disciplined planning frameworks can help manage emotional decision-making.",
    date: "February 2026",
    source: "Behavioral Finance Research / Public Data",
  },
  {
    cat: "Financial Planning",
    title: "When Should You Start Planning for Retirement?",
    excerpt: "Starting early allows more time for the potential benefits of compounding. This article explores the role of time horizon in retirement planning.",
    date: "January 2026",
    source: "AMFI / Public Data",
  },
  {
    cat: "Global Investing",
    title: "Why Indian Investors May Consider Looking Beyond Domestic Markets",
    excerpt: "Geographic diversification may help reduce concentration risk and provide access to sectors and companies not available in Indian markets. This is an educational overview, not a recommendation.",
    date: "December 2025",
    source: "AMFI / Scheme Factsheets / Public Data",
  },
  {
    cat: "Market Insights",
    title: "Staying Disciplined During Market Volatility",
    excerpt: "Market corrections are a natural part of investing. This article discusses how a disciplined approach and periodic rebalancing may help navigate volatile periods.",
    date: "November 2025",
    source: "Historical Market Data / Public Data",
  },
  {
    cat: "Financial Planning",
    title: "The Potential Impact of Delaying Financial Planning",
    excerpt: "Delaying planning may affect not just potential investment growth, but also tax efficiency, insurance adequacy, and goal clarity. An educational perspective on starting early.",
    date: "October 2025",
    source: "AMFI / Public Data",
  },
];

const Insights = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-8">
      <div className="container mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <p className="label-caps text-gold mb-4">Knowledge</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance max-w-3xl">
            Insights
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
            Perspectives on investing, financial planning, and building long-term wealth.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={50}>
          <EducationalDisclaimer className="max-w-2xl mb-4" />
        </ScrollReveal>
      </div>
    </section>
    <section className="pb-8">
      <div className="container mx-auto px-6 lg:px-8">
        <MutualFundDisclaimer variant="inline" className="max-w-2xl" />
      </div>
    </section>
    <section className="pb-24 md:pb-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {articles.map((a, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div className="bg-background p-8 h-full hover:bg-cream-dark transition-colors duration-300 group cursor-pointer">
                <p className="label-caps text-gold/60 mb-4">{a.cat}</p>
                <h2 className="font-display text-xl font-semibold text-primary mb-4 group-hover:text-gold transition-colors duration-300">
                  {a.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{a.excerpt}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground/60">{a.date}</p>
                  <SourceAttribution source={a.source} />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Insights;
