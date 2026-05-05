import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

import { loadEnv } from "./backend/lib/env.mjs";
import { ensureDatabase } from "./backend/db/migrate.mjs";
import { createRepository } from "./backend/services/repository.mjs";
import { createBallDontLieClient } from "./backend/services/providers/balldontlie.mjs";
import { createOddsClient } from "./backend/services/providers/odds.mjs";
import { createSyncService } from "./backend/services/syncService.mjs";
import { createDashboardService } from "./backend/services/dashboardService.mjs";
import { impliedProbabilityFromAmerican, round } from "./backend/lib/math.mjs";
import { nowIso, todayIso } from "./backend/lib/time.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = __dirname;
const env = loadEnv(projectRoot);
const { db } = ensureDatabase(env.dbPath, projectRoot);
const repo = createRepository(db);
const balldontlie = createBallDontLieClient(env.balldontlieApiKey);
const odds = createOddsClient(env.oddsApiKey, env.oddsApiBaseUrl);
const syncService = createSyncService({ repo, balldontlie, odds });
const dashboardService = createDashboardService(repo);

function contentTypeFor(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "text/plain; charset=utf-8";
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(text);
}

function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      if (!chunks.length) return resolve({});
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function safeNumber(value, fallback = null) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function settlePnl(odds, stakeUnits, result) {
  const price = Number(odds);
  const stake = Number(stakeUnits);
  if (!Number.isFinite(price) || !Number.isFinite(stake)) return 0;
  if (result === "loss") return -stake;
  if (result === "push" || result === "open") return 0;
  const decimal = price > 0 ? 1 + price / 100 : 1 + 100 / Math.abs(price);
  return round(stake * (decimal - 1), 2);
}

function staticFilePath(urlPath) {
  const localPath = urlPath === "/" ? "/index.html" : urlPath;
  const fullPath = path.join(projectRoot, localPath);
  if (!fullPath.startsWith(projectRoot)) return null;
  return fullPath;
}

