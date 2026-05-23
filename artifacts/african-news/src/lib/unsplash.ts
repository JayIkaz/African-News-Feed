import { Article } from "@workspace/api-client-react";

const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "but",
  "is", "are", "was", "were", "be", "been", "has", "have", "had", "with",
  "from", "by", "as", "its", "it", "this", "that", "over", "after", "says",
  "said", "will", "can", "not", "no", "new", "two", "three", "four", "five",
  "into", "than", "more", "also", "about", "out", "up", "down", "per",
]);

const CATEGORY_TERMS: Record<string, string> = {
  Politics:      "politics,government",
  Business:      "business,economy",
  Technology:    "technology,digital",
  Economy:       "economy,finance",
  Society:       "community,people",
  Environment:   "environment,nature",
  International: "diplomacy,international",
  General:       "africa,news",
};

const DIMENSIONS: Record<string, [number, number]> = {
  featured: [900, 600],
  side:     [600, 400],
  card:     [800, 500],
  compact:  [200, 200],
};

function buildQueryTerms(article: Article): string {
  const titleKeywords = (article.title || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w))
    .slice(0, 2);

  const categoryTerms = CATEGORY_TERMS[article.category || "General"] ?? "africa,news";
  const country = (article.country || "africa")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .split(",")[0]
    .trim();

  return [...titleKeywords, ...categoryTerms.split(","), country]
    .filter(Boolean)
    .join(",");
}

export function getArticleImage(
  article: Article,
  size: "featured" | "side" | "card" | "compact" = "card",
): string {
  if (article.imageUrl) {
    return article.imageUrl;
  }

  const [w, h] = DIMENSIONS[size];
  const query = buildQueryTerms(article);
  const lock = Math.abs(Number(article.id) || 0);
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(query)}?lock=${lock}`;
}
