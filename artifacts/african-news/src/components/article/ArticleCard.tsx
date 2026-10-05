import { useState } from "react";
import { Link } from "wouter";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { Article } from "@workspace/api-client-react";
import { useArticleImage } from "@/lib/articleImage";
import { CountryFlag } from "@/components/common/CountryFlag";
import { useTranslate } from "@/lib/useTranslate";
import { truncateToWord } from "@/lib/truncate";
import { categoryHref, countryHref } from "@/lib/slugs";
import { sourceHref } from "@/lib/listing";

// A text button on stories that are not in English. It asks for the English
// version, and once that is showing it offers the original back. The title says
// which language the original is in.
export function TranslateChip({ t }: { t: ReturnType<typeof useTranslate> }) {
  if (!t.canTranslate) return null;
  const label = t.isTranslating
    ? "Translating…"
    : t.showEnglish
      ? "Show original"
      : t.translateFailed
        ? "Translation unavailable"
        : "Read in English";
  return (
    <button
      type="button"
      className="an-translate"
      onClick={t.toggle}
      disabled={t.isTranslating}
      title={t.showEnglish ? `Show the ${t.languageLabel} original` : `Translate from ${t.languageLabel}`}
    >
      {label}
    </button>
  );
}

// The dark direction drops the per-category colour families: the spec
// reserves colour for category and urgency signals, and a tag IS the
// category signal, so one quiet treatment carries all of them — the raised
// fill with the category name in --accent (7.63:1). The map keeps its shape
// because it's exported and keyed by category, but every entry now resolves
// to the same spec-legal pair.
const TAG_STYLE = { bg: "var(--paper-raised)", fg: "var(--accent)" };

export const CAT_TAG: Record<string, { bg: string; fg: string }> = {
  Politics: TAG_STYLE,
  Business: TAG_STYLE,
  Economy: TAG_STYLE,
  Society: TAG_STYLE,
  Technology: TAG_STYLE,
  Environment: TAG_STYLE,
  International: TAG_STYLE,
  General: TAG_STYLE,
};

const DEFAULT_TAG = TAG_STYLE;

export function catTag(category?: string | null) {
  return CAT_TAG[category ?? "General"] ?? DEFAULT_TAG;
}

// Category tag pill, shared across cards and pages.
export function CatTag({ category, size = 12 }: { category?: string | null; size?: number }) {
  const { bg, fg } = catTag(category);
  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color: fg,
        fontFamily: "var(--font-ui)",
        fontSize: size,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 4,
        lineHeight: 1.5,
      }}
    >
      {category}
    </span>
  );
}

interface ArticleCardProps {
  article: Article;
  isRead?: boolean;
}

// One story in a list. The headline is the link to the story's page, and a
// stretched ::after on that link (see .an-story-link in index.css) makes the
// whole row clickable, so the source, country and section can be links of their
// own without one anchor nested inside another.
//
// The thumbnail is on the right, so the text starts at the same left edge on
// every row whether or not there is a picture. It is shown only once the image
// has loaded; a story with no image, or one whose image fails, has no slot.
//
// Hover, focus and the read state live in index.css rather than inline style
// handlers: they restyle a descendant, and an inline colour would beat the rule.
export function ArticleCard({ article, isRead = false }: ArticleCardProps) {
  const t = useTranslate(article);
  const image = useArticleImage(article);
  const [loaded, setLoaded] = useState(false);
  const published = article.publishedDate ? new Date(article.publishedDate) : null;
  const when = published && isValid(published) ? published : null;

  return (
    <article className={`an-story-row${isRead ? " an-story-row--read" : ""}`}>
      {/* Floated right in CSS; first in the markup so the text wraps beside it. The picture is decorative (empty alt). */}
      {image.src && (
        <div className="an-story-thumb">
          <img
            ref={(el) => {
              // An image already in the cache can finish before React attaches onLoad.
              if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
            }}
            src={image.src}
            alt=""
            className={loaded ? "is-loaded" : undefined}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={image.onError}
          />
        </div>
      )}

      {/* Truncate on the last whole word before 90 characters rather than
          trusting the clamp to cut cleanly; the clamp is the safety net for the
          line box, not the cut point. */}
      <h3 className="an-story-headline" lang={t.lang} dir="auto">
        <Link href={`/article/${article.id}`} className="an-story-link">
          {truncateToWord(t.title, 90)}
        </Link>
        {isRead && <span className="an-read-dot" role="img" aria-label="Read" />}
      </h3>

      {/* The facts line. The spaces between the items are real, so copied or
          read-out text keeps the items apart; the dots are drawn in CSS. */}
      <p className="an-story-meta">
        <Link href={sourceHref(article.sourceId)} className="an-story-source">{article.sourceName}</Link>{" "}
        <Link href={countryHref(article.country)}>
          <CountryFlag country={article.country} size={12} decorative className="an-story-flag" />
          {article.country}
        </Link>{" "}
        <Link href={categoryHref(article.category)}>{article.category}</Link>
        {when && (
          <>
            {" "}
            <time dateTime={when.toISOString()} title={format(when, "EEEE d MMMM yyyy, HH:mm")}>
              {formatDistanceToNow(when, { addSuffix: true })}
            </time>
          </>
        )}
        {t.canTranslate && (
          <>
            {" "}
            <TranslateChip t={t} />
          </>
        )}
      </p>
    </article>
  );
}
