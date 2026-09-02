import type { Article } from "@workspace/api-client-react";

// Spec §4 and §6 both call for a "breaking" state — a --live eyebrow on the
// top story, and a --live tag that REPLACES the category tag in a feed row.
// The Article schema has no isBreaking field to drive either, so this derives
// the state from recency as a stand-in.
//
// This is deliberately the only place that decision lives. When the API grows
// a real flag, this function body becomes `return article.isBreaking === true`
// and every call site is already correct.
export const BREAKING_WINDOW_MINUTES = 60;

export function isBreakingStory(
  article: Pick<Article, "publishedDate">,
  now: number = Date.now(),
): boolean {
  if (!article.publishedDate) return false;

  const published = new Date(article.publishedDate).getTime();
  if (Number.isNaN(published)) return false;

  const ageMs = now - published;
  // Future-dated articles (source clock skew, scheduled posts) are not
  // breaking — without this a bad timestamp would pin a story to "Breaking"
  // indefinitely.
  if (ageMs < 0) return false;

  return ageMs <= BREAKING_WINDOW_MINUTES * 60_000;
}
