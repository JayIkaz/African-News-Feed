// ---------------------------------------------------------------------------
// Share-preview HTML
//
// The web app is a single-page shell: every route is served the same
// index.html, so a link-preview bot sees the home page's tags for every
// article. These helpers take the built shell and swap in tags for one
// article. They are pure (no network, no database) so they can be tested on
// their own.
// ---------------------------------------------------------------------------

export const SITE_ORIGIN = "https://www.africannewsfeed.news";
export const SITE_NAME = "AfricaNews";
export const DEFAULT_IMAGE = `${SITE_ORIGIN}/opengraph.jpg`;
// public/opengraph.jpg in the web app is 1280x720.
const DEFAULT_IMAGE_SIZE = { width: 1280, height: 720 };

export interface ShareArticle {
  id: number;
  title: string;
  summary: string;
  sourceName: string | null;
  country: string;
  category: string;
  publishedDate: Date;
  imageUrl: string | null;
}

export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function squash(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  lsquo: "\u2018", rsquo: "\u2019", ldquo: "\u201C", rdquo: "\u201D",
  hellip: "\u2026", ndash: "\u2013", mdash: "\u2014",
};

// Feed text is often stored still entity-encoded ("Côte d&rsquo;Ivoire", and
// image URLs with "&amp;"). Decode once so escaping below does not turn the
// entity into visible text in a preview card.
export function decodeEntities(value: string): string {
  return value.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (match, dec, hex, name) => {
    if (dec || hex) {
      const code = dec ? parseInt(dec, 10) : parseInt(hex, 16);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[String(name).toLowerCase()] ?? match;
  });
}

// WordPress feeds append '[...]The post <title> first appeared on <site>.' to
// the excerpt. It is not part of the story, so it is cut, and an ellipsis
// marks where the excerpt stopped.
export function cleanExcerpt(value: string): string {
  const text = squash(decodeEntities(value));
  const marker = /\s*(?:\[(?:\.{3}|\u2026)\]\s*)?The post\b[\s\S]{0,400}?\bfirst appeared on\b[\s\S]*$/i;
  if (!marker.test(text)) return text;
  const cut = text.replace(marker, "").replace(/[\s,;:\-\u2013\u2014]+$/, "");
  return cut ? `${cut}\u2026` : "";
}

// Cut on the last whole word before max characters, adding an ellipsis.
export function truncateWords(value: string, max: number): string {
  const text = squash(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, "") + "…";
}

// Preview bots will not follow a plain-http image on an https page, and a
// stock-photo fallback is unrelated to the story, so only an article's own
// https image is used. Everything else gets the site card.
export function pickImage(imageUrl: string | null): { url: string; own: boolean } {
  if (imageUrl) {
    try {
      const parsed = new URL(decodeEntities(imageUrl));
      if (parsed.protocol === "https:") return { url: parsed.toString(), own: true };
    } catch {
      /* fall through to the default card */
    }
  }
  return { url: DEFAULT_IMAGE, own: false };
}

export function buildDescription(article: ShareArticle): string {
  const summary = cleanExcerpt(article.summary ?? "");
  if (summary) return truncateWords(summary, 200);
  const source = article.sourceName ? `, reported by ${article.sourceName}` : "";
  return `${article.category} news from ${article.country}${source}.`;
}

export function buildMetaBlock(article: ShareArticle): string {
  const title = squash(decodeEntities(article.title ?? "")) || SITE_NAME;
  const description = buildDescription(article);
  const url = `${SITE_ORIGIN}/article/${article.id}`;
  const image = pickImage(article.imageUrl);

  const tags: string[] = [
    `<title>${escapeText(`${title} | ${SITE_NAME}`)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:image" content="${escapeAttr(image.url)}" />`,
  ];
  if (!image.own) {
    tags.push(
      `<meta property="og:image:width" content="${DEFAULT_IMAGE_SIZE.width}" />`,
      `<meta property="og:image:height" content="${DEFAULT_IMAGE_SIZE.height}" />`,
    );
  }
  if (!isNaN(article.publishedDate.getTime())) {
    tags.push(`<meta property="article:published_time" content="${article.publishedDate.toISOString()}" />`);
  }
  tags.push(
    `<meta property="article:section" content="${escapeAttr(article.category)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(image.url)}" />`,
  );
  return tags.map((t) => `    ${t}`).join("\n");
}

// Tags the block above replaces. Anything of these kinds already in the shell
// (the home page's tags, or tags added by an earlier release) is removed so a
// bot never sees two titles or two canonicals.
const REPLACED_TAGS: RegExp[] = [
  /<title[\s>][\s\S]*?<\/title>\s*/gi,
  /<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>\s*/gi,
  /<meta\b[^>]*\b(?:property|name)\s*=\s*["'](?:og|article|twitter):[^"']*["'][^>]*>\s*/gi,
  /<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>\s*/gi,
];

// Returns null when the shell has no </head>, so the caller can serve the
// shell untouched rather than a half-edited page.
export function injectMeta(shell: string, article: ShareArticle): string | null {
  if (!/<\/head>/i.test(shell)) return null;
  let html = shell;
  for (const pattern of REPLACED_TAGS) html = html.replace(pattern, "");
  return html.replace(/<\/head>/i, () => `${buildMetaBlock(article)}\n  </head>`);
}
