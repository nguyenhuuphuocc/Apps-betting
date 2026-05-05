import { avg, round } from "../lib/math.mjs";
import { addDays, nowIso, todayIso } from "../lib/time.mjs";

function oddsPacket(openingRows, latestRows) {
  const opening = Object.fromEntries(openingRows.map((row) => [row.market_type, row]));
  const latest = Object.fromEntries(latestRows.map((row) => [row.market_type, row]));
  return {
    opening: {
      moneyline: opening.h2h
        ? {
            home: opening.h2h.home_price,
            away: opening.h2h.away_price
          }
        : null,
      spread: opening.spreads ? opening.spreads.spread : null,
      total: opening.totals ? opening.totals.total : null
    },
    current: {
      moneyline: latest.h2h
        ? {
            home: latest.h2h.home_price,
            away: latest.h2h.away_price
          }
        : null,
      spread: latest.spreads ? latest.spreads.spread : null,
      total: latest.totals ? latest.totals.total : null
    }
  };
}

function bestPrediction(predictions) {
  if (!predictions.length) return null;
  return predictions
    .slice()
    .sort((a, b) => {
      if (a.recommendation === "Bet" && b.recommendation !== "Bet") return -1;
      if (a.recommendation !== "Bet" && b.recommendation === "Bet") return 1;
      return Number(b.expected_value_pct || 0) - Number(a.expected_value_pct || 0);
    })[0];
}

function predictionOutcome(game, prediction) {
  if (!prediction) return null;
  if (String(game.status).toLowerCase() !== "final") return "pending";

  const homeMargin = Number(game.home_score) - Number(game.away_score);
  const total = Number(game.home_score) + Number(game.away_score);
  const pick = String(prediction.pick || "").toLowerCase();
  if (prediction.market_type === "Moneyline") {
    const homePick = pick.includes((game.home_team_abbr || "").toLowerCase());
    const awayPick = pick.includes((game.away_team_abbr || "").toLowerCase());
    const winner = homeMargin > 0 ? "home" : homeMargin < 0 ? "away" : "push";
    if (winner === "push") return "push";
    if (homePick && winner === "home") return "win";
    if (awayPick && winner === "away") return "win";
    return "loss";
  }
  if (prediction.market_type === "Spread") {
    const spreadValue = Number(String(prediction.pick).match(/([+-]?\d+(\.\d+)?)/)?.[1] || 0);
    const cover = homeMargin + spreadValue;
    if (cover === 0) return "push";
    return cover > 0 ? "win" : "loss";
  }
  if (prediction.market_type === "Total") {
    const line = Number(String(prediction.pick).match(/(\d+(\.\d+)?)/)?.[1] || 0);
    if (pick.includes("under")) {
      if (total < line) return "win";
      if (total === line) return "push";
      return "loss";
    }
    if (pick.includes("over")) {
      if (total > line) return "win";
      if (total === line) return "push";
      return "loss";
    }
  }
  return "pending";
}

function pnlUnits(prediction, outcome) {
  if (!prediction || !Number.isFinite(Number(prediction.suggested_units))) return 0;
  const units = Number(prediction.suggested_units);
  if (outcome === "loss") return -units;
  if (outcome === "push" || outcome === "pending") return 0;
  const oddsHint = Number(prediction.implied_probability || 50);
  if (!Number.isFinite(oddsHint) || oddsHint <= 0) return units * 0.9;
  const decimal = 100 / oddsHint;
  return round(units * (decimal - 1), 2);
}

