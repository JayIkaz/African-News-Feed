import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable, sourcesTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { articleSelection, buildArticleResponse } from "../lib/articleSelect";

const router: IRouter = Router();

const SITE_URL = "https://www.africannewsfeed.news";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

router.get("/", async (_req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const entries: string[] = [];

    // Static pages
    entries.push(urlEntry(`${SITE_URL}/`, today, "hourly", "1.0"));
    entries.push(urlEntry(`${SITE_URL}/countries`, today, "weekly", "0.5"));
    entries.push(urlEntry(`${SITE_URL}/advertise`, today, "monthly", "0.3"));
    entries.push(urlEntry(`${SITE_URL}/api-access`, today, "monthly", "0.3"));

    // Categories — same query pattern as routes/categories.ts
    const categoryRows = await db
      .select({ category: articlesTable.category })
      .from(articlesTable)
      .groupBy(articlesTable.category);

    for (const row of categoryRows) {
      if (!row.category) continue;
      entries.push(
        urlEntry(`${SITE_URL}/category/${encodeURIComponent(row.category)}`, today, "hourly", "0.8")
      );
    }

    // Countries — same query pattern as routes/countries.ts
    const countryRows = await db
      .select({ country: articlesTable.country })
      .from(articlesTable)
      .groupBy(articlesTable.country);

    for (const row of countryRows) {
      if (!row.country) continue;
      entries.push(
        urlEntry(`${SITE_URL}/country/${encodeURIComponent(row.country)}`, today, "hourly", "0.8")
      );
    }

    // Articles — paginated the same way routes/articles.ts does it
    const limit = 100;
    let offset = 0;
    let fetched = 0;
    const maxArticles = 5000; // safety cap; raise if the archive grows past this

    while (fetched < maxArticles) {
      const rows = await db
        .select(articleSelection)
        .from(articlesTable)
        .leftJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id))
        .orderBy(desc(articlesTable.publishedDate))
        .limit(limit)
        .offset(offset);

      if (rows.length === 0) break;

      for (const row of rows) {
        const article = buildArticleResponse(row);
        const lastmod = new Date(article.publishedDate).toISOString().split("T")[0];
        entries.push(
          urlEntry(`${SITE_URL}/article/${article.id}`, lastmod, "never", "0.6")
        );
      }

      fetched += rows.length;
      offset += limit;
      if (rows.length < limit) break;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=1800");
    res.status(200).send(xml);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
