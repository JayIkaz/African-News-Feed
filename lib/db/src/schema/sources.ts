import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sourcesTable = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  homepage: text("homepage").notNull(),
  rssUrl: text("rss_url"),
  isActive: boolean("is_active").notNull().default(true),
  lastFetched: timestamp("last_fetched"),
  articlesFetched: integer("articles_fetched").notNull().default(0),
  fetchStatus: text("fetch_status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSourceSchema = createInsertSchema(sourcesTable).omit({ id: true, createdAt: true });
export type InsertSource = z.infer<typeof insertSourceSchema>;
export type Source = typeof sourcesTable.$inferSelect;
