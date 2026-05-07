import axios from "axios";
import { withRetry } from "../../lib/retry.js";

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function norm(input) {
  return String(input ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function readNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function sportsDataSportPath(sportKey) {
  const mapping = {
    basketball_nba: "nba",
    basketball_wnba: "wnba",
    baseball_mlb: "mlb",
    icehockey_nhl: "nhl",
    americanfootball_nfl: "nfl",
    basketball_ncaab: "cbb",
    basketball_euroleague: "euroleague",
    soccer_epl: "soccer",
    soccer_fifa_world_cup: "soccer",
    tennis_atp_italian_open: "tennis",
    tennis_wta_italian_open: "tennis",
    golf_pga_tour: "golf",
    boxing_boxing: "mma"
  };
  return mapping[sportKey] ?? null;
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

function dateIso(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function normalizeTheOddsApiV1(payload, sportKey) {
  const rows = toArray(payload);
  return rows.map((event) => {
    const grouped = new Map();
    for (const bookRow of event.books || []) {
      if (!grouped.has(bookRow.book)) {
        grouped.set(bookRow.book, {
          key: bookRow.book,
          title: bookRow.book,
          markets: []
        });
      }
      grouped.get(bookRow.book).markets.push({
        key: bookRow.market,
        outcomes: bookRow.outcomes || []
      });
    }

    return {
      id: event.event_id,
      sport_key: sportKey,
      sport_title: event.league || sportTitleFromKey(sportKey),
      home_team: event.home_team,
      away_team: event.away_team,
      commence_time: event.start_time,
      bookmakers: [...grouped.values()]
    };
  });
}

function eventKeyFromSportsDataRow(row) {
  return (
    row.GameID ||
    row.GameId ||
    row.EventId ||
    row.ScoreID ||
    row.ScoreId ||
    row.GlobalGameID ||
    row.GlobalGameId ||
    `${norm(row.HomeTeamName || row.HomeTeam)}-${norm(row.AwayTeamName || row.AwayTeam)}-${String(
      row.DateTime || row.Date || row.GameTime || ""
    ).slice(0, 16)}`
  );
}

function moneyLineOutcomes(row, homeTeam, awayTeam) {
  const homePrice = readNumber(row.HomeMoneyLine ?? row.HomeOdds ?? row.HomeML);
  const awayPrice = readNumber(row.AwayMoneyLine ?? row.AwayOdds ?? row.AwayML);
  if (homePrice === null || awayPrice === null) return null;
  return [
    { name: homeTeam, price: homePrice },
    { name: awayTeam, price: awayPrice }
  ];
}

function spreadOutcomes(row, homeTeam, awayTeam) {
  const homePoint = readNumber(
    row.HomePointSpread ?? row.PointSpreadHome ?? row.PointSpreadHomeTeam
  );
  const awayPoint = readNumber(
    row.AwayPointSpread ??
      row.PointSpreadAway ??
      row.PointSpreadAwayTeam ??
      (homePoint !== null ? -homePoint : null)
  );
  const homePrice = readNumber(row.HomePointSpreadPayout ?? row.HomeSpreadPayout ?? row.HomeSpreadOdds);
  const awayPrice = readNumber(row.AwayPointSpreadPayout ?? row.AwaySpreadPayout ?? row.AwaySpreadOdds);
  if (homePoint === null || awayPoint === null) return null;
  return [
    { name: homeTeam, point: homePoint, price: homePrice ?? -110 },
    { name: awayTeam, point: awayPoint, price: awayPrice ?? -110 }
  ];
}

function totalOutcomes(row) {
  const total = readNumber(row.OverUnder ?? row.Total ?? row.TotalPoints);
  const overPrice = readNumber(row.OverPayout ?? row.OverOdds ?? row.OverMoneyLine);
  const underPrice = readNumber(row.UnderPayout ?? row.UnderOdds ?? row.UnderMoneyLine);
  if (total === null) return null;
  return [
    { name: "Over", point: total, price: overPrice ?? -110 },
    { name: "Under", point: total, price: underPrice ?? -110 }
  ];
}

function normalizeSportsDataIoOdds(rows, sportKey) {
  const grouped = new Map();

  for (const row of toArray(rows)) {
    const eventId = String(eventKeyFromSportsDataRow(row));
    const homeTeam = row.HomeTeamName || row.HomeTeam || row.HomeTeamID || "Home";
    const awayTeam = row.AwayTeamName || row.AwayTeam || row.AwayTeamID || "Away";
    const commence = row.DateTime || row.GameTime || row.Date || new Date().toISOString();
    const sportsbook = row.Sportsbook || row.SportsBook || row.SportsbookName || "consensus";

    if (!grouped.has(eventId)) {
      grouped.set(eventId, {
        id: eventId,
        sport_key: sportKey,
        sport_title: row.League || sportTitleFromKey(sportKey),
        home_team: String(homeTeam),
        away_team: String(awayTeam),
        commence_time: commence,
        bookmakers: new Map()
      });
    }

    const event = grouped.get(eventId);
    if (!event.bookmakers.has(sportsbook)) {
      event.bookmakers.set(sportsbook, {
        key: norm(sportsbook),
        title: sportsbook,
        markets: []
      });
    }
    const bookmaker = event.bookmakers.get(sportsbook);

    const h2h = moneyLineOutcomes(row, String(homeTeam), String(awayTeam));
    if (h2h) bookmaker.markets.push({ key: "h2h", outcomes: h2h });

    const spreads = spreadOutcomes(row, String(homeTeam), String(awayTeam));
    if (spreads) bookmaker.markets.push({ key: "spreads", outcomes: spreads });

    const totals = totalOutcomes(row);
    if (totals) bookmaker.markets.push({ key: "totals", outcomes: totals });
  }

  return [...grouped.values()].map((event) => ({
    ...event,
    bookmakers: [...event.bookmakers.values()].map((book) => ({
      ...book,
      markets: book.markets.filter((market) => Array.isArray(market.outcomes) && market.outcomes.length)
    }))
  }));
}

async function fetchSportsDataIoOdds({
  client,
  sportPath,
  apiKey,
  retryAttempts
}) {
  const dates = [dateIso(0), dateIso(1), dateIso(2)];
  const endpointTemplates = [
    (d) => `/v3/${sportPath}/odds/json/GameOddsByDate/${d}`,
    (d) => `/v3/${sportPath}/odds/json/GameLinesByDate/${d}`,
    (d) => `/v3/${sportPath}/odds/json/PreGameOddsByDate/${d}`,
    (d) => `/v3/${sportPath}/odds/json/BettingMarketsByDate/${d}`
  ];

  const allRows = [];
  const errors = [];

  for (const d of dates) {
    let dayRows = [];
    let daySuccess = false;

    for (const makePath of endpointTemplates) {
      try {
        const response = await withRetry(
          () =>
            client.get(makePath(d), {
              headers: { "Ocp-Apim-Subscription-Key": apiKey },
              params: { key: apiKey }
            }),
          { attempts: retryAttempts }
        );
        const rows = toArray(response.data);
        if (rows.length) {
          dayRows = rows;
          daySuccess = true;
          break;
        }
      } catch (error) {
        errors.push(error);
      }
    }

    if (daySuccess) allRows.push(...dayRows);
  }

  if (!allRows.length && errors.length) {
    throw errors[errors.length - 1];
  }
  return allRows;
}

export function createOddsApiClient({
  apiKey,
  baseUrl,
  regions,
  oddsFormat,
  timeoutMs,
  retryAttempts,
  oddsProvider,
  sportsDataIoApiKey,
  sportsDataIoBaseUrl
}) {
  const provider = (oddsProvider || "").toLowerCase() === "sportsdataio" || sportsDataIoApiKey
    ? "sportsdataio"
    : "theoddsapi";

  const isTheOddsApiV1 =
    String(apiKey || "").startsWith("toa_") ||
    String(baseUrl || "").includes("api.theoddsapi.com");

  const oddsClient = axios.create({
    baseURL: isTheOddsApiV1 ? "https://api.theoddsapi.com" : baseUrl,
    timeout: timeoutMs
  });

  const sportsDataClient = axios.create({
    baseURL: sportsDataIoBaseUrl || "https://api.sportsdata.io",
    timeout: timeoutMs
  });

  async function getSports() {
    if (provider === "sportsdataio") return [];
    if (!apiKey) return [];

    if (isTheOddsApiV1) {
      const response = await withRetry(
        () =>
          oddsClient.get("/sports", {
            headers: { "x-api-key": apiKey }
          }),
        { attempts: retryAttempts }
      );
      return toArray(response.data);
    }

    const response = await withRetry(
      () =>
        oddsClient.get("/sports", {
          params: { apiKey }
        }),
      { attempts: retryAttempts }
    );
    return toArray(response.data);
  }

  async function getOdds(sportKey, markets = ["h2h", "spreads", "totals"]) {
    if (provider === "sportsdataio") {
      if (!sportsDataIoApiKey) return [];
      const sportPath = sportsDataSportPath(sportKey);
      if (!sportPath) return [];
      const rows = await fetchSportsDataIoOdds({
        client: sportsDataClient,
        sportPath,
        apiKey: sportsDataIoApiKey,
        retryAttempts
      });
      return normalizeSportsDataIoOdds(rows, sportKey);
    }

    if (!apiKey) return [];
    if (isTheOddsApiV1) {
      const response = await withRetry(
        () =>
          oddsClient.get("/odds/", {
            headers: { "x-api-key": apiKey },
            params: {
              sport_key: sportKey,
              markets: markets.join(","),
              oddsFormat: oddsFormat || "american",
              regions: regions || "us"
            }
          }),
        { attempts: retryAttempts }
      );
      return normalizeTheOddsApiV1(response.data, sportKey);
    }

    const response = await withRetry(
      () =>
        oddsClient.get(`/sports/${sportKey}/odds`, {
          params: {
            apiKey,
            regions: regions || "us",
            markets: markets.join(","),
            oddsFormat: oddsFormat || "american"
          }
        }),
      { attempts: retryAttempts }
    );
    return toArray(response.data);
  }

  return {
    provider,
    getSports,
    getOdds
  };
}
