# Live Multi-Sport Betting Analytics Platform

This project upgrades the previous static betting dashboard into a live multi-sport analytics platform with:

- Backend API routes
- SQLite persistence with table schema/migrations
- BALLDONTLIE + Odds provider ingestion (multi-sport odds sync)
- Prediction engine (moneyline/spread/total with EV and risk sizing)
- Calibrated prediction engine (bounded probabilities + Monte Carlo blend)
- EV grading and value-gap classification (green/yellow/red)
- Matchup/context intelligence (rest, b2b, injuries, postseason pressure)
- Line movement intelligence (opening vs current, steam/trap signals)
- Backtesting endpoint
- Bankroll/risk rules
- Frontend auto-refresh and settings controls
- Premium UI upgrade (dark/light toggle, collapsible sidebar, status header)
- Advanced backtest controls + export (CSV / JSON)
- Expanded settings engine (API, bankroll, risk, model weights, display, sync)

## Safety Notice

- Predictions are not guaranteed.
- Bet responsibly.
- This tool is for analysis and education only.
- No bet is recommended unless positive expected value is detected.

## Architecture

`API Provider -> Backend API -> SQLite -> Prediction Engine -> Dashboard`

Supported sports (odds-driven today):

- NBA
- WNBA
- MLB
- NHL
- NFL
- NCAABB
- EuroLeague
- Soccer (World Cup + leagues where odds are available)
- Tennis (ATP/WTA Rome keys included)
- Boxing

Notes:

- NBA has the deepest stats context in this build (team/player/injury depth).
- Non-NBA sports are synced through Odds API markets and run through the same EV/risk engine with bounded probabilities and no-bet discipline.

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

If you were already running an older server build, fully stop it and restart so the new settings schema and routes are loaded.

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
- `POST /api/settings/test`

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

`POST /api/backtest/run` now accepts optional controls:

- `sport`, `league`, `team`, `betType`
- `minConfidence`, `minEv`
- `maxBetsPerDay`, `maxDailyExposureUnits`, `maxUnitSize`
- `skipInjuryUncertainty`

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
- UI and model outputs are sanitized to avoid `Infinity`, `NaN`, and impossible probability displays

## Notes

- API keys are never exposed in frontend JavaScript.
- If an API is unavailable, the UI gracefully falls back to existing local dashboard data.
- The frontend tracker/backtest modules remain available and now coexist with live backend sync.
- Probability outputs are bounded between `5%` and `95%` to prevent unrealistic certainty.
- Non-finite EV values are blocked and downgraded to neutral/no-bet handling.
