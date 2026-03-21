import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, LineChart, Compass, Globe, Heart, ArrowRight } from "lucide-react";

const segments = [
  { icon: Briefcase, title: "Young Professionals", desc: "You're in the early years of your career and want to start building wealth the right way. We help you set clear financial goals, create a savings discipline, and invest with a long-term mindset from the very beginning.", color: "text-gold" },
  { icon: LineChart, title: "Senior Professionals", desc: "You've built a strong career and significant assets. Now you need a clear path to financial independence. We help you optimize your portfolio, plan for retirement, and make smart decisions about stock options, bonuses, and benefits.", color: "text-gold" },
  { icon: Compass, title: "Business Owners", desc: "Your financial life is intertwined with your business. We help you separate personal wealth from business assets, plan for succession, and build a safety net independent of your enterprise.", color: "text-gold" },
  { icon: Globe, title: "NRIs", desc: "Managing finances across borders adds complexity — taxation, repatriation, global asset allocation, and regulatory compliance. We provide clarity on cross-border investing and help you build globally diversified portfolios.", color: "text-gold" },
  { icon: Heart, title: "Families", desc: "Whether you're planning for your children's education, managing inherited wealth, or thinking about long-term preservation, we help families build a financial legacy that endures across generations.", color: "text-gold" },
];

const WhoWeWorkWith = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-16">
      <div className="container mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <p className="label-caps text-gold mb-4">Our Clients</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance max-w-3xl">
            Who We Work With
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            We partner with individuals and families who value clarity, discipline, and long-term thinking in their financial lives.
          </p>
        </ScrollReveal>
      </div>
    </section>
    <section className="pb-24 md:pb-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="space-y-0">
          {segments.map((seg, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="border-b border-border py-12 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 flex items-start gap-4">
                  <seg.icon className="w-6 h-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <h2 className="font-display text-2xl font-semibold text-primary">{seg.title}</h2>
                </div>
                <div className="md:col-span-8">
                  <p className="text-muted-foreground leading-relaxed">{seg.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={400}>
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground mb-6">See yourself here?</p>
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

export default WhoWeWorkWith;
