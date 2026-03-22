import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight } from "lucide-react";

export const FinalCTA = () => (
  <section className="py-28 md:py-40 bg-primary relative overflow-hidden">
    {/* Decorative elements */}
    <div className="absolute top-0 left-0 w-64 h-64 border border-accent/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-96 h-96 border border-accent/5 rounded-full translate-x-1/3 translate-y-1/3" />

    <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
      <ScrollReveal>
        <div className="w-16 h-px bg-accent/30 mx-auto mb-10" />
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-accent mb-8 text-balance max-w-3xl mx-auto">
          Start Your Financial Planning Journey
        </h2>
        <p className="text-lg text-primary-foreground/50 mb-12 max-w-md mx-auto">
          Financial clarity begins with a conversation.
        </p>
        <Button variant="gold" size="xl" asChild>
          <Link to="/book">Book a Discovery Call <ArrowRight className="w-4 h-4 ml-1" /></Link>
        </Button>
      </ScrollReveal>
    </div>
  </section>
);