function gameWithAnalytics(repo, game) {
  const openingOddsRows = repo.getOpeningOddsForGame(game.external_id);
  const latestOddsRows = repo.getLatestOddsForGame(game.external_id);
  const opening = openingRowsByMarket(openingOddsRows);
  const latest = latestRowsByMarket(latestOddsRows);
  const predictions = repo.getPredictionsForGame(game.external_id);
  const moneylineModel = predictions.find((prediction) => prediction.market_type === "Moneyline");
  const topPrediction = bestPrediction(predictions);
  const injuriesHome = repo.getInjuriesByTeam(game.home_team_external_id);
  const injuriesAway = repo.getInjuriesByTeam(game.away_team_external_id);
  const h2h = repo.getHeadToHead(game.home_team_external_id, game.away_team_external_id, 10);
  const outcome = predictionOutcome(game, topPrediction);

  return {
    ...game,
    odds: oddsPacket(opening, latest),
    predictions,
    model: {
      homeWin:
        moneylineModel && String(moneylineModel.pick || "").includes(String(game.home_team_abbr || ""))
          ? Number(moneylineModel.model_probability || 50)
          : moneylineModel
            ? round(100 - Number(moneylineModel.model_probability || 50), 2)
            : 50,
      awayWin:
        moneylineModel && String(moneylineModel.pick || "").includes(String(game.away_team_abbr || ""))
          ? Number(moneylineModel.model_probability || 50)
          : moneylineModel
            ? round(100 - Number(moneylineModel.model_probability || 50), 2)
            : 50
    },
    topPrediction,
    injuries: {
      home: injuriesHome,
      away: injuriesAway
    },
    rest: {
      home: game.home_rest_days,
      away: game.away_rest_days
    },
    backToBack: {
      home: Boolean(game.is_back_to_back_home),
      away: Boolean(game.is_back_to_back_away)
    },
    h2h: {
      sample: h2h.length,
      homeWins: h2h.filter((item) => {
        const homeWon = item.home_score > item.away_score;
        return (
          (homeWon && item.home_team_external_id === game.home_team_external_id) ||
          (!homeWon && item.away_team_external_id === game.home_team_external_id)
        );
      }).length
    },
    evaluation: {
      outcome,
      pnlUnits: pnlUnits(topPrediction, outcome)
    }
  };
}

function openingRowsByMarket(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.market_type) || map.get(row.market_type).captured_at > row.captured_at) {
      map.set(row.market_type, row);
    }
  }
  return [...map.values()];
}

function latestRowsByMarket(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.market_type) || map.get(row.market_type).captured_at < row.captured_at) {
      map.set(row.market_type, row);
    }
  }
  return [...map.values()];
}

function summarizePastGames(pastGames) {
  const resolved = pastGames
    .filter((game) => game.topPrediction)
    .map((game) => ({
      game_external_id: game.external_id,
      date: game.date,
      matchup: `${game.away_team_abbr} at ${game.home_team_abbr}`,
      score: `${game.away_score}-${game.home_score}`,
      closing_odds: game.odds.current,
      pick: game.topPrediction.pick,
      outcome: game.evaluation.outcome,
      pnl_units: game.evaluation.pnlUnits,
      note:
        game.evaluation.outcome === "win"
          ? "Prediction aligned with game script and closing number."
          : game.evaluation.outcome === "loss"
            ? "Model miss: recheck injury and pace assumptions."
            : "No graded outcome."
    }));

  const wins = resolved.filter((item) => item.outcome === "win").length;
  const losses = resolved.filter((item) => item.outcome === "loss").length;
  const pushes = resolved.filter((item) => item.outcome === "push").length;
  const units = round(resolved.reduce((sum, item) => sum + item.pnl_units, 0), 2);
  const graded = wins + losses;
  const accuracy = graded ? round((wins / graded) * 100, 2) : 0;
  const roi = graded ? round((units / Math.max(graded, 1)) * 100, 2) : 0;

  return {
    rows: resolved,
    metrics: {
      wins,
      losses,
      pushes,
      accuracy,
      units,
      roi
    }
  };
}

