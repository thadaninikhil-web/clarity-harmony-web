export interface Insight {
  id: string;
  title: string;
  summary: string;
  category: string;
  publish_date: string;
  insight_url: string;
  source: string;
  risk_note: string;
  is_featured: boolean;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  chart_url?: string;
  pdf_resource?: string;
  video_link?: string;
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
