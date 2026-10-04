// Addresses of the site's section and country pages, for the sitemap:
//
//   /politics              one section
//   /country/south-africa  one country
//
// The web app builds the same paths (artifacts/african-news/src/lib/slugs.ts).
// The two must agree, so the examples in slugs.test.ts are the ones the web
// app's checks use.

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryPath(name: string): string {
  return `/${slugify(name)}`;
}

export function countryPath(name: string): string {
  return `/country/${slugify(name)}`;
}
