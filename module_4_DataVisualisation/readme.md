# Module 4 - Data Visualisation

This folder contains the visual analytics module split into:
- a backend API (`api/`) that serves graph and metric data
- a frontend Observable app (`webapp/observable/`) that renders the explorer UI

## Folder structure

```text
module_4_DataVisualisation/
├─ api/
│  ├─ src/
│  │  ├─ app.ts
│  │  ├─ logic.ts
│  │  └─ routes/dre.ts
│  ├─ Dockerfile
│  └─ README.md
├─ webapp/
│  ├─ observable/
│  │  ├─ src/
│  │  │  ├─ index.md
│  │  │  ├─ results.md
│  │  │  └─ components/
│  │  ├─ observablehq.config.js
│  │  ├─ docker-entry.mjs
│  │  └─ README.md
│  ├─ Dockerfile
│  └─ README.md
└─ readme.md
```

## API (`api/`)

Main server:
- `GET /hello`
- `GET /dre/subgraph`
- `GET /dre/kcore`
- `GET /dre/sc-overall-avg`
- `GET /dre/sc-liveness`
- `GET /dre/sc-popularity`
- `GET /dre/eoa-overall-avg`
- `GET /dre/eoa-liveness`
- `GET /dre/eoa-popularity`
- `GET /dre/eoa-diversification`

Default port is `3001` (or `PORT` from `.env`).

Run locally:

```bash
cd api
npm install
npm run dev
```

## Web app (`webapp/observable/`)

Pages:
- `src/index.md`: address input and time interval selection
- `src/results.md`: interactive graph, side panel stats, and bar charts

The frontend reads data from `API_BASE_URL` and defaults to `http://localhost:3001`.

Run locally:

```bash
cd webapp/observable
npm install
npm run dev
```

Then open `http://localhost:3000`.
