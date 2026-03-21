import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

const articles = [
  { cat: "Investing", title: "Why Asset Allocation Matters More Than Stock Picking", excerpt: "The evidence is clear: your returns are driven primarily by how you allocate across asset classes, not by which individual stocks you pick.", date: "March 2026" },
  { cat: "Behavioral Finance", title: "The Psychology of Selling at the Bottom", excerpt: "Understanding why investors consistently sell at the worst possible moment — and how to build systems that prevent it.", date: "February 2026" },
  { cat: "Financial Planning", title: "When Should You Start Planning for Retirement?", excerpt: "The answer isn't 'when you're close to retirement.' The earlier you start, the more powerful compounding becomes.", date: "January 2026" },
  { cat: "Global Investing", title: "Why Indian Investors Should Look Beyond Domestic Markets", excerpt: "Geographic diversification reduces concentration risk and provides access to sectors and companies unavailable in India.", date: "December 2025" },
  { cat: "Market Insights", title: "Staying Disciplined During Market Volatility", excerpt: "Market corrections are not emergencies — they're opportunities to rebalance and reinforce your long-term strategy.", date: "November 2025" },
  { cat: "Financial Planning", title: "The True Cost of Delaying Financial Planning", excerpt: "Every year of delay compounds — not just in lost returns, but in missed tax benefits, inadequate insurance, and unclear goals.", date: "October 2025" },
];

const Insights = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-16">
      <div className="container mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <p className="label-caps text-gold mb-4">Knowledge</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance max-w-3xl">
            Insights
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Perspectives on investing, financial planning, and building lasting wealth.
          </p>
        </ScrollReveal>
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
                <p className="text-xs text-muted-foreground/60">{a.date}</p>
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
