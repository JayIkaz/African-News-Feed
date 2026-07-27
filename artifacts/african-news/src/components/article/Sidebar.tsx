import { useState } from "react";
import { Link } from "wouter";
import { useGetTrendingArticles, useListCountries } from "@workspace/api-client-react";
import { ArticleCard } from "./ArticleCard";
import { COUNTRY_REGIONS } from "@/lib/countries";

const REGIONS = [
  { label: "North Africa", key: "North Africa", color: "var(--region-north)" },
  { label: "West Africa", key: "West Africa", color: "var(--region-west)" },
  { label: "East Africa", key: "East Africa", color: "var(--region-east)" },
  { label: "Central Africa", key: "Central Africa", color: "var(--region-central)" },
  { label: "Southern Africa", key: "Southern Africa", color: "var(--region-south)" },
];

function WidgetHeader({ dot, title }: { dot?: boolean; title: string }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--paper-2)", display: "flex", alignItems: "center", gap: 8 }}>
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse-dot 1.4s ease-in-out infinite", display: "inline-block" }} />
      )}
      <h3 style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        {title}
      </h3>
    </div>
  );
}

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface-1)", border: "1px solid var(--paper-3)", borderRadius: 10, overflow: "hidden" }}>
      {children}
    </div>
  );
}

export function Sidebar() {
  const { data: trendingData, isLoading: trendingLoading } = useGetTrendingArticles({ limit: 5 });
  const { data: countries } = useListCountries();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const regionCounts = REGIONS.reduce<Record<string, number>>((acc, { key }) => {
    acc[key] = (countries ?? []).filter(c => COUNTRY_REGIONS[c.country] === key)
      .reduce((sum, c) => sum + c.articleCount, 0);
    return acc;
  }, {});

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const res = await fetch(`${base}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) { setSubscribed(true); setEmail(""); }
    } catch {}
    setSubmitting(false);
  };

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Trending Now */}
      <Widget>
        <WidgetHeader dot title="Trending Now" />
        <div>
          {trendingLoading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 56px", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--paper-2)" }}>
                  <div>
                    <div className="an-skeleton" style={{ width: 60, height: 11, marginBottom: 4 }} />
                    <div className="an-skeleton" style={{ height: 13, marginBottom: 4 }} />
                    <div className="an-skeleton" style={{ width: "80%", height: 13 }} />
                  </div>
                  <div className="an-skeleton" style={{ width: 56, height: 56, borderRadius: 6 }} />
                </div>
              ))
            : (trendingData?.articles ?? []).map((article, i) => (
                <div key={article.id} style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute",
                    top: 14,
                    left: 18,
                    fontFamily: "var(--font-ui)",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}>
                    #{i + 1}
                  </span>
                  <div style={{ paddingLeft: 28 }}>
                    <ArticleCard article={article} compact />
                  </div>
                </div>
              ))}
        </div>
      </Widget>

      {/* Browse by Region */}
      <Widget>
        <WidgetHeader title="Browse by Region" />
        <div style={{ padding: "16px 18px" }}>
          {REGIONS.map(({ label, key, color }) => (
            <Link
              key={key}
              href={`/countries?region=${encodeURIComponent(key)}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--paper-2)",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-2)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                {label}
              </span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-4)", background: "var(--paper-2)", padding: "2px 8px", borderRadius: 20 }}>
                {regionCounts[key]?.toLocaleString() ?? "—"}
              </span>
            </Link>
          ))}
        </div>
      </Widget>

      {/* Newsletter */}
      <div
        id="sidebar-newsletter"
        style={{
          background: "var(--paper-2)",
          color: "var(--ink)",
          borderRadius: 10,
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <h3 style={{ fontFamily: "var(--font-headline)", fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>
          Africa in Your Inbox
        </h3>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)", marginBottom: 16, lineHeight: 1.5 }}>
          Daily digest of the continent's most important stories, curated from 65+ sources.
        </p>
        {subscribed ? (
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--mint-text)", fontWeight: 500 }}>
            ✓ You're subscribed! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--surface-1)",
                border: "1px solid var(--paper-3)",
                borderRadius: 5,
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                color: "var(--ink)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "10px",
                background: "var(--yellow)",
                color: "var(--yellow-text)",
                border: "none",
                borderRadius: 5,
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {submitting ? "Subscribing…" : "Subscribe — it's free"}
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
