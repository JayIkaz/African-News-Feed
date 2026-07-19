import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable, sourcesTable } from "@workspace/db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { articleSelection, buildArticleResponse } from "../lib/articleSelect";
import { isTranslateConfigured, translateToEnglish } from "../lib/translate";
import { translateRateLimit } from "../middlewares/rateLimit";

const router: IRouter = Router();

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
        .select(articleSelection)
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
      articles: rows.map(buildArticleResponse),
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
      .select(articleSelection)
      .from(articlesTable)
      .leftJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id))
      .orderBy(desc(articlesTable.publishedDate))
      .limit(limitNum);

    res.json({
      articles: rows.map(buildArticleResponse),
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
      .select(articleSelection)
      .from(articlesTable)
      .leftJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id))
      .orderBy(desc(articlesTable.publishedDate))
      .limit(limitNum);

    res.json({
      articles: rows.map(buildArticleResponse),
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

router.post("/:id/translate", translateRateLimit, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "bad_request", message: "Invalid article ID" });
      return;
    }

    const rows = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
    const article = rows[0];
    if (!article) {
      res.status(404).json({ error: "not_found", message: "Article not found" });
      return;
    }

    if (article.language === "en") {
      res.status(400).json({ error: "bad_request", message: "Article is already in English" });
      return;
    }

    // Cached from a previous request — no API call needed.
    if (article.titleEn && article.summaryEn) {
      res.json({ id: article.id, language: article.language, titleEn: article.titleEn, summaryEn: article.summaryEn });
      return;
    }

    if (!isTranslateConfigured()) {
      res.status(503).json({ error: "translate_unavailable", message: "Translation service is not configured" });
      return;
    }

    const [titleEn, summaryEn] = await translateToEnglish([article.title, article.summary], article.language);

    await db.update(articlesTable).set({ titleEn, summaryEn }).where(eq(articlesTable.id, id));

    res.json({ id: article.id, language: article.language, titleEn, summaryEn });
  } catch (err) {
    console.error("Error translating article:", err);
    res.status(503).json({ error: "translate_unavailable", message: "Translation failed, try again later" });
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
      .select(articleSelection)
      .from(articlesTable)
      .leftJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id))
      .where(eq(articlesTable.id, id))
      .limit(1);

    if (!rows[0]) {
      res.status(404).json({ error: "not_found", message: "Article not found" });
      return;
    }

    res.json(buildArticleResponse(rows[0]));
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch article" });
  }
});

export default router;
