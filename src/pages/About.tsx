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
              For the better part of two decades, I observed the financial services industry from the inside — and saw both its strengths and its contradictions.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-justify">
              I met many experienced professionals who genuinely wanted to help their clients. Yet the system often created quiet conflicts: advice was shaped by the products that paid commissions rather than by what families truly needed.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-justify">
              Over time, the consequences were apparent. Complex financial decisions reduced to product choices. Long-term goals sidelined by short-term recommendations. Mistakes that could have been avoided if someone had simply started with the client's life instead of the market.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={250}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-justify">
              My own journey took a different path. I made my share of mistakes along the way, learned from them, and realigned my approach to money and investing. At 43, I achieved financial independence — not through speculation or shortcuts, but through disciplined asset allocation, patience, and a clear understanding of what I wanted from my financial life.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-justify">
              Balancing Act was created from that experience.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-justify">
              It is built on a simple belief: financial advice should begin with a person's life — their goals, responsibilities, and aspirations — not with a product to sell.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 text-justify">
              Because when planning is thoughtful, disciplined, and aligned with the client's interests, better financial decisions naturally follow.
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
                      <p className="text-sm text-foreground">IIM Ahmedabad (PGPX — One Year Full Time MBA)</p>
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
                "Trust and integrity build lifelong partnerships",
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
