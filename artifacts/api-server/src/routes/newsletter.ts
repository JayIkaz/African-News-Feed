import { Router } from "express";
import { db } from "@workspace/db";
import { subscribersTable } from "@workspace/db/schema";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/subscribe", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || !EMAIL_RE.test(email.trim())) {
    res.status(400).json({ error: "invalid_email", message: "A valid email address is required." });
    return;
  }

  try {
    await db
      .insert(subscribersTable)
      .values({ email: email.trim().toLowerCase() })
      .onConflictDoNothing({ target: subscribersTable.email });

    res.json({ ok: true, message: "Subscribed successfully." });
  } catch (err) {
    console.error("[newsletter] subscribe error:", err);
    res.status(500).json({ error: "server_error", message: "Could not save subscription." });
  }
});

export default router;
