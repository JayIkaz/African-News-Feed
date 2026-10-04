# Inbound mail forwarding

Mail sent to the site's addresses (`enquiries@`, `advertise@`) is received by
Resend. `POST /api/inbound/resend` is the webhook that copies each message to a
personal inbox.

## How it works

1. Resend receives a message and sends an `email.received` event to the webhook.
2. The route checks the Svix signature over the raw request body. A bad
   signature gets 401 and nothing is forwarded.
3. It fetches the full message from Resend (the event carries no body) and sends
   a copy to `INBOUND_FORWARD_TO`. The copy comes from the mailbox it was sent
   to, on the verified sending subdomain: a message to `enquiries@` arrives from
   `AfricaNews enquiries <enquiries@notifications.africannewsfeed.news>`, one to
   `advertise@` from `advertise@notifications...`. The mailbox name is reduced
   to plain address characters, a `+tag` is dropped, and `inbound` is used when
   none of the recipients is on our domain.
4. The copy keeps the subject exactly as the sender wrote it (`(no subject)` if
   it had none), so a reply reads `Re: original subject`. It has a header block
   with the original sender, recipients and date, and the sender in `Reply-To`.
   Attachments are sent as attachments. If Resend refuses the attachments, the
   copy goes without them and names them.
5. If anything fails the route answers 5xx and Resend delivers the event again.
   A repeat does not send a second copy: each send carries an idempotency key
   built from the received email's id (Resend honours it for 24 hours).

Replying to the copy answers the sender, using `Reply-To`. Which address the
reply is sent from is chosen in Gmail's From line; once "Send mail as" is set up
for `enquiries@`, pick it there. Because the mailbox is in the sender address and
not the subject, a Gmail filter on `from:enquiries@notifications.africannewsfeed.news`
can label each mailbox.

## Settings (Vercel, API project)

| Name | Purpose |
| --- | --- |
| `RESEND_INBOUND_API_KEY` | A **full-access** Resend key. Reading a received message needs it; a send-only key is refused with a 401. Kept separate from the welcome email's send-only key so the public newsletter path holds no more access than it needs. |
| `RESEND_API_KEY` | Fallback when `RESEND_INBOUND_API_KEY` is not set, so one full-access key can serve both. A send-only key here fails at the read step. |
| `RESEND_WEBHOOK_SECRET` | Signing secret of the webhook, from the Resend dashboard (starts `whsec_`). |
| `INBOUND_FORWARD_TO` | Where copies go. One address or several, comma-separated. An address on africannewsfeed.news is refused, because the copy would be received and forwarded again. |
| `INBOUND_FORWARD_FROM` | Optional. A fixed sender for every copy, which replaces the per-mailbox sender. Must be on a verified Resend domain. |

Until a key, the signing secret and `INBOUND_FORWARD_TO` are all set the route answers 503 and forwards
nothing. Resend retries, so mail received in that time is still forwarded once
the settings are complete, within the retry window.

## Resend webhook

Event `email.received`, endpoint `<api host>/api/inbound/resend`. A failed
delivery can be replayed from the webhook's event log in the Resend dashboard.

## Tests

`pnpm --filter @workspace/api-server test`. The route tests sign payloads the
way Resend does and run them through the real application, so they fail if the
route is ever mounted behind the JSON parser.
