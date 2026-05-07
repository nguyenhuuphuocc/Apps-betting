import type { LiveInsight } from "@/types";

type Props = {
  rows: LiveInsight[];
};

function momentumClass(momentum: LiveInsight["momentum"]) {
  if (momentum === "Home") return "bg-accent/15 text-accent";
  if (momentum === "Away") return "bg-danger/15 text-danger";
  return "bg-white/10 text-white/70";
}

export function LiveInsightsPanel({ rows }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/85">Live Intelligence</h3>
        <p className="text-xs text-white/55">Momentum and pace signals</p>
      </div>

      <div className="grid gap-2">
        {rows.length ? (
          rows.slice(0, 6).map((row) => (
            <article key={row.eventId} className="rounded-xl border border-white/10 bg-bg p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{row.matchup}</p>
                <span className="rounded bg-accentBlue/15 px-2 py-0.5 text-[11px] font-semibold text-accentBlue">
                  Home Win {row.liveWinProbabilityHome.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-white/10 px-2 py-1 text-white/70">{row.status}</span>
                <span className={`rounded px-2 py-1 ${momentumClass(row.momentum)}`}>
                  Momentum: {row.momentum}
                </span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/70">Pace x{row.paceFactor.toFixed(2)}</span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/70">
                  Shooting Delta {row.shootingDelta > 0 ? "+" : ""}
                  {row.shootingDelta.toFixed(2)}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/65">{row.opportunity}</p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 bg-bg p-4 text-sm text-white/60">
            Live insight feed is waiting for synced games.
          </div>
        )}
      </div>
    </section>
  );
}
