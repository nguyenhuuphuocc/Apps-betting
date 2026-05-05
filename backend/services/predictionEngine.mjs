import { clamp, expectedValuePercent, impliedProbabilityFromAmerican, round } from "../lib/math.mjs";

function logistic(value) {
  return 1 / (1 + Math.exp(-value));
}

function boundedProbability(probabilityPercent, min = 5, max = 95) {
  return clamp(Number(probabilityPercent) || 50, min, max);
}

function safeExpectedValue(probabilityPercent, odds) {
  const value = expectedValuePercent(probabilityPercent, odds);
  if (!Number.isFinite(value)) return null;
  return value;
}

function confidenceFromEdge(edgePct) {
  if (!Number.isFinite(edgePct)) return 4.5;
  if (edgePct <= 0) return 4.2;
  return clamp(4.5 + edgePct / 2.2, 4.5, 9.2);
}

function riskFromConfidence(confidence) {
  if (confidence >= 7.4) return "Low";
  if (confidence >= 5.8) return "Medium";
  return "High";
}

function suggestedUnitsFromConfidence(confidence, edgePct, settings, lossStreak = 0) {
  const maxUnits = (settings?.max_single_bet_percent ?? 5) / (settings?.unit_percent ?? 1);
  let units = 0;
  if (edgePct <= 0) return units;

  if (confidence < 5.8) units = 0.5;
  else if (confidence < 7.3) units = 1.0;
  else units = 2.0;

  if (edgePct >= 6.5 && confidence >= 7.8) units = 2.5;
  if (lossStreak >= 3) units *= 0.5;
  if (lossStreak >= 7) units = 0;
  return round(clamp(units, 0, Math.min(maxUnits, 3)), 2);
}

function kellyFraction(probabilityPercent, odds) {
  const p = boundedProbability(probabilityPercent) / 100;
  const price = Number(odds);
  if (!Number.isFinite(price) || price === 0) return 0;
  const decimal = price > 0 ? 1 + price / 100 : 1 + 100 / Math.abs(price);
  const b = decimal - 1;
  if (!Number.isFinite(b) || b <= 0) return 0;
  const q = 1 - p;
  const k = (b * p - q) / b;
  return clamp(k, 0, 0.05);
}

function marketOdds(latestOddsRows, marketType) {
  return latestOddsRows.find((row) => row.market_type === marketType) || null;
}

const SPORT_PROFILES = {
  basketball_nba: { homeBias: 1.85, spreadDivisor: 4.4, totalDivisor: 7.0, totalBaseline: 222, impliedWeight: 0.52 },
  basketball_wnba: { homeBias: 1.65, spreadDivisor: 4.7, totalDivisor: 6.8, totalBaseline: 164, impliedWeight: 0.56 },
  basketball_ncaab: { homeBias: 2.1, spreadDivisor: 4.9, totalDivisor: 7.4, totalBaseline: 148, impliedWeight: 0.56 },
  basketball_euroleague: { homeBias: 2.0, spreadDivisor: 4.7, totalDivisor: 7.2, totalBaseline: 161, impliedWeight: 0.56 },
  baseball_mlb: { homeBias: 0.6, spreadDivisor: 2.8, totalDivisor: 2.4, totalBaseline: 8.2, impliedWeight: 0.68 },
  icehockey_nhl: { homeBias: 0.45, spreadDivisor: 2.6, totalDivisor: 1.9, totalBaseline: 6.1, impliedWeight: 0.7 },
  americanfootball_nfl: { homeBias: 1.3, spreadDivisor: 5.0, totalDivisor: 6.2, totalBaseline: 45, impliedWeight: 0.62 },
  soccer_fifa_world_cup: { homeBias: 0.22, spreadDivisor: 1.3, totalDivisor: 0.9, totalBaseline: 2.45, impliedWeight: 0.74 },
  soccer_epl: { homeBias: 0.24, spreadDivisor: 1.35, totalDivisor: 0.95, totalBaseline: 2.75, impliedWeight: 0.74 },
  tennis_atp_italian_open: { homeBias: 0.0, spreadDivisor: 1.35, totalDivisor: 3.0, totalBaseline: 22.5, impliedWeight: 0.76 },
  tennis_wta_italian_open: { homeBias: 0.0, spreadDivisor: 1.3, totalDivisor: 2.9, totalBaseline: 21.5, impliedWeight: 0.76 },
  golf_pga_tour: { homeBias: 0.0, spreadDivisor: 1.0, totalDivisor: 1.0, totalBaseline: 0, impliedWeight: 0.8 },
  boxing_boxing: { homeBias: 0.0, spreadDivisor: 1.0, totalDivisor: 1.0, totalBaseline: 0, impliedWeight: 0.8 },
  default: { homeBias: 0.65, spreadDivisor: 3.4, totalDivisor: 4.2, totalBaseline: 10.5, impliedWeight: 0.68 }
};

