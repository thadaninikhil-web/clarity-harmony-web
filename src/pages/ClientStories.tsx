import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const stories = [
  {
    title: "From Scattered to Structured",
    situation: "A senior IT professional in Bengaluru with investments scattered across 15 mutual funds, 3 insurance-cum-investment policies, and no clear retirement plan. Portfolio had significant overlap and high expense ratios.",
    strategy: "Consolidated the portfolio to 5 well-diversified funds, surrendered underperforming ULIPs, and designed a goal-based investment strategy aligned with early retirement at 50. Introduced systematic rebalancing.",
    outcome: "Achieved clarity on retirement corpus requirement, reduced portfolio overlap by 70%, cut annual fund expenses by ₹1.2L, and is now on track to retire 5 years earlier than originally planned.",
  },
  {
    title: "Cross-Border Clarity",
    situation: "An NRI couple in Dubai with significant savings but no structured investment plan. Confusion around Indian vs. international investing, tax implications, and future repatriation of funds. Children's education funding was a growing concern.",
    strategy: "Created a comprehensive cross-border investment plan balancing Indian equities, global ETFs, and education-specific savings instruments. Established a clear tax-efficient structure for both NRE and NRO accounts.",
    outcome: "Built a ₹2.5 Cr education fund on track for 2031, with clear visibility into global asset allocation, repatriation planning, and tax-optimized returns across both jurisdictions.",
  },
  {
    title: "Business to Personal Separation",
    situation: "A family business owner with no separation between personal and business finances. 80% of net worth concentrated in the business. No succession plan, no independent retirement corpus, and inadequate life insurance.",
    strategy: "Separated personal wealth from business assets through systematic SIPs and diversified portfolio construction. Introduced adequate term insurance, created a succession plan, and established a family governance framework.",
    outcome: "Personal wealth now grows independently of business performance. Clear succession plan in place. Adequate insurance coverage. Family members aligned on wealth transfer and business continuity planning.",
  },
];

const ClientStories = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-16">
      <div className="container mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <p className="label-caps text-gold mb-4">Results</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance max-w-3xl">
            Client Stories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Real planning journeys that demonstrate the impact of disciplined, unbiased financial advice.
          </p>
        </ScrollReveal>
      </div>
    </section>
    <section className="pb-24 md:pb-32">
      <div className="container mx-auto px-6 lg:px-8 space-y-16">
        {stories.map((s, i) => (
          <ScrollReveal key={i} delay={i * 100}>
            <div className="border border-border p-8 md:p-12">
              <h2 className="font-display text-2xl font-semibold text-primary mb-8">{s.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="label-caps text-gold/60 mb-3">Situation</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.situation}</p>
                </div>
                <div>
                  <p className="label-caps text-gold/60 mb-3">Strategy</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.strategy}</p>
                </div>
                <div>
                  <p className="label-caps text-gold/60 mb-3">Outcome</p>
                  <p className="text-sm text-foreground font-medium leading-relaxed">{s.outcome}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
        <ScrollReveal delay={300}>
          <div className="text-center mt-8">
            <p className="text-lg text-muted-foreground mb-6">Your story begins with a conversation.</p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/book">Book a Discovery Call <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
    <Footer />
  </div>
);

export default ClientStories;
