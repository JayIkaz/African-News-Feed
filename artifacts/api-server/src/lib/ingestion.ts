import { db } from "@workspace/db";
import { sourcesTable, articlesTable, type InsertArticle } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
  author?: string;
  pubDate?: string;
  category?: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Politics: ["election", "parliament", "president", "minister", "government", "political", "vote", "senate", "opposition", "democracy", "policy", "cabinet"],
  Business: ["business", "company", "market", "trade", "economy", "bank", "finance", "investment", "stock", "profit", "revenue", "enterprise", "corporate"],
  Technology: ["technology", "tech", "digital", "internet", "software", "ai", "artificial intelligence", "startup", "innovation", "cyber", "data", "app"],
  Economy: ["gdp", "inflation", "growth", "unemployment", "recession", "budget", "fiscal", "monetary", "tax", "debt", "economic", "poverty"],
  Society: ["health", "education", "culture", "social", "community", "women", "youth", "religion", "sport", "crime", "justice", "humanitarian"],
  Environment: ["climate", "environment", "green", "energy", "drought", "flood", "deforestation", "pollution", "wildlife", "conservation", "renewable"],
  International: ["international", "global", "africa", "world", "foreign", "diplomacy", "un ", "united nations", "sanctions", "conflict", "war", "peace"],
};

function classifyArticle(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  
  let bestCategory = "General";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

async function parseRss(rssUrl: string): Promise<RssItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(rssUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "AfricaNews-Aggregator/1.0" },
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const text = await response.text();
    const items: RssItem[] = [];

    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1];
      
      const decodeHtml = (str: string): string => str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

      const extract = (tag: string): string | undefined => {
        const tagMatch = itemXml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
        return tagMatch?.[1] ? decodeHtml(tagMatch[1].trim().replace(/<[^>]+>/g, "")) || undefined : undefined;
      };

      const linkMatch = itemXml.match(/<link>([^<]+)<\/link>/i) || itemXml.match(/<link[^>]+href="([^"]+)"/i);
      
      items.push({
        title: extract("title"),
        description: extract("description") || extract("content:encoded") || extract("summary"),
        link: linkMatch?.[1]?.trim() || extract("guid"),
        author: extract("author") || extract("dc:creator"),
        pubDate: extract("pubDate") || extract("dc:date") || extract("published"),
        category: extract("category"),
      });
    }

    return items.filter((item) => item.title && item.link);
  } finally {
    clearTimeout(timeout);
  }
}

export async function ingestSource(source: typeof sourcesTable.$inferSelect): Promise<number> {
  if (!source.rssUrl) return 0;

  try {
    await db.update(sourcesTable).set({ fetchStatus: "fetching" }).where(eq(sourcesTable.id, source.id));
    
    const items = await parseRss(source.rssUrl);
    let inserted = 0;

    for (const item of items.slice(0, 50)) {
      if (!item.title || !item.link) continue;

      const title = item.title.slice(0, 500);
      const summary = (item.description || item.title).slice(0, 2000);
      const category = classifyArticle(title, summary);
      
      let publishedDate: Date;
      try {
        publishedDate = item.pubDate ? new Date(item.pubDate) : new Date();
        if (isNaN(publishedDate.getTime())) publishedDate = new Date();
      } catch {
        publishedDate = new Date();
      }

      const article: InsertArticle = {
        title,
        summary,
        author: item.author?.slice(0, 200) || null,
        sourceId: source.id,
        country: source.country,
        category,
        publishedDate,
        url: item.link.slice(0, 1000),
        aiSummary: null,
      };

      try {
        await db
          .insert(articlesTable)
          .values(article)
          .onConflictDoNothing({ target: articlesTable.url });
        inserted++;
      } catch {
        // ignore duplicate/constraint errors
      }
    }

    await db.update(sourcesTable).set({
      fetchStatus: "ok",
      lastFetched: new Date(),
      articlesFetched: sql`${sourcesTable.articlesFetched} + ${inserted}`,
    }).where(eq(sourcesTable.id, source.id));

    console.log(`[ingestion] ${source.name}: inserted ${inserted} articles from ${items.length} items`);
    return inserted;
  } catch (err) {
    console.error(`[ingestion] ${source.name} failed:`, err);
    await db.update(sourcesTable).set({ fetchStatus: "error" }).where(eq(sourcesTable.id, source.id));
    return 0;
  }
}

export async function ingestAllSources(sources: (typeof sourcesTable.$inferSelect)[]): Promise<void> {
  const promises = sources
    .filter((s) => s.isActive && s.rssUrl)
    .map((s) => ingestSource(s));
  
  await Promise.allSettled(promises);
  console.log("[ingestion] All sources processed");
}

export function startScheduledIngestion(intervalMs = 60 * 60 * 1000): void {
  const run = async () => {
    console.log("[ingestion] Scheduled run starting...");
    const sources = await db.select().from(sourcesTable).where(eq(sourcesTable.isActive, true));
    await ingestAllSources(sources);
  };

  run().catch((err) => console.error("[ingestion] Initial run failed:", err));
  setInterval(() => {
    run().catch((err) => console.error("[ingestion] Scheduled run failed:", err));
  }, intervalMs);
  console.log(`[ingestion] Scheduler started — runs every ${intervalMs / 60000} minutes`);
}
