import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { getListArticlesQueryOptions, type Article, type ListArticlesParams } from "@workspace/api-client-react";

export interface ListingResult {
  articles: Article[];
  // Stories in the whole list, from the first page loaded.
  total: number | undefined;
  // The page a "Show more" link leads to, or null when the list has ended.
  nextPage: number | null;
  // The first page is still on its way.
  isLoading: boolean;
  // A page after the first is on its way.
  isLoadingMore: boolean;
  // The first page could not be loaded.
  failed: boolean;
  // The last page loaded could not be loaded.
  moreFailed: boolean;
  loadMore: () => void;
  retry: () => void;
}

// One list of stories, read a page at a time starting at `startPage`.
//
// The address of a list names the page it starts on (?page=3). "Show more" is a
// link to the next page, and with JavaScript it adds that page under the ones
// already shown instead of leaving. The address stays where the list started,
// so reloading or sharing it gives the same starting point, and the link's own
// address (?page=4) is what a crawler or a new tab follows.
export function useListing(
  filter: Pick<ListArticlesParams, "category" | "country" | "sourceId">,
  startPage: number,
  limit: number,
): ListingResult {
  // How many pages beyond the first are shown, kept per list so changing the
  // filter or the start page begins again without a frame of the old rows.
  const identity = JSON.stringify([filter, startPage, limit]);
  const [state, setState] = useState({ identity, extra: 0 });
  const extra = state.identity === identity ? state.extra : 0;

  const pages = Array.from({ length: extra + 1 }, (_, i) => startPage + i);
  const results = useQueries({
    queries: pages.map((page) => getListArticlesQueryOptions({ ...filter, page, limit })),
  });

  // The same story can fall on two pages when new ones arrive between the
  // fetches and push the older ones down, so a story is listed once.
  const seen = new Set<number>();
  const articles: Article[] = [];
  for (const result of results) {
    for (const article of result.data?.articles ?? []) {
      if (seen.has(article.id)) continue;
      seen.add(article.id);
      articles.push(article);
    }
  }

  const first = results[0];
  const last = results[results.length - 1];

  // The link leads on from the last page that has arrived. While the next page
  // is loading, or after it failed, that is still the page being asked for.
  let lastArrived = -1;
  results.forEach((result, i) => { if (result.data) lastArrived = i; });
  const nextPage = lastArrived >= 0 && results[lastArrived].data?.hasMore ? pages[lastArrived] + 1 : null;

  return {
    articles,
    total: first.data?.total,
    nextPage,
    isLoading: first.isPending,
    isLoadingMore: results.length > 1 && last.isPending,
    failed: first.isError && !first.data,
    moreFailed: results.length > 1 && last.isError && !last.data,
    loadMore: () => setState({ identity, extra: extra + 1 }),
    retry: () => void last.refetch(),
  };
}
