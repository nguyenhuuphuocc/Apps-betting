import type { OpportunityItem } from "@/types";

type Props = {
  items: OpportunityItem[];
};

export function MarketMoversPanel({ items }: Props) {
  const movers = [...items]
    .filter((item) => item.lineMovePct > 0.5 || item.reverseLineMovement || item.steamMove)
    .sort((a, b) => b.lineMovePct - a.lineMovePct || b.sharpMoneyPct - a.sharpMoneyPct)
    .slice(0, 12);

  return (
    <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/85">
          Live Market Movers
        </h3>
        <p className="text-xs text-white/55">Steam and reverse-line alerts</p>
      </div>
      <div className="grid gap-2">
        {movers.length ? (
          movers.map((item) => (
            <article
              key={`${item.id}-mover`}
              className="rounded-xl border border-white/10 bg-bg px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{item.matchup}</p>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-white/85">
                  {item.league}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-accentBlue/15 px-2 py-1 text-accentBlue">
                  Move {item.lineMovePct.toFixed(2)}%
                </span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">
                  Sharp {item.sharpMoneyPct.toFixed(1)}%
                </span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">
                  Public {item.publicMoneyPct.toFixed(1)}%
                </span>
                {item.reverseLineMovement ? (
                  <span className="rounded bg-warning/15 px-2 py-1 text-warning">RLM</span>
                ) : null}
                {item.steamMove ? (
                  <span className="rounded bg-danger/15 px-2 py-1 text-danger">Steam</span>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 bg-bg p-4 text-sm text-white/60">
            No major movers at this moment.
          </div>
        )}
      </div>
    </section>
  );
}
