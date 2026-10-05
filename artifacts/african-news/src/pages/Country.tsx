import { Link } from "wouter";
import { MapPin, ChevronLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { useListSources } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/article/Sidebar";
import { ListingFilters, NewerLink, PastTheEnd, ShowMore } from "@/components/article/ListingParts";
import { listingHref, sourceHref } from "@/lib/listing";
import { useListing } from "@/lib/useListing";
import { usePageMeta } from "@/lib/usePageMeta";
import { COUNTRY_FLAGS, COUNTRY_REGIONS, REGION_BADGE_COLORS } from "@/lib/countries";

const LIMIT = 12;

// The route hands over the country's name ("South Africa"), already matched to
// the path, so the API gets the exact name it stores. `page` is the page the
// address starts the list on.
export default function Country({ country: decodedCountry, page }: { country: string; page: number }) {
  const list = useListing({ country: decodedCountry }, page, LIMIT);
  const hrefFor = (p: number) => listingHref({ country: decodedCountry, page: p });

  const { data: sources } = useListSources();
  const countrySources = sources?.filter((s) => s.country === decodedCountry) ?? [];

  const flag = COUNTRY_FLAGS[decodedCountry] ?? "";

  const pastTheEnd = !list.isLoading && !list.failed && page > 1 && list.articles.length === 0;
  usePageMeta({
    title: `${decodedCountry} news${page > 1 ? `, page ${page}` : ""} | AfricaNews`,
    description: `Headlines from news publishers in ${decodedCountry}, collected by AfricaNews every hour, with a link to each publisher.`,
    noindex: pastTheEnd || list.total === 0,
  });

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
              {(() => {
                const region = COUNTRY_REGIONS[decodedCountry];
                return region ? (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3 ${REGION_BADGE_COLORS[region]}`}>
                    <MapPin className="w-3 h-3" /> {region}
                  </span>
                ) : null;
              })()}
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">{decodedCountry}</h1>
              <p className="text-muted-foreground text-base max-w-2xl">
                News from {countrySources.length > 0 ? `${countrySources.length} source${countrySources.length > 1 ? "s" : ""} including ${countrySources.slice(0, 2).map(s => s.name).join(", ")}` : "leading publications"} covering {decodedCountry}.
              </p>
            </div>
          </div>

          {/* Source pills */}
          {countrySources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {countrySources.map((s) => {
                const pill = "text-xs bg-background border border-border rounded-full px-3 py-1 font-medium text-muted-foreground";
                // A publisher with no story here has no page worth opening.
                return s.articleCount > 0 ? (
                  <Link key={s.id} href={sourceHref(s.id)} className={`${pill} hover:text-foreground hover:border-foreground transition-colors`}>
                    {s.name}
                  </Link>
                ) : (
                  <span key={s.id} className={pill}>{s.name}</span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <div className="lg:col-span-8">
              <ListingFilters country={decodedCountry} />

              {/* Results header */}
              <div className="flex items-center justify-between mt-5 mb-6 pb-4 border-b border-border">
                <h2 className="font-serif text-2xl font-bold">
                  {list.total !== undefined ? `${list.total.toLocaleString()} Articles` : "Latest News"}
                </h2>
              </div>

              <NewerLink startPage={page} hrefFor={hrefFor} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {list.isLoading ? (
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
                ) : list.articles.length > 0 ? (
                  list.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))
                ) : pastTheEnd ? (
                  <div className="col-span-2"><PastTheEnd firstHref={hrefFor(1)} /></div>
                ) : (
                  <div className="col-span-2 text-center py-20 bg-secondary/30 rounded-xl border border-dashed border-border">
                    <span className="text-5xl mb-4 block">{flag}</span>
                    <h3 className="font-serif text-2xl font-bold mb-2">No articles yet</h3>
                    <p className="text-muted-foreground">We're collecting articles from {decodedCountry}. Check back shortly.</p>
                  </div>
                )}
                {list.isLoadingMore && Array(2).fill(0).map((_, i) => (
                  <div key={`more-${i}`} className="an-skeleton an-skeleton-row" />
                ))}
              </div>

              <ShowMore
                nextPage={list.nextPage}
                hrefFor={hrefFor}
                loading={list.isLoadingMore}
                failed={list.moreFailed}
                shown={list.articles.length}
                total={list.total}
                onMore={list.loadMore}
                onRetry={list.retry}
              />
            </div>

            <div className="lg:col-span-4 an-sidebar-col">
              <Sidebar />
            </div>

          </div>
        </div>
      </section>
    </AppLayout>
  );
}
