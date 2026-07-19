import { rateLimit } from "express-rate-limit";

// Applies before the admin-token check runs, so brute-forcing the token is
// throttled too.
export const adminTriggerRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
