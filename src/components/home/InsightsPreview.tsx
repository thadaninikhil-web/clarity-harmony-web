import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EducationalDisclaimer } from "@/components/MutualFundDisclaimer";
import { ArrowRight } from "lucide-react";

const articles = [
  { cat: "Investing", title: "Why Asset Allocation Matters More Than Stock Picking", date: "March 2026" },
  { cat: "Behavioral Finance", title: "The Psychology of Selling at the Bottom", date: "February 2026" },
  { cat: "Financial Planning", title: "When Should You Start Planning for Retirement?", date: "January 2026" },
];

export const InsightsPreview = () => (
  <section className="py-28 md:py-40 bg-card">
    <div className="container mx-auto px-6 lg:px-8">
      <ScrollReveal>
        <div className="flex items-end justify-between mb-20">
          <div>
            <p className="label-caps text-accent tracking-[0.15em] mb-4">Knowledge</p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary text-balance">
              Insights
            </h2>
          </div>
          <Link to="/insights" className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors duration-300">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((article, i) => (
          <ScrollReveal key={i} delay={i * 100}>
            <div className="group cursor-pointer p-10 border border-border hover:border-accent/20 transition-all duration-500 h-full">
              <p className="label-caps text-accent/40 mb-6">{article.cat}</p>
              <h3 className="font-display text-lg font-semibold text-primary mb-6 group-hover:text-accent transition-colors duration-300">
                {article.title}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{article.date}</p>
                <ArrowRight className="w-4 h-4 text-accent/0 group-hover:text-accent transition-all duration-300 translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal delay={350}>
        <EducationalDisclaimer className="mt-10" />
      </ScrollReveal>
    </div>
  </section>
);
