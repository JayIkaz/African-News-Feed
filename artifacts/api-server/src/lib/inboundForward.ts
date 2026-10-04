import type { EmailReceivedEvent, Resend } from "resend";

// Mail sent to the site's addresses (enquiries@, advertise@) is received by
// Resend. This module turns a Resend "email.received" event into a copy sent
// to a personal inbox, so nobody has to open the Resend dashboard to read it.

const OWN_DOMAIN = "africannewsfeed.news";

// Sent from the verified notifications subdomain, the same one the welcome
// email uses. The visitor's own address goes in Reply-To, never in From:
// sending as someone else's address fails their SPF and DMARC checks.
const DEFAULT_FROM = "AfricaNews inbound <inbound@notifications.africannewsfeed.news>";

export interface InboundConfig {
  apiKey: string;
  webhookSecret: string;
  forwardTo: string[];
  from: string;
}

export type InboundConfigResult =
  | { ok: true; config: InboundConfig }
  | { ok: false; reason: string };

export function addressOf(value: string): string {
  const angle = /<([^<>]+)>\s*$/.exec(value);
  return (angle ? angle[1] : value).trim().toLowerCase();
}

export function isOwnAddress(value: string): boolean {
  const domain = addressOf(value).split("@").pop() ?? "";
  return domain === OWN_DOMAIN || domain.endsWith(`.${OWN_DOMAIN}`);
}

