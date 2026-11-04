// Standalone ingestion entrypoint, run by the scheduled GitHub Actions job
// (.github/workflows/ingest.yml) or manually via `pnpm run ingest`. Replaces
// the old in-process 60-minute setInterval scheduler. The workflow asks for a
// run every hour, but GitHub starts scheduled runs when it has capacity: between
// 15 October and 4 November 2026 it ran 100 times, a median of 4.9 hours apart.
import { db, pool } from "@workspace/db";
import { sourcesTable } from "@workspace/db/schema";
import { desc, eq, isNotNull } from "drizzle-orm";
import { seedSourcesIfEmpty } from "./lib/seeds";
import { ingestAllSources } from "./lib/ingestion";
import { parseMinInterval, shouldSkipRun } from "./lib/ingestGuard";

async function main() {
  await seedSourcesIfEmpty();

  // Scheduled runs set INGEST_MIN_INTERVAL_MINUTES so that extra triggers cannot
  // over-fetch (see lib/ingestGuard.ts). Unset, or 0, every run goes ahead.
  const minInterval = parseMinInterval(process.env.INGEST_MIN_INTERVAL_MINUTES);
  if (minInterval > 0) {
    const [newest] = await db
      .select({ lastFetched: sourcesTable.lastFetched })
      .from(sourcesTable)
      .where(isNotNull(sourcesTable.lastFetched))
      .orderBy(desc(sourcesTable.lastFetched))
      .limit(1);
    const lastFetched = newest?.lastFetched ?? null;
    const now = new Date();
    if (lastFetched && shouldSkipRun(lastFetched, now, minInterval)) {
      console.log(
        `[ingest] Skipping: publishers were last fetched at ${lastFetched.toISOString()}, ` +
          `less than ${minInterval} minutes before ${now.toISOString()}`,
      );
      return;
    }
  }

  const sources = await db.select().from(sourcesTable).where(eq(sourcesTable.isActive, true));
  console.log(`[ingest] Ingesting ${sources.length} active sources...`);
  await ingestAllSources(sources);
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error("[ingest] Fatal error:", err);
    process.exit(1);
  });
