export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(isoDate, amount) {
  const value = new Date(`${isoDate}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

export function dateRange(startIso, endIso) {
  const items = [];
  let cursor = startIso;
  while (cursor <= endIso) {
    items.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return items;
}

export function nowIso() {
  return new Date().toISOString();
}

export function gameStatus(statusRaw = "") {
  const status = String(statusRaw).toLowerCase();
  if (status.includes("final")) return "final";
  if (status.includes("live") || status.includes("qtr") || status.includes("halftime")) return "live";
  return "scheduled";
}
