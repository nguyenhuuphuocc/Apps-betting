# BetIQ Professional Sports Betting Analytics Platform

Production-oriented multi-sport analytics SaaS scaffold with:

- `Next.js + TypeScript + Tailwind` frontend
- `Express + Socket.IO` backend
- `PostgreSQL` storage with automatic in-memory fallback
- `Redis` caching with in-memory fallback
- Odds + sports data provider integration
- +EV engine, line movement, sharp signal detection
- Backtesting module with drawdown and bankroll curve
- BetIQ AI chatbot endpoint and web UI

This tool is for analysis and education only.
Predictions are not guaranteed. Bet responsibly.

---

## 1) Project Structure

```text
apps/
  api/
    prisma/schema.prisma
    src/
      config/env.js
      lib/
        cache.js
        db.js
        retry.js
      services/
        chatService.js
        dashboardService.js
        providers/
          ballDontLie.js
          oddsApi.js
        quant/
          evEngine.js
          predictionModel.js
      routes.js
      index.js
  web/
    src/
      app/
        page.tsx
        landing/page.tsx
        globals.css
      components/dashboard/
        AIPicksPanel.tsx
        BacktestPanel.tsx
        BankrollPanel.tsx
        ChatPanel.tsx
        EvTable.tsx
        KpiCard.tsx
        LiveGamesTable.tsx
        LiveInsightsPanel.tsx
        NotificationsPanel.tsx
        OddsComparisonTable.tsx
        PlayerPropsPanel.tsx
        SharpMoneyTable.tsx
      hooks/useDashboardData.ts
      lib/api.ts
      types/index.ts
```

---

## 2) API Routes

### Core (versioned)

- `GET /health`
- `GET /api/v1/status`
- `POST /api/v1/sync`
- `GET /api/v1/live-games?sportKey=...`
- `GET /api/v1/predictions?minEdge=2&minConfidence=6`
- `GET /api/v1/ev-bets?minEdge=2&minConfidence=6`
- `GET /api/v1/line-movement/:eventId`
- `GET /api/v1/sharp-money?sportKey=...`
- `GET /api/v1/odds-comparison?eventId=...`
- `GET /api/v1/ai-picks?sportKey=...`
- `GET /api/v1/live-insights?sportKey=...`
- `GET /api/v1/player-props?sportKey=...`
- `GET /api/v1/notifications`
- `GET /api/v1/team/:teamId/analytics`
- `GET /api/v1/player/:playerId/analytics`
- `GET /api/v1/game/:eventId/analysis`
- `POST /api/v1/backtest`
- `GET /api/v1/bankroll?userId=default`
- `POST /api/v1/bankroll`
- `POST /api/v1/chat`
- `GET /api/v1/chat/history?sessionId=...`
- `POST /api/v1/bet-slip/analyze`
- `GET /api/v1/dashboard-summary`
- `GET /api/v1/alerts`
- `POST /api/v1/alerts`
- `GET /api/v1/user/settings`
- `POST /api/v1/user/settings`
- `GET /api/v1/admin/analytics`

### Alias routes (requested contract)

- `/api/games`
- `/api/odds`
- `/api/predictions`
- `/api/player-props`
- `/api/notifications`
- `/api/sharp-money`
- `/api/ev-scanner`
- `/api/backtest`
- `/api/bankroll`
- `/api/chat`
- `/api/chat/history`
- `/api/alerts`
- `/api/user/settings`
- `/api/admin/analytics`

---

## 3) Quant / Risk Guardrails

- Probability cap: 5% to 95% (no impossible 100%)
- EV finite checks (no Infinity/NaN output)
- +EV filtering and confidence thresholds
- Kelly-based unit suggestion with hard caps
- Backtest risk controls:
  - min edge
  - min confidence
  - daily exposure cap
  - losing-streak size reduction

---

## 4) Environment Variables

Use backend-only secrets. Never expose keys in frontend.

### `apps/api/.env`

```bash
NODE_ENV=development
API_PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

ODDS_API_KEY=...
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
BALLDONTLIE_API_KEY=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini

DATABASE_URL=postgresql://...
REDIS_URL=redis://...

CACHE_TTL_SECONDS=120
REQUEST_TIMEOUT_MS=12000
RETRY_ATTEMPTS=3
SUPPORTED_SPORT_KEYS=basketball_nba,basketball_wnba,baseball_mlb,icehockey_nhl,americanfootball_nfl,basketball_ncaab,basketball_euroleague,soccer_epl,soccer_fifa_world_cup,tennis_atp_italian_open,tennis_wta_italian_open,golf_pga_tour,boxing_boxing
```

### `apps/web/.env.local`

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

> `DATABASE_URL` and `REDIS_URL` are strongly recommended for production. If invalid or unavailable, the app falls back to in-memory mode.

---

## 5) Local Run

1. Install dependencies at repo root:

```bash
yarn
```

2. Copy env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

3. Start both apps:

```bash
yarn dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:4000/health](http://localhost:4000/health)

---

## 6) Render + Vercel Deployment

### Backend (Render)

- Service root: `apps/api`
- Build: `yarn`
- Start: `yarn start`
- Required env:
  - `ODDS_API_KEY`
  - `BALLDONTLIE_API_KEY`
  - `FRONTEND_ORIGIN`
- Recommended env:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `OPENAI_API_KEY`

### Frontend (Vercel or Render)

- Service root: `apps/web`
- Build: `yarn && yarn build`
- Start: `yarn start`
- Env:
  - `NEXT_PUBLIC_API_BASE_URL=https://<your-api-domain>`

---

## 7) Notes

- Legacy dashboard files (`index.html`, `app.js`, `server.mjs`) are still present for backward compatibility.
- New platform runs from `apps/web` + `apps/api`.
- If you still see the old site in production, verify the deploy service points at `apps/web` and latest commit.
