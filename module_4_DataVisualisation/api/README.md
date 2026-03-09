# TypeScript Node API

Express + TypeScript API powering the DLT-FRUIT web application.

## Tech Stack

- Node.js
- TypeScript
- Express
- dotenv
- cors
- helmet

## Requirements

- Node.js 18+ (Node 18 is used in Docker)
- npm

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3001
```

If `PORT` is not set, the app defaults to `3001`.

## Run

Development mode (auto-reload):

```bash
npm run dev
```

Build TypeScript:

```bash
npm run build
```

Start compiled app:

```bash
npm start
```

## Docker

Build image:

```bash
docker build -t typescript-node-api .
```

Run container:

```bash
docker run --rm -p 3000:3000 -e PORT=3000 typescript-node-api
```

Note: Dockerfile exposes port `3000`, while local default is `3001`.

## Base URLs

- Health check: `GET /hello`
- API namespace: `/dre`

Example local URL:

```text
http://localhost:3001
```

## API Endpoints

### Graph endpoints

- `GET /dre/subgraph`
  - Query params: `address`, `timeInterval` (`1d|1w|1m|1y`), `nodeId`
  - Default `nodeId`: `37028167`

- `GET /dre/kcore`
  - Query params: `address`, `timeInterval` (`1d|1w|1m|1y`), `nodeId`
  - Default `nodeId`: `37028167`

### Smart contract metrics

- `GET /dre/sc-overall-avg`
  - Query params: `address`, `sample`

- `GET /dre/sc-liveness`
  - Query params: `address`, `timeInterval`, `sample`

- `GET /dre/sc-popularity`
  - Query params: `address`, `timeInterval`, `sample`

### EOA metrics

- `GET /dre/eoa-overall-avg`
  - Query params: `address`, `sample`, `type`

- `GET /dre/eoa-liveness`
  - Query params: `address`, `timeInterval`, `sample`, `type`

- `GET /dre/eoa-popularity`
  - Query params: `address`, `timeInterval`, `sample`

- `GET /dre/eoa-diversification`
  - Query params: `address`, `timeInterval`, `sample`, `recvType`

## Quick Examples

```bash
curl "http://localhost:3001/hello"
```

```bash
curl "http://localhost:3001/dre/subgraph?nodeId=37028167&timeInterval=1m"
```

```bash
curl "http://localhost:3001/dre/sc-liveness?address=0x0&timeInterval=1y&sample=1m"
```


## Scripts

- `npm run dev` - run with `ts-node-dev`
- `npm run build` - compile to `dist/`
- `npm start` - run `dist/app.js`
