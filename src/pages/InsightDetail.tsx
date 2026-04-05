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
import { SITE_CONFIG } from "@/config/site";

/* ---------------- Component ---------------- */

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: insight, isLoading } = useInsightBySlug(slug || "");

  const readingTime = useMemo(() => {
    if (!insight?.content) return null;

    const text = insight.content
      .map((b: any) => b.children?.map((c: any) => c.text).join(""))
      .join(" ");

    return Math.ceil(text.split(/\s+/).length / 200);
  }, [insight]);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Skeleton className="h-40" />
        <Footer />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* STICKY SHARE */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 z-50">
        <a
          href={`https://wa.me/?text=${shareUrl}`}
          target="_blank"
          className="p-3 border rounded hover:bg-accent"
        >
          WhatsApp
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
          className="p-3 border rounded hover:bg-accent"
        >
          LinkedIn
        </a>
      </div>

      {/* HEADER */}
      <section className="pt-32 pb-10 max-w-3xl mx-auto px-6">
        <Link to="/insights" className="flex gap-2 mb-6">
          <ArrowLeft size={16} /> Back
        </Link>

        <p className="text-accent text-sm mb-2">{insight.category}</p>

        <h1 className="text-4xl font-semibold mb-4">{insight.title}</h1>

        {/* EXCERPT */}
        {insight.summary && (
          <p className="text-muted-foreground mb-6">{insight.summary}</p>
        )}

        {/* COVER IMAGE */}
        {insight.coverImage && (
          <img
            src={urlFor(insight.coverImage).width(1200).url()}
            className="rounded mb-6"
          />
        )}

        {/* DATE */}
        <div className="text-sm text-muted-foreground flex gap-4">
          <span>
            {insight.publish_date
              ? new Date(insight.publish_date).toLocaleDateString("en-IN")
              : ""}
          </span>
          {readingTime && <span>{readingTime} min read</span>}
        </div>
      </section>

      {/* BODY */}
      <section className="max-w-3xl mx-auto px-6">
        {Array.isArray(insight.content) && insight.content.length > 0 ? (
          <PortableText value={insight.content} />
        ) : (
          <p>No content</p>
        )}

        {/* SOURCE */}
        {insight.source && (
          <p className="text-xs text-muted-foreground mt-6">
            Source: {insight.source}
          </p>
        )}

        <EducationalDisclaimer className="mt-8" />
      </section>

      {/* AUTHOR */}
      <section className="max-w-3xl mx-auto px-6 mt-12 border-t pt-8">
        <h3 className="font-semibold mb-2">
          About {SITE_CONFIG.author.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {SITE_CONFIG.author.bio}
        </p>
      </section>

      {/* CTA */}
      <section className="text-center py-16">
        <h2 className="text-2xl mb-4">
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