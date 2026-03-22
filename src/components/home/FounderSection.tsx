import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight } from "lucide-react";
import founderImage from "@/assets/founder-portrait.jpg";

const credentials = [
  "22+ years of personal investing experience",
  "Achieved financial independence at 43",
  "Commitment to ethical, unbiased advice",
  "Strong discipline around asset allocation",
  "Long-term client partnerships built on trust",
];

export const FounderSection = () => (
  <section className="py-28 md:py-40 bg-cream-dark overflow-hidden">
    <div className="container mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <ScrollReveal direction="left">
            <div className="relative">
              <img
                src={founderImage}
                alt="Nikhil Thadani, Founder of Balancing Act"
                className="w-full aspect-[3/4] object-cover object-top"
                loading="lazy"
              />
              <div className="absolute -bottom-4 -left-4 w-full h-full border border-accent/20 -z-10" />
            </div>
          </ScrollReveal>
        </div>
        <div className="lg:col-span-7 order-1 lg:order-2">
          <ScrollReveal direction="right">
            <p className="label-caps text-accent tracking-[0.15em] mb-4">The Founder</p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary mb-8 text-balance">
              Why I Started Balancing Act
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              With over 22 years of investing experience and having achieved financial independence at the age of 43, I founded Balancing Act with a simple conviction: financial planning should be about life goals, not products.
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
    </div>
  </section>
);
