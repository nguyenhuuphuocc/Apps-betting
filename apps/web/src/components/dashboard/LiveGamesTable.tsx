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
      <table className="w-full text-sm">
        <thead className="bg-panelSoft text-left text-xs uppercase tracking-widest text-white/60">
          <tr>
            <th className="px-4 py-3">Matchup</th>
            <th className="px-4 py-3">League</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">Best Odds</th>
            <th className="px-4 py-3">Implied Prob</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => {
            const homePrice = Number(game.bestOdds?.home_price ?? 0);
            const implied = homePrice > 0 ? 100 / (homePrice + 100) : Math.abs(homePrice) / (Math.abs(homePrice) + 100);
            return (
              <tr key={game.eventId} className="border-t border-white/10">
                <td className="px-4 py-3 text-white">{game.awayTeam} @ {game.homeTeam}</td>
                <td className="px-4 py-3 text-white/70">{game.league}</td>
                <td className="px-4 py-3 text-white/70">{new Date(game.commenceTime).toLocaleString()}</td>
                <td className="px-4 py-3 text-accent">{game.bestOdds?.sportsbook || "N/A"} {homePrice ? (homePrice > 0 ? `+${homePrice}` : `${homePrice}`) : "-"}</td>
                <td className="px-4 py-3 text-white/80">{Number.isFinite(implied) ? `${(implied * 100).toFixed(1)}%` : "N/A"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
