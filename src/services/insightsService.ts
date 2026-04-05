import { sanityClient } from "@/lib/sanity";
import {
  getPublishedInsights,
  getFeaturedInsights,
  getInsightBySlug,
  getInsightsByCategory,
} from "@/data/insights";
import type { Insight } from "@/types/insight";

/* ---------------- QUERIES ---------------- */

const ALL_QUERY = `*[_type == "insight"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  body[]{
    ...,
    children[]{
      ...
    }
  },
  coverImage,
  publishedAt,
  readTime,
  source,
  chart_url,
  pdf_resource,
  video_link
}`;

const FEATURED_QUERY = `*[_type == "insight" && is_featured == true] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  body[]{
    ...,
    children[]{
      ...
    }
  },
  coverImage,
  publishedAt,
  readTime,
  source,
  chart_url,
  pdf_resource,
  video_link
}`;

const SLUG_QUERY = `*[_type == "insight" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  body[]{
    ...,
    children[]{
      ...
    }
  },
  coverImage,
  publishedAt,
  readTime,
  source,
  chart_url,
  pdf_resource,
  video_link
}`;

const CATEGORY_QUERY = `*[_type == "insight" && category == $category] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  body[]{
    ...,
    children[]{
      ...
    }
  },
  coverImage,
  publishedAt,
  readTime,
  source,
  chart_url,
  pdf_resource,
  video_link
}`;

/* ---------------- MAPPER ---------------- */

function sanityToInsight(doc: any): Insight {
  return {
    id: doc._id || "",
    title: doc.title || "",
    slug: doc.slug || "",
    summary: doc.excerpt || "",

    // 🔥 CRITICAL FIX: USE BODY AS CONTENT
    content: Array.isArray(doc.body) ? doc.body : [],

    category: doc.category || "",
    publish_date: doc.publishedAt || "",
    read_time: doc.readTime || "",
    coverImage: doc.coverImage || null,

    body: Array.isArray(doc.body) ? doc.body : [],

    insight_url: "",
    source: doc.source || "",
    risk_note: doc.risk_note || "",
    is_featured: doc.is_featured || false,
    chart_url: doc.chart_url || undefined,
    pdf_resource: doc.pdf_resource || undefined,
    video_link: doc.video_link || undefined,
    mainImage: doc.mainImage || null,
  };
}

/* ---------------- FETCH FUNCTIONS ---------------- */

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