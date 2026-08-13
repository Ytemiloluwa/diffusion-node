<div align="center">
  <img src="./docs/assets/diffusion-node-logo.svg" alt="Diffusion Node logo" width="132" />

  <h1>Diffusion Node</h1>

  <p>
    Export-control intelligence for semiconductor, AI, and policy teams.
  </p>

  <p>
    <a href="./package.json"><img alt="version" src="https://img.shields.io/badge/version-v1.0.0-0A84FF?style=flat-square&labelColor=374151"></a>
    <a href="https://github.com/Ytemiloluwa/diffusion-node/actions/workflows/ci-lint-typecheck.yml"><img alt="lint and typecheck" src="https://github.com/Ytemiloluwa/diffusion-node/actions/workflows/ci-lint-typecheck.yml/badge.svg"></a>
    <a href="https://github.com/Ytemiloluwa/diffusion-node/actions/workflows/ci-test.yml"><img alt="test" src="https://github.com/Ytemiloluwa/diffusion-node/actions/workflows/ci-test.yml/badge.svg"></a>
    <a href="https://github.com/Ytemiloluwa/diffusion-node/actions/workflows/ci-e2e.yml"><img alt="e2e" src="https://github.com/Ytemiloluwa/diffusion-node/actions/workflows/ci-e2e.yml/badge.svg"></a>
    <img alt="node" src="https://img.shields.io/badge/node-v24.14.0-339933?style=flat-square&labelColor=374151">
    <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&labelColor=374151"></a>
    <img alt="open source" src="https://img.shields.io/badge/open_source-ready-14B8A6?style=flat-square&labelColor=374151">
  </p>

  <p>
    <a href="#features">Features</a> -
    <a href="#architecture">Architecture</a> -
    <a href="#getting-started">Getting Started</a> -
    <a href="#api-reference">API Reference</a> -
    <a href="#testing">Testing</a> -
    <a href="#troubleshooting">Troubleshooting</a> -
    <a href="#contributing">Contributing</a>
  </p>
</div>

## Overview

Diffusion Node is a full-stack policy intelligence workspace for tracking export-control rules, semiconductor restrictions, AI diffusion policy changes, affected companies, technologies, countries, source documents, and policy timelines.

The project combines a curated relational policy dataset, an Express and Prisma API, and a Next.js dashboard UI for exploring regulatory exposure across policies, companies, countries, technologies, and timeline events.

## Project Status

Diffusion Node is in active v1 development. The current application includes the core API, authenticated frontend workspace, curated seed data, route documentation, CI checks, and browser E2E coverage.

## Features

- Authenticated dashboard workspace with JWT login, refresh tokens, API key issuance, and user profile access.
- Policy explorer with cursor pagination and filters for search text, title, company, country, technology, year, source, and restriction type.
- Policy detail pages with sources, documents, jurisdictions, linked companies, linked technologies, and policy timelines.
- Country explorer with exposure metrics, restriction summaries, rankings, and a world choropleth map.
- Technology explorer for semiconductor and AI technology categories affected by policy controls.
- Company explorer for entity-list status, headquarters country, aliases, and policy exposure context.
- Global timeline view for sourced regulatory events and linked policy records.
- Developer settings screen for authenticated profile/session details.
- Swagger UI and OpenAPI documentation for the backend API.
- CI coverage for lint/typecheck, API/unit tests, frontend route smoke tests, and browser E2E auth flow.

## Architecture

```text
diffusion-node/
|-- src/                    # Express API, controllers, routes, middleware, OpenAPI docs
|-- prisma/                 # Prisma schema, migrations, curated seed data
|-- frontend/               # Next.js dashboard workspace
|-- tests/                  # Jest API/unit tests and route smoke coverage
|-- tests/e2e/              # Playwright browser E2E flows
|-- docs/assets/            # README and documentation assets
`-- .github/workflows/      # CI, E2E, and deploy workflows
```

### Backend

- Node.js
- Express 5
- Prisma 7
- PostgreSQL
- Zod validation
- JWT authentication
- Swagger UI / OpenAPI
- Jest and Supertest

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Axios
- Lucide icons
- D3 Geo, TopoJSON, and world-atlas for country exposure mapping
- Playwright for browser E2E coverage

### Data Model

Diffusion Node models policy intelligence as a relational graph:

- `Policy`, `PolicySource`, `Document`, `PolicyRevision`, `TimelineEvent`
- `TechnologyCategory`, `Technology`, `PolicyTechnology`
- `Company`, `PolicyCompany`
- `Country`, `RestrictionType`, `Jurisdiction`
- `User`, `ApiKey`

V1 uses manually curated seed data in `prisma/seed.ts`. This is intentional: every seeded policy is traceable to real source material such as Federal Register notices, BIS updates, GAO decisions, or official agency pages.

## Getting Started

### Prerequisites

- Node.js `24.14.0` recommended via `.nvmrc`
- npm
- PostgreSQL
- Git

The root `package.json` supports Node `>=20.9.0`, but the repository is currently pinned to Node `24.14.0` for local consistency.

### Install Dependencies

If you use `nvm`, load the pinned local runtime first:

```bash
nvm use
```

```bash
npm ci
```

### Configure Environment

Create a local `.env` file at the repository root. Do not commit it.

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/diffusion?schema=public"
PORT=3001
CORS_ORIGIN="http://127.0.0.1:3000"
JWT_SECRET="replace-with-a-long-local-access-secret"
JWT_REFRESH_SECRET="replace-with-a-long-local-refresh-secret"
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:3001/api/v1"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

Next.js reads the root `.env` through `frontend/next.config.ts`, so `NEXT_PUBLIC_API_BASE_URL` belongs in the root environment file or in the deployment environment.

### Prepare the Database

```bash
npm run prisma:generate
npx prisma migrate dev
npx prisma db seed
```

Open Prisma Studio when you want to inspect seeded data:

```bash
npx prisma studio
```

### Run Locally

Start the API:

```bash
npm run dev
```

Start the frontend in another terminal:

```bash
npm run frontend:dev -- --hostname 127.0.0.1 --port 3000
```

Local URLs:

- Frontend: `http://127.0.0.1:3000`
- API health check: `http://127.0.0.1:3001/health`
- Swagger UI: `http://127.0.0.1:3001/docs`
- API base URL: `http://127.0.0.1:3001/api/v1`

