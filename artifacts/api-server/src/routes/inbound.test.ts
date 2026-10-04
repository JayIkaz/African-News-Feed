import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import express from "express";
import { Resend } from "resend";
import type { MailClient } from "../lib/inboundForward";
import { createInboundRouter } from "./inbound";

const SECRET = "whsec_" + Buffer.from("test-signing-secret-of-24b").toString("base64");

// Signs the way Resend does (Svix): HMAC-SHA256 over "id.timestamp.body".
function sign(id: string, timestamp: string, body: string, secret = SECRET): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  return "v1," + createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
}

function signedHeaders(body: string, over: { timestamp?: string; secret?: string } = {}) {
  const id = "msg_test_1";
  const timestamp = over.timestamp ?? String(Math.floor(Date.now() / 1000));
  return {
    "content-type": "application/json",
    "svix-id": id,
    "svix-timestamp": timestamp,
    "svix-signature": sign(id, timestamp, body, over.secret),
  };
}

const received = JSON.stringify({
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
  },
});

const ENV_KEYS = ["RESEND_API_KEY", "RESEND_WEBHOOK_SECRET", "INBOUND_FORWARD_TO", "INBOUND_FORWARD_FROM"] as const;
let saved: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {};

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  process.env.RESEND_API_KEY = "re_test";
  process.env.RESEND_WEBHOOK_SECRET = SECRET;
  process.env.INBOUND_FORWARD_TO = "owner@gmail.com";
  delete process.env.INBOUND_FORWARD_FROM;
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

