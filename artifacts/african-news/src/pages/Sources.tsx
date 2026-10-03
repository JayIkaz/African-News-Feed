import { formatDistanceToNow } from "date-fns";
import { useGetIngestionStatus } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CountryFlag } from "@/components/common/CountryFlag";
import { usePageMeta } from "@/lib/usePageMeta";
import { useSiteCounts } from "@/lib/useSiteCounts";
import { CONTACT_EMAIL } from "@/lib/site";

// Safe to put in an href: only http(s) homepages become links.
function safeHref(url: string): string | null {
  return /^https?:\/\//i.test(url) ? url : null;
}

export default function Sources() {
  usePageMeta({
    title: "Sources | AfricaNews",
    description: "The news publishers AfricaNews reads every hour, by country, with the time of each last fetch.",
  });
  const { activeSources, sourceCount, loading, ready } = useSiteCounts();
  const status = useGetIngestionStatus();
  const statusById = new Map((status.data ?? []).map(s => [s.sourceId, s]));

  const byCountry = new Map<string, typeof activeSources>();
  for (const source of activeSources) {
    const list = byCountry.get(source.country) ?? [];
    list.push(source);
    byCountry.set(source.country, list);
  }
  const countries = [...byCountry.keys()].sort((a, b) => a.localeCompare(b));

  return (
    <AppLayout>
      <div className="an-page">
        <h1>Sources</h1>
        <p>
          AfricaNews reads the public news feeds of the{" "}
          {ready ? sourceCount : loading ? <span className="an-skeleton an-inline-skeleton" aria-hidden="true" /> : ""}{" "}
          publishers below every hour. Select a name to visit the publisher. A source marked "no stories yet" is switched on but has not delivered an article.
        </p>
        <p>
          If you publish one of these sources and want it removed or corrected, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        {loading && <div className="an-skeleton an-src-skeleton" aria-hidden="true" />}

        {countries.map(country => (
          <section className="an-src-group" key={country}>
            <h2>
              <CountryFlag country={country} size={22} />
              {country}
            </h2>
            <ul className="an-src-list">
              {byCountry.get(country)!.map(source => {
                const info = statusById.get(source.id);
                const href = safeHref(source.homepage);
                const lastFetched = info?.lastFetched ? new Date(info.lastFetched) : null;
                const failed = info?.status === "error";
                let meta = "";
                if (source.articleCount === 0 && !lastFetched) meta = "no stories yet";
                else if (failed) meta = lastFetched ? `last fetch failed, last success ${formatDistanceToNow(lastFetched, { addSuffix: true })}` : "last fetch failed";
                else if (lastFetched) meta = `fetched ${formatDistanceToNow(lastFetched, { addSuffix: true })}`;
                return (
                  <li className="an-src-item" key={source.id}>
                    {href ? <a href={href} target="_blank" rel="noopener noreferrer">{source.name}</a> : <span>{source.name}</span>}
                    {meta && <span className="an-src-meta">{meta}</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
