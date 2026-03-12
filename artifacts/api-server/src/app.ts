import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { startScheduledIngestion } from "./lib/ingestion";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

startScheduledIngestion();

export default app;
