import { useState } from "react";
import { useParams, Link } from "wouter";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { useListArticles, useListSources } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/article/Sidebar";
import { Button } from "@/components/ui/button";

const COUNTRY_FLAGS: Record<string, string> = {
  "Nigeria": "🇳🇬",
  "South Africa": "🇿🇦",
  "Kenya": "🇰🇪",
  "Egypt": "🇪🇬",
  "Ghana": "🇬🇭",
  "Morocco": "🇲🇦",
  "Ethiopia": "🇪🇹",
  "Tanzania": "🇹🇿",
  "Uganda": "🇺🇬",
  "Algeria": "🇩🇿",
  "Zimbabwe": "🇿🇼",
  "Angola": "🇦🇴",
  "Ivory Coast": "🇨🇮",
  "Tunisia": "🇹🇳",
  "Senegal": "🇸🇳",
  "Rwanda": "🇷🇼",
  "Cameroon": "🇨🇲",
};

const LIMIT = 12;

export default function Country() {
  const { country } = useParams<{ country: string }>();
  const decodedCountry = decodeURIComponent(country || "");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useListArticles({
    country: decodedCountry,
    limit: LIMIT,
    page,
  });

  const { data: sources } = useListSources();
  const countrySources = sources?.filter((s) => s.country === decodedCountry) ?? [];

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;
  const flag = COUNTRY_FLAGS[decodedCountry] ?? "🌍";

  return (
    <AppLayout>
      {/* Country Header */}
      <div className="bg-secondary py-14 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/countries" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" /> All Countries
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-6xl md:text-7xl leading-none" role="img" aria-label={decodedCountry}>{flag}</span>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-primary font-bold tracking-widest uppercase text-xs">Region Focus</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">{decodedCountry}</h1>
              <p className="text-muted-foreground text-base max-w-2xl">
                News from {countrySources.length > 0 ? `${countrySources.length} source${countrySources.length > 1 ? "s" : ""} including ${countrySources.slice(0, 2).map(s => s.name).join(", ")}` : "leading publications"} covering {decodedCountry}.
              </p>
            </div>
          </div>

          {/* Source pills */}
          {countrySources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {countrySources.map((s) => (
                <span key={s.id} className="text-xs bg-background border border-border rounded-full px-3 py-1 font-medium text-muted-foreground">
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <div className="lg:col-span-8">
              {/* Results header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h2 className="font-serif text-2xl font-bold">
                  {data ? `${data.total.toLocaleString()} Articles` : "Latest News"}
                </h2>
                {data && totalPages > 1 && (
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {isLoading || isFetching ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col h-[380px]">
                      <Skeleton className="w-full h-44 rounded-t-xl rounded-b-none" />
                      <div className="p-5 border border-t-0 border-border rounded-b-xl flex-1 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-4/5" />
                        <Skeleton className="h-12 w-full mt-2" />
                      </div>
                    </div>
                  ))
                ) : data?.articles && data.articles.length > 0 ? (
                  data.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-20 bg-secondary/30 rounded-xl border border-dashed border-border">
                    <span className="text-5xl mb-4 block">{flag}</span>
                    <h3 className="font-serif text-2xl font-bold mb-2">No articles yet</h3>
                    <p className="text-muted-foreground">We're collecting articles from {decodedCountry}. Check back shortly.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {data && data.total > LIMIT && (
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
                    onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!data.hasMore || isFetching}
                    className="gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="lg:col-span-4">
              <Sidebar />
            </div>

          </div>
        </div>
      </section>
    </AppLayout>
  );
}