function chartPayload(allGames, pastSummary, bankrollHistory) {
  const profitSeries = pastSummary.rows
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce(
      (acc, row) => {
        const running = (acc.at(-1)?.y || 0) + row.pnl_units;
        acc.push({ x: row.date, y: round(running, 2) });
        return acc;
      },
      []
    );

  const winRateSeries = pastSummary.rows
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce(
      (acc, row) => {
        const wins = (acc.at(-1)?.wins || 0) + (row.outcome === "win" ? 1 : 0);
        const losses = (acc.at(-1)?.losses || 0) + (row.outcome === "loss" ? 1 : 0);
        const graded = wins + losses;
        acc.push({
          x: row.date,
          y: graded ? round((wins / graded) * 100, 2) : 0,
          wins,
          losses
        });
        return acc;
      },
      []
    )
    .map((item) => ({ x: item.x, y: item.y }));

  const evDistribution = allGames
    .flatMap((game) => game.predictions || [])
    .map((prediction) => Number(prediction.expected_value_pct || 0));

  return {
    profitOverTime: profitSeries,
    winRateOverTime: winRateSeries,
    bankroll: bankrollHistory
      .slice()
      .reverse()
      .map((row) => ({ x: row.captured_at.slice(0, 10), y: row.bankroll })),
    evDistribution
  };
}

