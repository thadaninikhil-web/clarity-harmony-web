import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EducationalDisclaimer } from "@/components/MutualFundDisclaimer";
import { ArrowRight } from "lucide-react";
import { useFeaturedInsights } from "@/hooks/useInsights";
import { Skeleton } from "@/components/ui/skeleton";

export const InsightsPreview = () => {
  const { data: articles = [], isLoading } = useFeaturedInsights();
  const displayArticles = articles.slice(0, 3);

  return (
    <section className="py-28 md:py-40 bg-card">
      <div className="container mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-20">
            <div>
              <p className="label-caps text-accent tracking-[0.15em] mb-4 text-left">Knowledge</p>
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
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="p-10 border border-gold/20">
                  <Skeleton className="h-3 w-20 mb-6" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-5 w-3/4 mb-6" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))
            : displayArticles.map((article, i) => (
                <ScrollReveal key={article.id || i} delay={i * 100}>
                  <Link to={`/insights/${article.slug}`} className="block h-full">
                    <div className="group cursor-pointer p-10 border border-gold/20 hover:border-gold/40 transition-all duration-500 h-full">
                      <p className="label-caps text-gold/40 mb-6 text-left">{article.category}</p>
                      <h3 className="font-display text-lg font-semibold text-primary mb-6 group-hover:text-accent transition-colors duration-300">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground text-left">{article.publishedAt}</p>
                        <ArrowRight className="w-4 h-4 text-accent/0 group-hover:text-accent transition-all duration-300 translate-x-0 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
        </div>
        <ScrollReveal delay={350}>
          <EducationalDisclaimer className="mt-10" />
        </ScrollReveal>
      </div>
    </section>
  );
};
