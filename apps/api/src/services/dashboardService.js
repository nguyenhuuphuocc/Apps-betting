import { cacheWrap } from "../lib/cache.js";
import {
  expectedValue,
  impliedProbabilityFromAmerican,
  kellyFraction
} from "./quant/evEngine.js";
import { predictEvent } from "./quant/predictionModel.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeNum(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function roundTo(value, digits = 2) {
  const n = safeNum(value);
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

function norm(input) {
  return String(input ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function eventIdFromOdds(event) {
  return (
    event.id ||
    `${event.sport_key}-${norm(event.home_team)}-${norm(event.away_team)}-${String(
      event.commence_time
    ).slice(0, 16)}`
  );
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

function statusFromStartTime(commenceTimeIso) {
  const commenceTime = new Date(commenceTimeIso).getTime();
  const now = Date.now();
  if (!Number.isFinite(commenceTime)) return "scheduled";
  if (commenceTime > now) return "scheduled";
  if (commenceTime + 3 * 60 * 60 * 1000 < now) return "final";
  return "live";
}

function momentumFromMovement(movementRows = []) {
  if (movementRows.length < 2) {
    return {
      movementPct: 0,
      reverseLineMovement: false,
      steamMove: false,
      sharpSignal: false
    };
  }
  const first = movementRows[0];
  const last = movementRows[movementRows.length - 1];
  const open = safeNum(first.homePrice ?? first.home_price, 0);
  const current = safeNum(last.homePrice ?? last.home_price, 0);
  if (!open || !current) {
    return {
      movementPct: 0,
      reverseLineMovement: false,
      steamMove: false,
      sharpSignal: false
    };
  }

  const movementPct = Math.abs(current - open) / Math.max(1, Math.abs(open)) * 100;
  const reverseLineMovement = open > 0 ? current < open : current > open;
  const steamMove = movementPct >= 8;
  const sharpSignal = reverseLineMovement && movementPct >= 4;

  return {
    movementPct: roundTo(movementPct, 2),
    reverseLineMovement,
    steamMove,
    sharpSignal
  };
}

function isoDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function formatBacktestRow(row) {
  if (!row) return row;
  return {
    id: row.id,
    strategy_name: row.strategy_name ?? row.strategyName ?? "+EV only",
    date_from: row.date_from ?? row.dateFrom ?? null,
    date_to: row.date_to ?? row.dateTo ?? null,
    total_bets: safeNum(row.total_bets ?? row.totalBets, 0),
    wins: safeNum(row.wins, 0),
    losses: safeNum(row.losses, 0),
    pushes: safeNum(row.pushes, 0),
    roi_pct: safeNum(row.roi_pct ?? row.roiPct, 0),
    win_rate_pct: safeNum(row.win_rate_pct ?? row.winRatePct, 0),
    units: safeNum(row.units, 0),
    payload: row.payload ?? {}
  };
}

export function createDashboardService({ env, store, cache, oddsApi, ballDontLie }) {
  async function syncOddsSnapshot({ sportKeys = null } = {}) {
    const allEvents = [];
    const keysToSync = Array.isArray(sportKeys) && sportKeys.length
      ? sportKeys
      : env.supportedSportKeys;
    const errors = [];

    for (const sportKey of keysToSync) {
      const markets =
        sportKey.startsWith("tennis_") ||
        sportKey.startsWith("boxing_") ||
        sportKey.startsWith("golf_")
          ? ["h2h"]
          : ["h2h", "spreads", "totals"];
      let oddsEvents = [];
      try {
        const wrapped = await cacheWrap(
          cache,
          `odds:${sportKey}`,
          env.CACHE_TTL_SECONDS,
          () => oddsApi.getOdds(sportKey, markets)
        );
        oddsEvents = wrapped.data ?? [];
      } catch (error) {
        const errPayload = {
          sportKey,
          message: error?.message || "sync error"
        };

        // Fallback: if odds provider fails, still ingest NBA schedule from BallDontLie
        // so dashboard can display games even without market prices.
        if (sportKey === "basketball_nba") {
          try {
            const fallbackGames = [
              ...(await ballDontLie.getGamesByDate(isoDate(0), "nba")),
              ...(await ballDontLie.getGamesByDate(isoDate(1), "nba"))
            ];

            const mapped = fallbackGames.map((game) => ({
              id: `balldontlie-nba-${game.id}`,
              sportKey: "basketball_nba",
              league: "NBA",
              commenceTime: game.date,
              homeTeam: game.home_team?.full_name || game.home_team?.name || "Home",
              awayTeam: game.visitor_team?.full_name || game.visitor_team?.name || "Away",
              status:
                safeNum(game.home_team_score, 0) > 0 || safeNum(game.visitor_team_score, 0) > 0
                  ? "final"
                  : statusFromStartTime(game.date),
              homeScore: game.home_team_score ?? null,
              awayScore: game.visitor_team_score ?? null
            }));

            if (mapped.length) {
              await store.upsertEvents(mapped);
              allEvents.push(...mapped);
              errPayload.fallback = `Used BallDontLie NBA schedule fallback (${mapped.length} games).`;
            }
          } catch (fallbackError) {
            errPayload.fallback = `Fallback failed: ${fallbackError?.message || "unknown error"}`;
          }
        }

        errors.push(errPayload);
        continue;
      }

      for (const event of oddsEvents) {
        allEvents.push({
          id: eventIdFromOdds(event),
          sportKey,
          league: event.sport_title || sportTitleFromKey(sportKey),
          commenceTime: event.commence_time,
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          status: statusFromStartTime(event.commence_time)
        });
      }
      const rows = oddsEvents.flatMap(normalizeOddsRows);
      if (rows.length) await store.saveOdds(rows);
    }
    if (allEvents.length) await store.upsertEvents(allEvents);
    return {
      eventsSynced: allEvents.length,
      sportsSynced: keysToSync.length - errors.length,
      errors
    };
  }

  async function generatePredictions() {
    const events = await store.latestEvents({ sportKey: null });
    const predictions = [];
    for (const event of events) {
      const oddsRows = await store.latestOddsByEvent(event.id);
      const movementRows = await lineMovement(event.id);
      const momentum = momentumFromMovement(movementRows);
      const moneyline = oddsRows.find(
        (row) => row.market_type === "h2h" || row.marketType === "h2h"
      );
      if (!moneyline) continue;

      const homeOdds = safeNum(moneyline.home_price ?? moneyline.homePrice, NaN);
      const awayOdds = safeNum(moneyline.away_price ?? moneyline.awayPrice, NaN);
      if (!Number.isFinite(homeOdds) || !Number.isFinite(awayOdds)) continue;

      const impliedHome = impliedProbabilityFromAmerican(homeOdds) ?? 0.5;
      const model = predictEvent({
        sportKey: event.sport_key ?? event.sportKey,
        context: {
          homeAdvantage: 0.06,
          formDiff: 0,
          injuryDiff: 0,
          paceDiff: 0,
          lineMove: momentum.movementPct / 100
        },
        market: {
          impliedHome
        }
      });

      const homeEv = expectedValue({
        winProbability: model.homeWinProbability,
        odds: homeOdds,
        stake: 1
      });
      const awayEv = expectedValue({
        winProbability: model.awayWinProbability,
        odds: awayOdds,
        stake: 1
      });

      const takeHome = safeNum(homeEv, -999) >= safeNum(awayEv, -999);
      const selectedProbability = takeHome
        ? model.homeWinProbability
        : model.awayWinProbability;
      const selectedOdds = takeHome ? homeOdds : awayOdds;
      const implied = impliedProbabilityFromAmerican(selectedOdds) ?? 0;
      const edgePct = (selectedProbability - implied) * 100;
      const evPct = safeNum((takeHome ? homeEv : awayEv), 0) * 100;
      const units = kellyFraction({
        probability: selectedProbability,
        odds: selectedOdds
      }) * 100;
      const confidence = clamp(model.confidence, 1, 10);
      const riskLevel = confidence >= 7.5 ? "Low" : confidence >= 6 ? "Medium" : "High";

      predictions.push({
        eventId: event.id,
        marketType: "Moneyline",
        pick: `${takeHome ? event.home_team ?? event.homeTeam : event.away_team ?? event.awayTeam} ML`,
        modelProbability: roundTo(selectedProbability * 100, 2),
        impliedProbability: roundTo(implied * 100, 2),
        edgePct: roundTo(edgePct, 2),
        evPct: roundTo(evPct, 2),
        confidence: roundTo(confidence, 2),
        riskLevel,
        suggestedUnits: roundTo(Math.max(0, Math.min(3, units)), 2),
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

      const bestOdds =
        grouped.h2h
          ?.slice()
          .sort(
            (a, b) =>
              safeNum(b.home_price ?? b.homePrice, -9999) -
              safeNum(a.home_price ?? a.homePrice, -9999)
          )[0] ?? null;

      const movementRows = await lineMovement(event.id);
      const momentum = momentumFromMovement(movementRows);
      items.push({
        eventId: event.id,
        sportKey: event.sport_key ?? event.sportKey,
        league: event.league,
        commenceTime: event.commence_time ?? event.commenceTime,
        homeTeam: event.home_team ?? event.homeTeam,
        awayTeam: event.away_team ?? event.awayTeam,
        status: event.status,
        bestOdds,
        markets: grouped,
        movement: momentum
      });
    }
    return items;
  }

  async function plusEvBets({ minEdge = 1, minConfidence = 6 }) {
    const predictions = await store.predictionRows({
      from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10),
      to: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10)
    });
    return predictions
      .map((row, idx) => ({
        id: row.id ?? idx + 1,
        event_id: row.event_id ?? row.eventId ?? "",
        market_type: row.market_type ?? row.marketType ?? "Moneyline",
        pick: row.pick ?? "",
        model_probability: safeNum(row.model_probability ?? row.modelProbability, 0),
        implied_probability: safeNum(row.implied_probability ?? row.impliedProbability, 0),
        edge_pct: safeNum(row.edge_pct ?? row.edgePct, 0),
        ev_pct: safeNum(row.ev_pct ?? row.evPct, 0),
        confidence: safeNum(row.confidence, 0),
        risk_level: row.risk_level ?? row.riskLevel ?? "Medium",
        suggested_units: safeNum(row.suggested_units ?? row.suggestedUnits, 0),
        reason: row.reason ?? "Model-derived probability delta",
        league: row.league ?? "",
        sport_key: row.sport_key ?? row.sportKey ?? ""
      }))
      .filter((row) => {
        const edge = safeNum(row.edge_pct, 0);
        const confidence = safeNum(row.confidence, 0);
        const ev = safeNum(row.ev_pct, 0);
        return edge >= Number(minEdge) && confidence >= Number(minConfidence) && ev > 0;
      });
  }

  async function lineMovement(eventId) {
    const rows = await store.oddsMovement(eventId);
    return rows.map((row) => ({
      capturedAt: row.captured_at ?? row.capturedAt,
      sportsbook: row.sportsbook,
      marketType: row.market_type ?? row.marketType,
      homePrice: safeNum(row.home_price ?? row.homePrice, 0),
      awayPrice: safeNum(row.away_price ?? row.awayPrice, 0),
      total: safeNum(row.total, 0)
    }));
  }

  async function sharpMoney({ sportKey = null }) {
    const games = await liveGames(sportKey);
    return games
      .map((game) => ({
        eventId: game.eventId,
        matchup: `${game.awayTeam} @ ${game.homeTeam}`,
        league: game.league,
        sportKey: game.sportKey,
        ...game.movement
      }))
      .filter((row) => row.movementPct > 0)
      .sort((a, b) => b.movementPct - a.movementPct);
  }

  async function oddsComparison({ eventId, sportKey = null }) {
    let targetEventId = eventId;
    if (!targetEventId) {
      const events = await store.latestEvents({ sportKey });
      targetEventId = events[0]?.id ?? null;
    }
    if (!targetEventId) return [];

    const rows = await store.latestOddsByEvent(targetEventId);
    const grouped = new Map();
    for (const row of rows) {
      const book = row.sportsbook;
      if (!grouped.has(book)) grouped.set(book, {});
      grouped.get(book)[row.market_type ?? row.marketType] = row;
    }

    const books = [...grouped.entries()].map(([sportsbook, markets]) => {
      const h2h = markets.h2h ?? {};
      return {
        sportsbook,
        moneylineHome: h2h.home_price ?? h2h.homePrice ?? null,
        moneylineAway: h2h.away_price ?? h2h.awayPrice ?? null,
        spread: markets.spreads?.spread ?? null,
        total: markets.totals?.total ?? null
      };
    });

    const bestHome = books
      .map((row) => safeNum(row.moneylineHome, -9999))
      .sort((a, b) => b - a)[0];
    const bestAway = books
      .map((row) => safeNum(row.moneylineAway, -9999))
      .sort((a, b) => b - a)[0];

    return books.map((row) => ({
      ...row,
      bestHome: safeNum(row.moneylineHome, -9999) === bestHome,
      bestAway: safeNum(row.moneylineAway, -9999) === bestAway
    }));
  }

  async function teamAnalytics({ teamId }) {
    const date = new Date().toISOString().slice(0, 10);
    const games = await ballDontLie.getGamesByDate(date, "nba");
    const matched = games.filter(
      (game) =>
        `${game.home_team?.id}` === String(teamId) ||
        `${game.visitor_team?.id}` === String(teamId)
    );
    const margins = matched.map((game) => {
      const home = `${game.home_team?.id}` === String(teamId);
      const delta = safeNum(game.home_team_score) - safeNum(game.visitor_team_score);
      return home ? delta : -delta;
    });
    const avgMargin =
      margins.length > 0 ? margins.reduce((sum, x) => sum + x, 0) / margins.length : 0;

    return {
      teamId,
      sampleSize: matched.length,
      averageMargin: roundTo(avgMargin, 2),
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
      note: "Player-prop depth can be expanded by adding a dedicated props provider.",
      stats: {
        ppg: null,
        apg: null,
        rpg: null,
        consistencyScore: null
      },
      risk: "Data pending"
    };
  }

  async function runBacktest({
    strategyName = "+EV only",
    from,
    to,
    minEdge = 1,
    minConfidence = 6,
    startingBankroll = 1000,
    unitSizePct = 1,
    maxDailyExposurePct = 5
  }) {
    const rows = await store.predictionRows({ from, to });
    const filtered = rows.filter(
      (row) =>
        safeNum(row.edge_pct ?? row.edgePct, 0) >= Number(minEdge) &&
        safeNum(row.confidence, 0) >= Number(minConfidence)
    );

    let bankroll = Number(startingBankroll);
    let peakBankroll = bankroll;
    let maxDrawdownPct = 0;
    let wins = 0;
    let losses = 0;
    let pushes = 0;
    let currentStreakLosses = 0;
    let longestLosingStreak = 0;
    let longestWinStreak = 0;
    let currentWinStreak = 0;
    let currentDay = null;
    let dayExposure = 0;
    const curve = [];
    const betLogs = [];

    for (const row of filtered) {
      const eventDate = new Date(row.commence_time ?? row.created_at ?? Date.now());
      const dayKey = eventDate.toISOString().slice(0, 10);
      if (dayKey !== currentDay) {
        currentDay = dayKey;
        dayExposure = 0;
      }

      const confidence = clamp(safeNum(row.confidence, 5), 1, 10);
      const baseUnits = clamp(safeNum(row.suggested_units ?? row.suggestedUnits, 1), 0.25, 3);
      const confidenceMult = clamp((confidence - 4) / 4, 0.35, 1.25);
      let units = clamp(baseUnits * confidenceMult, 0.25, 3);
      if (currentStreakLosses >= 3) units = units * 0.5;

      const unitCash = bankroll * (unitSizePct / 100);
      let stake = roundTo(unitCash * units, 2);

      const maxDailyExposureCash = bankroll * (maxDailyExposurePct / 100);
      if (dayExposure + stake > maxDailyExposureCash) {
        continue;
      }
      dayExposure += stake;

      const status = String(row.status || "").toLowerCase();
      let outcome = "skip";
      let pnl = 0;
      let hit = false;

      if (status === "final" && String(row.market_type ?? row.marketType) === "Moneyline") {
        const homeWon = safeNum(row.home_score, 0) > safeNum(row.away_score, 0);
        const pickText = String(row.pick || "").toLowerCase();
        const pickedHome = pickText.includes(String(row.home_team || "").toLowerCase());
        hit = (homeWon && pickedHome) || (!homeWon && !pickedHome);
        outcome = hit ? "win" : "loss";
      } else {
        outcome = "push";
      }

      if (outcome === "win") {
        const winRatio = safeNum(row.ev_pct ?? row.evPct, 4) / 100 + 1;
        pnl = roundTo(stake * Math.max(0.8, Math.min(1.2, winRatio)) * 0.15, 2);
        bankroll += pnl;
        wins += 1;
        currentStreakLosses = 0;
        currentWinStreak += 1;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else if (outcome === "loss") {
        pnl = -stake;
        bankroll += pnl;
        losses += 1;
        currentStreakLosses += 1;
        longestLosingStreak = Math.max(longestLosingStreak, currentStreakLosses);
        currentWinStreak = 0;
      } else {
        pushes += 1;
        currentWinStreak = 0;
      }

      peakBankroll = Math.max(peakBankroll, bankroll);
      const drawdownPct = peakBankroll
        ? ((peakBankroll - bankroll) / peakBankroll) * 100
        : 0;
      maxDrawdownPct = Math.max(maxDrawdownPct, drawdownPct);

      curve.push({
        t: eventDate.toISOString(),
        bankroll: roundTo(bankroll, 2),
        outcome,
        edge: roundTo(row.edge_pct ?? row.edgePct ?? 0, 2)
      });
      betLogs.push({
        t: eventDate.toISOString(),
        pick: row.pick,
        stake,
        pnl,
        confidence,
        evPct: roundTo(row.ev_pct ?? row.evPct ?? 0, 2),
        outcome
      });
    }

    const settled = wins + losses;
    const net = bankroll - Number(startingBankroll);
    const roiPct = settled ? (net / (Number(startingBankroll) || 1)) * 100 : 0;
    const winRatePct = settled ? (wins / settled) * 100 : 0;
    const brierScore =
      betLogs.length > 0
        ? roundTo(
            betLogs.reduce((sum, row) => {
              const p = clamp(row.confidence / 10, 0.05, 0.95);
              const y = row.outcome === "win" ? 1 : 0;
              return sum + (p - y) ** 2;
            }, 0) / betLogs.length,
            4
          )
        : null;

    const result = {
      strategyName,
      dateFrom: from,
      dateTo: to,
      totalBets: settled,
      wins,
      losses,
      pushes,
      roiPct: roundTo(roiPct, 2),
      winRatePct: roundTo(winRatePct, 2),
      units: roundTo(net / ((Number(startingBankroll) * unitSizePct) / 100), 2),
      payload: {
        curve,
        betLogs,
        minEdge,
        minConfidence,
        startingBankroll,
        endingBankroll: roundTo(bankroll, 2),
        maxDrawdownPct: roundTo(maxDrawdownPct, 2),
        longestWinStreak,
        longestLosingStreak,
        brierScore
      }
    };
    const saved = await store.saveBacktest(result);
    return formatBacktestRow(saved);
  }

  async function addBankrollEntry({ userId, amount, entryType, note }) {
    return store.addBankrollEntry({ userId, amount, entryType, note });
  }

  async function bankrollSummary({ userId }) {
    const entries = await store.getBankrollEntries(userId, 400);
    let balance = 0;
    let peak = 0;
    let maxDrawdown = 0;
    const curve = entries.map((row) => {
      balance += safeNum(row.amount, 0);
      peak = Math.max(peak, balance);
      const dd = peak > 0 ? ((peak - balance) / peak) * 100 : 0;
      maxDrawdown = Math.max(maxDrawdown, dd);
      return {
        t: row.created_at ?? row.createdAt,
        balance: roundTo(balance, 2),
        amount: safeNum(row.amount, 0),
        type: row.entry_type ?? row.entryType
      };
    });
    const wins = entries.filter((x) => safeNum(x.amount, 0) > 0).length;
    const losses = entries.filter((x) => safeNum(x.amount, 0) < 0).length;
    const settled = wins + losses;
    const winRate = settled ? (wins / settled) * 100 : 0;
    const startBalance = curve[0]?.balance ?? 0;
    const roi = startBalance ? ((balance - startBalance) / Math.abs(startBalance)) * 100 : 0;

    return {
      entries: curve,
      summary: {
        currentBankroll: roundTo(balance, 2),
        maxDrawdownPct: roundTo(maxDrawdown, 2),
        winRatePct: roundTo(winRate, 2),
        roiPct: roundTo(roi, 2)
      }
    };
  }

  async function gameAnalysis(eventId) {
    const events = await store.latestEvents({ sportKey: null });
    const event = events.find((row) => row.id === eventId);
    if (!event) {
      return { eventId, status: "not_found" };
    }
    const odds = await store.latestOddsByEvent(eventId);
    const movement = await lineMovement(eventId);
    const sharp = momentumFromMovement(movement);

    return {
      eventId,
      matchup: `${event.away_team ?? event.awayTeam} @ ${event.home_team ?? event.homeTeam}`,
      league: event.league,
      sportKey: event.sport_key ?? event.sportKey,
      status: event.status,
      contextScore: roundTo(clamp(55 + sharp.movementPct * 1.5, 5, 95), 1),
      injuryImpact: "Data pending",
      restDays: "Data pending",
      travelNote: "Data pending",
      sharp,
      oddsCount: odds.length,
      warnings: ["Predictions are not guaranteed.", "Bet responsibly."]
    };
  }

  async function dashboardSummary() {
    const games = await liveGames(null);
    const ev = await plusEvBets({ minEdge: 2, minConfidence: 6 });
    const sharp = await sharpMoney({ sportKey: null });
    return {
      games: games.length,
      evBets: ev.length,
      sharpSignals: sharp.filter((x) => x.sharpSignal).length,
      topEdge: roundTo(
        ev.length ? Math.max(...ev.map((row) => safeNum(row.edge_pct ?? row.edgePct, 0))) : 0,
        2
      ),
      warning:
        ev.length === 0
          ? "NO BET - no positive expected value detected above threshold."
          : null
    };
  }

  return {
    syncOddsSnapshot,
    generatePredictions,
    liveGames,
    plusEvBets,
    lineMovement,
    sharpMoney,
    oddsComparison,
    teamAnalytics,
    playerAnalytics,
    runBacktest,
    addBankrollEntry,
    bankrollSummary,
    gameAnalysis,
    dashboardSummary
  };
}
