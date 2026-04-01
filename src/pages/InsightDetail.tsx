import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EducationalDisclaimer, SourceAttribution } from "@/components/MutualFundDisclaimer";
import { useInsightBySlug } from "@/hooks/useInsights";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Video, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";

const portableTextComponents = {
  types: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: ({ value }: { value: any }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <img
            src={urlFor(value).width(800).auto("format").url()}
            alt={value.alt || ""}
            className="w-full rounded"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="text-xs text-muted-foreground/60 text-center mt-3 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-display text-xl font-semibold text-primary mt-8 mb-4">{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="font-display text-lg font-semibold text-primary mt-6 mb-3">{children}</h4>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-foreground/80 leading-relaxed my-4">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 border-gold/40 pl-6 my-6 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-primary">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:text-gold underline underline-offset-2"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="space-y-2 my-4">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="space-y-2 my-4 list-decimal pl-5">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 bg-accent mt-2.5 shrink-0" />
        <span className="text-foreground/80 leading-relaxed">{children}</span>
      </li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-foreground/80 leading-relaxed">{children}</li>
    ),
  },
};

// Legacy plain-text renderer
const renderContent = (content: string) => {
  return content.split("\n\n").map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return (
        <h3 key={i} className="font-display text-xl font-semibold text-primary mt-8 mb-4">
          {trimmed.replace(/\*\*/g, "")}
        </h3>
      );
    }

    if (trimmed.startsWith("•")) {
      const items = trimmed.split("\n").filter((l) => l.trim().startsWith("•"));
      return (
        <ul key={i} className="space-y-2 my-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-accent mt-2.5 shrink-0" />
              <span className="text-foreground/80 leading-relaxed">{item.replace(/^•\s*/, "")}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (trimmed.startsWith("*") && trimmed.endsWith("*") && !trimmed.startsWith("**")) {
      return (
        <p key={i} className="text-sm text-muted-foreground italic leading-relaxed my-4">
          {trimmed.replace(/^\*|\*$/g, "")}
        </p>
      );
    }

    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
    if (parts.length > 1) {
      return (
        <p key={i} className="text-foreground/80 leading-relaxed my-4">
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="font-semibold text-primary">
                {part.replace(/\*\*/g, "")}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      );
    }

    return (
      <p key={i} className="text-foreground/80 leading-relaxed my-4">
        {trimmed}
      </p>
    );
  });
};

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: insight, isLoading } = useInsightBySlug(slug || "");

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
            <p className="text-muted-foreground mb-8 text-center">The insight you're looking for doesn't exist or has been removed.</p>
            <Button variant="gold" asChild>
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

      <section className="pt-32 pb-8">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
          <ScrollReveal>
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Insights
            </Link>
            <p className="label-caps text-accent tracking-[0.15em] mb-4 text-left">{insight.category}</p>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-[1.15] tracking-tight mb-6 text-balance">
              {insight.title}
            </h1>
            <p className="text-sm text-muted-foreground text-left">{insight.publish_date}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Article Body */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
          <ScrollReveal>
            {/* Sanity Portable Text (rich content from CMS) */}
            {insight.body && insight.body.length > 0 ? (
              <div className="prose-custom">
                <PortableText value={insight.body} components={portableTextComponents} />
              </div>
            ) : insight.content ? (
              <div className="prose-custom">{renderContent(insight.content)}</div>
            ) : (
              <p className="text-lg text-foreground/80 leading-relaxed">{insight.summary}</p>
            )}

            {/* Media Resources */}
            {(insight.chart_url || insight.pdf_resource || insight.video_link) && (
              <div className="mt-10 p-6 border border-gold/20 bg-card">
                <p className="label-caps text-accent mb-4 text-left">Resources</p>
                <div className="flex flex-wrap gap-4">
                  {insight.chart_url && (
                    <a href={insight.chart_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors">
                      <BarChart3 className="w-4 h-4" /> View Chart
                    </a>
                  )}
                  {insight.pdf_resource && (
                    <a href={insight.pdf_resource} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors">
                      <FileText className="w-4 h-4" /> Download PDF
                    </a>
                  )}
                  {insight.video_link && (
                    <a href={insight.video_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors">
                      <Video className="w-4 h-4" /> Watch Video
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Source */}
            <div className="mt-10 pt-8 border-t border-gold/15">
              <SourceAttribution source={insight.source} className="text-xs text-muted-foreground/60" />
            </div>

            {/* Disclaimer at bottom */}
            <EducationalDisclaimer className="mt-8" />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card border-y border-gold/20">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-4">
              Want help building a disciplined financial plan?
            </h2>
            <p className="text-muted-foreground mb-8 text-center">
              Speak with us to understand how a structured approach to investing may help you achieve your long-term goals.
            </p>
            <Button variant="gold" size="xl" asChild>
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
