export function americanToDecimal(odds) {
  const value = Number(odds);
  if (!Number.isFinite(value) || value === 0) return null;
  return value > 0 ? 1 + value / 100 : 1 + 100 / Math.abs(value);
}

export function impliedProbabilityFromAmerican(odds) {
  const value = Number(odds);
  if (!Number.isFinite(value) || value === 0) return null;
  return value > 0 ? 100 / (value + 100) : Math.abs(value) / (Math.abs(value) + 100);
}

export function expectedValue({ winProbability, odds, stake = 1 }) {
  const decimal = americanToDecimal(odds);
  if (!decimal) return null;
  const pWin = Math.max(0.05, Math.min(0.95, Number(winProbability)));
  const loseProbability = 1 - pWin;
  const payout = stake * (decimal - 1);
  const ev = pWin * payout - loseProbability * stake;
  return Number.isFinite(ev) ? ev : null;
}

export function kellyFraction({ probability, odds }) {
  const decimal = americanToDecimal(odds);
  if (!decimal) return 0;
  const p = Math.max(0.05, Math.min(0.95, Number(probability)));
  const b = decimal - 1;
  const q = 1 - p;
  const fraction = (b * p - q) / b;
  return Math.max(0, Math.min(0.05, fraction));
}
