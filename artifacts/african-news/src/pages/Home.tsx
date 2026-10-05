import { Fragment } from "react";
import { useSearch } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Sidebar } from "@/components/article/Sidebar";
import { ListingFilters, NewerLink, PastTheEnd, ShowMore } from "@/components/article/ListingParts";
import { SiteStatus } from "@/components/common/SiteStatus";
import { AdBanner } from "@/components/ads/AdBanner";
import { CheckCheck, Eraser, Inbox } from "lucide-react";
import { useReadHistory } from "@/lib/useReadHistory";
import { listingHref, parseListingQuery } from "@/lib/listing";
import { useListing } from "@/lib/useListing";
import { useNow } from "@/lib/useNow";
import { groupByTime } from "@/lib/timeGroups";
import { usePageMeta } from "@/lib/usePageMeta";

// Stories to a page, and the number of rows before the in-stream advert.
const LIMIT = 10;

export default function Home() {
  const { page } = parseListingQuery(useSearch(), false);
  const { isRead, markAllRead, clearHistory, readIds } = useReadHistory();
  const hrefFor = (p: number) => listingHref({ page: p });

  const list = useListing({}, page, LIMIT);
  const now = useNow();
  const pastTheEnd = !list.isLoading && !list.failed && page > 1 && list.articles.length === 0;
  // The first page keeps the title of index.html; later pages say which page
  // they are, so no two share one.
  usePageMeta({
    title: page > 1 ? `Latest African news, page ${page} | AfricaNews` : undefined,
    noindex: pastTheEnd,
  });

  // One stream, newest first, under a heading for how long ago it was
  // published. Each group remembers how many rows come before it, so the advert
  // can be placed after the tenth row wherever that falls.
  let rowsBefore = 0;
  const groups = groupByTime(list.articles, (a) => a.publishedDate, now).map((group) => {
    const firstRow = rowsBefore;
    rowsBefore += group.items.length;
    return { ...group, firstRow };
  });
  // Only once a full page of ten has loaded, so the advert never sits among
  // skeletons and then jumps.
  const showAd = !list.isLoading && list.articles.length >= LIMIT;

  return (
    <AppLayout>
      {/* The page had no h1. Screen-reader and search users get one; sighted
          users already have the masthead. */}
      <h1 className="sr-only">AfricaNews: headlines from African news publishers</h1>

      <div className="an-container">
        <SiteStatus />

        {/* One grid for the whole page: the stream on the left, the right-hand
            column on the right from the first row down. The column's top, the
            advert space, is level with the section links. */}
        <div className="an-content-with-sidebar an-home-grid">
          <div>
            {/* ── Section links and tools ── */}
            <ListingFilters showCountry>
              {/* Reading tools, opposite the country menu. */}
              {(list.articles.length > 0 || readIds.size > 0) && (
                <div className="an-btn-group" role="group" aria-label="Reading tools">
                  {list.articles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllRead(list.articles.map(a => a.id))}
                      title="Mark all visible articles as read"
                    >
                      <CheckCheck size={15} aria-hidden="true" /> Mark all read
                    </button>
                  )}
                  {readIds.size > 0 && (
                    <button
                      type="button"
                      onClick={clearHistory}
                      title={`Clear read history (${readIds.size} articles)`}
                    >
                      <Eraser size={15} aria-hidden="true" /> Clear history
                    </button>
                  )}
                </div>
              )}
            </ListingFilters>

            {/* ── The stream ── */}
            <div className="an-home-feed">
              <NewerLink startPage={page} hrefFor={hrefFor} />

              <div className="an-articles-fade">
                {list.isLoading ? (
                  /* Row-shaped, matching what loads in, so the page does not
                     jump when the stories arrive. */
                  <div className="an-story-list">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="an-skeleton an-skeleton-row" />
                    ))}
                  </div>
                ) : groups.length > 0 ? (
                  groups.map((group) => (
                    <section key={group.key} className="an-time-group" aria-labelledby={`an-time-${group.key}`}>
                      <h2 id={`an-time-${group.key}`} className="an-time-heading">{group.label}</h2>
                      <div className="an-story-list">
                        {group.items.map((article, i) => (
                          <Fragment key={article.id}>
                            <ArticleCard article={article} isRead={isRead(article.id)} />
                            {/* After the tenth row, inside the group it falls in:
                                never straight under a heading. */}
                            {showAd && group.firstRow + i === LIMIT - 1 && <AdBanner slot="inline" />}
                          </Fragment>
                        ))}
                      </div>
                    </section>
                  ))
                ) : pastTheEnd ? (
                  <PastTheEnd firstHref={hrefFor(1)} />
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--ink-4)" }}>
                    <Inbox size={40} strokeWidth={1.5} aria-hidden="true" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontFamily: "var(--font-headline)", fontSize: 20, color: "var(--ink-3)", marginBottom: 8 }}>No articles found</h3>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 14 }}>Check back soon.</p>
                  </div>
                )}
              </div>

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
          </div>

          {/* Right-hand column */}
          <div className="an-sidebar-col">
            <Sidebar />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
