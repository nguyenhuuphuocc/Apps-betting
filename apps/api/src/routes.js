import { randomUUID } from "node:crypto";
import { Router } from "express";

const userSettingsMemory = new Map();
const alertsMemory = [];

function dayMinus(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function dayPlus(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function createRoutes({ env, service, chatService, io }) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({
      ok: true,
      service: "Betting Intelligence API",
      message: "API is running. Use /health or /api/v1/status for diagnostics.",
      now: new Date().toISOString()
    });
  });

  router.get("/health", async (_req, res) => {
    res.json({
      ok: true,
      now: new Date().toISOString(),
      keys: {
        odds: Boolean(env.ODDS_API_KEY),
        balldontlie: Boolean(env.BALLDONTLIE_API_KEY),
        openai: Boolean(env.OPENAI_API_KEY)
      }
    });
  });

  router.get("/api/v1/status", async (_req, res) => {
    res.json({
      provider: "odds+balldontlie",
      supportedSports: env.supportedSportKeys,
      cacheTtlSeconds: env.CACHE_TTL_SECONDS,
      realtime: true,
      warnings: [
        ...(!env.ODDS_API_KEY ? ["ODDS_API_KEY missing"] : []),
        ...(!env.BALLDONTLIE_API_KEY ? ["BALLDONTLIE_API_KEY missing"] : []),
        ...(!env.OPENAI_API_KEY ? ["OPENAI_API_KEY missing (chat uses fallback mode)"] : [])
      ]
    });
  });

  router.post("/api/v1/sync", async (_req, res) => {
    const sportKey = _req.query.sportKey ? String(_req.query.sportKey) : (_req.body?.sportKey ? String(_req.body.sportKey) : null);
    const syncResult = await service.syncOddsSnapshot({
      sportKeys: sportKey ? [sportKey] : null
    });
    const predictions = await service.generatePredictions();
    io.emit("sync:complete", {
      at: new Date().toISOString(),
      eventsSynced: syncResult.eventsSynced,
      predictions: predictions.length
    });
    res.json({
      ok: true,
      ...syncResult,
      predictions: predictions.length
    });
  });

  router.get("/api/v1/live-games", async (req, res) => {
    const sportKey = req.query.sportKey ? String(req.query.sportKey) : null;
    const data = await service.liveGames(sportKey);
    res.json(data);
  });

  router.get("/api/v1/ev-bets", async (req, res) => {
    const minEdge = Number(req.query.minEdge ?? 1);
    const minConfidence = Number(req.query.minConfidence ?? 6);
    const data = await service.plusEvBets({ minEdge, minConfidence });
    res.json(data);
  });

  router.get("/api/v1/predictions", async (req, res) => {
    const minEdge = Number(req.query.minEdge ?? 1);
    const minConfidence = Number(req.query.minConfidence ?? 6);
    res.json(await service.plusEvBets({ minEdge, minConfidence }));
  });

  router.get("/api/v1/line-movement/:eventId", async (req, res) => {
    const data = await service.lineMovement(req.params.eventId);
    res.json(data);
  });

  router.get("/api/v1/sharp-money", async (req, res) => {
    const sportKey = req.query.sportKey ? String(req.query.sportKey) : null;
    const data = await service.sharpMoney({ sportKey });
    res.json(data);
  });

  router.get("/api/v1/odds-comparison", async (req, res) => {
    const eventId = req.query.eventId ? String(req.query.eventId) : null;
    const sportKey = req.query.sportKey ? String(req.query.sportKey) : null;
    const data = await service.oddsComparison({ eventId, sportKey });
    res.json(data);
  });

  router.get("/api/v1/team/:teamId/analytics", async (req, res) => {
    const data = await service.teamAnalytics({ teamId: req.params.teamId });
    res.json(data);
  });

  router.get("/api/v1/player/:playerId/analytics", async (req, res) => {
    const data = await service.playerAnalytics({ playerId: req.params.playerId });
    res.json(data);
  });

  router.get("/api/v1/game/:eventId/analysis", async (req, res) => {
    const data = await service.gameAnalysis(req.params.eventId);
    res.json(data);
  });

  router.post("/api/v1/backtest", async (req, res) => {
    const from = String(req.body.from ?? dayMinus(90));
    const to = String(req.body.to ?? dayPlus(0));
    const strategyName = String(req.body.strategyName ?? "+EV only");
    const minEdge = Number(req.body.minEdge ?? 1);
    const minConfidence = Number(req.body.minConfidence ?? 6);
    const startingBankroll = Number(req.body.startingBankroll ?? 1000);
    const unitSizePct = Number(req.body.unitSizePct ?? 1);
    const maxDailyExposurePct = Number(req.body.maxDailyExposurePct ?? 5);
    const data = await service.runBacktest({
      strategyName,
      from,
      to,
      minEdge,
      minConfidence,
      startingBankroll,
      unitSizePct,
      maxDailyExposurePct
    });
    res.json(data);
  });

  router.get("/api/v1/bankroll", async (req, res) => {
    const userId = req.query.userId ? String(req.query.userId) : null;
    const data = await service.bankrollSummary({ userId });
    res.json(data);
  });

  router.post("/api/v1/bankroll", async (req, res) => {
    const userId = req.body.userId ? String(req.body.userId) : null;
    const amount = Number(req.body.amount ?? 0);
    const entryType = String(req.body.entryType ?? "adjustment");
    const note = req.body.note ? String(req.body.note) : null;
    const row = await service.addBankrollEntry({ userId, amount, entryType, note });
    res.json(row);
  });

  router.post("/api/v1/chat", async (req, res) => {
    const sessionId = req.body.sessionId ? String(req.body.sessionId) : randomUUID();
    const userId = req.body.userId ? String(req.body.userId) : null;
    const message = String(req.body.message ?? "").trim();
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }
    const data = await chatService.analyze({ sessionId, userId, message });
    res.json(data);
  });

  router.get("/api/v1/chat/history", async (req, res) => {
    const sessionId = String(req.query.sessionId ?? "");
    const limit = Number(req.query.limit ?? 40);
    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }
    const data = await chatService.history({ sessionId, limit });
    res.json(data);
  });

  router.post("/api/v1/bet-slip/analyze", async (req, res) => {
    const legs = Array.isArray(req.body.legs) ? req.body.legs : [];
    const totalLegs = legs.length;
    const riskScore = Math.min(100, 25 + totalLegs * 18);
    const weakestLeg = legs[legs.length - 1] ?? null;
    res.json({
      totalLegs,
      riskScore,
      bestLeg: legs[0] ?? null,
      weakestLeg,
      recommendation:
        totalLegs >= 3
          ? "Parlay risk is elevated. Consider splitting into smaller straight bets."
          : "Risk profile is moderate. Keep stake disciplined.",
      warnings: [
        "No parlay is guaranteed.",
        "Do not increase stake to recover losses."
      ]
    });
  });

  router.get("/api/v1/dashboard-summary", async (_req, res) => {
    const data = await service.dashboardSummary();
    res.json(data);
  });

  router.get("/api/v1/alerts", async (_req, res) => {
    res.json(alertsMemory.slice(-200));
  });

  router.post("/api/v1/alerts", async (req, res) => {
    const payload = {
      id: randomUUID(),
      type: String(req.body.type ?? "system"),
      title: String(req.body.title ?? "Alert"),
      body: String(req.body.body ?? ""),
      createdAt: new Date().toISOString()
    };
    alertsMemory.push(payload);
    res.json(payload);
  });

  router.get("/api/v1/user/settings", async (req, res) => {
    const userId = String(req.query.userId ?? "default");
    res.json(
      userSettingsMemory.get(userId) ?? {
        userId,
        bankroll: {
          unitSizePct: 1,
          maxDailyExposurePct: 5
        },
        risk: {
          minConfidence: 6,
          minEdgePct: 2
        }
      }
    );
  });

  router.post("/api/v1/user/settings", async (req, res) => {
    const userId = String(req.body.userId ?? "default");
    const settings = {
      userId,
      bankroll: req.body.bankroll ?? {},
      risk: req.body.risk ?? {},
      api: req.body.api ?? {},
      model: req.body.model ?? {},
      display: req.body.display ?? {},
      updatedAt: new Date().toISOString()
    };
    userSettingsMemory.set(userId, settings);
    res.json(settings);
  });

  router.get("/api/v1/admin/analytics", async (_req, res) => {
    const summary = await service.dashboardSummary();
    res.json({
      users: {
        active: 0,
        paying: 0,
        free: 0
      },
      usage: {
        chatMessages: 0,
        backtests: 0
      },
      predictionAccuracy: {
        note: "Requires long-horizon settled bet data.",
        placeholder: true
      },
      summary
    });
  });

  // Alias routes (non-versioned contract requested in spec)
  router.get("/api/games", async (req, res) => {
    const sportKey = req.query.sportKey ? String(req.query.sportKey) : null;
    res.json(await service.liveGames(sportKey));
  });
  router.get("/api/odds", async (req, res) => {
    const eventId = req.query.eventId ? String(req.query.eventId) : null;
    const sportKey = req.query.sportKey ? String(req.query.sportKey) : null;
    res.json(await service.oddsComparison({ eventId, sportKey }));
  });
  router.get("/api/predictions", async (req, res) => {
    const minEdge = Number(req.query.minEdge ?? 1);
    const minConfidence = Number(req.query.minConfidence ?? 6);
    res.json(await service.plusEvBets({ minEdge, minConfidence }));
  });
  router.get("/api/player-props", async (_req, res) => {
    res.json({ message: "Player props provider can be connected here.", items: [] });
  });
  router.get("/api/sharp-money", async (req, res) => {
    const sportKey = req.query.sportKey ? String(req.query.sportKey) : null;
    res.json(await service.sharpMoney({ sportKey }));
  });
  router.get("/api/ev-scanner", async (req, res) => {
    const minEdge = Number(req.query.minEdge ?? 1);
    const minConfidence = Number(req.query.minConfidence ?? 6);
    res.json(await service.plusEvBets({ minEdge, minConfidence }));
  });
  router.post("/api/backtest", async (req, res) => {
    const from = String(req.body.from ?? dayMinus(90));
    const to = String(req.body.to ?? dayPlus(0));
    const strategyName = String(req.body.strategyName ?? "+EV only");
    const minEdge = Number(req.body.minEdge ?? 1);
    const minConfidence = Number(req.body.minConfidence ?? 6);
    const startingBankroll = Number(req.body.startingBankroll ?? 1000);
    const unitSizePct = Number(req.body.unitSizePct ?? 1);
    const maxDailyExposurePct = Number(req.body.maxDailyExposurePct ?? 5);
    res.json(
      await service.runBacktest({
        strategyName,
        from,
        to,
        minEdge,
        minConfidence,
        startingBankroll,
        unitSizePct,
        maxDailyExposurePct
      })
    );
  });

  router.post("/api/sync", async (req, res) => {
    const sportKey = req.query.sportKey ? String(req.query.sportKey) : (req.body?.sportKey ? String(req.body.sportKey) : null);
    const syncResult = await service.syncOddsSnapshot({
      sportKeys: sportKey ? [sportKey] : null
    });
    const predictions = await service.generatePredictions();
    io.emit("sync:complete", {
      at: new Date().toISOString(),
      eventsSynced: syncResult.eventsSynced,
      predictions: predictions.length
    });
    res.json({
      ok: true,
      ...syncResult,
      predictions: predictions.length
    });
  });
  router.get("/api/bankroll", async (req, res) => {
    const userId = req.query.userId ? String(req.query.userId) : null;
    res.json(await service.bankrollSummary({ userId }));
  });
  router.post("/api/bankroll", async (req, res) => {
    const userId = req.body.userId ? String(req.body.userId) : null;
    const amount = Number(req.body.amount ?? 0);
    const entryType = String(req.body.entryType ?? "adjustment");
    const note = req.body.note ? String(req.body.note) : null;
    res.json(await service.addBankrollEntry({ userId, amount, entryType, note }));
  });
  router.post("/api/chat", async (req, res) => {
    const sessionId = req.body.sessionId ? String(req.body.sessionId) : randomUUID();
    const userId = req.body.userId ? String(req.body.userId) : null;
    const message = String(req.body.message ?? "").trim();
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }
    res.json(await chatService.analyze({ sessionId, userId, message }));
  });
  router.get("/api/chat/history", async (req, res) => {
    const sessionId = String(req.query.sessionId ?? "");
    const limit = Number(req.query.limit ?? 40);
    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }
    res.json(await chatService.history({ sessionId, limit }));
  });
  router.get("/api/alerts", async (req, res) => {
    res.json(alertsMemory.slice(-200));
  });
  router.post("/api/alerts", async (req, res) => {
    const payload = {
      id: randomUUID(),
      type: String(req.body.type ?? "system"),
      title: String(req.body.title ?? "Alert"),
      body: String(req.body.body ?? ""),
      createdAt: new Date().toISOString()
    };
    alertsMemory.push(payload);
    res.json(payload);
  });
  router.get("/api/user/settings", async (req, res) => {
    const userId = String(req.query.userId ?? "default");
    res.json(
      userSettingsMemory.get(userId) ?? {
        userId,
        bankroll: {
          unitSizePct: 1,
          maxDailyExposurePct: 5
        },
        risk: {
          minConfidence: 6,
          minEdgePct: 2
        }
      }
    );
  });
  router.post("/api/user/settings", async (req, res) => {
    const userId = String(req.body.userId ?? "default");
    const settings = {
      userId,
      bankroll: req.body.bankroll ?? {},
      risk: req.body.risk ?? {},
      api: req.body.api ?? {},
      model: req.body.model ?? {},
      display: req.body.display ?? {},
      updatedAt: new Date().toISOString()
    };
    userSettingsMemory.set(userId, settings);
    res.json(settings);
  });
  router.get("/api/admin/analytics", async (req, res) => {
    const summary = await service.dashboardSummary();
    res.json({
      users: {
        active: 0,
        paying: 0,
        free: 0
      },
      usage: {
        chatMessages: 0,
        backtests: 0
      },
      predictionAccuracy: {
        note: "Requires long-horizon settled bet data.",
        placeholder: true
      },
      summary
    });
  });

  return router;
}
