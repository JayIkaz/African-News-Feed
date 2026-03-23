import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { useSearchArticles } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const LIMIT = 20;

export default function Search() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [location] = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setPage(1);
    }
  }, [location]);

  const { data, isLoading, isFetching } = useSearchArticles(
    { q: query, limit: LIMIT, page },
    { query: { enabled: !!query } }
  );

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <AppLayout>
      <div className="bg-background py-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-primary mb-6">
            <SearchIcon className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
            {query ? `Search Results for "${query}"` : "Search Articles"}
          </h1>
          {data && (
            <p className="text-muted-foreground text-lg">
              Found {data.total.toLocaleString()} article{data.total !== 1 ? "s" : ""} matching your query
            </p>
          )}
        </div>
      </div>

      <section className="py-12 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {!query ? (
            <div className="text-center py-24 text-muted-foreground">
              <p>Enter a search term in the header to find articles.</p>
            </div>
          ) : (
            <>
              {data && totalPages > 1 && (
                <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
                  <span>Page {page} of {totalPages}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
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
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
                          onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
