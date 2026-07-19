/**
 * Diagnostic: fetch every source's RSS URL and categorize failures.
 * Usage: DATABASE_URL=... pnpm --filter @workspace/scripts exec tsx src/diagnose-feeds.ts
 */
import { pool } from "@workspace/db";

const DEFAULT_UA = "AfricaNews-Aggregator/1.0";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

interface FetchResult {
  ok: boolean;
  status?: number;
  finalUrl?: string;
  redirected?: boolean;
  contentType?: string;
  looksLikeFeed?: boolean;
  itemCount?: number;
  error?: string;
  ms: number;
}

async function tryFetch(url: string, ua: string, timeoutMs = 20000): Promise<FetchResult> {
  const start = Date.now();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": ua,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });
    const body = await resp.text();
    const looksLikeFeed = /<(rss|feed|rdf:RDF)[\s>]/i.test(body.slice(0, 2000));
    const itemCount = (body.match(/<item[\s>]/gi) || []).length + (body.match(/<entry[\s>]/gi) || []).length;
    return {
      ok: resp.ok && looksLikeFeed && itemCount > 0,
      status: resp.status,
      finalUrl: resp.url,
      redirected: resp.url !== url,
      contentType: resp.headers.get("content-type") ?? undefined,
      looksLikeFeed,
      itemCount,
      ms: Date.now() - start,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.cause?.code || err?.name || String(err?.message ?? err),
      ms: Date.now() - start,
    };
  } finally {
    clearTimeout(t);
  }
}

function categorize(def: FetchResult, browser: FetchResult | null): string {
  const r = def;
  if (r.ok) return "OK";
  if (browser?.ok) return "BOT_BLOCKED_UA"; // works with browser UA only
  if (r.error === "AbortError" && browser?.error === "AbortError") return "TIMEOUT";
  if (r.error && (browser?.error || !browser)) {
    if (/ENOTFOUND|EAI_AGAIN/.test(r.error)) return "DNS_DEAD";
    if (/ECONNREFUSED|ECONNRESET|UND_ERR|CERT|DEPTH_ZERO|unable to verify/.test(r.error)) return "CONN_TLS_ERROR";
    if (r.error === "AbortError") return "TIMEOUT";
    return `FETCH_ERR(${r.error})`;
  }
  if (r.status && r.status >= 400) {
    if (r.status === 403 || r.status === 401 || r.status === 429) return `BLOCKED_${r.status}`;
    if (r.status === 404 || r.status === 410) return "DEAD_URL_404";
    return `HTTP_${r.status}`;
  }
  if (r.status && r.status < 400 && !r.looksLikeFeed) return "NOT_A_FEED_HTML";
  if (r.status && r.status < 400 && r.looksLikeFeed && r.itemCount === 0) return "EMPTY_FEED";
  return "UNKNOWN";
}

async function main() {
  const { rows } = await pool.query(
    `select id, name, country, rss_url, fetch_status, last_fetched, articles_fetched, is_active
     from sources order by id`
  );
  console.log(`${rows.length} sources in DB\n`);

  const results: any[] = [];
  const CONC = 6;
  let idx = 0;
  async function worker() {
    while (idx < rows.length) {
      const s = rows[idx++];
      if (!s.rss_url) {
        results.push({ ...s, category: "NO_RSS_URL" });
        continue;
      }
      const def = await tryFetch(s.rss_url, DEFAULT_UA);
      let browser: FetchResult | null = null;
      if (!def.ok) browser = await tryFetch(s.rss_url, BROWSER_UA);
      const category = categorize(def, browser);
      results.push({
        id: s.id, name: s.name, country: s.country, rss_url: s.rss_url,
        db_status: s.fetch_status, category, def, browser,
      });
      console.log(
        `[${category}] ${s.name} (${s.country}) — status=${def.status ?? def.error} ` +
        `items=${def.itemCount ?? "-"} redir=${def.redirected ? def.finalUrl : "no"} ` +
        (browser ? `| browserUA: status=${browser.status ?? browser.error} items=${browser.itemCount ?? "-"}` : "")
      );
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));

  const byCat: Record<string, string[]> = {};
  for (const r of results) (byCat[r.category] ??= []).push(`${r.name} (${r.country})`);
  console.log("\n=== SUMMARY ===");
  for (const [cat, names] of Object.entries(byCat).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${cat} (${names.length}):`);
    for (const n of names) console.log(`  - ${n}`);
  }

  const fs = await import("fs");
  fs.writeFileSync(
    process.env.DIAG_OUT ?? "diagnose-feeds-result.json",
    JSON.stringify(results, null, 2)
  );
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
