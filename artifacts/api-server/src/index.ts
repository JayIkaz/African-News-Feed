import app from "./app";
import { seedSourcesIfEmpty } from "./lib/seeds";
import { startScheduledIngestion } from "./lib/ingestion";

const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 3000;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  // Long-lived server only (Replit / local dev). On Vercel serverless this
  // file is never the entrypoint (api/index.js imports app directly), and the
  // hourly GitHub Actions cron owns ingestion in production.
  seedSourcesIfEmpty()
    .then(() => {
      if (process.env.ENABLE_IN_PROCESS_INGESTION === "1") {
        startScheduledIngestion();
      }
    })
    .catch((err) => console.error("[startup] Seed error (non-fatal):", err));
});
