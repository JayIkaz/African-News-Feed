import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sourcesTable, articlesTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: sourcesTable.id,
        name: sourcesTable.name,
        country: sourcesTable.country,
        homepage: sourcesTable.homepage,
        rssUrl: sourcesTable.rssUrl,
        isActive: sourcesTable.isActive,
        articleCount: count(articlesTable.id),
      })
      .from(sourcesTable)
      .leftJoin(articlesTable, eq(sourcesTable.id, articlesTable.sourceId))
      .groupBy(sourcesTable.id)
      .orderBy(sourcesTable.country);

    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      homepage: r.homepage,
      rssUrl: r.rssUrl ?? null,
      isActive: r.isActive,
      articleCount: r.articleCount,
    })));
  } catch (err) {
    console.error("Error fetching sources:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch sources" });
  }
});

export default router;
