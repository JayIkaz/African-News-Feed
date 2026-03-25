import { Router } from "express";
import { Resend } from "resend";
import { db } from "@workspace/db";
import { subscribersTable } from "@workspace/db/schema";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

router.post("/subscribe", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || !EMAIL_RE.test(email.trim())) {
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

    const isNew = result.length > 0;

    if (isNew && resend) {
      resend.emails.send({
        from: "AfricaNews <onboarding@resend.dev>",
        to: normalised,
        subject: "Welcome to AfricaNews — you're on the list! 🌍",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
          <body style="margin:0;padding:0;background:#faf9f6;font-family:'Georgia',serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f6;padding:40px 0;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                  <!-- Header -->
                  <tr>
                    <td style="background:#0f0e0d;padding:28px 40px;border-radius:10px 10px 0 0;">
                      <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.02em;">AfricaNews</p>
                      <p style="margin:4px 0 0;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif;">The Continent's Pulse</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="background:#fff;padding:40px;border-left:1px solid #e8e5de;border-right:1px solid #e8e5de;">
                      <p style="margin:0 0 20px;font-size:13px;font-family:Arial,sans-serif;color:#c1392b;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Welcome aboard</p>
                      <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:30px;font-weight:700;color:#0f0e0d;line-height:1.25;letter-spacing:-0.02em;">
                        Africa's most important stories, delivered to you daily.
                      </h1>
                      <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#5a5750;">
                        Thank you for subscribing to AfricaNews. Every morning we'll send you a curated digest of the top stories from across the continent — politics, business, technology, and more, sourced from 65+ trusted local and international outlets.
                      </p>
                      <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#5a5750;">
                        You won't miss a thing.
                      </p>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#c1392b;border-radius:6px;">
                            <a href="https://africannewsfeed.news" style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:#fff;text-decoration:none;letter-spacing:0.02em;">
                              Read Today's Top Stories →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Regions highlight -->
                  <tr>
                    <td style="background:#f3f1ec;padding:28px 40px;border-left:1px solid #e8e5de;border-right:1px solid #e8e5de;">
                      <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#9a978f;">Coverage across</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          ${[
                            ["🌍", "West Africa"],
                            ["🌍", "East Africa"],
                            ["🌍", "North Africa"],
                            ["🌍", "Southern Africa"],
                            ["🌍", "Central Africa"],
                          ].map(([icon, region]) => `
                            <td style="padding:6px 10px 6px 0;font-family:Arial,sans-serif;font-size:12px;color:#2c2b29;white-space:nowrap;">
                              ${icon} ${region}
                            </td>
                          `).join("")}
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#0f0e0d;padding:24px 40px;border-radius:0 0 10px 10px;">
                      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.6;">
                        You're receiving this because you subscribed at africannewsfeed.news.<br>
                        © ${new Date().getFullYear()} AfricaNews Aggregator. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
      }).catch(err => console.error("[newsletter] welcome email failed:", err));
    }

    res.json({ ok: true, message: "Subscribed successfully." });
  } catch (err) {
    console.error("[newsletter] subscribe error:", err);
    res.status(500).json({ error: "server_error", message: "Could not save subscription." });
  }
});

export default router;
