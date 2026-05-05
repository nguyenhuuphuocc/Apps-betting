export function americanToDecimal(odds) {
  const price = Number(odds);
  if (!Number.isFinite(price) || price === 0) return null;
  return price > 0 ? 1 + price / 100 : 1 + 100 / Math.abs(price);
}

export function impliedProbabilityFromAmerican(odds) {
  const price = Number(odds);
  if (!Number.isFinite(price) || price === 0) return null;
  return price > 0 ? 100 / (price + 100) : Math.abs(price) / (Math.abs(price) + 100);
}

export function expectedValuePercent(modelProbabilityPercent, odds) {
  const decimal = americanToDecimal(odds);
  if (!decimal) return null;
  const p = Number(modelProbabilityPercent) / 100;
  if (!Number.isFinite(p)) return null;
  return (p * (decimal - 1) - (1 - p)) * 100;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function avg(values) {
  const usable = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  if (!usable.length) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

export function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}
