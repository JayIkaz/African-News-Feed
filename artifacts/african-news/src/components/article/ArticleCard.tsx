import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Clock, MapPin } from "lucide-react";
import { Article } from "@workspace/api-client-react";
import { getArticleImage } from "@/lib/unsplash";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  compact?: boolean;
}

export function ArticleCard({ article, featured = false, compact = false }: ArticleCardProps) {
  const imageUrl = getArticleImage(article);
  const dateStr = article.publishedDate ? formatDistanceToNow(new Date(article.publishedDate), { addSuffix: true }) : '';

  if (compact) {
    return (
      <Link href={`/article/${article.id}`} className="group flex gap-4 py-4 border-b border-border last:border-0 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-accent">{article.category}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" /> {dateStr}</span>
          </div>
          <h3 className="font-serif font-bold text-base leading-snug group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-2 font-medium">{article.sourceName}</p>
        </div>
        <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-secondary">
          <img src={imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
      </Link>
    );
  }

  if (featured) {
    return (
      <Link href={`/article/${article.id}`} className="group block relative overflow-hidden rounded-xl bg-secondary h-full min-h-[400px]">
        <img src={imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-accent text-white text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
              {article.category}
            </span>
            <span className="text-sm text-white/80 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {article.country}
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl md:text-4xl leading-tight mb-3 group-hover:text-accent-foreground transition-colors">
            {article.title}
          </h2>
          <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 font-article">
            {article.summary}
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-white/70">
            <span>{article.sourceName}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {dateStr}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.id}`} className="group flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border/50 hover-lift">
      <div className="aspect-[16/9] relative overflow-hidden bg-secondary">
        <img src={imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute top-3 left-3">
          <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm">
            {article.category}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 font-medium">
          <span className="flex items-center gap-1 text-primary"><MapPin className="w-3 h-3" /> {article.country}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {dateStr}</span>
        </div>
        <h3 className="font-serif font-bold text-xl leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
          {article.summary}
        </p>
        <div className="pt-4 border-t border-border mt-auto flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wide text-foreground/70">{article.sourceName}</span>
          {article.aiSummary && (
            <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">AI Summarized</span>
          )}
        </div>
      </div>
    </Link>
  );
}
