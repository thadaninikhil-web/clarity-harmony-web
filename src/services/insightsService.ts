import {
  getPublishedInsights,
  getFeaturedInsights,
  getInsightBySlug,
  getInsightsByCategory,
} from "@/data/insights";
import type { Insight } from "@/types/insight";

/**
 * Insights service — reads from local static data.
 * All functions return promises for compatibility with React Query.
 */

export async function fetchInsights(): Promise<Insight[]> {
  return getPublishedInsights();
}

export async function fetchFeaturedInsights(): Promise<Insight[]> {
  return getFeaturedInsights();
}

export async function fetchInsightsByCategory(category: string): Promise<Insight[]> {
  return getInsightsByCategory(category);
}

export async function fetchInsightBySlug(slug: string): Promise<Insight | null> {
  return getInsightBySlug(slug);
}
