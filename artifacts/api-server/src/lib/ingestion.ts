import { db } from "@workspace/db";
import { sourcesTable, articlesTable, type InsertArticle } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
  author?: string;
  pubDate?: string;
  category?: string;
  imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Category keyword classifier — weighted: title match = 3pts, body = 1pt
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Politics: [
    "election", "elections", "electoral", "parliament", "parliamentary",
    "president", "presidential", "prime minister", "minister", "government",
    "governmental", "political", "politics", "vote", "voting", "voters",
    "senate", "senator", "congress", "opposition", "democracy", "democratic",
    "policy", "policies", "cabinet", "legislation", "legislative", "bill",
    "constitution", "constitutional", "party", "parties", "coup",
    "protest", "demonstrations", "rally", "referendum", "governor",
    "mayor", "commissioner", "lawmaker", "assembly", "judiciary",
    "court ruling", "verdict", "regime", "administration", "governance",
    "ruling party", "sworn in", "inaugurated", "impeach", "resign",
    "speaker", "deputy president", "vice president", "minister of",
    "state house", "state house", "national assembly", "general election",
    "by-election", "polling", "ballot", "manifesto", "campaign",
    "constituency", "member of parliament", "mp ", "mps ", "senator",
    "apc", "pdp", "anc", "zanu", "jubilee party", "odm", "nrm",
  ],
  Business: [
    "business", "company", "companies", "market", "markets", "trade",
    "trading", "bank", "banking", "finance", "financial", "investment",
    "invest", "stock", "profit", "revenue", "enterprise", "corporate",
    "corporation", "industry", "commerce", "commercial", "export",
    "import", "contract", "bid", "tender", "merger", "acquisition",
    "deal", "entrepreneur", "CEO", "executive", "chairman", "board",
    "dividend", "earnings", "quarterly", "annual report", "IPO",
    "shares", "shareholders", "startup", "venture", "fund",
    "billion", "million naira", "million rand", "million dollars",
    "listing", "stock exchange", "NSE", "JSE", "bond", "treasury",
    "retail", "manufacturing", "supply chain", "logistics",
    "real estate", "property", "mortgage", "insurance", "pension",
    "microfinance", "loan", "credit", "debt repayment", "interest rate",
    "CBN", "central bank", "reserve bank", "apex bank",
  ],
  Technology: [
    "technology", "tech", "digital", "internet", "software", "hardware",
    "artificial intelligence", "machine learning", "startup", "innovation",
    "cybersecurity", "cyber attack", "data breach", "app", "mobile app",
    "smartphone", "broadband", "telecom", "telecommunications", "5G",
    "fibre", "fiber optic", "cloud computing", "blockchain",
    "cryptocurrency", "bitcoin", "fintech", "e-commerce", "online",
    "platform", "algorithm", "automation", "robot", "drone", "satellite",
    "IT ", "coding", "developer", "programming", "launch of",
    "MTN", "Safaricom", "Airtel", "Glo", "USSD", "mobile money",
    "M-Pesa", "OPay", "Flutterwave", "Paystack", "tech hub",
    "silicon", "semiconductor", "streaming", "social media",
    "Twitter", "Facebook", "WhatsApp", "TikTok", "YouTube",
    "computer", "laptop", "server", "network", "bandwidth",
  ],
  Economy: [
    "GDP", "inflation", "growth", "unemployment", "recession",
    "budget", "fiscal", "monetary", "tax", "taxes", "taxation",
    "debt", "economic", "poverty", "poverty reduction", "wages",
    "salary", "cost of living", "fuel price", "petroleum", "gas",
    "subsidy", "subsidies", "exchange rate", "currency devaluation",
    "naira", "rand", "shilling", "cedi", "IMF", "World Bank",
    "sustainable development", "agriculture", "farming", "harvest",
    "food security", "food prices", "commodity", "crude oil", "OPEC",
    "trade deficit", "balance of payments", "foreign reserves",
    "interest rate hike", "rate cut", "quantitative easing",
    "austerity", "economic reform", "structural adjustment",
    "minimum wage", "fuel subsidy removal", "deregulation",
    "power sector", "electricity tariff", "energy costs",
    "grain", "rice", "wheat", "export earnings", "remittances",
  ],
  Society: [
    "health", "healthcare", "hospital", "medical", "disease",
    "COVID", "malaria", "HIV", "AIDS", "cancer", "cholera", "ebola",
    "education", "school", "university", "college", "students",
    "teachers", "curriculum", "exam", "WAEC", "culture", "cultural",
    "festival", "community", "women", "gender equality", "feminism",
    "youth", "children", "child", "religion", "church", "mosque",
    "pastor", "bishop", "imam", "sport", "sports", "football",
    "soccer", "basketball", "athletics", "olympics", "world cup",
    "AFCON", "crime", "murder", "robbery", "kidnapping",
    "trafficking", "drug", "drugs", "accident", "road accident",
    "humanitarian", "refugee", "displaced", "water", "sanitation",
    "housing", "eviction", "marriage", "divorce", "assault",
    "rape", "violence", "strike", "labour", "workers", "union",
    "fire", "flood victims", "rescue", "death toll", "missing",
    "obituary", "funeral", "burial", "celebration",
  ],
  Environment: [
    "climate change", "climate", "environment", "environmental",
    "green energy", "solar", "wind power", "hydropower", "renewable",
    "drought", "flood", "flooding", "deforestation", "forest",
    "wildlife", "conservation", "biodiversity", "pollution",
    "air quality", "water pollution", "plastic waste", "mining",
    "oil spill", "emission", "emissions", "carbon", "carbon neutral",
    "sustainable", "national park", "endangered", "extinction",
    "ocean", "sea level", "weather", "temperature", "heatwave",
    "rainfall", "El Nino", "La Nina", "cyclone", "hurricane",
    "desertification", "Sahel", "wetlands", "mangrove", "coral",
    "illegal mining", "galamsey", "poaching", "logging",
    "gas flaring", "oil exploration", "eco-tourism",
  ],
  International: [
    "diplomacy", "diplomatic", "ambassador", "embassy",
    "United Nations", "UN peacekeeping", "African Union", "AU summit",
    "ECOWAS", "SADC", "IGAD", "EAC", "sanctions", "conflict",
    "ceasefire", "peace deal", "peace talks", "peacekeeping",
    "treaty", "summit", "G20", "bilateral", "multilateral",
    "ally", "NATO", "European Union", "China", "United States",
    "Russia", "France", "United Kingdom", "foreign policy",
    "trade war", "geopolitics", "diaspora", "deportation",
    "migration", "asylum", "visa", "border dispute",
    "territorial", "coup in", "instability", "humanitarian crisis",
    "international aid", "foreign aid", "donor", "aid agency",
    "WHO", "UNICEF", "WFP", "UNHCR", "ICC", "war crimes",
    "Sudan conflict", "DRC conflict", "Sahel crisis",
  ],
};

