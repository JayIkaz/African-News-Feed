import { rateLimit } from "express-rate-limit";

// Applies before the admin-token check runs, so brute-forcing the token is
// throttled too.
export const adminTriggerRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Public but cost-bearing (each uncached call hits the DeepL API) — generous
// enough for a reader paging through foreign-language stories.
export const translateRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
