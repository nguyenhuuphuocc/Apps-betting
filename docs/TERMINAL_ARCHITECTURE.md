# AI Sports Betting Terminal Architecture

## Frontend Architecture (Next.js + Tailwind)

```text
apps/web/src
  app/
    page.tsx                      # Terminal shell + module router
    dashboard/page.tsx            # Alias route
    settings/page.tsx             # Risk/API/portfolio controls
  components/dashboard/
    TopOpportunitiesFeed.tsx      # Unified all-sports ranked feed
    OpportunityHighlights.tsx     # Highest EV / safest / sharp boards
    OpportunityHeatmap.tsx        # Sport-level edge density
    MarketMoversPanel.tsx         # Steam + reverse-line tracker
    AiInsightPanel.tsx            # "Why this bet?" explanation stream
    AIPicksPanel.tsx              # AI prediction cards
    LiveGamesTable.tsx            # Live and scheduled games
    LiveInsightsPanel.tsx         # Momentum + win-prob intelligence
    PlayerPropsPanel.tsx          # Prop projections and hit rates
    EvTable.tsx                   # Positive EV scanner
    BacktestPanel.tsx             # Strategy simulation UI
    BankrollPanel.tsx             # P/L, drawdown, exposure
    ChatPanel.tsx                 # BetIQ assistant
  hooks/
    useDashboardData.ts           # SWR/WebSocket data orchestration
  types/
    index.ts                      # Shared contracts
```

## Backend Architecture (Express + Postgres/Redis)

```text
apps/api/src
  index.js                        # Bootstrapping + cron + websocket
  routes.js                       # API surface
  services/
    dashboardService.js           # Core domain logic
    chatService.js                # AI assistant logic
    providers/
      oddsApi.js                  # Multi-provider odds adapter
      ballDontLie.js              # Schedule/stat fallback source
    quant/
      predictionModel.js          # Probability/confidence model
      evEngine.js                 # EV/implied/Kelly math
  lib/
    db.js                         # Postgres + in-memory fallback
    cache.js                      # Redis + in-memory fallback
    retry.js                      # Request retry wrapper
```

## Database Schema (Current + Recommended Expansion)

Current operational tables:
- `events`
- `odds_snapshots`
- `predictions`
- `backtest_runs`
- `chat_sessions`
- `chat_messages`
- `bankroll_entries`

Recommended next additions for scale:
- `player_props_snapshots`
- `injury_reports`
- `market_movers`
- `opportunity_snapshots`
- `alert_rules`
- `alert_events`
- `user_bet_journal`
- `model_calibration_runs`

## Real-Time Data Workflow

1. Provider adapters ingest odds/schedules by sport batch.
2. Snapshot rows are persisted to `odds_snapshots` + `events`.
3. Prediction + EV models produce structured opportunities.
4. Opportunity feed endpoint ranks opportunities with score/tags.
5. WebSocket emits sync ticks and updates dashboard state.
6. Frontend SWR refreshes core modules every 30-60 seconds.

## AI Prediction Workflow

1. Collect latest odds, line movement, and event metadata.
2. Compute implied probabilities from market prices.
3. Run bounded probability model (`5%-95%` clamps).
4. Compute EV and edge for each candidate bet.
5. Apply confidence/risk rules and stake sizing suggestions.
6. Rank by opportunity score and emit explainable reasoning.

## Opportunity Score Framework

Base scoring inputs:
- EV contribution
- model-market edge
- confidence
- line movement quality
- sharp/steam signals
- risk penalty adjustments

Output:
- `0-100` score
- risk band
- recommendation tag
- stake guidance

## Scaling & Reliability Strategy

- Use provider rotation by sport group and time window.
- Add quota-aware sync queue to avoid rate-limit lockouts.
- Store snapshots first, compute predictions asynchronously.
- Cache hot feed endpoints (`/opportunities`, `/live-games`) in Redis.
- Use websocket delta events for near-live UX with low API load.

## Responsible Betting Layer

Platform rules enforced in UI + API:
- no guaranteed-win language
- low/medium/high risk labels
- unit sizing caps
- streak-protection reminders
- "no bet" states when edges are weak
