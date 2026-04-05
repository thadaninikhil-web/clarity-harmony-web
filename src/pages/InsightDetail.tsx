import { useParams, Link } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useInsightBySlug, useInsights } from "@/hooks/useInsights";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";
import { SITE_CONFIG } from "@/config/site";

import whatsappIcon from "@/assets/icons/whatsapp.svg";
import linkedinIcon from "@/assets/icons/linkedin.svg";

/* ✅ FIX: PROPER PORTABLE TEXT STYLING */
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
      <h1 className="text-3xl font-semibold mt-10 mb-4">
        {children}
      </h1>
    ),

    h2: ({ children }: any) => (
      <h2 className="text-2xl font-semibold mt-10 mb-4">
        {children}
      </h2>
    ),

    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold mt-8 mb-4">
        {children}
      </h3>
    ),

    normal: ({ children }: any) => (
      <p className="text-foreground/80 leading-relaxed mb-4">
        {children}
      </p>
    ),
  },

  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-4">{children}</ul>
    ),
  },

  listItem: {
    bullet: ({ children }: any) => (
      <li className="mb-2">{children}</li>
    ),
  },
};

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: insight } = useInsightBySlug(slug || "");
  const { data: allInsights = [] } = useInsights();

  const [progress, setProgress] = useState(0);
  const [showShare, setShowShare] = useState(true);

  /* Reading Time */
  const readingTime = useMemo(() => {
    if (!insight?.content) return null;

    const contentArr = Array.isArray(insight.content) ? insight.content : [];
    const text = contentArr
      .map((b: any) => b.children?.map((c: any) => c.text).join(""))
      .join(" ");

    return Math.ceil(text.split(/\s+/).length / 200);
  }, [insight]);

  /* Scroll */
  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      setProgress((window.scrollY / total) * 100);

      const article = document.getElementById("article-body");
      if (article) {
        const rect = article.getBoundingClientRect();
        setShowShare(rect.bottom > 200);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const related = allInsights
    .filter((i) => i.slug !== insight?.slug)
    .slice(0, 3);

  if (!insight) return null;

  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-accent z-50"
        style={{ width: `${progress}%` }}
      />

      {/* Floating Share */}
      {showShare && (
        <div className="fixed left-[max(16px,calc((100vw-768px)/2-60px))] top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-50">
          <a href={`https://wa.me/?text=${shareUrl}`} target="_blank">
            <img
              src={whatsappIcon}
              className="w-10 h-10 p-2 bg-white rounded-full shadow transition hover:scale-110 hover:shadow-[0_0_12px_rgba(212,175,55,0.6)]"
            />
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
          >
            <img
              src={linkedinIcon}
              className="w-10 h-10 p-2 bg-white rounded-full shadow transition hover:scale-110 hover:shadow-[0_0_12px_rgba(212,175,55,0.6)]"
            />
          </a>
        </div>
      )}

      {/* HEADER */}
      <section className="pt-32 pb-10 max-w-3xl mx-auto px-6">
        <Link to="/insights" className="flex gap-2 mb-6">
          <ArrowLeft size={16} /> Back
        </Link>

        <p className="text-accent text-sm mb-2">{insight.category}</p>

        <h1 className="text-4xl font-semibold mb-4">
          {insight.title}
        </h1>

        {insight.summary && (
          <p className="text-muted-foreground mb-6">
            {insight.summary}
          </p>
        )}

        {insight.coverImage && (
          <img
            src={urlFor(insight.coverImage).width(1200).url()}
            className="rounded mb-6"
          />
        )}

        <div className="text-sm text-muted-foreground flex gap-4">
          <span>
            {new Date(insight.publish_date).toLocaleDateString(
              "en-IN"
            )}
          </span>

          {readingTime && <span>{readingTime} min read</span>}
        </div>
      </section>

      {/* BODY */}
      <section
        id="article-body"
        className="max-w-3xl mx-auto px-6"
      >
        <div className="prose prose-lg max-w-none">
          <PortableText
            value={insight.content}
            components={portableTextComponents}
          />
        </div>

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

      {/* RELATED */}
      <section className="max-w-5xl mx-auto px-6 mt-16 mb-24">
        <h2 className="text-xl font-semibold mb-6">
          Related Insights
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {related.map((item) => (
            <Link
              key={item.slug}
              to={`/insights/${item.slug}`}
              className="border p-4 hover:bg-accent transition"
            >
              <p className="text-sm text-muted-foreground mb-2">
                {item.category}
              </p>
              <h3 className="font-semibold">{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* MOBILE SHARE */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 z-50 lg:hidden">
        <a href={`https://wa.me/?text=${shareUrl}`} target="_blank">
          <img src={whatsappIcon} className="w-6 h-6" />
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
        >
          <img src={linkedinIcon} className="w-6 h-6" />
        </a>
      </div>

      <Footer />
    </div>
  );
};

export default InsightDetail;