import type { MouseEvent, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { COUNTRY_FLAGS } from "@/lib/countries";
import { listingHref } from "@/lib/listing";
import { SECTIONS, countryFromSlug, slugify } from "@/lib/slugs";

const COUNTRY_NAMES = Object.keys(COUNTRY_FLAGS).sort((a, b) => a.localeCompare(b));

interface FiltersProps {
  category?: string;
  country?: string;
  // The country list belongs where choosing a country keeps the section.
  showCountry?: boolean;
  // Extra controls at the end of the section row.
  children?: ReactNode;
}

// Section links, and a country menu. Each one is the address of the list it
// leads to, so a filter can be opened in a new tab, shared, and reached with
// the back button. A country already chosen stays when the section changes.
export function ListingFilters({ category, country, showCountry = false, children }: FiltersProps) {
  const [, navigate] = useLocation();
  return (
    <div className="an-listing-filters">
      <div className="an-pill-bar">
        <nav aria-label="Filter by section" className="an-pill-nav">
          <Link
            href={listingHref({ country })}
            className={`an-pill${category ? "" : " an-pill--active"}`}
            aria-current={category ? undefined : "page"}
          >
            All
          </Link>
          {SECTIONS.map((name) => {
            const active = name === category;
            return (
              <Link
                key={name}
                href={listingHref({ category: name, country })}
                className={`an-pill${active ? " an-pill--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {name}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>

      {showCountry && (
        <div className="an-listing-country">
          <label htmlFor="an-listing-country">Country</label>
          <select
            id="an-listing-country"
            value={country ? slugify(country) : ""}
            onChange={(e) => navigate(listingHref({ category, country: countryFromSlug(e.target.value) }))}
          >
            <option value="">All countries</option>
            {COUNTRY_NAMES.map((name) => (
              <option key={name} value={slugify(name)}>{name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

interface ShowMoreProps {
  nextPage: number | null;
  hrefFor: (page: number) => string;
  loading: boolean;
  failed: boolean;
  shown: number;
  total: number | undefined;
  onMore: () => void;
  onRetry: () => void;
}

// A link to the next page. A plain click adds that page here; a click with a
// modifier key, or a middle click, opens the page itself as any link does.
export function ShowMore({ nextPage, hrefFor, loading, failed, shown, total, onMore, onRetry }: ShowMoreProps) {
  if (nextPage === null) return null;
  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    if (failed) onRetry();
    else onMore();
  };
  return (
    <div className="an-listing-more">
      <Link href={hrefFor(nextPage)} onClick={onClick} aria-disabled={loading || undefined} className="an-listing-more-link">
        {loading ? "Loading…" : failed ? "Could not load more stories. Try again" : "Show more stories"}
      </Link>
      <span className="an-listing-more-count">
        {total !== undefined ? `${shown.toLocaleString()} of ${total.toLocaleString()} stories shown` : ""}
      </span>
      <span className="sr-only" role="status">{loading ? "Loading more stories" : ""}</span>
    </div>
  );
}

// At the top of a list that starts after its first page.
export function NewerLink({ startPage, hrefFor }: { startPage: number; hrefFor: (page: number) => string }) {
  if (startPage <= 1) return null;
  return (
    <p className="an-listing-newer">
      <Link href={hrefFor(startPage - 1)}>← Newer stories</Link>
    </p>
  );
}

// A page number past the end of the list.
export function PastTheEnd({ firstHref }: { firstHref: string }) {
  return (
    <div className="an-listing-empty">
      <h3>There are no stories on this page</h3>
      <p><Link href={firstHref}>Go to the first page</Link></p>
    </div>
  );
}
