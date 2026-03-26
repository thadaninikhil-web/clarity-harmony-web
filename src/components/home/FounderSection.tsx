import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight, Building2, GraduationCap } from "lucide-react";

const credentials = [
  "22+ years of personal investing experience",
  "Achieved financial independence at 43",
  "Commitment to ethical, unbiased decision making",
  "Strong discipline around asset allocation",
  "Long-term client partnerships built on trust",
];

const experience = [
  { icon: Building2, label: "Professional Experience", items: ["BSE (Bombay Stock Exchange)", "Bank of America", "Tata Capital", "TCS"] },
  { icon: GraduationCap, label: "Education", items: ["Chartered Accountant (CA)", "IIM Ahmedabad (PGPX — One Year Full Time MBA)"] },
];

export const FounderSection = () => (
  <section className="py-28 md:py-40 bg-cream-dark overflow-hidden">
    <div className="container mx-auto px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <p className="label-caps text-accent tracking-[0.15em] mb-4">The Founder</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary mb-8 text-balance">
            Why I Started Balancing Act
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl text-justify">
            With over two decades of investing experience and having achieved financial independence at the age of 43, I founded Balancing Act with a simple conviction: financial planning should be about life goals, not products.
          </p>
        </ScrollReveal>

        <div className="space-y-3 mb-12">
          {credentials.map((point, i) => (
            <ScrollReveal key={i} delay={100 + i * 70} direction="right">
              <div className="flex items-center gap-4">
                <div className="w-6 h-px bg-accent shrink-0" />
                <p className="text-foreground text-sm">{point}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Credentials */}
        <ScrollReveal delay={450}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pt-8 border-t border-border">
            {experience.map((section, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-accent/20 shrink-0">
                  <section.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="label-caps text-accent/60 mb-3">{section.label}</p>
                  <div className="space-y-1.5">
                    {section.items.map((item, j) => (
                      <p key={j} className="text-sm text-foreground">{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={500} direction="right">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-px h-12 bg-accent/30" />
            <div>
              <p className="font-display text-xl font-semibold text-primary">Nikhil Thadani</p>
              <p className="text-sm text-muted-foreground">Founder, Balancing Act</p>
            </div>
          </div>
          <Button variant="hero" size="lg" asChild>
            <Link to="/book">Book a Discovery Call <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </ScrollReveal>
      </div>
    </div>
  </section>
);
