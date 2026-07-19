import type { Request, Response, NextFunction } from "express";

// Simple shared-secret admin gate: the GitHub Actions workflow and the site
// owner hold ADMIN_TOKEN; everyone else gets 403. If ADMIN_TOKEN is unset the
// admin endpoints are disabled entirely rather than left open.
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    res.status(503).json({
      error: "admin_disabled",
      message: "ADMIN_TOKEN is not configured on this deployment",
    });
    return;
  }

  const auth = req.headers.authorization;
  if (auth !== `Bearer ${adminToken}`) {
    res.status(403).json({ error: "forbidden", message: "Admin token required" });
    return;
  }

  next();
}
