import { createHmac, timingSafeEqual } from "node:crypto";

export const SITE_ORIGIN = "https://www.africannewsfeed.news";
export const CONTACT_EMAIL = "enquiries@africannewsfeed.news";
export const COMPANY_LINE =
  "Auvane Limited, trading as Aukizan. Registered in England and Wales, company number 13726607. " +
  "Registered office: 61 Bridge Street, Kington, United Kingdom, HR5 3DJ.";

// Resend only sends from a domain you have verified. notifications.africannewsfeed.news
// is verified in the account; onboarding@resend.dev is restricted to the
// account owner's own address, so it cannot be used for readers.
const DEFAULT_FROM = "AfricaNews <hello@notifications.africannewsfeed.news>";

export interface EmailConfig {
  apiKey: string;
  secret: string;
  from: string;
}

// Email is on only when both values are set. The secret signs unsubscribe
// links; without it we could not put a working unsubscribe link in the email,
// so we send nothing rather than send an email that cannot be opted out of.
export function emailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const secret = process.env.NEWSLETTER_SECRET;
  if (!apiKey || !secret) return null;
  return { apiKey, secret, from: process.env.NEWSLETTER_FROM || DEFAULT_FROM };
}

// Unsubscribing only needs the secret, so it keeps working even if email
// sending is switched off.
export function newsletterSecret(): string | null {
  return process.env.NEWSLETTER_SECRET || null;
}

export function unsubscribeToken(email: string, secret: string): string {
  return createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex");
}

export function isValidUnsubscribeToken(email: string, token: string, secret: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email, secret), "hex");
  let given: Buffer;
  try {
    given = Buffer.from(token, "hex");
  } catch {
    return false;
  }
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function unsubscribeLinks(email: string, secret: string) {
  const query = `e=${encodeURIComponent(email)}&t=${unsubscribeToken(email, secret)}`;
  return {
    // What a person opens: a page that asks them to confirm.
    page: `${SITE_ORIGIN}/unsubscribe?${query}`,
    // What a mail client POSTs for one-click unsubscribe (RFC 8058).
    oneClick: `${SITE_ORIGIN}/api/newsletter/unsubscribe?${query}`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildWelcomeEmail(email: string, secret: string) {
  const links = unsubscribeLinks(email, secret);
  const subject = "You are on the AfricaNews mailing list";

  const text = [
    "Thanks for signing up to AfricaNews.",
    "",
    "AfricaNews collects headlines from African news publishers in one place and updates several times a day. Every story links to the publisher that wrote it.",
    "",
    "This is the only email we send at present. We do not send a daily digest yet. If that changes, we will update our privacy page before the first one goes out.",
    "",
    `Read the latest headlines: ${SITE_ORIGIN}`,
    "",
    "You are receiving this because this address was entered on africannewsfeed.news.",
    `Unsubscribe: ${links.page}`,
    `Privacy: ${SITE_ORIGIN}/privacy`,
    `Questions: ${CONTACT_EMAIL}`,
    "",
    COMPANY_LINE,
  ].join("\n");

  const font = "Arial,Helvetica,sans-serif";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F7F5F0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="padding:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1916;">AfricaNews</td></tr>
<tr><td style="border-top:1px solid #D8D5CF;padding:28px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:700;color:#1A1916;">
Thanks for signing up.
</td></tr>
<tr><td style="padding:16px 0 0;font-family:${font};font-size:16px;line-height:1.65;color:#1A1916;">
AfricaNews collects headlines from African news publishers in one place and updates several times a day. Every story links to the publisher that wrote it.
</td></tr>
<tr><td style="padding:16px 0 0;font-family:${font};font-size:16px;line-height:1.65;color:#1A1916;">
This is the only email we send at present. We do not send a daily digest yet. If that changes, we will update our <a href="${SITE_ORIGIN}/privacy" style="color:#9A3412;">privacy page</a> before the first one goes out.
</td></tr>
<tr><td style="padding:24px 0 0;">
<a href="${SITE_ORIGIN}" style="display:inline-block;background:#9A3412;color:#F7F5F0;font-family:${font};font-size:15px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:6px;">Read the latest headlines</a>
</td></tr>
<tr><td style="padding:32px 0 0;"><div style="border-top:1px solid #D8D5CF;height:0;line-height:0;font-size:0;">&nbsp;</div></td></tr>
<tr><td style="padding:16px 0 0;font-family:${font};font-size:13px;line-height:1.6;color:#53524F;">
You are receiving this because ${escapeHtml(email)} was entered on africannewsfeed.news.<br>
<a href="${escapeHtml(links.page)}" style="color:#9A3412;">Unsubscribe</a> &nbsp;|&nbsp;
<a href="${SITE_ORIGIN}/privacy" style="color:#9A3412;">Privacy</a> &nbsp;|&nbsp;
<a href="mailto:${CONTACT_EMAIL}" style="color:#9A3412;">${CONTACT_EMAIL}</a>
</td></tr>
<tr><td style="padding:16px 0 0;font-family:${font};font-size:12px;line-height:1.6;color:#53524F;">
${escapeHtml(COMPANY_LINE)}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const headers = {
    "List-Unsubscribe": `<${links.oneClick}>, <mailto:${CONTACT_EMAIL}?subject=Unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };

  return { subject, html, text, headers };
}
