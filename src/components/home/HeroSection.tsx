import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MutualFundDisclaimer } from "@/components/MutualFundDisclaimer";
import heroImage from "@/assets/hero-abstract.jpg";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => (
  <section className="relative min-h-[100svh] flex flex-col pt-28 pb-0">
    <div className="container mx-auto px-6 lg:px-8 flex-1 flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
        <div className="lg:col-span-7 space-y-10">
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <p className="label-caps text-accent tracking-[0.15em] mb-2 text-left">Clarity &bull; Stability &bull; Prosperity</p>
            <div className="w-16 h-0.5 bg-accent mt-4" />
          </div>
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-semibold text-primary text-balance animate-reveal-up"
            style={{ animationDelay: "350ms" }}
          >
            Achieve Balance in
            <br />
            Your Financial Life
          </h1>
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "550ms" }}>
            <p className="font-display italic text-xl md:text-2xl text-primary/70 text-left">
              Human Financial Wisdom in the Age of AI.
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg">
              Balancing Act helps clients discover their financial goals, understand their financial position, and build disciplined investment strategies that stand the test of time.
            </p>
            <p className="text-sm text-muted-foreground/80 max-w-lg italic">
              We harness AI for research and tools — but your financial journey is guided by human understanding, because money is deeply personal.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "700ms" }}>
            <Button variant="gold" size="xl" className="bg-foreground text-background hover:bg-foreground/90" asChild>
              <Link to="/book">Book a Discovery Call</Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/insights">
                Explore Insights <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="lg:col-span-5 animate-slide-up" style={{ animationDelay: "800ms" }}>
          <div className="relative">
            <div className="absolute -inset-4 border border-gold/30" />
            <img
              src={heroImage}
              alt="Abstract architectural light and shadow"
              className="w-full aspect-[4/5] object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-gold/10" />
          </div>
        </div>
      </div>
    </div>
    <div className="mt-16">
      <MutualFundDisclaimer variant="banner" />
    </div>
  </section>
);
