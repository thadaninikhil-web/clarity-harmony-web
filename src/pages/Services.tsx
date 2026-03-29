import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, PieChart, Globe, Shield, Calculator, Users, BarChart3, ArrowRight } from "lucide-react";

const services = [
  { icon: Target, title: "Goal Based Financial Planning", desc: "Every engagement starts with your life goals — retirement, children's education, home purchase, financial independence — and works backwards to design an investment strategy that makes them achievable. Every recommendation is anchored to a specific goal." },
  { icon: PieChart, title: "Portfolio Review & Asset Allocation", desc: "Evaluate your existing portfolio for diversification, cost efficiency, risk alignment, and overlap. Then design an appropriate asset allocation that aims to balance growth with protection, tailored to your unique risk capacity." },
  { icon: Globe, title: "Global Investing", desc: "In an interconnected world, your portfolio shouldn't be limited to one geography. Access international markets through cost-efficient, tax-efficient instruments — building a truly global investment strategy." },
  { icon: Shield, title: "Insurance Planning", desc: "Insurance is about protection, not investment. A thorough review of your existing policies identifies gaps and ensures you have the right coverage — without overpaying for products that don't serve your needs." },
  { icon: Calculator, title: "Tax Planning", desc: "Minimize your tax liability through strategic planning — leveraging deductions, efficient investment structures, and timing strategies that keep more of your wealth working for you." },
  { icon: Users, title: "Succession & Estate Planning", desc: "Create clarity around wealth transfer — nominations, wills, trusts, and family governance structures that protect your legacy and minimize complexity for your loved ones." },
  { icon: BarChart3, title: "Ongoing Financial Life Management", desc: "Financial planning doesn't end with a document. Continuous support through regular reviews, portfolio rebalancing, life-event planning, and proactive adjustments as your world evolves." },
];

const Services = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-16">
      <div className="container mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <p className="label-caps text-gold mb-4">Our Services</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance max-w-3xl">
            Comprehensive Financial Planning
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Every engagement is built on the principle that financial decisions should be unbiased, disciplined, and deeply personal.
          </p>
        </ScrollReveal>
      </div>
    </section>
    <section className="pb-24 md:pb-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="space-y-0">
          {services.map((s, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div className="border-b border-border py-12 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 flex items-start gap-4">
                  <s.icon className="w-6 h-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <h2 className="font-display text-xl font-semibold text-primary">{s.title}</h2>
                </div>
                <div className="md:col-span-8">
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={400}>
          <div className="mt-16">
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

export default Services;
