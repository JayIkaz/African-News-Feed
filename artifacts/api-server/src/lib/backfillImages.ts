import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db/schema";
import { isNull, asc, eq } from "drizzle-orm";

const BATCH_SIZE = 50;

// TEMPORARY DIAGNOSTIC VERSION — logs why each fetch fails instead of
// silently swallowing the error. Revert to the silent version once the
// mass-failure cause is identified.
async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AfricaNews-Aggregator/1.0",
        Accept: "text/html",
      },
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      console.log(`[backfill-diagnostic] ${articleUrl} -> HTTP ${resp.status}`);
      return null;
    }
    const html = await resp.text();
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    const url = match?.[1];
    if (url && url.startsWith("http")) return url;
    console.log(
      `[backfill-diagnostic] ${articleUrl} -> HTTP ${resp.status}, no og:image/twitter:image match found (html length ${html.length})`,
    );
    return null;
  } catch (err) {
    const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.log(`[backfill-diagnostic] ${articleUrl} -> threw: ${reason}`);
    return null;
  }
}

export interface BackfillResult {
  total: number;
  found: number;
  notFound: number;
  errors: number;
  remaining: number;
}

export async function backfillImages(
  onProgress?: (msg: string) => void,
  maxArticles?: number,
): Promise<BackfillResult> {
  const log = (msg: string) => {
    console.log(`[backfill-images] ${msg}`);
    onProgress?.(msg);
  };

  const totalMissingQuery = db
    .select({ id: articlesTable.id })
    .from(articlesTable)
    .where(isNull(articlesTable.imageUrl));
  const totalMissing = (await totalMissingQuery).length;

  const query = db
    .select({ id: articlesTable.id, url: articlesTable.url })
    .from(articlesTable)
    .where(isNull(articlesTable.imageUrl))
    .orderBy(asc(articlesTable.id));

  const allArticles = maxArticles ? await query.limit(maxArticles) : await query;

  const total = allArticles.length;
  log(
    `Found ${totalMissing} articles with no image total — processing ${total} this run (batches of ${BATCH_SIZE})`,
  );

  let found = 0;
  let notFound = 0;
  let errors = 0;
  let processed = 0;

  for (let i = 0; i < allArticles.length; i += BATCH_SIZE) {
    const batch = allArticles.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(async (article) => {
        try {
          const imageUrl = await fetchOgImage(article.url);
          if (imageUrl) {
            await db
              .update(articlesTable)
              .set({ imageUrl: imageUrl.slice(0, 2000) })
              .where(eq(articlesTable.id, article.id));
            found++;
          } else {
            notFound++;
          }
        } catch {
          errors++;
        }
        processed++;
      }),
    );
    log(
      `Progress: ${processed}/${total} processed — found ${found}, not found ${notFound}, errors ${errors}`,
    );
  }

  const remaining = totalMissing - processed;
  log(
    `Backfill run complete — ${total} articles processed, ${found} images found, ${notFound} without image, ${errors} errors, ${remaining} still remaining`,
  );

  return { total, found, notFound, errors, remaining };
}
