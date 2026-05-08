import clsx from "clsx";
import type { EvBet } from "@/types";

type Props = {
  bets: EvBet[];
};

export function EvTable({ bets }: Props) {
  const read = (value: number | string | null | undefined, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-panel shadow-panel">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold tracking-wide text-white">+EV Bet Detector</h3>
        <span className="text-xs text-white/60">Only positive edge spots are listed (no guaranteed outcomes)</span>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="bg-panelSoft text-left text-xs uppercase tracking-widest text-white/60">
          <tr>
            <th className="px-4 py-3">Pick</th>
            <th className="px-4 py-3">Model Prob</th>
            <th className="px-4 py-3">Implied</th>
            <th className="px-4 py-3">Edge</th>
            <th className="px-4 py-3">EV</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Units</th>
          </tr>
        </thead>
        <tbody>
          {bets.map((bet) => (
            <tr key={bet.id} className="border-t border-white/10">
              <td className="px-4 py-3 text-white">
                <p>{bet.pick}</p>
                <p className="text-xs text-white/55">{bet.reason ?? "Model-derived value setup"}</p>
              </td>
              <td className="px-4 py-3 text-white/80">{read(bet.model_probability).toFixed(1)}%</td>
              <td className="px-4 py-3 text-white/70">{read(bet.implied_probability).toFixed(1)}%</td>
              <td className={clsx("px-4 py-3 font-semibold", read(bet.edge_pct) >= 3 ? "text-accent" : "text-warning")}>
                {read(bet.edge_pct).toFixed(2)}%
              </td>
              <td className={clsx("px-4 py-3 font-semibold", read(bet.ev_pct) > 0 ? "text-accent" : "text-danger")}>
                {read(bet.ev_pct).toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-white/80">{read(bet.confidence).toFixed(1)}/10</td>
              <td className="px-4 py-3 text-white/80">
                {read(bet.suggested_units).toFixed(2)}u
                <span
                  className={clsx(
                    "ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    (bet.risk_level ?? "Medium") === "Low"
                      ? "bg-accent/15 text-accent"
                      : (bet.risk_level ?? "Medium") === "Medium"
                        ? "bg-warning/15 text-warning"
                        : "bg-danger/15 text-danger"
                  )}
                >
                  {bet.risk_level ?? "Medium"}
                </span>
              </td>
            </tr>
          ))}
          {!bets.length ? (
            <tr>
              <td className="px-4 py-5 text-white/60" colSpan={7}>
                NO BET - no positive expected value.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </div>
    </div>
  );
}
