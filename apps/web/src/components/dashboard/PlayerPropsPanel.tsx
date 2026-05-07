import type { PlayerPropInsight } from "@/types";

type Props = {
  rows: PlayerPropInsight[];
};

export function PlayerPropsPanel({ rows }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/85">Player Props Engine</h3>
        <p className="text-xs text-white/55">Projection vs line scanner</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-panelSoft text-left text-xs uppercase tracking-wide text-white/60">
            <tr>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2">Market</th>
              <th className="px-3 py-2">Line</th>
              <th className="px-3 py-2">Projection</th>
              <th className="px-3 py-2">Lean</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Hit Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.slice(0, 8).map((row) => (
                <tr key={row.id} className="border-t border-white/10 bg-bg">
                  <td className="px-3 py-2 text-white">
                    <p>{row.player}</p>
                    <p className="text-xs text-white/55">{row.team} vs {row.opponent}</p>
                  </td>
                  <td className="px-3 py-2 text-white/75">{row.market}</td>
                  <td className="px-3 py-2 text-white/75">{row.line.toFixed(1)}</td>
                  <td className="px-3 py-2 text-white/75">{row.projection.toFixed(1)}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${row.lean === "Over" ? "bg-accent/15 text-accent" : "bg-danger/15 text-danger"}`}>
                      {row.lean}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-white/75">{row.confidence.toFixed(1)}/10</td>
                  <td className="px-3 py-2 text-white/75">{row.hitRate.toFixed(1)}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-4 text-sm text-white/60" colSpan={7}>
                  Prop feed is waiting for synced market data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-white/55">
        Props are model-driven estimates and not guarantees. Confirm confirmed player availability before placing bets.
      </p>
    </section>
  );
}
