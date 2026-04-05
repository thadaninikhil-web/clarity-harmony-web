import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useInsightBySlug } from "@/hooks/useInsights";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Video,
  BarChart3,
} from "lucide-react";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";
import { SITE_CONFIG } from "@/config/site";

/* ---------------- PortableText ---------------- */

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      return (
        <img
          src={urlFor(value).width(800).url()}
          className="my-8 rounded-lg"
        />
      );
    },
  },

  block: {
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-semibold mt-10 mb-4">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-semibold mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold mt-8 mb-4">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-foreground/80 leading-relaxed mb-4">
        {children}
      </p>
    ),
  },
};

/* ---------------- Component ---------------- */

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: insight } = useInsightBySlug(slug || "");

  const readingTime = useMemo(() => {
    if (!insight?.content) return null;
    const text = insight.content
      .map((b: any) => b.children?.map((c: any) => c.text).join(""))
      .join(" ");
    return Math.ceil(text.split(/\s+/).length / 200);
  }, [insight]);

  if (!insight) return null;

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* FLOATING SHARE */}
      <div className="fixed left-[max(16px,calc((100vw-768px)/2-60px))] top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-50">
        <a
          href={`https://wa.me/?text=${shareUrl}`}
          target="_blank"
          className="w-10 h-10 flex items-center justify-center border rounded-full bg-white shadow hover:bg-accent"
        >
          🟢
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
          className="w-10 h-10 flex items-center justify-center border rounded-full bg-white shadow hover:bg-accent"
        >
          🔵
        </a>
      </div>

      {/* HEADER */}
      <section className="pt-32 pb-10 max-w-3xl mx-auto px-6">
        <Link to="/insights" className="flex gap-2 mb-6">
          <ArrowLeft size={16} /> Back
        </Link>

        <p className="text-accent text-sm mb-2">{insight.category}</p>

        <h1 className="text-4xl font-semibold mb-4">
          {insight.title}
        </h1>

        {/* EXCERPT */}
        {insight.summary && (
          <p className="text-muted-foreground mb-6">
            {insight.summary}
          </p>
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
      </section>

      {/* BODY */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="prose prose-lg max-w-none">
          <PortableText
            value={insight.content}
            components={portableTextComponents}
          />
        </div>

        {/* RESOURCES */}
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

        {/* SOURCE */}
        {insight.source && (
          <p className="text-xs text-muted-foreground mt-6">
            Source: {insight.source}
          </p>
        )}

        {/* AUTHOR */}
        <div className="mt-12 border-t pt-6">
          <h3 className="font-semibold mb-2">
            About {SITE_CONFIG.author.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {SITE_CONFIG.author.bio}
          </p>
        </div>
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