// RSS-provided category strings → our taxonomy (case-insensitive contains check)
const RSS_CATEGORY_MAP: [string, string][] = [
  ["politi", "Politics"],
  ["govern", "Politics"],
  ["elect", "Politics"],
  ["business", "Business"],
  ["finance", "Business"],
  ["econom", "Economy"],
  ["market", "Business"],
  ["tech", "Technology"],
  ["digital", "Technology"],
  ["innovat", "Technology"],
  ["health", "Society"],
  ["sport", "Society"],
  ["education", "Society"],
  ["culture", "Society"],
  ["environment", "Environment"],
  ["climate", "Environment"],
  ["energy", "Environment"],
  ["international", "International"],
  ["world", "International"],
  ["africa", "International"],
  ["global", "International"],
];

function classifyArticle(title: string, summary: string, rssCategory?: string): string {
  let rssCategoryHint = "";
  if (rssCategory) {
    const rssLower = rssCategory.toLowerCase();
    for (const [fragment, cat] of RSS_CATEGORY_MAP) {
      if (rssLower.includes(fragment)) {
        rssCategoryHint = cat;
        break;
      }
    }
  }

  const titleLower = title.toLowerCase();
  const bodyLower = summary.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (titleLower.includes(kw)) score += 3;
      else if (bodyLower.includes(kw)) score += 1;
    }
    if (rssCategoryHint === category) score += 6;
    scores[category] = score;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : "General";
}

// ---------------------------------------------------------------------------
// Summary cleaner
// ---------------------------------------------------------------------------

