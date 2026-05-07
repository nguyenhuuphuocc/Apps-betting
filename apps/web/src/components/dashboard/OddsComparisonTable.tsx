import clsx from "clsx";
import type { OddsComparisonRow } from "@/types";

type Props = {
  rows: OddsComparisonRow[];
};

function formatOdds(price: number | null) {
  if (price === null || price === undefined) return "-";
  const value = Number(price);
  if (!Number.isFinite(value) || value === 0) return "-";
  return value > 0 ? `+${value}` : `${value}`;
}

export function OddsComparisonTable({ rows }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-panel shadow-panel">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold tracking-wide text-white">Odds Comparison</h3>
        <span className="text-xs text-white/60">Line shopping across books</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-panelSoft text-left text-xs uppercase tracking-widest text-white/60">
          <tr>
            <th className="px-4 py-3">Sportsbook</th>
            <th className="px-4 py-3">Home ML</th>
            <th className="px-4 py-3">Away ML</th>
            <th className="px-4 py-3">Spread</th>
            <th className="px-4 py-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sportsbook} className="border-t border-white/10">
              <td className="px-4 py-3 text-white">{row.sportsbook}</td>
              <td
                className={clsx(
                  "px-4 py-3",
                  row.bestHome ? "font-semibold text-accent" : "text-white/80"
                )}
              >
                {formatOdds(row.moneylineHome)}
                {row.bestHome ? "  (best)" : ""}
              </td>
              <td
                className={clsx(
                  "px-4 py-3",
                  row.bestAway ? "font-semibold text-accent" : "text-white/80"
                )}
              >
                {formatOdds(row.moneylineAway)}
                {row.bestAway ? "  (best)" : ""}
              </td>
              <td className="px-4 py-3 text-white/80">
                {row.spread === null || row.spread === undefined ? "-" : Number(row.spread).toFixed(1)}
              </td>
              <td className="px-4 py-3 text-white/80">
                {row.total === null || row.total === undefined ? "-" : Number(row.total).toFixed(1)}
              </td>
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td className="px-4 py-5 text-white/60" colSpan={5}>
                Market unavailable for this event right now.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
