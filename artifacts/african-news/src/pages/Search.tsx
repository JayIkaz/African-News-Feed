import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Search as SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { useSearchArticles, getSearchArticlesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/lib/usePageMeta";

const LIMIT = 20;

// The query and the page number live in the address (/search?q=ghana&page=2),
// so a results page can be shared and the Back button returns to it.
function searchHref(q: string, page = 1): string {
  const params = new URLSearchParams({ q });
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

export default function Search() {
  const params = new URLSearchParams(useSearch());
  const query = (params.get("q") ?? "").trim();
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const [, navigate] = useLocation();

  // The box starts with the current query and follows it when the query
  // changes from outside, for example from the header's search field.
  const [draft, setDraft] = useState(query);
  useEffect(() => setDraft(query), [query]);

  // Results for a made-up query are not worth indexing, and the same words
  // are already reachable through the section and country pages.
  usePageMeta({
    title: query ? `Search: ${query} | AfricaNews` : "Search | AfricaNews",
    noindex: true,
  });

  const searchParams = { q: query, limit: LIMIT, page };
  const { data, isLoading, isFetching } = useSearchArticles(searchParams, {
    query: {
      queryKey: getSearchArticlesQueryKey(searchParams),
      enabled: !!query,
    },
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = draft.trim();
    if (next) navigate(searchHref(next));
  };

  const goTo = (target: number) => {
    navigate(searchHref(query, target));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppLayout>
      <div className="bg-background py-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-primary mb-6">
            <SearchIcon className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            {query ? `Search results for "${query}"` : "Search articles"}
          </h1>
          <form onSubmit={submit} role="search" className="mx-auto flex max-w-xl gap-2">
            <input
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search news, topics, countries…"
              aria-label="Search news, topics and countries"
              autoFocus={!query}
              className="flex-1 min-w-0 h-11 rounded-md border border-border bg-background px-4 text-base"
            />
            <Button type="submit" className="h-11 px-6">Search</Button>
          </form>
        </div>
      </div>

      <section className="py-12 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {!query ? (
            <div className="text-center py-24 text-muted-foreground">
              <p>Type a word or phrase above to find articles.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h2 className="font-serif text-2xl font-bold">
                  {data ? `${data.total.toLocaleString()} article${data.total !== 1 ? "s" : ""}` : "Results"}
                </h2>
                {data && totalPages > 1 && (
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                )}
              </div>

              <div className="an-story-list mb-10">
                {isLoading || isFetching ? (
                  Array(8).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col h-[350px]">
                      <Skeleton className="w-full h-40 rounded-t-xl rounded-b-none" />
                      <div className="p-4 border border-t-0 border-border rounded-b-xl flex-1 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-10 w-full mt-2" />
                      </div>
                    </div>
                  ))
                ) : data?.articles && data.articles.length > 0 ? (
                  data.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 bg-background rounded-xl border border-dashed border-border">
                    <h3 className="font-serif text-2xl font-bold mb-2">No results found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms or exploring our categories.</p>
                  </div>
                )}
              </div>

              {data && data.total > LIMIT && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => goTo(Math.max(1, page - 1))}
                    disabled={page === 1 || isFetching}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let p = i + 1;
                      if (totalPages > 5 && page > 3) p = page - 2 + i;
                      if (p > totalPages) return null;
                      return (
                        <button
                          key={p}
                          onClick={() => goTo(p)}
                          aria-current={p === page ? "page" : undefined}
                          className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                            p === page
                              ? "bg-primary text-primary-foreground"
                              : "border border-border hover:bg-secondary"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => goTo(page + 1)}
                    disabled={!data.hasMore || isFetching}
                    className="gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
