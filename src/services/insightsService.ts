import { sanityClient } from "@/lib/sanity";
import {
  getPublishedInsights,
  getFeaturedInsights,
  getInsightBySlug,
  getInsightsByCategory,
} from "@/data/insights";
import type { Insight } from "@/types/insight";

// Sanity GROQ queries
const ALL_QUERY = `*[_type == "insight"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  body,
  coverImage,
  publishedAt,
  readTime,
  "plainText": pt::text(body)
}`;

const FEATURED_QUERY = `*[_type == "insight" && is_featured == true] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  body,
  coverImage,
  publishedAt,
  readTime,
  "plainText": pt::text(body)
}`;

const SLUG_QUERY = `*[_type == "insight" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  body,
  coverImage,
  publishedAt,
  readTime,
  "plainText": pt::text(body)
}`;

const CATEGORY_QUERY = `*[_type == "insight" && category == $category] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  body,
  coverImage,
  publishedAt,
  readTime,
  "plainText": pt::text(body)
}`;

function sanityToInsight(doc: Record<string, unknown>): Insight {
  return {
    id: typeof doc._id === "string" ? doc._id : "",
    title: typeof doc.title === "string" ? doc.title : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    summary: typeof doc.excerpt === "string" ? doc.excerpt : "",
    content: typeof doc.plainText === "string" ? doc.plainText : "", // safe plain text
    category: typeof doc.category === "string" ? doc.category : "",
    publish_date: typeof doc.publishedAt === "string" ? doc.publishedAt : "",
    read_time: typeof doc.readTime === "string" ? doc.readTime : "",
    coverImage: doc.coverImage ?? null,
    body: Array.isArray(doc.body) ? doc.body : [],
    // optional legacy fields
    insight_url: "",
    source: typeof doc.source === "string" ? doc.source : "",
    risk_note: typeof doc.risk_note === "string" ? doc.risk_note : "",
    is_featured: typeof doc.is_featured === "boolean" ? doc.is_featured : false,
    chart_url: typeof doc.chart_url === "string" ? doc.chart_url : undefined,
    pdf_resource: typeof doc.pdf_resource === "string" ? doc.pdf_resource : undefined,
    video_link: typeof doc.video_link === "string" ? doc.video_link : undefined,
    mainImage: doc.mainImage ?? null,
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
