// One-off: detect and store the language of existing articles (new ones get
// it at ingestion). Only writes rows that aren't English, since the column
// defaults to 'en'. Run: DATABASE_URL=... pnpm --filter @workspace/api-server exec tsx src/backfill-language.ts
import { db, pool } from "@workspace/db";
import { articlesTable } from "@workspace/db/schema";
import { sql, inArray, gt, asc } from "drizzle-orm";
import { detectLanguage, type DetectedLanguage } from "./lib/detectLanguage";

async function main() {
  let lastId = 0;
  let scanned = 0;
  const counts: Record<string, number> = {};

  for (;;) {
    const rows = await db
      .select({ id: articlesTable.id, title: articlesTable.title, summary: articlesTable.summary })
      .from(articlesTable)
      .where(gt(articlesTable.id, lastId))
      .orderBy(asc(articlesTable.id))
      .limit(2000);
    if (rows.length === 0) break;
    lastId = rows[rows.length - 1]!.id;
    scanned += rows.length;

    const byLang = new Map<DetectedLanguage, number[]>();
    for (const row of rows) {
      const lang = detectLanguage(`${row.title} ${row.summary}`);
      counts[lang] = (counts[lang] ?? 0) + 1;
      if (lang !== "en") {
        const ids = byLang.get(lang) ?? [];
        ids.push(row.id);
        byLang.set(lang, ids);
      }
    }

    for (const [lang, ids] of byLang) {
      await db.update(articlesTable).set({ language: lang }).where(inArray(articlesTable.id, ids));
    }
    console.log(`scanned ${scanned} (through id ${lastId})...`);
  }

  console.log("done:", JSON.stringify(counts));
  const verify = await db.execute(sql`select language, count(*)::int n from articles group by 1 order by 2 desc`);
  console.log("db now:", JSON.stringify(verify.rows));
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
