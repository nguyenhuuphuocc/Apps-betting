import { clamp, expectedValuePercent, impliedProbabilityFromAmerican, round } from "../lib/math.mjs";

function logistic(value) {
  return 1 / (1 + Math.exp(-value));
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

function marketOdds(latestOddsRows, marketType) {
  return latestOddsRows.find((row) => row.market_type === marketType) || null;
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
    lossStreak = 0
  } = context;

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
  const homeCourt = 1.85;
  const spreadProjection = round((homeStrength - awayStrength) + homeCourt + headToHeadEdge, 1);
  const homeWinProbability = logistic((spreadProjection - 1.5) / 5.8) * 100;
  const awayWinProbability = 100 - homeWinProbability;
  const totalProjection = round(
    212 +
      (Number(homeTeam?.pace ?? 99) + Number(awayTeam?.pace ?? 99) - 198) * 0.85 +
      (Number(homeTeam?.offense_rating ?? 112) - Number(awayTeam?.defense_rating ?? 112)) * 0.24 +
      (Number(awayTeam?.offense_rating ?? 112) - Number(homeTeam?.defense_rating ?? 112)) * 0.24,
    1
  );

  const moneylineOdds = marketOdds(latestOddsRows, "h2h");
  const spreadOdds = marketOdds(latestOddsRows, "spreads");
  const totalOdds = marketOdds(latestOddsRows, "totals");

  const rows = [];

  if (moneylineOdds?.home_price || moneylineOdds?.away_price) {
    const homeImplied = impliedProbabilityFromAmerican(moneylineOdds.home_price);
    const awayImplied = impliedProbabilityFromAmerican(moneylineOdds.away_price);
    const homeEv = expectedValuePercent(homeWinProbability, moneylineOdds.home_price);
    const awayEv = expectedValuePercent(awayWinProbability, moneylineOdds.away_price);
    const homeBetter = (homeEv ?? -999) >= (awayEv ?? -999);
    const modelProbability = round(homeBetter ? homeWinProbability : awayWinProbability, 2);
    const impliedProbability = round((homeBetter ? homeImplied : awayImplied) * 100, 2);
    const edge = round(modelProbability - impliedProbability, 2);
    const confidence = round(confidenceFromEdge(homeBetter ? homeEv : awayEv), 1);
    const risk = riskFromConfidence(confidence);
    const ev = round(homeBetter ? homeEv : awayEv, 2);
    const units = suggestedUnitsFromConfidence(confidence, edge, settings, lossStreak);
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
          ? "Model probability is above market implied probability with positive EV."
          : "No positive edge versus implied probability."
    });
  }

  if (spreadOdds?.spread !== null && spreadOdds?.spread !== undefined) {
    const fairCover = logistic((spreadProjection + Number(spreadOdds.spread || 0)) / 4.4) * 100;
    const implied = impliedProbabilityFromAmerican(spreadOdds.home_price);
    const ev = expectedValuePercent(fairCover, spreadOdds.home_price);
    const edge = round(fairCover - (implied * 100), 2);
    const confidence = round(confidenceFromEdge(ev), 1);
    const units = suggestedUnitsFromConfidence(confidence, edge, settings, lossStreak);
    rows.push({
      market_type: "Spread",
      pick: `${homeTeam?.abbreviation || "HOME"} ${spreadOdds.spread > 0 ? "+" : ""}${spreadOdds.spread}`,
      model_probability: round(fairCover, 2),
      implied_probability: round(implied * 100, 2),
      edge_pct: edge,
      expected_value_pct: round(ev, 2),
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
    const underProbability = logistic((line - totalProjection) / 7.0) * 100;
    const impliedUnder = impliedProbabilityFromAmerican(totalOdds.under_price);
    const impliedOver = impliedProbabilityFromAmerican(totalOdds.over_price);
    const evUnder = expectedValuePercent(underProbability, totalOdds.under_price);
    const evOver = expectedValuePercent(100 - underProbability, totalOdds.over_price);
    const underBetter = (evUnder ?? -999) >= (evOver ?? -999);
    const modelProbability = round(underBetter ? underProbability : 100 - underProbability, 2);
    const implied = round((underBetter ? impliedUnder : impliedOver) * 100, 2);
    const edge = round(modelProbability - implied, 2);
    const confidence = round(confidenceFromEdge(underBetter ? evUnder : evOver), 1);
    const units = suggestedUnitsFromConfidence(confidence, edge, settings, lossStreak);
    rows.push({
      market_type: "Total",
      pick: `${underBetter ? "Under" : "Over"} ${line}`,
      model_probability: modelProbability,
      implied_probability: implied,
      edge_pct: edge,
      expected_value_pct: round(underBetter ? evUnder : evOver, 2),
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
    homeWinProbability: round(homeWinProbability, 2),
    awayWinProbability: round(awayWinProbability, 2),
    predictions: rows
  };
}
