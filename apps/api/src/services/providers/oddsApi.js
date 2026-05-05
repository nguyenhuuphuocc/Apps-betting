import axios from "axios";
import { withRetry } from "../../lib/retry.js";

export function createOddsApiClient({ apiKey, baseUrl, timeoutMs, retryAttempts }) {
  const client = axios.create({
    baseURL: baseUrl,
    timeout: timeoutMs
  });

  async function getSports() {
    if (!apiKey) return [];
    const response = await withRetry(
      () =>
        client.get("/sports", {
          params: { apiKey }
        }),
      { attempts: retryAttempts }
    );
    return response.data ?? [];
  }

  async function getOdds(sportKey, markets = ["h2h", "spreads", "totals"]) {
    if (!apiKey) return [];
    const response = await withRetry(
      () =>
        client.get(`/sports/${sportKey}/odds`, {
          params: {
            apiKey,
            regions: "us,uk,eu",
            markets: markets.join(","),
            oddsFormat: "american"
          }
        }),
      { attempts: retryAttempts }
    );
    return response.data ?? [];
  }

  return {
    getSports,
    getOdds
  };
}
