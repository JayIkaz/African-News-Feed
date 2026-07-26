import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db/schema";
import { isNull, asc, eq } from "drizzle-orm";

const BATCH_SIZE = 50;

// Several publishers (WordPress hosts, Nation Media Group, Arc-based sites)
// serve 403s to obvious bot user agents but accept a normal browser UA —
// same reasoning as FETCH_HEADERS in ingestion.ts. This function previously
// sent a self-identifying "AfricaNews-Aggregator/1.0" UA, which is exactly
// the kind of string that trips bot detection on these publishers.
const OG_FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(articleUrl, {
      signal: controller.signal,
      headers: OG_FETCH_HEADERS,
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const html = await resp.text();
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    const url = match?.[1];
    if (url && url.startsWith("http")) return url;
    return null;
  } catch {
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
