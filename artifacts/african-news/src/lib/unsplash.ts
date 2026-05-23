import { Article } from "@workspace/api-client-react";

const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "but",
  "is", "are", "was", "were", "be", "been", "has", "have", "had", "with",
  "from", "by", "as", "its", "it", "this", "that", "over", "after", "says",
  "said", "will", "can", "not", "no", "new", "two", "three", "four", "five",
  "into", "than", "more", "also", "about", "out", "up", "down", "per",
]);

const CATEGORY_CONTEXT: Record<string, string> = {
  Politics:      "politics-governance",
  Business:      "business-economy",
  Technology:    "technology-digital",
  Economy:       "economy-finance",
  Society:       "community-society",
  Environment:   "environment-nature",
  International: "international-diplomacy",
  General:       "africa-news",
};

const DIMENSIONS: Record<string, string> = {
  featured: "900/600",
  side:     "600/400",
  card:     "800/500",
  compact:  "200/200",
};

function buildContextualSeed(article: Article): string {
  const titleWords = (article.title || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 3);

  const categoryCtx = CATEGORY_CONTEXT[article.category || "General"] ?? "africa-news";
  const country = (article.country || "africa").toLowerCase().replace(/\s+/g, "-");

  const parts = [...titleWords, categoryCtx, country].filter(Boolean).join("-");
  return `${parts}-${article.id}`;
}

export function getArticleImage(
  article: Article,
  size: "featured" | "side" | "card" | "compact" = "card",
): string {
  if (article.imageUrl) {
    return article.imageUrl;
  }

  const seed = buildContextualSeed(article);
  const dim = DIMENSIONS[size];
  return `https://picsum.photos/seed/${seed}/${dim}`;
}
