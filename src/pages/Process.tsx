import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const steps = [
  { num: "01", title: "Discover Your Goals", desc: "We begin every engagement by listening deeply. What do you want your money to do for you? What does financial success look like in your life? We help you discover and articulate goals you may not even have considered." },
  { num: "02", title: "Assess Your Financial Position", desc: "A comprehensive review of your income, expenses, assets, liabilities, insurance, and tax situation. We build a complete picture of where you stand today." },
  { num: "03", title: "Portfolio & Risk Analysis", desc: "We analyze your existing investments for diversification, cost efficiency, and alignment with your goals. We assess your risk capacity — not just your risk tolerance." },
  { num: "04", title: "Personalized Financial Strategy", desc: "Based on your goals and current position, we design a clear, actionable financial plan. This includes asset allocation, investment strategy, tax optimization, and insurance review." },
  { num: "05", title: "Execution Support", desc: "We guide you through implementing the strategy with discipline. We don't sell products — we help you execute through the platforms and instruments that best serve your interests." },
  { num: "06", title: "Ongoing Monitoring & Guidance", desc: "Markets change. Life changes. We provide regular reviews, portfolio rebalancing, and continuous guidance to keep your plan on track through every season." },
];

const Process = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-16">
      <div className="container mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <p className="label-caps text-gold mb-4">How We Work</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance max-w-3xl">
            The Financial Planning Process
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Financial planning is not a one-time event. It's a structured, ongoing process that evolves with your life.
          </p>
        </ScrollReveal>
      </div>
    </section>
    <section className="pb-24 md:pb-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl space-y-0">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="border-b border-border py-12 flex gap-8">
                <span className="font-display text-3xl font-semibold text-gold/30 shrink-0">{step.num}</span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-primary mb-3">{step.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={500}>
          <div className="mt-16">
            <Button variant="hero" size="xl" asChild>
              <Link to="/book">Begin Your Journey <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
    <Footer />
  </div>
);

export default Process;
