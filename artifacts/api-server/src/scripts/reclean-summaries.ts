// One-off: re-run cleanSummary over every stored article summary and persist
// the result where it differs. Articles whose summary changed also get their
// cached summary_en cleared so the next translate request re-translates the
// clean text.
//
// Run with the pooler connection string (DATABASE_URL is what @workspace/db
// reads):
//   DATABASE_URL=$SUPABASE_POOLER_URL pnpm --filter @workspace/api-server exec tsx src/scripts/reclean-summaries.ts
//
// Pass --dry-run to report what would change without writing.

import { db, pool } from "@workspace/db";
import { articlesTable, sourcesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { cleanSummary } from "../lib/cleanSummary";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const rows = await db
    .select({
      id: articlesTable.id,
      summary: articlesTable.summary,
      sourceName: sourcesTable.name,
    })
    .from(articlesTable)
    .innerJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id));

  console.log(`Loaded ${rows.length} articles${dryRun ? " (dry run)" : ""}`);

  let changed = 0;
  for (const row of rows) {
    const cleaned = cleanSummary(row.summary, row.sourceName).slice(0, 2000);
    if (cleaned === row.summary) continue;

    changed++;
    if (changed <= 20) {
      console.log(`#${row.id}: ${JSON.stringify(row.summary.slice(0, 80))}`);
      console.log(`   -> ${JSON.stringify(cleaned.slice(0, 80))}`);
    }

    if (!dryRun) {
      await db
        .update(articlesTable)
        .set({ summary: cleaned, summaryEn: null })
        .where(eq(articlesTable.id, row.id));
    }
  }

  console.log(`${changed} of ${rows.length} summaries ${dryRun ? "would change" : "updated (summary_en cleared for each)"}`);
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
