import { ScrollReveal } from "@/components/ScrollReveal";
import philosophyImage from "@/assets/philosophy-abstract.jpg";

const pillars = [
  "Understanding your life goals with depth and care",
  "Assessing your complete financial position objectively",
  "Designing disciplined investment strategies built for the long term",
  "Supporting you through changing markets and evolving life stages",
];

export const PhilosophySection = () => (
  <section className="py-28 md:py-40 bg-card overflow-hidden">
    <div className="container mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <ScrollReveal direction="left">
          <div className="relative">
            <img
              src={philosophyImage}
              alt="Abstract representation of financial balance"
              className="w-full aspect-square object-cover"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-accent/30" />
          </div>
        </ScrollReveal>
        <div>
          <ScrollReveal direction="right">
            <p className="label-caps text-accent tracking-[0.15em] mb-4">Our Philosophy</p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary mb-8 text-balance">
              Financial Advice Without Product Bias
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              Most financial advice today is driven by product distribution — advisors earn commissions from the products they sell. Balancing Act is fundamentally different. We do not sell financial products. Our only commitment is to your financial well-being.
            </p>
          </ScrollReveal>
          <div className="space-y-4">
            {pillars.map((item, i) => (
              <ScrollReveal key={i} delay={i * 100} direction="right">
                <div className="flex items-start gap-4 p-5 border-l-2 border-accent/30 hover:border-accent hover:bg-background transition-all duration-300">
                  <p className="text-foreground text-sm">{item}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
