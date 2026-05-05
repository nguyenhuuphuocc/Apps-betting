import { cacheWrap } from "../lib/cache.js";
import {
  expectedValue,
  impliedProbabilityFromAmerican,
  kellyFraction
} from "./quant/evEngine.js";
import { predictEvent } from "./quant/predictionModel.js";

function norm(input) {
  return String(input ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function eventIdFromOdds(event) {
  return event.id || `${event.sport_key}-${norm(event.home_team)}-${norm(event.away_team)}-${String(event.commence_time).slice(0, 16)}`;
}

function sportTitleFromKey(sportKey = "") {
  if (sportKey === "basketball_nba") return "NBA";
  if (sportKey === "basketball_wnba") return "WNBA";
  if (sportKey === "baseball_mlb") return "MLB";
  if (sportKey === "icehockey_nhl") return "NHL";
  if (sportKey === "americanfootball_nfl") return "NFL";
  if (sportKey === "basketball_ncaab") return "NCAABB";
  if (sportKey === "basketball_euroleague") return "EuroLeague";
  if (sportKey.startsWith("soccer_")) return "Soccer";
  if (sportKey.startsWith("tennis_")) return "Tennis";
  if (sportKey.startsWith("golf_")) return "Golf";
  if (sportKey.startsWith("boxing_")) return "Boxing";
  return "Other";
}

function normalizeOddsRows(event) {
  const rows = [];
  for (const bookmaker of event.bookmakers || []) {
    for (const market of bookmaker.markets || []) {
      if (!["h2h", "spreads", "totals"].includes(market.key)) continue;
      const outcomes = market.outcomes || [];
      const home = outcomes.find((x) => norm(x.name) === norm(event.home_team));
      const away = outcomes.find((x) => norm(x.name) === norm(event.away_team));
      const draw = outcomes.find((x) => norm(x.name) === "draw");
      const over = outcomes.find((x) => norm(x.name) === "over");
      const under = outcomes.find((x) => norm(x.name) === "under");

      rows.push({
        eventId: eventIdFromOdds(event),
        sportsbook: bookmaker.key || bookmaker.title || "unknown",
        marketType: market.key,
        homePrice: home?.price ?? null,
        awayPrice: away?.price ?? null,
        drawPrice: draw?.price ?? null,
        spread: home?.point ?? null,
        total: over?.point ?? under?.point ?? null,
        overPrice: over?.price ?? null,
        underPrice: under?.price ?? null
      });
    }
  }
  return rows;
}

export function createDashboardService({ env, store, cache, oddsApi, ballDontLie }) {
  async function syncOddsSnapshot() {
    const allEvents = [];
    for (const sportKey of env.supportedSportKeys) {
      const markets = sportKey.startsWith("tennis_") || sportKey.startsWith("boxing_") || sportKey.startsWith("golf_")
        ? ["h2h"]
        : ["h2h", "spreads", "totals"];
      const { data: oddsEvents } = await cacheWrap(
        cache,
        `odds:${sportKey}`,
        env.CACHE_TTL_SECONDS,
        () => oddsApi.getOdds(sportKey, markets)
      );
      for (const event of oddsEvents) {
        allEvents.push({
          id: eventIdFromOdds(event),
          sportKey: sportKey,
          league: event.sport_title || sportTitleFromKey(sportKey),
          commenceTime: event.commence_time,
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          status: "scheduled"
        });
      }
      const rows = oddsEvents.flatMap(normalizeOddsRows);
      if (rows.length) await store.saveOdds(rows);
    }
    if (allEvents.length) await store.upsertEvents(allEvents);
    return allEvents.length;
  }

  async function generatePredictions() {
    const events = await store.latestEvents({ sportKey: null });
    const predictions = [];
    for (const event of events) {
      const oddsRows = await store.latestOddsByEvent(event.id);
      const moneyline = oddsRows.find((row) => row.market_type === "h2h" || row.marketType === "h2h");
      if (!moneyline?.home_price && !moneyline?.homePrice) continue;
      const homeOdds = Number(moneyline.home_price ?? moneyline.homePrice);
      const awayOdds = Number(moneyline.away_price ?? moneyline.awayPrice);
      const impliedHome = impliedProbabilityFromAmerican(homeOdds) ?? 0.5;

      const model = predictEvent({
        sportKey: event.sport_key ?? event.sportKey,
        context: {
          homeAdvantage: 0.07,
          formDiff: 0,
          injuryDiff: 0,
          paceDiff: 0,
          lineMove: 0
        },
        market: {
          impliedHome
        }
      });
      const homeEv = expectedValue({ winProbability: model.homeWinProbability, odds: homeOdds, stake: 1 });
      const awayEv = expectedValue({ winProbability: model.awayWinProbability, odds: awayOdds, stake: 1 });
      const takeHome = (homeEv ?? -999) >= (awayEv ?? -999);
      const selectedProbability = takeHome ? model.homeWinProbability : model.awayWinProbability;
      const selectedOdds = takeHome ? homeOdds : awayOdds;
      const implied = impliedProbabilityFromAmerican(selectedOdds) ?? 0;
      const edgePct = (selectedProbability - implied) * 100;
      const evPct = ((takeHome ? homeEv : awayEv) ?? 0) * 100;
      const units = kellyFraction({ probability: selectedProbability, odds: selectedOdds }) * 100;
      const confidence = model.confidence;
      const riskLevel = confidence >= 7.5 ? "Low" : confidence >= 6 ? "Medium" : "High";

      predictions.push({
        eventId: event.id,
        marketType: "Moneyline",
        pick: `${takeHome ? event.home_team ?? event.homeTeam : event.away_team ?? event.awayTeam} ML`,
        modelProbability: Number((selectedProbability * 100).toFixed(2)),
        impliedProbability: Number((implied * 100).toFixed(2)),
        edgePct: Number(edgePct.toFixed(2)),
        evPct: Number(evPct.toFixed(2)),
        confidence: Number(confidence.toFixed(2)),
        riskLevel,
        suggestedUnits: Number(Math.max(0, Math.min(3, units)).toFixed(2)),
        reason:
          edgePct > 0
            ? "Model probability exceeds market implied probability with positive expected value."
            : "No positive edge versus current market."
      });
    }
    if (predictions.length) await store.savePredictions(predictions);
    return predictions;
  }

  async function liveGames(sportKey) {
    const events = await store.latestEvents({ sportKey: sportKey || null });
    const items = [];
    for (const event of events) {
      const oddsRows = await store.latestOddsByEvent(event.id);
      const grouped = {};
      for (const row of oddsRows) {
        const market = row.market_type || row.marketType;
        if (!grouped[market]) grouped[market] = [];
        grouped[market].push(row);
      }
      items.push({
        eventId: event.id,
        sportKey: event.sport_key ?? event.sportKey,
        league: event.league,
        commenceTime: event.commence_time ?? event.commenceTime,
        homeTeam: event.home_team ?? event.homeTeam,
        awayTeam: event.away_team ?? event.awayTeam,
        status: event.status,
        bestOdds: grouped.h2h?.sort((a, b) => Number(b.home_price ?? b.homePrice ?? -999) - Number(a.home_price ?? a.homePrice ?? -999))[0] ?? null,
        markets: grouped
      });
    }
    return items;
  }

  async function plusEvBets({ minEdge = 1, minConfidence = 6 }) {
    const predictions = await store.predictionRows({
      from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10),
      to: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10)
    });
    return predictions.filter(
      (row) =>
        Number(row.edge_pct ?? row.edgePct ?? 0) >= Number(minEdge) &&
        Number(row.confidence ?? 0) >= Number(minConfidence) &&
        Number(row.ev_pct ?? row.evPct ?? 0) > 0
    );
  }

  async function lineMovement(eventId) {
    const rows = await store.oddsMovement(eventId);
    return rows.map((row) => ({
      capturedAt: row.captured_at ?? row.capturedAt,
      sportsbook: row.sportsbook,
      marketType: row.market_type ?? row.marketType,
      homePrice: Number(row.home_price ?? row.homePrice ?? 0),
      awayPrice: Number(row.away_price ?? row.awayPrice ?? 0),
      total: Number(row.total ?? 0)
    }));
  }

  async function teamAnalytics({ teamId }) {
    const date = new Date().toISOString().slice(0, 10);
    const games = await ballDontLie.getGamesByDate(date, "nba");
    const matched = games.filter((game) => `${game.home_team?.id}` === String(teamId) || `${game.visitor_team?.id}` === String(teamId));
    return {
      teamId,
      sampleSize: matched.length,
      recentGames: matched.slice(0, 10).map((game) => ({
        id: game.id,
        date: game.date,
        homeTeam: game.home_team?.abbreviation,
        awayTeam: game.visitor_team?.abbreviation,
        homeScore: game.home_team_score,
        awayScore: game.visitor_team_score
      }))
    };
  }

  async function playerAnalytics({ playerId }) {
    return {
      playerId,
      note: "Detailed player analytics can be expanded with additional provider endpoints.",
      stats: {
        ppg: null,
        apg: null,
        rpg: null
      }
    };
  }

  async function runBacktest({ strategyName = "+EV only", from, to, minEdge = 1 }) {
    const rows = await store.predictionRows({ from, to });
    let bankroll = 0;
    let wins = 0;
    let losses = 0;
    let pushes = 0;
    const curve = [];
    const bets = rows.filter((row) => Number(row.edge_pct ?? row.edgePct ?? 0) >= Number(minEdge));

    for (const row of bets) {
      const status = String(row.status || "").toLowerCase();
      let pnl = 0;
      let outcome = "skip";
      if (status === "final" && row.market_type === "Moneyline") {
        const homeWon = Number(row.home_score) > Number(row.away_score);
        const pickText = String(row.pick || "").toLowerCase();
        const pickedHome = pickText.includes(String(row.home_team || "").toLowerCase());
        if ((homeWon && pickedHome) || (!homeWon && !pickedHome)) {
          outcome = "win";
          pnl = 1;
          wins += 1;
        } else {
          outcome = "loss";
          pnl = -1;
          losses += 1;
        }
      } else {
        pushes += 1;
      }
      bankroll += pnl;
      curve.push({ t: row.created_at ?? row.createdAt, bankroll, outcome, edge: row.edge_pct ?? row.edgePct ?? 0 });
    }

    const totalBets = wins + losses;
    const roiPct = totalBets ? (bankroll / totalBets) * 100 : 0;
    const winRatePct = totalBets ? (wins / totalBets) * 100 : 0;
    const result = {
      strategyName,
      dateFrom: from,
      dateTo: to,
      totalBets,
      wins,
      losses,
      pushes,
      roiPct: Number(roiPct.toFixed(2)),
      winRatePct: Number(winRatePct.toFixed(2)),
      units: Number(bankroll.toFixed(2)),
      payload: { curve, minEdge }
    };
    return store.saveBacktest(result);
  }

  return {
    syncOddsSnapshot,
    generatePredictions,
    liveGames,
    plusEvBets,
    lineMovement,
    teamAnalytics,
    playerAnalytics,
    runBacktest
  };
}
