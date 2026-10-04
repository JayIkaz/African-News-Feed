import { Link } from "wouter";
import { Languages } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Article } from "@workspace/api-client-react";
import { useArticleImage } from "@/lib/articleImage";
import { CountryFlag } from "@/components/common/CountryFlag";
import { useTranslate } from "@/lib/useTranslate";
import { truncateToWord } from "@/lib/truncate";

// Small pill shown on non-English cards; toggles between original and English.
export function TranslateChip({ t, light = false }: { t: ReturnType<typeof useTranslate>; light?: boolean }) {
  if (!t.canTranslate) return null;
  const label: React.ReactNode = t.isTranslating
    ? "Translating…"
    : t.showEnglish
      ? "Show original"
      : t.translateFailed
        ? "Translation unavailable"
        : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Languages size={12} aria-hidden="true" /> English
          </span>
        );
  return (
    <button
      onClick={t.toggle}
      disabled={t.isTranslating}
      title={t.showEnglish ? `Show ${t.languageLabel} original` : `Translate from ${t.languageLabel}`}
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "2px 7px",
        borderRadius: 4,
        border: light ? "1px solid var(--on-image-faint)" : "1px solid var(--border)",
        background: light ? "transparent" : "var(--paper-2)",
        color: light ? "var(--on-image)" : "var(--ink-3)",
        cursor: t.isTranslating ? "wait" : "pointer",
        lineHeight: 1.4,
      }}
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
  featured?: boolean;
  isRead?: boolean;
}

export function ArticleCard({ article, featured = false, isRead = false }: ArticleCardProps) {
  const t = useTranslate(article);
  const image = useArticleImage(article);
  const dateStr = article.publishedDate
    ? formatDistanceToNow(new Date(article.publishedDate), { addSuffix: true })
    : "";

  if (featured) {
    // Spec §4: top story — full-bleed image cropped top-centre at a fixed
    // height, mandatory scrim, and all text stacked over the image bottom.
    // No card frame: the spec allows no borders, shadows or rounded corners.
    return (
      <Link
        href={`/article/${article.id}`}
        className="an-top-story"
        style={{
          display: "flex",
          alignItems: "flex-end",
          position: "relative",
          overflow: "hidden",
          background: "var(--image-empty)",
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        {/* With no usable image the card is a plain --image-empty block with
            the same text on it, not an empty frame or a stand-in photo. */}
        {image.src && (
          <img
            src={image.src}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "var(--crop-focus)" }}
            loading="eager"
            referrerPolicy="no-referrer"
            onError={image.onError}
          />
        )}
        {/* Scrim — mandatory whenever text sits over the image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--scrim)",
          }}
        />
        <div style={{ position: "relative", padding: "28px 24px", maxWidth: 640 }}>
          {/* Spec §4: eyebrow is the category in --accent. The spec's --live
              "breaking" variant was cut — an aggregator ingesting on a
              schedule has no signal for what is breaking, and the only
              available proxy (recency) just restates that this is the newest
              article, which is what "top story" already means. */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--on-image-muted)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {article.category}
            <TranslateChip t={t} light />
          </div>
          <h3
            className="an-top-story-headline"
            lang={t.lang}
            dir="auto"
            style={{
              margin: "0 0 12px",
              color: "var(--on-image)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              lineHeight: 1.15,
            }}
          >
            {t.title}
          </h3>
          {t.summary && (
            <p
              className="line-clamp-3"
              lang={t.lang}
              dir="auto"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--on-image-muted)",
                fontStyle: "normal",
                margin: "0 0 12px",
                lineHeight: 1.5,
              }}
            >
              {truncateToWord(t.summary, 180)}
            </p>
          )}
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              color: "var(--on-image-faint)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <CountryFlag country={article.country ?? ""} size={14} /> {article.country}
            </span>
            <span>·</span>
            <span>{dateStr}</span>
            <span>·</span>
            <span>{article.sourceName}</span>
          </p>
        </div>
      </Link>
    );
  }

  // Spec §6: latest-news row — a borderless stream, not a boxed card. This is
  // the biggest structural change in the spec: no background, no border, no
  // radius, no shadow. Structure comes from the hairline under each row and
  // the spacing. A story with no usable image has no thumbnail slot at all.
  //
  // Hover (divider brightening to --line-strong, headline shifting to
  // --accent) and the read state live in index.css rather than inline style
  // handlers, because both need to restyle a descendant — and an inline
  // colour would beat the hover rule.
  return (
    <Link
      href={`/article/${article.id}`}
      className={`an-story-row${isRead ? " an-story-row--read" : ""}`}
    >
      {image.src && (
        <div className="an-story-thumb">
          <img
            src={image.src}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "var(--crop-focus)" }}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={image.onError}
          />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Spec §6: category tag (--accent) and country tag (--ink-faint)
            side by side above the headline. The spec's breaking override —
            a --live tag replacing the category here — was cut along with the
            rest of the breaking state; see the top-story eyebrow above. */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            {article.category}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CountryFlag country={article.country ?? ""} size={11} />
            {article.country}
          </span>
          <TranslateChip t={t} />
        </div>

        {/* Spec §6: truncate on the last full word before 90 chars rather
            than trusting the clamp to cut cleanly; the clamp is the safety
            net for the two-line box, not the cut point. */}
        <h3 className="an-story-row-headline line-clamp-2" lang={t.lang} dir="auto">
          {truncateToWord(t.title, 90)}
          {isRead && (
            <span
              title="Read"
              style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--ink-faint)", marginLeft: 6, verticalAlign: "middle" }}
            />
          )}
        </h3>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--ink-faint)",
            margin: 0,
          }}
        >
          {dateStr}
        </p>
      </div>
    </Link>
  );
}
