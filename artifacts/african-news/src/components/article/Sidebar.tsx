import { Link } from "wouter";
import { useListCountries } from "@workspace/api-client-react";
import { COUNTRY_REGIONS } from "@/lib/countries";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { AdBanner } from "@/components/ads/AdBanner";

const REGIONS = [
  { label: "North Africa", key: "North Africa", color: "var(--region-north)" },
  { label: "West Africa", key: "West Africa", color: "var(--region-west)" },
  { label: "East Africa", key: "East Africa", color: "var(--region-east)" },
  { label: "Central Africa", key: "Central Africa", color: "var(--region-central)" },
  { label: "Southern Africa", key: "Southern Africa", color: "var(--region-south)" },
];

function WidgetHeader({ title }: { title: string }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--paper-2)", display: "flex", alignItems: "center", gap: 8 }}>
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
  const { data: countries } = useListCountries();
  const regionCounts = REGIONS.reduce<Record<string, number>>((acc, { key }) => {
    acc[key] = (countries ?? []).filter(c => COUNTRY_REGIONS[c.country] === key)
      .reduce((sum, c) => sum + c.articleCount, 0);
    return acc;
  }, {});

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* The top of the right-hand column: the one rail ad slot. */}
      <AdBanner slot="rail" />

      {/* The Trending widget was removed: the API has no trending signal (its
          trending list is the same newest-first query as the main feed), so
          the label promised a ranking nothing computes. Restore it with a
          real signal (plan row P3-3). */}

      {/* Browse by Region */}
      <Widget>
        <WidgetHeader title="Browse by Region" />
        <div style={{ padding: "16px 18px" }}>
          {REGIONS.map(({ label, key, color }) => (
            <Link
              key={key}
              href={`/countries?region=${encodeURIComponent(key)}`}
              className="an-region-row"
            >
              <span className="an-region-row-label">
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
        <NewsletterForm />
      </div>
    </aside>
  );
}
