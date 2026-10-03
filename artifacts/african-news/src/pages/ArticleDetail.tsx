import { useParams, Link } from "wouter";
import { useEffect } from "react";
import { format } from "date-fns";
import { Share2, ArrowLeft, ExternalLink, Inbox } from "lucide-react";
import {
  useGetArticle,
  useListArticles,
  getGetArticleQueryKey,
  getListArticlesQueryKey,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useArticleImage } from "@/lib/articleImage";
import { ArticleCard, CatTag } from "@/components/article/ArticleCard";
import { useReadHistory } from "@/lib/useReadHistory";
import { useTranslate } from "@/lib/useTranslate";
import { SITE_ORIGIN } from "@/lib/site";
import { useToast } from "@/hooks/use-toast";
import { TranslateChip } from "@/components/article/ArticleCard";

// The publisher's own image, shown only when it loads. No image, or one that
// fails, leaves no frame behind. Empty alt: the image is not captioned or
// described by the publisher feed, and the headline above already names the
// story, so a screen reader gains nothing from hearing it twice.
function ArticleHero({ article }: { article: Parameters<typeof useArticleImage>[0] }) {
  const image = useArticleImage(article);
  if (!image.src) return null;
  return (
    <div className="an-article-hero-img">
      <div style={{ aspectRatio: "21/9", borderRadius: 12, overflow: "hidden", background: "var(--paper-2)" }}>
        <img src={image.src} alt="" referrerPolicy="no-referrer" onError={image.onError} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
}

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
  const { toast } = useToast();

  // Native share sheet where the browser has one (most phones), otherwise
  // copy the link. Cancelling the sheet is not an error and gets no toast.
  const shareArticle = async () => {
    if (!article) return;
    const url = `${SITE_ORIGIN}/article/${article.id}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: article.title, url });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        toast({ title: "Could not open the share sheet", description: url, variant: "destructive" });
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: url });
    } catch {
      toast({ title: "Could not copy the link", description: url, variant: "destructive" });
    }
  };

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
          <Inbox size={40} strokeWidth={1.5} aria-hidden="true" style={{ marginBottom: 16, color: "var(--ink-faint)" }} />
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: 28, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>Article Not Found</h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--ink-3)", marginBottom: 24 }}>We couldn't find the article you were looking for.</p>
          <Link href="/" style={{ display: "inline-block", background: "var(--paper-2)", color: "var(--ink)", padding: "12px 24px", borderRadius: 6, fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500 }}>
            Return to Home
          </Link>
        </div>
      </AppLayout>
    );
  }

  const relatedArticles = relatedData?.articles.filter(a => a.id !== article.id).slice(0, 3) ?? [];

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
            <Link href={`/category/${article.category}`} style={{ cursor: "pointer" }}>
              <CatTag category={article.category} />
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
          <h1 lang={t.lang} dir="auto" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, letterSpacing: "-0.025em", marginBottom: 16 }}>
            {t.title}
          </h1>

          {/* Deck / Summary */}
          {t.summary && (
            <p lang={t.lang} dir="auto" style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 300, fontStyle: "italic", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 24 }}>
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
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 2 }}>
                  {article.sourceName}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-4)", display: "flex", alignItems: "center", gap: 6 }}>
                  {article.author && <><span>By {article.author}</span><span>·</span></>}
                  <span>{format(new Date(article.publishedDate), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={shareArticle}
              className="an-icon-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 34, padding: "0 14px", borderRadius: 100, border: "1px solid var(--line-strong)", background: "transparent", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink)" }}
            >
              <Share2 size={15} aria-hidden="true" /> Share
            </button>
          </div>
        </header>

        {/* ── Hero Image ── */}
        <ArticleHero key={article.id} article={article} />

        {/* ── Article Body ── */}
        <div className="an-article-body">

          {/* Drop-cap paragraph */}
          <div lang={t.lang} dir="auto" style={{ fontFamily: "var(--font-body)", fontSize: 17, fontWeight: 400, lineHeight: 1.75, color: "var(--ink-2)", marginBottom: 24, position: "relative" }}>
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
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "var(--paper)", padding: "14px 28px", borderRadius: 100, fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "transform 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
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
            <div className="an-story-list">
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
