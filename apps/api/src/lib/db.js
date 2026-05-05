import { Pool } from "pg";

const memoryStore = {
  events: [],
  predictions: [],
  oddsHistory: [],
  backtests: []
};

function withPool(databaseUrl) {
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  async function init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        sport_key TEXT NOT NULL,
        league TEXT NOT NULL,
        commence_time TIMESTAMPTZ,
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        home_score NUMERIC,
        away_score NUMERIC,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS odds_snapshots (
        id BIGSERIAL PRIMARY KEY,
        event_id TEXT NOT NULL,
        sportsbook TEXT NOT NULL,
        market_type TEXT NOT NULL,
        home_price NUMERIC,
        away_price NUMERIC,
        draw_price NUMERIC,
        spread NUMERIC,
        total NUMERIC,
        over_price NUMERIC,
        under_price NUMERIC,
        captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS predictions (
        id BIGSERIAL PRIMARY KEY,
        event_id TEXT NOT NULL,
        market_type TEXT NOT NULL,
        pick TEXT NOT NULL,
        model_probability NUMERIC NOT NULL,
        implied_probability NUMERIC,
        edge_pct NUMERIC,
        ev_pct NUMERIC,
        confidence NUMERIC NOT NULL,
        risk_level TEXT NOT NULL,
        suggested_units NUMERIC NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS backtest_runs (
        id BIGSERIAL PRIMARY KEY,
        strategy_name TEXT NOT NULL,
        date_from DATE NOT NULL,
        date_to DATE NOT NULL,
        total_bets INTEGER NOT NULL,
        wins INTEGER NOT NULL,
        losses INTEGER NOT NULL,
        pushes INTEGER NOT NULL,
        roi_pct NUMERIC NOT NULL,
        win_rate_pct NUMERIC NOT NULL,
        units NUMERIC NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_odds_event_time ON odds_snapshots (event_id, captured_at DESC);
      CREATE INDEX IF NOT EXISTS idx_predictions_event ON predictions (event_id, created_at DESC);
    `);
  }

  return {
    type: "postgres",
    init,
    pool,
    async upsertEvents(events) {
      const query = `
        INSERT INTO events (
          id, sport_key, league, commence_time, home_team, away_team, status, home_score, away_score, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
        ON CONFLICT (id) DO UPDATE SET
          sport_key = EXCLUDED.sport_key,
          league = EXCLUDED.league,
          commence_time = EXCLUDED.commence_time,
          home_team = EXCLUDED.home_team,
          away_team = EXCLUDED.away_team,
          status = EXCLUDED.status,
          home_score = EXCLUDED.home_score,
          away_score = EXCLUDED.away_score,
          updated_at = NOW()
      `;
      for (const event of events) {
        await pool.query(query, [
          event.id,
          event.sportKey,
          event.league,
          event.commenceTime,
          event.homeTeam,
          event.awayTeam,
          event.status,
          event.homeScore ?? null,
          event.awayScore ?? null
        ]);
      }
    },
    async saveOdds(rows) {
      const query = `
        INSERT INTO odds_snapshots (
          event_id, sportsbook, market_type, home_price, away_price, draw_price, spread, total, over_price, under_price, captured_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
      `;
      for (const row of rows) {
        await pool.query(query, [
          row.eventId,
          row.sportsbook,
          row.marketType,
          row.homePrice ?? null,
          row.awayPrice ?? null,
          row.drawPrice ?? null,
          row.spread ?? null,
          row.total ?? null,
          row.overPrice ?? null,
          row.underPrice ?? null
        ]);
      }
    },
    async savePredictions(predictions) {
      const query = `
        INSERT INTO predictions (
          event_id, market_type, pick, model_probability, implied_probability, edge_pct, ev_pct, confidence, risk_level, suggested_units, reason, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
      `;
      for (const row of predictions) {
        await pool.query(query, [
          row.eventId,
          row.marketType,
          row.pick,
          row.modelProbability,
          row.impliedProbability,
          row.edgePct,
          row.evPct,
          row.confidence,
          row.riskLevel,
          row.suggestedUnits,
          row.reason
        ]);
      }
    },
    async latestEvents({ sportKey = null }) {
      const result = await pool.query(
        `
        SELECT *
        FROM events
        WHERE ($1::text IS NULL OR sport_key = $1)
        ORDER BY commence_time ASC NULLS LAST
        LIMIT 200
      `,
        [sportKey]
      );
      return result.rows;
    },
    async latestOddsByEvent(eventId) {
      const result = await pool.query(
        `
        SELECT DISTINCT ON (sportsbook, market_type) *
        FROM odds_snapshots
        WHERE event_id = $1
        ORDER BY sportsbook, market_type, captured_at DESC
      `,
        [eventId]
      );
      return result.rows;
    },
    async oddsMovement(eventId) {
      const result = await pool.query(
        `
        SELECT *
        FROM odds_snapshots
        WHERE event_id = $1
        ORDER BY captured_at ASC
      `,
        [eventId]
      );
      return result.rows;
    },
    async predictionRows({ from, to }) {
      const result = await pool.query(
        `
        SELECT p.*, e.home_team, e.away_team, e.sport_key, e.league, e.status, e.home_score, e.away_score, e.commence_time
        FROM predictions p
        JOIN events e ON e.id = p.event_id
        WHERE e.commence_time::date BETWEEN $1::date AND $2::date
        ORDER BY p.created_at ASC
      `,
        [from, to]
      );
      return result.rows;
    },
    async saveBacktest(run) {
      const result = await pool.query(
        `
        INSERT INTO backtest_runs (
          strategy_name, date_from, date_to, total_bets, wins, losses, pushes, roi_pct, win_rate_pct, units, payload
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
      `,
        [
          run.strategyName,
          run.dateFrom,
          run.dateTo,
          run.totalBets,
          run.wins,
          run.losses,
          run.pushes,
          run.roiPct,
          run.winRatePct,
          run.units,
          run.payload
        ]
      );
      return result.rows[0];
    }
  };
}

function withMemory() {
  return {
    type: "memory",
    async init() {},
    async upsertEvents(events) {
      const byId = new Map(memoryStore.events.map((row) => [row.id, row]));
      for (const row of events) byId.set(row.id, row);
      memoryStore.events = [...byId.values()];
    },
    async saveOdds(rows) {
      memoryStore.oddsHistory.push(...rows.map((row) => ({ ...row, capturedAt: new Date().toISOString() })));
    },
    async savePredictions(predictions) {
      memoryStore.predictions.push(...predictions.map((row) => ({ ...row, createdAt: new Date().toISOString() })));
    },
    async latestEvents({ sportKey = null }) {
      const filtered = sportKey ? memoryStore.events.filter((row) => row.sportKey === sportKey) : memoryStore.events;
      return filtered.slice(0, 200);
    },
    async latestOddsByEvent(eventId) {
      return memoryStore.oddsHistory.filter((row) => row.eventId === eventId);
    },
    async oddsMovement(eventId) {
      return memoryStore.oddsHistory.filter((row) => row.eventId === eventId);
    },
    async predictionRows() {
      return memoryStore.predictions.map((row) => ({
        ...row,
        home_team: row.homeTeam ?? "Home",
        away_team: row.awayTeam ?? "Away",
        sport_key: row.sportKey ?? "unknown",
        league: row.league ?? "Unknown",
        status: "scheduled",
        home_score: null,
        away_score: null,
        commence_time: row.commenceTime ?? new Date().toISOString()
      }));
    },
    async saveBacktest(run) {
      const saved = { id: memoryStore.backtests.length + 1, ...run, createdAt: new Date().toISOString() };
      memoryStore.backtests.push(saved);
      return saved;
    }
  };
}

export function createStore(databaseUrl) {
  return databaseUrl ? withPool(databaseUrl) : withMemory();
}
