import { ScrollReveal } from "@/components/ScrollReveal";

const steps = [
  { num: "01", title: "Discover Your Goals", desc: "We listen deeply to understand what matters most to you." },
  { num: "02", title: "Assess Your Financial Position", desc: "A comprehensive review of your current financial landscape." },
  { num: "03", title: "Portfolio & Risk Analysis", desc: "Understanding your risk capacity and current asset allocation." },
  { num: "04", title: "Personalized Financial Strategy", desc: "A tailored plan built around your unique circumstances." },
  { num: "05", title: "Execution Support", desc: "Hands-on implementation of the strategy with discipline." },
  { num: "06", title: "Ongoing Monitoring", desc: "Regular reviews and adjustments as life unfolds." },
];

export const FrameworkSection = () => (
  <section className="py-28 md:py-40 bg-primary text-primary-foreground overflow-hidden">
    <div className="container mx-auto px-6 lg:px-8">
      <ScrollReveal>
        <div className="max-w-2xl mb-20">
          <p className="label-caps text-accent tracking-[0.15em] mb-4">Our Framework</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-accent text-balance">
            The Balancing Act Financial Framework
          </h2>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
        {steps.map((step, i) => (
          <ScrollReveal key={i} delay={i * 90}>
            <div className="border border-primary-foreground/8 p-10 h-full group hover:bg-primary-foreground/5 transition-colors duration-500">
              <span className="font-body text-sm font-semibold tracking-[0.2em] text-accent/30 uppercase">Step {step.num}</span>
              <h3 className="font-display text-xl font-medium text-accent mt-6 mb-4">{step.title}</h3>
              <p className="text-sm text-primary-foreground/50">{step.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal delay={600}>
        <div className="mt-20 text-center">
          <div className="w-16 h-px bg-accent/30 mx-auto mb-8" />
          <p className="font-display italic text-xl md:text-2xl text-accent/70 max-w-2xl mx-auto">
            Financial planning is not a one-time activity. It is a continuous journey.
          </p>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