async function listen(app: express.Express): Promise<{ url: string; close: () => Promise<void> }> {
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}/api/inbound/resend`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

// The real Resend object verifies signatures; only the calls that would reach
// the network are replaced.
function clientWith(send: (payload: Record<string, unknown>) => unknown) {
  const real = new Resend("re_test");
  return {
    webhooks: real.webhooks,
    emails: {
      send: async (payload: Record<string, unknown>) => send(payload),
      receiving: {
        get: async () => ({
          data: {
            to: ["enquiries@africannewsfeed.news"],
            from: "Ada <ada@example.com>",
            cc: null,
            reply_to: null,
            subject: "Hello",
            created_at: "2026-10-04T09:45:33.716Z",
            text: "Plain body",
            html: null,
            attachments: [],
          },
          error: null,
        }),
        attachments: { list: async () => ({ data: { data: [] }, error: null }) },
      },
    },
  } as unknown as MailClient & Pick<Resend, "webhooks">;
}

describe("POST /api/inbound/resend", () => {
  const sends: Record<string, unknown>[] = [];
  let sendResult: unknown;
  let srv: { url: string; close: () => Promise<void> };

  before(() => {
    // Silence the expected warnings and errors in the test output.
    console.warn = () => {};
    console.error = () => {};
    console.log = () => {};
  });

  beforeEach(async () => {
    sends.length = 0;
    sendResult = { data: { id: "out_1" }, error: null };
    const app = express();
    app.use(
      "/api/inbound",
      createInboundRouter({
        makeClient: () =>
          clientWith((payload) => {
            sends.push(payload);
            return sendResult;
          }),
      }),
    );
    srv = await listen(app);
  });

  afterEach(async () => {
    await srv.close();
  });

  const post = (body: string, headers: Record<string, string>) =>
    fetch(srv.url, { method: "POST", headers, body });

  it("forwards a correctly signed email.received event", async () => {
    const res = await post(received, signedHeaders(received));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, status: "forwarded", id: "out_1", attachments: "none" });
    assert.equal(sends.length, 1);
    assert.deepEqual(sends[0].to, ["owner@gmail.com"]);
  });

  it("accepts a body whose bytes differ from re-serialised JSON, as real payloads can", async () => {
    const spaced = JSON.stringify(JSON.parse(received), null, 2);
    const res = await post(spaced, signedHeaders(spaced));
    assert.equal(res.status, 200);
  });

  it("rejects a bad signature", async () => {
    const headers = signedHeaders(received);
    headers["svix-signature"] = "v1," + Buffer.from("not the right signature at all").toString("base64");
    const res = await post(received, headers);
    assert.equal(res.status, 401);
    assert.equal(sends.length, 0);
  });

  it("rejects a body that was changed after signing", async () => {
    const res = await post(received.replace("Hello", "Hullo"), signedHeaders(received));
    assert.equal(res.status, 401);
    assert.equal(sends.length, 0);
  });

  it("rejects a payload signed with a different secret", async () => {
    const other = "whsec_" + Buffer.from("another-secret-another-secret").toString("base64");
    const res = await post(received, signedHeaders(received, { secret: other }));
    assert.equal(res.status, 401);
  });

  it("rejects a signed payload that is too old to be fresh, so a captured one cannot be replayed", async () => {
    const old = String(Math.floor(Date.now() / 1000) - 3600);
    const res = await post(received, signedHeaders(received, { timestamp: old }));
    assert.equal(res.status, 401);
    assert.equal(sends.length, 0);
  });

  it("rejects a request with no signature headers", async () => {
    const res = await post(received, { "content-type": "application/json" });
    assert.equal(res.status, 401);
  });

  it("answers 503 and sends nothing while the settings are incomplete", async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    const res = await post(received, signedHeaders(received));
    assert.equal(res.status, 503);
    assert.equal(sends.length, 0);
  });

  it("answers 503 when the forward target is on our own domain", async () => {
    process.env.INBOUND_FORWARD_TO = "enquiries@africannewsfeed.news";
    const res = await post(received, signedHeaders(received));
    assert.equal(res.status, 503);
    assert.equal(sends.length, 0);
  });

  it("acknowledges other event types without forwarding", async () => {
    const other = JSON.stringify({ type: "email.delivered", created_at: "2026-10-04T09:45:33.716Z", data: {} });
    const res = await post(other, signedHeaders(other));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, ignored: "email.delivered" });
    assert.equal(sends.length, 0);
  });

  it("answers 500 when forwarding fails, so Resend retries", async () => {
    sendResult = { data: null, error: { statusCode: 500, message: "boom" } };
    const res = await post(received, signedHeaders(received));
    assert.equal(res.status, 500);
    assert.deepEqual(await res.json(), { error: "forward_failed" });
  });
});

// The same checks through the real application, which is where the JSON parser
// sits. A raw body that reached the handler intact proves the route is mounted
// ahead of it.
describe("POST /api/inbound/resend through the application", () => {
  let srv: { url: string; close: () => Promise<void> };

  before(async () => {
    process.env.DATABASE_URL ??= "postgres://test:test@127.0.0.1:1/test";
    console.warn = () => {};
    console.error = () => {};
    console.log = () => {};
    const { default: app } = await import("../app");
    srv = await listen(app);
  });

  after(async () => {
    await srv.close();
  });

  it("verifies the signature over the untouched body", async () => {
    const other = JSON.stringify({ type: "email.delivered", created_at: "2026-10-04T09:45:33.716Z", data: {} });
    const ok = await fetch(srv.url, { method: "POST", headers: signedHeaders(other), body: other });
    assert.equal(ok.status, 200);
    assert.deepEqual(await ok.json(), { ok: true, ignored: "email.delivered" });

    const forged = await fetch(srv.url, {
      method: "POST",
      headers: signedHeaders(other, { secret: "whsec_" + Buffer.from("forged-forged-forged").toString("base64") }),
      body: other,
    });
    assert.equal(forged.status, 401);
  });

  it("still parses JSON on the other routes", async () => {
    const res = await fetch(srv.url.replace("/inbound/resend", "/newsletter/subscribe"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });
    assert.equal(res.status, 400);
    assert.equal(((await res.json()) as { error: string }).error, "invalid_email");
  });
});
