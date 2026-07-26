import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";
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