function sportProfile(sportKey = "default") {
  return SPORT_PROFILES[sportKey] || SPORT_PROFILES.default;
}

function noVigHomeProbability(homeOdds, awayOdds) {
  const home = impliedProbabilityFromAmerican(homeOdds);
  const away = impliedProbabilityFromAmerican(awayOdds);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  const total = home + away;
  if (!Number.isFinite(total) || total <= 0) return null;
  return home / total;
}

function oddsLineMove(openingRow, latestRow) {
  if (!openingRow || !latestRow) return 0;
  const openHome = Number(openingRow.home_price);
  const closeHome = Number(latestRow.home_price);
  if (!Number.isFinite(openHome) || !Number.isFinite(closeHome) || openHome === 0 || closeHome === 0) return 0;
  const openImplied = impliedProbabilityFromAmerican(openHome);
  const closeImplied = impliedProbabilityFromAmerican(closeHome);
  if (!Number.isFinite(openImplied) || !Number.isFinite(closeImplied)) return 0;
  return clamp((closeImplied - openImplied) * 100, -5, 5);
}

function computeTeamStrength(team, restDays, injuryCount, recentMargins = []) {
  const net = Number(team?.net_rating ?? team?.net ?? 0);
  const offense = Number(team?.offense_rating ?? team?.offense ?? 112);
  const defense = Number(team?.defense_rating ?? team?.defense ?? 112);
  const pace = Number(team?.pace ?? 99);
  const recency = recentMargins.length
    ? recentMargins.reduce((sum, value) => sum + Number(value || 0), 0) / recentMargins.length
    : 0;
  const fatiguePenalty = restDays === 0 ? 1.3 : restDays === 1 ? 0.25 : -0.35;
  const injuryPenalty = injuryCount * 0.55;
  return net * 0.9 + (offense - defense) * 0.35 + recency * 0.18 - pace * 0.01 - fatiguePenalty - injuryPenalty;
}

function runMonteCarloGame({
  spreadProjection,
  totalProjection,
  iterations = 1200
}) {
  let homeWins = 0;
  let totalOvers = 0;
  const marginSamples = [];

  for (let i = 0; i < iterations; i += 1) {
    const pseudoA = Math.sin((i + 1) * 12.9898) * 43758.5453;
    const pseudoB = Math.sin((i + 1) * 78.233) * 12345.6789;
    const noiseA = (pseudoA - Math.floor(pseudoA)) * 2 - 1;
    const noiseB = (pseudoB - Math.floor(pseudoB)) * 2 - 1;
    const margin = spreadProjection + noiseA * 11.5;
    const total = totalProjection + noiseB * 18.5;
    marginSamples.push(margin);
    if (margin > 0) homeWins += 1;
    if (total > totalProjection) totalOvers += 1;
  }

  marginSamples.sort((a, b) => a - b);
  const q = (p) => marginSamples[Math.floor(clamp(p, 0, 1) * (marginSamples.length - 1))];
  return {
    homeWinProbability: boundedProbability((homeWins / iterations) * 100),
    totalOverBias: (totalOvers / iterations) * 100,
    marginRange: [round(q(0.1), 1), round(q(0.9), 1)]
  };
}

function calibrateProbability(rawProbability, calibration = null) {
  if (!calibration) return boundedProbability(rawProbability);
  const slope = Number(calibration.slope ?? 1);
  const intercept = Number(calibration.intercept ?? 0);
  const p = clamp(Number(rawProbability) / 100, 0.01, 0.99);
  const logit = Math.log(p / (1 - p));
  const adjusted = logistic(intercept + slope * logit) * 100;
  return boundedProbability(adjusted);
}

