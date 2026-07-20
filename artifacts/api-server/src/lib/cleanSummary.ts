// ---------------------------------------------------------------------------
// Summary cleaner
//
// RSS descriptions are frequently malformed: truncated mid-tag, double-encoded,
// or missing the opening "<" of their first tag (leaving remnants like
// `"Photo FIFA" />` at the start of the text). The cleaner strips complete
// tags, then removes those dangling fragments.
// ---------------------------------------------------------------------------

function stripTags(text: string): string {
  // Comments and CDATA wrappers first, then complete tags.
  return text
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<!\[CDATA\[|\]\]>/g, " ")
    .replace(/<[^>]+>/g, " ");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

// Remnants of a truncated tag at the start of the text, i.e. attribute
// leftovers that end in ">" or "/>":
//   `alt="Photo FIFA" />rest`   (attribute pairs)
//   `"Photo FIFA" />rest`       (bare quoted value)
//   `Photo FIFA" />rest`        (value missing its opening quote)
//   `/>rest`, `>rest`, `p>rest` (closing scraps)
const LEADING_REMNANTS = [
  // One or more (optionally named) quoted attribute values, then > or />
  /^\s*(?:(?:[\w:-]+\s*=\s*)?(?:"[^"<>]*"|'[^'<>]*')\s*)+\/?\s*>\s*/,
  // Unopened quoted value: short run of text ending `" />` (slash required so
  // ordinary prose containing a quote before ">" is never eaten)
  /^\s*[^<>]{0,150}?["']\s*\/>\s*/,
  // Bare scraps: `/>`, `>`, or a lone tag name glued to ">" (`p>`, `img/>`)
  /^\s*\/?[\w:-]{0,15}\/?>\s*/,
];

function stripDanglingFragments(text: string): string {
  // Leading truncated-tag remnants (apply repeatedly until stable)
  for (let i = 0; i < 5; i++) {
    const before = text;
    for (const pat of LEADING_REMNANTS) text = text.replace(pat, "");
    if (text === before) break;
  }
  // Trailing truncated open tag, e.g. `... <img src="http`
  text = text.replace(/<[^>]*$/, "");
  // Standalone "/>" tokens left mid-text by truncated markup
  text = text.replace(/(^|\s)\/>(?=\s|$)/g, " ");
  return text;
}

export function cleanSummary(raw: string, sourceTitle?: string): string {
  let text = stripTags(raw);
  text = decodeEntities(text);
  // Some feeds double-encode HTML; strip tags that surfaced after decoding.
  text = text.replace(/<\/?[a-zA-Z][^<>]*\/?>/g, " ");
  text = stripDanglingFragments(text);

  text = text.replace(/\s*The post .{0,300}? appeared first on .{0,150}?\.?\s*$/is, "");

  if (sourceTitle) {
    const escaped = sourceTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`\\s*[|\\-–—]\\s*${escaped}\\s*$`, "i"), "");
  }

  // Stripping one trailing artifact can expose another (e.g. "Read More:
  // https://…" — removing the URL leaves "Read More:"), so loop until stable.
  for (let i = 0; i < 5; i++) {
    const before = text;
    text = text.replace(/\s*(Read more|Continue reading|Click here to read|Read full story|See also|View more|Learn more)[^.]*\.?\s*$/i, "");
    text = text.replace(/\s*\[\s*(…|\.{3}|Read More|\+\d+ chars?)\s*\]\s*$/i, "");
    text = text.replace(/\s*\(\s*\.\.\.\s*\)\s*$/i, "");
    text = text.replace(/\s*https?:\/\/\S+\s*$/i, "");
    if (text === before) break;
  }
  text = text.replace(/\s{2,}/g, " ").trim();

  return text;
}
