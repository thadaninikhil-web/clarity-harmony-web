import type { Insight } from "@/types/insight";

// To use: Create a Google Sheet with columns matching the Insight type,
// then publish it: File → Share → Publish to web → Select "Comma-separated values (.csv)"
// Paste the sheet ID below.
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || "";
const SHEET_URL = SHEET_ID
  ? `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`
  : "";

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

function rowToInsight(row: Record<string, string>): Insight {
  return {
    id: row.id || "",
    title: row.title || "",
    summary: row.summary || "",
    category: row.category || "",
    publish_date: row.publish_date || "",
    insight_url: row.insight_url || "",
    source: row.source || "",
    risk_note:
      row.risk_note ||
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: (row.is_featured || "").toUpperCase() === "TRUE",
    status: (row.status?.toUpperCase() as Insight["status"]) || "DRAFT",
    chart_url: row.chart_url || undefined,
    pdf_resource: row.pdf_resource || undefined,
    video_link: row.video_link || undefined,
  };
}

// Fallback data when no Google Sheet is configured
const fallbackInsights: Insight[] = [
  {
    id: "INS001",
    title: "Why Asset Allocation Matters More Than Stock Picking",
    summary:
      "Historical evidence suggests that long-term portfolio returns are driven primarily by how assets are allocated across asset classes, rather than by individual stock selection.",
    category: "Investing",
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
  {
    id: "INS004",
    title: "Why Indian Investors May Consider Looking Beyond Domestic Markets",
    summary:
      "Geographic diversification may help reduce concentration risk and provide access to sectors and companies not available in Indian markets. This is an educational overview, not a recommendation.",
    category: "Global Investing",
    publish_date: "December 2025",
    insight_url: "",
    source: "AMFI / Scheme Factsheets / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: false,
    status: "PUBLISHED",
  },
  {
    id: "INS005",
    title: "Staying Disciplined During Market Volatility",
    summary:
      "Market corrections are a natural part of investing. This article discusses how a disciplined approach and periodic rebalancing may help navigate volatile periods.",
    category: "Market Insights",
    publish_date: "November 2025",
    insight_url: "",
    source: "Historical Market Data / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: false,
    status: "PUBLISHED",
  },
  {
    id: "INS006",
    title: "The Potential Impact of Delaying Financial Planning",
    summary:
      "Delaying planning may affect not just potential investment growth, but also tax efficiency, insurance adequacy, and goal clarity. An educational perspective on starting early.",
    category: "Financial Planning",
    publish_date: "October 2025",
    insight_url: "",
    source: "AMFI / Public Data",
    risk_note:
      "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.",
    is_featured: false,
    status: "PUBLISHED",
  },
];

export async function fetchInsights(): Promise<Insight[]> {
  if (!SHEET_URL) {
    console.info("No Google Sheet ID configured. Using fallback insights data.");
    return fallbackInsights.filter((i) => i.status === "PUBLISHED");
  }

  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
    const csv = await response.text();
    const rows = parseCSV(csv);
    return rows.map(rowToInsight).filter((i) => i.status === "PUBLISHED");
  } catch (error) {
    console.error("Failed to fetch insights from Google Sheet:", error);
    return fallbackInsights.filter((i) => i.status === "PUBLISHED");
  }
}

export async function fetchFeaturedInsights(): Promise<Insight[]> {
  const all = await fetchInsights();
  return all.filter((i) => i.is_featured);
}

export async function fetchInsightsByCategory(
  category: string
): Promise<Insight[]> {
  const all = await fetchInsights();
  if (category === "All") return all;
  return all.filter((i) => i.category === category);
}
