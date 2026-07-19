import { articlesTable, sourcesTable } from "@workspace/db/schema";

// Shared column selection for article list/detail queries (joined with sources).
export const articleSelection = {
  id: articlesTable.id,
  title: articlesTable.title,
  summary: articlesTable.summary,
  author: articlesTable.author,
  sourceId: articlesTable.sourceId,
  sourceName: sourcesTable.name,
  country: articlesTable.country,
  category: articlesTable.category,
  publishedDate: articlesTable.publishedDate,
  url: articlesTable.url,
  imageUrl: articlesTable.imageUrl,
  createdAt: articlesTable.createdAt,
  aiSummary: articlesTable.aiSummary,
  language: articlesTable.language,
  titleEn: articlesTable.titleEn,
  summaryEn: articlesTable.summaryEn,
};

export interface ArticleRow {
  id: number;
  title: string;
  summary: string;
  author: string | null;
  sourceId: number;
  sourceName: string | null;
  country: string;
  category: string;
  publishedDate: Date;
  url: string;
  imageUrl: string | null;
  createdAt: Date;
  aiSummary: string | null;
  language: string;
  titleEn: string | null;
  summaryEn: string | null;
}

export function buildArticleResponse(article: ArticleRow) {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    author: article.author ?? null,
    sourceId: article.sourceId,
    sourceName: article.sourceName ?? "",
    country: article.country,
    category: article.category,
    publishedDate: article.publishedDate.toISOString(),
    url: article.url,
    imageUrl: article.imageUrl ?? null,
    createdAt: article.createdAt.toISOString(),
    aiSummary: article.aiSummary ?? null,
    language: article.language,
    titleEn: article.titleEn ?? null,
    summaryEn: article.summaryEn ?? null,
  };
}
