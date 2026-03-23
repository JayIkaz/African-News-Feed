import { Router } from "express";
import healthRouter from "./health";
import articlesRouter from "./articles";
import searchRouter from "./search";
import sourcesRouter from "./sources";
import countriesRouter from "./countries";
import categoriesRouter from "./categories";
import ingestionRouter from "./ingestion";
import newsletterRouter from "./newsletter";

const router = Router();

router.use(healthRouter);
router.use("/articles", articlesRouter);
router.use("/search", searchRouter);
router.use("/sources", sourcesRouter);
router.use("/countries", countriesRouter);
router.use("/categories", categoriesRouter);
router.use("/ingestion", ingestionRouter);
router.use("/newsletter", newsletterRouter);

export default router;
