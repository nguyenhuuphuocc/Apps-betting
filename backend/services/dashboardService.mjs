import { avg, round } from "../lib/math.mjs";
import { addDays, nowIso, todayIso } from "../lib/time.mjs";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sportLabelFromKey(sportKey = "basketball_nba") {
  const key = String(sportKey || "basketball_nba");
  if (key === "basketball_nba") return "NBA";
  if (key === "basketball_wnba") return "WNBA";
  if (key === "baseball_mlb") return "MLB";
  if (key === "icehockey_nhl") return "NHL";
  if (key === "americanfootball_nfl") return "NFL";
  if (key === "basketball_ncaab") return "NCAABB";
  if (key === "basketball_euroleague") return "EuroLeague";
  if (key.startsWith("soccer_")) return "Soccer";
  if (key.startsWith("tennis_")) return "Tennis";
  if (key.startsWith("golf_")) return "Golf";
  if (key === "boxing_boxing") return "Boxing";
  return "Other";
}

function gradeEv(value) {
  const ev = Number(value || 0);
  if (ev >= 3) return "green";
  if (ev >= 0.5) return "yellow";
  return "red";
}

function lineMovementSignals(opening, current) {
  if (opening == null || current == null) return null;
  const delta = Number(current) - Number(opening);
  const pct = opening === 0 ? 0 : (delta / Math.abs(Number(opening))) * 100;
  return {
    opening,
    current,
    delta: round(delta, 2),
    percent: round(pct, 2),
    steam: Math.abs(delta) >= 10,
    reverse: Math.sign(delta) !== 0
  };
}

function matchupAdvantage(game) {
  const offDef = (Number(game.home_offense || 112) - Number(game.away_defense || 112)) - (Number(game.away_offense || 112) - Number(game.home_defense || 112));
  const pace = Number(game.home_pace || 99) - Number(game.away_pace || 99);
  const reboundingProxy = Number(game.home_net || 0) - Number(game.away_net || 0);
  const turnoverProxy = pace * -0.08;
  const raw = offDef * 0.6 + pace * 0.25 + reboundingProxy * 0.3 + turnoverProxy;
  return {
    score: round(clamp(raw, -15, 15), 2),
    summary:
      raw > 3
        ? "Home side has the stronger matchup profile."
        : raw < -3
          ? "Away side has the stronger matchup profile."
          : "Matchup profile is close to neutral.",
    breakdown: {
      offDef: round(offDef, 2),
      pace: round(pace, 2),
      rebounding: round(reboundingProxy, 2),
      turnovers: round(turnoverProxy, 2)
    }
  };
}

function contextScore(game, injuriesHome, injuriesAway) {
  const restEdge = Number(game.home_rest_days || 1) - Number(game.away_rest_days || 1);
  const b2bPenalty = (game.is_back_to_back_home ? -1.25 : 0) - (game.is_back_to_back_away ? -1.25 : 0);
  const injuryImpact = (injuriesAway.length - injuriesHome.length) * 0.55;
  const playoffPressure = game.postseason ? 0.8 : 0;
  const score = round(clamp(restEdge * 1.4 + b2bPenalty + injuryImpact + playoffPressure, -10, 10), 2);
  return {
    score,
    summary: `Rest edge ${restEdge >= 0 ? "+" : ""}${restEdge}, injury edge ${injuryImpact >= 0 ? "+" : ""}${round(injuryImpact, 2)}, b2b impact ${round(b2bPenalty, 2)}.`
  };
}

