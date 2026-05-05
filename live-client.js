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

function fallbackLogo(abbr) {
  return `https://a.espncdn.com/i/teamlogos/nba/500/${String(abbr || "").toLowerCase()}.png`;
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
  const allNbaGames = [...today, ...future];
  if (!allNbaGames.length) {
    DATA.asOf = new Date(payload.asOf).toLocaleString();
    return;
  }
  const legacyNonNbaGames = DATA.games.filter((game) => game.sport !== "NBA");
  const legacyNonNbaPredictions = DATA.predictions.filter((prediction) => {
    const game = DATA.games.find((item) => item.id === prediction.gameId);
    return game && game.sport !== "NBA";
  });

  const existingLogos = Object.fromEntries(
    Object.values(DATA.teams).map((team) => [team.abbr, team.logo])
  );
  const nextTeams = { ...DATA.teams };
  const nextGames = [];
  const nextPredictions = [];
  const gameIdByExternalId = new Map();

  for (const game of allNbaGames) {
    const homeAbbr = game.home_team_abbr || "HOME";
    const awayAbbr = game.away_team_abbr || "AWAY";

    nextTeams[homeAbbr] = {
      ...(nextTeams[homeAbbr] || {}),
      name: game.home_team_name || homeAbbr,
      abbr: homeAbbr,
      logo: existingLogos[homeAbbr] || fallbackLogo(homeAbbr),
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
      logo: existingLogos[awayAbbr] || fallbackLogo(awayAbbr),
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

    const mappedGameId = `nba-${game.external_id}`;
    gameIdByExternalId.set(game.external_id, mappedGameId);
    const topPrediction = game.topPrediction || null;

    const mappedGame = {
      id: mappedGameId,
      sport: "NBA",
      league: game.postseason ? "NBA Playoffs" : "NBA",
      date: game.date,
      time: shortTime(game.commence_time),
      venue: game.venue || "NBA venue",
      away: awayAbbr,
      home: homeAbbr,
      currentOdds: game.odds?.current?.moneyline
        ? {
            awayMl: numberOr(game.odds.current.moneyline.away),
            homeMl: numberOr(game.odds.current.moneyline.home),
            awaySpread: {
              line: Math.abs(numberOr(game.odds.current.spread, 0)),
              odds: numberOr(game.odds.current.spreadOdds?.away ?? -110, -110)
            },
            homeSpread: {
              line: numberOr(game.odds.current.spread, 0),
              odds: numberOr(game.odds.current.spreadOdds?.home ?? -110, -110)
            },
            total: {
              line: numberOr(game.odds.current.total, 0),
              overOdds: numberOr(game.odds.current.totalOdds?.over ?? -110, -110),
              underOdds: numberOr(game.odds.current.totalOdds?.under ?? -110, -110)
            }
          }
        : null,
      openingOdds: game.odds?.opening?.moneyline
        ? {
            awayMl: numberOr(game.odds.opening.moneyline.away),
            homeMl: numberOr(game.odds.opening.moneyline.home),
            awaySpread: {
              line: Math.abs(numberOr(game.odds.opening.spread, 0)),
              odds: -110
            },
            homeSpread: {
              line: numberOr(game.odds.opening.spread, 0),
              odds: -110
            },
            total: {
              line: numberOr(game.odds.opening.total, 0),
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
            : `${homeAbbr} ${Math.round((game.home_score || 0) + 105)}, ${awayAbbr} ${Math.round((game.away_score || 0) + 102)}`,
        range: `${homeAbbr} +/- 8 points`,
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
  DATA.games = [...nextGames, ...legacyNonNbaGames];
  DATA.predictions = [...nextPredictions, ...legacyNonNbaPredictions];

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
            `${game.away_team_abbr} at ${game.home_team_abbr}: rest ${game.rest?.away ?? "-"}d/${game.rest?.home ?? "-"}d, injuries ${game.injuries?.away?.length ?? 0}/${game.injuries?.home?.length ?? 0}`
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
    element.value = value ?? fallback;
  };

  setValue("apiBankrollStarting", settings.bankroll_starting, 1000);
  setValue("apiBankrollCurrent", settings.bankroll_current, 1000);
  setValue("apiUnitPercent", settings.unit_percent, 1);
  setValue("apiMaxSinglePct", settings.max_single_bet_percent, 5);
  setValue("apiLiveSeconds", settings.live_refresh_seconds, 30);
  setValue("apiOddsMinutes", settings.odds_refresh_minutes, 10);
  setValue("apiScheduleHours", settings.scheduled_refresh_hours, 6);
  setValue("apiInjuryMinutes", settings.injuries_refresh_minutes, 20);

  const card = document.getElementById("apiStatusCards");
  if (!card) return;
  card.innerHTML = [
    ["BALLDONTLIE key", statusPayload?.keys?.balldontlie || "missing"],
    ["Odds key", statusPayload?.keys?.odds || "missing"],
    ["Last full sync", statusPayload?.sync?.last_run_at || "N/A"],
    ["Last live sync", statusPayload?.sync?.last_live_sync_at || "N/A"],
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
}

function installSettingsEvents() {
  const form = document.getElementById("apiSettingsForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.getElementById("apiSettingsStatus");
    status.textContent = "Saving...";
    try {
      await fetchJson("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankroll_starting: numberOr(document.getElementById("apiBankrollStarting").value, 1000),
          bankroll_current: numberOr(document.getElementById("apiBankrollCurrent").value, 1000),
          unit_percent: numberOr(document.getElementById("apiUnitPercent").value, 1),
          max_single_bet_percent: numberOr(document.getElementById("apiMaxSinglePct").value, 5),
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
}

async function refreshLiveDashboard() {
  try {
    const [dashboardPayload, statusPayload] = await Promise.all([
      fetchJson(`/api/dashboard/live?date=${encodeURIComponent(state.filters.date || "2026-05-05")}`),
      fetchJson("/api/status")
    ]);
    LIVE_CLIENT.enabled = true;
    LIVE_CLIENT.lastDashboard = dashboardPayload;
    mapLiveDashboard(dashboardPayload);
    updateSettingsPanel(statusPayload, dashboardPayload);
    render();
  } catch (error) {
    LIVE_CLIENT.enabled = false;
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
  await refreshLiveDashboard();
  if (LIVE_CLIENT.enabled) {
    resetLivePollers();
  }
}

window.addEventListener("load", bootLiveClient);