function cleanSummary(raw: string, sourceTitle?: string): string {
  let text = raw;

  text = text.replace(/<[^>]+>/g, " ");

  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

  text = text.replace(/\s*The post .{0,300}? appeared first on .{0,150}?\.?\s*$/is, "");

  if (sourceTitle) {
    const escaped = sourceTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`\\s*[|\\-–—]\\s*${escaped}\\s*$`, "i"), "");
  }

  text = text.replace(/\s*(Read more|Continue reading|Click here to read|Read full story|See also|View more|Learn more)[^.]*\.?\s*$/i, "");
  text = text.replace(/\s*\[\s*(…|\.{3}|Read More|\+\d+ chars?)\s*\]\s*$/i, "");
  text = text.replace(/\s*\(\s*\.\.\.\s*\)\s*$/i, "");
  text = text.replace(/\s*https?:\/\/\S+\s*$/i, "");
  text = text.replace(/\s{2,}/g, " ").trim();

  return text;
}

// ---------------------------------------------------------------------------
// Image extraction from RSS item XML
// ---------------------------------------------------------------------------

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(url) ||
    url.includes("image") || url.includes("photo") || url.includes("img");
}

function extractImageFromItemXml(itemXml: string): string | null {
  // 1. <media:content url="..." medium="image" ...> or type="image/..."
  // Only accept entries explicitly marked as images (medium or MIME type)
  const mediaContentPatterns = [
    /<media:content[^>]+url="([^"]+)"[^>]*medium="image"[^>]*\/?>/i,
    /<media:content[^>]*medium="image"[^>]*url="([^"]+)"[^>]*\/?>/i,
    /<media:content[^>]+url="([^"]+)"[^>]*type="image\/[^"]*"[^>]*\/?>/i,
    /<media:content[^>]*type="image\/[^"]*"[^>]*url="([^"]+)"[^>]*\/?>/i,
  ];
  for (const pat of mediaContentPatterns) {
    const m = itemXml.match(pat);
    if (m?.[1] && m[1].startsWith("http")) return m[1];
  }

  // Fallback: any media:content with url attribute — but only if URL looks like an image
  const anyMediaContent = itemXml.match(/<media:content\s+url="([^"]+)"[^>]*\/?>/i);
  if (anyMediaContent?.[1] && anyMediaContent[1].startsWith("http") && isImageUrl(anyMediaContent[1])) {
    return anyMediaContent[1];
  }

  // 2. <media:thumbnail url="...">
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url="([^"]+)"[^>]*\/?>/i);
  if (thumbMatch?.[1] && thumbMatch[1].startsWith("http")) return thumbMatch[1];

  // 3. <enclosure url="..." type="image/..."/>
  const enclosurePatterns = [
    /<enclosure[^>]+url="([^"]+)"[^>]+type="image\/[^"]*"[^>]*\/?>/i,
    /<enclosure[^>]+type="image\/[^"]*"[^>]+url="([^"]+)"[^>]*\/?>/i,
  ];
  for (const pat of enclosurePatterns) {
    const m = itemXml.match(pat);
    if (m?.[1] && m[1].startsWith("http")) return m[1];
  }

  // 4. First <img src="..."> inside description or content:encoded (raw HTML before entity decode)
  const rawDescMatch =
    itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1] ||
    itemXml.match(/<content:encoded[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i)?.[1];

  if (rawDescMatch) {
    const imgSrcMatch = rawDescMatch.match(/<img[^>]+src="([^"]+)"[^>]*\/?>/i);
    if (imgSrcMatch?.[1] && imgSrcMatch[1].startsWith("http")) return imgSrcMatch[1];
  }

  return null;
}

// ---------------------------------------------------------------------------
// OG image fallback — lightweight fetch with short timeout
// ---------------------------------------------------------------------------

async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AfricaNews-Aggregator/1.0",
        "Accept": "text/html",
      },
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
    if (url && url.startsWith("http") && isImageUrl(url)) return url;
    if (url && url.startsWith("http")) return url;
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// RSS parser
// ---------------------------------------------------------------------------

async function parseRss(rssUrl: string): Promise<RssItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(rssUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "AfricaNews-Aggregator/1.0" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const items: RssItem[] = [];

    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1];

      const decodeHtml = (str: string): string =>
        str
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/&nbsp;/g, " ")
          .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
          .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

      const extract = (tag: string): string | undefined => {
        const tagMatch = itemXml.match(
          new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i")
        );
        return tagMatch?.[1]
          ? decodeHtml(tagMatch[1].trim().replace(/<[^>]+>/g, "")) || undefined
          : undefined;
      };

      const linkMatch =
        itemXml.match(/<link>([^<]+)<\/link>/i) ||
        itemXml.match(/<link[^>]+href="([^"]+)"/i);

      const imageUrl = extractImageFromItemXml(itemXml);

      items.push({
        title: extract("title"),
        description: extract("description") || extract("content:encoded") || extract("summary"),
        link: linkMatch?.[1]?.trim() || extract("guid"),
        author: extract("author") || extract("dc:creator"),
        pubDate: extract("pubDate") || extract("dc:date") || extract("published"),
        category: extract("category"),
        imageUrl: imageUrl ?? undefined,
      });
    }

    return items.filter((item) => item.title && item.link);
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Ingest a single source
// ---------------------------------------------------------------------------

