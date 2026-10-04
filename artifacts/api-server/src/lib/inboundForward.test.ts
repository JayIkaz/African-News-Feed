import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { EmailReceivedEvent } from "resend";
import {
  addressOf,
  forwardReceivedEmail,
  inboundConfig,
  isOwnAddress,
  type InboundConfig,
  type MailClient,
} from "./inboundForward";

const config: InboundConfig = {
  apiKey: "re_test",
  webhookSecret: "whsec_dGVzdA==",
  forwardTo: ["owner@gmail.com"],
  from: "AfricaNews inbound <inbound@notifications.africannewsfeed.news>",
};

const event = (over: Partial<EmailReceivedEvent["data"]> = {}): EmailReceivedEvent => ({
  type: "email.received",
  created_at: "2026-10-04T09:45:33.716Z",
  data: {
    email_id: "em_1",
    created_at: "2026-10-04T09:45:33.716Z",
    from: "Ada <ada@example.com>",
    to: ["enquiries@africannewsfeed.news"],
    bcc: [],
    cc: [],
    message_id: "<m1@example.com>",
    subject: "Hello",
    attachments: [],
    ...over,
  },
});

interface Sent {
  payload: Record<string, unknown>;
  options?: { idempotencyKey?: string };
}

// A stand-in for the Resend client that records what was sent.
function fakeClient(opts: {
  received?: Record<string, unknown>;
  getError?: { message: string; statusCode: number };
  attachments?: Record<string, unknown>[];
  sendResults?: ({ id: string } | { statusCode: number; message: string })[];
}) {
  const sent: Sent[] = [];
  const calls = { get: 0, list: 0 };
  const results = [...(opts.sendResults ?? [{ id: "out_1" }])];
  const received = {
    to: ["enquiries@africannewsfeed.news"],
    from: "Ada <ada@example.com>",
    cc: null,
    reply_to: null,
    subject: "Hello",
    created_at: "2026-10-04T09:45:33.716Z",
    text: "Plain body",
    html: null,
    attachments: [],
    ...opts.received,
  };
  const client = {
    emails: {
      receiving: {
        get: async () => {
          calls.get++;
          return opts.getError ? { data: null, error: opts.getError } : { data: received, error: null };
        },
        attachments: {
          list: async () => {
            calls.list++;
            return { data: { object: "list", has_more: false, data: opts.attachments ?? [] }, error: null };
          },
        },
      },
      send: async (payload: Record<string, unknown>, options?: Sent["options"]) => {
        sent.push({ payload, options });
        const next = results.shift() ?? { id: "out_x" };
        return "id" in next ? { data: next, error: null } : { data: null, error: next };
      },
    },
  } as unknown as MailClient;
  return { client, sent, calls };
}

describe("addressOf and isOwnAddress", () => {
  it("reads the address out of a display-name form", () => {
    assert.equal(addressOf("Ada Lovelace <Ada@Example.com>"), "ada@example.com");
    assert.equal(addressOf("ada@example.com"), "ada@example.com");
  });

  it("matches the site's domain and its subdomains only", () => {
    assert.equal(isOwnAddress("enquiries@africannewsfeed.news"), true);
    assert.equal(isOwnAddress("AfricaNews <hello@notifications.africannewsfeed.news>"), true);
    assert.equal(isOwnAddress("x@evilafricannewsfeed.news"), false);
    assert.equal(isOwnAddress("x@africannewsfeed.news.example.com"), false);
    assert.equal(isOwnAddress("ada@gmail.com"), false);
  });
});

