import { ScrollReveal } from "@/components/ScrollReveal";
import { Briefcase, LineChart, Compass, Globe, Heart } from "lucide-react";

const segments = [
  { icon: Briefcase, title: "Young Turks", desc: "Starting their wealth building journey with clarity and confidence." },
  { icon: LineChart, title: "Senior Professionals", desc: "Preparing for financial independence with disciplined planning." },
  { icon: Compass, title: "Business Owners", desc: "Managing complex financial decisions across personal and business life." },
  { icon: Globe, title: "NRIs", desc: "Building globally diversified portfolios while managing cross-border complexity." },
  { icon: Heart, title: "Families", desc: "Planning long-term wealth preservation across generations." },
];

export const SegmentsSection = () => (
  <section className="py-28 md:py-40">
    <div className="container mx-auto px-6 lg:px-8">
      <ScrollReveal>
        <div className="max-w-2xl mb-20">
          <p className="label-caps text-accent tracking-[0.15em] mb-4">Who We Serve</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary text-balance">
            Who We Work With
          </h2>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {segments.map((seg, i) => (
          <ScrollReveal key={i} delay={i * 90}>
            <div className="group p-10 border border-border hover:border-accent/30 transition-all duration-500 h-full">
              <div className="w-12 h-12 flex items-center justify-center border border-accent/20 mb-8 group-hover:border-accent group-hover:bg-accent/5 transition-all duration-500">
                <seg.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary mb-3">{seg.title}</h3>
              <p className="text-sm text-muted-foreground">{seg.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
