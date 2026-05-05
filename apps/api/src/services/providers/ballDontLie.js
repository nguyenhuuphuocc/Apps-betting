import axios from "axios";
import { withRetry } from "../../lib/retry.js";

export function createBallDontLieClient({ apiKey, timeoutMs, retryAttempts }) {
  const client = axios.create({
    baseURL: "https://api.balldontlie.io",
    timeout: timeoutMs,
    headers: apiKey ? { Authorization: apiKey } : {}
  });

  async function getGamesByDate(date, sport = "nba") {
    if (!apiKey) return [];
    const prefix = sport === "nba" ? "/v1" : `/${sport}/v1`;
    const response = await withRetry(
      () =>
        client.get(`${prefix}/games`, {
          params: {
            "dates[]": date,
            per_page: 100
          }
        }),
      { attempts: retryAttempts }
    );
    return response.data?.data ?? [];
  }

  async function getNbaTeamStats(gameId) {
    if (!apiKey) return [];
    const response = await withRetry(
      () =>
        client.get("/v1/stats", {
          params: {
            "game_ids[]": gameId,
            per_page: 100
          }
        }),
      { attempts: retryAttempts }
    );
    return response.data?.data ?? [];
  }

  return {
    getGamesByDate,
    getNbaTeamStats
  };
}
