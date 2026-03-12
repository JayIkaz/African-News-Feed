# Workspace

## Overview

**AfricaNews** — A pan-African news aggregation platform that automatically collects, categorises, and displays articles from 35+ major newspapers across Africa's top economies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **RSS ingestion**: Built-in Node.js fetch-based RSS parser

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── african-news/       # React + Vite frontend (serves at /)
│   └── api-server/         # Express API server (serves at /api)
│       └── src/lib/ingestion.ts  # RSS ingestion + scheduler
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── sources.ts  # News sources table
│           └── articles.ts # Articles table
├── scripts/src/
│   └── seed-sources.ts     # Seeds 35 African news sources
```

## News Sources (35 total across 15 countries)

Nigeria (5), South Africa (4), Kenya (3), Egypt (2), Ghana (3), Morocco (2),
Ethiopia (2), Tanzania (2), Uganda (2), Algeria (1), Zimbabwe (2), Angola (1),
Ivory Coast (1), Tunisia (2), Senegal (1), Rwanda (1), Cameroon (1)

## Key Features

- **Auto ingestion**: RSS feeds polled on startup and every 60 minutes
- **AI categorization**: Articles auto-classified into Politics, Business, Technology, Economy, Society, Environment, International
- **Country/category filters**: Filter articles by country or topic
- **Search**: Full-text search across titles, summaries, countries, categories
- **Top Stories**: Featured articles section
- **Trending**: Most recent articles surfaced prominently
- **Deduplication**: URL-based deduplication via unique constraint

## API Endpoints

- `GET /api/articles` — paginated list with country/category/source filters
- `GET /api/articles/trending` — trending articles
- `GET /api/articles/top-stories` — top featured articles
- `GET /api/articles/:id` — single article
- `GET /api/search?q=...` — full-text search
- `GET /api/sources` — all news sources
- `GET /api/countries` — countries with article counts
- `GET /api/categories` — categories with article counts
- `POST /api/ingestion/trigger` — manually trigger ingestion
- `GET /api/ingestion/status` — ingestion health per source

## Database Schema

### sources
id, name, country, homepage, rss_url, is_active, last_fetched, articles_fetched, fetch_status

### articles
id, title, summary, author, source_id, country, category, published_date, url, ai_summary, created_at

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`
- `pnpm --filter @workspace/scripts run seed-sources` — seed news sources
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client/Zod schemas
