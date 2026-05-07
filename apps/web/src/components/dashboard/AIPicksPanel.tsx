import type { AIPick } from "@/types";

type Props = {
  picks: AIPick[];
};

function toneClass(recommendation: AIPick["recommendation"]) {
  if (recommendation === "Strong Bet") return "border-accent/35 bg-accent/10 text-accent";
  if (recommendation === "Sharp Play") return "border-warning/35 bg-warning/10 text-warning";
  if (recommendation === "Lean") return "border-accentBlue/35 bg-accentBlue/10 text-accentBlue";
  return "border-danger/35 bg-danger/10 text-danger";
}

export function AIPicksPanel({ picks }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/85">AI Picks</h3>
        <p className="text-xs text-white/55">Ranked by edge + confidence</p>
      </div>

      <div className="grid gap-2">
        {picks.length ? (
          picks.slice(0, 6).map((pick) => (
            <article
              key={pick.id}
              className="rounded-xl border border-white/10 bg-bg p-3 transition hover:border-accentBlue/25"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{pick.pick}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneClass(pick.recommendation)}`}>
                  {pick.recommendation}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/60">{pick.matchup} - {pick.league}</p>
              <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                <Metric label="Model" value={`${pick.modelProbability.toFixed(1)}%`} />
                <Metric label="Implied" value={`${pick.impliedProbability.toFixed(1)}%`} />
                <Metric label="Edge" value={`${pick.edgePct.toFixed(2)}%`} />
                <Metric label="EV" value={`${pick.evPct.toFixed(2)}%`} />
              </div>
              <p className="mt-2 text-xs text-white/70">
                {pick.explanation} Confidence: {pick.confidence.toFixed(1)}/10. Risk: {pick.risk}.
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 bg-bg p-4 text-sm text-white/60">
            NO BET - no qualified +EV AI picks right now.
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-panel px-2 py-1">
      <p className="text-[10px] uppercase tracking-wide text-white/55">{label}</p>
      <p className="text-xs font-semibold text-white">{value}</p>
    </div>
  );
}
