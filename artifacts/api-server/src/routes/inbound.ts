import express, { Router } from "express";
import { Resend } from "resend";
import { forwardReceivedEmail, inboundConfig, type MailClient } from "../lib/inboundForward";

export interface InboundDeps {
  makeClient: (apiKey: string) => MailClient & Pick<Resend, "webhooks">;
}

function header(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

// Receives Resend's "email.received" webhook and forwards the message.
//
// The signature is computed over the exact bytes Resend sent, so this router
// reads the body raw. It has to be mounted before the app's JSON parser, which
// would otherwise consume the body first (see app.ts).
export function createInboundRouter(deps: InboundDeps = { makeClient: (key) => new Resend(key) }) {
  const router = Router();

  router.post("/resend", express.raw({ type: () => true, limit: "1mb" }), async (req, res) => {
    const result = inboundConfig();
    if (!result.ok) {
      // 503 and not 200: Resend keeps retrying, so mail is not lost while the
      // settings are being completed.
      console.warn(`[inbound] forwarding is off: ${result.reason}`);
      res.status(503).json({ error: "not_configured" });
      return;
    }
    const { config } = result;

    if (!Buffer.isBuffer(req.body)) {
      console.error("[inbound] no raw body reached the handler");
      res.status(400).json({ error: "no_body" });
      return;
    }

    const client = deps.makeClient(config.apiKey);
    let event: ReturnType<typeof client.webhooks.verify>;
    try {
      event = client.webhooks.verify({
        payload: req.body.toString("utf8"),
        headers: {
          id: header(req.headers["svix-id"]),
          timestamp: header(req.headers["svix-timestamp"]),
          signature: header(req.headers["svix-signature"]),
        },
        webhookSecret: config.webhookSecret,
      });
    } catch {
      res.status(401).json({ error: "invalid_signature" });
      return;
    }

    if (event.type !== "email.received") {
      res.json({ ok: true, ignored: event.type });
      return;
    }

    try {
      // Awaited: a serverless function is frozen once the response is sent,
      // so work started and left running can be dropped.
      const outcome = await forwardReceivedEmail(client, config, event);
      console.log(`[inbound] ${event.data.email_id}: ${outcome.status}`);
      res.json({ ok: true, ...outcome });
    } catch (err) {
      console.error("[inbound] forward failed:", err);
      res.status(500).json({ error: "forward_failed" });
    }
  });

  return router;
}

export default createInboundRouter();
