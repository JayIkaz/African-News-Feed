import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Article } from "@workspace/api-client-react";
import { getArticleImage } from "@/lib/unsplash";
import { COUNTRY_FLAGS } from "@/lib/countries";

export const CAT_COLORS: Record<string, string> = {
  Politics: "#c1392b",
  Business: "#1a5276",
  Technology: "#1a7a6e",
  Economy: "#b8860b",
  Society: "#6b3fa0",
  Environment: "#2d6a4f",
  International: "#8b4513",
  General: "#5a5750",
};

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  compact?: boolean;
  side?: boolean;
}

export function ArticleCard({ article, featured = false, compact = false, side = false }: ArticleCardProps) {
  const imageUrl = getArticleImage(article);
  const dateStr = article.publishedDate
    ? formatDistanceToNow(new Date(article.publishedDate), { addSuffix: true })
    : "";
  const flag = COUNTRY_FLAGS[article.country ?? ""] ?? "🌍";
  const catColor = CAT_COLORS[article.category ?? "General"] ?? "#5a5750";

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
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600, color: catColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
            {article.category}
          </div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.title}
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-4)", marginTop: 4, display: "flex", gap: 4, alignItems: "center" }}>
            <span>{flag}</span>
            <span>{article.country}</span>
            <span>·</span>
            <span>{dateStr}</span>
          </div>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 6, overflow: "hidden", background: "var(--paper-3)", flexShrink: 0 }}>
          <img src={imageUrl} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        </div>
      </Link>
    );
  }

  if (featured) {
    return (
      <Link
        href={`/article/${article.id}`}
        style={{
          display: "block",
          position: "relative",
          background: "var(--ink-2)",
          minHeight: 480,
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
          alt={article.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 28, color: "#fff" }}>
          <div style={{ display: "inline-block", background: catColor, color: "#fff", fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3, marginBottom: 12 }}>
            {article.category}
          </div>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 700, lineHeight: 1.25, marginBottom: 10, letterSpacing: "-0.02em" }}>
            {article.title}
          </h2>
          {article.summary && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 300, fontStyle: "italic", opacity: 0.85, marginBottom: 14, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {article.summary}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-ui)", fontSize: 12, opacity: 0.75 }}>
            <span>{flag} {article.country}</span>
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
          background: "#fff",
          padding: 20,
          cursor: "pointer",
          transition: "background 0.2s",
          textDecoration: "none",
          flex: 1,
          height: "100%",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--paper-2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
      >
        <div style={{ width: "100%", height: 140, borderRadius: 6, overflow: "hidden", background: "var(--paper-3)", flexShrink: 0, position: "relative" }}>
          <img src={imageUrl} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.12), rgba(0,0,0,0))", pointerEvents: "none" }} />
        </div>
        <div style={{ display: "inline-block", background: catColor, color: "#fff", fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 3, alignSelf: "flex-start" }}>
          {article.category}
        </div>
        <div style={{ fontFamily: "var(--font-headline)", fontSize: 16, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em", display: "block", overflow: "visible" }}>
          {article.title}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--ink-4)" }}>
          <span>{flag}</span>
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
        background: "#fff",
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
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)";
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
      <div style={{ aspectRatio: "16/9", background: "var(--paper-2)", overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <img
          className="card-img"
          src={imageUrl}
          alt={article.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)" }}
          loading="lazy"
        />
        <div style={{ position: "absolute", top: 10, left: 10, background: catColor, color: "#fff", fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3 }}>
          {article.category}
        </div>
      </div>
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ fontFamily: "var(--font-headline)", fontSize: 15.5, fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.01em", display: "block", overflow: "visible", color: "var(--ink)" }}>
          {article.title}
        </h3>
        {article.summary && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5, display: "block", overflow: "visible", flex: 1 }}>
            {article.summary}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid var(--paper-2)", marginTop: "auto" }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>{flag}</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, fontWeight: 500, color: "var(--ink-2)" }}>{article.country}</span>
          <span style={{ color: "var(--paper-3)" }}>·</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-4)", marginLeft: "auto" }}>{dateStr}</span>
        </div>
      </div>
    </Link>
  );
}
