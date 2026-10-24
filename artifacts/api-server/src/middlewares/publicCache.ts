import type { Request, Response, NextFunction } from "express";

// Edge-cache a read-only GET response.
//
// Every public read route served straight from the database on every request,
// so a crawler working through the 5,000 article URLs in the sitemap ran four
// uncached queries per page. This lets Vercel's CDN answer the repeats.
//
// `s-maxage` is the directive Vercel's CDN reads; `max-age` alone only caches
// in the reader's own browser. Both are set: the browser figure is deliberately
// short so a reader is never far behind the feed, while the CDN holds the
// response long enough to absorb a crawl.
//
// `stale-while-revalidate` lets the edge serve the previous copy while it
// fetches a fresh one, so the first request after expiry doesn't wait on the
// database and a burst never queues behind one slow query.
//
// Only successful responses are cached. Errors are left alone: caching a 500
// for a minute turns a blip into a minute of outage, and caching a 404 outlives
// the article that is about to exist.
//
// This deliberately overwrites any Cache-Control already on the response. An
// earlier version skipped when one was present, meaning to defer to a handler
// that had set its own — but Vercel's Node runtime puts a default
// `public, max-age=0, must-revalidate` on the response before the handler runs,
// so that check only ever saw the platform default and stood down, and the
// header never reached production. Nothing is lost by overwriting: the two
// routes that set their own value, share.ts and sitemap.ts, both answer with
// res.send and never pass through here, which only wraps res.json.
export function publicCache(maxAge: number, sMaxAge: number, staleWhileRevalidate: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== "GET") {
      next();
      return;
    }

    const sendJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode < 400) {
        res.setHeader(
          "Cache-Control",
          `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
        );
        // Vercel's CDN consumes s-maxage and stale-while-revalidate and strips
        // them before the response reaches the client, so Cache-Control alone
        // cannot tell you whether this ran. This header can: if it is absent,
        // the middleware did not run; if it is present but Cache-Control looks
        // untouched, the platform overrode it.
        res.setHeader("X-Cache-Policy", `${maxAge}/${sMaxAge}/${staleWhileRevalidate}`);
      }
      return sendJson(body);
    };

    next();
  };
}
