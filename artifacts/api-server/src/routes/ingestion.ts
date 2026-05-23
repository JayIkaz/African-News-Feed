import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sourcesTable, articlesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { ingestAllSources } from "../lib/ingestion";
import { backfillImages } from "../lib/backfillImages";

const router: IRouter = Router();

router.post("/trigger", async (_req, res) => {
  try {
    const sources = await db.select().from(sourcesTable).where(eq(sourcesTable.isActive, true));
    
    ingestAllSources(sources).catch((err) => {
      console.error("Background ingestion error:", err);
    });

    res.json({
      message: "Ingestion triggered for all active sources",
      sourcesTriggered: sources.length,
    });
  } catch (err) {
    console.error("Error triggering ingestion:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to trigger ingestion" });
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

router.post("/backfill-images", async (_req, res) => {
  try {
    res.json({ message: "Image backfill started in background. Check server logs for progress." });

    backfillImages().catch((err) => {
      console.error("[backfill-images] Fatal error:", err);
    });
  } catch (err) {
    console.error("[backfill-images] Error starting backfill:", err);
    res.status(500).json({ error: "internal_error", message: "Failed to start image backfill" });
  }
});

export default router;
