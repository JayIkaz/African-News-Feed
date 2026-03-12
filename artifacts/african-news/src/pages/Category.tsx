import { useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { useListArticles } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/article/Sidebar";

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category || "");

  const { data, isLoading } = useListArticles({ category: decodedCategory, limit: 12 });

  return (
    <AppLayout>
      {/* Category Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">Section</span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">{decodedCategory}</h1>
            <p className="text-primary-foreground/70 text-lg md:text-xl">
              Latest news, analysis, and insights on {decodedCategory.toLowerCase()} from across the African continent.
            </p>
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col h-[400px]">
                      <Skeleton className="w-full h-48 rounded-t-xl rounded-b-none" />
                      <div className="p-5 border border-t-0 border-border rounded-b-xl flex-1 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-16 w-full mt-4" />
                      </div>
                    </div>
                  ))
                ) : data?.articles && data.articles.length > 0 ? (
                  data.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-20 bg-secondary/30 rounded-xl border border-dashed border-border">
                    <h3 className="font-serif text-2xl font-bold mb-2">No articles found</h3>
                    <p className="text-muted-foreground">Check back later for updates in {decodedCategory}.</p>
                  </div>
                )}
              </div>
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
