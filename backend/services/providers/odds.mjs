async function fetchOddsV4(baseUrl, apiKey, markets) {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/sports/basketball_nba/odds`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", "us");
  url.searchParams.set("oddsFormat", "american");
  url.searchParams.set("markets", markets.join(","));
  url.searchParams.set("bookmakers", "fanduel,draftkings,betmgm");

  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ODDS API v4 ${response.status}: ${message}`);
  }

  return response.json();
}

async function fetchOddsHttp(baseUrl, apiKey, markets) {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/odds`);
  url.searchParams.set("sport", "NBA");
  url.searchParams.set("regions", "us");
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

function normalizeOddsEvents(rawEvents) {
  return rawEvents.map((event) => {
    const bookmakers = event.bookmakers || event.sportsbooks || [];
    return {
      providerEventId: event.id || event.event_id || null,
      commence_time: event.commence_time || event.start_time || null,
      home_team: event.home_team || event.homeTeam || null,
      away_team: event.away_team || event.awayTeam || null,
      bookmakers
    };
  });
}

export function createOddsClient(apiKey, baseUrl) {
  async function getNbaOdds() {
    if (!apiKey) return [];
    const markets = ["h2h", "spreads", "totals"];
    try {
      const payload = baseUrl.includes("/v4")
        ? await fetchOddsV4(baseUrl, apiKey, markets)
        : await fetchOddsHttp(baseUrl, apiKey, markets);
      return normalizeOddsEvents(payload);
    } catch (error) {
      return [];
    }
  }

  return {
    getNbaOdds
  };
}
