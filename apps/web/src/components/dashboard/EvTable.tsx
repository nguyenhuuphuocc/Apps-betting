import clsx from "clsx";
import type { EvBet } from "@/types";

type Props = {
  bets: EvBet[];
};

export function EvTable({ bets }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-panel shadow-panel">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold tracking-wide text-white">+EV Bet Detector</h3>
        <span className="text-xs text-white/60">Only positive edge spots are listed</span>
      </div>
      <table className="w-full text-sm">
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
              <td className="px-4 py-3 text-white">{bet.pick}</td>
              <td className="px-4 py-3 text-white/80">{Number(bet.model_probability).toFixed(1)}%</td>
              <td className="px-4 py-3 text-white/70">{Number(bet.implied_probability).toFixed(1)}%</td>
              <td className={clsx("px-4 py-3 font-semibold", Number(bet.edge_pct) >= 3 ? "text-accent" : "text-warning")}>
                {Number(bet.edge_pct).toFixed(2)}%
              </td>
              <td className={clsx("px-4 py-3 font-semibold", Number(bet.ev_pct) > 0 ? "text-accent" : "text-danger")}>
                {Number(bet.ev_pct).toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-white/80">{Number(bet.confidence).toFixed(1)}/10</td>
              <td className="px-4 py-3 text-white/80">{Number(bet.suggested_units).toFixed(2)}u</td>
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
  );
}
