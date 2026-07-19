import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sourcesTable } from "./sources";

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  author: text("author"),
  sourceId: integer("source_id").notNull().references(() => sourcesTable.id),
  country: text("country").notNull(),
  category: text("category").notNull().default("General"),
  publishedDate: timestamp("published_date").notNull(),
  url: text("url").notNull().unique(),
  imageUrl: text("image_url"),
  aiSummary: text("ai_summary"),
  // ISO 639-1 code detected at ingestion ("en", "fr", "pt", "ar"); "en" means
  // no translation offered.
  language: text("language").notNull().default("en"),
  // Cached English translation, filled on first translate request.
  titleEn: text("title_en"),
  summaryEn: text("summary_en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  countryIdx: index("articles_country_idx").on(table.country),
  categoryIdx: index("articles_category_idx").on(table.category),
  sourceIdx: index("articles_source_idx").on(table.sourceId),
  publishedIdx: index("articles_published_idx").on(table.publishedDate),
}));

export const insertArticleSchema = createInsertSchema(articlesTable).omit({ id: true, createdAt: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;
