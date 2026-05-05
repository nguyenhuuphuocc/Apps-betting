PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  bankroll_starting REAL NOT NULL DEFAULT 1000,
  bankroll_current REAL NOT NULL DEFAULT 1000,
  unit_percent REAL NOT NULL DEFAULT 1.0,
  max_single_bet_percent REAL NOT NULL DEFAULT 5.0,
  max_daily_exposure_percent REAL NOT NULL DEFAULT 12.0,
  stop_loss_percent REAL NOT NULL DEFAULT 8.0,
  profit_target_percent REAL NOT NULL DEFAULT 12.0,
  losing_streak_protection INTEGER NOT NULL DEFAULT 1,
  min_confidence_required REAL NOT NULL DEFAULT 6.0,
  min_ev_required REAL NOT NULL DEFAULT 3.0,
  max_risk_level TEXT NOT NULL DEFAULT 'High',
  max_bets_per_day INTEGER NOT NULL DEFAULT 5,
  max_units_per_bet REAL NOT NULL DEFAULT 3.0,
  max_units_per_day REAL NOT NULL DEFAULT 8.0,
  use_kelly INTEGER NOT NULL DEFAULT 1,
  fractional_kelly REAL NOT NULL DEFAULT 0.5,
  api_provider TEXT NOT NULL DEFAULT 'balldontlie+odds',
  odds_format TEXT NOT NULL DEFAULT 'american',
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  compact_mode INTEGER NOT NULL DEFAULT 0,
  theme_mode TEXT NOT NULL DEFAULT 'dark',
  team_form_weight REAL NOT NULL DEFAULT 1.0,
  player_form_weight REAL NOT NULL DEFAULT 1.0,
  injury_weight REAL NOT NULL DEFAULT 1.15,
  home_away_weight REAL NOT NULL DEFAULT 0.95,
  rest_days_weight REAL NOT NULL DEFAULT 0.8,
  head_to_head_weight REAL NOT NULL DEFAULT 0.5,
  odds_movement_weight REAL NOT NULL DEFAULT 0.7,
  pace_weight REAL NOT NULL DEFAULT 0.8,
  defense_matchup_weight REAL NOT NULL DEFAULT 0.9,
  live_refresh_seconds INTEGER NOT NULL DEFAULT 30,
  odds_refresh_minutes INTEGER NOT NULL DEFAULT 10,
  scheduled_refresh_hours INTEGER NOT NULL DEFAULT 6,
  injuries_refresh_minutes INTEGER NOT NULL DEFAULT 20,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  external_id INTEGER UNIQUE NOT NULL,
  abbreviation TEXT NOT NULL,
  city TEXT,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  conference TEXT,
  division TEXT,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  home_record TEXT,
  road_record TEXT,
  net_rating REAL,
  offense_rating REAL,
  defense_rating REAL,
  pace REAL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY,
  external_id INTEGER UNIQUE NOT NULL,
  team_external_id INTEGER,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT,
  height TEXT,
  weight TEXT,
  jersey_number TEXT,
  status TEXT DEFAULT 'Available',
  injury_note TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS injuries (
  id INTEGER PRIMARY KEY,
  external_id INTEGER UNIQUE,
  player_external_id INTEGER NOT NULL,
  team_external_id INTEGER,
  status TEXT,
  description TEXT,
  start_date TEXT,
  return_date TEXT,
  source TEXT DEFAULT 'balldontlie',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY,
  external_id INTEGER UNIQUE NOT NULL,
  sport_key TEXT NOT NULL DEFAULT 'basketball_nba',
  league TEXT NOT NULL DEFAULT 'NBA',
  season INTEGER,
  date TEXT NOT NULL,
  commence_time TEXT,
  status TEXT NOT NULL,
  period INTEGER DEFAULT 0,
  clock TEXT,
  postseason INTEGER DEFAULT 0,
  home_team_external_id INTEGER NOT NULL,
  away_team_external_id INTEGER NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  home_record TEXT,
  away_record TEXT,
  home_rest_days INTEGER,
  away_rest_days INTEGER,
  is_back_to_back_home INTEGER DEFAULT 0,
  is_back_to_back_away INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS player_game_stats (
  id INTEGER PRIMARY KEY,
  game_external_id INTEGER NOT NULL,
  player_external_id INTEGER NOT NULL,
  team_external_id INTEGER,
  minutes TEXT,
  points REAL DEFAULT 0,
  rebounds REAL DEFAULT 0,
  assists REAL DEFAULT 0,
  steals REAL DEFAULT 0,
  blocks REAL DEFAULT 0,
  turnovers REAL DEFAULT 0,
  fg_pct REAL,
  fg3_pct REAL,
  ft_pct REAL,
  plus_minus REAL,
  usage_rate REAL,
  true_shooting_pct REAL,
  created_at TEXT NOT NULL,
  UNIQUE (game_external_id, player_external_id)
);

CREATE TABLE IF NOT EXISTS odds_history (
  id INTEGER PRIMARY KEY,
  game_external_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  sportsbook TEXT NOT NULL,
  market_type TEXT NOT NULL,
  home_price REAL,
  away_price REAL,
  draw_price REAL,
  spread REAL,
  total REAL,
  over_price REAL,
  under_price REAL,
  line_label TEXT,
  captured_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY,
  game_external_id INTEGER NOT NULL,
  market_type TEXT NOT NULL,
  pick TEXT NOT NULL,
  model_probability REAL NOT NULL,
  implied_probability REAL,
  edge_pct REAL,
  expected_value_pct REAL,
  confidence_score REAL NOT NULL,
  risk_level TEXT NOT NULL,
  suggested_units REAL NOT NULL,
  recommendation TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bets (
  id INTEGER PRIMARY KEY,
  external_ref TEXT UNIQUE,
  game_external_id INTEGER,
  market_type TEXT NOT NULL,
  pick TEXT NOT NULL,
  odds REAL NOT NULL,
  model_probability REAL,
  implied_probability REAL,
  edge_pct REAL,
  stake_units REAL NOT NULL,
  result TEXT NOT NULL DEFAULT 'open',
  pnl_units REAL DEFAULT 0,
  note TEXT,
  created_at TEXT NOT NULL,
  settled_at TEXT
);

CREATE TABLE IF NOT EXISTS bankroll_history (
  id INTEGER PRIMARY KEY,
  bankroll REAL NOT NULL,
  units_won_lost REAL NOT NULL,
  win_rate REAL,
  roi REAL,
  average_odds REAL,
  best_bet_type TEXT,
  worst_bet_type TEXT,
  streak_losses INTEGER DEFAULT 0,
  captured_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS backtest_results (
  id INTEGER PRIMARY KEY,
  run_label TEXT NOT NULL,
  date_from TEXT NOT NULL,
  date_to TEXT NOT NULL,
  total_bets INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  losses INTEGER NOT NULL,
  pushes INTEGER NOT NULL,
  win_rate REAL NOT NULL,
  roi REAL NOT NULL,
  units_won_lost REAL NOT NULL,
  best_bet_type TEXT,
  worst_bet_type TEXT,
  result_payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_games_date ON games (date);
CREATE INDEX IF NOT EXISTS idx_games_status ON games (status);
CREATE INDEX IF NOT EXISTS idx_odds_game_time ON odds_history (game_external_id, captured_at);
CREATE INDEX IF NOT EXISTS idx_predictions_game ON predictions (game_external_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bets_result ON bets (result);
CREATE INDEX IF NOT EXISTS idx_stats_game_player ON player_game_stats (game_external_id, player_external_id);
