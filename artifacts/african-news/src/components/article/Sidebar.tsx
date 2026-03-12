import { Link } from "wouter";
import { TrendingUp, Globe2, Activity } from "lucide-react";
import { useGetTrendingArticles, useListCountries } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCard } from "./ArticleCard";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const { data: trendingData, isLoading: trendingLoading } = useGetTrendingArticles({ limit: 5 });
  const { data: countries, isLoading: countriesLoading } = useListCountries();

  return (
    <aside className="w-full space-y-10">
      {/* Trending Section */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <h3 className="font-serif font-bold text-xl">Trending Now</h3>
        </div>
        
        <div className="flex flex-col">
          {trendingLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-border last:border-0">
                <Skeleton className="w-24 h-24 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))
          ) : trendingData?.articles && trendingData.articles.length > 0 ? (
            trendingData.articles.map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No trending articles right now.</p>
          )}
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif font-bold text-xl">Top Regions</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {countriesLoading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))
          ) : countries ? (
            countries.slice(0, 12).map((country) => (
              <Link key={country.country} href={`/country/${country.country}`}>
                <Badge variant="secondary" className="px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-sm font-medium">
                  {country.country}
                  <span className="ml-1.5 opacity-50 text-xs">{country.articleCount}</span>
                </Badge>
              </Link>
            ))
          ) : null}
        </div>
      </div>

      {/* Newsletter Promo */}
      <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="w-24 h-24" />
        </div>
        <h3 className="font-serif font-bold text-xl mb-2 relative z-10">Morning Briefing</h3>
        <p className="text-primary-foreground/80 text-sm mb-4 relative z-10">
          Start your day with the most important stories from across the continent.
        </p>
        <button className="w-full bg-white text-primary font-bold py-2.5 rounded-md hover:bg-accent hover:text-white transition-colors relative z-10 shadow-sm">
          Sign Up Free
        </button>
      </div>
    </aside>
  );
}
