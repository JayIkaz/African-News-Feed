# African News Feed

Headlines from African news publishers in one place, newest first, with a link to the publisher for every story. Live at [www.africannewsfeed.news](https://www.africannewsfeed.news).

The site does not write, edit or rank the news. A scheduled job reads each publisher's public RSS feed and stores the headline, a short summary, a thumbnail link, the publication time and the story's URL. Readers click through to the publisher for the full story, and the stories stay the publishers' own.

## What it does

- Collects stories from publishers' RSS feeds into Postgres and assigns each one a category (Politics, Business, Technology, Economy, Society, Environment, International, or General) with a weighted keyword classifier.
- Lets readers browse by section, country or publisher, and search across stories.
- Detects the language of each story (English, French, Portuguese or Arabic) and offers an English machine translation on request, through DeepL, when `DEEPL_API_KEY` is set. Translations are cached in the database.
- Takes newsletter sign-ups and sends a welcome email through Resend.
- Serves share pages for social and search crawlers (`/api/share/article/:id`, reached through a user-agent rewrite in `artifacts/african-news/vercel.json`) and a sitemap.

The publisher list is the `sources` table, shown on the site's Sources page. `artifacts/api-server/src/lib/seeds.ts` only fills an empty database with a starting list.

## Repository layout

This is a pnpm workspace.

| Path | What it is |
| --- | --- |
| `artifacts/african-news` | The website. React 19, Vite, Tailwind CSS 4, wouter and TanStack Query. |
| `artifacts/api-server` | The Express 5 API and the ingestion job. |
| `artifacts/africa-news-mobile` | An Expo app. Its scripts read `REPLIT_*` variables, so they assume a Replit environment. |
| `lib/db` | Drizzle schema and database connection. |
| `lib/api-spec` | The OpenAPI spec, and the Orval config that generates `lib/api-zod` and `lib/api-client-react`. |
| `scripts` | The publisher seed script, the repository checks and their tests. |

## How it runs in production

The website and the API are two Vercel projects. The API runs as a serverless function (`artifacts/api-server/api/index.js`), and the website is built with `VITE_API_ORIGIN` pointing at it.

Ingestion does not run on Vercel. The workflow `.github/workflows/ingest.yml` runs `pnpm --filter @workspace/api-server run ingest` on a 15-minute cron and on manual dispatch, and needs a `DATABASE_URL` repository secret. A scheduled run stops at once if any publisher was fetched in the last 25 minutes. GitHub does not guarantee when scheduled runs start, so the real cadence is lower than the cron suggests; the comments in the workflow record what was measured.

## Running it locally

You need Node 24 and pnpm 10, the versions CI uses.

```sh
pnpm install
```

### Website only

```sh
pnpm --filter @workspace/african-news run dev
```

This serves http://localhost:3000. In development Vite proxies `/api` to the deployed API, so no database is needed.

### Website and API with your own database

Run each long-lived command in its own terminal. The API and the website both default to port 3000, so the API needs `PORT`.

```sh
export DATABASE_URL=postgresql://user:password@localhost:5432/anf

# Create the tables
pnpm --filter @workspace/db run push

# API on port 8080. It seeds the publisher list if the table is empty.
PORT=8080 pnpm --filter @workspace/api-server run dev

# Website, proxying /api to your local API
DEV_API_PROXY=http://localhost:8080 pnpm --filter @workspace/african-news run dev

# Fetch stories from the publishers' feeds (needs internet access)
pnpm --filter @workspace/api-server run ingest
```

To regenerate the API client and schemas after editing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`.

## Environment variables

`.env.example` has the same list with comments.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | API, ingestion, `db push` | Postgres connection string. Required. |
| `PORT` | API, website dev server | Port to listen on. Both default to 3000. |
| `ADMIN_TOKEN` | API | Shared secret for `POST /api/ingestion/trigger` and `POST /api/ingestion/backfill-images`. |
| `RESEND_API_KEY`, `NEWSLETTER_SECRET` | API | Both are needed to send welcome emails. The secret signs the unsubscribe links. Sign-up works without them, and no email is sent. |
| `NEWSLETTER_FROM` | API | Optional sender address for newsletter email. |
| `DEEPL_API_KEY` | API | Optional. Turns on translation. Keys ending in `:fx` use DeepL's free host. |
| `ALLOWED_ORIGINS` | API | Extra CORS origins, comma-separated. The production domains are built in. |
| `ENABLE_IN_PROCESS_INGESTION` | API | Set to `1` to run an hourly ingestion timer inside a long-lived server. Production uses the GitHub workflow instead. |
| `INGEST_MIN_INTERVAL_MINUTES` | Ingestion | Skip the run if any publisher was fetched more recently than this. |
| `VITE_API_ORIGIN` | Website build | Absolute origin of the API. Leave it unset in development. |
| `DEV_API_PROXY` | Website dev server | Where Vite proxies `/api`. Defaults to the deployed API. |

Inbound mail forwarding has its own variables, described in [`artifacts/api-server/docs/inbound-mail.md`](artifacts/api-server/docs/inbound-mail.md).

## Checks

CI (`.github/workflows/ci.yml`) runs these four on every pull request:

```sh
pnpm run typecheck
pnpm --filter @workspace/api-server run test
pnpm run test:scripts
pnpm run check:inline-styles
```

The last one holds the number of inline `style={{ ... }}` uses to a budget. [`styling.md`](artifacts/african-news/docs/styling.md) explains why and how to update it.

## More documentation

- [`artifacts/african-news/docs/styling.md`](artifacts/african-news/docs/styling.md): how to style the website.
- [`artifacts/african-news/docs/news-feed-design-spec.md`](artifacts/african-news/docs/news-feed-design-spec.md) and [`spec-deltas.md`](artifacts/african-news/docs/spec-deltas.md): the visual design spec and where the build departs from it.
- [`artifacts/african-news/docs/brand/README.md`](artifacts/african-news/docs/brand/README.md): the logo and brand assets.
- [`artifacts/african-news/src/assets/fonts/README.md`](artifacts/african-news/src/assets/fonts/README.md): the bundled fonts, where they came from and how to add a subset.
- [`artifacts/api-server/docs/inbound-mail.md`](artifacts/api-server/docs/inbound-mail.md): how mail sent to the site's addresses is forwarded.

## Third-party assets

- Bitter and Libre Franklin are licensed under the SIL Open Font License 1.1. The licence files are in `artifacts/african-news/src/assets/fonts/`.
- Country flags come from the `flag-icons` package and are MIT licensed. See `artifacts/african-news/public/flags/LICENSE`.

## Who runs it

African News Feed is operated by Auvane Limited, trading as Aukizan. Publishers who want a source removed, corrected or added can use the contact address on the site's [About page](https://www.africannewsfeed.news/about).
