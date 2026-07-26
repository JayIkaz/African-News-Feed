import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sourcesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { ingestAllSources } from "../lib/ingestion";
import { backfillImages } from "../lib/backfillImages";
import { requireAdmin } from "../middlewares/requireAdmin";
import { adminTriggerRateLimit } from "../middlewares/rateLimit";

const router: IRouter = Router();

router.post("/trigger", adminTriggerRateLimit, requireAdmin, async (_req, res) => {
  try {
    const sources = await db.select().from(sourcesTable).where(eq(sourcesTable.isActive, true));
    await ingestAllSources(sources);
    res.json({
      message: "Ingestion complete",
      sourcesProcessed: sources.length,
    });
  } catch (err) {
    console.error("Error running ingestion:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to run ingestion" });
  }
});

router.get("/status", async (_req, res) => {
  try {
    const sources = await db.select().from(sourcesTable).orderBy(sourcesTable.country);
    res.json(sources.map((s) => ({
      sourceId: s.id,
      sourceName: s.name,
      country: s.country,
      lastFetched: s.lastFetched?.toISOString() ?? null,
      articlesFetched: s.articlesFetched,
      status: s.fetchStatus,
    })));
  } catch (err) {
    console.error("Error fetching ingestion status:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to fetch ingestion status" });
  }
});

router.post("/backfill-images", adminTriggerRateLimit, requireAdmin, async (req, res) => {
  try {
    const { limit } = req.query as Record<string, string>;
    // Default to 150 per call: comfortably finishes well inside the 60s
    // serverless timeout even with slow-responding sources. Pass a higher
    // ?limit= for local/CI runs that aren't time-boxed, or omit maxArticles
    // entirely to process everything in one go.
    const maxArticles = limit ? parseInt(limit, 10) : 150;
    const result = await backfillImages(undefined, maxArticles);
    res.json({ message: "Image backfill run complete", ...result });
  } catch (err) {
    console.error("[backfill-images] Error running backfill:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to run image backfill" });
  }
});

export default router;
