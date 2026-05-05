# Live NBA Betting Analytics Platform

This project upgrades the previous static betting dashboard into a live NBA analytics platform with:

- Backend API routes
- SQLite persistence with table schema/migrations
- BALLDONTLIE + Odds provider ingestion
- Prediction engine (moneyline/spread/total with EV and risk sizing)
- Backtesting endpoint
- Bankroll/risk rules
- Frontend auto-refresh and settings controls

## Safety Notice

- Predictions are not guaranteed.
- Bet responsibly.
- This tool is for analysis and education only.
- No bet is recommended unless positive expected value is detected.

## Architecture

`API Provider -> Backend API -> SQLite -> Prediction Engine -> Dashboard`

Key backend files:

- [server.mjs](C:/Users/nguye/Documents/Codex/2026-05-04/you-are-an-elite-sports-betting/server.mjs)
- [backend/db/schema.sql](C:/Users/nguye/Documents/Codex/2026-05-04/you-are-an-elite-sports-betting/backend/db/schema.sql)
- [backend/services/syncService.mjs](C:/Users/nguye/Documents/Codex/2026-05-04/you-are-an-elite-sports-betting/backend/services/syncService.mjs)
- [backend/services/predictionEngine.mjs](C:/Users/nguye/Documents/Codex/2026-05-04/you-are-an-elite-sports-betting/backend/services/predictionEngine.mjs)
- [backend/services/dashboardService.mjs](C:/Users/nguye/Documents/Codex/2026-05-04/you-are-an-elite-sports-betting/backend/services/dashboardService.mjs)

Frontend integration:

- [index.html](C:/Users/nguye/Documents/Codex/2026-05-04/you-are-an-elite-sports-betting/index.html)
- [app.js](C:/Users/nguye/Documents/Codex/2026-05-04/you-are-an-elite-sports-betting/app.js)
- [live-client.js](C:/Users/nguye/Documents/Codex/2026-05-04/you-are-an-elite-sports-betting/live-client.js)

## Database Tables

Implemented tables include:

- `teams`
- `players`
- `games`
- `player_game_stats`
- `odds_history`
- `predictions`
- `bets`
- `bankroll_history`
- `injuries`
- `backtest_results`

Additional runtime config table:

- `settings`

## Setup

1. Copy env template:

```powershell
Copy-Item .env.example .env
```

2. Edit `.env` and add API keys:

- `BALLDONTLIE_API_KEY`
- `ODDS_API_KEY`

3. Start the backend server:

```powershell
& 'C:\Users\nguye\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' server.mjs
```

4. Open:

- [http://localhost:8787](http://localhost:8787)

## Real-Time Refresh Strategy

Default auto update intervals:

- Live scores: every `30s`
- Pre-game odds: every `10m`
- Scheduled games: every `6h`
- Injuries: every `20m`
- Final game player stats: every `15m`

Intervals are editable from the **Settings** tab and persisted in SQLite.

## API Routes

Health and status:

- `GET /api/health`
- `GET /api/status`

Settings:

- `GET /api/settings`
- `PUT /api/settings`

Sync:

- `POST /api/sync/run`

Dashboard data:

- `GET /api/dashboard/live?date=YYYY-MM-DD`
- `GET /api/games/past?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/games/future?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/predictions?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/players/:id/analysis?opponentTeamId=:teamId`

Backtesting:

- `POST /api/backtest/run`
- `GET /api/backtest/results`

Tracked bets:

- `GET /api/bets`
- `POST /api/bets`
- `PATCH /api/bets/:id/result`

## Risk Management Rules

Implemented rules:

- `1 unit = 1%` bankroll (configurable)
- Suggested sizing:
  - Low confidence: `0.5-1u`
  - Medium confidence: `1-2u`
  - High confidence: up to `2-3u`
- Hard cap: max single bet `%` (default `5%`)
- Losing streak control:
  - `3+` losses: recommended size reduced by `50%`
  - `7+` losses: recommendation size becomes `0` (pause state)
- If edge is non-positive, recommendation is `NO BET`

## Notes

- API keys are never exposed in frontend JavaScript.
- If an API is unavailable, the UI gracefully falls back to existing local dashboard data.
- The frontend tracker/backtest modules remain available and now coexist with live backend sync.
