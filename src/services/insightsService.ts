import type { Insight } from "@/types/insight";
import { generateSlug, titleCase } from "@/types/insight";

// Published Google Sheet CSV URL
const PUBLISHED_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQviqVcxlcCVptRpk8WSL_sYdFS733mnz-gLvmEyJmHsvCTYL0dhhv0bSzY0m3ridQLLLNFukpMEK1S/pub?output=csv";

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map((h) =>
    h.replace(/^"|"$/g, "").trim().toLowerCase().replace(/\s+/g, "_")
  );

  return lines.slice(1).map((line) => {
    const values = parseCSVRow(line);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = (values[i] || "").replace(/^"|"$/g, "");
    });
    return row;
  });
}

function normalizeStatus(raw: string): Insight["status"] {
  const upper = (raw || "").toUpperCase().trim();
  if (upper === "PUBLISHED" || upper === "ACTIVE") return "PUBLISHED";
  if (upper === "ARCHIVED") return "ARCHIVED";
  return "DRAFT";
}

function normalizeFeatured(raw: string): boolean {
  const upper = (raw || "").toUpperCase().trim();
  return upper === "TRUE" || upper === "YES";
}

function rowToInsight(row: Record<string, string>): Insight {
  const title = row.title || "";
  return {
    id: row.id || "",
    title,
    slug: generateSlug(title),
    summary: row.summary || "",
    category: titleCase(row.category || ""),
    publish_date: row.publish_date || "",
    insight_url: row.insight_url || "",
    source: row.source || "",
    risk_note:
      row.risk_note ||
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: normalizeFeatured(row.is_featured),
    status: normalizeStatus(row.status),
    chart_url: row.chart_url || undefined,
    pdf_resource: row.pdf_resource || undefined,
    video_link: row.video_link || undefined,
  };
}

// Fallback data when Google Sheet is unreachable
const fallbackInsights: Insight[] = [
  {
    id: "INS001",
    title: "Why Asset Allocation Matters More Than Stock Picking",
    slug: "why-asset-allocation-matters-more-than-stock-picking",
    summary:
      "Historical evidence suggests that long-term portfolio returns are driven primarily by how assets are allocated across asset classes, rather than by individual stock selection.",
    category: "Financial Planning",
    publish_date: "March 2026",
    insight_url: "",
    source: "AMFI / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
  },
  {
    id: "INS002",
    title: "The Psychology of Selling During Market Declines",
    slug: "the-psychology-of-selling-during-market-declines",
    summary:
      "Understanding why investors may sell during market downturns — and how disciplined planning frameworks can help manage emotional decision-making.",
    category: "Behavioral Finance",
    publish_date: "February 2026",
    insight_url: "",
    source: "Behavioral Finance Research / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
  },
  {
    id: "INS003",
    title: "When Should You Start Planning for Retirement?",
    slug: "when-should-you-start-planning-for-retirement",
    summary:
      "Starting early allows more time for the potential benefits of compounding. This article explores the role of time horizon in retirement planning.",
    category: "Financial Planning",
    publish_date: "January 2026",
    insight_url: "",
    source: "AMFI / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: true,
    status: "PUBLISHED",
  },
];

export async function fetchInsights(): Promise<Insight[]> {
  try {
    const response = await fetch(PUBLISHED_CSV_URL);
    if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
    const csv = await response.text();
    const rows = parseCSV(csv);
    const insights = rows.map(rowToInsight).filter((i) => i.status === "PUBLISHED");
    if (insights.length > 0) return insights;
    throw new Error("No published insights in sheet");
  } catch (error) {
    console.warn("Using fallback insights:", error);
    return fallbackInsights;
  }
}

export async function fetchFeaturedInsights(): Promise<Insight[]> {
  const all = await fetchInsights();
  return all.filter((i) => i.is_featured);
}

export async function fetchInsightsByCategory(category: string): Promise<Insight[]> {
  const all = await fetchInsights();
  if (category === "All") return all;
  return all.filter((i) => i.category === category);
}

export async function fetchInsightBySlug(slug: string): Promise<Insight | null> {
  const all = await fetchInsights();
  return all.find((i) => i.slug === slug) || null;
}
