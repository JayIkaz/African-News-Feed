import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { startScheduledIngestion } from "./lib/ingestion";
import { seedSourcesIfEmpty } from "./lib/seeds";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

seedSourcesIfEmpty()
  .then(() => startScheduledIngestion())
  .catch((err) => console.error("[startup] Seed/ingestion error:", err));

export default app;
