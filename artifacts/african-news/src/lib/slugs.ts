import { COUNTRY_FLAGS } from "@/lib/countries";

// Addresses for sections and countries.
//
//   /politics              one section
//   /country/south-africa  one country
//
// Paths are lower case with hyphens. The API compares section and country names
// exactly ("Politics", "South Africa"), so the page turns the slug back into
// the name before it asks for articles. Any other spelling of the same words
// ("/Politics", "/country/South%20Africa") is redirected to the form below.
//
// The api-server's sitemap builds the same paths (src/lib/slugs.ts there); the
// two must agree.

export const SECTIONS = [
  "Politics",
  "Business",
  "Technology",
  "Economy",
  "Society",
  "Environment",
  "International",
  "General",
] as const;

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryHref(name: string): string {
  return `/${slugify(name)}`;
}

export function countryHref(name: string): string {
  return `/country/${slugify(name)}`;
}

// The section a path segment names, in any spelling that slugifies the same
// way, or undefined when there is no such section.
export function categoryFromSlug(value: string | undefined): string | undefined {
  const wanted = slugify(value ?? "");
  return wanted ? SECTIONS.find((name) => slugify(name) === wanted) : undefined;
}

// The country a path segment names. Countries come from COUNTRY_FLAGS, the same
// list that gives each one a flag and a region, so a country the site covers
// has to be added there anyway.
const COUNTRY_NAMES = Object.keys(COUNTRY_FLAGS);
export function countryFromSlug(value: string | undefined): string | undefined {
  const wanted = slugify(value ?? "");
  return wanted ? COUNTRY_NAMES.find((name) => slugify(name) === wanted) : undefined;
}
