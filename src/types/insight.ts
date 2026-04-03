export interface Insight {
  id: string;
  title: string;
  slug: string;               // flattened from slug.current
  summary: string;            // mapped from excerpt in Sanity
  category: string;
  publish_date: string;
  insight_url?: string;
  source?: string;
  risk_note?: string;
  is_featured: boolean;
  chart_url?: string;
  pdf_resource?: string;
  video_link?: string;
  content?: string;           // legacy plain text content
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[];               // Sanity Portable Text blocks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mainImage?: any;            // Sanity image reference
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
