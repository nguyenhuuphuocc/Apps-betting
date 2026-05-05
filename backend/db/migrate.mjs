import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { nowIso } from "../lib/time.mjs";

function ensureSettingsColumns(db) {
  const existing = new Set(
    db
      .prepare("PRAGMA table_info(settings)")
      .all()
      .map((row) => row.name)
  );

  const columnSpecs = [
    ["max_daily_exposure_percent", "REAL NOT NULL DEFAULT 12.0"],
    ["stop_loss_percent", "REAL NOT NULL DEFAULT 8.0"],
    ["profit_target_percent", "REAL NOT NULL DEFAULT 12.0"],
    ["losing_streak_protection", "INTEGER NOT NULL DEFAULT 1"],
    ["min_confidence_required", "REAL NOT NULL DEFAULT 6.0"],
    ["min_ev_required", "REAL NOT NULL DEFAULT 3.0"],
    ["max_risk_level", "TEXT NOT NULL DEFAULT 'High'"],
    ["max_bets_per_day", "INTEGER NOT NULL DEFAULT 5"],
    ["max_units_per_bet", "REAL NOT NULL DEFAULT 3.0"],
    ["max_units_per_day", "REAL NOT NULL DEFAULT 8.0"],
    ["use_kelly", "INTEGER NOT NULL DEFAULT 1"],
    ["fractional_kelly", "REAL NOT NULL DEFAULT 0.5"],
    ["api_provider", "TEXT NOT NULL DEFAULT 'balldontlie+odds'"],
    ["odds_format", "TEXT NOT NULL DEFAULT 'american'"],
    ["timezone", "TEXT NOT NULL DEFAULT 'America/Chicago'"],
    ["compact_mode", "INTEGER NOT NULL DEFAULT 0"],
    ["theme_mode", "TEXT NOT NULL DEFAULT 'dark'"],
    ["team_form_weight", "REAL NOT NULL DEFAULT 1.0"],
    ["player_form_weight", "REAL NOT NULL DEFAULT 1.0"],
    ["injury_weight", "REAL NOT NULL DEFAULT 1.15"],
    ["home_away_weight", "REAL NOT NULL DEFAULT 0.95"],
    ["rest_days_weight", "REAL NOT NULL DEFAULT 0.8"],
    ["head_to_head_weight", "REAL NOT NULL DEFAULT 0.5"],
    ["odds_movement_weight", "REAL NOT NULL DEFAULT 0.7"],
    ["pace_weight", "REAL NOT NULL DEFAULT 0.8"],
    ["defense_matchup_weight", "REAL NOT NULL DEFAULT 0.9"]
  ];

  for (const [name, spec] of columnSpecs) {
    if (existing.has(name)) continue;
    db.exec(`ALTER TABLE settings ADD COLUMN ${name} ${spec}`);
  }
}

function ensureGameColumns(db) {
  const existing = new Set(
    db
      .prepare("PRAGMA table_info(games)")
      .all()
      .map((row) => row.name)
  );

  const columnSpecs = [
    ["sport_key", "TEXT NOT NULL DEFAULT 'basketball_nba'"],
    ["league", "TEXT NOT NULL DEFAULT 'NBA'"]
  ];

  for (const [name, spec] of columnSpecs) {
    if (existing.has(name)) continue;
    db.exec(`ALTER TABLE games ADD COLUMN ${name} ${spec}`);
  }
}

export function ensureDatabase(dbPath, projectRoot) {
  const resolvedDbPath = path.isAbsolute(dbPath) ? dbPath : path.join(projectRoot, dbPath);
  const dbDir = path.dirname(resolvedDbPath);
  fs.mkdirSync(dbDir, { recursive: true });

  const db = new DatabaseSync(resolvedDbPath);
  const schemaPath = path.join(projectRoot, "backend", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
  ensureSettingsColumns(db);
  ensureGameColumns(db);

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
