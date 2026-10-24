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
// Only successful GETs are cached. Errors are left alone: caching a 500 for a
// minute turns a blip into a minute of outage, and caching a 404 outlives the
// article that is about to exist.
export function publicCache(maxAge: number, sMaxAge: number, staleWhileRevalidate: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== "GET") {
      next();
      return;
    }

    const sendJson = res.json.bind(res);
    res.json = (body: unknown) => {
      // A handler that set its own Cache-Control keeps it; share.ts and
      // sitemap.ts both do, and their values are deliberate.
      if (res.statusCode < 400 && !res.getHeader("Cache-Control")) {
        res.setHeader(
          "Cache-Control",
          `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
        );
      }
      return sendJson(body);
    };

    next();
  };
}