describe("inboundConfig", () => {
  const full: NodeJS.ProcessEnv = { RESEND_API_KEY: "re_1", RESEND_WEBHOOK_SECRET: "whsec_x", INBOUND_FORWARD_TO: "owner@gmail.com" };

  it("is on when all three values are set, with the default sender", () => {
    const r = inboundConfig(full);
    assert.ok(r.ok);
    assert.deepEqual(r.config.forwardTo, ["owner@gmail.com"]);
    assert.match(r.config.from, /notifications\.africannewsfeed\.news/);
  });

  it("prefers the dedicated key and falls back to the general one", () => {
    const both = inboundConfig({ ...full, RESEND_INBOUND_API_KEY: "re_full" });
    assert.ok(both.ok);
    assert.equal(both.config.apiKey, "re_full");
    const only = inboundConfig(full);
    assert.ok(only.ok);
    assert.equal(only.config.apiKey, "re_1");
  });

  it("asks for the dedicated key when no key is set at all", () => {
    const r = inboundConfig({ RESEND_WEBHOOK_SECRET: "whsec_x", INBOUND_FORWARD_TO: "owner@gmail.com" });
    assert.ok(!r.ok);
    assert.match(r.reason, /RESEND_INBOUND_API_KEY/);
  });

  it("names each missing value", () => {
    const r = inboundConfig({ RESEND_API_KEY: "re_1" });
    assert.ok(!r.ok);
    assert.match(r.reason, /RESEND_WEBHOOK_SECRET/);
    assert.match(r.reason, /INBOUND_FORWARD_TO/);
    assert.doesNotMatch(r.reason, /RESEND_API_KEY/);
  });

  it("takes several comma-separated targets", () => {
    const r = inboundConfig({ ...full, INBOUND_FORWARD_TO: "a@gmail.com, b@gmail.com," });
    assert.ok(r.ok);
    assert.deepEqual(r.config.forwardTo, ["a@gmail.com", "b@gmail.com"]);
  });

  it("refuses a target on our own domain, which would loop", () => {
    const r = inboundConfig({ ...full, INBOUND_FORWARD_TO: "me@gmail.com, enquiries@africannewsfeed.news" });
    assert.ok(!r.ok);
    assert.match(r.reason, /loop/);
  });
});

