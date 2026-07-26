import { useState } from "react";
import { Link } from "wouter";
import { Globe2, ArrowRight, Newspaper } from "lucide-react";
import { useListCountries, useListSources } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { CountryFlag } from "@/components/common/CountryFlag";
import {
  COUNTRY_REGIONS,
  REGIONS,
  REGION_COLORS,
  REGION_BADGE_COLORS,
  type Region,
} from "@/lib/countries";

export default function Countries() {
  const [activeRegion, setActiveRegion] = useState<Region>("All");

  const { data: countries, isLoading: countriesLoading } = useListCountries();
  const { data: sources, isLoading: sourcesLoading } = useListSources();

  const sourcesByCountry = sources?.reduce<Record<string, number>>((acc, source) => {
    acc[source.country] = (acc[source.country] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  const isLoading = countriesLoading || sourcesLoading;

  const filtered = activeRegion === "All"
    ? (countries ?? [])
    : (countries ?? []).filter((c) => COUNTRY_REGIONS[c.country] === activeRegion);

  const totalArticles = countries?.reduce((acc, c) => acc + c.articleCount, 0) ?? 0;

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

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-8 mb-10 pb-8 border-b border-border">
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
              <div className="font-serif text-3xl font-bold text-primary">{totalArticles.toLocaleString()}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-1">Total Articles</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-primary">5</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-1">Regions</div>
            </div>
          </div>

          {/* Region filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {REGIONS.map((region) => {
              const isActive = activeRegion === region;
              const count = region === "All"
                ? countries?.length ?? 0
                : countries?.filter((c) => COUNTRY_REGIONS[c.country] === region).length ?? 0;
              return (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    isActive
                      ? `${REGION_COLORS[region]} border-transparent shadow-sm`
                      : "border-border bg-background hover:border-primary hover:bg-secondary"
                  }`}
                >
                  {region}
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20" : REGION_BADGE_COLORS[region]
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Region label when filtered */}
          {activeRegion !== "All" && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 text-sm font-semibold ${REGION_BADGE_COLORS[activeRegion]}`}>
              <span>{activeRegion}</span>
              <span>·</span>
              <span>{filtered.length} countr{filtered.length !== 1 ? "ies" : "y"}</span>
            </div>
          )}

          {/* Country Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(12).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item) => {
                const region = COUNTRY_REGIONS[item.country] ?? "Africa";
                return (
                  <Link
                    key={item.country}
                    href={`/country/${encodeURIComponent(item.country)}`}
                    className="group block bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <CountryFlag country={item.country} size={44} />
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                    </div>
                    <h2 className="font-serif text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                      {item.country}
                    </h2>
                    <p className={`text-xs font-semibold mb-4 inline-flex items-center px-2 py-0.5 rounded-full ${REGION_BADGE_COLORS[region as Region] ?? REGION_BADGE_COLORS.All}`}>
                      {region}
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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-border rounded-xl">
              <Globe2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-serif text-2xl font-bold mb-2">No countries in this region yet</h3>
              <p className="text-muted-foreground">Articles are still being collected — check back shortly.</p>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
