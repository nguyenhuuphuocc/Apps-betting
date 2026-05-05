const BASE_URL = "https://api.balldontlie.io/v1";

async function callBallDontLie(path, apiKey, query = {}) {
  if (!apiKey) return { data: [], unavailable: true };
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, item);
    } else {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`BALLDONTLIE ${response.status}: ${message}`);
  }

  return response.json();
}

export function createBallDontLieClient(apiKey) {
  async function getTeams() {
    try {
      const payload = await callBallDontLie("/teams", apiKey);
      return payload.data || [];
    } catch (error) {
      return [];
    }
  }

  async function getGamesByDate(isoDate) {
    try {
      const payload = await callBallDontLie("/games", apiKey, { "dates[]": [isoDate], per_page: 100 });
      return payload.data || [];
    } catch (error) {
      return [];
    }
  }

  async function getStandings(season) {
    try {
      const payload = await callBallDontLie("/standings", apiKey, { season, per_page: 100 });
      return payload.data || [];
    } catch (error) {
      return [];
    }
  }

  async function getInjuries() {
    try {
      const payload = await callBallDontLie("/player_injuries", apiKey, { per_page: 200 });
      return payload.data || [];
    } catch (error) {
      return [];
    }
  }

  async function getStatsForGame(gameExternalId) {
    try {
      const payload = await callBallDontLie("/stats", apiKey, { "game_ids[]": [gameExternalId], per_page: 100 });
      return payload.data || [];
    } catch (error) {
      return [];
    }
  }

  async function getPlayersForTeam(teamExternalId) {
    try {
      const payload = await callBallDontLie("/players", apiKey, {
        "team_ids[]": [teamExternalId],
        per_page: 100
      });
      return payload.data || [];
    } catch (error) {
      return [];
    }
  }

  async function getBettingOdds(date) {
    try {
      const payload = await callBallDontLie("/betting_odds", apiKey, {
        "dates[]": [date],
        per_page: 100
      });
      return payload.data || [];
    } catch (error) {
      return [];
    }
  }

  return {
    getTeams,
    getGamesByDate,
    getStandings,
    getInjuries,
    getStatsForGame,
    getPlayersForTeam,
    getBettingOdds
  };
}
