import { useState } from "react";
import { useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Sidebar } from "@/components/article/Sidebar";
import { useListArticles } from "@workspace/api-client-react";
import { CAT_COLORS } from "@/components/article/ArticleCard";

const CATEGORY_META: Record<string, { description: string; icon: string }> = {
  Politics:      { description: "Elections, governance, policy, and political analysis from across the African continent.", icon: "🏛️" },
  Business:      { description: "Markets, trade, corporate news, and business strategy from Africa's leading economies.", icon: "💼" },
  Technology:    { description: "Innovation, startups, digital transformation, and tech news from the continent.", icon: "💡" },
  Economy:       { description: "GDP, inflation, fiscal policy, economic growth, and financial analysis.", icon: "📊" },
  Society:       { description: "Health, education, culture, community, sports, and social issues.", icon: "👥" },
  Environment:   { description: "Climate, wildlife, conservation, energy, and environmental reporting.", icon: "🌿" },
  International: { description: "Africa on the world stage — diplomacy, foreign affairs, and global events.", icon: "🤝" },
  General:       { description: "A wide range of news and features from across the continent.", icon: "📰" },
};

const LIMIT = 12;

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category || "");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useListArticles({ category: decodedCategory, limit: LIMIT, page });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;
  const meta = CATEGORY_META[decodedCategory] ?? {
    description: `Latest news and analysis on ${decodedCategory.toLowerCase()} from across Africa.`,
    icon: "📰",
  };
  const catColor = CAT_COLORS[decodedCategory] ?? "#5a5750";

  return (
    <AppLayout>
      {/* ── Category Hero ── */}
      <div style={{ background: "var(--ink)", color: "#fff", padding: "36px 0", marginBottom: 0 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
            Section
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: `${catColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
              {meta.icon}
            </div>
            <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" }}>
              {decodedCategory}
            </h1>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, opacity: 0.65, maxWidth: 560, fontStyle: "italic" }}>
            {meta.description}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 24px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }}>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--paper-3)" }}>
              <div style={{ width: 4, height: 22, background: "var(--accent)", borderRadius: 2 }} />
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {data ? `${data.total.toLocaleString()} Articles` : "Loading…"}
              </h2>
              {data && totalPages > 1 && (
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-4)" }}>
                  Page {page} of {totalPages}
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 32 }}>
              {isLoading || isFetching ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", border: "1px solid var(--paper-3)" }}>
                    <div className="an-skeleton" style={{ aspectRatio: "16/9", width: "100%" }} />
                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="an-skeleton" style={{ height: 14 }} />
                      <div className="an-skeleton" style={{ height: 14, width: "80%" }} />
                      <div className="an-skeleton" style={{ height: 14, width: "60%" }} />
                    </div>
                  </div>
                ))
              ) : data?.articles && data.articles.length > 0 ? (
                data.articles.map(article => <ArticleCard key={article.id} article={article} />)
              ) : (
                <div style={{ gridColumn: "1/4", textAlign: "center", padding: "60px 24px", color: "var(--ink-4)" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{meta.icon}</div>
                  <h3 style={{ fontFamily: "var(--font-headline)", fontSize: 20, color: "var(--ink-3)", marginBottom: 8 }}>No articles yet</h3>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 14 }}>Check back soon for {decodedCategory.toLowerCase()} updates.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {data && data.total > LIMIT && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid var(--paper-3)" }}>
                <PagBtn onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={page === 1 || isFetching}>
                  ← Previous
                </PagBtn>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 5 && page > 3) p = page - 2 + i;
                    if (p > totalPages) return null;
                    return (
                      <PagBtn key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={isFetching} active={p === page}>
                        {p}
                      </PagBtn>
                    );
                  })}
                </div>
                <PagBtn onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={!data.hasMore || isFetching}>
                  Next →
                </PagBtn>
              </div>
            )}
          </div>

          <Sidebar />
        </div>
      </div>
    </AppLayout>
  );
}

function PagBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 36,
        height: 36,
        padding: "0 12px",
        borderRadius: 6,
        border: `1px solid ${active ? "var(--ink)" : "var(--paper-3)"}`,
        background: active ? "var(--ink)" : "#fff",
        color: active ? "#fff" : disabled ? "var(--ink-4)" : "var(--ink-2)",
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