describe("forwardReceivedEmail", () => {
  it("forwards a plain message with the sender in Reply-To", async () => {
    const { client, sent } = fakeClient({});
    const out = await forwardReceivedEmail(client, config, event());
    assert.deepEqual(out, { status: "forwarded", id: "out_1", attachments: "none" });
    assert.equal(sent.length, 1);
    const p = sent[0].payload;
    assert.equal(p.from, config.from);
    assert.deepEqual(p.to, ["owner@gmail.com"]);
    assert.equal(p.replyTo, "Ada <ada@example.com>");
    assert.equal(p.subject, "[enquiries] Hello");
    assert.match(String(p.text), /^From: Ada <ada@example.com>\nTo: enquiries@africannewsfeed\.news\n/);
    assert.match(String(p.text), /Plain body$/);
    assert.equal(p.html, undefined);
    assert.equal(p.attachments, undefined);
    assert.equal(sent[0].options?.idempotencyKey, "inbound-forward-em_1");
  });

  it("tags the subject with the mailbox the message was sent to", async () => {
    const { client, sent } = fakeClient({ received: { to: ["Advertise@africannewsfeed.news"], subject: "Rates" } });
    await forwardReceivedEmail(client, config, event());
    assert.equal(sent[0].payload.subject, "[advertise] Rates");
  });

  it("uses the message's own Reply-To when it has one", async () => {
    const { client, sent } = fakeClient({ received: { reply_to: ["press@example.org"] } });
    await forwardReceivedEmail(client, config, event());
    assert.deepEqual(sent[0].payload.replyTo, ["press@example.org"]);
  });

  it("copes with a message that has no subject and no text part", async () => {
    const { client, sent } = fakeClient({ received: { subject: "", text: null } });
    await forwardReceivedEmail(client, config, event());
    assert.equal(sent[0].payload.subject, "[enquiries] (no subject)");
    assert.match(String(sent[0].payload.text), /no plain text version/);
  });

  it("keeps the HTML part and escapes the header fields placed in front of it", async () => {
    const { client, sent } = fakeClient({
      received: { from: '"<script>alert(1)</script>" <ada@example.com>', html: "<p>Hi <b>there</b></p>" },
    });
    await forwardReceivedEmail(client, config, event());
    const html = String(sent[0].payload.html);
    assert.ok(html.endsWith("<p>Hi <b>there</b></p>"));
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
  });

  it("attaches files by link and marks only inline images with a content id", async () => {
    const { client, sent, calls } = fakeClient({
      received: { attachments: [{ id: "a1" }, { id: "a2" }] },
      attachments: [
        { id: "a1", filename: "rates.pdf", content_type: "application/pdf", content_disposition: "attachment", content_id: "ignored", download_url: "https://files.example/a1" },
        { id: "a2", filename: "logo.png", content_type: "image/png", content_disposition: "inline", content_id: "logo1", download_url: "https://files.example/a2" },
      ],
    });
    const out = await forwardReceivedEmail(client, config, event());
    assert.equal(out.status === "forwarded" && out.attachments, "attached");
    assert.equal(calls.list, 1);
    assert.deepEqual(sent[0].payload.attachments, [
      { filename: "rates.pdf", path: "https://files.example/a1", contentType: "application/pdf", contentId: undefined },
      { filename: "logo.png", path: "https://files.example/a2", contentType: "image/png", contentId: "logo1" },
    ]);
  });

  it("does not list attachments for a message without any", async () => {
    const { client, calls } = fakeClient({});
    await forwardReceivedEmail(client, config, event());
    assert.equal(calls.list, 0);
  });

  it("sends again without the files when Resend refuses them, and names them", async () => {
    const { client, sent } = fakeClient({
      received: { attachments: [{ id: "a1" }] },
      attachments: [{ id: "a1", filename: "huge.zip", content_type: "application/zip", content_disposition: "attachment", download_url: "https://files.example/a1" }],
      sendResults: [{ statusCode: 422, message: "too large" }, { id: "out_2" }],
    });
    const out = await forwardReceivedEmail(client, config, event());
    assert.deepEqual(out, { status: "forwarded", id: "out_2", attachments: "listed" });
    assert.equal(sent.length, 2);
    assert.equal(sent[1].payload.attachments, undefined);
    assert.match(String(sent[1].payload.text), /huge\.zip/);
    assert.equal(sent[1].options?.idempotencyKey, "inbound-forward-em_1-no-attachments");
  });

  it("does not send a second copy when the first failed in a way that may have gone through", async () => {
    const { client, sent } = fakeClient({
      received: { attachments: [{ id: "a1" }] },
      attachments: [{ id: "a1", filename: "a.pdf", content_type: "application/pdf", content_disposition: "attachment", download_url: "https://files.example/a1" }],
      sendResults: [{ statusCode: 500, message: "boom" }],
    });
    await assert.rejects(forwardReceivedEmail(client, config, event()), /500: boom/);
    assert.equal(sent.length, 1);
  });

  it("throws when the message cannot be read, so the event is retried", async () => {
    const { client, sent } = fakeClient({ getError: { message: "not found", statusCode: 404 } });
    await assert.rejects(forwardReceivedEmail(client, config, event()), /404: not found/);
    assert.equal(sent.length, 0);
  });

  it("points at the key's permissions when Resend refuses to let it read mail", async () => {
    const { client } = fakeClient({
      getError: { message: "This API key is restricted to only send emails", statusCode: 401 },
    });
    await assert.rejects(forwardReceivedEmail(client, config, event()), /401: .*restricted.*full-access key/);
  });

  it("throws when the send fails", async () => {
    const { client } = fakeClient({ sendResults: [{ statusCode: 503, message: "down" }] });
    await assert.rejects(forwardReceivedEmail(client, config, event()), /503: down/);
  });

  it("ignores mail from our own domain without calling Resend", async () => {
    const { client, sent, calls } = fakeClient({});
    const out = await forwardReceivedEmail(
      client,
      config,
      event({ from: "AfricaNews inbound <inbound@notifications.africannewsfeed.news>" }),
    );
    assert.equal(out.status, "ignored");
    assert.equal(calls.get, 0);
    assert.equal(sent.length, 0);
  });
});
