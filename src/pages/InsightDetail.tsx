import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MutualFundDisclaimer, EducationalDisclaimer, SourceAttribution } from "@/components/MutualFundDisclaimer";
import { useInsightBySlug } from "@/hooks/useInsights";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Video, BarChart3 } from "lucide-react";
import { useEffect } from "react";

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: insight, isLoading } = useInsightBySlug(slug || "");

  // Update document title for SEO
  useEffect(() => {
    if (insight) {
      document.title = `${insight.title} | Balancing Act Insights`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", insight.summary);
    }
    return () => {
      document.title = "Balancing Act — Financial Planning Built on Discipline, Clarity and Trust";
    };
  }, [insight]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <Skeleton className="h-4 w-32 mb-8" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-3/4 mb-8" />
            <Skeleton className="h-4 w-48 mb-12" />
            <Skeleton className="h-40 w-full" />
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center py-20">
            <h1 className="font-display text-3xl font-semibold text-primary mb-4">Insight Not Found</h1>
            <p className="text-muted-foreground mb-8">The insight you're looking for doesn't exist or has been removed.</p>
            <Button variant="hero" asChild>
              <Link to="/insights">Browse All Insights</Link>
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Article Header */}
      <section className="pt-32 pb-8">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
          <ScrollReveal>
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Insights
            </Link>
            <p className="label-caps text-accent tracking-[0.15em] mb-4">{insight.category}</p>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-[1.15] tracking-tight mb-6 text-balance">
              {insight.title}
            </h1>
            <p className="text-sm text-muted-foreground">{insight.publish_date}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <MutualFundDisclaimer variant="banner" />

      {/* Article Body */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
          <ScrollReveal>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed">{insight.summary}</p>
            </div>

            {/* Media Resources */}
            {(insight.chart_url || insight.pdf_resource || insight.video_link) && (
              <div className="mt-10 p-6 border border-border bg-card">
                <p className="label-caps text-accent mb-4">Resources</p>
                <div className="flex flex-wrap gap-4">
                  {insight.chart_url && (
                    <a
                      href={insight.chart_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" /> View Chart
                    </a>
                  )}
                  {insight.pdf_resource && (
                    <a
                      href={insight.pdf_resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
                    >
                      <FileText className="w-4 h-4" /> Download PDF
                    </a>
                  )}
                  {insight.video_link && (
                    <a
                      href={insight.video_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
                    >
                      <Video className="w-4 h-4" /> Watch Video
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Source Attribution */}
            <div className="mt-10 pt-8 border-t border-border">
              <SourceAttribution source={insight.source} className="text-xs text-muted-foreground/60" />
            </div>

            {/* Risk Disclaimer */}
            <div className="mt-8 p-6 border border-border bg-card">
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.risk_note}</p>
            </div>

            <EducationalDisclaimer className="mt-6" />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">
              Want help building a disciplined financial plan?
            </h2>
            <p className="text-muted-foreground mb-8">
              Speak with us to understand how a structured approach to investing may help you achieve your long-term goals.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/book">Book a Discovery Call</Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InsightDetail;
