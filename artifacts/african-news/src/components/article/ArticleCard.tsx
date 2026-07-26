import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Article } from "@workspace/api-client-react";
import { getArticleImage } from "@/lib/unsplash";
import { CountryFlag } from "@/components/common/CountryFlag";
import { useTranslate } from "@/lib/useTranslate";

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
        borderRadius: 3,
        border: light ? "1px solid rgba(255,255,255,0.5)" : "1px solid var(--paper-3)",
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

export const CAT_COLORS: Record<string, string> = {
  Politics: "#D85A30",
  Business: "#378ADD",
  Technology: "#1D9E75",
  Economy: "#E8A33D",
  Society: "#7F77DD",
  Environment: "#639922",
  International: "#C97B4A",
  General: "#9691B0",
};

const CAT_FALLBACK_BG: Record<string, string> = {
  Politics: "#2E1710",
  Business: "#101E30",
  Technology: "#0C2A20",
  Economy: "#2E2008",
  Society: "#1C1936",
  Environment: "#122010",
  International: "#241708",
  General: "#1E1D3D",
};

function imgFallback(e: React.SyntheticEvent<HTMLImageElement>, cat?: string | null) {
  const el = e.currentTarget;
  el.style.display = "none";
  const parent = el.parentElement;
  if (parent) {
    parent.style.background = CAT_FALLBACK_BG[cat ?? "General"] ?? "#1E1D3D";
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
  const catColor = CAT_COLORS[article.category ?? "General"] ?? "#9691B0";
  const fallbackBg = CAT_FALLBACK_BG[article.category ?? "General"] ?? "#1E1D3D";

  if (compact) {
    return (
      <Link
        href={`/article/${article.id}`}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 56px",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid var(--paper-2)",
          cursor: "pointer",
          transition: "background 0.2s",
          textDecoration: "none",
          alignItems: "start",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--paper-2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600, color: catColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
    return (
      <Link
        href={`/article/${article.id}`}
        className="an-featured-card"
        style={{
          display: "block",
          position: "relative",
          background: fallbackBg,
          cursor: "pointer",
          overflow: "hidden",
          textDecoration: "none",
        }}
        onMouseEnter={e => { const img = e.currentTarget.querySelector(".hero-img") as HTMLElement; if (img) img.style.transform = "scale(1.04)"; }}
        onMouseLeave={e => { const img = e.currentTarget.querySelector(".hero-img") as HTMLElement; if (img) img.style.transform = "scale(1)"; }}
      >
        <img
          className="hero-img"
          src={imageUrl}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}
          loading="eager"
          onError={e => imgFallback(e, article.category)}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.15) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 28, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ background: catColor, color: "#fff", fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3 }}>
              {article.category}
            </span>
            <TranslateChip t={t} light />
          </div>
          <h2 style={{
            fontFamily: "var(--font-headline)",
            fontSize: "clamp(22px, 2.5vw, 30px)",
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: 10,
            letterSpacing: "-0.02em",
            color: "#fff",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}>
            {t.title}
          </h2>
          {t.summary && (
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 300,
              fontStyle: "italic",
              opacity: 0.9,
              marginBottom: 14,
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
            }}>
              {t.summary}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-ui)", fontSize: 12, opacity: 0.8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CountryFlag country={article.country ?? ""} size={15} /> {article.country}</span>
            <span>·</span>
            <span>{dateStr}</span>
            <span>·</span>
            <span>{article.sourceName}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (side) {
    return (
      <Link
        href={`/article/${article.id}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "var(--surface-1)",
          padding: 20,
          cursor: "pointer",
          transition: "background 0.2s",
          textDecoration: "none",
          flex: 1,
          height: "100%",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--paper-2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--surface-1)")}
      >
        <div className="side-card-img" style={{ width: "100%", height: 140, borderRadius: 6, overflow: "hidden", background: fallbackBg, flexShrink: 0 }}>
          <img
            src={imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
            onError={e => imgFallback(e, article.category)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
          <span style={{ background: catColor, color: "#fff", fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 3 }}>
            {article.category}
          </span>
          <TranslateChip t={t} />
        </div>
        <div style={{ fontFamily: "var(--font-headline)", fontSize: 16, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em", color: isRead ? "var(--ink-4)" : "var(--ink)", opacity: isRead ? 0.7 : 1 }}>
          {t.title}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--ink-4)" }}>
          <CountryFlag country={article.country ?? ""} size={13} />
          <span>{article.country}</span>
          <span>·</span>
          <span>{dateStr}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/article/${article.id}`}
      style={{
        background: "var(--surface-1)",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        border: "1px solid var(--paper-3)",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
        const img = e.currentTarget.querySelector(".card-img") as HTMLElement;
        if (img) img.style.transform = "scale(1.05)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
        const img = e.currentTarget.querySelector(".card-img") as HTMLElement;
        if (img) img.style.transform = "scale(1)";
      }}
    >
      <div style={{ aspectRatio: "16/9", background: fallbackBg, overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <img
          className="card-img"
          src={imageUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)" }}
          loading="lazy"
          onError={e => imgFallback(e, article.category)}
        />
        <div style={{ position: "absolute", top: 10, left: 10, background: catColor, color: "#fff", fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3 }}>
          {article.category}
        </div>
      </div>
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ fontFamily: "var(--font-headline)", fontSize: 15.5, fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.01em", color: isRead ? "var(--ink-4)" : "var(--ink)", margin: 0, opacity: isRead ? 0.7 : 1 }}>
          {t.title}
          {isRead && (
            <span title="Read" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--ink-4)", marginLeft: 6, verticalAlign: "middle", flexShrink: 0 }} />
          )}
        </h3>
        {t.summary && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5, margin: 0, flex: 1 }}>
            {t.summary}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid var(--paper-2)", marginTop: "auto" }}>
          <CountryFlag country={article.country ?? ""} size={15} />
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, fontWeight: 500, color: "var(--ink-2)" }}>{article.country}</span>
          <TranslateChip t={t} />
          <span style={{ color: "var(--paper-3)" }}>·</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-4)", marginLeft: "auto" }}>{dateStr}</span>
        </div>
      </div>
    </Link>
  );
}
