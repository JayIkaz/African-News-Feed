import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable, sourcesTable } from "@workspace/db/schema";
import { eq, count, countDistinct, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select({
        country: articlesTable.country,
        articleCount: count(articlesTable.id),
        sources: countDistinct(articlesTable.sourceId),
      })
      .from(articlesTable)
      .groupBy(articlesTable.country)
      .orderBy(sql`count(${articlesTable.id}) desc`);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching countries:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch countries" });
  }
});

export default router;
