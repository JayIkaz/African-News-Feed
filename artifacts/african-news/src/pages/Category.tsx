import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Sidebar } from "@/components/article/Sidebar";
import { ListingFilters, NewerLink, PastTheEnd, ShowMore } from "@/components/article/ListingParts";
import { listingHref } from "@/lib/listing";
import { useListing } from "@/lib/useListing";
import { usePageMeta } from "@/lib/usePageMeta";
import { Inbox } from "lucide-react";

const CATEGORY_META: Record<string, { description: string }> = {
  Politics:      { description: "Elections, governance, policy, and political analysis from across the African continent." },
  Business:      { description: "Markets, trade, corporate news, and business strategy from Africa's leading economies." },
  Technology:    { description: "Innovation, startups, digital transformation, and tech news from the continent." },
  Economy:       { description: "GDP, inflation, fiscal policy, economic growth, and financial analysis." },
  Society:       { description: "Health, education, culture, community, sports, and social issues." },
  Environment:   { description: "Climate, wildlife, conservation, energy, and environmental reporting." },
  International: { description: "Africa on the world stage — diplomacy, foreign affairs, and global events." },
  General:       { description: "A wide range of news and features from across the continent." },
};

const LIMIT = 12;

// The route hands over the section's name ("Politics") and, for a combination,
// the country's, both already matched to the address, so the API gets the exact
// names it stores. `page` is the page the address starts the list on.
export default function Category({ category, country, page }: { category: string; country?: string; page: number }) {
  const list = useListing({ category, country }, page, LIMIT);
  const hrefFor = (p: number) => listingHref({ category, country, page: p });

  const meta = CATEGORY_META[category] ?? {
    description: `Latest news and analysis on ${category.toLowerCase()} from across Africa.`,
  };

  // A page past the end of the list, like a section with nothing in it, is
  // served with status 200 as every other path is, so it asks search engines
  // to skip it. So does a section and country together: those stories are
  // already on the section's page and the country's.
  const pastTheEnd = !list.isLoading && !list.failed && page > 1 && list.articles.length === 0;
  const empty = list.total === 0;
  usePageMeta({
    title: `${country ? `${category} news from ${country}` : `${category} news from Africa`}${page > 1 ? `, page ${page}` : ""} | AfricaNews`,
    description: country ? `${category} headlines from ${country}, collected from news publishers several times a day, with a link to each publisher.` : meta.description,
    noindex: !!country || pastTheEnd || empty,
  });

  return (
    <AppLayout>
      {/* ── Category Hero ── */}
      <div style={{ background: "var(--paper-2)", color: "var(--ink)", padding: "36px 0", marginBottom: 0 }}>
        <div className="an-container">
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
            Section
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--ink)" }}>
              {category}
            </h1>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--ink-3)", maxWidth: 560, fontStyle: "italic" }}>
            {meta.description}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="an-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div className="an-content-with-sidebar">

          <div>
            <ListingFilters category={category} country={country} showCountry />

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 24px", paddingBottom: 16, borderBottom: "1px solid var(--paper-3)" }}>
              <div style={{ width: 4, height: 22, background: "var(--accent)", borderRadius: 2 }} />
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {list.total !== undefined ? `${list.total.toLocaleString()} Articles${country ? ` from ${country}` : ""}` : "Loading…"}
              </h2>
              {country && (
                <Link href={listingHref({ category })} className="an-listing-clear">Show all countries</Link>
              )}
            </div>

            <NewerLink startPage={page} hrefFor={hrefFor} />

            <div className="an-story-list" style={{ marginBottom: 8 }}>
              {list.isLoading ? (
                /* Row-shaped, matching the feed rows that load in */
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="an-skeleton an-skeleton-row" />
                ))
              ) : list.articles.length > 0 ? (
                list.articles.map(article => <ArticleCard key={article.id} article={article} />)
              ) : pastTheEnd ? (
                <PastTheEnd firstHref={hrefFor(1)} />
              ) : (
                <div style={{ gridColumn: "1/4", textAlign: "center", padding: "60px 24px", color: "var(--ink-4)" }}>
                  <Inbox size={40} strokeWidth={1.5} aria-hidden="true" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontFamily: "var(--font-headline)", fontSize: 20, color: "var(--ink-3)", marginBottom: 8 }}>No articles yet</h3>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 14 }}>
                    {country ? `No ${category.toLowerCase()} stories from ${country} yet.` : `Check back soon for ${category.toLowerCase()} updates.`}
                  </p>
                </div>
              )}
              {list.isLoadingMore && Array(3).fill(0).map((_, i) => (
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

          <div className="an-sidebar-col">
            <Sidebar />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
