import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { nowIso } from "../lib/time.mjs";

export function ensureDatabase(dbPath, projectRoot) {
  const resolvedDbPath = path.isAbsolute(dbPath) ? dbPath : path.join(projectRoot, dbPath);
  const dbDir = path.dirname(resolvedDbPath);
  fs.mkdirSync(dbDir, { recursive: true });

  const db = new DatabaseSync(resolvedDbPath);
  const schemaPath = path.join(projectRoot, "backend", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);

  db.prepare(
    `
      INSERT INTO settings (
        id, bankroll_starting, bankroll_current, unit_percent, max_single_bet_percent,
        live_refresh_seconds, odds_refresh_minutes, scheduled_refresh_hours, injuries_refresh_minutes, updated_at
      )
      VALUES (1, 1000, 1000, 1.0, 5.0, 30, 10, 6, 20, ?)
      ON CONFLICT(id) DO NOTHING
    `
  ).run(nowIso());

  return { db, dbPath: resolvedDbPath };
}
