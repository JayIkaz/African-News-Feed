import { Fragment, useEffect, useState, useRef } from "react";
import { useSearch } from "wouter";
import { useGetTopStories, useListCountries } from "@workspace/api-client-react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { TopStoriesCarousel } from "@/components/article/TopStoriesCarousel";
import { Sidebar } from "@/components/article/Sidebar";
import { ListingFilters, NewerLink, PastTheEnd, ShowMore } from "@/components/article/ListingParts";
import { PulseDivider } from "@/components/common/PulseDivider";
import { AdBanner } from "@/components/ads/AdBanner";
import { Inbox } from "lucide-react";
import { useReadHistory } from "@/lib/useReadHistory";
import { useSiteCounts } from "@/lib/useSiteCounts";
import { listingHref, parseListingQuery } from "@/lib/listing";
import { useListing } from "@/lib/useListing";
import { usePageMeta } from "@/lib/usePageMeta";

const LIMIT = 10;

export default function Home() {
  const { page } = parseListingQuery(useSearch(), false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { isRead, markAllRead, clearHistory, readIds } = useReadHistory();
  const hrefFor = (p: number) => listingHref({ page: p });

  const { data: topStories, isLoading: topLoading } = useGetTopStories({ limit: 3 });
  const list = useListing({}, page, LIMIT);
  const pastTheEnd = !list.isLoading && !list.failed && page > 1 && list.articles.length === 0;
  // The first page keeps the title of index.html; later pages say which page
  // they are, so no two share one.
  usePageMeta({
    title: page > 1 ? `Latest African news, page ${page} | AfricaNews` : undefined,
    noindex: pastTheEnd,
  });
  const { data: countries } = useListCountries();
  const { sourceCount, countryCount, loading: statsLoading, ready: statsReady } = useSiteCounts();
  const totalArticles = (countries ?? []).reduce((sum, c) => sum + c.articleCount, 0);
  const stats = [
    { value: countryCount, label: "African countries", wide: false },
    { value: sourceCount, label: "news sources", wide: false },
    { value: totalArticles, label: "articles indexed", wide: true },
  ];

  // On a phone the strip scrolls sideways. A scrolling region has to be
  // reachable by keyboard, but where it fits it is not a control, so it gets a
  // tab stop only while it overflows.
  const stripRef = useRef<HTMLDivElement>(null);
  const [stripScrolls, setStripScrolls] = useState(false);
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const update = () => setStripScrolls(el.scrollWidth > el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [statsLoading, statsReady]);

  return (
    <AppLayout>
      {/* The page had no h1. Screen-reader and search users get one; sighted
          users already have the masthead. */}
      <h1 className="sr-only">AfricaNews: headlines from African news publishers</h1>

      {/* ── Stats strip ── */}
      <div style={{ background: "var(--paper-2)", color: "var(--ink)", overflow: "hidden" }}>
        <div
          ref={stripRef}
          className="an-stats-strip-inner"
          style={{ fontFamily: "var(--font-ui)", fontSize: 12 }}
          {...(stripScrolls ? { tabIndex: 0, role: "region", "aria-label": "Site statistics" } : {})}
        >
          {/* Every figure comes from the API. While it loads a skeleton holds
              the place; if it fails the figures are left out, not guessed. */}
          {stats.map(({ value, label, wide }, i) =>
            statsLoading || statsReady ? (
              <Fragment key={label}>
                {i > 0 && <div className="an-stat-divider" aria-hidden="true" />}
                <div className="an-stat">
                  <span className="an-stat-value">
                    {statsReady ? value.toLocaleString() : <span className={`an-skeleton an-inline-skeleton${wide ? " an-inline-skeleton--wide" : ""}`} aria-hidden="true" />}
                  </span>
                  <span className="an-stat-label">{label}</span>
                </div>
              </Fragment>
            ) : null,
          )}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, background: "var(--ink-faint)", borderRadius: "50%", display: "inline-block" }} />
            Updated several times a day
          </div>
        </div>
      </div>

      <div className="an-container">

        {/* Spec §7: the lede block — top stories, divider, ad and pills — is
            held to the same column as the latest-news feed below, so the page
            reads at one measure instead of switching width mid-scroll. */}
        <div className="an-lede-column">

        {/* ── Hero / Top Stories ── */}
        <section style={{ paddingTop: 36 }}>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 15, fontWeight: 600, margin: "0 0 12px", paddingLeft: 10, borderLeft: "3px solid var(--yellow)" }}>Newest</h2>

          {isMobile ? (
            /* Mobile: swipeable carousel */
            topLoading ? (
              <div className="an-carousel-root">
                {/* Matches the carousel slide's 300px (spec §7) */}
                <div className="an-skeleton" style={{ height: 300 }} />
              </div>
            ) : topStories?.articles && topStories.articles.length > 0 ? (
              <TopStoriesCarousel articles={topStories.articles} />
            ) : (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-ui)", fontSize: 14 }}>
                No top stories available.
              </div>
            )
          ) : (
            /* Desktop: spec §4 top-story card full width, with the next two
               stories as ordinary feed rows beneath it */
            <>
              {topLoading ? (
                <>
                  {/* Matches the top story's 380px so the feed doesn't jump on load */}
                  <div className="an-skeleton an-top-story" style={{ borderRadius: 0, marginBottom: 12 }} />
                  <div className="an-story-list">
                    <div className="an-skeleton an-skeleton-row" />
                    <div className="an-skeleton an-skeleton-row" />
                  </div>
                </>
              ) : topStories?.articles && topStories.articles.length > 0 ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <ArticleCard article={topStories.articles[0]} featured />
                  </div>
                  {(topStories.articles[1] || topStories.articles[2]) && (
                    <div className="an-story-list">
                      {topStories.articles[1] && <ArticleCard article={topStories.articles[1]} />}
                      {topStories.articles[2] && <ArticleCard article={topStories.articles[2]} />}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, color: "var(--ink-4)", fontFamily: "var(--font-ui)", fontSize: 14 }}>
                  No top stories available.
                </div>
              )}
            </>
          )}
        </section>

        {/* Spec §5: the one place the pulse divider appears — the structural
            boundary between the top story and everything below it. */}
        <PulseDivider />

        {/* ── Section links ── no ad sits above them or above the first headline ── */}
        <ListingFilters showCountry>
          {/* Mark all as read / Clear history */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {list.articles.length > 0 && (
              <button
                onClick={() => markAllRead(list.articles.map(a => a.id))}
                className="an-pill an-pill--small"
                title="Mark all visible articles as read"
              >
                ✓ Mark all read
              </button>
            )}
            {readIds.size > 0 && (
              <button
                onClick={clearHistory}
                className="an-pill an-pill--small an-pill--quiet"
                title={`Clear read history (${readIds.size} articles)`}
              >
                Clear history
              </button>
            )}
          </div>
        </ListingFilters>

        </div>{/* /an-lede-column */}

        {/* ── Articles + Sidebar ── */}
        <section style={{ padding: "28px 0 48px" }}>
          <div className="an-content-with-sidebar">

            {/* Articles main */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 15, fontWeight: 600, margin: 0, paddingLeft: 10, borderLeft: "3px solid var(--yellow)" }}>
                  Latest news
                </h2>
                {list.total !== undefined && (
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-4)" }}>
                    {list.total.toLocaleString()} articles
                  </span>
                )}
              </div>

              <NewerLink startPage={page} hrefFor={hrefFor} />

              <div className="an-story-list an-articles-fade">
                {list.isLoading ? (
                  /* Row-shaped, matching what loads in — the old 16/9 card
                     skeleton described a layout the feed no longer uses and
                     made the page jump when articles arrived. */
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="an-skeleton an-skeleton-row" />
                  ))
                ) : list.articles.length > 0 ? (
                  list.articles.slice(0, LIMIT).map((article) => (
                    <ArticleCard key={article.id} article={article} isRead={isRead(article.id)} />
                  ))
                ) : pastTheEnd ? (
                  <PastTheEnd firstHref={hrefFor(1)} />
                ) : (
                  <div style={{ gridColumn: "1/3", textAlign: "center", padding: "60px 24px", color: "var(--ink-4)" }}>
                    <Inbox size={40} strokeWidth={1.5} aria-hidden="true" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontFamily: "var(--font-headline)", fontSize: 20, color: "var(--ink-3)", marginBottom: 8 }}>No articles found</h3>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 14 }}>Check back soon.</p>
                  </div>
                )}
              </div>

              {/* One ad row after the tenth story, only once a full page of ten
                  has loaded, so it never sits among skeletons and then jumps.
                  Stories added with "Show more" go under it. */}
              {!list.isLoading && list.articles.length >= LIMIT && <AdBanner slot="inline" />}

              {list.articles.length > LIMIT && (
                <div className="an-story-list">
                  {list.articles.slice(LIMIT).map((article) => (
                    <ArticleCard key={article.id} article={article} isRead={isRead(article.id)} />
                  ))}
                </div>
              )}
              {list.isLoadingMore && (
                <div className="an-story-list">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="an-skeleton an-skeleton-row" />
                  ))}
                </div>
              )}

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

            {/* Sidebar */}
            <div className="an-sidebar-col">
              <Sidebar />
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
