import { Link } from "wouter";
import { Globe2, ArrowRight, Newspaper } from "lucide-react";
import { useListCountries, useListSources } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

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

const COUNTRY_REGIONS: Record<string, string> = {
  "Nigeria": "West Africa",
  "South Africa": "Southern Africa",
  "Kenya": "East Africa",
  "Egypt": "North Africa",
  "Ghana": "West Africa",
  "Morocco": "North Africa",
  "Ethiopia": "East Africa",
  "Tanzania": "East Africa",
  "Uganda": "East Africa",
  "Algeria": "North Africa",
  "Zimbabwe": "Southern Africa",
  "Angola": "Central Africa",
  "Ivory Coast": "West Africa",
  "Tunisia": "North Africa",
  "Senegal": "West Africa",
  "Rwanda": "East Africa",
  "Cameroon": "Central Africa",
};

export default function Countries() {
  const { data: countries, isLoading: countriesLoading } = useListCountries();
  const { data: sources, isLoading: sourcesLoading } = useListSources();

  const sourcesByCountry = sources?.reduce<Record<string, number>>((acc, source) => {
    acc[source.country] = (acc[source.country] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  const isLoading = countriesLoading || sourcesLoading;

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe2 className="w-8 h-8 text-accent" />
            <span className="text-accent font-bold tracking-widest uppercase text-sm">Browse by Country</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">African Coverage</h1>
          <p className="text-primary-foreground/70 text-lg md:text-xl max-w-3xl">
            Explore news from {countries?.length ?? 0} African countries — from breaking news to in-depth reporting sourced directly from the continent's leading publications.
          </p>
        </div>
      </div>

      {/* Country Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-6 mb-10 pb-8 border-b border-border">
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-primary">{countries?.length ?? "—"}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-1">Countries</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-primary">{sources?.length ?? "—"}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-1">News Sources</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-primary">
                {countries?.reduce((acc, c) => acc + c.articleCount, 0).toLocaleString() ?? "—"}
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-1">Total Articles</div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(12).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-xl" />
              ))}
            </div>
          ) : countries && countries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {countries.map((item) => (
                <Link
                  key={item.country}
                  href={`/country/${encodeURIComponent(item.country)}`}
                  className="group block bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-5xl leading-none" role="img" aria-label={item.country}>
                      {COUNTRY_FLAGS[item.country] ?? "🌍"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                  <h2 className="font-serif text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                    {item.country}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium mb-4">
                    {COUNTRY_REGIONS[item.country] ?? "Africa"}
                  </p>
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Newspaper className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{item.articleCount.toLocaleString()} articles</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {sourcesByCountry[item.country] ?? 0} source{(sourcesByCountry[item.country] ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-border rounded-xl">
              <Globe2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-serif text-2xl font-bold mb-2">No countries yet</h3>
              <p className="text-muted-foreground">Articles are being ingested — check back shortly.</p>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
