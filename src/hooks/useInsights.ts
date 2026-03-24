import { useQuery } from "@tanstack/react-query";
import { fetchInsights, fetchFeaturedInsights } from "@/services/insightsService";
import type { Insight } from "@/types/insight";
import { useMemo, useState } from "react";

export function useInsights() {
  const query = useQuery<Insight[]>({
    queryKey: ["insights"],
    queryFn: fetchInsights,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
  return query;
}

export function useFeaturedInsights() {
  return useQuery<Insight[]>({
    queryKey: ["insights", "featured"],
    queryFn: fetchFeaturedInsights,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFilteredInsights() {
  const { data: insights = [], isLoading, error } = useInsights();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = insights;
    if (category !== "All") {
      result = result.filter((i) => i.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [insights, category, search]);

  const categories = useMemo(() => {
    const cats = new Set(insights.map((i) => i.category));
    return ["All", ...Array.from(cats).sort()];
  }, [insights]);

  return {
    insights: filtered,
    allInsights: insights,
    isLoading,
    error,
    category,
    setCategory,
    search,
    setSearch,
    categories,
  };
}
