import { useState, useRef } from "react";
import { useListArticles, useGetTopStories, useListCountries } from "@workspace/api-client-react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { TopStoriesCarousel } from "@/components/article/TopStoriesCarousel";
import { Sidebar } from "@/components/article/Sidebar";
import { AdBanner } from "@/components/ads/AdBanner";
import { useReadHistory } from "@/lib/useReadHistory";

const CATEGORY_PILLS = [
  { label: "All", icon: "🌐", value: null },
  { label: "Politics", icon: "🏛️", value: "Politics" },
  { label: "Business", icon: "💼", value: "Business" },
  { label: "Technology", icon: "💡", value: "Technology" },
  { label: "Economy", icon: "📊", value: "Economy" },
  { label: "Society", icon: "👥", value: "Society" },
  { label: "Environment", icon: "🌿", value: "Environment" },
  { label: "International", icon: "🤝", value: "International" },
];

export default function Home() {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [fadeKey, setFadeKey] = useState(0);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const limit = 10;
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const { isRead, markAllRead, clearHistory, readIds } = useReadHistory();

  const { data: topStories, isLoading: topLoading } = useGetTopStories({ limit: 3 });
  const { data: latestNews, isLoading: latestLoading, isFetching } = useListArticles({ page, limit, category: activeCat ?? undefined });
  const { data: countries } = useListCountries();
  const totalArticles = (countries ?? []).reduce((sum, c) => sum + c.articleCount, 0);
  const countryCount = (countries ?? []).length;

  const handlePill = (value: string | null, btnEl?: HTMLButtonElement | null) => {
    setActiveCat(value);
    setPage(1);
    setFadeKey(k => k + 1);
    if (btnEl) {
      btnEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  };

  const totalPages = latestNews ? Math.ceil((latestNews.total ?? 0) / limit) : 1;

  return (
    <AppLayout>
      {/* ── Dark Stats Strip ── */}
      <div style={{ background: "var(--paper-2)", color: "var(--ink)", overflow: "hidden" }}>
        <div className="an-stats-strip-inner" style={{ fontFamily: "var(--font-ui)", fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ opacity: 0.6, fontSize: 13 }}>🌍</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{countryCount > 0 ? countryCount : "25"}+</span>
            <span style={{ color: "var(--ink-3)" }}>African countries</span>
          </div>
          <div style={{ width: 1, height: 16, background: "var(--paper-3)", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ opacity: 0.6, fontSize: 13 }}>📡</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>65+</span>
            <span style={{ color: "var(--ink-3)" }}>news sources</span>
          </div>
          <div style={{ width: 1, height: 16, background: "var(--paper-3)", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ opacity: 0.6, fontSize: 13 }}>📰</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{totalArticles > 0 ? totalArticles.toLocaleString() : "1,000"}+</span>
            <span style={{ color: "var(--ink-3)" }}>articles indexed</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-3)", flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, background: "var(--live)", borderRadius: "50%", animation: "pulse-dot 2s ease-in-out infinite", display: "inline-block" }} />
            Updated every hour
          </div>
        </div>
      </div>

      <div className="an-container">

        {/* ── Hero / Top Stories ── */}
        <section style={{ paddingTop: 36 }}>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 15, fontWeight: 600, margin: "0 0 12px", paddingLeft: 10, borderLeft: "3px solid var(--yellow)" }}>Top stories</h2>

          {isMobile ? (
            /* Mobile: swipeable carousel */
            topLoading ? (
              <div className="an-carousel-root">
                <div className="an-skeleton" style={{ height: 340 }} />
              </div>
            ) : topStories?.articles && topStories.articles.length > 0 ? (
              <TopStoriesCarousel articles={topStories.articles} />
            ) : (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-ui)", fontSize: 14 }}>
                No top stories available.
              </div>
            )
          ) : (
            /* Desktop: spec §3 top-story card full width, next two stories
               as standard cards beneath it */
            <>
              {topLoading ? (
                <>
                  <div className="an-skeleton" style={{ height: 260, borderRadius: 12, marginBottom: 12 }} />
                  <div className="an-grid-3">
                    <div className="an-skeleton an-news-card" style={{ borderRadius: 12 }} />
                    <div className="an-skeleton an-news-card" style={{ borderRadius: 12 }} />
                  </div>
                </>
              ) : topStories?.articles && topStories.articles.length > 0 ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <ArticleCard article={topStories.articles[0]} featured />
                  </div>
                  {(topStories.articles[1] || topStories.articles[2]) && (
                    <div className="an-grid-3">
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

        {/* ── Ad Leaderboard ── */}
        <div style={{ margin: "20px 0" }}>
          <AdBanner slot="leaderboard" />
        </div>

        {/* ── Category Pills ── */}
        <div className="an-pill-bar">
          {CATEGORY_PILLS.map(({ label, icon, value }) => {
            const isActive = activeCat === value;
            const pillKey = value ?? "__all__";
            return (
              <button
                key={label}
                ref={el => {
                  if (el) pillRefs.current.set(pillKey, el);
                  else pillRefs.current.delete(pillKey);
                }}
                onClick={e => handlePill(value, e.currentTarget)}
                className={`an-pill${isActive ? " an-pill--active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 100,
                  border: `1.5px solid ${isActive ? "var(--accent)" : "var(--paper-3)"}`,
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: isActive ? "#FFFFFF" : "var(--ink-3)",
                  background: isActive ? "var(--accent)" : "var(--surface-1)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = "var(--ink-3)"; e.currentTarget.style.color = "var(--ink)"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "var(--paper-3)"; e.currentTarget.style.color = "var(--ink-3)"; } }}
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </button>
            );
          })}

          {/* Mark all as read / Clear history */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {latestNews?.articles && latestNews.articles.length > 0 && (
              <button
                onClick={() => markAllRead((latestNews.articles ?? []).map(a => a.id))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 14px",
                  borderRadius: 100,
                  border: "1.5px solid var(--paper-3)",
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--ink-3)",
                  background: "var(--surface-1)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ink-3)"; e.currentTarget.style.color = "var(--ink)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--paper-3)"; e.currentTarget.style.color = "var(--ink-3)"; }}
                title="Mark all visible articles as read"
              >
                ✓ Mark all read
              </button>
            )}
            {readIds.size > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 14px",
                  borderRadius: 100,
                  border: "1.5px solid var(--paper-3)",
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--ink-4)",
                  background: "var(--surface-1)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ink-3)"; e.currentTarget.style.color = "var(--ink)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--paper-3)"; e.currentTarget.style.color = "var(--ink-4)"; }}
                title={`Clear read history (${readIds.size} articles)`}
              >
                Clear history
              </button>
            )}
          </div>
        </div>

        {/* ── Articles + Sidebar ── */}
        <section style={{ padding: "28px 0 48px" }}>
          <div className="an-content-with-sidebar">

            {/* Articles main */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 15, fontWeight: 600, margin: 0, paddingLeft: 10, borderLeft: "3px solid var(--yellow)" }}>
                  {activeCat ? `${activeCat} news` : "Latest news"}
                </h2>
                {latestNews && (
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-4)" }}>
                    {latestNews.total?.toLocaleString()} articles
                  </span>
                )}
              </div>

              <div key={fadeKey} className="an-grid-3 an-articles-fade">
                {latestLoading || isFetching ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} style={{ background: "var(--surface-1)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--paper-3)" }}>
                      <div className="an-skeleton" style={{ aspectRatio: "16/9", width: "100%" }} />
                      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="an-skeleton" style={{ height: 14 }} />
                        <div className="an-skeleton" style={{ height: 14, width: "80%" }} />
                        <div className="an-skeleton" style={{ height: 14, width: "60%" }} />
                      </div>
                    </div>
                  ))
                ) : latestNews?.articles && latestNews.articles.length > 0 ? (
                  latestNews.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} isRead={isRead(article.id)} />
                  ))
                ) : (
                  <div style={{ gridColumn: "1/3", textAlign: "center", padding: "60px 24px", color: "var(--ink-4)" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                    <h3 style={{ fontFamily: "var(--font-headline)", fontSize: 20, color: "var(--ink-3)", marginBottom: 8 }}>No articles found</h3>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 14 }}>Try a different category or check back soon.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {latestNews && latestNews.total > limit && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--paper-3)" }}>
                  <PagBtn
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1 || isFetching}
                  >
                    ← Previous
                  </PagBtn>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 5 && page > 3) p = page - 2 + i;
                    if (p > totalPages) return null;
                    return (
                      <PagBtn
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={isFetching}
                        active={p === page}
                      >
                        {p}
                      </PagBtn>
                    );
                  })}
                  <PagBtn
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={!latestNews.hasMore || isFetching}
                  >
                    Next →
                  </PagBtn>
                </div>
              )}
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

function PagBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="an-pag-btn"
      style={{
        minWidth: 36,
        height: 36,
        padding: "0 12px",
        borderRadius: 6,
        border: `1px solid ${active ? "var(--accent)" : "var(--paper-3)"}`,
        background: active ? "var(--accent)" : "var(--surface-1)",
        color: active ? "#FFFFFF" : disabled ? "var(--ink-4)" : "var(--ink-2)",
        fontFamily: "var(--font-ui)",
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}
