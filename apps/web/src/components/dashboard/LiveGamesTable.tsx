import type { LiveGame } from "@/types";

type Props = {
  games: LiveGame[];
};

export function LiveGamesTable({ games }: Props) {
  if (!games.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 bg-panel p-6 text-sm text-white/60">
        Live data unavailable - showing latest update.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-panel shadow-panel">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-panelSoft text-left text-xs uppercase tracking-widest text-white/60">
          <tr>
            <th className="px-4 py-3">Matchup</th>
            <th className="px-4 py-3">League</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">Best Odds</th>
            <th className="px-4 py-3">Implied Prob</th>
            <th className="px-4 py-3">Line Move</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => {
            const homePrice = Number(game.bestOdds?.home_price ?? game.bestOdds?.homePrice ?? 0);
            const implied =
              homePrice > 0
                ? 100 / (homePrice + 100)
                : Math.abs(homePrice) / (Math.abs(homePrice) + 100);
            return (
              <tr key={game.eventId} className="border-t border-white/10">
                <td className="px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    <span>{game.awayTeam} @ {game.homeTeam}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${
                        game.status === "live"
                          ? "bg-danger/20 text-danger"
                          : game.status === "final"
                            ? "bg-white/15 text-white/80"
                            : "bg-accentBlue/20 text-accentBlue"
                      }`}
                    >
                      {game.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/70">{game.league}</td>
                <td className="px-4 py-3 text-white/70">{new Date(game.commenceTime).toLocaleString()}</td>
                <td className="px-4 py-3 text-accent">{game.bestOdds?.sportsbook || "N/A"} {homePrice ? (homePrice > 0 ? `+${homePrice}` : `${homePrice}`) : "-"}</td>
                <td className="px-4 py-3 text-white/80">{Number.isFinite(implied) ? `${(implied * 100).toFixed(1)}%` : "N/A"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/80">{game.movement?.movementPct?.toFixed(1) ?? "0.0"}%</span>
                    {game.movement?.sharpSignal ? (
                      <span className="rounded bg-warning/20 px-1.5 py-0.5 text-warning">Sharp</span>
                    ) : null}
                    {game.movement?.steamMove ? (
                      <span className="rounded bg-danger/20 px-1.5 py-0.5 text-danger">Steam</span>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
