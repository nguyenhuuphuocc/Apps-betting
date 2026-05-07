import type { OpportunityItem } from "@/types";

type Props = {
  items: OpportunityItem[];
};

function summaryFor(item: OpportunityItem) {
  const sharpBias = item.sharpMoneyPct > item.publicMoneyPct ? "sharp money support" : "public-heavy side";
  const moveText = item.reverseLineMovement
    ? "reverse line movement"
    : item.steamMove
      ? "steam move acceleration"
      : "stable line action";
  return `${item.pick} grades well from a ${item.edgePct.toFixed(2)}% model edge and ${item.confidence.toFixed(
    1
  )}/10 confidence. Market context shows ${sharpBias} with ${moveText}.`;
}

export function AiInsightPanel({ items }: Props) {
  const top = [...items].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 3);

  return (
    <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/85">AI Insight Feed</h3>
        <p className="text-xs text-white/55">Instant “why this bet” narratives</p>
      </div>

      <div className="grid gap-2">
        {top.length ? (
          top.map((item) => (
            <article key={`${item.id}-insight`} className="rounded-xl border border-white/10 bg-bg p-3">
              <p className="text-sm font-semibold text-white">{item.pick}</p>
              <p className="mt-1 text-xs text-white/60">{item.matchup}</p>
              <p className="mt-2 text-xs text-white/75">{summaryFor(item)}</p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 bg-bg p-4 text-sm text-white/60">
            AI insights will populate after opportunities are available.
          </div>
        )}
      </div>
    </section>
  );
}
