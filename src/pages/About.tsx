import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, GraduationCap } from "lucide-react";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-24 md:pb-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl">
          <ScrollReveal>
            <p className="label-caps text-gold mb-4">The Founder</p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-8 text-balance">
              Why I Started Balancing Act
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-justify">
              For over two decades, I observed the financial services industry from the inside. I saw talented people give conflicted advice because their income depended on products, not planning. I saw families make avoidable mistakes because nobody took the time to understand their goals.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-justify">
              I achieved financial independence at the age of 43 — not through speculation or shortcuts, but through disciplined asset allocation, patience, and a clear understanding of what I wanted from my financial life.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 text-justify">
              Balancing Act was born from the conviction that everyone deserves the kind of financial guidance that is rooted in their life — not in product commissions. I believe financial planning should be deeply personal, ethically grounded, and built to last.
            </p>
          </ScrollReveal>

          {/* Credentials */}
          <ScrollReveal delay={320}>
            <div className="border-t border-border pt-10 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex items-center justify-center border border-gold/20 shrink-0">
                    <Building2 className="w-5 h-5 text-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="label-caps text-gold/60 mb-3">Professional Experience</p>
                    <div className="space-y-1.5">
                      <p className="text-sm text-foreground">BSE (Bombay Stock Exchange)</p>
                      <p className="text-sm text-foreground">Bank of America</p>
                      <p className="text-sm text-foreground">Tata Capital</p>
                      <p className="text-sm text-foreground">TCS</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex items-center justify-center border border-gold/20 shrink-0">
                    <GraduationCap className="w-5 h-5 text-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="label-caps text-gold/60 mb-3">Education</p>
                    <div className="space-y-1.5">
                      <p className="text-sm text-foreground">Chartered Accountant (CA)</p>
                      <p className="text-sm text-foreground">IIM Ahmedabad</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={350}>
            <div className="border-t border-border pt-10 space-y-8">
              <h2 className="font-display text-2xl font-semibold text-primary">Core Beliefs</h2>
              {[
                "Financial planning is about life goals, never about products",
                "Asset allocation is the foundation of investment success",
                "Discipline and patience matter more than market timing",
                "Ethical advice builds lifelong partnerships",
                "Transparency is non-negotiable",
              ].map((belief, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 bg-gold mt-2.5 shrink-0" />
                  <p className="text-foreground text-justify">{belief}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={500}>
            <div className="mt-16 p-8 bg-cream-dark">
              <p className="font-display text-xl text-primary mb-1">Nikhil Thadani</p>
              <p className="text-sm text-muted-foreground mb-6">Founder & Financial Planner</p>
              <p className="text-muted-foreground leading-relaxed mb-6 text-justify">
                22+ years of investing experience. SEBI Registered Mutual Fund Distributor. Committed to helping individuals and families achieve financial clarity through unbiased, disciplined planning.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/book">Book a Discovery Call <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default About;
