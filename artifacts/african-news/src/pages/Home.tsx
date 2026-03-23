import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Newspaper, BarChart2, Globe, Rss } from "lucide-react";
import { useListArticles, useGetTopStories } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Sidebar } from "@/components/article/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AdBanner } from "@/components/ads/AdBanner";

const CATEGORY_QUICK_LINKS = [
  { label: "Politics", href: "/category/Politics", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
  { label: "Business", href: "/category/Business", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
  { label: "Technology", href: "/category/Technology", color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" },
  { label: "Economy", href: "/category/Economy", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
  { label: "Society", href: "/category/Society", color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
  { label: "Environment", href: "/category/Environment", color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
  { label: "International", href: "/category/International", color: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100" },
];

export default function Home() {
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data: topStories, isLoading: topStoriesLoading } = useGetTopStories({ limit: 3 });
  const { data: latestNews, isLoading: latestLoading, isFetching } = useListArticles({ page, limit });

  return (
    <AppLayout>
      {/* Platform Stats Strip */}
      <div className="bg-primary/5 border-b border-border py-2.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-accent" /> 14+ African countries</span>
            <span className="flex items-center gap-1.5"><Rss className="w-3.5 h-3.5 text-accent" /> 54 news sources</span>
            <span className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5 text-accent" /> Updated every hour</span>
          </div>
          <Link href="/countries" className="font-medium text-primary hover:text-accent transition-colors flex items-center gap-1">
            Browse by country <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Featured Hero Section */}
      <section className="bg-secondary/30 pt-8 pb-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-bold flex items-center gap-2">
              <span className="w-2 h-8 bg-accent inline-block rounded-sm"></span>
              Top Stories
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {topStoriesLoading ? (
              <>
                <Skeleton className="col-span-1 lg:col-span-2 h-[400px] rounded-xl" />
                <div className="flex flex-col gap-6">
                  <Skeleton className="h-[188px] rounded-xl" />
                  <Skeleton className="h-[188px] rounded-xl" />
                </div>
              </>
            ) : topStories?.articles && topStories.articles.length > 0 ? (
              <>
                <div className="col-span-1 lg:col-span-2">
                  <ArticleCard article={topStories.articles[0]} featured />
                </div>
                <div className="flex flex-col gap-6">
                  {topStories.articles.slice(1, 3).map((article) => (
                    <div key={article.id} className="flex-1">
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No featured stories available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <div className="border-b border-border py-5 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_QUICK_LINKS.map(({ label, href, color }) => (
              <Link
                key={label}
                href={href}
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${color}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Ad Banner — Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdBanner slot="leaderboard" />
      </div>

      {/* Main Content Layout */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left Column: Latest News */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <h2 className="font-serif text-3xl font-bold">Latest News</h2>
                <Link href="/category/International" className="text-sm font-medium text-primary hover:text-accent flex items-center gap-1 transition-colors">
                  All articles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {latestLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col h-[400px]">
                      <Skeleton className="w-full h-48 rounded-t-xl rounded-b-none" />
                      <div className="p-5 border border-t-0 border-border rounded-b-xl flex-1 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-4/5" />
                        <Skeleton className="h-16 w-full mt-4" />
                      </div>
                    </div>
                  ))
                ) : latestNews?.articles && latestNews.articles.length > 0 ? (
                  latestNews.articles.flatMap((article, i) => {
                    const cards = [<ArticleCard key={article.id} article={article} />];
                    if (i === 5) {
                      cards.push(
                        <div key="ad-inline" className="md:col-span-2">
                          <AdBanner slot="inline" />
                        </div>
                      );
                    }
                    return cards;
                  })
                ) : (
                  <div className="col-span-2 text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                    <p>No articles found.</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {latestNews && latestNews.articles.length > 0 && (
                <div className="flex items-center justify-center gap-4 py-8 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1 || isFetching}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Page {page} of {Math.ceil((latestNews.total ?? 0) / limit)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!latestNews.hasMore || isFetching}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-4">
              <Sidebar />
              <div className="mt-6">
                <AdBanner slot="rectangle" />
              </div>
            </div>

          </div>
        </div>
      </section>
    </AppLayout>
  );
}
