import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Target, PieChart, Globe, Shield, Calculator, Users, BarChart3,
} from "lucide-react";

const services = [
  { icon: Target, title: "Goal Based Financial Planning", desc: "Align your investments with your life's most meaningful milestones." },
  { icon: PieChart, title: "Portfolio Review & Asset Allocation", desc: "Evaluate your existing portfolio for appropriate risk-adjusted allocation." },
  { icon: Globe, title: "Global Investing", desc: "Access international markets with a disciplined, diversified approach." },
  { icon: Shield, title: "Insurance Planning", desc: "Ensure adequate protection without over-insuring or under-insuring." },
  { icon: Calculator, title: "Tax Planning", desc: "Minimize tax liability through strategic, compliant planning." },
  { icon: Users, title: "Succession & Estate Planning", desc: "Preserve and transfer wealth across generations with clarity." },
  { icon: BarChart3, title: "Ongoing Financial Life Management", desc: "Continuous review as your life, markets, and goals evolve." },
];

export const ServicesSection = () => (
  <section className="py-28 md:py-40">
    <div className="container mx-auto px-6 lg:px-8">
      <ScrollReveal>
        <div className="max-w-2xl mb-20">
          <p className="label-caps text-accent tracking-[0.15em] mb-4">What We Do</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary text-balance">
            Comprehensive Financial Planning
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl">
            Every engagement is built on the principle that financial decisions should be unbiased, disciplined, and deeply personal.
          </p>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
        {services.map((s, i) => (
          <ScrollReveal key={i} delay={i * 70}>
            <div className="bg-background p-10 h-full group cursor-default hover:bg-cream-dark transition-colors duration-500">
              <div className="w-12 h-12 flex items-center justify-center border border-accent/20 mb-8 group-hover:border-accent group-hover:bg-accent/5 transition-all duration-500">
                <s.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
