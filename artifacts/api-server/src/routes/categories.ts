import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db/schema";
import { count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select({
        category: articlesTable.category,
        articleCount: count(articlesTable.id),
      })
      .from(articlesTable)
      .groupBy(articlesTable.category)
      .orderBy(sql`count(${articlesTable.id}) desc`);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch categories" });
  }
});

export default router;
