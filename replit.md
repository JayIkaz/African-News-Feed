# Workspace

## Overview

**AfricaNews** — A premium pan-African news aggregation platform that automatically collects, categorises, and displays articles from 65+ trusted newspapers across 25+ African countries.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 18 + Vite (inline CSS design system, warm editorial palette)
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
│   ├── african-news/               # React + Vite frontend (serves at /)
│   │   └── src/
│   │       ├── index.css           # Design system: warm paper palette, animations
│   │       ├── index.html          # Fonts: Playfair Display, Source Serif 4, DM Sans
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── Navbar.tsx          # Globe logo, search, dropdown countries
│   │       │   │   ├── Footer.tsx          # 4-col dark footer, newsletter form
│   │       │   │   ├── BreakingTicker.tsx  # Animated scrolling ticker
│   │       │   │   └── AppLayout.tsx       # Wraps Navbar + Footer
│   │       │   ├── article/
│   │       │   │   ├── ArticleCard.tsx     # 4 variants: standard, featured, side, compact
│   │       │   │   └── Sidebar.tsx         # Trending widget + region map + newsletter
│   │       │   └── ads/
│   │       │       └── AdBanner.tsx        # Ad slot component
│   │       └── pages/
│   │           ├── Home.tsx        # Stats strip + hero grid + category pills + 3-col grid
│   │           ├── Category.tsx    # Dark hero + 3-col grid + sidebar
│   │           ├── ArticleDetail.tsx
│   │           ├── Countries.tsx
│   │           ├── Search.tsx
│   │           ├── Advertise.tsx
│   │           └── ApiAccess.tsx
│   └── api-server/                 # Express API server (serves at /api)
│       └── src/
│           ├── lib/
│           │   ├── ingestion.ts    # RSS ingestion + 60-min scheduler + upsert
│           │   ├── classifier.ts   # Weighted keyword category classifier
│           │   ├── seeds.ts        # 65+ sources across 25+ countries
│           │   └── unsplash.ts     # Fallback image lookup
│           └── routes/
│               ├── articles.ts     # GET /articles, /trending, /top-stories, /:id
│               ├── categories.ts   # GET /categories
│               ├── countries.ts    # GET /countries
│               ├── sources.ts      # GET /sources
│               ├── search.ts       # GET /search
│               ├── newsletter.ts   # POST /newsletter/subscribe
│               └── ingestion.ts    # POST /ingestion/trigger, GET /ingestion/status
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks (useListArticles, etc.)
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── sources.ts          # News sources table
│           ├── articles.ts         # Articles table (with category + imageUrl)
│           └── newsletter.ts       # Newsletter subscribers table
```

## Design System

**Warm editorial palette** (defined in `index.css`):
- `--paper: #faf9f6` — page background
- `--paper-2: #f3f1ec`, `--paper-3: #e8e5de`
- `--ink: #0f0e0d` — headings
- `--ink-2: #2c2b29`, `--ink-3: #5a5750`, `--ink-4: #9a978f`
- `--accent: #c1392b` — red accent

**Fonts:**
- `var(--font-serif)` — Playfair Display (headings)
- `var(--font-article)` — Source Serif 4 (article body)
- `var(--font-sans)` — DM Sans (UI)

**Category colors:** Politics #c1392b, Business #1a5276, Technology #1a7a6e, Economy #b8860b, Society #6b3fa0, Environment #2d6a4f, International #8b4513

## News Sources (65+ across 25+ countries)

Nigeria, South Africa, Kenya, Egypt, Ghana, Morocco, Ethiopia, Tanzania, Uganda, Algeria, Zimbabwe, Angola, Ivory Coast, Tunisia, Senegal, Rwanda, Cameroon, DR Congo, Mozambique, Botswana, Namibia, Sudan, Somalia, Zambia, Malawi, Liberia, Libya, Burundi, South Sudan, Eswatini, Lesotho

## Key Features

- **Auto ingestion**: RSS feeds polled on startup and every 60 minutes
- **Category classifier**: Weighted keyword matching → 8 categories
- **Breaking ticker**: Animated scrolling latest headlines
- **Hero grid**: Featured (large left) + 2 side cards (right column)
- **Category pills**: Inline filter (no routing) with emoji icons
- **Sidebar**: Trending #1–5, Region article counts, Newsletter signup
- **Monetization**: `/advertise` + `/api-access` pages; ad banner slots
- **Newsletter**: DB subscriber table + POST `/api/newsletter/subscribe`; welcome email via Resend (RESEND_API_KEY secret; sends from `onboarding@resend.dev` — add a verified domain in Resend dashboard to use a custom from address)
- **Countries dropdown**: 5-column Navbar dropdown by region
- **Pagination**: Page-based with smooth scroll-to-top

## API Endpoints

- `GET /api/articles?page&limit&category&country`
- `GET /api/articles/trending?limit`
- `GET /api/articles/top-stories?limit`
- `GET /api/articles/:id`
- `GET /api/search?q&limit`
- `GET /api/categories`
- `GET /api/countries`
- `GET /api/sources`
- `POST /api/newsletter/subscribe`
- `POST /api/ingestion/trigger`
- `GET /api/ingestion/status`
