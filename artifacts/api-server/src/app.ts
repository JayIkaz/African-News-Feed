import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import inboundRouter from "./routes/inbound";

const app: Express = express();

// Running behind Vercel's proxy — trust its X-Forwarded-For so express-rate-limit
// (and req.ip generally) sees the real client IP instead of refusing to start.
app.set("trust proxy", 1);

// TEMPORARY DIAGNOSTIC — remove once the cache-header question is settled.
//
// publicCache sets Cache-Control and X-Cache-Policy inside a res.json wrapper,
// and neither reaches the client in production, while the res.setHeader call in
// sitemap.ts does. This probe sits at the very top of the stack, before cors and
// before any routing, and reports four things in one request:
//
//   X-Probe-Early    present => an Express-set header survives to the client
//   X-Probe-CC-Entry the value of Cache-Control when the request arrives, which
//                    tests whether the platform pre-sets one before handlers run
//   X-Probe-Json     present => wrapping res.json works here, so any failure is
//                    specific to where publicCache is mounted, not the technique
//   X-Cache-Policy   (from publicCache) present => that middleware ran too
//
// Nothing absent, and app.ts changes are not reaching production at all.
app.use((_req, res, next) => {
  res.setHeader("X-Probe-Early", "1");
  const ccAtEntry = res.getHeader("Cache-Control");
  res.setHeader("X-Probe-CC-Entry", ccAtEntry === undefined ? "none" : String(ccAtEntry));

  const sendJson = res.json.bind(res);
  res.json = (body: unknown) => {
    res.setHeader("X-Probe-Json", "1");
    return sendJson(body);
  };

  next();
});

const DEFAULT_ALLOWED_ORIGINS = [
  "https://africannewsfeed.news",
  "https://www.africannewsfeed.news",
];
const allowedOrigins = [
  ...DEFAULT_ALLOWED_ORIGINS,
  ...(process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
];
// Vercel preview/branch deployments for the african-news frontend project.
const allowedOriginPatterns: RegExp[] = [
  /^https:\/\/african-news-feed[a-z0-9-]*\.vercel\.app$/,
];

app.use(
  cors({
    // Cache the CORS preflight. Calling the API cross-origin means any request
    // carrying a non-safelisted header (Authorization, above all) is preceded by
    // an OPTIONS preflight. Without a max-age the browser repeats that preflight
    // constantly, which would add back the edge requests this change removes.
    // Browsers cap this themselves (Chrome at 2 hours); the value is an upper
    // bound, not a promise.
    maxAge: 86400,
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOriginPatterns.some((p) => p.test(origin))
      ) {
        callback(null, true);
        return;
      }
      // Reject without throwing — an Error passed to this callback propagates
      // as an unhandled exception (bare 500), not a clean CORS rejection.
      callback(null, false);
    },
  }),
);
// Webhooks verify a signature over the exact bytes that were sent, so they read
// the raw body themselves. They are mounted ahead of the JSON parser, which
// would consume the body first.
app.use("/api/inbound", inboundRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Ingestion scheduling and seeding no longer happen at import time — GitHub
// Actions (.github/workflows/ingest.yml) owns the hourly cron, and seeding
// runs from the ingest script or the long-lived server entrypoint. Import-time
// side effects would fire on every serverless cold start.

export default app;
