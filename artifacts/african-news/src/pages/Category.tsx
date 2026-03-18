import { useState } from "react";
import { useParams } from "wouter";
import {
  ChevronLeft, ChevronRight,
  Landmark, TrendingUp, Cpu, BarChart2, Users, Leaf, Globe, Newspaper,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { useListArticles } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/article/Sidebar";
import { Button } from "@/components/ui/button";

const CATEGORY_META: Record<string, { description: string; Icon: React.ElementType; color: string }> = {
  Politics: {
    description: "Elections, governance, policy, and political analysis from across the African continent.",
    Icon: Landmark,
    color: "text-blue-400",
  },
  Business: {
    description: "Markets, trade, corporate news, and business strategy from Africa's leading economies.",
    Icon: TrendingUp,
    color: "text-emerald-400",
  },
  Technology: {
    description: "Innovation, startups, digital transformation, and tech news from the continent.",
    Icon: Cpu,
    color: "text-violet-400",
  },
  Economy: {
    description: "GDP, inflation, fiscal policy, economic growth, and financial analysis.",
    Icon: BarChart2,
    color: "text-amber-400",
  },
  Society: {
    description: "Health, education, culture, community, sports, and social issues.",
    Icon: Users,
    color: "text-rose-400",
  },
  Environment: {
    description: "Climate, wildlife, conservation, energy, and environmental reporting.",
    Icon: Leaf,
    color: "text-green-400",
  },
  International: {
    description: "Africa on the world stage — diplomacy, foreign affairs, and global events.",
    Icon: Globe,
    color: "text-sky-400",
  },
  General: {
    description: "A wide range of news and features from across the continent.",
    Icon: Newspaper,
    color: "text-slate-400",
  },
};

const LIMIT = 12;

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category || "");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useListArticles({
    category: decodedCategory,
    limit: LIMIT,
    page,
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;
  const meta = CATEGORY_META[decodedCategory] ?? {
    description: `Latest news and analysis on ${decodedCategory.toLowerCase()} from across Africa.`,
    Icon: Newspaper,
    color: "text-slate-400",
  };
  const { Icon, color, description } = meta;

  return (
    <AppLayout>
      <div className="bg-primary text-primary-foreground py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className={`w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-5 ${color}`}>
              <Icon className="w-7 h-7" />
            </div>
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-3 block">Section</span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 text-white">
              {decodedCategory}
            </h1>
            <p className="text-primary-foreground/70 text-lg md:text-xl">{description}</p>
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h2 className="font-serif text-2xl font-bold">
                  {data ? `${data.total.toLocaleString()} Articles` : "Loading..."}
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
                    <Icon className={`w-12 h-12 mx-auto mb-4 ${color}`} />
                    <h3 className="font-serif text-2xl font-bold mb-2">No articles found</h3>
                    <p className="text-muted-foreground">Check back later for {decodedCategory.toLowerCase()} updates.</p>
                  </div>
                )}
              </div>

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
