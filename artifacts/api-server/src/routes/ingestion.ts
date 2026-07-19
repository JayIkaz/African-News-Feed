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

    // Awaited, not fire-and-forget: Vercel serverless functions stop executing
    // once the response is sent, so background work silently no-ops there. The
    // primary ingestion path is the hourly GitHub Actions cron (a real
    // process); this endpoint is just the on-demand admin convenience path.
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

router.post("/backfill-images", adminTriggerRateLimit, requireAdmin, async (_req, res) => {
  try {
    await backfillImages();
    res.json({ message: "Image backfill complete" });
  } catch (err) {
    console.error("[backfill-images] Error running backfill:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to run image backfill" });
  }
});

export default router;
