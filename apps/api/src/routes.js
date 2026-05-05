import { Router } from "express";

export function createRoutes({ env, service, io }) {
  const router = Router();

  router.get("/health", async (_req, res) => {
    res.json({
      ok: true,
      now: new Date().toISOString(),
      keys: {
        odds: Boolean(env.ODDS_API_KEY),
        balldontlie: Boolean(env.BALLDONTLIE_API_KEY)
      }
    });
  });

  router.get("/api/v1/status", async (_req, res) => {
    res.json({
      provider: "odds+balldontlie",
      supportedSports: env.supportedSportKeys,
      cacheTtlSeconds: env.CACHE_TTL_SECONDS,
      realtime: true,
      warnings: !env.ODDS_API_KEY ? ["ODDS_API_KEY missing"] : []
    });
  });

  router.post("/api/v1/sync", async (_req, res) => {
    const eventsSynced = await service.syncOddsSnapshot();
    const predictions = await service.generatePredictions();
    io.emit("sync:complete", {
      at: new Date().toISOString(),
      eventsSynced,
      predictions: predictions.length
    });
    res.json({ ok: true, eventsSynced, predictions: predictions.length });
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

  router.get("/api/v1/line-movement/:eventId", async (req, res) => {
    const data = await service.lineMovement(req.params.eventId);
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

  router.post("/api/v1/backtest", async (req, res) => {
    const from = String(req.body.from ?? new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10));
    const to = String(req.body.to ?? new Date().toISOString().slice(0, 10));
    const strategyName = String(req.body.strategyName ?? "+EV only");
    const minEdge = Number(req.body.minEdge ?? 1);
    const data = await service.runBacktest({ strategyName, from, to, minEdge });
    res.json(data);
  });

  return router;
}