export function createDashboardService(repo) {
  function getLiveDashboard({ date = todayIso() } = {}) {
    const from = addDays(date, -7);
    const to = addDays(date, 10);
    const allGames = repo.getGamesBetween(from, to).map((game) => gameWithAnalytics(repo, game));

    const todayGames = allGames.filter((game) => game.date === date);
    const liveGames = todayGames.filter((game) => game.status === "live");
    const pastGames = allGames.filter((game) => game.status === "final" && game.date <= date);
    const futureGames = allGames.filter((game) => game.status !== "final" && game.date >= date);
    const pastSummary = summarizePastGames(pastGames);
    const bankrollHistory = repo.getBankrollHistory(180);
    const settings = repo.getSettings();

    return {
      asOf: nowIso(),
      todayGames,
      liveGames,
      past: pastSummary,
      futureGames,
      charts: chartPayload(allGames, pastSummary, bankrollHistory),
      settings: {
        bankroll: settings.bankroll_current,
        unitPercent: settings.unit_percent,
        maxSingleBetPercent: settings.max_single_bet_percent,
        refresh: {
          liveSeconds: settings.live_refresh_seconds,
          oddsMinutes: settings.odds_refresh_minutes,
          scheduledHours: settings.scheduled_refresh_hours,
          injuriesMinutes: settings.injuries_refresh_minutes
        }
      },
      safety: [
        "Predictions are not guaranteed.",
        "Bet responsibly.",
        "This tool is for analysis and education only.",
        "No bet is recommended unless positive expected value is detected."
      ],
      aggregate: {
        gamesTracked: allGames.length,
        todayCount: todayGames.length,
        liveCount: liveGames.length,
        futureCount: futureGames.length,
        predictedBets: allGames.reduce((sum, game) => sum + (game.predictions || []).length, 0),
        modelAccuracy: pastSummary.metrics.accuracy,
        roi: pastSummary.metrics.roi
      }
    };
  }

  function getPastGames({ from = addDays(todayIso(), -14), to = todayIso() } = {}) {
    const games = repo.getGamesBetween(from, to).map((game) => gameWithAnalytics(repo, game));
    const finals = games.filter((game) => game.status === "final");
    return summarizePastGames(finals);
  }

  function getFutureGames({ from = todayIso(), to = addDays(todayIso(), 14) } = {}) {
    return repo
      .getGamesBetween(from, to)
      .map((game) => gameWithAnalytics(repo, game))
      .filter((game) => game.status !== "final");
  }

  function getPredictions({ from = todayIso(), to = addDays(todayIso(), 7) } = {}) {
    return repo.getPredictionsBetween(from, to);
  }

  function getPlayerAnalysis(playerExternalId, opponentTeamExternalId = null) {
    const recent = repo.getPlayerRecentStats(playerExternalId, 30);
    const last5 = recent.slice(0, 5);
    const last10 = recent.slice(0, 10);
    const versusOpponent = opponentTeamExternalId
      ? recent.filter((row) => row.team_external_id === Number(opponentTeamExternalId))
      : [];

    const statSummary = (rows) => ({
      points: round(avg(rows.map((row) => row.points)), 2),
      rebounds: round(avg(rows.map((row) => row.rebounds)), 2),
      assists: round(avg(rows.map((row) => row.assists)), 2),
      steals: round(avg(rows.map((row) => row.steals)), 2),
      blocks: round(avg(rows.map((row) => row.blocks)), 2),
      turnovers: round(avg(rows.map((row) => row.turnovers)), 2),
      minutes: round(avg(rows.map((row) => Number(String(row.minutes || "0").split(":")[0]))), 2),
      fg_pct: round(avg(rows.map((row) => row.fg_pct)), 3),
      fg3_pct: round(avg(rows.map((row) => row.fg3_pct)), 3),
      ft_pct: round(avg(rows.map((row) => row.ft_pct)), 3),
      usage_rate: round(avg(rows.map((row) => row.usage_rate)), 2),
      true_shooting_pct: round(avg(rows.map((row) => row.true_shooting_pct)), 3),
      consistency: round(
        100 -
          Math.min(
            100,
            avg(rows.map((row) => Math.abs(Number(row.points || 0) - avg(rows.map((item) => item.points)))))
          ),
        2
      )
    });

    return {
      playerExternalId: Number(playerExternalId),
      season: statSummary(recent),
      last5: statSummary(last5),
      last10: statSummary(last10),
      versusOpponent: statSummary(versusOpponent),
      samples: {
        season: recent.length,
        last5: last5.length,
        last10: last10.length,
        versusOpponent: versusOpponent.length
      },
      propLean: {
        points: round(statSummary(last5).points * 0.98 + statSummary(last10).points * 0.02, 2),
        rebounds: round(statSummary(last5).rebounds * 0.95 + statSummary(last10).rebounds * 0.05, 2),
        assists: round(statSummary(last5).assists * 0.95 + statSummary(last10).assists * 0.05, 2)
      }
    };
  }

  function runBacktest({ from = addDays(todayIso(), -45), to = todayIso(), label = "manual-run" } = {}) {
    const predictions = repo.getPredictionsBetween(from, to);
    const gameMap = new Map();
    for (const game of repo.getGamesBetween(from, to)) gameMap.set(game.external_id, game);

    const graded = predictions
      .map((prediction) => {
        const game = gameMap.get(prediction.game_external_id);
        if (!game || String(game.status).toLowerCase() !== "final") return null;
        const outcome = predictionOutcome(game, prediction);
        return {
          prediction,
          outcome,
          pnl: pnlUnits(prediction, outcome)
        };
      })
      .filter(Boolean);

    const wins = graded.filter((row) => row.outcome === "win").length;
    const losses = graded.filter((row) => row.outcome === "loss").length;
    const pushes = graded.filter((row) => row.outcome === "push").length;
    const units = round(graded.reduce((sum, row) => sum + row.pnl, 0), 2);
    const staked = round(graded.reduce((sum, row) => sum + Number(row.prediction.suggested_units || 0), 0), 2);
    const winRate = wins + losses ? round((wins / (wins + losses)) * 100, 2) : 0;
    const roi = staked ? round((units / staked) * 100, 2) : 0;
    const byType = new Map();
    for (const row of graded) {
      const type = row.prediction.market_type;
      byType.set(type, (byType.get(type) || 0) + row.pnl);
    }
    const sorted = [...byType.entries()].sort((a, b) => b[1] - a[1]);
    const result = {
      run_label: label,
      date_from: from,
      date_to: to,
      total_bets: graded.length,
      wins,
      losses,
      pushes,
      win_rate: winRate,
      roi,
      units_won_lost: units,
      best_bet_type: sorted[0]?.[0] || null,
      worst_bet_type: sorted.at(-1)?.[0] || null,
      result_payload: JSON.stringify(
        graded.map((row) => ({
          game_external_id: row.prediction.game_external_id,
          market_type: row.prediction.market_type,
          pick: row.prediction.pick,
          outcome: row.outcome,
          pnl: row.pnl
        }))
      ),
      created_at: nowIso()
    };
    repo.saveBacktestRun(result);
    return result;
  }

  return {
    getLiveDashboard,
    getPastGames,
    getFutureGames,
    getPredictions,
    getPlayerAnalysis,
    runBacktest
  };
}
