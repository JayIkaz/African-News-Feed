import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable, sourcesTable } from "@workspace/db/schema";
import { eq, desc, like, or, count, and, sql } from "drizzle-orm";

const router: IRouter = Router();

function buildArticleResponse(article: typeof articlesTable.$inferSelect & { sourceName?: string }) {
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
    createdAt: article.createdAt.toISOString(),
    aiSummary: article.aiSummary ?? null,
  };
}

router.get("/", async (req, res) => {
  try {
    const { country, category, sourceId, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (country) conditions.push(eq(articlesTable.country, country));
    if (category) conditions.push(eq(articlesTable.category, category));
    if (sourceId) conditions.push(eq(articlesTable.sourceId, parseInt(sourceId)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalRows] = await Promise.all([
      db
        .select({
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
          createdAt: articlesTable.createdAt,
          aiSummary: articlesTable.aiSummary,
        })
        .from(articlesTable)
        .leftJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id))
        .where(where)
        .orderBy(desc(articlesTable.publishedDate))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() }).from(articlesTable).where(where),
    ]);

    const total = totalRows[0]?.count ?? 0;

    res.json({
      articles: rows.map((r) => buildArticleResponse({ ...r, sourceName: r.sourceName ?? "" })),
      total,
      page: pageNum,
      limit: limitNum,
      hasMore: offset + limitNum < total,
    });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch articles" });
  }
});

router.get("/trending", async (req, res) => {
  try {
    const { limit = "10" } = req.query as Record<string, string>;
    const limitNum = Math.min(50, parseInt(limit) || 10);

    const rows = await db
      .select({
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
        createdAt: articlesTable.createdAt,
        aiSummary: articlesTable.aiSummary,
      })
      .from(articlesTable)
      .leftJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id))
      .orderBy(desc(articlesTable.publishedDate))
      .limit(limitNum);

    res.json({
      articles: rows.map((r) => buildArticleResponse({ ...r, sourceName: r.sourceName ?? "" })),
      total: rows.length,
      page: 1,
      limit: limitNum,
      hasMore: false,
    });
  } catch (err) {
    console.error("Error fetching trending articles:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch trending articles" });
  }
});

router.get("/top-stories", async (req, res) => {
  try {
    const { limit = "6" } = req.query as Record<string, string>;
    const limitNum = Math.min(20, parseInt(limit) || 6);

    const rows = await db
      .select({
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
        createdAt: articlesTable.createdAt,
        aiSummary: articlesTable.aiSummary,
      })
      .from(articlesTable)
      .leftJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id))
      .orderBy(desc(articlesTable.publishedDate))
      .limit(limitNum);

    res.json({
      articles: rows.map((r) => buildArticleResponse({ ...r, sourceName: r.sourceName ?? "" })),
      total: rows.length,
      page: 1,
      limit: limitNum,
      hasMore: false,
    });
  } catch (err) {
    console.error("Error fetching top stories:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch top stories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "bad_request", message: "Invalid article ID" });
      return;
    }

    const rows = await db
      .select({
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
        createdAt: articlesTable.createdAt,
        aiSummary: articlesTable.aiSummary,
      })
      .from(articlesTable)
      .leftJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id))
      .where(eq(articlesTable.id, id))
      .limit(1);

    if (!rows[0]) {
      res.status(404).json({ error: "not_found", message: "Article not found" });
      return;
    }

    res.json(buildArticleResponse({ ...rows[0], sourceName: rows[0].sourceName ?? "" }));
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch article" });
  }
});

export default router;
