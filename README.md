<div align="center">
  <img src="./docs/assets/diffusion-node-logo.svg" alt="Diffusion Node logo" width="132" />

  <h1>Diffusion Node</h1>

  <p>
    Export-control monitoring for semiconductor, AI, and policy teams.
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
    <a href="#live-services">Live Services</a> -
    <a href="#features">Features</a> -
    <a href="#architecture">Architecture</a> -
    <a href="#local-development">Local Development</a> -
    <a href="#api-reference">API Reference</a> -
    <a href="#testing">Testing</a> -
    <a href="#deployment">Deployment</a>
  </p>
</div>

## Overview

Diffusion Node is a full-stack policy monitoring workspace for tracking export-control rules, semiconductor restrictions, AI diffusion policy changes, affected companies, controlled technologies, jurisdictions, source documents, and regulatory timelines.

The application combines a curated PostgreSQL policy dataset, an Express and Prisma API, and a Next.js dashboard for analysts who need to inspect how policy changes affect companies, countries, and technology categories.

## Live Services

| Service | URL |
| --- | --- |
| Frontend | [https://diffusion-node-frontend.vercel.app](https://diffusion-node-frontend.vercel.app) |
| API health check | [https://diffusion-node-api.onrender.com/health](https://diffusion-node-api.onrender.com/health) |
| API documentation | [https://diffusion-node-api.onrender.com/docs](https://diffusion-node-api.onrender.com/docs) |
| API base URL | `https://diffusion-node-api.onrender.com/api/v1` |

Production is deployed with Vercel for the frontend and Render for the backend API and PostgreSQL database.

## Project Status

Diffusion Node v1 is deployed and production data is seeded. The current release includes authenticated access, policy search, reference-data explorers, timeline views, API key management, OpenAPI documentation, CI checks, and browser E2E coverage for the authentication flow.

## Features

- JWT authentication with registration, login, refresh tokens, and authenticated profile access.
- API key creation and revocation for signed-in users.
- Dashboard summary for loaded policies, linked companies, linked technologies, and restricted countries.
- Policy explorer with cursor pagination and filters for search text, company, country, technology, year, source, and restriction type.
- Policy detail pages with source links, documents, jurisdictions, linked companies, linked technologies, and policy timelines.
- Country explorer with restriction summaries, exposure rankings, flags, and a world choropleth map.
- Company explorer with headquarters country, aliases, entity-list status, and policy exposure context.
- Technology explorer for semiconductor, AI, lithography, EDA, and advanced-computing categories.
- Global timeline for sourced regulatory events and linked policy records.
- Developer settings for authenticated profile data, runtime API target, and API credential operations.
- Swagger UI generated from the OpenAPI specification in the backend.

## Architecture

```text
diffusion-node/
|-- src/                    # Express API, controllers, routes, middleware, OpenAPI docs
|-- prisma/                 # Prisma schema, migrations, curated seed data
|-- frontend/               # Next.js dashboard workspace
|-- tests/                  # Jest API and route coverage
|-- tests/e2e/              # Playwright browser E2E flow
|-- docs/assets/            # README and documentation assets
`-- .github/workflows/      # CI and deploy workflows
```

### Backend

- Node.js `24.14.0`
- Express 5
- Prisma 7
- PostgreSQL
- Zod request validation
- JWT authentication
- Swagger UI and OpenAPI
- Jest and Supertest

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Axios
- Lucide React
- `country-flag-icons`
- D3 Geo, TopoJSON, and `world-atlas`
- Playwright

### Data Model

Diffusion Node models policy intelligence as a relational graph:

- `Policy`, `PolicySource`, `Document`, `PolicyRevision`, `TimelineEvent`
- `TechnologyCategory`, `Technology`, `PolicyTechnology`
- `Company`, `PolicyCompany`
- `Country`, `RestrictionType`, `Jurisdiction`
- `User`, `ApiKey`

The current seed contains 15 policies, 17 technologies, 28 companies, 17 countries, 89 policy-company links, and 59 policy-technology links.

## Data Curation

V1 uses manually curated seed data in [prisma/seed.ts](./prisma/seed.ts). Each policy record is tied to public source material such as Federal Register notices, BIS rulemaking pages, GAO decisions, or official agency publications.

When adding policy data:

1. Read the official source material.
2. Add the `Policy` record with title, summary, status, effective date, and control number.
3. Link `PolicySource` and `Document` records to source URLs.
4. Add `Jurisdiction` records for affected countries and restriction types.
5. Add `PolicyTechnology` and `PolicyCompany` join rows.
6. Add `PolicyRevision` and `TimelineEvent` records when the policy changed over time.
7. Attach event-level source URLs when the event has a distinct citation.

The seed command is idempotent because records use stable IDs and `upsert`.

Credential seed data is disabled by default. Demo users and demo API keys are created only when the seed command is run with `SEED_DEMO_CREDENTIALS=true`.

## Local Development

### Prerequisites

- Node.js `24.14.0`
- npm
- PostgreSQL
- Git

The root `package.json` allows Node `>=20.9.0`, but `.nvmrc` pins local development to `24.14.0`.

### Install Dependencies

```bash
nvm use
npm ci
```

### Configure Environment

Create a root `.env` file with generated local JWT secrets:

```bash
JWT_SECRET_VALUE=$(openssl rand -base64 32)
JWT_REFRESH_SECRET_VALUE=$(openssl rand -base64 32)

cat > .env <<EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/diffusion?schema=public"
PORT=3001
CORS_ORIGIN="http://127.0.0.1:3000"
JWT_SECRET="$JWT_SECRET_VALUE"
JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET_VALUE"
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:3001/api/v1"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
EOF
```

Next.js reads the root environment file through [frontend/next.config.ts](./frontend/next.config.ts). Restart the Next.js dev server after changing `NEXT_PUBLIC_API_BASE_URL`.

### Prepare the Database

Create a local PostgreSQL database named `diffusion`, then run:

```bash
createdb diffusion
npm run prisma:generate
npx prisma migrate dev
npx prisma db seed
```

The default seed creates policy and reference data. It does not create local demo accounts.

To seed demo credentials for local development, run:

```bash
SEED_DEMO_CREDENTIALS=true npx prisma db seed
```

Local demo credentials created by that command:

| Email | Password | Role |
| --- | --- | --- |
| `admin@diffusionnode.io` | `password123` | `ADMIN` |
| `developer@diffusionnode.io` | `password123` | `DEVELOPER` |

For normal local testing, register a new user from `/auth`.

### Inspect the Database

```bash
npx prisma studio
```

Prisma Studio opens a browser UI for the database connected by `DATABASE_URL`.

### Run the Application

Start the API:

```bash
npm run dev
```

Start the frontend in another terminal:

```bash
npm run frontend:dev -- --hostname 127.0.0.1 --port 3000
```

Local URLs:

| Service | URL |
| --- | --- |
| Frontend | `http://127.0.0.1:3000` |
| API health check | `http://127.0.0.1:3001/health` |
| API documentation | `http://127.0.0.1:3001/docs` |
| API base URL | `http://127.0.0.1:3001/api/v1` |

## API Reference

Interactive documentation is served by Swagger UI at `/docs`.

Core routes:

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `POST` | `/api/v1/auth/register` | Register a user |
| `POST` | `/api/v1/auth/token` | Issue access and refresh credentials |
| `POST` | `/api/v1/auth/refresh` | Refresh access credentials |
| `GET` | `/api/v1/me` | Fetch the authenticated user profile |
| `POST` | `/api/v1/api-keys` | Create an API key for the authenticated user |
| `POST` | `/api/v1/api-keys/:id/revoke` | Revoke an authenticated user's API key |
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

Run lint and typecheck:

```bash
npm run lint
npm run build:all
```

Run Jest:

```bash
npm test -- --runInBand
```

Run browser E2E:

```bash
npx playwright install chromium
npm run test:e2e
```

CI workflows:

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `.github/workflows/ci-lint-typecheck.yml` | Pull request to `main` | Lint, backend build, frontend build |
| `.github/workflows/ci-test.yml` | Pull request to `main` | Jest tests against PostgreSQL |
| `.github/workflows/ci-e2e.yml` | Pull request to `main` | Playwright auth flow against PostgreSQL |
| `.github/workflows/cd-deploy.yml` | Push to `main` | Build backend/frontend and trigger deploy hooks when secrets exist |

## Deployment

### Backend and Database

Render is configured through [render.yaml](./render.yaml):

| Resource | Name | Plan | Region |
| --- | --- | --- | --- |
| PostgreSQL | `diffusion-node-db` | `free` | `oregon` |
| Web service | `diffusion-node-api` | `free` | `oregon` |

The Render backend build command:

```bash
HUSKY=0 npm ci --include=dev && npm run prisma:generate && npx prisma migrate deploy && npm run build
```

The Render start command:

```bash
npm run start
```

Required Render environment values:

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `24.14.0` |
| `DATABASE_URL` | Render PostgreSQL connection string |
| `JWT_SECRET` | Generated secret |
| `JWT_REFRESH_SECRET` | Generated secret |
| `CORS_ORIGIN` | `https://diffusion-node-frontend.vercel.app` |
| `RATE_LIMIT_MAX` | `100` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |

Render migrations run during deployment. Production seed data is applied manually after migrations from a terminal session where `DATABASE_URL` is set to the Render PostgreSQL external connection string:

```bash
npx prisma db seed
```

The external database URL must include SSL mode, usually `sslmode=require`.

### Frontend

Vercel is configured through [vercel.json](./vercel.json):

| Setting | Value |
| --- | --- |
| Framework | `nextjs` |
| Install command | `npm ci --include=dev --ignore-scripts` |
| Build command | `npm run frontend:build` |
| Development command | `npm run frontend:dev` |
| Output directory | `frontend/.next` |

Required Vercel environment value:

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://diffusion-node-api.onrender.com/api/v1` |

`NEXT_PUBLIC_API_BASE_URL` is read at build time. Redeploy the Vercel project after changing it.

## Troubleshooting

### Frontend Reports Missing API Base URL

Confirm `NEXT_PUBLIC_API_BASE_URL` exists in the root `.env` file for local development or in Vercel project settings for production. Restart or redeploy the frontend after changing this value.

### Dashboard Loads Empty Data

Confirm the backend can return production records:

```bash
curl 'https://diffusion-node-api.onrender.com/api/v1/policies?limit=1'
curl 'https://diffusion-node-api.onrender.com/api/v1/companies?limit=1'
curl 'https://diffusion-node-api.onrender.com/api/v1/countries?limit=1'
```

If the API returns empty arrays, run the production seed command against Render PostgreSQL.

### Next.js Dev Server Already Running

Next.js prints the active process ID when another dev server is running. Stop that process before starting a new server:

```bash
kill <pid>
```

## Security

- Keep `.env` files out of Git.
- Store production database URLs, JWT secrets, deploy hooks, and API credentials in Render, Vercel, or GitHub Actions secrets.
- Rotate credentials immediately if a production connection string is exposed.
- Do not seed demo users or demo API keys in production.

## Contributing

Diffusion Node uses small, focused branches and signed conventional commits.

Recommended workflow:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/policy-search
npm run lint
npm test -- --runInBand
npm run frontend:build
git commit -S -m "feat(api): add policy search filter"
```

Contribution rules:

- Keep each pull request focused on one reviewable change.
- Do not stack pull requests with duplicate commits.
- Do not commit `.env`, local database dumps, Playwright reports, coverage output, or build artifacts.
- Add or update tests for behavior changes.
- Keep seed data traceable to public source URLs.
- Use existing project patterns before introducing new abstractions.

## License

Diffusion Node is licensed under the MIT License. See [LICENSE](./LICENSE).
