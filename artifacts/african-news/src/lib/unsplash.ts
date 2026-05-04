import { Article } from "@workspace/api-client-react";

const CATEGORY_SEEDS: Record<string, string[]> = {
  Politics: [
    "parliament-africa",
    "government-summit",
    "election-vote",
    "diplomatic-meeting",
    "national-assembly",
    "political-rally",
  ],
  Business: [
    "africa-business",
    "lagos-skyline",
    "nairobi-office",
    "trade-market",
    "corporate-meeting",
    "economic-hub",
  ],
  Technology: [
    "tech-innovation",
    "mobile-africa",
    "digital-future",
    "startup-hub",
    "silicon-savanna",
    "coding-africa",
  ],
  Economy: [
    "stock-exchange",
    "financial-market",
    "currency-trade",
    "economic-growth",
    "banking-africa",
    "commodity-market",
  ],
  Society: [
    "africa-community",
    "street-market",
    "urban-africa",
    "festival-culture",
    "family-africa",
    "youth-africa",
  ],
  Environment: [
    "african-savanna",
    "wildlife-africa",
    "green-landscape",
    "rainforest-africa",
    "desert-dunes",
    "river-africa",
  ],
  International: [
    "united-nations",
    "world-diplomacy",
    "global-summit",
    "international-trade",
    "africa-globe",
    "world-flags",
  ],
  General: [
    "africa-news",
    "newspaper-press",
    "journalism-africa",
    "breaking-news",
    "media-africa",
    "reporter-field",
  ],
};

const DIMENSIONS: Record<string, string> = {
  featured: "900/600",
  side: "600/400",
  card: "800/500",
  compact: "200/200",
};

export function getArticleImage(article: Article, size: "featured" | "side" | "card" | "compact" = "card"): string {
  const cat = article.category || "General";
  const seeds = CATEGORY_SEEDS[cat] ?? CATEGORY_SEEDS["General"];
  const index = Math.abs(Number(article.id) || 0) % seeds.length;
  const seed = seeds[index];
  const dim = DIMENSIONS[size];
  return `https://picsum.photos/seed/${seed}-${article.id}/${dim}`;
}
