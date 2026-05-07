import clsx from "clsx";
import type { SharpSignal } from "@/types";

type Props = {
  rows: SharpSignal[];
};

export function SharpMoneyTable({ rows }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-panel shadow-panel">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold tracking-wide text-white">Sharp Money Tracker</h3>
        <span className="text-xs text-white/60">Reverse line movement + steam detection</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-panelSoft text-left text-xs uppercase tracking-widest text-white/60">
          <tr>
            <th className="px-4 py-3">Matchup</th>
            <th className="px-4 py-3">League</th>
            <th className="px-4 py-3">Move %</th>
            <th className="px-4 py-3">Signal</th>
            <th className="px-4 py-3">Risk Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.eventId} className="border-t border-white/10">
              <td className="px-4 py-3 text-white">{row.matchup}</td>
              <td className="px-4 py-3 text-white/70">{row.league}</td>
              <td className="px-4 py-3 text-white/80">{row.movementPct.toFixed(2)}%</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {row.sharpSignal ? (
                    <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs text-warning">
                      Sharp signal
                    </span>
                  ) : null}
                  {row.steamMove ? (
                    <span className="rounded bg-danger/20 px-1.5 py-0.5 text-xs text-danger">
                      Steam move
                    </span>
                  ) : null}
                  {!row.sharpSignal && !row.steamMove ? (
                    <span className="rounded bg-accentBlue/20 px-1.5 py-0.5 text-xs text-accentBlue">
                      Normal
                    </span>
                  ) : null}
                </div>
              </td>
              <td
                className={clsx(
                  "px-4 py-3 text-xs",
                  row.sharpSignal ? "text-warning" : row.steamMove ? "text-danger" : "text-white/55"
                )}
              >
                {row.sharpSignal
                  ? "Public trap warning possible."
                  : row.steamMove
                    ? "Fast move: re-check price before entry."
                    : "No notable pressure signal."}
              </td>
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td className="px-4 py-5 text-white/60" colSpan={5}>
                No sharp money signals currently detected for this filter.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
