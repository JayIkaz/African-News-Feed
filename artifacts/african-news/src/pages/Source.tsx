import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { useListSources } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Sidebar } from "@/components/article/Sidebar";
import { NewerLink, PastTheEnd, ShowMore } from "@/components/article/ListingParts";
import { CountryFlag } from "@/components/common/CountryFlag";
import { sourceHref } from "@/lib/listing";
import { countryHref } from "@/lib/slugs";
import { useListing } from "@/lib/useListing";
import { usePageMeta } from "@/lib/usePageMeta";

const LIMIT = 12;

// Safe to put in an href: only http(s) homepages become links.
function safeHref(url: string): string | null {
  return /^https?:\/\//i.test(url) ? url : null;
}

// One publisher: its name, where it is, a link to its own site, and the
// stories of its that AfricaNews has collected. `page` is the page the address
// starts the list on.
export default function Source({ id, page }: { id: number; page: number }) {
  const sources = useListSources();
  const source = sources.data?.find((s) => s.id === id);
  const list = useListing({ sourceId: id }, page, LIMIT);
  const hrefFor = (p: number) => sourceHref(id, p);

  // The sources list names every publisher. If it could not be read, the
  // stories still carry the name, so the page shows what it can.
  const missing = sources.isSuccess && !source;
  const name = source?.name ?? list.articles[0]?.sourceName;
  const country = source?.country ?? list.articles[0]?.country;
  const homepage = source ? safeHref(source.homepage) : null;

  // A publisher that is switched off, or has no story here, is not a page to
  // list in search results. Neither is a page past the end of the list.
  const pastTheEnd = !list.isLoading && !list.failed && page > 1 && list.articles.length === 0;
  const thin = !!source && (!source.isActive || !source.rssUrl || source.articleCount === 0);
  usePageMeta({
    title: missing
      ? "Publisher not found | AfricaNews"
      : name
        ? `${name} news${page > 1 ? `, page ${page}` : ""} | AfricaNews`
        : undefined,
    description: name
      ? `Headlines from ${name}${country ? ` in ${country}` : ""}, collected by AfricaNews several times a day, with a link to each story at the publisher.`
      : undefined,
    noindex: missing || thin || pastTheEnd || list.total === 0,
  });

  if (missing) {
    return (
      <AppLayout>
        <div className="an-page">
          <h1>Publisher not found</h1>
          <p>AfricaNews has no publisher at this address.</p>
          <p><Link href="/sources">See every source</Link></p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="an-listing-hero">
        <div className="an-container">
          <div className="an-listing-hero-eyebrow">Publisher</div>
          {name ? (
            <h1>{name}</h1>
          ) : (
            <h1 aria-label="Loading"><span className="an-skeleton an-inline-skeleton an-inline-skeleton--wide" aria-hidden="true" /></h1>
          )}
          <p className="an-listing-hero-meta">
            {country && (
              <Link href={countryHref(country)} className="an-listing-hero-country">
                <CountryFlag country={country} size={18} /> {country}
              </Link>
            )}
            {list.total !== undefined && (
              <span>{list.total.toLocaleString()} {list.total === 1 ? "story" : "stories"} on AfricaNews</span>
            )}
            {homepage && name && (
              <a href={homepage} target="_blank" rel="noopener noreferrer" className="an-listing-hero-visit">
                Visit {name} <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
          </p>
        </div>
      </div>

      <div className="an-container an-listing-body">
        <div className="an-content-with-sidebar">
          <div>
            <NewerLink startPage={page} hrefFor={hrefFor} />

            <div className="an-story-list">
              {list.isLoading ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="an-skeleton an-skeleton-row" />)
              ) : list.articles.length > 0 ? (
                list.articles.map((article) => <ArticleCard key={article.id} article={article} />)
              ) : pastTheEnd ? (
                <PastTheEnd firstHref={hrefFor(1)} />
              ) : (
                <div className="an-listing-empty">
                  <h3>No stories yet</h3>
                  <p>AfricaNews has not collected a story from {name ?? "this publisher"} yet. <Link href="/sources">See every source</Link></p>
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
