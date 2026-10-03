import { useState } from "react";
import { Link } from "wouter";
import { Globe2, ArrowRight, Newspaper } from "lucide-react";
import { useListCountries } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteCounts } from "@/lib/useSiteCounts";
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

  const { data: countries } = useListCountries();
  // Sources are counted the way every other page counts them: active, with a
  // feed, and at least one story delivered. The raw list also holds
  // switched-off sources and ones that never delivered, which would overstate.
  const { deliveredSources, sourceCount, loading: isLoading, ready } = useSiteCounts();

  const sourcesByCountry = deliveredSources.reduce<Record<string, number>>((acc, source) => {
    acc[source.country] = (acc[source.country] ?? 0) + 1;
    return acc;
  }, {});

  const filtered = activeRegion === "All"
    ? (countries ?? [])
    : (countries ?? []).filter((c) => COUNTRY_REGIONS[c.country] === activeRegion);

  const totalArticles = countries?.reduce((acc, c) => acc + c.articleCount, 0) ?? 0;

  return (
    <AppLayout>
      {/* Header */}
      {/* Spec §1: structure comes from hairline dividers and spacing, not
          filled blocks, and colour is reserved for signal. A full-bleed amber
          banner was the largest piece of decorative colour left on the site.
          It now sits on --paper with the eyebrow carrying the accent, which
          also matches how the top story introduces itself. */}
      <div className="py-16" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe2 className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              Browse by Country
            </span>
          </div>
          <h1
            className="text-4xl md:text-6xl mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, lineHeight: 1.15, color: "var(--ink)" }}
          >
            African Coverage
          </h1>
          <p className="text-lg md:text-xl max-w-3xl" style={{ fontFamily: "var(--font-body)", color: "var(--ink-muted)" }}>
            {ready ? `Headlines from publishers in ${countries?.length ?? 0} African countries.` : "Headlines from African publishers, country by country."} Pick a country to see its latest stories.
          </p>
        </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Stats bar. Figures come from the API; a skeleton holds the place
              while they load, and a failed load leaves the bar out. */}
          {(isLoading || ready) && (
            <div className="flex flex-wrap items-center gap-8 mb-10 pb-8 border-b border-border">
              <StatBlock label="Countries" value={ready ? (countries?.length ?? 0).toLocaleString() : null} />
              <div className="w-px h-10 bg-border hidden sm:block" />
              <StatBlock label="News Sources" value={ready ? sourceCount.toLocaleString() : null} />
              <div className="w-px h-10 bg-border hidden sm:block" />
              <StatBlock label="Total Articles" value={ready ? totalArticles.toLocaleString() : null} />
              <div className="w-px h-10 bg-border hidden sm:block" />
              <StatBlock label="Regions" value={(REGIONS.length - 1).toString()} />
            </div>
          )}

          {/* Region filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {REGIONS.map((region) => {
              const isActive = activeRegion === region;
              const count = countries === undefined
                ? null
                : region === "All"
                  ? countries.length
                  : countries.filter((c) => COUNTRY_REGIONS[c.country] === region).length;
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
                  {count !== null && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20" : REGION_BADGE_COLORS[region]
                    }`}>
                      {count}
                    </span>
                  )}
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

function StatBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="text-center">
      <div className="font-serif text-3xl font-bold text-primary">
        {value ?? <Skeleton className="h-9 w-16 mx-auto" />}
      </div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-1">{label}</div>
    </div>
  );
}
