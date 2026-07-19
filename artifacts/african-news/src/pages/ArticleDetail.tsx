import { useParams, Link } from "wouter";
import { useEffect } from "react";
import { format } from "date-fns";
import { Share2, BookmarkPlus, ArrowLeft, ExternalLink } from "lucide-react";
import {
  useGetArticle,
  useListArticles,
  getGetArticleQueryKey,
  getListArticlesQueryKey,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getArticleImage } from "@/lib/unsplash";
import { ArticleCard } from "@/components/article/ArticleCard";
import { CAT_COLORS } from "@/components/article/ArticleCard";
import { useReadHistory } from "@/lib/useReadHistory";
import { useTranslate } from "@/lib/useTranslate";
import { TranslateChip } from "@/components/article/ArticleCard";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const articleId = parseInt(id || "0", 10);
  const { markRead, isRead } = useReadHistory();

  const { data: article, isLoading, error } = useGetArticle(articleId, {
    query: {
      queryKey: getGetArticleQueryKey(articleId),
      enabled: !isNaN(articleId) && articleId > 0,
    },
  });

  useEffect(() => {
    if (articleId > 0) {
      markRead(articleId);
    }
  }, [articleId, markRead]);

  const relatedParams = { category: article?.category, limit: 4 };
  const { data: relatedData } = useListArticles(relatedParams, {
    query: {
      queryKey: getListArticlesQueryKey(relatedParams),
      enabled: !!article?.category,
    },
  });
  const t = useTranslate(article);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="an-article-header" style={{ paddingTop: 48, paddingBottom: 48 }}>
          {[60, 100, "80%", 40, 400, 16, 16, "70%"].map((w, i) => (
            <div key={i} className="an-skeleton" style={{ height: typeof w === "number" && w > 100 ? w : 16, width: typeof w === "string" ? w : "100%", marginBottom: 16, borderRadius: 6 }} />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (error || !article) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: 28, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>Article Not Found</h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--ink-3)", marginBottom: 24 }}>We couldn't find the article you were looking for.</p>
          <Link href="/" style={{ display: "inline-block", background: "var(--ink)", color: "#fff", padding: "12px 24px", borderRadius: 6, fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500 }}>
            Return to Home
          </Link>
        </div>
      </AppLayout>
    );
  }

  const imageUrl = getArticleImage(article);
  const relatedArticles = relatedData?.articles.filter(a => a.id !== article.id).slice(0, 3) ?? [];
  const catColor = CAT_COLORS[article.category ?? "General"] ?? "#5a5750";

  return (
    <AppLayout>
      <article style={{ background: "var(--paper)", paddingBottom: 64 }}>

        {/* ── Editorial Header ── */}
        <header className="an-article-header">
          <button
            className="an-article-back-btn"
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 400, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", padding: "0 4px", marginBottom: 20, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-3)")}
          >
            <ArrowLeft size={15} /> Back
          </button>

          {/* Category + Country */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Link href={`/category/${article.category}`}>
              <span style={{ display: "inline-block", background: catColor, color: "#fff", fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 3, cursor: "pointer" }}>
                {article.category}
              </span>
            </Link>
            <Link href={`/country/${article.country}`} style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-3)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-3)")}
            >
              {article.country}
            </Link>
            <TranslateChip t={t} />
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, letterSpacing: "-0.025em", marginBottom: 16 }}>
            {t.title}
          </h1>

          {/* Deck / Summary */}
          {t.summary && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 300, fontStyle: "italic", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 24 }}>
              {t.summary}
            </p>
          )}

          {/* Byline row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid var(--paper-3)", borderBottom: "1px solid var(--paper-3)", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, background: "var(--paper-3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: 16, color: "var(--ink-2)", flexShrink: 0 }}>
                {article.sourceName?.charAt(0) ?? "N"}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 2 }}>
                  {article.sourceName}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-4)", display: "flex", alignItems: "center", gap: 6 }}>
                  {article.author && <><span>By {article.author}</span><span>·</span></>}
                  <span>{format(new Date(article.publishedDate), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[<Share2 size={15} />, <BookmarkPlus size={15} />].map((icon, i) => (
                <button key={i} className="an-icon-btn" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--paper-3)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ink-3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--paper-3)")}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── Hero Image ── */}
        <div className="an-article-hero-img">
          <div style={{ aspectRatio: "21/9", borderRadius: 12, overflow: "hidden", background: "var(--paper-2)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <img src={imageUrl} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-4)", textAlign: "right", marginTop: 6, fontStyle: "italic" }}>
            Image representation for {article.category}
          </p>
        </div>

        {/* ── Article Body ── */}
        <div className="an-article-body">

          {/* Drop-cap paragraph */}
          <div style={{ fontFamily: "var(--font-body)", fontSize: 17, fontWeight: 400, lineHeight: 1.75, color: "var(--ink-2)", marginBottom: 24, position: "relative" }}>
            <span className="an-drop-cap" style={{ fontFamily: "var(--font-headline)", fontSize: 68, fontWeight: 700, color: "var(--ink)", float: "left", lineHeight: 0.8, marginRight: 8, marginTop: 8 }}>
              {t.summary?.charAt(0) ?? "T"}
            </span>
            {t.summary?.slice(1)}
          </div>

          <div style={{ fontFamily: "var(--font-body)", fontSize: 17, fontWeight: 400, lineHeight: 1.75, color: "var(--ink-2)", marginBottom: 24 }}>
            This story was originally published by <strong style={{ fontWeight: 600 }}>{article.sourceName}</strong> on {format(new Date(article.publishedDate), 'MMMM d, yyyy')}. It has been aggregated and classified under <em>{article.category}</em>, relevant to news from {article.country}.
          </div>

          {/* Read full CTA */}
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--paper-3)", textAlign: "center" }}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--ink)", color: "#fff", padding: "14px 28px", borderRadius: 100, fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "background 0.2s, transform 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.transform = "none"; }}
            >
              Read full article on {article.sourceName} <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </article>

      {/* ── Related Articles ── */}
      {relatedArticles.length > 0 && (
        <section style={{ background: "var(--paper-2)", paddingTop: 48, paddingBottom: 64, borderTop: "1px solid var(--paper-3)", marginTop: 0 }}>
          <div className="an-container">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 4, height: 22, background: "var(--accent)", borderRadius: 2 }} />
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                More in {article.category}
              </h2>
            </div>
            <div className="an-grid-3">
              {relatedArticles.map(related => (
                <ArticleCard key={related.id} article={related} isRead={isRead(related.id)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
