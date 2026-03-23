import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { Clock, MapPin, Share2, BookmarkPlus, ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { useGetArticle, useListArticles } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getArticleImage } from "@/lib/unsplash";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/article/ArticleCard";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const articleId = parseInt(id || "0", 10);

  const { data: article, isLoading, error } = useGetArticle(articleId, {
    query: { enabled: !isNaN(articleId) && articleId > 0 }
  });

  // Fetch related articles from same category
  const { data: relatedData } = useListArticles(
    { category: article?.category, limit: 3 },
    { query: { enabled: !!article?.category } }
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl mb-10" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !article) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find the article you were looking for.</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const imageUrl = getArticleImage(article);
  const relatedArticles = relatedData?.articles.filter(a => a.id !== article.id).slice(0, 3) || [];

  return (
    <AppLayout>
      <article className="bg-background pb-16">
        {/* Editorial Header */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/category/${article.category}`}>
              <span className="bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm cursor-pointer">
                {article.category}
              </span>
            </Link>
            <Link href={`/country/${article.country}`}>
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <MapPin className="w-3.5 h-3.5" /> {article.country}
              </span>
            </Link>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight md:leading-[1.1] mb-6 tracking-tight">
            {article.title}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground font-article mb-8 leading-relaxed">
            {article.summary}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-y border-border gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-muted-foreground font-serif font-bold text-xl border border-border">
                {article.sourceName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm uppercase tracking-wide">{article.sourceName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {article.author && <span>By {article.author}</span>}
                  {article.author && <span>•</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 
                    {format(new Date(article.publishedDate), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <BookmarkPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden bg-secondary shadow-lg">
            <img src={imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-right text-muted-foreground mt-2 italic">Image representation for {article.category}</p>
        </div>

        {/* Content Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* AI Summary Box */}
          {article.aiSummary && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 md:p-8 mb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="font-serif font-bold text-lg text-primary">AI Quick Summary</h3>
              </div>
              <p className="text-foreground/80 font-article leading-relaxed relative z-10">
                {article.aiSummary}
              </p>
            </div>
          )}

          <div className="article-content space-y-6">
            {/* Since the API doesn't provide full body text in this simplified schema, 
                we display the summary and prompt to read the full source. */}
            <p className="first-letter:text-7xl first-letter:font-serif first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
              {article.summary}
            </p>
            
            <p>
              This story was originally published by <strong>{article.sourceName}</strong> on {format(new Date(article.publishedDate), 'MMM d, yyyy')}. 
              The aggregation system has categorized it under {article.category} relevant to {article.country}.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex justify-center">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary hover:bg-accent transition-colors rounded-full shadow-md hover:-translate-y-1 duration-200 gap-2"
            >
              Read full article on {article.sourceName} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </article>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="bg-secondary/30 py-16 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary inline-block rounded-sm"></span>
              More in {article.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(related => (
                <ArticleCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
