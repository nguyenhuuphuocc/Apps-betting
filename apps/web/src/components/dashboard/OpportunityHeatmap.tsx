import type { OpportunityItem } from "@/types";

type Props = {
  items: OpportunityItem[];
};

function tone(avgScore: number) {
  if (avgScore >= 80) return "bg-accent/30 text-accent border-accent/40";
  if (avgScore >= 68) return "bg-accentBlue/25 text-accentBlue border-accentBlue/35";
  if (avgScore >= 55) return "bg-warning/25 text-warning border-warning/35";
  return "bg-danger/20 text-danger border-danger/35";
}

export function OpportunityHeatmap({ items }: Props) {
  const bySport = new Map<
    string,
    {
      label: string;
      count: number;
      avgScore: number;
      topEdge: number;
      strongCount: number;
    }
  >();

  for (const item of items) {
    const current = bySport.get(item.sportKey) ?? {
      label: item.league || item.sportKey,
      count: 0,
      avgScore: 0,
      topEdge: 0,
      strongCount: 0
    };
    current.count += 1;
    current.avgScore += item.opportunityScore;
    current.topEdge = Math.max(current.topEdge, item.edgePct);
    if (item.tag === "Best Bet of the Day" || item.tag === "Elite Value") current.strongCount += 1;
    bySport.set(item.sportKey, current);
  }

  const rows = [...bySport.entries()]
    .map(([sportKey, value]) => ({
      sportKey,
      label: value.label,
      count: value.count,
      avgScore: value.count ? value.avgScore / value.count : 0,
      topEdge: value.topEdge,
      strongCount: value.strongCount
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 12);

  return (
    <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/85">Opportunity Heatmap</h3>
        <p className="text-xs text-white/55">Live density by sport</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {rows.length ? (
          rows.map((row) => (
            <article key={row.sportKey} className={`rounded-xl border p-3 ${tone(row.avgScore)}`}>
              <p className="text-xs uppercase tracking-widest text-white/80">{row.label}</p>
              <p className="mt-1 text-lg font-semibold">{row.avgScore.toFixed(1)}</p>
              <p className="mt-1 text-[11px] text-white/80">
                {row.count} spots | Top edge {row.topEdge.toFixed(2)}%
              </p>
              <p className="text-[11px] text-white/70">Elite tags: {row.strongCount}</p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 bg-bg p-4 text-sm text-white/60 sm:col-span-2 xl:col-span-4">
            Heatmap appears after opportunities are synced.
          </div>
        )}
      </div>
    </section>
  );
}
