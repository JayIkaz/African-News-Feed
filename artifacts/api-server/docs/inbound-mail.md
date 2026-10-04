# Inbound mail forwarding

Mail sent to the site's addresses (`enquiries@`, `advertise@`) is received by
Resend. `POST /api/inbound/resend` is the webhook that copies each message to a
personal inbox.

## How it works

1. Resend receives a message and sends an `email.received` event to the webhook.
2. The route checks the Svix signature over the raw request body. A bad
   signature gets 401 and nothing is forwarded.
3. It fetches the full message from Resend (the event carries no body) and sends
   a copy from `inbound@notifications.africannewsfeed.news` to
   `INBOUND_FORWARD_TO`.
4. The copy has the subject `[enquiries] original subject`, a header block with
   the original sender, recipients and date, and the sender in `Reply-To`.
   Attachments are sent as attachments. If Resend refuses the attachments, the
   copy goes without them and names them.
5. If anything fails the route answers 5xx and Resend delivers the event again.
   A repeat does not send a second copy: each send carries an idempotency key
   built from the received email's id (Resend honours it for 24 hours).

Replying to the copy answers the sender from the reader's own address, not from
`enquiries@`. To answer as `enquiries@`, reply from the Resend inbox.

## Settings (Vercel, API project)

| Name | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Already set for the welcome email. Used to read received mail and to send the copy. |
| `RESEND_WEBHOOK_SECRET` | Signing secret of the webhook, from the Resend dashboard (starts `whsec_`). |
| `INBOUND_FORWARD_TO` | Where copies go. One address or several, comma-separated. An address on africannewsfeed.news is refused, because the copy would be received and forwarded again. |
| `INBOUND_FORWARD_FROM` | Optional. Sender of the copy. Must be on a verified Resend domain. |

Until all three required values are set the route answers 503 and forwards
nothing. Resend retries, so mail received in that time is still forwarded once
the settings are complete, within the retry window.

## Resend webhook

Event `email.received`, endpoint `<api host>/api/inbound/resend`. A failed
delivery can be replayed from the webhook's event log in the Resend dashboard.

## Tests

`pnpm --filter @workspace/api-server test`. The route tests sign payloads the
way Resend does and run them through the real application, so they fail if the
route is ever mounted behind the JSON parser.
