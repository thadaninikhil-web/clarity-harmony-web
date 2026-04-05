import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EducationalDisclaimer } from "@/components/MutualFundDisclaimer";
import { useInsightBySlug } from "@/hooks/useInsights";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Video,
  BarChart3,
  Share2,
} from "lucide-react";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";

/* ---------------- PortableText Config ---------------- */

const portableTextComponents = {
  types: {
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
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-semibold text-primary mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold text-primary mt-8 mb-4">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-foreground/80 leading-relaxed my-4">{children}</p>
    ),
  },
};

/* ---------------- Component ---------------- */

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: insight, isLoading } = useInsightBySlug(slug || "");

  /* ---------------- Reading Time ---------------- */

  const readingTime = useMemo(() => {
    if (!insight?.content) return null;

    const text = insight.content
      .map((block: any) =>
        block.children?.map((child: any) => child.text).join("")
      )
      .join(" ");

    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  }, [insight]);

  /* ---------------- SEO ---------------- */

  useEffect(() => {
    if (!insight) return;

    document.title = `${insight.title} | Balancing Act`;

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setMeta("description", insight.summary || "");
    setMeta("og:title", insight.title);
    setMeta("og:description", insight.summary || "");

    if (insight?.coverImage) {
      setMeta("og:image", urlFor(insight.coverImage).width(1200).url());
    }

    return () => {
      document.title =
        "Balancing Act — Financial Planning Built on Discipline, Clarity and Trust";
    };
  }, [insight]);

  /* ---------------- Share ---------------- */

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied!");
  };

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24">
          <div className="container mx-auto max-w-3xl px-6">
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-40 w-full" />
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  /* ---------------- Not Found ---------------- */

  if (!insight) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 text-center">
          <h1 className="text-3xl font-semibold mb-4">Insight Not Found</h1>
          <Button asChild>
            <Link to="/insights">Back</Link>
          </Button>
        </section>
        <Footer />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-10">
        <div className="container mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <Link to="/insights" className="flex items-center gap-2 mb-6">
              <ArrowLeft size={16} /> Back
            </Link>

            <p className="text-accent uppercase text-sm mb-3">
              {insight.category}
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold mb-4">
              {insight.title}
            </h1>

            {/* ✅ COVER IMAGE */}
            {insight.coverImage && (
              <img
                src={urlFor(insight.coverImage).width(1200).url()}
                alt={insight.title}
                className="w-full rounded-lg my-6"
              />
            )}

            {/* ✅ DATE + READ TIME */}
            <div className="text-sm text-muted-foreground flex gap-4">
              <span>
                {insight.publish_date
                  ? new Date(insight.publish_date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : ""}
              </span>
              {readingTime && <span>{readingTime} min read</span>}
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="mt-4 flex items-center gap-2 text-sm text-accent"
            >
              <Share2 size={16} /> Share
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* Body */}
      <section className="py-12">
        <div className="container mx-auto max-w-3xl px-6">
          <ScrollReveal>
            {Array.isArray(insight.content) && insight.content.length > 0 ? (
              <PortableText
                value={insight.content}
                components={portableTextComponents}
              />
            ) : (
              <p className="text-red-500">No content available</p>
            )}

            {/* Resources */}
            {(insight.chart_url ||
              insight.pdf_resource ||
              insight.video_link) && (
              <div className="mt-10 p-6 border">
                <p className="mb-4 font-semibold">Resources</p>

                <div className="flex gap-4 flex-wrap">
                  {insight.chart_url && (
                    <a href={insight.chart_url} target="_blank">
                      <BarChart3 size={16} /> Chart
                    </a>
                  )}
                  {insight.pdf_resource && (
                    <a href={insight.pdf_resource} target="_blank">
                      <FileText size={16} /> PDF
                    </a>
                  )}
                  {insight.video_link && (
                    <a href={insight.video_link} target="_blank">
                      <Video size={16} /> Video
                    </a>
                  )}
                </div>
              </div>
            )}

            <EducationalDisclaimer className="mt-8" />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center border-t">
        <h2 className="text-2xl font-semibold mb-4">
          Want help building a disciplined financial plan?
        </h2>
        <Button asChild>
          <Link to="/contact">Get in Touch</Link>
        </Button>
      </section>

      <Footer />
    </div>
  );
};

export default InsightDetail;