import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable, sourcesTable } from "@workspace/db/schema";
import { eq, desc, like, or, count, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { q, page = "1", limit = "20" } = req.query as Record<string, string>;
    if (!q || q.trim().length === 0) {
      res.status(400).json({ error: "bad_request", message: "Search query 'q' is required" });
      return;
    }

    const query = `%${q.trim()}%`;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    const searchCondition = or(
      like(articlesTable.title, query),
      like(articlesTable.summary, query),
      like(articlesTable.country, query),
      like(articlesTable.category, query)
    );

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
        .where(searchCondition)
        .orderBy(desc(articlesTable.publishedDate))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() }).from(articlesTable).where(searchCondition),
    ]);

    const total = totalRows[0]?.count ?? 0;

    res.json({
      articles: rows.map((r) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        author: r.author ?? null,
        sourceId: r.sourceId,
        sourceName: r.sourceName ?? "",
        country: r.country,
        category: r.category,
        publishedDate: r.publishedDate.toISOString(),
        url: r.url,
        createdAt: r.createdAt.toISOString(),
        aiSummary: r.aiSummary ?? null,
      })),
      total,
      page: pageNum,
      limit: limitNum,
      hasMore: offset + limitNum < total,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "internal_error", message: "Search failed" });
  }
});

export default router;
