import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().optional(),
  API_PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  ODDS_API_KEY: z.string().optional(),
  ODDS_API_BASE_URL: z.string().default("https://api.the-odds-api.com/v4"),
  ODDS_PROVIDER: z.string().default("theoddsapi"),
  ODDS_REGIONS: z.string().default("us"),
  ODDS_FORMAT: z.enum(["american", "decimal"]).default("american"),
  SPORTSDATAIO_API_KEY: z.string().optional(),
  SPORTSDATAIO_BASE_URL: z.string().default("https://api.sportsdata.io"),
  BALLDONTLIE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  CACHE_TTL_SECONDS: z.coerce.number().default(120),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(12000),
  RETRY_ATTEMPTS: z.coerce.number().default(3),
  ENABLE_AUTO_SYNC: z.string().default("false"),
  AUTO_SYNC_CRON: z.string().default("0 */6 * * *"),
  AUTO_SYNC_SPORT_KEYS: z.string().default(""),
  SUPPORTED_SPORT_KEYS: z
    .string()
    .default(
      "basketball_nba,basketball_wnba,baseball_mlb,icehockey_nhl,americanfootball_nfl,basketball_ncaab,basketball_euroleague,soccer_epl,soccer_fifa_world_cup,tennis_atp_italian_open,tennis_wta_italian_open,golf_pga_tour,boxing_boxing"
    )
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  ODDS_PROVIDER: String(parsed.data.ODDS_PROVIDER || "theoddsapi").toLowerCase(),
  API_PORT: parsed.data.PORT ?? parsed.data.API_PORT,
  supportedSportKeys: parsed.data.SUPPORTED_SPORT_KEYS.split(",").map((key) => key.trim()),
  autoSyncEnabled: String(parsed.data.ENABLE_AUTO_SYNC).toLowerCase() === "true",
  autoSyncCron: parsed.data.AUTO_SYNC_CRON,
  autoSyncSportKeys: parsed.data.AUTO_SYNC_SPORT_KEYS
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean),
  frontendOrigins: parsed.data.FRONTEND_ORIGIN.split(",")
    .map((origin) => origin.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean)
};
