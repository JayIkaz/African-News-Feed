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

// Spec §1: tag backgrounds come from the mint/yellow families (plus anchor
// and urgent); text on a tinted background is always the darkest shade of
// the same colour family, never plain black.
export const CAT_TAG: Record<string, { bg: string; fg: string }> = {
  Politics: { bg: "var(--yellow)", fg: "var(--yellow-text)" },
  Business: { bg: "var(--yellow-tint)", fg: "var(--yellow-text)" },
  Economy: { bg: "var(--yellow)", fg: "var(--yellow-text)" },
  Society: { bg: "var(--yellow-tint)", fg: "var(--yellow-text)" },
  Technology: { bg: "var(--mint-tint)", fg: "var(--mint-text)" },
  Environment: { bg: "var(--mint)", fg: "var(--mint-text)" },
  International: { bg: "var(--anchor)", fg: "#FFFFFF" },
  General: { bg: "var(--paper-2)", fg: "var(--ink-3)" },
};

const DEFAULT_TAG = { bg: "var(--paper-2)", fg: "var(--ink-3)" };

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

// Country tag — mint tint with flag, per spec §4 (kept independent of the
// category tag; both appear together).
export function CountryTag({ country }: { country?: string | null }) {
  return (
    <span
      style={{
        background: "var(--mint-tint)",
        color: "var(--mint-text)",
        fontSize: 10,
        fontWeight: 600,
        fontFamily: "var(--font-ui)",
        padding: "2px 6px",
        borderRadius: 4,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <CountryFlag country={country ?? ""} size={11} />
      {country}
    </span>
  );
}

// Dark image-fallback fills, one per tag family so a missing photo still
// reads as the category's colour world.
const CAT_FALLBACK_BG: Record<string, string> = {
  Politics: "#633806",
  Business: "#633806",
  Economy: "#633806",
  Society: "#633806",
  Technology: "#085041",
  Environment: "#085041",
  International: "#026670",
  General: "#4A4843",
};

function imgFallback(e: React.SyntheticEvent<HTMLImageElement>, cat?: string | null) {
  const el = e.currentTarget;
  el.style.display = "none";
  const parent = el.parentElement;
  if (parent) {
    parent.style.background = CAT_FALLBACK_BG[cat ?? "General"] ?? "#4A4843";
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
  const fallbackBg = CAT_FALLBACK_BG[article.category ?? "General"] ?? "#4A4843";
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
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600, color: tag.fg === "#FFFFFF" ? "var(--anchor)" : tag.fg, textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
            onError={e => imgFallback(e, article.category)}
          />
        </div>
      </Link>
    );
  }

  if (featured) {
    // Spec §3: top story — fixed-height media cropped to fill (focus
    // top-third), mandatory scrim under the overlaid headline, meta line
    // below the image.
    return (
      <Link
        href={`/article/${article.id}`}
        style={{
          display: "block",
          position: "relative",
          background: "var(--surface-1)",
          borderRadius: 12,
          border: "0.5px solid var(--border)",
          overflow: "hidden",
          cursor: "pointer",
          textDecoration: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <div className="an-top-media" style={{ position: "relative", width: "100%", background: fallbackBg, overflow: "hidden" }}>
          <img
            src={imageUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
            loading="eager"
            onError={e => imgFallback(e, article.category)}
          />
          {/* Scrim — mandatory whenever headline text sits over an image */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
          <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8, alignItems: "center" }}>
            <CatTag category={article.category} />
            <TranslateChip t={t} light />
          </div>
          <h2
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 14,
              margin: 0,
              color: "#FFFFFF",
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(18px, 2.2vw, 22px)",
              lineHeight: 1.3,
              fontWeight: 600,
            }}
          >
            {t.title}
          </h2>
        </div>
        <p style={{ padding: "10px 16px", margin: 0, fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink)", opacity: 0.65, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CountryFlag country={article.country ?? ""} size={14} /> {article.country}</span>
          <span>·</span>
          <span>{dateStr}</span>
          <span>·</span>
          <span>{article.sourceName}</span>
        </p>
      </Link>
    );
  }

  // Spec §4: latest-news card. `side` uses the same construction.
  return (
    <Link
      href={`/article/${article.id}`}
      className="an-news-card"
      style={{
        background: "var(--surface-1)",
        borderRadius: 12,
        border: "0.5px solid var(--border)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="an-news-card-media" style={{ position: "relative", background: fallbackBg, overflow: "hidden" }}>
        <img
          src={imageUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading={side ? "eager" : "lazy"}
          onError={e => imgFallback(e, article.category)}
        />
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <CatTag category={article.category} />
        </div>
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
          <CountryTag country={article.country} />
          <TranslateChip t={t} />
        </div>
        <h3
          className="line-clamp-2"
          style={{ fontFamily: "var(--font-headline)", fontSize: 14, fontWeight: 500, margin: "8px 0 6px", lineHeight: 1.3, color: isRead ? "var(--ink-4)" : "var(--ink)", opacity: isRead ? 0.7 : 1 }}
        >
          {t.title}
          {isRead && (
            <span title="Read" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--ink-4)", marginLeft: 6, verticalAlign: "middle" }} />
          )}
        </h3>
        {t.summary && (
          <p className="line-clamp-2" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink)", opacity: 0.72, margin: 0, lineHeight: 1.45 }}>
            {truncateToWord(t.summary, 130)}
          </p>
        )}
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink)", opacity: 0.55, margin: "auto 0 0", paddingTop: 8 }}>
          {dateStr}
        </p>
      </div>
    </Link>
  );
}
