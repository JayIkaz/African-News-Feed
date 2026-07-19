// Standalone ingestion entrypoint, run by the hourly GitHub Actions cron
// (.github/workflows/ingest.yml) or manually via `pnpm run ingest`. Replaces
// the old in-process 60-minute setInterval scheduler.
import { db, pool } from "@workspace/db";
import { sourcesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { seedSourcesIfEmpty } from "./lib/seeds";
import { ingestAllSources } from "./lib/ingestion";

async function main() {
  await seedSourcesIfEmpty();
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
