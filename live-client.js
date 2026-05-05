const LIVE_CLIENT = {
  timers: [],
  enabled: false,
  lastDashboard: null
};

function clearLiveTimers() {
  while (LIVE_CLIENT.timers.length) clearInterval(LIVE_CLIENT.timers.pop());
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

function numberOr(value, fallback = null) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function shortTime(iso) {
  if (!iso) return "TBD";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch (error) {
    return "TBD";
  }
}

function sportLabelFromKey(sportKey = "") {
  const key = String(sportKey || "");
  if (key === "basketball_nba") return "NBA";
  if (key === "basketball_wnba") return "WNBA";
  if (key === "baseball_mlb") return "MLB";
  if (key === "icehockey_nhl") return "NHL";
  if (key === "americanfootball_nfl") return "NFL";
  if (key === "basketball_ncaab") return "NCAABB";
  if (key === "basketball_euroleague") return "EuroLeague";
  if (key.startsWith("soccer_")) return "Soccer";
  if (key.startsWith("tennis_")) return "Tennis";
  if (key.startsWith("golf_")) return "Golf";
  if (key === "boxing_boxing") return "Boxing";
  return "Other";
}

function fallbackLogo(abbr, sport, teamName = "") {
  if (sport === "NBA") {
    return `https://a.espncdn.com/i/teamlogos/nba/500/${String(abbr || "").toLowerCase()}.png`;
  }
  const label = encodeURIComponent(teamName || abbr || "Team");
  return `https://ui-avatars.com/api/?name=${label}&background=1f2937&color=e5e7eb&bold=true&size=128`;
}

function predictionOdds(game, prediction) {
  if (!prediction || !game?.odds?.current) return null;
  const pick = String(prediction.pick || "").toLowerCase();
  if (prediction.market_type === "Moneyline") {
    if (pick.includes(String(game.home_team_abbr || "").toLowerCase())) {
      return numberOr(game.odds.current.moneyline?.home);
    }
    return numberOr(game.odds.current.moneyline?.away);
  }
  if (prediction.market_type === "Spread") {
    if (pick.includes(String(game.home_team_abbr || "").toLowerCase())) {
      return numberOr(game.odds.current.spreadOdds?.home ?? game.odds.current.moneyline?.home);
    }
    if (pick.includes(String(game.away_team_abbr || "").toLowerCase())) {
      return numberOr(game.odds.current.spreadOdds?.away ?? game.odds.current.moneyline?.away);
    }
    return numberOr(game.odds.current.spreadOdds?.home ?? game.odds.current.moneyline?.home);
  }
  if (prediction.market_type === "Total") {
    return pick.includes("under")
      ? numberOr(game.odds.current.totalOdds?.under)
      : numberOr(game.odds.current.totalOdds?.over);
  }
  return null;
}

function mapLiveDashboard(payload) {
  const today = payload.todayGames || [];
  const future = (payload.futureGames || []).filter((game) => !today.some((t) => t.external_id === game.external_id));
  const allLiveGames = [...today, ...future];
  if (!allLiveGames.length) {
    DATA.asOf = new Date(payload.asOf).toLocaleString();
    return;
  }
  const backendSports = new Set(
    allLiveGames.map((game) => String(game.sport || sportLabelFromKey(game.sport_key || "") || "NBA"))
  );
  const legacyGames = DATA.games.filter((game) => !backendSports.has(game.sport));
  const legacyPredictions = DATA.predictions.filter((prediction) => {
    const game = DATA.games.find((item) => item.id === prediction.gameId);
    return game && !backendSports.has(game.sport);
  });

  const existingLogos = Object.fromEntries(
    Object.values(DATA.teams).map((team) => [team.abbr, team.logo])
  );
  const nextTeams = { ...DATA.teams };
  const nextGames = [];
  const nextPredictions = [];
  const gameIdByExternalId = new Map();

  for (const game of allLiveGames) {
    const sport = String(game.sport || sportLabelFromKey(game.sport_key || "") || "NBA");
    const league = String(game.league || sport);
    const homeAbbr = game.home_team_abbr || "HOME";
    const awayAbbr = game.away_team_abbr || "AWAY";

    nextTeams[homeAbbr] = {
      ...(nextTeams[homeAbbr] || {}),
      name: game.home_team_name || homeAbbr,
      abbr: homeAbbr,
      logo: existingLogos[homeAbbr] || fallbackLogo(homeAbbr, sport, game.home_team_name),
      record: `${game.home_wins ?? 0}-${game.home_losses ?? 0}`,
      last10: "API sync",
      homeAway: `Home rest ${game.home_rest_days ?? "-"}`,
      offense: numberOr(game.home_offense, 112),
      defense: numberOr(game.home_defense, 112),
      net: numberOr(game.home_net, 0),
      pace: numberOr(game.home_pace, 99),
      turnovers: numberOr(nextTeams[homeAbbr]?.turnovers, 13.5),
      form: Array.isArray(nextTeams[homeAbbr]?.form) ? nextTeams[homeAbbr].form : Array(10).fill(0),
      profile: `${game.home_team_name || homeAbbr} live profile from backend sync.`
    };

    nextTeams[awayAbbr] = {
      ...(nextTeams[awayAbbr] || {}),
      name: game.away_team_name || awayAbbr,
      abbr: awayAbbr,
      logo: existingLogos[awayAbbr] || fallbackLogo(awayAbbr, sport, game.away_team_name),
      record: `${game.away_wins ?? 0}-${game.away_losses ?? 0}`,
      last10: "API sync",
      homeAway: `Away rest ${game.away_rest_days ?? "-"}`,
      offense: numberOr(game.away_offense, 112),
      defense: numberOr(game.away_defense, 112),
      net: numberOr(game.away_net, 0),
      pace: numberOr(game.away_pace, 99),
      turnovers: numberOr(nextTeams[awayAbbr]?.turnovers, 13.5),
      form: Array.isArray(nextTeams[awayAbbr]?.form) ? nextTeams[awayAbbr].form : Array(10).fill(0),
      profile: `${game.away_team_name || awayAbbr} live profile from backend sync.`
    };

    const mappedGameId = `${String(game.sport_key || sport.toLowerCase()).replace(/[^a-z0-9_]/gi, "")}-${game.external_id}`;
    gameIdByExternalId.set(game.external_id, mappedGameId);
    const topPrediction = game.topPrediction || null;

    const mappedGame = {
      id: mappedGameId,
      sport,
      league: game.postseason && sport === "NBA" ? "NBA Playoffs" : league,
      date: game.date,
      status: game.status || "scheduled",
      home_score: numberOr(game.home_score, 0),
      away_score: numberOr(game.away_score, 0),
      time: shortTime(game.commence_time),
      venue: game.venue || `${league} venue`,
      away: awayAbbr,
      home: homeAbbr,
      currentOdds: game.odds?.current?.moneyline
        ? {
          awayMl: numberOr(game.odds.current.moneyline.away),
          homeMl: numberOr(game.odds.current.moneyline.home),
          drawMl: numberOr(game.odds.current.moneyline.draw),
            awaySpread: {
              line: numberOr(game.odds.current.spread != null ? Math.abs(Number(game.odds.current.spread)) : null, null),
              odds: numberOr(game.odds.current.spreadOdds?.away ?? -110, -110)
            },
            homeSpread: {
              line: numberOr(game.odds.current.spread, null),
              odds: numberOr(game.odds.current.spreadOdds?.home ?? -110, -110)
            },
            total: {
              line: numberOr(game.odds.current.total, null),
              overOdds: numberOr(game.odds.current.totalOdds?.over ?? -110, -110),
              underOdds: numberOr(game.odds.current.totalOdds?.under ?? -110, -110)
            }
          }
        : null,
      openingOdds: game.odds?.opening?.moneyline
        ? {
          awayMl: numberOr(game.odds.opening.moneyline.away),
          homeMl: numberOr(game.odds.opening.moneyline.home),
          drawMl: numberOr(game.odds.opening.moneyline.draw),
            awaySpread: {
              line: numberOr(game.odds.opening.spread != null ? Math.abs(Number(game.odds.opening.spread)) : null, null),
              odds: -110
            },
            homeSpread: {
              line: numberOr(game.odds.opening.spread, null),
              odds: -110
            },
            total: {
              line: numberOr(game.odds.opening.total, null),
              overOdds: -110,
              underOdds: -110
            }
          }
        : null,
      marketStatus: game.odds?.current?.moneyline ? undefined : "Market pending",
      model: {
        awayWin: numberOr(game.model?.awayWin, 50),
        homeWin: numberOr(game.model?.homeWin, 50),
        winner:
          numberOr(game.model?.homeWin, 50) >= numberOr(game.model?.awayWin, 50) ? homeAbbr : awayAbbr,
        score:
          String(game.status).toLowerCase() === "final"
            ? `${homeAbbr} ${game.home_score}, ${awayAbbr} ${game.away_score}`
            : sport === "Soccer"
              ? `${homeAbbr} ${Math.round((game.home_score || 0) + 1.4)}, ${awayAbbr} ${Math.round((game.away_score || 0) + 1.2)}`
              : sport === "MLB"
                ? `${homeAbbr} ${Math.round((game.home_score || 0) + 4.7)}, ${awayAbbr} ${Math.round((game.away_score || 0) + 4.3)}`
                : sport === "NHL"
                  ? `${homeAbbr} ${Math.round((game.home_score || 0) + 2.9)}, ${awayAbbr} ${Math.round((game.away_score || 0) + 2.6)}`
                  : sport === "Tennis"
                    ? `${homeAbbr} ${Math.round((game.home_score || 0) + 20)}, ${awayAbbr} ${Math.round((game.away_score || 0) + 18)}`
                    : `${homeAbbr} ${Math.round((game.home_score || 0) + 105)}, ${awayAbbr} ${Math.round((game.away_score || 0) + 102)}`,
        range:
          sport === "Soccer"
            ? `${homeAbbr} +/- 1 goal`
            : sport === "MLB" || sport === "NHL"
              ? `${homeAbbr} +/- 2 goals/runs`
              : sport === "Tennis"
                ? `${homeAbbr} +/- 4 games`
                : `${homeAbbr} +/- 8 points`,
        spreadLean:
          game.predictions?.find((prediction) => prediction.market_type === "Spread")?.pick || "No spread edge",
        totalLean:
          game.predictions?.find((prediction) => prediction.market_type === "Total")?.pick || "No total edge",
        confidence: numberOr(topPrediction?.confidence_score, 4.5)
      },
      situational: [
        `Status: ${String(game.status).toUpperCase()}.`,
        `Rest edge: ${homeAbbr} ${game.rest?.home ?? "-"}d vs ${awayAbbr} ${game.rest?.away ?? "-"}d.`,
        `Injuries: ${homeAbbr} ${game.injuries?.home?.length ?? 0}, ${awayAbbr} ${game.injuries?.away?.length ?? 0}.`
      ],
      matchup: [
        `H2H sample: ${game.h2h?.sample ?? 0}`,
        `${homeAbbr} H2H wins: ${game.h2h?.homeWins ?? 0}`,
        game.backToBack?.home || game.backToBack?.away ? "Back-to-back spot detected" : "No back-to-back flag"
      ],
      bestBetId: null
    };

    if (Array.isArray(game.predictions)) {
      for (const prediction of game.predictions) {
        const mappedPredictionId = `${mappedGameId}-${prediction.market_type.toLowerCase()}`;
        const odds = predictionOdds(game, prediction);
        const mappedPrediction = {
          id: mappedPredictionId,
          gameId: mappedGameId,
          type: prediction.market_type,
          pick: prediction.pick,
          odds: numberOr(odds, -110),
          modelProbability: numberOr(prediction.model_probability, 50),
          confidence: numberOr(prediction.confidence_score, 4.5),
          risk: prediction.risk_level || "Medium",
          units: numberOr(prediction.suggested_units, 0),
          recommendation: prediction.recommendation || "NO BET",
          reason: prediction.reason || "No reasoning available."
        };
        nextPredictions.push(mappedPrediction);
        if (!mappedGame.bestBetId && mappedPrediction.recommendation === "Bet") {
          mappedGame.bestBetId = mappedPredictionId;
        }
      }
    }

    nextGames.push(mappedGame);
  }

  DATA.teams = nextTeams;
  DATA.games = [...nextGames, ...legacyGames];
  DATA.predictions = [...nextPredictions, ...legacyPredictions];

  const pastMetrics = payload.past?.metrics || {};
  DATA.history = [
    {
      title: "Past Games Performance",
      items: [
        `Record: ${pastMetrics.wins ?? 0}-${pastMetrics.losses ?? 0}-${pastMetrics.pushes ?? 0}`,
        `Model accuracy: ${(pastMetrics.accuracy ?? 0).toFixed(1)}%`,
        `Units won/lost: ${(pastMetrics.units ?? 0) >= 0 ? "+" : ""}${(pastMetrics.units ?? 0).toFixed(2)}u`,
        `ROI: ${(pastMetrics.roi ?? 0).toFixed(1)}%`
      ]
    },
    {
      title: "Future Games Watchlist",
      items: (payload.futureGames || [])
        .slice(0, 6)
        .map(
          (game) =>
            `${game.away_team_abbr || game.away_team_name} at ${game.home_team_abbr || game.home_team_name}: rest ${game.rest?.away ?? "-"}d/${game.rest?.home ?? "-"}d, injuries ${game.injuries?.away?.length ?? 0}/${game.injuries?.home?.length ?? 0}`
        )
    },
    {
      title: "Live Platform Warnings",
      items: payload.safety || [
        "Predictions are not guaranteed.",
        "Bet responsibly.",
        "No bet is recommended unless positive expected value is detected."
      ]
    }
  ];

  if (payload.settings?.bankroll) {
    state.bankroll.current = Number(payload.settings.bankroll);
    document.getElementById("currentBankroll").value = String(state.bankroll.current);
  }
  DATA.asOf = new Date(payload.asOf).toLocaleString();
}

function updateSettingsPanel(statusPayload, dashboardPayload) {
  const settings = statusPayload?.settings || {};
  const setValue = (id, value, fallback) => {
    const element = document.getElementById(id);
    if (!element) return;
    if (element.type === "checkbox") {
      element.checked = Boolean(value ?? fallback);
    } else {
      element.value = value ?? fallback;
    }
  };

  setValue("apiProvider", settings.api_provider, "balldontlie+odds");
  setValue("apiBankrollStarting", settings.bankroll_starting, 1000);
  setValue("apiBankrollCurrent", settings.bankroll_current, 1000);
  setValue("apiUnitPercent", settings.unit_percent, 1);
  setValue("apiMaxSinglePct", settings.max_single_bet_percent, 5);
  setValue("apiMaxDailyExposurePct", settings.max_daily_exposure_percent, 12);
  setValue("apiStopLossPct", settings.stop_loss_percent, 8);
  setValue("apiProfitTargetPct", settings.profit_target_percent, 12);
  setValue("apiLosingStreakProtection", Number(settings.losing_streak_protection) === 1, true);
  setValue("apiMinConfidence", settings.min_confidence_required, 6);
  setValue("apiMinEvRequired", settings.min_ev_required, 3);
  setValue("apiRiskMode", "Balanced", "Balanced");
  setValue("apiMaxRiskLevel", settings.max_risk_level, "High");
  setValue("apiMaxBetsPerDay", settings.max_bets_per_day, 5);
  setValue("apiMaxUnitsPerBet", settings.max_units_per_bet, 3);
  setValue("apiMaxUnitsPerDay", settings.max_units_per_day, 8);
  setValue("apiUseKelly", Number(settings.use_kelly) === 1, true);
  setValue("apiFractionalKelly", settings.fractional_kelly, 0.5);
  setValue("apiWeightTeamForm", settings.team_form_weight, 1);
  setValue("apiWeightPlayerForm", settings.player_form_weight, 1);
  setValue("apiWeightInjury", settings.injury_weight, 1.15);
  setValue("apiWeightHomeAway", settings.home_away_weight, 0.95);
  setValue("apiWeightRest", settings.rest_days_weight, 0.8);
  setValue("apiWeightH2h", settings.head_to_head_weight, 0.5);
  setValue("apiWeightOddsMove", settings.odds_movement_weight, 0.7);
  setValue("apiWeightPace", settings.pace_weight, 0.8);
  setValue("apiWeightDefenseMatchup", settings.defense_matchup_weight, 0.9);
  setValue("apiThemeMode", settings.theme_mode, "dark");
  setValue("apiCompactMode", Number(settings.compact_mode) === 1, false);
  setValue("apiOddsFormat", settings.odds_format, "american");
  setValue("apiTimezone", settings.timezone, "America/Chicago");
  setValue("apiLiveSeconds", settings.live_refresh_seconds, 30);
  setValue("apiOddsMinutes", settings.odds_refresh_minutes, 10);
  setValue("apiScheduleHours", settings.scheduled_refresh_hours, 6);
  setValue("apiInjuryMinutes", settings.injuries_refresh_minutes, 20);

  const card = document.getElementById("apiStatusCards");
  if (!card) return;
  card.innerHTML = [
    ["BALLDONTLIE key", statusPayload?.keys?.balldontlie || "missing"],
    ["Odds key", statusPayload?.keys?.odds || "missing"],
    ["Provider", settings.api_provider || "default"],
    ["Req. limit", `${statusPayload?.request_limits?.estimated_remaining ?? "?"}/${statusPayload?.request_limits?.daily_cap ?? "?"}`],
    ["Last full sync", statusPayload?.sync?.last_run_at || "N/A"],
    ["Last live sync", statusPayload?.sync?.last_live_sync_at || "N/A"],
    ["Live refresh", `${settings.live_refresh_seconds ?? 30}s`],
    ["Odds refresh", `${settings.odds_refresh_minutes ?? 10}m`],
    ["Last error", statusPayload?.sync?.last_error || "None"],
    [
      "Safety",
      dashboardPayload?.safety?.includes("Predictions are not guaranteed.") ? "Enabled" : "Enabled"
    ]
  ]
    .map(
      ([label, value]) => `
      <div class="bankroll-stat">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `
    )
    .join("");

  if (typeof state !== "undefined") {
    state.ui.theme = settings.theme_mode || state.ui.theme;
    state.ui.compactMode = Number(settings.compact_mode) === 1;
    state.ui.oddsFormat = settings.odds_format || state.ui.oddsFormat;
    state.backtest.minConfidence = Number(settings.min_confidence_required || state.backtest.minConfidence);
    state.backtest.minEdge = Number(settings.min_ev_required || state.backtest.minEdge);
    state.backtest.maxUnit = Number(settings.max_units_per_bet || state.backtest.maxUnit);
    state.backtest.maxBetsDay = Number(settings.max_bets_per_day || state.backtest.maxBetsDay);
    state.backtest.maxDailyExposure = Number(settings.max_units_per_day || state.backtest.maxDailyExposure);
  }
}

function installSettingsEvents() {
  const form = document.getElementById("apiSettingsForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.getElementById("apiSettingsStatus");
    status.textContent = "Saving...";
    try {
      const riskMode = document.getElementById("apiRiskMode")?.value || "Balanced";
      const riskByMode = riskMode === "Conservative" ? "Low" : riskMode === "Aggressive" ? "High" : "Medium";
      await fetchJson("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_provider: document.getElementById("apiProvider")?.value || "balldontlie+odds",
          bankroll_starting: numberOr(document.getElementById("apiBankrollStarting").value, 1000),
          bankroll_current: numberOr(document.getElementById("apiBankrollCurrent").value, 1000),
          unit_percent: numberOr(document.getElementById("apiUnitPercent").value, 1),
          max_single_bet_percent: numberOr(document.getElementById("apiMaxSinglePct").value, 5),
          max_daily_exposure_percent: numberOr(document.getElementById("apiMaxDailyExposurePct").value, 12),
          stop_loss_percent: numberOr(document.getElementById("apiStopLossPct").value, 8),
          profit_target_percent: numberOr(document.getElementById("apiProfitTargetPct").value, 12),
          losing_streak_protection: document.getElementById("apiLosingStreakProtection").checked,
          min_confidence_required: numberOr(document.getElementById("apiMinConfidence").value, 6),
          min_ev_required: numberOr(document.getElementById("apiMinEvRequired").value, 3),
          max_risk_level: document.getElementById("apiMaxRiskLevel").value || riskByMode,
          max_bets_per_day: numberOr(document.getElementById("apiMaxBetsPerDay").value, 5),
          max_units_per_bet: numberOr(document.getElementById("apiMaxUnitsPerBet").value, 3),
          max_units_per_day: numberOr(document.getElementById("apiMaxUnitsPerDay").value, 8),
          use_kelly: document.getElementById("apiUseKelly").checked,
          fractional_kelly: numberOr(document.getElementById("apiFractionalKelly").value, 0.5),
          team_form_weight: numberOr(document.getElementById("apiWeightTeamForm").value, 1),
          player_form_weight: numberOr(document.getElementById("apiWeightPlayerForm").value, 1),
          injury_weight: numberOr(document.getElementById("apiWeightInjury").value, 1.15),
          home_away_weight: numberOr(document.getElementById("apiWeightHomeAway").value, 0.95),
          rest_days_weight: numberOr(document.getElementById("apiWeightRest").value, 0.8),
          head_to_head_weight: numberOr(document.getElementById("apiWeightH2h").value, 0.5),
          odds_movement_weight: numberOr(document.getElementById("apiWeightOddsMove").value, 0.7),
          pace_weight: numberOr(document.getElementById("apiWeightPace").value, 0.8),
          defense_matchup_weight: numberOr(document.getElementById("apiWeightDefenseMatchup").value, 0.9),
          theme_mode: document.getElementById("apiThemeMode").value,
          compact_mode: document.getElementById("apiCompactMode").checked,
          odds_format: document.getElementById("apiOddsFormat").value,
          timezone: document.getElementById("apiTimezone").value,
          live_refresh_seconds: numberOr(document.getElementById("apiLiveSeconds").value, 30),
          odds_refresh_minutes: numberOr(document.getElementById("apiOddsMinutes").value, 10),
          scheduled_refresh_hours: numberOr(document.getElementById("apiScheduleHours").value, 6),
          injuries_refresh_minutes: numberOr(document.getElementById("apiInjuryMinutes").value, 20)
        })
      });
      status.textContent = "Settings saved";
      await refreshLiveDashboard();
      resetLivePollers();
    } catch (error) {
      status.textContent = "Save failed";
    }
  });

  document.getElementById("manualSync")?.addEventListener("click", async () => {
    const status = document.getElementById("apiSettingsStatus");
    status.textContent = "Syncing...";
    try {
      await fetchJson("/api/sync/run", { method: "POST" });
      await refreshLiveDashboard();
      status.textContent = "Sync complete";
    } catch (error) {
      status.textContent = "Sync failed";
    }
  });

  document.getElementById("apiTestConnection")?.addEventListener("click", async () => {
    const status = document.getElementById("apiSettingsStatus");
    status.textContent = "Testing API...";
    try {
      const result = await fetchJson("/api/settings/test", { method: "POST" });
      status.textContent = result.ok ? "API connection healthy" : "API keys missing";
    } catch (error) {
      status.textContent = "API test failed";
    }
  });

  document.getElementById("clearDashboardCache")?.addEventListener("click", () => {
    try {
      localStorage.removeItem("professionalSportsBettingDashboard.v1");
      document.getElementById("apiSettingsStatus").textContent = "Local dashboard cache cleared";
    } catch (error) {
      document.getElementById("apiSettingsStatus").textContent = "Cache clear failed";
    }
  });
}

