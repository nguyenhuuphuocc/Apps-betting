import axios from "axios";
import { withRetry } from "../../lib/retry.js";

export function createOddsApiClient({ apiKey, baseUrl, timeoutMs, retryAttempts }) {
  const useTheOddsApiV1 =
    String(apiKey || "").startsWith("toa_") ||
    String(baseUrl || "").includes("api.theoddsapi.com");
  const resolvedBaseUrl = useTheOddsApiV1
    ? "https://api.theoddsapi.com"
    : baseUrl;

  const client = axios.create({
    baseURL: resolvedBaseUrl,
    timeout: timeoutMs
  });

  function normalizeV1OddsPayload(payload, sportKey) {
    const rows = Array.isArray(payload?.data) ? payload.data : [];
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
        sport_title: event.league || sportKey,
        home_team: event.home_team,
        away_team: event.away_team,
        commence_time: event.start_time,
        bookmakers: [...grouped.values()]
      };
    });
  }

  async function getSports() {
    if (!apiKey) return [];
    if (useTheOddsApiV1) {
      const response = await withRetry(
        () =>
          client.get("/sports", {
            headers: { "x-api-key": apiKey }
          }),
        { attempts: retryAttempts }
      );
      const raw = response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    }

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
    if (useTheOddsApiV1) {
      const response = await withRetry(
        () =>
          client.get("/odds/", {
            headers: { "x-api-key": apiKey },
            params: {
              sport_key: sportKey
            }
          }),
        { attempts: retryAttempts }
      );
      return normalizeV1OddsPayload(response.data, sportKey);
    }

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
