import { Router } from "express";
import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { subscribersTable } from "@workspace/db/schema";
import { subscribeRateLimit, unsubscribeRateLimit } from "../middlewares/rateLimit";
import { buildWelcomeEmail, emailConfig, isValidUnsubscribeToken, newsletterSecret, SITE_ORIGIN } from "../lib/newsletter";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const SEND_TIMEOUT_MS = 8000;

// Sends the welcome email and says whether it went. A failure here must not
// undo the sign-up, so it returns false instead of throwing. The send is
// awaited: on a serverless function the work is frozen once the response is
// sent, so a fire-and-forget call can be dropped before it reaches Resend.
async function sendWelcome(email: string): Promise<boolean> {
  const config = emailConfig();
  if (!config) {
    console.warn("[newsletter] RESEND_API_KEY or NEWSLETTER_SECRET is not set; no welcome email sent");
    return false;
  }
  const { subject, html, text, headers } = buildWelcomeEmail(email, config.secret);
  try {
    const resend = new Resend(config.apiKey);
    const result = await Promise.race([
      resend.emails.send({
        from: config.from,
        to: email,
        replyTo: "enquiries@africannewsfeed.news",
        subject,
        html,
        text,
        headers,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timed out waiting for Resend")), SEND_TIMEOUT_MS),
      ),
    ]);
    if (result.error) {
      console.error("[newsletter] Resend rejected the welcome email:", result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[newsletter] welcome email failed:", err);
    return false;
  }
}

router.post("/subscribe", subscribeRateLimit, async (req, res) => {
  const { email } = (req.body ?? {}) as { email?: unknown };

  if (typeof email !== "string" || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email.trim())) {
    res.status(400).json({ error: "invalid_email", message: "A valid email address is required." });
    return;
  }

  const normalised = email.trim().toLowerCase();

  try {
    const result = await db
      .insert(subscribersTable)
      .values({ email: normalised })
      .onConflictDoNothing({ target: subscribersTable.email })
      .returning();

    // Only a new address gets the welcome email, so repeating the form cannot
    // be used to send someone repeated emails.
    const emailSent = result.length > 0 ? await sendWelcome(normalised) : false;

    res.json({ ok: true, message: "Subscribed successfully.", emailSent });
  } catch (err) {
    console.error("[newsletter] subscribe error:", err);
    res.status(500).json({ error: "server_error", message: "Could not save subscription." });
  }
});

function readUnsubscribeParams(req: { query: Record<string, unknown>; body?: unknown }) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const e = req.query.e ?? body.e;
  const t = req.query.t ?? body.t;
  return {
    email: typeof e === "string" ? e.trim().toLowerCase() : "",
    token: typeof t === "string" ? t : "",
  };
}

// A person who opens the link in an email lands on the site's own page, which
// asks them to confirm. Mail scanners that fetch links in advance therefore
// cannot unsubscribe anyone by accident.
router.get("/unsubscribe", (req, res) => {
  const { email, token } = readUnsubscribeParams(req);
  res.redirect(302, `${SITE_ORIGIN}/unsubscribe?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`);
});

// Used by the confirm page and by mail clients' one-click unsubscribe (RFC 8058).
router.post("/unsubscribe", unsubscribeRateLimit, async (req, res) => {
  const secret = newsletterSecret();
  const { email, token } = readUnsubscribeParams(req);

  if (!secret || !email || !token || !isValidUnsubscribeToken(email, token, secret)) {
    res.status(400).json({ error: "invalid_link", message: "This unsubscribe link is not valid." });
    return;
  }

  try {
    // Deleting the row is what the privacy page promises: we keep an address
    // until the person unsubscribes. Unsubscribing twice is not an error.
    await db.delete(subscribersTable).where(eq(subscribersTable.email, email));
    res.json({ ok: true, message: "Unsubscribed." });
  } catch (err) {
    console.error("[newsletter] unsubscribe error:", err);
    res.status(500).json({ error: "server_error", message: "Could not unsubscribe you. Please try again." });
  }
});

export default router;
