import { useQuery } from "@tanstack/react-query";
import { fetchClientStories, fetchFeaturedClientStories } from "@/services/clientStoriesService";
import type { ClientStory } from "@/types/clientStory";

export function useClientStories() {
  return useQuery<ClientStory[]>({
    queryKey: ["clientStories"],
    queryFn: fetchClientStories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedClientStories() {
  return useQuery<ClientStory[]>({
    queryKey: ["clientStories", "featured"],
    queryFn: fetchFeaturedClientStories,
    staleTime: 5 * 60 * 1000,
  });
}