## API Reference

Interactive API documentation is available at `/docs` when the backend is running.

Core API routes:

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `POST` | `/api/v1/auth/register` | Register a user |
| `POST` | `/api/v1/auth/token` | Issue access and refresh credentials |
| `POST` | `/api/v1/auth/refresh` | Refresh access credentials |
| `GET` | `/api/v1/me` | Fetch the authenticated user profile |
| `GET` | `/api/v1/policies` | Search and paginate policy records |
| `GET` | `/api/v1/policies/:id` | Fetch one policy with relations |
| `GET` | `/api/v1/policies/:id/timeline` | Fetch a policy-specific timeline |
| `GET` | `/api/v1/timeline` | Fetch the global timeline |
| `GET` | `/api/v1/categories` | List technology categories |
| `GET` | `/api/v1/technologies` | List technologies |
| `GET` | `/api/v1/companies` | List companies |
| `GET` | `/api/v1/countries` | List countries |
| `GET` | `/api/v1/restrictions` | List restriction types |
| `GET` | `/api/v1/sources` | List policy sources |

## Frontend Routes

| Route | Screen |
| --- | --- |
| `/` | Dashboard |
| `/auth` | Login and registration |
| `/policies` | Policy Explorer |
| `/policies/[id]` | Policy Detail and Timeline |
| `/companies` | Company Explorer |
| `/countries` | Country Explorer |
| `/technologies` | Technology Explorer |
| `/timeline` | Global Timeline |
| `/developer/settings` | Developer Settings |

## Testing

Run lint for backend and frontend:

```bash
npm run lint
```

Run Jest tests:

```bash
npm test -- --runInBand
```

Run backend and frontend builds:

```bash
npm run build:all
```

Run the browser E2E auth flow:

```bash
npx playwright install chromium
npm run test:e2e
```

CI workflows currently cover:

- Lint and typecheck: `.github/workflows/ci-lint-typecheck.yml`
- API/unit tests with PostgreSQL: `.github/workflows/ci-test.yml`
- Browser E2E auth flow with PostgreSQL: `.github/workflows/ci-e2e.yml`
- Build and deploy hooks: `.github/workflows/cd-deploy.yml`

## Troubleshooting

### Missing Frontend API URL

If the frontend shows `NEXT_PUBLIC_API_BASE_URL is required`, confirm the variable exists in the root `.env` file and restart the Next.js dev server. Next.js only loads public environment variables at server startup.

### Port Already In Use

If Next.js reports that another dev server is already running, use the existing URL it prints or stop the listed process:

```bash
kill <pid>
```

### Database Not Populated

If pages load but policy counts are empty, run migrations and seed data again:

```bash
npx prisma migrate dev
npx prisma db seed
```

Then refresh the frontend after confirming the API is running on `PORT`.

## Data Curation

The seed data is curated by hand in `prisma/seed.ts`. When adding real policy data:

1. Read the official source material.
2. Add the `Policy` record.
3. Link official `PolicySource` and `Document` records.
4. Add affected `Technology`, `Company`, `Country`, and `RestrictionType` joins.
5. Add `PolicyRevision` and `TimelineEvent` records when the rule changed over time.
6. Include source URLs for timeline events when available.

V1 intentionally does not scrape or ingest policy feeds automatically. Automated ingestion belongs in a later roadmap phase.

## Logo

The README logo is committed as `docs/assets/diffusion-node-logo.svg` so the project renders cleanly on GitHub without external design tooling.

## Contributing

Diffusion Node uses small, focused branches and conventional commits.

Recommended workflow:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/your-feature-name
npm run lint
npm test -- --runInBand
npm run frontend:build
git commit -S -m "feat(scope): describe the change"
```

Contribution guidelines:

- Keep PRs focused and reviewable.
- Do not stack unrelated PRs.
- Do not commit `.env`, local database dumps, Playwright reports, coverage output, or build artifacts.
- Add or update tests for behavior changes.
- Keep seed data traceable to real sources.
- Prefer existing project patterns over new abstractions.

## Security

- Keep JWT secrets, database URLs, deploy hooks, and API credentials in local or deployment environment variables.
- Do not commit production secrets.
- Rotate credentials if they are accidentally exposed.

## License

Diffusion Node is licensed under the MIT License. See [LICENSE](./LICENSE).
