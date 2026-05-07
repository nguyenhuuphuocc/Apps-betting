import { Pool } from "pg";

const memoryStore = {
  events: [],
  predictions: [],
  oddsHistory: [],
  backtests: [],
  chatSessions: [],
  chatMessages: [],
  bankrollEntries: []
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
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT NOT NULL DEFAULT 'BetIQ session',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS chat_messages (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS bankroll_entries (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT,
        amount NUMERIC NOT NULL,
        entry_type TEXT NOT NULL,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_odds_event_time ON odds_snapshots (event_id, captured_at DESC);
      CREATE INDEX IF NOT EXISTS idx_predictions_event ON predictions (event_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_time ON chat_messages (session_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_bankroll_entries_user_time ON bankroll_entries (user_id, created_at DESC);
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
    },
    async upsertChatSession(session) {
      await pool.query(
        `
        INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at)
        VALUES ($1,$2,$3,NOW(),NOW())
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          title = EXCLUDED.title,
          updated_at = NOW()
      `,
        [session.id, session.userId ?? null, session.title ?? "BetIQ session"]
      );
    },
    async addChatMessage(message) {
      await pool.query(
        `
        INSERT INTO chat_messages (session_id, role, content, metadata, created_at)
        VALUES ($1,$2,$3,$4,NOW())
      `,
        [message.sessionId, message.role, message.content, message.metadata ?? {}]
      );
    },
    async getChatHistory(sessionId, limit = 40) {
      const result = await pool.query(
        `
        SELECT *
        FROM chat_messages
        WHERE session_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
        [sessionId, limit]
      );
      return result.rows.reverse();
    },
    async addBankrollEntry(entry) {
      const result = await pool.query(
        `
        INSERT INTO bankroll_entries (user_id, amount, entry_type, note, created_at)
        VALUES ($1,$2,$3,$4,NOW())
        RETURNING *
      `,
        [entry.userId ?? null, entry.amount, entry.entryType, entry.note ?? null]
      );
      return result.rows[0];
    },
    async getBankrollEntries(userId, limit = 200) {
      const result = await pool.query(
        `
        SELECT *
        FROM bankroll_entries
        WHERE ($1::text IS NULL OR user_id = $1)
        ORDER BY created_at DESC
        LIMIT $2
      `,
        [userId ?? null, limit]
      );
      return result.rows.reverse();
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
    },
    async upsertChatSession(session) {
      const idx = memoryStore.chatSessions.findIndex((row) => row.id === session.id);
      const payload = {
        id: session.id,
        userId: session.userId ?? null,
        title: session.title ?? "BetIQ session",
        updatedAt: new Date().toISOString()
      };
      if (idx >= 0) {
        memoryStore.chatSessions[idx] = {
          ...memoryStore.chatSessions[idx],
          ...payload
        };
      } else {
        memoryStore.chatSessions.push({
          ...payload,
          createdAt: new Date().toISOString()
        });
      }
    },
    async addChatMessage(message) {
      memoryStore.chatMessages.push({
        id: memoryStore.chatMessages.length + 1,
        session_id: message.sessionId,
        role: message.role,
        content: message.content,
        metadata: message.metadata ?? {},
        created_at: new Date().toISOString()
      });
    },
    async getChatHistory(sessionId, limit = 40) {
      return memoryStore.chatMessages
        .filter((row) => row.session_id === sessionId)
        .slice(-limit);
    },
    async addBankrollEntry(entry) {
      const payload = {
        id: memoryStore.bankrollEntries.length + 1,
        user_id: entry.userId ?? null,
        amount: entry.amount,
        entry_type: entry.entryType,
        note: entry.note ?? null,
        created_at: new Date().toISOString()
      };
      memoryStore.bankrollEntries.push(payload);
      return payload;
    },
    async getBankrollEntries(userId, limit = 200) {
      const rows = userId
        ? memoryStore.bankrollEntries.filter((row) => row.user_id === userId)
        : memoryStore.bankrollEntries;
      return rows.slice(-limit);
    }
  };
}

export function createStore(databaseUrl) {
  if (!databaseUrl) return withMemory();

  const poolStore = withPool(databaseUrl);
  const memoryStoreImpl = withMemory();
  let activeStore = poolStore;

  const call = (method) => async (...args) => activeStore[method](...args);

  return {
    get type() {
      return activeStore.type;
    },
    async init() {
      try {
        await poolStore.init();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `[db] Failed to initialize PostgreSQL (${error.message}). Falling back to in-memory store.`
        );
        activeStore = memoryStoreImpl;
        await activeStore.init();
      }
    },
    upsertEvents: call("upsertEvents"),
    saveOdds: call("saveOdds"),
    savePredictions: call("savePredictions"),
    latestEvents: call("latestEvents"),
    latestOddsByEvent: call("latestOddsByEvent"),
    oddsMovement: call("oddsMovement"),
    predictionRows: call("predictionRows"),
    saveBacktest: call("saveBacktest"),
    upsertChatSession: call("upsertChatSession"),
    addChatMessage: call("addChatMessage"),
    getChatHistory: call("getChatHistory"),
    addBankrollEntry: call("addBankrollEntry"),
    getBankrollEntries: call("getBankrollEntries")
  };
}