// Reading a received message needs a full-access Resend key; the send-only key
// used for the welcome email is refused with a 401. RESEND_INBOUND_API_KEY lets
// the two be different keys, and RESEND_API_KEY is the fallback for a setup that
// uses one full-access key for both.
//
// All three values must be set. A forward target on our own domain is refused:
// the copy would arrive at Resend again and be forwarded again, for ever.
export function inboundConfig(env: NodeJS.ProcessEnv = process.env): InboundConfigResult {
  const apiKey = env.RESEND_INBOUND_API_KEY || env.RESEND_API_KEY;
  const webhookSecret = env.RESEND_WEBHOOK_SECRET;
  const forwardTo = (env.INBOUND_FORWARD_TO ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const missing = [
    !apiKey && "RESEND_INBOUND_API_KEY",
    !webhookSecret && "RESEND_WEBHOOK_SECRET",
    forwardTo.length === 0 && "INBOUND_FORWARD_TO",
  ].filter(Boolean);
  if (missing.length > 0) return { ok: false, reason: `${missing.join(", ")} not set` };

  if (forwardTo.some(isOwnAddress)) {
    return { ok: false, reason: `INBOUND_FORWARD_TO points at ${OWN_DOMAIN}, which would loop` };
  }
  return {
    ok: true,
    config: {
      apiKey: apiKey!,
      webhookSecret: webhookSecret!,
      forwardTo,
      from: env.INBOUND_FORWARD_FROM || DEFAULT_FROM,
    },
  };
}

// Only the calls this module makes, taken from the SDK's own types so a
// change in the SDK shows up when the project is type-checked.
export interface MailClient {
  emails: Pick<Resend["emails"], "send"> & {
    receiving: Pick<Resend["emails"]["receiving"], "get"> & {
      attachments: Pick<Resend["emails"]["receiving"]["attachments"], "list">;
    };
  };
}

export type ForwardOutcome =
  | { status: "ignored"; reason: string }
  | { status: "forwarded"; id: string; attachments: "none" | "attached" | "listed" };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// The mailbox the message was sent to, for the subject tag: "enquiries".
function mailboxOf(recipients: string[]): string {
  const own = recipients.map(addressOf).find(isOwnAddress);
  return own ? own.split("@")[0] : "inbound";
}

function describeFailure(error: { message?: string; statusCode?: number | null } | null): string {
  const status = error?.statusCode ?? "no status";
  const hint =
    status === 401 || status === 403
      ? " - check the key's permissions: reading received mail needs a full-access key (RESEND_INBOUND_API_KEY)"
      : "";
  return `${status}: ${error?.message ?? "unknown error"}${hint}`;
}

// A 4xx other than 429 means Resend refused the message itself (an attachment
// that is too large, say), so sending it again without attachments can work.
// Anything else may mean the first send went through, and a second would
// duplicate it.
function isRefusal(error: { statusCode?: number | null } | null): boolean {
  const code = error?.statusCode ?? 0;
  return code >= 400 && code < 500 && code !== 429;
}

// Forwards one received email. Throws when it could not be forwarded, so the
// caller can answer 5xx and have Resend deliver the event again.
export async function forwardReceivedEmail(
  client: MailClient,
  config: InboundConfig,
  event: EmailReceivedEvent,
): Promise<ForwardOutcome> {
  const emailId = event.data.email_id;

  if (isOwnAddress(event.data.from)) {
    return { status: "ignored", reason: "sent from our own domain" };
  }

  const received = await client.emails.receiving.get(emailId);
  if (received.error || !received.data) {
    throw new Error(`could not read received email ${emailId} (${describeFailure(received.error)})`);
  }
  const email = received.data;

  const files: { filename?: string; path: string; contentType?: string; contentId?: string }[] = [];
  if (email.attachments.length > 0) {
    const listed = await client.emails.receiving.attachments.list({ emailId });
    if (listed.error || !listed.data) {
      throw new Error(`could not list attachments of ${emailId} (${describeFailure(listed.error)})`);
    }
    for (const a of listed.data.data) {
      files.push({
        filename: a.filename,
        path: a.download_url,
        contentType: a.content_type,
        // Only inline images carry a content id; setting it on a plain
        // attachment would hide the file.
        contentId: a.content_disposition === "inline" ? a.content_id : undefined,
      });
    }
  }

  const to = email.to.join(", ");
  const cc = email.cc && email.cc.length > 0 ? email.cc.join(", ") : null;
  const subject = email.subject?.trim() || "(no subject)";
  const header: [string, string][] = [
    ["From", email.from],
    ["To", to],
    ...(cc ? ([["Cc", cc]] as [string, string][]) : []),
    ["Date", email.created_at],
    ["Subject", subject],
  ];
  const note = "Reply to this message to answer the sender.";
  const textHeader = [...header.map(([k, v]) => `${k}: ${v}`), note, "-".repeat(40), ""].join("\n");
  const htmlHeader =
    `<div style="font:13px/1.5 system-ui,sans-serif;color:#444;border-bottom:1px solid #ccc;padding-bottom:10px;margin-bottom:16px">` +
    header.map(([k, v]) => `<div><strong>${k}:</strong> ${escapeHtml(v)}</div>`).join("") +
    `<div style="margin-top:6px;color:#777">${note}</div></div>`;

  const body = (extra: string) => ({
    text: `${extra}${textHeader}${email.text ?? "(This message has no plain text version.)"}`,
    html: email.html
      ? `${extra ? `<p>${escapeHtml(extra.trim())}</p>` : ""}${htmlHeader}${email.html}`
      : undefined,
  });

  const message = {
    from: config.from,
    to: config.forwardTo,
    replyTo: email.reply_to && email.reply_to.length > 0 ? email.reply_to : email.from,
    subject: `[${mailboxOf([...email.to, ...(email.cc ?? [])])}] ${subject}`.slice(0, 250),
  };

  const key = `inbound-forward-${emailId}`;
  const sent = await client.emails.send(
    { ...message, ...body(""), attachments: files.length > 0 ? files : undefined },
    { idempotencyKey: key },
  );
  if (!sent.error && sent.data) {
    return { status: "forwarded", id: sent.data.id, attachments: files.length > 0 ? "attached" : "none" };
  }

  if (files.length > 0 && isRefusal(sent.error)) {
    console.warn(`[inbound] ${emailId}: send with attachments refused (${describeFailure(sent.error)}); sending without them`);
    const names = files.map((f) => f.filename ?? "unnamed").join(", ");
    const retry = await client.emails.send(
      {
        ...message,
        ...body(`This message had ${files.length} attachment(s) that could not be forwarded (${names}). They are still in the Resend inbox.\n\n`),
      },
      { idempotencyKey: `${key}-no-attachments` },
    );
    if (!retry.error && retry.data) return { status: "forwarded", id: retry.data.id, attachments: "listed" };
    throw new Error(`could not forward ${emailId} (${describeFailure(retry.error)})`);
  }

  throw new Error(`could not forward ${emailId} (${describeFailure(sent.error)})`);
}
