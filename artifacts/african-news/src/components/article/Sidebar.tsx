import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useListCountries } from "@workspace/api-client-react";
import { COUNTRY_REGIONS } from "@/lib/countries";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { AdBanner } from "@/components/ads/AdBanner";

const REGIONS = ["North Africa", "West Africa", "East Africa", "Central Africa", "Southern Africa"] as const;

// Gap between bar segments, in the bar's own units (the bar is 100 wide).
const BAR_GAP = 0.8;

const percent = (share: number) => (share > 0 && share < 0.005 ? "<1%" : `${Math.round(share * 100)}%`);

function RegionsCard() {
  const { data: countries, isLoading } = useListCountries();

  // Stories per region, summed from the countries in that region. Countries
  // with no region are left out, so the total is of the five regions only.
  const rows = REGIONS.map((name) => ({
    name,
    count: (countries ?? [])
      .filter((c) => COUNTRY_REGIONS[c.country] === name)
      .reduce((sum, c) => sum + c.articleCount, 0),
  }))
    .sort((a, b) => b.count - a.count)
    .map((row, i) => ({ ...row, rank: i + 1 }));
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const ready = !isLoading && total > 0;

  // Segment positions: each is its share of the bar, less its share of the gaps.
  const usable = 100 - BAR_GAP * (rows.length - 1);
  let x = 0;
  const segments = rows.map((row) => {
    const width = ready ? (row.count / total) * usable : 0;
    const segment = { ...row, x, width };
    x += width + BAR_GAP;
    return segment;
  });

  const summary = ready
    ? `Share of stories by region: ${rows.map((r) => `${r.name.replace(" Africa", "")} ${Math.round((r.count / total) * 100)} percent`).join(", ")}`
    : undefined;

  return (
    <section className="an-regions" aria-labelledby="an-regions-title">
      <header className="an-regions-header">
        <h2 id="an-regions-title" className="an-regions-title">Browse by region</h2>
      </header>

      {isLoading ? (
        <div className="an-regions-loading an-skeleton" aria-hidden="true" />
      ) : (
        <>
          {ready && (
            <div className="an-regions-summary">
              <div className="an-regions-total">{total.toLocaleString()}</div>
              <div className="an-regions-caption">stories across five regions</div>
              <svg
                className="an-regions-bar"
                viewBox="0 0 100 1"
                preserveAspectRatio="none"
                role="img"
                aria-label={summary}
              >
                {segments
                  .filter((s) => s.width > 0)
                  .map((s) => (
                    <rect
                      key={s.name}
                      x={s.x}
                      y={0}
                      width={s.width}
                      height={1}
                      className={`an-regions-seg an-regions-seg--${s.rank}`}
                    />
                  ))}
              </svg>
            </div>
          )}

          <ul className="an-regions-list">
            {rows.map((row) => (
              <li key={row.name}>
                <Link href={`/countries?region=${encodeURIComponent(row.name)}`} className="an-regions-row">
                  <span className={`an-regions-swatch an-regions-swatch--${row.rank}`} aria-hidden="true" />
                  <span className="an-regions-name">{row.name}</span>
                  <span className="an-regions-share">{ready ? percent(row.count / total) : ""}</span>
                  <span className="an-regions-count">{ready ? row.count.toLocaleString() : "—"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <footer className="an-regions-footer">
        <Link href="/countries" className="an-regions-all">
          {countries && countries.length > 0 ? `All ${countries.length} countries` : "All countries"}
          <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
        </Link>
      </footer>
    </section>
  );
}

export function Sidebar() {
  return (
    <aside className="an-sidebar">
      {/* The top of the right-hand column: the one rail ad slot. */}
      <AdBanner slot="rail" />

      {/* The Trending widget was removed: the API has no trending signal (its
          trending list is the same newest-first query as the main feed), so
          the label promised a ranking nothing computes. Restore it with a
          real signal (plan row P3-3). */}

      <RegionsCard />

      {/* Newsletter */}
      <div id="sidebar-newsletter" className="an-sidebar-newsletter">
        <NewsletterForm />
      </div>
    </aside>
  );
}
