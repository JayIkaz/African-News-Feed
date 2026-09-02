import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Article } from "@workspace/api-client-react";
import { getArticleImage } from "@/lib/unsplash";
import { CountryFlag } from "@/components/common/CountryFlag";
import { useTranslate } from "@/lib/useTranslate";
import { truncateToWord } from "@/lib/truncate";

// Small pill shown on non-English cards; toggles between original and English.
export function TranslateChip({ t, light = false }: { t: ReturnType<typeof useTranslate>; light?: boolean }) {
  if (!t.canTranslate) return null;
  const label = t.isTranslating
    ? "Translating…"
    : t.showEnglish
      ? "Show original"
      : t.translateFailed
        ? "Translation unavailable"
        : "🌐 English";
  return (
    <button
      onClick={t.toggle}
      disabled={t.isTranslating}
      title={t.showEnglish ? `Show ${t.languageLabel} original` : `Translate from ${t.languageLabel}`}
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "2px 7px",
        borderRadius: 4,
        border: light ? "1px solid rgba(255,255,255,0.5)" : "1px solid var(--border)",
        background: light ? "rgba(0,0,0,0.35)" : "var(--paper-2)",
        color: light ? "#fff" : "var(--ink-3)",
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
export function CatTag({ category, size = 11 }: { category?: string | null; size?: number }) {
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

// Spec §1 assigns --paper-raised the job of image placeholder/fallback fill.
// This replaces the old per-category fills (browns, greens, teal), which were
// tuned for the light theme and read as garish blocks on --paper — and which
// the dark direction rules out anyway: colour is reserved for category and
// urgency signals, never decoration.
const IMAGE_FALLBACK_BG = "var(--paper-raised)";

function imgFallback(e: React.SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  el.style.display = "none";
  const parent = el.parentElement;
  if (parent) {
    parent.style.background = IMAGE_FALLBACK_BG;
  }
}

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  compact?: boolean;
  side?: boolean;
  isRead?: boolean;
}

export function ArticleCard({ article, featured = false, compact = false, side = false, isRead = false }: ArticleCardProps) {
  const t = useTranslate(article);
  const imageUrl = getArticleImage(article, featured ? "featured" : side ? "side" : compact ? "compact" : "card");
  const dateStr = article.publishedDate
    ? formatDistanceToNow(new Date(article.publishedDate), { addSuffix: true })
    : "";
  const fallbackBg = IMAGE_FALLBACK_BG;
  const tag = catTag(article.category);

  if (compact) {
    return (
      <Link
        href={`/article/${article.id}`}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 56px",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
          transition: "background 0.15s",
          textDecoration: "none",
          alignItems: "start",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--paper-2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600, color: tag.fg, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {article.category}
            </span>
            <TranslateChip t={t} />
          </div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, color: isRead ? "var(--ink-4)" : "var(--ink)", opacity: isRead ? 0.7 : 1 }}>
            {t.title}
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-4)", marginTop: 4, display: "flex", gap: 4, alignItems: "center" }}>
            <CountryFlag country={article.country ?? ""} size={13} />
            <span>{article.country}</span>
            <span>·</span>
            <span>{dateStr}</span>
          </div>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 6, overflow: "hidden", background: fallbackBg, flexShrink: 0 }}>
          <img
            src={imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "var(--crop-focus)" }}
            loading="lazy"
            onError={e => imgFallback(e)}
          />
        </div>
      </Link>
    );
  }

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
          background: fallbackBg,
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        <img
          src={imageUrl}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "var(--crop-focus)" }}
          loading="eager"
          onError={e => imgFallback(e)}
        />
        {/* Scrim — mandatory whenever text sits over the image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(20,19,43,0.1) 30%, rgba(10,9,25,0.95) 100%)",
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
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {article.category}
            <TranslateChip t={t} light />
          </div>
          <h2
            className="an-top-story-headline"
            style={{
              margin: "0 0 12px",
              color: "var(--ink)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              lineHeight: 1.15,
            }}
          >
            {t.title}
          </h2>
          {t.summary && (
            <p
              className="line-clamp-3"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--ink-muted)",
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
              fontSize: 11,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
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
  // the spacing. `side` uses the same construction.
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
      <div className="an-story-thumb" style={{ background: fallbackBg }}>
        <img
          src={imageUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "var(--crop-focus)" }}
          loading={side ? "eager" : "lazy"}
          onError={e => imgFallback(e)}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Spec §6: category tag (--accent) and country tag (--ink-faint)
            side by side above the headline. The spec's breaking override —
            a --live tag replacing the category here — was cut along with the
            rest of the breaking state; see the top-story eyebrow above. */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
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
              fontSize: 9,
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
        <h3 className="an-story-row-headline line-clamp-2">
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
            fontSize: 10,
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
