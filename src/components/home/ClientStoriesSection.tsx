import { ScrollReveal } from "@/components/ScrollReveal";
import storyImage from "@/assets/story-planning.jpg";

const testimonials = [
  {
    situation: "A senior IT professional in Bengaluru with scattered investments across 15 mutual funds, 3 insurance policies, and no clear retirement plan.",
    strategy: "Consolidated the portfolio, eliminated underperforming funds, and designed a goal-based investment strategy aligned with early retirement at 50.",
    outcome: "Achieved clarity on retirement corpus, reduced portfolio overlap by 70%, and is now on track to retire 5 years earlier than planned.",
  },
  {
    situation: "An NRI couple in Dubai wanting to build a diversified portfolio across India and global markets while planning for their children's education.",
    strategy: "Created a cross-border investment plan balancing Indian equities, global ETFs, and education-specific savings instruments with tax-efficient structures.",
    outcome: "Built a ₹2.5 Cr education fund on track for 2031, with clear visibility into global asset allocation and repatriation planning.",
  },
  {
    situation: "A family business owner with no separation between personal and business finances, and significant concentration risk in a single asset class.",
    strategy: "Separated personal wealth from business assets, introduced systematic diversification, and established a succession plan.",
    outcome: "Personal wealth grew independently of business performance, with a clear estate plan that protects both the family and the enterprise.",
  },
];

export const ClientStoriesSection = () => (
  <section className="py-28 md:py-40 overflow-hidden">
    <div className="container mx-auto px-6 lg:px-8">
      {/* Visual storytelling banner */}
      <ScrollReveal>
        <div className="relative mb-20 overflow-hidden">
          <img
            src={storyImage}
            alt="Financial planning consultation"
            className="w-full h-64 md:h-80 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <p className="label-caps text-accent tracking-[0.15em] mb-4">Results That Matter</p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold text-accent text-balance">
                Client Stories
              </h2>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <ScrollReveal key={i} delay={i * 120}>
            <div className="border border-border p-10 h-full flex flex-col group hover:border-accent/20 transition-colors duration-500">
              <div className="mb-8">
                <p className="label-caps text-accent/50 mb-3">Situation</p>
                <p className="text-sm text-muted-foreground">{t.situation}</p>
              </div>
              <div className="mb-8">
                <p className="label-caps text-accent/50 mb-3">Strategy</p>
                <p className="text-sm text-muted-foreground">{t.strategy}</p>
              </div>
              <div className="mt-auto pt-8 border-t border-border">
                <p className="label-caps text-accent/50 mb-3">Outcome</p>
                <p className="text-sm text-foreground font-medium">{t.outcome}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
