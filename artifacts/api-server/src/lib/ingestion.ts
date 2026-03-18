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
  // 1. RSS-provided category as a strong hint (2-category-point bonus)
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

  // 2. Keyword scoring — title worth 3x, body worth 1x
  const titleLower = title.toLowerCase();
  const bodyLower = summary.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (titleLower.includes(kw)) score += 3;
      else if (bodyLower.includes(kw)) score += 1;
    }
    if (rssCategoryHint === category) score += 6; // RSS hint bonus
    scores[category] = score;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : "General";
}

// ---------------------------------------------------------------------------
// Summary cleaner — strips RSS boilerplate, HTML, and trailing artifacts
// ---------------------------------------------------------------------------

function cleanSummary(raw: string, sourceTitle?: string): string {
  let text = raw;

  // 1. Strip HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // 2. Decode common HTML entities (belt-and-suspenders after extraction)
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

  // 3. Strip "The post … appeared first on …" patterns (WordPress RSS)
  text = text.replace(/\s*The post .{0,300}? appeared first on .{0,150}?\.?\s*$/is, "");

  // 4. Strip "… | Source Name" or "… - Source Name" trailing source attribution
  if (sourceTitle) {
    const escaped = sourceTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`\\s*[|\\-–—]\\s*${escaped}\\s*$`, "i"), "");
  }

  // 5. Strip "Read more at …", "Continue reading …", "Click here to read …"
  text = text.replace(/\s*(Read more|Continue reading|Click here to read|Read full story|See also|View more|Learn more)[^.]*\.?\s*$/i, "");

  // 6. Strip trailing "[…]", "[Read More]", "(...)", "[+NNN chars]"
  text = text.replace(/\s*\[\s*(…|\.{3}|Read More|\+\d+ chars?)\s*\]\s*$/i, "");
  text = text.replace(/\s*\(\s*\.\.\.\s*\)\s*$/i, "");

  // 7. Strip bare URLs at the end
  text = text.replace(/\s*https?:\/\/\S+\s*$/i, "");

  // 8. Strip duplicate whitespace / newlines
  text = text.replace(/\s{2,}/g, " ").trim();

  return text;
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

      items.push({
        title: extract("title"),
        description: extract("description") || extract("content:encoded") || extract("summary"),
        link: linkMatch?.[1]?.trim() || extract("guid"),
        author: extract("author") || extract("dc:creator"),
        pubDate: extract("pubDate") || extract("dc:date") || extract("published"),
        category: extract("category"),
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

      const article: InsertArticle = {
        title,
        summary,
        author: item.author?.slice(0, 200) || null,
        sourceId: source.id,
        country: source.country,
        category,
        publishedDate,
        url: item.link.slice(0, 1000),
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
  const promises = sources.filter((s) => s.isActive && s.rssUrl).map((s) => ingestSource(s));
  await Promise.allSettled(promises);
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
