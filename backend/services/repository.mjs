import { nowIso } from "../lib/time.mjs";

export function createRepository(db) {
  const statements = {
    getSettings: db.prepare("SELECT * FROM settings WHERE id = 1"),
    updateSettings: db.prepare(`
      UPDATE settings
      SET bankroll_starting = COALESCE(@bankroll_starting, bankroll_starting),
          bankroll_current = COALESCE(@bankroll_current, bankroll_current),
          unit_percent = COALESCE(@unit_percent, unit_percent),
          max_single_bet_percent = COALESCE(@max_single_bet_percent, max_single_bet_percent),
          max_daily_exposure_percent = COALESCE(@max_daily_exposure_percent, max_daily_exposure_percent),
          stop_loss_percent = COALESCE(@stop_loss_percent, stop_loss_percent),
          profit_target_percent = COALESCE(@profit_target_percent, profit_target_percent),
          losing_streak_protection = COALESCE(@losing_streak_protection, losing_streak_protection),
          min_confidence_required = COALESCE(@min_confidence_required, min_confidence_required),
          min_ev_required = COALESCE(@min_ev_required, min_ev_required),
          max_risk_level = COALESCE(@max_risk_level, max_risk_level),
          max_bets_per_day = COALESCE(@max_bets_per_day, max_bets_per_day),
          max_units_per_bet = COALESCE(@max_units_per_bet, max_units_per_bet),
          max_units_per_day = COALESCE(@max_units_per_day, max_units_per_day),
          use_kelly = COALESCE(@use_kelly, use_kelly),
          fractional_kelly = COALESCE(@fractional_kelly, fractional_kelly),
          api_provider = COALESCE(@api_provider, api_provider),
          odds_format = COALESCE(@odds_format, odds_format),
          timezone = COALESCE(@timezone, timezone),
          compact_mode = COALESCE(@compact_mode, compact_mode),
          theme_mode = COALESCE(@theme_mode, theme_mode),
          team_form_weight = COALESCE(@team_form_weight, team_form_weight),
          player_form_weight = COALESCE(@player_form_weight, player_form_weight),
          injury_weight = COALESCE(@injury_weight, injury_weight),
          home_away_weight = COALESCE(@home_away_weight, home_away_weight),
          rest_days_weight = COALESCE(@rest_days_weight, rest_days_weight),
          head_to_head_weight = COALESCE(@head_to_head_weight, head_to_head_weight),
          odds_movement_weight = COALESCE(@odds_movement_weight, odds_movement_weight),
          pace_weight = COALESCE(@pace_weight, pace_weight),
          defense_matchup_weight = COALESCE(@defense_matchup_weight, defense_matchup_weight),
          live_refresh_seconds = COALESCE(@live_refresh_seconds, live_refresh_seconds),
          odds_refresh_minutes = COALESCE(@odds_refresh_minutes, odds_refresh_minutes),
          scheduled_refresh_hours = COALESCE(@scheduled_refresh_hours, scheduled_refresh_hours),
          injuries_refresh_minutes = COALESCE(@injuries_refresh_minutes, injuries_refresh_minutes),
          updated_at = @updated_at
      WHERE id = 1
    `),
    upsertTeam: db.prepare(`
      INSERT INTO teams (
        external_id, abbreviation, city, name, full_name, conference, division,
        wins, losses, home_record, road_record, net_rating, offense_rating, defense_rating, pace, updated_at
      )
      VALUES (
        @external_id, @abbreviation, @city, @name, @full_name, @conference, @division,
        @wins, @losses, @home_record, @road_record, @net_rating, @offense_rating, @defense_rating, @pace, @updated_at
      )
      ON CONFLICT(external_id) DO UPDATE SET
        abbreviation = excluded.abbreviation,
        city = excluded.city,
        name = excluded.name,
        full_name = excluded.full_name,
        conference = excluded.conference,
        division = excluded.division,
        wins = excluded.wins,
        losses = excluded.losses,
        home_record = excluded.home_record,
        road_record = excluded.road_record,
        net_rating = excluded.net_rating,
        offense_rating = excluded.offense_rating,
        defense_rating = excluded.defense_rating,
        pace = excluded.pace,
        updated_at = excluded.updated_at
    `),
    upsertGame: db.prepare(`
      INSERT INTO games (
        external_id, sport_key, league, season, date, commence_time, status, period, clock, postseason,
        home_team_external_id, away_team_external_id, home_score, away_score,
        home_record, away_record, home_rest_days, away_rest_days,
        is_back_to_back_home, is_back_to_back_away, updated_at
      )
      VALUES (
        @external_id, @sport_key, @league, @season, @date, @commence_time, @status, @period, @clock, @postseason,
        @home_team_external_id, @away_team_external_id, @home_score, @away_score,
        @home_record, @away_record, @home_rest_days, @away_rest_days,
        @is_back_to_back_home, @is_back_to_back_away, @updated_at
      )
      ON CONFLICT(external_id) DO UPDATE SET
        sport_key = excluded.sport_key,
        league = excluded.league,
        season = excluded.season,
        date = excluded.date,
        commence_time = excluded.commence_time,
        status = excluded.status,
        period = excluded.period,
        clock = excluded.clock,
        postseason = excluded.postseason,
        home_team_external_id = excluded.home_team_external_id,
        away_team_external_id = excluded.away_team_external_id,
        home_score = excluded.home_score,
        away_score = excluded.away_score,
        home_record = excluded.home_record,
        away_record = excluded.away_record,
        home_rest_days = excluded.home_rest_days,
        away_rest_days = excluded.away_rest_days,
        is_back_to_back_home = excluded.is_back_to_back_home,
        is_back_to_back_away = excluded.is_back_to_back_away,
        updated_at = excluded.updated_at
    `),
    upsertPlayer: db.prepare(`
      INSERT INTO players (
        external_id, team_external_id, first_name, last_name, full_name, position,
        height, weight, jersey_number, status, injury_note, updated_at
      )
      VALUES (
        @external_id, @team_external_id, @first_name, @last_name, @full_name, @position,
        @height, @weight, @jersey_number, @status, @injury_note, @updated_at
      )
      ON CONFLICT(external_id) DO UPDATE SET
        team_external_id = excluded.team_external_id,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        full_name = excluded.full_name,
        position = excluded.position,
        height = excluded.height,
        weight = excluded.weight,
        jersey_number = excluded.jersey_number,
        status = excluded.status,
        injury_note = excluded.injury_note,
        updated_at = excluded.updated_at
    `),
    upsertInjury: db.prepare(`
      INSERT INTO injuries (
        external_id, player_external_id, team_external_id, status, description,
        start_date, return_date, source, updated_at
      )
      VALUES (
        @external_id, @player_external_id, @team_external_id, @status, @description,
        @start_date, @return_date, @source, @updated_at
      )
      ON CONFLICT(external_id) DO UPDATE SET
        player_external_id = excluded.player_external_id,
        team_external_id = excluded.team_external_id,
        status = excluded.status,
        description = excluded.description,
        start_date = excluded.start_date,
        return_date = excluded.return_date,
        source = excluded.source,
        updated_at = excluded.updated_at
    `),
    insertOdds: db.prepare(`
      INSERT INTO odds_history (
        game_external_id, provider, sportsbook, market_type, home_price, away_price, draw_price,
        spread, total, over_price, under_price, line_label, captured_at
      )
      VALUES (
        @game_external_id, @provider, @sportsbook, @market_type, @home_price, @away_price, @draw_price,
        @spread, @total, @over_price, @under_price, @line_label, @captured_at
      )
    `),
    clearPredictionsForGame: db.prepare(`DELETE FROM predictions WHERE game_external_id = ?`),
    insertPrediction: db.prepare(`
      INSERT INTO predictions (
        game_external_id, market_type, pick, model_probability, implied_probability,
        edge_pct, expected_value_pct, confidence_score, risk_level, suggested_units,
        recommendation, reason, created_at
      )
      VALUES (
        @game_external_id, @market_type, @pick, @model_probability, @implied_probability,
        @edge_pct, @expected_value_pct, @confidence_score, @risk_level, @suggested_units,
        @recommendation, @reason, @created_at
      )
    `),
    upsertPlayerStat: db.prepare(`
      INSERT INTO player_game_stats (
        game_external_id, player_external_id, team_external_id, minutes, points, rebounds, assists,
        steals, blocks, turnovers, fg_pct, fg3_pct, ft_pct, plus_minus, usage_rate, true_shooting_pct, created_at
      )
      VALUES (
        @game_external_id, @player_external_id, @team_external_id, @minutes, @points, @rebounds, @assists,
        @steals, @blocks, @turnovers, @fg_pct, @fg3_pct, @ft_pct, @plus_minus, @usage_rate, @true_shooting_pct, @created_at
      )
      ON CONFLICT(game_external_id, player_external_id) DO UPDATE SET
        team_external_id = excluded.team_external_id,
        minutes = excluded.minutes,
        points = excluded.points,
        rebounds = excluded.rebounds,
        assists = excluded.assists,
        steals = excluded.steals,
        blocks = excluded.blocks,
        turnovers = excluded.turnovers,
        fg_pct = excluded.fg_pct,
        fg3_pct = excluded.fg3_pct,
        ft_pct = excluded.ft_pct,
        plus_minus = excluded.plus_minus,
        usage_rate = excluded.usage_rate,
        true_shooting_pct = excluded.true_shooting_pct,
        created_at = excluded.created_at
    `),
    insertBacktestRun: db.prepare(`
      INSERT INTO backtest_results (
        run_label, date_from, date_to, total_bets, wins, losses, pushes, win_rate, roi,
        units_won_lost, best_bet_type, worst_bet_type, result_payload, created_at
      )
      VALUES (
        @run_label, @date_from, @date_to, @total_bets, @wins, @losses, @pushes, @win_rate, @roi,
        @units_won_lost, @best_bet_type, @worst_bet_type, @result_payload, @created_at
      )
    `),
    insertBankrollHistory: db.prepare(`
      INSERT INTO bankroll_history (
        bankroll, units_won_lost, win_rate, roi, average_odds, best_bet_type, worst_bet_type, streak_losses, captured_at
      )
      VALUES (
        @bankroll, @units_won_lost, @win_rate, @roi, @average_odds, @best_bet_type, @worst_bet_type, @streak_losses, @captured_at
      )
    `)
  };

  function withinTransaction(work) {
    db.exec("BEGIN");
    try {
      work();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  function getSettings() {
    return statements.getSettings.get();
  }

  function updateSettings(input) {
    const payload = {
      bankroll_starting: input.bankroll_starting ?? null,
      bankroll_current: input.bankroll_current ?? null,
      unit_percent: input.unit_percent ?? null,
      max_single_bet_percent: input.max_single_bet_percent ?? null,
      max_daily_exposure_percent: input.max_daily_exposure_percent ?? null,
      stop_loss_percent: input.stop_loss_percent ?? null,
      profit_target_percent: input.profit_target_percent ?? null,
      losing_streak_protection: input.losing_streak_protection ?? null,
      min_confidence_required: input.min_confidence_required ?? null,
      min_ev_required: input.min_ev_required ?? null,
      max_risk_level: input.max_risk_level ?? null,
      max_bets_per_day: input.max_bets_per_day ?? null,
      max_units_per_bet: input.max_units_per_bet ?? null,
      max_units_per_day: input.max_units_per_day ?? null,
      use_kelly: input.use_kelly ?? null,
      fractional_kelly: input.fractional_kelly ?? null,
      api_provider: input.api_provider ?? null,
      odds_format: input.odds_format ?? null,
      timezone: input.timezone ?? null,
      compact_mode: input.compact_mode ?? null,
      theme_mode: input.theme_mode ?? null,
      team_form_weight: input.team_form_weight ?? null,
      player_form_weight: input.player_form_weight ?? null,
      injury_weight: input.injury_weight ?? null,
      home_away_weight: input.home_away_weight ?? null,
      rest_days_weight: input.rest_days_weight ?? null,
      head_to_head_weight: input.head_to_head_weight ?? null,
      odds_movement_weight: input.odds_movement_weight ?? null,
      pace_weight: input.pace_weight ?? null,
      defense_matchup_weight: input.defense_matchup_weight ?? null,
      live_refresh_seconds: input.live_refresh_seconds ?? null,
      odds_refresh_minutes: input.odds_refresh_minutes ?? null,
      scheduled_refresh_hours: input.scheduled_refresh_hours ?? null,
      injuries_refresh_minutes: input.injuries_refresh_minutes ?? null,
      updated_at: nowIso()
    };
    statements.updateSettings.run(payload);
    return getSettings();
  }

  function upsertTeams(teams) {
    withinTransaction(() => {
      for (const team of teams) statements.upsertTeam.run(team);
    });
  }

  function upsertGames(games) {
    withinTransaction(() => {
      for (const game of games) statements.upsertGame.run(game);
    });
  }

  function upsertPlayers(players) {
    withinTransaction(() => {
      for (const player of players) statements.upsertPlayer.run(player);
    });
  }

  function upsertInjuries(injuries) {
    withinTransaction(() => {
      for (const injury of injuries) statements.upsertInjury.run(injury);
    });
  }

  function saveOdds(rows) {
    withinTransaction(() => {
      for (const row of rows) statements.insertOdds.run(row);
    });
  }

  function replacePredictions(gameExternalId, predictions) {
    withinTransaction(() => {
      statements.clearPredictionsForGame.run(gameExternalId);
      for (const prediction of predictions) {
        statements.insertPrediction.run(prediction);
      }
    });
  }

  function upsertPlayerStats(stats) {
    withinTransaction(() => {
      for (const stat of stats) statements.upsertPlayerStat.run(stat);
    });
  }

  function getGamesBetween(fromDate, toDate) {
    return db
      .prepare(
        `
          SELECT g.*, 
            ht.full_name AS home_team_name, ht.abbreviation AS home_team_abbr, ht.wins AS home_wins, ht.losses AS home_losses,
            ht.offense_rating AS home_offense, ht.defense_rating AS home_defense, ht.pace AS home_pace, ht.net_rating AS home_net,
            at.full_name AS away_team_name, at.abbreviation AS away_team_abbr, at.wins AS away_wins, at.losses AS away_losses,
            at.offense_rating AS away_offense, at.defense_rating AS away_defense, at.pace AS away_pace, at.net_rating AS away_net
          FROM games g
          LEFT JOIN teams ht ON ht.external_id = g.home_team_external_id
          LEFT JOIN teams at ON at.external_id = g.away_team_external_id
          WHERE g.date BETWEEN ? AND ?
          ORDER BY g.date, g.commence_time
        `
      )
      .all(fromDate, toDate);
  }

  function getGameByExternalId(gameExternalId) {
    return db.prepare("SELECT * FROM games WHERE external_id = ?").get(gameExternalId);
  }

  function getLatestOddsForGame(gameExternalId) {
    return db
      .prepare(
        `
          SELECT *
          FROM odds_history
          WHERE game_external_id = ?
          ORDER BY captured_at DESC
        `
      )
      .all(gameExternalId);
  }

  function getOpeningOddsForGame(gameExternalId) {
    return db
      .prepare(
        `
          SELECT *
          FROM odds_history
          WHERE game_external_id = ?
          ORDER BY captured_at ASC
        `
      )
      .all(gameExternalId);
  }

  function getPredictionsForGame(gameExternalId) {
    return db
      .prepare(
        `
          SELECT *
          FROM predictions
          WHERE game_external_id = ?
          ORDER BY confidence_score DESC
        `
      )
      .all(gameExternalId);
  }

  function getPredictionsBetween(fromDate, toDate) {
    return db
      .prepare(
        `
          SELECT p.*, g.date, g.status
          FROM predictions p
          JOIN games g ON g.external_id = p.game_external_id
          WHERE g.date BETWEEN ? AND ?
          ORDER BY g.date, p.confidence_score DESC
        `
      )
      .all(fromDate, toDate);
  }

  function getInjuriesByTeam(teamExternalId) {
    return db
      .prepare(
        `
          SELECT i.*, p.full_name
          FROM injuries i
          LEFT JOIN players p ON p.external_id = i.player_external_id
          WHERE i.team_external_id = ?
          ORDER BY i.updated_at DESC
        `
      )
      .all(teamExternalId);
  }

  function getRecentTeamGames(teamExternalId, limit = 10) {
    return db
      .prepare(
        `
          SELECT *
          FROM games
          WHERE home_team_external_id = ? OR away_team_external_id = ?
          ORDER BY date DESC, commence_time DESC
          LIMIT ?
        `
      )
      .all(teamExternalId, teamExternalId, limit);
  }

  function getHeadToHead(teamAExternalId, teamBExternalId, limit = 10) {
    return db
      .prepare(
        `
          SELECT *
          FROM games
          WHERE
            (home_team_external_id = ? AND away_team_external_id = ?)
            OR
            (home_team_external_id = ? AND away_team_external_id = ?)
          ORDER BY date DESC, commence_time DESC
          LIMIT ?
        `
      )
      .all(teamAExternalId, teamBExternalId, teamBExternalId, teamAExternalId, limit);
  }

  function getPlayerRecentStats(playerExternalId, limit = 10) {
    return db
      .prepare(
        `
          SELECT *
          FROM player_game_stats
          WHERE player_external_id = ?
          ORDER BY created_at DESC
          LIMIT ?
        `
      )
      .all(playerExternalId, limit);
  }

  function listTrackedBets() {
    return db
      .prepare(
        `
          SELECT *
          FROM bets
          ORDER BY created_at DESC
        `
      )
      .all();
  }

  function createBet(bet) {
    const createdAt = nowIso();
    db.prepare(
      `
        INSERT INTO bets (
          external_ref, game_external_id, market_type, pick, odds, model_probability,
          implied_probability, edge_pct, stake_units, result, pnl_units, note, created_at, settled_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      bet.external_ref || null,
      bet.game_external_id ?? null,
      bet.market_type,
      bet.pick,
      bet.odds,
      bet.model_probability ?? null,
      bet.implied_probability ?? null,
      bet.edge_pct ?? null,
      bet.stake_units,
      bet.result || "open",
      bet.pnl_units ?? 0,
      bet.note || null,
      createdAt,
      bet.result && bet.result !== "open" ? createdAt : null
    );
  }

  function updateBetResult(betId, result, pnlUnits, note = null) {
    db.prepare(
      `
        UPDATE bets
        SET result = ?, pnl_units = ?, note = COALESCE(?, note), settled_at = ?
        WHERE id = ?
      `
    ).run(result, pnlUnits, note, nowIso(), betId);
  }

  function getBacktestRuns(limit = 20) {
    return db
      .prepare(
        `
          SELECT *
          FROM backtest_results
          ORDER BY created_at DESC
          LIMIT ?
        `
      )
      .all(limit);
  }

  function saveBacktestRun(run) {
    statements.insertBacktestRun.run(run);
  }

  function saveBankrollSnapshot(snapshot) {
    statements.insertBankrollHistory.run(snapshot);
  }

  function getBankrollHistory(limit = 200) {
    return db
      .prepare(
        `
          SELECT *
          FROM bankroll_history
          ORDER BY captured_at DESC
          LIMIT ?
        `
      )
      .all(limit);
  }

  return {
    getSettings,
    updateSettings,
    upsertTeams,
    upsertGames,
    upsertPlayers,
    upsertInjuries,
    saveOdds,
    replacePredictions,
    upsertPlayerStats,
    getGamesBetween,
    getGameByExternalId,
    getLatestOddsForGame,
    getOpeningOddsForGame,
    getPredictionsForGame,
    getPredictionsBetween,
    getInjuriesByTeam,
    getRecentTeamGames,
    getHeadToHead,
    getPlayerRecentStats,
    listTrackedBets,
    createBet,
    updateBetResult,
    getBacktestRuns,
    saveBacktestRun,
    saveBankrollSnapshot,
    getBankrollHistory
  };
}