export async function ingestSource(source: typeof sourcesTable.$inferSelect): Promise<number> {
  if (!source.rssUrl) return 0;

  try {
    await db.update(sourcesTable).set({ fetchStatus: "fetching" }).where(eq(sourcesTable.id, source.id));

    const items = await parseRss(source.rssUrl);
    let inserted = 0;

    const candidateLinks = items
      .slice(0, 50)
      .map((i) => i.link)
      .filter(Boolean) as string[];

    const existingRows = candidateLinks.length
      ? await db
          .select({ url: articlesTable.url })
          .from(articlesTable)
          .where(sql`${articlesTable.url} = ANY(${candidateLinks})`)
      : [];
    const existingUrls = new Set(existingRows.map((r) => r.url));

    for (const item of items.slice(0, 50)) {
      if (!item.title || !item.link) continue;

      const title = item.title.slice(0, 500);
      const rawSummary = item.description || item.title;
      const summary = cleanSummary(rawSummary, source.name).slice(0, 2000);
      const category = classifyArticle(title, summary, item.category);

      let publishedDate: Date;
      try {
        publishedDate = item.pubDate ? new Date(item.pubDate) : new Date();
        if (isNaN(publishedDate.getTime())) publishedDate = new Date();
      } catch {
        publishedDate = new Date();
      }

      let imageUrl: string | null = item.imageUrl ?? null;

      if (!imageUrl && !existingUrls.has(item.link)) {
        imageUrl = await fetchOgImage(item.link);
      }

      const article: InsertArticle = {
        title,
        summary,
        author: item.author?.slice(0, 200) || null,
        sourceId: source.id,
        country: source.country,
        category,
        publishedDate,
        url: item.link.slice(0, 1000),
        imageUrl: imageUrl?.slice(0, 2000) ?? null,
        aiSummary: null,
      };

      try {
        await db
          .insert(articlesTable)
          .values(article)
          .onConflictDoUpdate({
            target: articlesTable.url,
            set: {
              summary: article.summary,
              category: article.category,
              imageUrl: article.imageUrl != null
                ? article.imageUrl
                : sql`${articlesTable.imageUrl}`,
            },
          });
        inserted++;
      } catch {
        // ignore unexpected errors
      }
    }

    await db
      .update(sourcesTable)
      .set({
        fetchStatus: "ok",
        lastFetched: new Date(),
        articlesFetched: sql`${sourcesTable.articlesFetched} + ${inserted}`,
      })
      .where(eq(sourcesTable.id, source.id));

    console.log(`[ingestion] ${source.name}: inserted ${inserted} articles from ${items.length} items`);
    return inserted;
  } catch (err) {
    console.error(`[ingestion] ${source.name} failed:`, err);
    await db.update(sourcesTable).set({ fetchStatus: "error" }).where(eq(sourcesTable.id, source.id));
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Ingest all sources
// ---------------------------------------------------------------------------

export async function ingestAllSources(sources: (typeof sourcesTable.$inferSelect)[]): Promise<void> {
  const active = sources.filter((s) => s.isActive && s.rssUrl);
  const BATCH = 5;
  for (let i = 0; i < active.length; i += BATCH) {
    const batch = active.slice(i, i + BATCH);
    await Promise.allSettled(batch.map((s) => ingestSource(s)));
    if (i + BATCH < active.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  console.log("[ingestion] All sources processed");
}

export function startScheduledIngestion(intervalMs = 60 * 60 * 1000): void {
  const run = async () => {
    console.log("[ingestion] Scheduled run starting...");
    const sources = await db.select().from(sourcesTable).where(eq(sourcesTable.isActive, true));
    await ingestAllSources(sources);
  };

  run().catch((err) => console.error("[ingestion] Initial run failed:", err));
  setInterval(() => {
    run().catch((err) => console.error("[ingestion] Scheduled run failed:", err));
  }, intervalMs);
  console.log(`[ingestion] Scheduler started — runs every ${intervalMs / 60000} minutes`);
}
