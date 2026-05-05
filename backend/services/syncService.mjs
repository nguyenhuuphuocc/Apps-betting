import { buildPredictionsForGame } from "./predictionEngine.mjs";
import { addDays, dateRange, gameStatus, nowIso, todayIso } from "../lib/time.mjs";
import { avg, round } from "../lib/math.mjs";

function toInt(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
}

function normalizeName(value = "") {
  return String(value).toLowerCase().replace(/[^a-z]/g, "");
}

function eventSignature(sportKey, homeName, awayName, isoDate) {
  return `${sportKey}|${normalizeName(homeName)}|${normalizeName(awayName)}|${String(isoDate || "").slice(0, 10)}`;
}

const SUPPORTED_SPORT_KEYS = [
  "basketball_nba",
  "basketball_wnba",
  "baseball_mlb",
  "icehockey_nhl",
  "americanfootball_nfl",
  "basketball_ncaab",
  "basketball_euroleague",
  "soccer_fifa_world_cup",
  "soccer_epl",
  "tennis_atp_italian_open",
  "tennis_wta_italian_open",
  "golf_pga_tour",
  "golf_pga_championship_winner",
  "boxing_boxing"
];

function sportTitleFromKey(sportKey = "") {
  const key = String(sportKey);
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

function fnv1aHashInt(input) {
  let hash = 0x811c9dc5;
  const text = String(input || "");
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const unsigned = hash >>> 0;
  return unsigned || 1;
}

function syntheticExternalId(kind, ...parts) {
  const signature = `${kind}:${parts.map((part) => String(part || "")).join("|")}`;
  return -fnv1aHashInt(signature);
}

function abbreviationFromName(name, fallback = "UNK") {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return fallback;
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return `${words[0][0] || ""}${words[words.length - 1][0] || ""}`.toUpperCase();
}

function inferStatusFromCommence(commenceIso) {
  if (!commenceIso) return "scheduled";
  const start = new Date(commenceIso).getTime();
  if (!Number.isFinite(start)) return "scheduled";
  const now = Date.now();
  const elapsedMinutes = (now - start) / (1000 * 60);
  if (elapsedMinutes >= -10 && elapsedMinutes <= 240) return "live";
  return "scheduled";
}

function mapTeamFromBallDontLie(team, standingMap = new Map()) {
  const standing = standingMap.get(team.id) || {};
  return {
    external_id: team.id,
    abbreviation: team.abbreviation || "",
    city: team.city || "",
    name: team.name || "",
    full_name: team.full_name || `${team.city || ""} ${team.name || ""}`.trim(),
    conference: team.conference || "",
    division: team.division || "",
    wins: toInt(standing.wins, 0),
    losses: toInt(standing.losses, 0),
    home_record: standing.home_record || null,
    road_record: standing.road_record || null,
    net_rating: Number(standing.net_rating ?? null),
    offense_rating: Number(standing.offensive_rating ?? null),
    defense_rating: Number(standing.defensive_rating ?? null),
    pace: Number(standing.pace ?? null),
    updated_at: nowIso()
  };
}

function mapGameFromBallDontLie(game) {
  return {
    external_id: game.id,
    sport_key: "basketball_nba",
    league: "NBA",
    season: toInt(game.season, new Date(game.date).getUTCFullYear()),
    date: String(game.date || "").slice(0, 10),
    commence_time: game.date || null,
    status: gameStatus(game.status),
    period: toInt(game.period, 0),
    clock: game.time || game.clock || null,
    postseason: game.postseason ? 1 : 0,
    home_team_external_id: game.home_team?.id,
    away_team_external_id: game.visitor_team?.id,
    home_score: toInt(game.home_team_score, 0),
    away_score: toInt(game.visitor_team_score, 0),
    home_record: game.home_team_record || null,
    away_record: game.visitor_team_record || null,
    home_rest_days: null,
    away_rest_days: null,
    is_back_to_back_home: 0,
    is_back_to_back_away: 0,
    updated_at: nowIso()
  };
}

function mapPlayerFromBallDontLie(player, teamExternalId) {
  return {
    external_id: player.id,
    team_external_id: teamExternalId || player.team?.id || null,
    first_name: player.first_name || "",
    last_name: player.last_name || "",
    full_name: `${player.first_name || ""} ${player.last_name || ""}`.trim(),
    position: player.position || null,
    height: player.height || null,
    weight: player.weight || null,
    jersey_number: player.jersey_number || null,
    status: "Available",
    injury_note: null,
    updated_at: nowIso()
  };
}

function mapInjuryFromBallDontLie(injury) {
  return {
    external_id: injury.id || null,
    player_external_id: injury.player?.id || injury.player_id,
    team_external_id: injury.team?.id || injury.team_id || null,
    status: injury.status || "Questionable",
    description: injury.description || injury.note || null,
    start_date: injury.start_date || null,
    return_date: injury.return_date || null,
    source: "balldontlie",
    updated_at: nowIso()
  };
}

function mapStatFromBallDontLie(stat) {
  return {
    game_external_id: stat.game?.id || stat.game_id,
    player_external_id: stat.player?.id || stat.player_id,
    team_external_id: stat.team?.id || stat.team_id || null,
    minutes: stat.min || stat.minutes || null,
    points: Number(stat.pts ?? stat.points ?? 0),
    rebounds: Number(stat.reb ?? stat.rebounds ?? 0),
    assists: Number(stat.ast ?? stat.assists ?? 0),
    steals: Number(stat.stl ?? stat.steals ?? 0),
    blocks: Number(stat.blk ?? stat.blocks ?? 0),
    turnovers: Number(stat.turnover ?? stat.turnovers ?? 0),
    fg_pct: Number(stat.fg_pct ?? null),
    fg3_pct: Number(stat.fg3_pct ?? null),
    ft_pct: Number(stat.ft_pct ?? null),
    plus_minus: Number(stat.plus_minus ?? null),
    usage_rate: Number(stat.usage_rate ?? null),
    true_shooting_pct: Number(stat.true_shooting_pct ?? null),
    created_at: nowIso()
  };
}

function extractOddsRows(event, gameExternalId) {
  const rows = [];
  for (const bookmaker of event.bookmakers || []) {
    const markets = bookmaker.markets || [];
    for (const market of markets) {
      if (!["h2h", "spreads", "totals"].includes(market.key)) continue;
      const outcomes = market.outcomes || [];
      const captured_at = nowIso();
      if (market.key === "h2h") {
        rows.push({
          game_external_id: gameExternalId,
          provider: "odds-api",
          sportsbook: bookmaker.key || bookmaker.title || "unknown",
          market_type: "h2h",
          home_price: outcomes.find((item) => normalizeName(item.name) === normalizeName(event.home_team))?.price ?? null,
          away_price: outcomes.find((item) => normalizeName(item.name) === normalizeName(event.away_team))?.price ?? null,
          draw_price: outcomes.find((item) => normalizeName(item.name) === "draw")?.price ?? null,
          spread: null,
          total: null,
          over_price: null,
          under_price: null,
          line_label: null,
          captured_at
        });
      }
      if (market.key === "spreads") {
        const homeOutcome = outcomes.find(
          (item) => normalizeName(item.name) === normalizeName(event.home_team)
        );
        const awayOutcome = outcomes.find(
          (item) => normalizeName(item.name) === normalizeName(event.away_team)
        );
        rows.push({
          game_external_id: gameExternalId,
          provider: "odds-api",
          sportsbook: bookmaker.key || bookmaker.title || "unknown",
          market_type: "spreads",
          home_price: homeOutcome?.price ?? null,
          away_price: awayOutcome?.price ?? null,
          draw_price: null,
          spread: Number(homeOutcome?.point ?? null),
          total: null,
          over_price: null,
          under_price: null,
          line_label: "home_spread",
          captured_at
        });
      }
      if (market.key === "totals") {
        const overOutcome = outcomes.find((item) => normalizeName(item.name) === "over");
        const underOutcome = outcomes.find((item) => normalizeName(item.name) === "under");
        rows.push({
          game_external_id: gameExternalId,
          provider: "odds-api",
          sportsbook: bookmaker.key || bookmaker.title || "unknown",
          market_type: "totals",
          home_price: null,
          away_price: null,
          draw_price: null,
          spread: null,
          total: Number(overOutcome?.point ?? underOutcome?.point ?? null),
          over_price: overOutcome?.price ?? null,
          under_price: underOutcome?.price ?? null,
          line_label: "game_total",
          captured_at
        });
      }
    }
  }
  return rows;
}

function streakLosses(bets) {
  let losses = 0;
  for (const bet of bets) {
    if (String(bet.result).toLowerCase() !== "loss") break;
    losses += 1;
  }
  return losses;
}

function teamMargins(games, teamExternalId, limit = 10) {
  const margins = [];
  for (const game of games) {
    const isHome = game.home_team_external_id === teamExternalId;
    const isAway = game.away_team_external_id === teamExternalId;
    if (!isHome && !isAway) continue;
    const margin = isHome ? game.home_score - game.away_score : game.away_score - game.home_score;
    margins.push(margin);
    if (margins.length >= limit) break;
  }
  return margins;
}

function selectMostRecentByMarket(rows) {
  const selected = new Map();
  for (const row of rows) {
    const current = selected.get(row.market_type);
    if (!current || current.captured_at < row.captured_at) selected.set(row.market_type, row);
  }
  return [...selected.values()];
}

function calibrateFromHistory(repo, lookbackDays = 45) {
  const from = addDays(todayIso(), -lookbackDays);
  const to = todayIso();
  const predictions = repo.getPredictionsBetween(from, to).filter((p) => p.market_type === "Moneyline");
  const games = new Map(repo.getGamesBetween(from, to).map((game) => [game.external_id, game]));
  let correct = 0;
  let total = 0;
  for (const prediction of predictions) {
    const game = games.get(prediction.game_external_id);
    if (!game || String(game.status).toLowerCase() !== "final") continue;
    const pick = String(prediction.pick || "").toLowerCase();
    const homePick = pick.includes(String(game.home_team_abbr || "").toLowerCase());
    const winner = Number(game.home_score || 0) > Number(game.away_score || 0) ? "home" : "away";
    if ((homePick && winner === "home") || (!homePick && winner === "away")) correct += 1;
    total += 1;
  }
  if (!total) return { slope: 1, intercept: 0 };
  const accuracy = correct / total;
  return {
    slope: round(0.9 + (accuracy - 0.5) * 0.6, 3),
    intercept: round((accuracy - 0.5) * 0.35, 3)
  };
}

function mapSyntheticTeam({ sportKey, teamName }) {
  const externalId = syntheticExternalId("team", sportKey, teamName);
  const cleanName = String(teamName || "Unknown");
  return {
    external_id: externalId,
    abbreviation: abbreviationFromName(cleanName),
    city: "",
    name: cleanName,
    full_name: cleanName,
    conference: sportTitleFromKey(sportKey),
    division: "",
    wins: 0,
    losses: 0,
    home_record: null,
    road_record: null,
    net_rating: null,
    offense_rating: null,
    defense_rating: null,
    pace: null,
    updated_at: nowIso()
  };
}

function mapGameFromOddsEvent(event) {
  const sportKey = event.sport_key || "other";
  const gameExternalId = syntheticExternalId(
    "game",
    sportKey,
    event.providerEventId || `${event.home_team}-${event.away_team}-${event.commence_time}`
  );
  const commenceIso = event.commence_time || null;
  const date = commenceIso ? String(commenceIso).slice(0, 10) : todayIso();
  return {
    external_id: gameExternalId,
    sport_key: sportKey,
    league: event.sport_title || sportTitleFromKey(sportKey),
    season: new Date(commenceIso || Date.now()).getUTCFullYear(),
    date,
    commence_time: commenceIso,
    status: inferStatusFromCommence(commenceIso),
    period: 0,
    clock: null,
    postseason: 0,
    home_team_external_id: syntheticExternalId("team", sportKey, event.home_team || "Home"),
    away_team_external_id: syntheticExternalId("team", sportKey, event.away_team || "Away"),
    home_score: 0,
    away_score: 0,
    home_record: null,
    away_record: null,
    home_rest_days: null,
    away_rest_days: null,
    is_back_to_back_home: 0,
    is_back_to_back_away: 0,
    updated_at: nowIso()
  };
}

export function createSyncService({ repo, balldontlie, odds }) {
  const status = {
    booted_at: nowIso(),
    last_run_at: null,
    last_live_sync_at: null,
    last_odds_sync_at: null,
    last_injury_sync_at: null,
    last_schedule_sync_at: null,
    last_player_stats_sync_at: null,
    last_error: null
  };
  const timers = [];

  async function syncScheduleWindow({ from = addDays(todayIso(), -2), to = addDays(todayIso(), 10) } = {}) {
    const days = dateRange(from, to);
    const standings = await balldontlie.getStandings(new Date().getUTCFullYear());
    const standingMap = new Map();
    for (const row of standings) {
      const teamId = row.team?.id || row.team_id;
      if (!teamId) continue;
      standingMap.set(teamId, row);
    }

    const teamsPayload = await balldontlie.getTeams();
    const teams = teamsPayload.map((team) => mapTeamFromBallDontLie(team, standingMap));
    if (teams.length) repo.upsertTeams(teams);

    const allGames = [];
    for (const date of days) {
      const games = await balldontlie.getGamesByDate(date);
      for (const game of games) allGames.push(mapGameFromBallDontLie(game));
    }
    if (allGames.length) {
      allGames.sort((a, b) => `${a.date} ${a.commence_time || ""}`.localeCompare(`${b.date} ${b.commence_time || ""}`));
      const lastDateByTeam = new Map();
      for (const game of allGames) {
        const homePrev = lastDateByTeam.get(game.home_team_external_id);
        const awayPrev = lastDateByTeam.get(game.away_team_external_id);
        const currentDate = new Date(`${game.date}T00:00:00Z`);
        const homeRest = homePrev ? Math.max(0, Math.round((currentDate - homePrev) / (1000 * 60 * 60 * 24)) - 1) : 2;
        const awayRest = awayPrev ? Math.max(0, Math.round((currentDate - awayPrev) / (1000 * 60 * 60 * 24)) - 1) : 2;
        game.home_rest_days = homeRest;
        game.away_rest_days = awayRest;
        game.is_back_to_back_home = homeRest === 0 ? 1 : 0;
        game.is_back_to_back_away = awayRest === 0 ? 1 : 0;
        lastDateByTeam.set(game.home_team_external_id, currentDate);
        lastDateByTeam.set(game.away_team_external_id, currentDate);
      }
      repo.upsertGames(allGames);
      const uniqueTeamIds = [...new Set(allGames.flatMap((game) => [game.home_team_external_id, game.away_team_external_id]))];
      for (const teamExternalId of uniqueTeamIds) {
        const roster = await balldontlie.getPlayersForTeam(teamExternalId);
        if (roster.length) {
          repo.upsertPlayers(roster.map((player) => mapPlayerFromBallDontLie(player, teamExternalId)));
        }
      }
    }

    status.last_schedule_sync_at = nowIso();
  }

  async function syncInjuries() {
    const injuries = await balldontlie.getInjuries();
    if (injuries.length) repo.upsertInjuries(injuries.map(mapInjuryFromBallDontLie));
    status.last_injury_sync_at = nowIso();
  }

  async function syncOddsAndPredictions({ from = todayIso(), to = addDays(todayIso(), 5) } = {}) {
    const events = [];
    if (typeof odds.getOddsBySport === "function") {
      for (const sportKey of SUPPORTED_SPORT_KEYS) {
        const markets =
          sportKey.startsWith("tennis_") ||
          sportKey.startsWith("boxing_") ||
          sportKey.startsWith("golf_")
            ? ["h2h"]
            : ["h2h", "spreads", "totals"];
        const rows = await odds.getOddsBySport(sportKey, markets);
        events.push(...rows);
      }
    } else {
      events.push(...(await odds.getNbaOdds()));
    }

    const syntheticTeams = [];
    const syntheticGames = [];
    const eventsBySignature = new Map();

    for (const event of events) {
      const sportKey = event.sport_key || "basketball_nba";
      if (!event.home_team || !event.away_team) continue;
      const dateKey = String(event.commence_time || "").slice(0, 10) || from;
      eventsBySignature.set(eventSignature(sportKey, event.home_team, event.away_team, dateKey), event);

      if (sportKey === "basketball_nba") continue;
      syntheticTeams.push(mapSyntheticTeam({ sportKey, teamName: event.home_team || "Home" }));
      syntheticTeams.push(mapSyntheticTeam({ sportKey, teamName: event.away_team || "Away" }));
      syntheticGames.push(mapGameFromOddsEvent(event));
    }

    if (syntheticTeams.length) repo.upsertTeams(syntheticTeams);
    if (syntheticGames.length) repo.upsertGames(syntheticGames);

    const games = repo.getGamesBetween(from, to);
    if (!games.length) return;

    for (const game of games) {
      const sportKey = game.sport_key || "basketball_nba";
      const signature = eventSignature(sportKey, game.home_team_name, game.away_team_name, game.date);
      const event = eventsBySignature.get(signature);
      if (!event) continue;
      const oddsRows = extractOddsRows(event, game.external_id);
      if (!oddsRows.length) continue;
      repo.saveOdds(oddsRows);
    }

    const currentSettings = repo.getSettings();
    const calibration = calibrateFromHistory(repo, 60);
    const trackedBets = repo.listTrackedBets();
    const lossStreak = streakLosses(
      trackedBets
        .filter((bet) => String(bet.result).toLowerCase() !== "open")
        .sort((a, b) => String(b.settled_at || b.created_at).localeCompare(String(a.settled_at || a.created_at)))
    );

    for (const game of games) {
      const latestOdds = selectMostRecentByMarket(repo.getLatestOddsForGame(game.external_id));
      const openingOdds = selectMostRecentByMarket(repo.getOpeningOddsForGame(game.external_id));
      if (!latestOdds.length) continue;
      const injuriesHome = repo.getInjuriesByTeam(game.home_team_external_id);
      const injuriesAway = repo.getInjuriesByTeam(game.away_team_external_id);
      const recentHomeGames = repo.getRecentTeamGames(game.home_team_external_id, 10);
      const recentAwayGames = repo.getRecentTeamGames(game.away_team_external_id, 10);
      const headToHead = repo.getHeadToHead(game.home_team_external_id, game.away_team_external_id, 10);

      const sportKey = game.sport_key || "basketball_nba";
      const homeAbbr = game.home_team_abbr || abbreviationFromName(game.home_team_name, "HOME");
      const awayAbbr = game.away_team_abbr || abbreviationFromName(game.away_team_name, "AWAY");

      const model = buildPredictionsForGame({
        game,
        homeTeam: {
          abbreviation: homeAbbr,
          net_rating: game.home_net,
          offense_rating: game.home_offense,
          defense_rating: game.home_defense,
          pace: game.home_pace
        },
        awayTeam: {
          abbreviation: awayAbbr,
          net_rating: game.away_net,
          offense_rating: game.away_offense,
          defense_rating: game.away_defense,
          pace: game.away_pace
        },
        latestOddsRows: latestOdds,
        openingOddsRows: openingOdds,
        injuriesHome,
        injuriesAway,
        recentHomeMargins: teamMargins(recentHomeGames, game.home_team_external_id),
        recentAwayMargins: teamMargins(recentAwayGames, game.away_team_external_id),
        headToHead,
        settings: currentSettings,
        lossStreak,
        calibration,
        sportKey
      });

      const rows = model.predictions.map((prediction) => ({
        game_external_id: game.external_id,
        market_type: prediction.market_type,
        pick: prediction.pick,
        model_probability: prediction.model_probability,
        implied_probability: prediction.implied_probability,
        edge_pct: prediction.edge_pct,
        expected_value_pct: prediction.expected_value_pct,
        confidence_score: prediction.confidence_score,
        risk_level: prediction.risk_level,
        suggested_units: prediction.suggested_units,
        recommendation: prediction.recommendation,
        reason: prediction.reason,
        created_at: nowIso()
      }));
      if (!rows.length) continue;
      repo.replacePredictions(game.external_id, rows);
    }

    status.last_odds_sync_at = nowIso();
  }

  async function syncFinalPlayerStats({ from = addDays(todayIso(), -5), to = todayIso() } = {}) {
    const games = repo
      .getGamesBetween(from, to)
      .filter((game) => String(game.status).toLowerCase() === "final");
    for (const game of games) {
      const stats = await balldontlie.getStatsForGame(game.external_id);
      if (stats.length) {
        repo.upsertPlayerStats(stats.map(mapStatFromBallDontLie));
      }
    }
    status.last_player_stats_sync_at = nowIso();
  }

  async function snapshotBankroll() {
    const settings = repo.getSettings();
    const bets = repo.listTrackedBets().filter((bet) => String(bet.result).toLowerCase() !== "open");
    const wins = bets.filter((bet) => String(bet.result).toLowerCase() === "win").length;
    const losses = bets.filter((bet) => String(bet.result).toLowerCase() === "loss").length;
    const units = bets.reduce((sum, bet) => sum + Number(bet.pnl_units || 0), 0);
    const staked = bets.reduce((sum, bet) => sum + Number(bet.stake_units || 0), 0);
    const winRate = wins + losses ? (wins / (wins + losses)) * 100 : 0;
    const roi = staked ? (units / staked) * 100 : 0;
    const averageOdds = avg(bets.map((bet) => bet.odds));
    const byType = new Map();
    for (const bet of bets) {
      const type = bet.market_type || "Unknown";
      byType.set(type, (byType.get(type) || 0) + Number(bet.pnl_units || 0));
    }
    const sortedTypes = [...byType.entries()].sort((a, b) => b[1] - a[1]);
    repo.saveBankrollSnapshot({
      bankroll: settings.bankroll_current,
      units_won_lost: round(units, 2),
      win_rate: round(winRate, 2),
      roi: round(roi, 2),
      average_odds: round(averageOdds, 2),
      best_bet_type: sortedTypes[0]?.[0] || null,
      worst_bet_type: sortedTypes.at(-1)?.[0] || null,
      streak_losses: streakLosses(
        repo
          .listTrackedBets()
          .filter((bet) => String(bet.result).toLowerCase() !== "open")
          .sort((a, b) => String(b.settled_at || b.created_at).localeCompare(String(a.settled_at || a.created_at)))
      ),
      captured_at: nowIso()
    });
  }

  async function runFullSync() {
    try {
      await syncScheduleWindow();
      await syncInjuries();
      await syncOddsAndPredictions();
      await syncFinalPlayerStats();
      await snapshotBankroll();
      status.last_run_at = nowIso();
      status.last_error = null;
    } catch (error) {
      status.last_error = String(error?.message || error);
    }
  }

  async function runLiveOnlySync() {
    try {
      await syncScheduleWindow({ from: addDays(todayIso(), -1), to: addDays(todayIso(), 1) });
      await syncOddsAndPredictions({ from: todayIso(), to: addDays(todayIso(), 1) });
      status.last_live_sync_at = nowIso();
      status.last_error = null;
    } catch (error) {
      status.last_error = String(error?.message || error);
    }
  }

  function startAutoRefresh() {
    const settings = repo.getSettings();
    timers.push(setInterval(runLiveOnlySync, Math.max(15, settings.live_refresh_seconds) * 1000));
    timers.push(setInterval(syncOddsAndPredictions, Math.max(5, settings.odds_refresh_minutes) * 60 * 1000));
    timers.push(setInterval(syncInjuries, Math.max(10, settings.injuries_refresh_minutes) * 60 * 1000));
    timers.push(setInterval(syncScheduleWindow, Math.max(4, settings.scheduled_refresh_hours) * 60 * 60 * 1000));
    timers.push(setInterval(syncFinalPlayerStats, 15 * 60 * 1000));
    timers.push(setInterval(snapshotBankroll, 15 * 60 * 1000));
  }

  function stopAutoRefresh() {
    while (timers.length) clearInterval(timers.pop());
  }

  function getStatus() {
    return { ...status };
  }

  return {
    runFullSync,
    runLiveOnlySync,
    syncScheduleWindow,
    syncInjuries,
    syncOddsAndPredictions,
    syncFinalPlayerStats,
    startAutoRefresh,
    stopAutoRefresh,
    getStatus
  };
}