function mask(value) {
  if (!value) return "missing";
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-2)}`;
}

async function handleApi(request, response, parsedUrl) {
  const { pathname, searchParams } = parsedUrl;

  if (pathname === "/api/health" && request.method === "GET") {
    return sendJson(response, 200, {
      ok: true,
      now: nowIso(),
      sync: syncService.getStatus(),
      apiKeys: {
        balldontlie: Boolean(env.balldontlieApiKey),
        odds: Boolean(env.oddsApiKey)
      }
    });
  }

  if (pathname === "/api/status" && request.method === "GET") {
    return sendJson(response, 200, {
      sync: syncService.getStatus(),
      settings: repo.getSettings(),
      keys: {
        balldontlie: mask(env.balldontlieApiKey),
        odds: mask(env.oddsApiKey)
      }
    });
  }

  if (pathname === "/api/settings" && request.method === "GET") {
    return sendJson(response, 200, repo.getSettings());
  }

  if (pathname === "/api/settings" && request.method === "PUT") {
    const body = await parseRequestBody(request);
    const updated = repo.updateSettings({
      bankroll_starting: safeNumber(body.bankroll_starting),
      bankroll_current: safeNumber(body.bankroll_current),
      unit_percent: safeNumber(body.unit_percent),
      max_single_bet_percent: safeNumber(body.max_single_bet_percent),
      live_refresh_seconds: safeNumber(body.live_refresh_seconds),
      odds_refresh_minutes: safeNumber(body.odds_refresh_minutes),
      scheduled_refresh_hours: safeNumber(body.scheduled_refresh_hours),
      injuries_refresh_minutes: safeNumber(body.injuries_refresh_minutes)
    });
    return sendJson(response, 200, updated);
  }

  if (pathname === "/api/sync/run" && request.method === "POST") {
    await syncService.runFullSync();
    return sendJson(response, 200, {
      ok: true,
      sync: syncService.getStatus()
    });
  }

  if (pathname === "/api/dashboard/live" && request.method === "GET") {
    const date = searchParams.get("date") || todayIso();
    return sendJson(response, 200, dashboardService.getLiveDashboard({ date }));
  }

  if (pathname === "/api/games/past" && request.method === "GET") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    return sendJson(response, 200, dashboardService.getPastGames({ from, to }));
  }

  if (pathname === "/api/games/future" && request.method === "GET") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    return sendJson(response, 200, dashboardService.getFutureGames({ from, to }));
  }

  if (pathname === "/api/predictions" && request.method === "GET") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    return sendJson(response, 200, dashboardService.getPredictions({ from, to }));
  }

  if (pathname.startsWith("/api/players/") && pathname.endsWith("/analysis") && request.method === "GET") {
    const playerId = pathname.split("/")[3];
    const opponentTeamId = searchParams.get("opponentTeamId");
    return sendJson(response, 200, dashboardService.getPlayerAnalysis(playerId, opponentTeamId));
  }

  if (pathname === "/api/backtest/run" && request.method === "POST") {
    const body = await parseRequestBody(request);
    const result = dashboardService.runBacktest({
      from: body.from,
      to: body.to,
      label: body.label || "manual-run"
    });
    return sendJson(response, 200, result);
  }

  if (pathname === "/api/backtest/results" && request.method === "GET") {
    return sendJson(response, 200, repo.getBacktestRuns(50));
  }

  if (pathname === "/api/bets" && request.method === "GET") {
    return sendJson(response, 200, repo.listTrackedBets());
  }

  if (pathname === "/api/bets" && request.method === "POST") {
    const body = await parseRequestBody(request);
    const implied = impliedProbabilityFromAmerican(body.odds);
    const edge =
      Number.isFinite(Number(body.model_probability)) && implied !== null
        ? Number(body.model_probability) - implied * 100
        : null;
    const result = String(body.result || "open").toLowerCase();
    const normalizedResult = ["open", "win", "loss", "push"].includes(result) ? result : "open";
    repo.createBet({
      external_ref: body.external_ref || null,
      game_external_id: safeNumber(body.game_external_id),
      market_type: body.market_type || "Moneyline",
      pick: body.pick || "Unknown",
      odds: Number(body.odds),
      model_probability: safeNumber(body.model_probability),
      implied_probability: implied === null ? null : round(implied * 100, 2),
      edge_pct: edge === null ? null : round(edge, 2),
      stake_units: Number(body.stake_units || 0.5),
      result: normalizedResult,
      pnl_units: settlePnl(body.odds, body.stake_units || 0.5, normalizedResult),
      note: body.note || null
    });
    return sendJson(response, 201, { ok: true });
  }

  if (pathname.startsWith("/api/bets/") && pathname.endsWith("/result") && request.method === "PATCH") {
    const betId = Number(pathname.split("/")[3]);
    const body = await parseRequestBody(request);
    const result = String(body.result || "").toLowerCase();
    if (!["open", "win", "loss", "push"].includes(result)) {
      return sendJson(response, 400, { error: "result must be open, win, loss, or push" });
    }
    const bets = repo.listTrackedBets();
    const bet = bets.find((row) => Number(row.id) === betId);
    if (!bet) return sendJson(response, 404, { error: "Bet not found" });
    const pnl = settlePnl(bet.odds, bet.stake_units, result);
    repo.updateBetResult(betId, result, pnl, body.note || null);
    return sendJson(response, 200, { ok: true, pnl_units: pnl });
  }

  sendJson(response, 404, { error: "Not found" });
}

const server = http.createServer(async (request, response) => {
  try {
    if (!request.url) return sendText(response, 400, "Bad request");
    const parsedUrl = new URL(request.url, `http://localhost:${env.port}`);

    if (parsedUrl.pathname.startsWith("/api/")) {
      return handleApi(request, response, parsedUrl);
    }

    const filePath = staticFilePath(parsedUrl.pathname);
    if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const indexPath = path.join(projectRoot, "index.html");
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(fs.readFileSync(indexPath, "utf8"));
      return;
    }

    response.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
    response.end(fs.readFileSync(filePath));
  } catch (error) {
    sendJson(response, 500, {
      error: "Internal server error",
      detail: String(error?.message || error)
    });
  }
});

await syncService.runFullSync();
syncService.startAutoRefresh();

server.listen(env.port, () => {
  const settings = repo.getSettings();
  console.log(`Live betting analytics server running on http://localhost:${env.port}`);
  console.log(`SQLite: ${env.dbPath}`);
  console.log(
    `Refresh schedule -> live ${settings.live_refresh_seconds}s, odds ${settings.odds_refresh_minutes}m, scheduled ${settings.scheduled_refresh_hours}h, injuries ${settings.injuries_refresh_minutes}m`
  );
});

process.on("SIGINT", () => {
  syncService.stopAutoRefresh();
  db.close();
  process.exit(0);
});
