import { Router } from "express";
import healthRouter from "./health";
import articlesRouter from "./articles";
import searchRouter from "./search";
import sourcesRouter from "./sources";
import countriesRouter from "./countries";
import categoriesRouter from "./categories";
import ingestionRouter from "./ingestion";
import newsletterRouter from "./newsletter";
import sitemapRouter from "./sitemap";
import shareRouter from "./share";
import { publicCache } from "../middlewares/publicCache";

// Cache windows, chosen against how often each thing actually changes.
//
// Stories arrive on the hourly ingestion job, so a minute at the edge is well
// inside the staleness a reader would notice and still collapses a crawl of
// thousands of article URLs into a handful of database queries.
//
// Categories, countries and publishers change when a feed is added or removed,
// which is rare, so they hold for ten minutes.
//
// publicCache only touches successful GETs; the POST routes under /articles
// (translate) and /newsletter pass through untouched.
const LIST_CACHE = publicCache(30, 60, 300);
const CATALOGUE_CACHE = publicCache(300, 600, 3600);

const router = Router();
router.use(healthRouter);
router.use("/articles", LIST_CACHE, articlesRouter);
router.use("/search", LIST_CACHE, searchRouter);
router.use("/sources", CATALOGUE_CACHE, sourcesRouter);
router.use("/countries", CATALOGUE_CACHE, countriesRouter);
router.use("/categories", CATALOGUE_CACHE, categoriesRouter);
router.use("/ingestion", LIST_CACHE, ingestionRouter);
router.use("/newsletter", newsletterRouter);
router.use("/sitemap.xml", sitemapRouter);
router.use("/share", shareRouter);

export default router;
