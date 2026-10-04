import { categoryFromSlug, categoryHref, countryFromSlug, countryHref, slugify } from "@/lib/slugs";

// Where a list of stories lives, and how a page of it is asked for.
//
//   /                          every story
//   /politics                  one section
//   /country/ghana             one country
//   /source/12                 one publisher
//   /politics?country=ghana    a section and a country together
//   <any of these>?page=2      the second page of that list
//
// One section or one country is a path. Only the combination uses a query
// string, and it hangs off the section's path, so a combination has a single
// address whichever page it was reached from.

export interface Listing {
  category?: string;
  country?: string;
  page?: number;
}

export function listingHref({ category, country, page = 1 }: Listing): string {
  const path = category ? categoryHref(category) : country ? countryHref(country) : "/";
  const query = new URLSearchParams();
  if (category && country) query.set("country", slugify(country));
  if (page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

export function sourceHref(id: number, page = 1): string {
  return page > 1 ? `/source/${id}?page=${page}` : `/source/${id}`;
}

// "?page=2" is a list's second page. Anything else is page 1, so a made-up
// value ("0", "-3", "two") shows the first page rather than an error.
export function pageFromQuery(value: string | null): number {
  if (value === null || !/^[1-9][0-9]{0,5}$/.test(value)) return 1;
  return Number(value);
}

export interface ListingQuery {
  page: number;
  // The country the query names, as the API spells it, when it names one the
  // site covers.
  country?: string;
  // True when the query says something about page or country that the site's
  // own address for that list does not (an unknown country, "page=1",
  // "country=GHANA"), so the address should be replaced by the one it means.
  needsRedirect: boolean;
}

// Reads the query of a list's address. `allowCountry` is true only on a
// section's page, the one place a country belongs in the query.
export function parseListingQuery(search: string, allowCountry: boolean): ListingQuery {
  const params = new URLSearchParams(search);
  const rawPage = params.get("page");
  const rawCountry = params.get("country");

  const page = pageFromQuery(rawPage);
  const country = allowCountry ? countryFromSlug(rawCountry ?? undefined) : undefined;

  const pageIsOff = rawPage !== null && rawPage !== (page > 1 ? String(page) : null);
  const countryIsOff = rawCountry !== null && (!country || rawCountry !== slugify(country));
  return { page, country, needsRedirect: pageIsOff || countryIsOff };
}

// Which kind of list a path is, or null for a path that is not a list. Only
// lists have a page or country in the query worth keeping in a canonical link.
export type ListingKind = "home" | "section" | "country" | "source";

export function listingKind(pathname: string): ListingKind | null {
  const path = pathname.replace(/\/+$/, "").toLowerCase() || "/";
  if (path === "/") return "home";
  if (/^\/country\/[^/]+$/.test(path)) return "country";
  if (/^\/source\/[1-9][0-9]*$/.test(path)) return "source";
  const match = /^\/([^/]+)$/.exec(path);
  return match && categoryFromSlug(match[1]) ? "section" : null;
}

// The query a list's canonical link keeps: its page when it is not the first,
// and the country of a combination. Everything else (tracking tags, say) goes.
export function canonicalQuery(pathname: string, search: string): string {
  const kind = listingKind(pathname);
  if (!kind) return "";
  const { page, country } = parseListingQuery(search, kind === "section");
  const query = new URLSearchParams();
  if (country) query.set("country", slugify(country));
  if (page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `?${text}` : "";
}
