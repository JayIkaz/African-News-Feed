import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

// Running behind Vercel's proxy — trust its X-Forwarded-For so express-rate-limit
// (and req.ip generally) sees the real client IP instead of refusing to start.
app.set("trust proxy", 1);

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Ingestion scheduling and seeding no longer happen at import time — GitHub
// Actions (.github/workflows/ingest.yml) owns the hourly cron, and seeding
// runs from the ingest script or the long-lived server entrypoint. Import-time
// side effects would fire on every serverless cold start.

export default app;
