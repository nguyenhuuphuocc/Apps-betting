function logistic(x) {
  return 1 / (1 + Math.exp(-x));
}

function bounded(probability) {
  return Math.max(0.05, Math.min(0.95, probability));
}

export function predictEvent({ sportKey, context = {}, market = {} }) {
  const homeAdv = Number(context.homeAdvantage ?? 0.07);
  const formDiff = Number(context.formDiff ?? 0);
  const injuryDiff = Number(context.injuryDiff ?? 0);
  const paceDiff = Number(context.paceDiff ?? 0);
  const lineMove = Number(context.lineMove ?? 0);
  const sportBias =
    sportKey?.startsWith("soccer_")
      ? -0.08
      : sportKey?.startsWith("tennis_")
        ? -0.02
        : sportKey?.startsWith("golf_")
          ? -0.04
          : 0;
  const marketImplied = Number(market.impliedHome ?? 0.5);

  const score =
    -0.12 +
    homeAdv * 1.1 +
    formDiff * 0.8 -
    injuryDiff * 0.7 +
    paceDiff * 0.25 +
    lineMove * 0.2 +
    (marketImplied - 0.5) * 0.8 +
    sportBias;

  const homeWinProbability = bounded(logistic(score));
  const awayWinProbability = bounded(1 - homeWinProbability);
  const confidence = Math.max(1, Math.min(10, 4 + Math.abs(homeWinProbability - 0.5) * 12));
  return {
    homeWinProbability,
    awayWinProbability,
    confidence
  };
}