async function refreshLiveDashboard() {
  try {
    if (typeof state !== "undefined") {
      state.ui.loading = true;
      state.ui.error = null;
      render();
    }
    const [dashboardPayload, statusPayload] = await Promise.all([
      fetchJson(`/api/dashboard/live?date=${encodeURIComponent(state.filters.date || "2026-05-05")}`),
      fetchJson("/api/status")
    ]);
    LIVE_CLIENT.enabled = true;
    LIVE_CLIENT.lastDashboard = dashboardPayload;
    mapLiveDashboard(dashboardPayload);
    updateSettingsPanel(statusPayload, dashboardPayload);
    if (typeof state !== "undefined") {
      state.ui.loading = false;
      state.ui.error = null;
    }
    render();
  } catch (error) {
    LIVE_CLIENT.enabled = false;
    if (typeof state !== "undefined") {
      state.ui.loading = false;
      state.ui.error = "Live API sync failed. Showing cached data.";
      render();
    }
  }
}

function resetLivePollers() {
  clearLiveTimers();
  const fallback = {
    liveSeconds: 30,
    oddsMinutes: 10,
    scheduledHours: 6
  };
  const refresh = LIVE_CLIENT.lastDashboard?.settings?.refresh || fallback;
  LIVE_CLIENT.timers.push(setInterval(refreshLiveDashboard, Math.max(15, refresh.liveSeconds) * 1000));
  LIVE_CLIENT.timers.push(setInterval(refreshLiveDashboard, Math.max(5, refresh.oddsMinutes) * 60 * 1000));
  LIVE_CLIENT.timers.push(
    setInterval(refreshLiveDashboard, Math.max(4, refresh.scheduledHours) * 60 * 60 * 1000)
  );
}

async function bootLiveClient() {
  installSettingsEvents();
  window.addEventListener("dashboard:manual-refresh", refreshLiveDashboard);
  await refreshLiveDashboard();
  if (LIVE_CLIENT.enabled) {
    resetLivePollers();
  }
}

window.addEventListener("load", bootLiveClient);
