# Professional Sports Betting Analytics Platform

Production-oriented multi-sport betting intelligence platform with:

- Next.js + Tailwind frontend (premium dark UI)
- Express + WebSocket backend
- PostgreSQL persistence for events, odds history, predictions, and backtests
- Redis caching with in-memory fallback
- Odds API + BallDontLie integration
- +EV detection, line movement tracking, AI probability model, and backtesting

Predictions are not guaranteed. Bet responsibly. No bet if no edge exists.

## 1) Project Structure

```text
you-are-an-elite-sports-betting/
  apps/
    api/
      src/
        config/env.js
        lib/
          cache.js
          db.js
          retry.js
        services/
          providers/
            oddsApi.js
            ballDontLie.js
          quant/
            evEngine.js
            predictionModel.js
          dashboardService.js
        routes.js
        index.js
      .env.example
      package.json
    web/
      src/
        app/
          globals.css
          layout.tsx
          page.tsx
        components/dashboard/
          KpiCard.tsx
          LiveGamesTable.tsx
          EvTable.tsx
          BacktestPanel.tsx
        hooks/useDashboardData.ts
        lib/api.ts
        types/index.ts
      .env.local.example
      package.json
      tailwind.config.ts
      next.config.mjs
  package.json
  render.yaml
```

## 2) Backend API Routes

Base URL: `http://localhost:4000`

- `GET /health`
- `GET /api/v1/status`
- `POST /api/v1/sync`
- `GET /api/v1/live-games?sportKey=basketball_nba`
- `GET /api/v1/ev-bets?minEdge=2&minConfidence=6`
- `GET /api/v1/line-movement/:eventId`
- `GET /api/v1/team/:teamId/analytics`
- `GET /api/v1/player/:playerId/analytics`
- `POST /api/v1/backtest`

WebSocket events:

- `server:ready`
- `sync:tick`
- `sync:complete`
- `sync:error`

## 3) Core Quant Logic

- **Implied probability** from American odds
- **Expected value**:
  - `EV = (win_probability * payout) - (lose_probability * stake)`
- **+EV detector** with confidence/risk labels
- **Kelly fraction** for bankroll sizing (capped)
- **Prediction model**:
  - Logistic-style scorer with market prior + context features
  - Bounded probabilities to avoid unrealistic certainty

## 4) Local Setup

### Prerequisites

- Node 20+
- Yarn 1.x+
- PostgreSQL
- Redis (optional, but recommended)

### Install

```bash
yarn
```

### Environment

1. Copy root env (optional if you already have one):

```bash
cp .env.example .env
```

2. Backend env:

```bash
cp apps/api/.env.example apps/api/.env
```

3. Frontend env:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit values:

- `apps/api/.env`
  - `ODDS_API_KEY`
  - `BALLDONTLIE_API_KEY`
  - `DATABASE_URL`
  - `REDIS_URL`
- `apps/web/.env.local`
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

### Run

```bash
yarn dev
```

Frontend:
- [http://localhost:3000](http://localhost:3000)

Backend:
- [http://localhost:4000/health](http://localhost:4000/health)

## 5) Deployment on Render

Use `render.yaml` or create two services manually:

1. **API service**
   - Root directory: `apps/api`
   - Build: `yarn`
   - Start: `yarn start`
   - Env vars:
     - `ODDS_API_KEY`
     - `BALLDONTLIE_API_KEY`
     - `DATABASE_URL`
     - `REDIS_URL`
     - `FRONTEND_ORIGIN` (your web URL)

2. **Web service**
   - Root directory: `apps/web`
   - Build: `yarn && yarn build`
   - Start: `yarn start`
   - Env vars:
     - `NEXT_PUBLIC_API_BASE_URL` = your API URL

## 6) Notes

- API keys are backend-only and never exposed to frontend.
- Retry logic + cache fallback is built in.
- If live data is down, UI should continue with graceful messaging.
- Existing legacy single-page dashboard files remain in repo for backward compatibility (`index.html`, `app.js`, `live-client.js`, `server.mjs`).
