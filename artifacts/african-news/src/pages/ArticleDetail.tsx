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
import { sourceHref } from "@/lib/listing";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/lib/usePageMeta";
import { truncateToWord } from "@/lib/truncate";
import { categoryHref, countryHref } from "@/lib/slugs";
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
      <div className="an-article-hero-frame">
        <img src={image.src} alt="" referrerPolicy="no-referrer" onError={image.onError} />
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

  // More from the same country, then more from the same section. Each list
  // asks for a few spare rows: this story, and (for the section list) the ones
  // already shown under the country, are dropped, so no story appears twice.
  const countryParams = { country: article?.country, limit: 4 };
  const { data: countryData } = useListArticles(countryParams, {
    query: {
      queryKey: getListArticlesQueryKey(countryParams),
      enabled: !!article?.country,
    },
  });
  const categoryParams = { category: article?.category, limit: 8 };
  const { data: categoryData } = useListArticles(categoryParams, {
    query: {
      queryKey: getListArticlesQueryKey(categoryParams),
      enabled: !!article?.category,
    },
  });
  const t = useTranslate(article);
  const { toast } = useToast();

  // The title and description are the publisher's original text, whichever
  // language the reader has switched the page to.
  usePageMeta({
    title: article ? `${article.title} | AfricaNews` : undefined,
    description: article?.summary ? truncateToWord(article.summary.replace(/\s+/g, " ").trim(), 160) : undefined,
    noindex: !isLoading && (!!error || !article),
  });

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
        <div className="an-article-header an-article-header--loading">
          <div className="an-skeleton an-article-skeleton an-article-skeleton--tags" />
          <div className="an-skeleton an-article-skeleton an-article-skeleton--title" />
          <div className="an-skeleton an-article-skeleton an-article-skeleton--title-short" />
          <div className="an-skeleton an-article-skeleton an-article-skeleton--button" />
          <div className="an-skeleton an-article-skeleton" />
          <div className="an-skeleton an-article-skeleton an-article-skeleton--short" />
        </div>
      </AppLayout>
    );
  }

  if (error || !article) {
    return (
      <AppLayout>
        <div className="an-article-missing">
          <Inbox size={40} strokeWidth={1.5} aria-hidden="true" />
          <h1>Article Not Found</h1>
          <p>We couldn't find the article you were looking for.</p>
          <Link href="/" className="an-article-missing-link">Return to Home</Link>
        </div>
      </AppLayout>
    );
  }

  const fromCountry = countryData?.articles.filter((a) => a.id !== article.id).slice(0, 3) ?? [];
  const shown = new Set([article.id, ...fromCountry.map((a) => a.id)]);
  const fromCategory = categoryData?.articles.filter((a) => !shown.has(a.id)).slice(0, 3) ?? [];

  return (
    <AppLayout>
      <article className="an-article">

        {/* The page is a card for one story that lives at the publisher. The
            way there, "Read at {source}", sits directly under the headline:
            summaries run to 2,000 characters, so anything placed after one
            can be pushed off a phone screen. */}
        <header className="an-article-header">
          <button
            type="button"
            className="an-article-back-btn"
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
          >
            <ArrowLeft size={15} aria-hidden="true" /> Back
          </button>

          <div className="an-article-tags">
            <Link href={categoryHref(article.category)} className="an-article-tag-link">
              <CatTag category={article.category} />
            </Link>
            <Link href={countryHref(article.country)} className="an-article-country">
              {article.country}
            </Link>
            <TranslateChip t={t} />
          </div>

          <h1 lang={t.lang} dir="auto" className="an-article-title">{t.title}</h1>

          <p className="an-article-source">
            <Link href={sourceHref(article.sourceId)} className="an-source-link an-article-source-name">
              {article.sourceName}
            </Link>
            <span className="an-article-meta">
              {article.author && <>By {article.author} · </>}
              <time dateTime={article.publishedDate}>{format(new Date(article.publishedDate), "d MMMM yyyy")}</time>
            </span>
          </p>

          <div className="an-article-actions">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="an-article-read">
              Read at {article.sourceName} <ExternalLink size={16} aria-hidden="true" />
            </a>
            <button type="button" onClick={shareArticle} className="an-article-share">
              <Share2 size={15} aria-hidden="true" /> Share
            </button>
          </div>

          {t.summary && (
            <p lang={t.lang} dir="auto" className="an-article-summary">{t.summary}</p>
          )}
        </header>

        <ArticleHero key={article.id} article={article} />
      </article>

      {(fromCountry.length > 0 || fromCategory.length > 0) && (
        <section className="an-related" aria-label="More stories">
          <div className="an-container">
            {fromCountry.length > 0 && (
              <div className="an-related-block">
                <div className="an-related-head">
                  <h2>More from {article.country}</h2>
                  <Link href={countryHref(article.country)}>All {article.country} news</Link>
                </div>
                <div className="an-story-list">
                  {fromCountry.map((related) => (
                    <ArticleCard key={related.id} article={related} isRead={isRead(related.id)} />
                  ))}
                </div>
              </div>
            )}
            {fromCategory.length > 0 && (
              <div className="an-related-block">
                <div className="an-related-head">
                  <h2>More in {article.category}</h2>
                  <Link href={categoryHref(article.category)}>All {article.category} news</Link>
                </div>
                <div className="an-story-list">
                  {fromCategory.map((related) => (
                    <ArticleCard key={related.id} article={related} isRead={isRead(related.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </AppLayout>
  );
}
