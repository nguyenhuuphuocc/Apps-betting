const DEFAULT_MARKETS = ["h2h", "spreads", "totals"];

function fallbackLegacySport(sportKey) {
  if (sportKey === "basketball_nba") return "NBA";
  if (sportKey === "basketball_wnba") return "WNBA";
  if (sportKey === "baseball_mlb") return "MLB";
  if (sportKey === "icehockey_nhl") return "NHL";
  if (sportKey === "americanfootball_nfl") return "NFL";
  if (sportKey === "basketball_ncaab") return "NCAAB";
  return sportKey;
}

async function fetchOddsV4(baseUrl, apiKey, sportKey, markets) {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/sports/${sportKey}/odds`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", "us,uk,eu");
  url.searchParams.set("oddsFormat", "american");
  url.searchParams.set("markets", markets.join(","));

  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ODDS API v4 ${response.status}: ${message}`);
  }

  return response.json();
}

async function fetchOddsHttp(baseUrl, apiKey, sportKey, markets) {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/odds`);
  url.searchParams.set("sport", fallbackLegacySport(sportKey));
  url.searchParams.set("regions", "us,uk,eu");
  url.searchParams.set("oddsFormat", "american");
  url.searchParams.set("markets", markets.join(","));

  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey
    }
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ODDS API ${response.status}: ${message}`);
  }

  return response.json();
}

function normalizeOddsEvents(rawEvents, fallbackSportKey = "basketball_nba") {
  return rawEvents.map((event) => {
    const bookmakers = event.bookmakers || event.sportsbooks || [];
    return {
      providerEventId: event.id || event.event_id || null,
      sport_key: event.sport_key || fallbackSportKey,
      sport_title: event.sport_title || null,
      commence_time: event.commence_time || event.start_time || null,
      home_team: event.home_team || event.homeTeam || null,
      away_team: event.away_team || event.awayTeam || null,
      bookmakers
    };
  });
}

export function createOddsClient(apiKey, baseUrl) {
  async function getOddsBySport(sportKey, markets = DEFAULT_MARKETS) {
    if (!apiKey) return [];
    try {
      const payload = baseUrl.includes("/v4")
        ? await fetchOddsV4(baseUrl, apiKey, sportKey, markets)
        : await fetchOddsHttp(baseUrl, apiKey, sportKey, markets);
      return normalizeOddsEvents(payload, sportKey);
    } catch (error) {
      return [];
    }
  }

  async function getMultiSportOdds(sportKeys, markets = DEFAULT_MARKETS) {
    if (!Array.isArray(sportKeys) || !sportKeys.length) return [];
    const byEvent = new Map();
    for (const sportKey of sportKeys) {
      const events = await getOddsBySport(sportKey, markets);
      for (const event of events) {
        const key = `${sportKey}:${event.providerEventId || `${event.home_team}-${event.away_team}-${event.commence_time}`}`;
        if (!byEvent.has(key)) byEvent.set(key, event);
      }
    }
    return [...byEvent.values()];
  }

  async function getNbaOdds() {
    return getOddsBySport("basketball_nba", DEFAULT_MARKETS);
  }

  return {
    getNbaOdds,
    getOddsBySport,
    getMultiSportOdds
  };
}
