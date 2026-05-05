import fs from "node:fs";
import path from "node:path";

function parseEnvFile(content) {
  const env = {};
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const delimiterIndex = line.indexOf("=");
    if (delimiterIndex <= 0) continue;
    const key = line.slice(0, delimiterIndex).trim();
    let value = line.slice(delimiterIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

export function loadEnv(projectRoot) {
  const filePath = path.join(projectRoot, ".env");
  if (fs.existsSync(filePath)) {
    const parsed = parseEnvFile(fs.readFileSync(filePath, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key]) process.env[key] = value;
    }
  }

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 8787),
    dbPath: process.env.DB_PATH || "./data/live-betting.sqlite",
    balldontlieApiKey: process.env.BALLDONTLIE_API_KEY || "",
    oddsApiKey: process.env.ODDS_API_KEY || "",
    oddsApiBaseUrl: process.env.ODDS_API_BASE_URL || "https://api.the-odds-api.com/v4"
  };
}
