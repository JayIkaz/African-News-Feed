import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Newspaper } from "lucide-react";
import { useListArticles, useGetTopStories } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Sidebar } from "@/components/article/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data: topStories, isLoading: topStoriesLoading } = useGetTopStories({ limit: 3 });
  const { data: latestNews, isLoading: latestLoading, isFetching } = useListArticles({ page, limit });

  return (
    <AppLayout>
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

      {/* Main Content Layout */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Latest News */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <h2 className="font-serif text-3xl font-bold">Latest News</h2>
                <Link href="/category/Politics" className="text-sm font-medium text-primary hover:text-accent flex items-center gap-1 transition-colors">
                  View All <ArrowRight className="w-4 h-4" />
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
                  latestNews.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))
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
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                  >
                    Previous Page
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Page {page} of {Math.ceil(latestNews.total / limit)}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => p + 1)}
                    disabled={!latestNews.hasMore || isFetching}
                  >
                    Next Page
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-4">
              <Sidebar />
            </div>

          </div>
        </div>
      </section>
    </AppLayout>
  );
}