function oddsPacket(openingRows, latestRows) {
  const opening = Object.fromEntries(openingRows.map((row) => [row.market_type, row]));
  const latest = Object.fromEntries(latestRows.map((row) => [row.market_type, row]));
  return {
    opening: {
      moneyline: opening.h2h
        ? {
            home: opening.h2h.home_price,
            away: opening.h2h.away_price,
            draw: opening.h2h.draw_price
          }
        : null,
      spread: opening.spreads ? opening.spreads.spread : null,
      spreadOdds: opening.spreads
        ? {
            home: opening.spreads.home_price,
            away: opening.spreads.away_price
          }
        : null,
      total: opening.totals ? opening.totals.total : null
      ,
      totalOdds: opening.totals
        ? {
            over: opening.totals.over_price,
            under: opening.totals.under_price
          }
        : null
    },
    current: {
      moneyline: latest.h2h
        ? {
            home: latest.h2h.home_price,
            away: latest.h2h.away_price,
            draw: latest.h2h.draw_price
          }
        : null,
      spread: latest.spreads ? latest.spreads.spread : null,
      spreadOdds: latest.spreads
        ? {
            home: latest.spreads.home_price,
            away: latest.spreads.away_price
          }
        : null,
      total: latest.totals ? latest.totals.total : null,
      totalOdds: latest.totals
        ? {
            over: latest.totals.over_price,
            under: latest.totals.under_price
          }
        : null
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

function safeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function impliedFromAmericanLocal(odds) {
  const price = Number(odds);
  if (!Number.isFinite(price) || price === 0) return null;
  return price > 0 ? 100 / (price + 100) : Math.abs(price) / (Math.abs(price) + 100);
}

function extractClosingPrice(game, prediction) {
  if (!game?.odds?.current || !prediction) return null;
  const pick = String(prediction.pick || "").toLowerCase();
  if (prediction.market_type === "Moneyline") {
    if (pick.includes(String(game.home_team_abbr || "").toLowerCase())) return safeNumber(game.odds.current.moneyline?.home, null);
    if (pick.includes(String(game.away_team_abbr || "").toLowerCase())) return safeNumber(game.odds.current.moneyline?.away, null);
    return null;
  }
  if (prediction.market_type === "Spread") {
    if (pick.includes(String(game.home_team_abbr || "").toLowerCase())) return safeNumber(game.odds.current.spreadOdds?.home, null);
    if (pick.includes(String(game.away_team_abbr || "").toLowerCase())) return safeNumber(game.odds.current.spreadOdds?.away, null);
    return safeNumber(game.odds.current.spreadOdds?.home, null);
  }
  if (prediction.market_type === "Total") {
    if (pick.includes("under")) return safeNumber(game.odds.current.totalOdds?.under, null);
    if (pick.includes("over")) return safeNumber(game.odds.current.totalOdds?.over, null);
    return null;
  }
  return null;
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
  const matchup = matchupAdvantage(game);
  const context = contextScore(game, injuriesHome, injuriesAway);
  const odds = oddsPacket(opening, latest);
  const mlMove = lineMovementSignals(odds.opening.moneyline?.home, odds.current.moneyline?.home);
  const totalMove = lineMovementSignals(odds.opening.total, odds.current.total);
  const sharpSignal = Boolean(
    (mlMove && Math.abs(mlMove.delta) >= 10 && Math.abs(context.score) < 2) ||
      (totalMove && Math.abs(totalMove.delta) >= 1.5)
  );

  return {
    ...game,
    sport: sportLabelFromKey(game.sport_key),
    league: game.league || sportLabelFromKey(game.sport_key),
    odds,
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
    },
    matchupAdvantage: matchup,
    context,
    marketIntel: {
      moneylineMove: mlMove,
      totalMove,
      sharpSignal: sharpSignal ? "Sharp signal detected" : null,
      trapWarning: sharpSignal && (!topPrediction || topPrediction.expected_value_pct < 1) ? "Public trap warning" : null
    },
    liveIntel:
      String(game.status).toLowerCase() === "live"
        ? {
            momentum: Number(game.home_score || 0) > Number(game.away_score || 0) ? game.home_team_abbr : game.away_team_abbr,
            livePaceVsExpected: round(
              (Number(game.period || 1) * 24
                ? ((Number(game.home_score || 0) + Number(game.away_score || 0)) / (Number(game.period || 1) * 12)) * 48
                : 0) - (Number(game.home_pace || 99) + Number(game.away_pace || 99)) / 2,
              2
            )
          }
        : null
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
      matchup: `${game.away_team_abbr || game.away_team_name || "Away"} at ${game.home_team_abbr || game.home_team_name || "Home"}`,
      score: `${game.away_score}-${game.home_score}`,
      closing_odds: game.odds.current,
      pick: game.topPrediction.pick,
      confidence: Number(game.topPrediction.confidence_score || 0),
      ev: Number(game.topPrediction.expected_value_pct || 0),
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
    evDistribution,
    confidenceVsActual: pastSummary.rows.map((row) => ({
      x: row.date,
      confidence: Number(row.confidence || 0),
      y: row.outcome === "win" ? 1 : row.outcome === "loss" ? 0 : 0.5
    }))
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

    const topPlays = allGames
      .flatMap((game) =>
        (game.predictions || []).map((prediction) => ({
          ...prediction,
          game_external_id: game.external_id,
          sport: game.sport,
          league: game.league,
          matchup: `${game.away_team_abbr || game.away_team_name || "Away"} at ${game.home_team_abbr || game.home_team_name || "Home"}`,
          injuriesUncertain: (game.injuries?.home?.length || 0) + (game.injuries?.away?.length || 0) >= 4
        }))
      )
      .filter(
        (prediction) =>
          Number(prediction.edge_pct || 0) >= 3 &&
          Number(prediction.confidence_score || 0) > 6 &&
          !prediction.injuriesUncertain
      )
      .sort((a, b) => Number(b.edge_pct || 0) - Number(a.edge_pct || 0))
      .slice(0, 8)
      .map((prediction) => ({
        ...prediction,
        evGrade: gradeEv(prediction.expected_value_pct)
      }));

    return {
      asOf: nowIso(),
      todayGames,
      liveGames,
      past: pastSummary,
      futureGames,
      charts: chartPayload(allGames, pastSummary, bankrollHistory),
      topPlays,
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
    return repo.getPredictionsBetween(from, to).map((prediction) => ({
      ...prediction,
      evGrade: gradeEv(prediction.expected_value_pct),
      valueGap: round(Number(prediction.model_probability || 0) - Number(prediction.implied_probability || 0), 2)
    }));
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
      },
      propModel: {
        points: {
          projected: round(statSummary(last5).points * 0.65 + statSummary(last10).points * 0.35, 2),
          overProbability: round(clamp(50 + (statSummary(last5).points - statSummary(last10).points) * 2.1, 5, 95), 2)
        },
        rebounds: {
          projected: round(statSummary(last5).rebounds * 0.62 + statSummary(last10).rebounds * 0.38, 2),
          overProbability: round(clamp(50 + (statSummary(last5).rebounds - statSummary(last10).rebounds) * 2.5, 5, 95), 2)
        },
        assists: {
          projected: round(statSummary(last5).assists * 0.62 + statSummary(last10).assists * 0.38, 2),
          overProbability: round(clamp(50 + (statSummary(last5).assists - statSummary(last10).assists) * 2.7, 5, 95), 2)
        }
      }
    };
  }

  function runBacktest({
    from = addDays(todayIso(), -45),
    to = todayIso(),
    label = "manual-run",
    sport = "all",
    league = "all",
    team = "all",
    betType = "all",
    minConfidence = null,
    minEv = null,
    maxBetsPerDay = null,
    maxDailyExposureUnits = null,
    maxUnitSize = null,
    skipInjuryUncertainty = true
  } = {}) {
    const settings = repo.getSettings();
    const confidenceFloor = minConfidence != null && Number.isFinite(Number(minConfidence))
      ? Number(minConfidence)
      : Number(settings.min_confidence_required || 6);
    const evFloor = minEv != null && Number.isFinite(Number(minEv)) ? Number(minEv) : Number(settings.min_ev_required || 3);
    const dailyMaxBets = maxBetsPerDay != null && Number.isFinite(Number(maxBetsPerDay))
      ? Number(maxBetsPerDay)
      : Number(settings.max_bets_per_day || 5);
    const dailyMaxExposure = maxDailyExposureUnits != null && Number.isFinite(Number(maxDailyExposureUnits))
      ? Number(maxDailyExposureUnits)
      : Number(settings.max_units_per_day || 8);
    const unitCap = maxUnitSize != null && Number.isFinite(Number(maxUnitSize))
      ? Number(maxUnitSize)
      : Number(settings.max_units_per_bet || 3);

    const games = repo.getGamesBetween(from, to).map((game) => gameWithAnalytics(repo, game));
    const gameMap = new Map(games.map((game) => [game.external_id, game]));
    const predictions = repo
      .getPredictionsBetween(from, to)
      .slice()
      .sort((a, b) => `${a.date} ${a.created_at}`.localeCompare(`${b.date} ${b.created_at}`));

    const exposureByDay = new Map();
    const betsByDay = new Map();
    const skipped = {
      missing_game: 0,
      not_final: 0,
      sport_mismatch: 0,
      lookahead_bias: 0,
      missing_odds: 0,
      low_confidence: 0,
      low_ev: 0,
      negative_edge: 0,
      injury_uncertainty: 0,
      bet_type: 0,
      league: 0,
      team: 0,
      max_bets_per_day: 0,
      max_daily_exposure: 0
    };

    const graded = [];
    for (const prediction of predictions) {
      const game = gameMap.get(prediction.game_external_id);
      if (!game) {
        skipped.missing_game += 1;
        continue;
      }
      if (String(game.status).toLowerCase() !== "final") {
        skipped.not_final += 1;
        continue;
      }

      if (sport !== "all" && String(game.sport || sportLabelFromKey(game.sport_key)).toLowerCase() !== String(sport).toLowerCase()) {
        skipped.sport_mismatch += 1;
        continue;
      }
      if (league !== "all" && String(game.league || "NBA").toLowerCase() !== String(league).toLowerCase()) {
        skipped.league += 1;
        continue;
      }
      if (betType !== "all" && String(prediction.market_type || "").toLowerCase() !== String(betType).toLowerCase()) {
        skipped.bet_type += 1;
        continue;
      }
      if (
        team !== "all" &&
        ![String(game.home_team_abbr || ""), String(game.away_team_abbr || ""), String(game.home_team_name || ""), String(game.away_team_name || "")]
          .map((item) => item.toLowerCase())
          .includes(String(team).toLowerCase())
      ) {
        skipped.team += 1;
        continue;
      }

      const expectedStart = game.commence_time || `${game.date}T00:00:00Z`;
      if (new Date(prediction.created_at).getTime() > new Date(expectedStart).getTime()) {
        skipped.lookahead_bias += 1;
        continue;
      }

      const confidence = Number(prediction.confidence_score || 0);
      const edge = Number(prediction.edge_pct || 0);
      if (confidence < confidenceFloor) {
        skipped.low_confidence += 1;
        continue;
      }
      if (edge < evFloor) {
        skipped.low_ev += 1;
        continue;
      }
      if (Number(prediction.expected_value_pct || 0) <= 0) {
        skipped.negative_edge += 1;
        continue;
      }

      const injuryCount = (game.injuries?.home?.length || 0) + (game.injuries?.away?.length || 0);
      if (skipInjuryUncertainty && injuryCount >= 4) {
        skipped.injury_uncertainty += 1;
        continue;
      }

      const closingPrice = extractClosingPrice(game, prediction);
      if (!Number.isFinite(closingPrice)) {
        skipped.missing_odds += 1;
        continue;
      }

      const stakeUnits = clamp(Number(prediction.suggested_units || 0), 0, unitCap);
      if (stakeUnits <= 0) continue;

      const dayKey = game.date;
      const usedBets = betsByDay.get(dayKey) || 0;
      const usedExposure = exposureByDay.get(dayKey) || 0;
      if (usedBets >= dailyMaxBets) {
        skipped.max_bets_per_day += 1;
        continue;
      }
      if (usedExposure + stakeUnits > dailyMaxExposure) {
        skipped.max_daily_exposure += 1;
        continue;
      }

      const outcome = predictionOutcome(game, prediction);
      if (!["win", "loss", "push"].includes(outcome)) continue;
      const pnl = pnlUnits({ ...prediction, suggested_units: stakeUnits }, outcome);
      betsByDay.set(dayKey, usedBets + 1);
      exposureByDay.set(dayKey, round(usedExposure + stakeUnits, 2));

      const closeImplied = impliedFromAmericanLocal(closingPrice);
      const openImplied = Number(prediction.implied_probability || 0) / 100;
      const clv = closeImplied != null ? round((openImplied - closeImplied) * 100, 2) : null;

      graded.push({
        prediction,
        game,
        outcome,
        pnl,
        stakeUnits,
        clv,
        closeImplied: closeImplied == null ? null : round(closeImplied * 100, 2),
        closingPrice
      });
    }

    const wins = graded.filter((row) => row.outcome === "win").length;
    const losses = graded.filter((row) => row.outcome === "loss").length;
    const pushes = graded.filter((row) => row.outcome === "push").length;
    const staked = round(graded.reduce((sum, row) => sum + Number(row.stakeUnits || 0), 0), 2);
    const units = round(graded.reduce((sum, row) => sum + Number(row.pnl || 0), 0), 2);
    const winRate = wins + losses ? round((wins / (wins + losses)) * 100, 2) : 0;
    const roi = staked ? round((units / staked) * 100, 2) : 0;
    const byType = new Map();
    for (const row of graded) {
      const type = row.prediction.market_type;
      byType.set(type, (byType.get(type) || 0) + row.pnl);
    }
    const sorted = [...byType.entries()].sort((a, b) => b[1] - a[1]);
    const strategyComparison = [...byType.entries()].map(([marketType, pnl]) => {
      const subset = graded.filter((row) => row.prediction.market_type === marketType);
      const winsType = subset.filter((row) => row.outcome === "win").length;
      const lossesType = subset.filter((row) => row.outcome === "loss").length;
      const stakedType = subset.reduce((sum, row) => sum + Number(row.stakeUnits || 0), 0);
      return {
        marketType,
        bets: subset.length,
        winRate: winsType + lossesType ? round((winsType / (winsType + lossesType)) * 100, 2) : 0,
        roi: stakedType ? round((pnl / stakedType) * 100, 2) : 0,
        pnl: round(pnl, 2)
      };
    });

    const bankrollCurve = [];
    const drawdownCurve = [];
    let running = 0;
    let peak = 0;
    for (const row of graded) {
      running += Number(row.pnl || 0);
      peak = Math.max(peak, running);
      const dd = running - peak;
      bankrollCurve.push({
        x: row.game.date,
        y: round(running, 2),
        type: row.prediction.market_type
      });
      drawdownCurve.push({
        x: row.game.date,
        y: round(dd, 2)
      });
    }

    const decided = graded.filter((row) => row.outcome === "win" || row.outcome === "loss");
    const brier = decided.length
      ? round(
          decided.reduce((sum, row) => {
            const p = clamp(Number(row.prediction.model_probability || 50) / 100, 0.01, 0.99);
            const y = row.outcome === "win" ? 1 : 0;
            return sum + (p - y) ** 2;
          }, 0) / decided.length,
          4
        )
      : null;
    const calibrationMae = decided.length
      ? round(
          decided.reduce((sum, row) => {
            const p = Number(row.prediction.model_probability || 50);
            const y = row.outcome === "win" ? 100 : 0;
            return sum + Math.abs(p - y);
          }, 0) / decided.length,
          2
        )
      : null;
    const avgPredicted = decided.length
      ? round(decided.reduce((sum, row) => sum + Number(row.prediction.model_probability || 0), 0) / decided.length, 2)
      : null;
    const avgActual = decided.length ? round((wins / decided.length) * 100, 2) : null;

    const oddsBands = [
      { label: "Fav <= -200", min: -10000, max: -200 },
      { label: "-199 to -120", min: -199, max: -120 },
      { label: "-119 to +120", min: -119, max: 120 },
      { label: "+121 to +250", min: 121, max: 250 },
      { label: "Dog 251+", min: 251, max: 10000 }
    ];
    const byOddsRange = oddsBands.map((band) => {
      const subset = graded.filter((row) => Number(row.closingPrice || 0) >= band.min && Number(row.closingPrice || 0) <= band.max);
      const winsBand = subset.filter((row) => row.outcome === "win").length;
      const lossesBand = subset.filter((row) => row.outcome === "loss").length;
      const stakedBand = subset.reduce((sum, row) => sum + Number(row.stakeUnits || 0), 0);
      const pnlBand = subset.reduce((sum, row) => sum + Number(row.pnl || 0), 0);
      return {
        label: band.label,
        bets: subset.length,
        winRate: winsBand + lossesBand ? round((winsBand / (winsBand + lossesBand)) * 100, 2) : 0,
        roi: stakedBand ? round((pnlBand / stakedBand) * 100, 2) : 0
      };
    });

    const byTeam = new Map();
    for (const row of graded) {
      const awayLabel = row.game.away_team_abbr || row.game.away_team_name || "Away";
      const homeLabel = row.game.home_team_abbr || row.game.home_team_name || "Home";
      const key = `${awayLabel} @ ${homeLabel}`;
      if (!byTeam.has(key)) byTeam.set(key, { bets: 0, pnl: 0 });
      const current = byTeam.get(key);
      current.bets += 1;
      current.pnl += Number(row.pnl || 0);
      byTeam.set(key, current);
    }

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
      result_payload: JSON.stringify({
        bets: graded.map((row) => ({
          date: row.game.date,
          sport: row.game.sport,
          league: row.game.league,
          game_external_id: row.prediction.game_external_id,
          matchup: `${row.game.away_team_abbr || row.game.away_team_name || "Away"} at ${row.game.home_team_abbr || row.game.home_team_name || "Home"}`,
          market_type: row.prediction.market_type,
          betType: row.prediction.market_type,
          type: row.prediction.market_type,
          pick: row.prediction.pick,
          odds: row.closingPrice,
          close_implied_probability: row.closeImplied,
          clv: row.clv,
          stake_units: row.stakeUnits,
          confidence: row.prediction.confidence_score,
          model_probability: row.prediction.model_probability,
          edge_pct: row.prediction.edge_pct,
          expected_value_pct: row.prediction.expected_value_pct,
          outcome: row.outcome,
          pnl: row.pnl
        })),
        bankrollCurve,
        drawdownCurve,
        strategyComparison,
        byOddsRange,
        byTeam: [...byTeam.entries()].map(([teamKey, value]) => ({
          team: teamKey,
          bets: value.bets,
          pnl: round(value.pnl, 2)
        })),
        modelEvaluation: {
          brierScore: brier,
          calibrationMae: calibrationMae,
          avgPredictedWinProbability: avgPredicted,
          actualWinRate: avgActual
        },
        diagnostics: {
          confidenceFloor,
          evFloor,
          dailyMaxBets,
          dailyMaxExposure,
          unitCap,
          skipped
        }
      }),
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
