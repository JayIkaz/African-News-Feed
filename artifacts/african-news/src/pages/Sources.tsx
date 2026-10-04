import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useGetIngestionStatus } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CountryFlag } from "@/components/common/CountryFlag";
import { usePageMeta } from "@/lib/usePageMeta";
import { useSiteCounts } from "@/lib/useSiteCounts";
import { CONTACT_EMAIL } from "@/lib/site";
import { sourceHref } from "@/lib/listing";

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
  const waiting = activeSources.length - sourceCount;
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
          AfricaNews reads the public news feeds of the publishers below every hour. Select a name to visit the publisher, or the story count to read its stories here.{" "}
          {ready ? (
            waiting > 0
              ? <>{sourceCount} of them have delivered stories so far. The other {waiting === 1 ? "one is" : `${waiting} are`} switched on and marked "no stories yet".</>
              : <>All {sourceCount} have delivered stories.</>
          ) : loading ? <span className="an-skeleton an-inline-skeleton" aria-hidden="true" /> : null}
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
                // "no stories yet" is exactly the set left out of the count above.
                let meta = "";
                if (source.articleCount === 0) meta = failed ? "no stories yet, last fetch failed" : "no stories yet";
                else if (failed) meta = lastFetched ? `last fetch failed, last success ${formatDistanceToNow(lastFetched, { addSuffix: true })}` : "last fetch failed";
                else if (lastFetched) meta = `fetched ${formatDistanceToNow(lastFetched, { addSuffix: true })}`;
                return (
                  <li className="an-src-item" key={source.id}>
                    {href ? <a href={href} target="_blank" rel="noopener noreferrer">{source.name}</a> : <span>{source.name}</span>}
                    {source.articleCount > 0 && (
                      <Link href={sourceHref(source.id)} className="an-src-stories">
                        {source.articleCount.toLocaleString()} {source.articleCount === 1 ? "story" : "stories"}
                      </Link>
                    )}
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
