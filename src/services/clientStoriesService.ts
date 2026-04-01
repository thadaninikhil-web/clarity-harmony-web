import { sanityClient } from "@/lib/sanity";
import type { ClientStory } from "@/types/clientStory";

const STORIES_QUERY = `*[_type == "clientStory"] | order(display_order asc) {
  _id, title, situation, strategy, outcome, display_order, is_featured
}`;

const FEATURED_STORIES_QUERY = `*[_type == "clientStory" && is_featured == true] | order(display_order asc) {
  _id, title, situation, strategy, outcome, display_order, is_featured
}`;

// Fallback data when Sanity has no content yet
const fallbackStories: ClientStory[] = [
  {
    _id: "fallback-1",
    title: "Cross-Border Clarity for an NRI",
    situation: "An NRI based out of Singapore with assets across India, Singapore and USA. Assets were mostly in savings account or low yielding deposits with certain investments in US stocks and ETFs",
    strategy: "Clarified financial goals, aligned asset allocation across three geographies with goal horizons and risk considerations, and highlighted rebalancing needs. Also assessed Ireland-domiciled UCITS as a tax-efficient alternative to US-listed ETFs.",
    outcome: "Achieved clarity on all goals, initiated rebalancing over 18 to 24 months in a tax efficient manner. Each goal now has assets and future investments aligned to them.",
    display_order: 1,
    is_featured: true,
  },
  {
    _id: "fallback-2",
    title: "Building a Foundation for the Future",
    situation: "Singapore domiciled NRI planning to start a family soon who was investing mostly based on advice from friends or family",
    strategy: "Comprehensive plan distributing incremental investments across India and Global Equities with execution in a systematic manner. Each investment serves a specific purpose in life.",
    outcome: "Automated investments across geographies on track to meet goals ranging from education to retirement to starting up in the long run",
    display_order: 2,
    is_featured: true,
  },
  {
    _id: "fallback-3",
    title: "From Product-Led to Goal-Led Investing",
    situation: "A senior corporate professional based in Mumbai had investments primarily in real estate, low yielding endowment / money back policies, and certain Mutual Funds through SIPs",
    strategy: "Created a complete financial plan allocating assets to goals. Realigned equity mutual funds investments into core (stable) and satellite (high return high risk) as per time remaining to goal.",
    outcome: "Outcome based investing aligned to goals rather than different assets bought at different points of time in the quest for returns",
    display_order: 3,
    is_featured: true,
  },
];

export async function fetchClientStories(): Promise<ClientStory[]> {
  try {
    const stories = await sanityClient.fetch<ClientStory[]>(STORIES_QUERY);
    return stories.length > 0 ? stories : fallbackStories;
  } catch {
    return fallbackStories;
  }
}

export async function fetchFeaturedClientStories(): Promise<ClientStory[]> {
  try {
    const stories = await sanityClient.fetch<ClientStory[]>(FEATURED_STORIES_QUERY);
    return stories.length > 0 ? stories : fallbackStories.filter((s) => s.is_featured);
  } catch {
    return fallbackStories.filter((s) => s.is_featured);
  }
}
