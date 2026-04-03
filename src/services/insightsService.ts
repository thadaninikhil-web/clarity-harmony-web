import { sanityClient } from "@/lib/sanity";
import {
  getPublishedInsights,
  getFeaturedInsights,
  getInsightBySlug,
  getInsightsByCategory,
} from "@/data/insights";
import type { Insight } from "@/types/insight";

// Sanity GROQ queries
const ALL_QUERY = `*[_type == "insight"] | order(publish_date desc) {
  _id, title, "slug": slug.current, excerpt, category, publish_date, source, risk_note,
  is_featured, chart_url, pdf_resource, video_link, body, mainImage
}`;

const FEATURED_QUERY = `*[_type == "insight" && is_featured == true] | order(publish_date desc) {
  _id, title, "slug": slug.current, excerpt, category, publish_date, source, risk_note,
  is_featured, chart_url, pdf_resource, video_link
}`;

const SLUG_QUERY = `*[_type == "insight" && slug.current == $slug][0] {
  _id, title, "slug": slug.current, excerpt, category, publish_date, source, risk_note,
  is_featured, chart_url, pdf_resource, video_link, body, mainImage
}`;

const CATEGORY_QUERY = `*[_type == "insight" && category == $category] | order(publish_date desc) {
  _id, title, "slug": slug.current, excerpt, category, publish_date, source, risk_note,
  is_featured, chart_url, pdf_resource, video_link
}`;

function sanityToInsight(doc: Record<string, unknown>): Insight {
  return {
    id: (doc._id as string) || "",
    title: (doc.title as string) || "",
    slug: (doc.slug as string) || "",
    summary: (doc.excerpt as string) || "",   // <-- updated to use excerpt
    category: (doc.category as string) || "",
    publish_date: (doc.publish_date as string) || "",
    insight_url: "",
    source: (doc.source as string) || "",
    risk_note: (doc.risk_note as string) || "",
    is_featured: (doc.is_featured as boolean) || false,
    chart_url: (doc.chart_url as string) || undefined,
    pdf_resource: (doc.pdf_resource as string) || undefined,
    video_link: (doc.video_link as string) || undefined,
    body: doc.body as Insight["body"],
    mainImage: doc.mainImage as Insight["mainImage"],
  };
}

export async function fetchInsights(): Promise<Insight[]> {
  try {
    const docs = await sanityClient.fetch(ALL_QUERY);
    if (docs && docs.length > 0) return docs.map(sanityToInsight);
    return getPublishedInsights();
  } catch {
    return getPublishedInsights();
  }
}

export async function fetchFeaturedInsights(): Promise<Insight[]> {
  try {
    const docs = await sanityClient.fetch(FEATURED_QUERY);
    if (docs && docs.length > 0) return docs.map(sanityToInsight);
    return getFeaturedInsights();
  } catch {
    return getFeaturedInsights();
  }
}

export async function fetchInsightsByCategory(category: string): Promise<Insight[]> {
  try {
    const docs = await sanityClient.fetch(CATEGORY_QUERY, { category });
    if (docs && docs.length > 0) return docs.map(sanityToInsight);
    return getInsightsByCategory(category);
  } catch {
    return getInsightsByCategory(category);
  }
}

export async function fetchInsightBySlug(slug: string): Promise<Insight | null> {
  try {
    const doc = await sanityClient.fetch(SLUG_QUERY, { slug });
    if (doc) return sanityToInsight(doc);
    return getInsightBySlug(slug);
  } catch {
    return getInsightBySlug(slug);
  }
}