export function buildPredictionsForGame(context) {
  const {
    game,
    homeTeam,
    awayTeam,
    latestOddsRows,
    openingOddsRows,
    injuriesHome = [],
    injuriesAway = [],
    recentHomeMargins = [],
    recentAwayMargins = [],
    headToHead = [],
    settings = null,
    lossStreak = 0,
    calibration = null,
    sportKey = "basketball_nba"
  } = context;

  const profile = sportProfile(sportKey);

  const homeStrength = computeTeamStrength(
    homeTeam,
    Number(game.home_rest_days ?? 2),
    injuriesHome.length,
    recentHomeMargins
  );
  const awayStrength = computeTeamStrength(
    awayTeam,
    Number(game.away_rest_days ?? 2),
    injuriesAway.length,
    recentAwayMargins
  );
  const headToHeadEdge = headToHead.reduce((sum, g) => {
    if (g.home_score === g.away_score) return sum;
    const homeWon = g.home_score > g.away_score;
    if (homeWon && g.home_team_external_id === game.home_team_external_id) return sum + 0.2;
    if (!homeWon && g.away_team_external_id === game.home_team_external_id) return sum + 0.2;
    return sum - 0.2;
  }, 0);
  const homeCourt = profile.homeBias;
  const spreadProjection = round((homeStrength - awayStrength) + homeCourt + headToHeadEdge, 1);
  const baselineHomeProbability = logistic((spreadProjection - 1.5) / 5.8) * 100;
  const totalProjection = round(
    profile.totalBaseline +
      (Number(homeTeam?.pace ?? 99) + Number(awayTeam?.pace ?? 99) - 198) * 0.85 +
      (Number(homeTeam?.offense_rating ?? 112) - Number(awayTeam?.defense_rating ?? 112)) * 0.24 +
      (Number(awayTeam?.offense_rating ?? 112) - Number(homeTeam?.defense_rating ?? 112)) * 0.24,
    1
  );
  const mc = runMonteCarloGame({ spreadProjection, totalProjection });

  const moneylineOdds = marketOdds(latestOddsRows, "h2h");
  const openingMoneylineOdds = marketOdds(openingOddsRows, "h2h");
  const spreadOdds = marketOdds(latestOddsRows, "spreads");
  const totalOdds = marketOdds(latestOddsRows, "totals");

  const rows = [];

  const noVigHome = noVigHomeProbability(moneylineOdds?.home_price, moneylineOdds?.away_price);
  const marketPrior = noVigHome == null ? null : noVigHome * 100;
  const moveAdj = oddsLineMove(openingMoneylineOdds, moneylineOdds);
  const blendedHomeProbabilityRaw =
    marketPrior == null
      ? baselineHomeProbability * 0.55 + mc.homeWinProbability * 0.45
      : marketPrior * profile.impliedWeight +
        (baselineHomeProbability * 0.55 + mc.homeWinProbability * 0.45) * (1 - profile.impliedWeight) +
        moveAdj * 0.35;
  const homeWinProbability = calibrateProbability(blendedHomeProbabilityRaw, calibration);
  const awayWinProbability = boundedProbability(100 - homeWinProbability);

  if (moneylineOdds?.home_price || moneylineOdds?.away_price) {
    const homeImplied = impliedProbabilityFromAmerican(moneylineOdds.home_price);
    const awayImplied = impliedProbabilityFromAmerican(moneylineOdds.away_price);
    const homeEv = safeExpectedValue(homeWinProbability, moneylineOdds.home_price);
    const awayEv = safeExpectedValue(awayWinProbability, moneylineOdds.away_price);
    const homeBetter = (homeEv ?? -999) >= (awayEv ?? -999);
    const modelProbability = round(boundedProbability(homeBetter ? homeWinProbability : awayWinProbability), 2);
    const impliedProbability = round(Number(homeBetter ? homeImplied : awayImplied || 0) * 100, 2);
    const edge = round(modelProbability - impliedProbability, 2);
    const confidence = round(confidenceFromEdge(homeBetter ? homeEv : awayEv), 1);
    const risk = riskFromConfidence(confidence);
    const evRaw = homeBetter ? homeEv : awayEv;
    const ev = Number.isFinite(evRaw) ? round(evRaw, 2) : 0;
    const kelly = kellyFraction(modelProbability, homeBetter ? moneylineOdds.home_price : moneylineOdds.away_price);
    const units = Math.min(
      suggestedUnitsFromConfidence(confidence, edge, settings, lossStreak),
      round((kelly * 100) / (settings?.unit_percent ?? 1), 2)
    );
    rows.push({
      market_type: "Moneyline",
      pick: homeBetter
        ? `${homeTeam?.abbreviation || "HOME"} ML`
        : `${awayTeam?.abbreviation || "AWAY"} ML`,
      model_probability: modelProbability,
      implied_probability: impliedProbability,
      edge_pct: edge,
      expected_value_pct: ev,
      confidence_score: confidence,
      risk_level: risk,
      suggested_units: units,
      recommendation: edge > 0 ? "Bet" : "NO BET",
      reason:
        edge > 0
          ? "Model probability is above market implied probability with positive EV and calibrated confidence."
          : "No positive edge versus implied probability."
    });
  }

  if (spreadOdds?.spread !== null && spreadOdds?.spread !== undefined) {
    const fairCover = boundedProbability(
      logistic((spreadProjection + Number(spreadOdds.spread || 0)) / profile.spreadDivisor) * 100
    );
    const implied = impliedProbabilityFromAmerican(spreadOdds.home_price);
    const ev = safeExpectedValue(fairCover, spreadOdds.home_price);
    const edge = round(fairCover - ((Number(implied) || 0) * 100), 2);
    const confidence = round(confidenceFromEdge(ev), 1);
    const units = suggestedUnitsFromConfidence(confidence, edge, settings, lossStreak);
    rows.push({
      market_type: "Spread",
      pick: `${homeTeam?.abbreviation || "HOME"} ${spreadOdds.spread > 0 ? "+" : ""}${spreadOdds.spread}`,
      model_probability: round(fairCover, 2),
      implied_probability: round((Number(implied) || 0) * 100, 2),
      edge_pct: edge,
      expected_value_pct: Number.isFinite(ev) ? round(ev, 2) : 0,
      confidence_score: confidence,
      risk_level: riskFromConfidence(confidence),
      suggested_units: units,
      recommendation: edge > 0 ? "Bet" : "NO BET",
      reason:
        edge > 0
          ? "Projected margin and market spread create positive cover probability edge."
          : "Spread is priced efficiently relative to model output."
    });
  }

  if (totalOdds?.total !== null && totalOdds?.total !== undefined) {
    const line = Number(totalOdds.total);
    const underProbability = boundedProbability(logistic((line - totalProjection) / profile.totalDivisor) * 100);
    const impliedUnder = impliedProbabilityFromAmerican(totalOdds.under_price);
    const impliedOver = impliedProbabilityFromAmerican(totalOdds.over_price);
    const evUnder = safeExpectedValue(underProbability, totalOdds.under_price);
    const evOver = safeExpectedValue(100 - underProbability, totalOdds.over_price);
    const underBetter = (evUnder ?? -999) >= (evOver ?? -999);
    const modelProbability = round(underBetter ? underProbability : 100 - underProbability, 2);
    const implied = round((Number(underBetter ? impliedUnder : impliedOver) || 0) * 100, 2);
    const edge = round(modelProbability - implied, 2);
    const confidence = round(confidenceFromEdge(underBetter ? evUnder : evOver), 1);
    const units = suggestedUnitsFromConfidence(confidence, edge, settings, lossStreak);
    rows.push({
      market_type: "Total",
      pick: `${underBetter ? "Under" : "Over"} ${line}`,
      model_probability: modelProbability,
      implied_probability: implied,
      edge_pct: edge,
      expected_value_pct: Number.isFinite(underBetter ? evUnder : evOver) ? round(underBetter ? evUnder : evOver, 2) : 0,
      confidence_score: confidence,
      risk_level: riskFromConfidence(confidence),
      suggested_units: units,
      recommendation: edge > 0 ? "Bet" : "NO BET",
      reason:
        edge > 0
          ? "Projected pace and efficiency imply a positive total edge."
          : "Total market and model are too close for a positive EV recommendation."
    });
  }

  const openingTotal = openingOddsRows.find((row) => row.market_type === "totals");
  if (openingTotal && totalOdds && openingTotal.total && totalOdds.total) {
    const movement = round(Number(totalOdds.total) - Number(openingTotal.total), 1);
    rows.forEach((row) => {
      if (row.market_type === "Total") {
        row.reason = `${row.reason} Odds movement: ${movement > 0 ? "+" : ""}${movement} points from open.`;
      }
    });
  }

  return {
    spreadProjection,
    totalProjection,
    homeWinProbability: round(boundedProbability(homeWinProbability), 2),
    awayWinProbability: round(boundedProbability(awayWinProbability), 2),
    calibration: {
      source: calibration ? "historical-dynamic" : "default-bounded",
      homeRange90: mc.marginRange
    },
    predictions: rows
  };
}
