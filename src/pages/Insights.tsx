import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EducationalDisclaimer, MutualFundDisclaimer, SourceAttribution } from "@/components/MutualFundDisclaimer";
import { useFilteredInsights } from "@/hooks/useInsights";
import { INSIGHT_CATEGORIES } from "@/types/insight";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, FileText, Video, BarChart3 } from "lucide-react";

const Insights = () => {
  const { insights, isLoading, category, setCategory, search, setSearch, categories } = useFilteredInsights();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-8">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <p className="label-caps text-gold mb-4">Knowledge</p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary leading-[1.1] tracking-tight mb-6 text-balance max-w-3xl">
              Insights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
              Perspectives on investing, financial planning, and building long-term wealth.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={50}>
            <EducationalDisclaimer className="max-w-2xl mb-4" />
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-8">
        <div className="container mx-auto px-6 lg:px-8">
          <MutualFundDisclaimer variant="inline" className="max-w-2xl" />
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search insights…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 text-xs font-medium tracking-wider uppercase transition-all duration-300 border ${
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-accent hover:text-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Insights Grid */}
      <section className="pb-24 md:pb-32">
        <div className="container mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-background p-8">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No insights found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
              {insights.map((a, i) => (
                <ScrollReveal key={a.id || i} delay={i * 60}>
                  <div className="bg-background p-8 h-full hover:bg-cream-dark transition-colors duration-300 group cursor-pointer">
                    <p className="label-caps text-gold/60 mb-4">{a.category}</p>
                    <h2 className="font-display text-xl font-semibold text-primary mb-4 group-hover:text-gold transition-colors duration-300">
                      {a.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{a.summary}</p>

                    {/* Optional media badges */}
                    {(a.chart_url || a.pdf_resource || a.video_link) && (
                      <div className="flex gap-3 mb-4">
                        {a.chart_url && (
                          <a href={a.chart_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent hover:text-gold transition-colors">
                            <BarChart3 className="w-3.5 h-3.5" /> Chart
                          </a>
                        )}
                        {a.pdf_resource && (
                          <a href={a.pdf_resource} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent hover:text-gold transition-colors">
                            <FileText className="w-3.5 h-3.5" /> PDF
                          </a>
                        )}
                        {a.video_link && (
                          <a href={a.video_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent hover:text-gold transition-colors">
                            <Video className="w-3.5 h-3.5" /> Video
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground/60">{a.publish_date}</p>
                      <SourceAttribution source={a.source} />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Insights;
