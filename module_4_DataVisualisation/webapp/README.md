# DLT-FRUIT Web application

Bitcoin address activity explorer built with [Observable Framework](https://observablehq.com/framework/) and D3.

The frontend lets you:
- enter a Bitcoin address,
- choose a time interval,
- inspect its interaction subgraph,
- view side-panel metrics and time-based charts.

## Repository layout

```text
.
├─ observable/              # Observable app (actual frontend project)
│  ├─ src/
│  │  ├─ index.md           # search/landing page
│  │  ├─ results.md         # graph + side panel + charts page
│  │  └─ components/
│  ├─ observablehq.config.js
│  ├─ docker-entry.mjs
│  └─ package.json
├─ Dockerfile               # container for observable preview
└─ package.json             # root dependencies (utility/API tooling)
```

## Requirements

- Node.js `>=18`
- npm
- A backend exposing these endpoints (default base URL: `http://localhost:3001`):
  - `GET /dre/subgraph`
  - `GET /dre/sc-overall-avg`
  - `GET /dre/sc-liveness`
  - `GET /dre/sc-popularity`

## Run locally

### 1) Start the frontend

```bash
cd observable
npm install
npm run dev
```

Open `http://localhost:3000`.

### 2) Configure backend base URL (optional)

The frontend reads `API_BASE_URL` in this order:
1. environment variable `API_BASE_URL`
2. `observable/.env` (`API_BASE_URL=...`)
3. fallback `http://localhost:3001`

Example:

```bash
cd observable
printf 'API_BASE_URL=http://127.0.0.1:3001\n' > .env
npm run dev
```

## Build static output

```bash
cd observable
npm run build
```

Build artifacts are generated in `observable/dist/`.

## Run with Docker

```bash
docker build -t dlt-fruit .
docker run --rm -p 3002:3002 -e API_BASE_URL=http://host.docker.internal:3001 dlt-fruit
```

Then open `http://localhost:3002`.

## Notes

- The authoritative frontend project is in `observable/`.
