import { Router, type IRouter, type Response } from "express";
import { db } from "@workspace/db";
import { articlesTable, sourcesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { articleSelection } from "../lib/articleSelect";
import { injectMeta, SITE_ORIGIN } from "../lib/shareMeta";

// ---------------------------------------------------------------------------
// GET /api/share/article/:id
//
// Serves the web app's built index.html with this article's title,
// description, canonical and Open Graph / Twitter tags in place of the home
// page's. The web project's vercel.json sends only link-preview and search
// bots here (matched on User-Agent); readers still get the static file
// straight from the CDN, so a database or function problem here cannot reach
// them. The page body is the unmodified app shell: a bot that runs scripts
// sees the same page a reader does.
// ---------------------------------------------------------------------------

const router: IRouter = Router();

const WEB_ORIGIN = (process.env.WEB_ORIGIN ?? SITE_ORIGIN).replace(/\/+$/, "");
const SHELL_TTL_MS = 5 * 60 * 1000;
const SHELL_TIMEOUT_MS = 5000;

let shellCache: { html: string; fetchedAt: number } | null = null;

// The shell is fetched from the web project's own static /index.html (never
// from an /article/ path, which would route back here). A copy is kept for
// five minutes per function instance, and an old copy is used if a refresh
// fails.
async function loadShell(): Promise<string | null> {
  const now = Date.now();
  if (shellCache && now - shellCache.fetchedAt < SHELL_TTL_MS) return shellCache.html;
  try {
    const response = await fetch(`${WEB_ORIGIN}/index.html`, {
      signal: AbortSignal.timeout(SHELL_TIMEOUT_MS),
      headers: { Accept: "text/html" },
    });
    if (!response.ok) throw new Error(`shell responded ${response.status}`);
    const html = await response.text();
    if (!/<\/head>/i.test(html) || !html.includes('id="root"')) {
      throw new Error("shell does not look like the web app's index.html");
    }
    shellCache = { html, fetchedAt: now };
    return html;
  } catch (err) {
    console.error("Share route: could not load app shell:", err);
    return shellCache?.html ?? null;
  }
}

function sendHtml(res: Response, status: number, html: string, cacheControl: string) {
  res.status(status).set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": cacheControl }).send(html);
}

router.get("/article/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).type("text/plain").send("Invalid article ID");
    return;
  }

  const shell = await loadShell();
  if (!shell) {
    res.status(503).set({ "Retry-After": "60", "Cache-Control": "no-store" }).type("text/plain").send("Temporarily unavailable");
    return;
  }

  try {
    const rows = await db
      .select(articleSelection)
      .from(articlesTable)
      .leftJoin(sourcesTable, eq(articlesTable.sourceId, sourcesTable.id))
      .where(eq(articlesTable.id, id))
      .limit(1);

    const article = rows[0];
    if (!article) {
      // Unknown id: the app shows "Article Not Found", so tell bots the same
      // thing instead of letting them index the shell under this URL.
      sendHtml(res, 404, shell, "public, s-maxage=300");
      return;
    }

    const html = injectMeta(shell, article);
    if (!html) {
      sendHtml(res, 200, shell, "public, s-maxage=60");
      return;
    }
    sendHtml(res, 200, html, "public, s-maxage=900, stale-while-revalidate=3600");
  } catch (err) {
    console.error("Share route: article lookup failed:", err);
    res.status(503).set({ "Retry-After": "60", "Cache-Control": "no-store" }).type("text/plain").send("Temporarily unavailable");
  }
});

export default router;
