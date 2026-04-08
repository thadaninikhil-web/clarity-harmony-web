export interface Insight {
  id: string;
  title: string;
  slug: string;               // flattened from slug.current
  summary: string;            // mapped from excerpt in Sanity
  body: any[];                // PortableText blocks from Sanity (rich text + images)
  status?: string;
  category: string;
  publishedAt: string;        // maps directly from Sanity publishedAt
  readTime?: string;          // maps directly from Sanity readTime
  coverImage?: any;           // Sanity image reference for cover image
  content?: string;           // plain-text content for local/fallback articles

  // Legacy / optional fields
  insight_url?: string;
  source?: string;
  risk_note?: string;
  is_featured: boolean;
  chart_url?: string;
  pdf_resource?: string;
  video_link?: string;
  mainImage?: any;            // additional image reference if needed
}

export const INSIGHT_CATEGORIES = [
  "All",
  "Investing",
  "Behavioral Finance",
  "Financial Planning",
  "Global Investing",
  "Market Insights",
  "Investor Education",
] as const;

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
