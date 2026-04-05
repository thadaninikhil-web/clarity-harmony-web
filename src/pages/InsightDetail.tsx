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

// ✅ IMPORT ICONS
import whatsappIcon from "@/assets/icons/whatsapp.svg";
import linkedinIcon from "@/assets/icons/linkedin.svg";

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: insight } = useInsightBySlug(slug || "");
  const { data: allInsights = [] } = useInsights();

  const [progress, setProgress] = useState(0);

  /* ---------------- Reading Time ---------------- */
  const readingTime = useMemo(() => {
    if (!insight?.content) return null;
    const text = insight.content
      .map((b: any) => b.children?.map((c: any) => c.text).join(""))
      .join(" ");
    return Math.ceil(text.split(/\s+/).length / 200);
  }, [insight]);

  /* ---------------- Progress ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- TOC ---------------- */
  const headings = insight?.content?.filter(
    (b: any) => b.style === "h2" || b.style === "h3"
  );

  /* ---------------- SEO ---------------- */
  useEffect(() => {
    if (!insight) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: insight.title,
      description: insight.summary,
      author: {
        "@type": "Person",
        name: SITE_CONFIG.author.name,
      },
    });

    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, [insight]);

  if (!insight) return null;

  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* PROGRESS BAR */}
      <div
        className="fixed top-0 left-0 h-1 bg-accent z-50"
        style={{ width: `${progress}%` }}
      />

      {/* FLOATING SHARE */}
      <div className="fixed left-[max(16px,calc((100vw-768px)/2-60px))] top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-50">
        <a href={`https://wa.me/?text=${shareUrl}`} target="_blank">
		<img
		  src={whatsappIcon}
		  className="w-10 h-10 p-2 bg-white rounded-full shadow hover:scale-110 transition"
		/>

        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
        >
         <img
			src={linkedinIcon}
			className="w-10 h-10 p-2 bg-white rounded-full shadow hover:scale-110 transition"
		/>
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

        <p className="text-muted-foreground mb-6">
          {insight.summary}
        </p>

        {insight.coverImage && (
          <img
            src={urlFor(insight.coverImage).width(1200).url()}
            className="rounded mb-6"
          />
        )}

        <div className="text-sm text-muted-foreground flex gap-4">
          <span>
            {new Date(insight.publish_date).toLocaleDateString("en-IN")}
          </span>
          {readingTime && <span>{readingTime} min read</span>}
        </div>
      </section>

      {/* TOC */}
      {headings?.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 mb-10">
          <div className="border p-4 rounded">
            <p className="font-semibold mb-2">In this article</p>
            {headings.map((h: any, i: number) => (
              <p key={i} className="text-sm text-muted-foreground">
                {h.children?.map((c: any) => c.text).join("")}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* BODY */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="prose prose-lg max-w-none">
          <PortableText value={insight.content} />
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
      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-xl font-semibold mb-6">Related Insights</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {allInsights
            .filter((i) => i.slug !== insight.slug)
            .slice(0, 3)
            .map((item) => (
              <Link key={item.slug} to={`/insights/${item.slug}`}>
                <div className="border p-4 hover:bg-accent">
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
              </Link>
            ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InsightDetail;