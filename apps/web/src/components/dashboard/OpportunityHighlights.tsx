import type { OpportunityItem } from "@/types";

type Props = {
  items: OpportunityItem[];
};

function lineFor(item: OpportunityItem) {
  return `${item.pick} | ${item.league} | EV ${item.evPct.toFixed(2)}% | Score ${item.opportunityScore.toFixed(1)}`;
}

function boardTone(type: "ev" | "safe" | "live" | "sharp") {
  if (type === "ev") return "border-accent/30 bg-accent/10";
  if (type === "safe") return "border-accentBlue/30 bg-accentBlue/10";
  if (type === "live") return "border-warning/30 bg-warning/10";
  return "border-danger/30 bg-danger/10";
}

export function OpportunityHighlights({ items }: Props) {
  const topEv = [...items]
    .sort((a, b) => b.evPct - a.evPct || b.opportunityScore - a.opportunityScore)
    .slice(0, 4);
  const safest = [...items]
    .filter((x) => x.risk === "Low")
    .sort((a, b) => b.confidence - a.confidence || b.opportunityScore - a.opportunityScore)
    .slice(0, 4);
  const bestLive = [...items]
    .filter((x) => x.timeToStartMins <= 120 || x.tag === "Elite Value")
    .sort((a, b) => a.timeToStartMins - b.timeToStartMins || b.opportunityScore - a.opportunityScore)
    .slice(0, 4);
  const sharpAlerts = [...items]
    .filter((x) => x.reverseLineMovement || x.steamMove || x.sharpMoneyPct >= 62)
    .sort((a, b) => b.sharpMoneyPct - a.sharpMoneyPct || b.lineMovePct - a.lineMovePct)
    .slice(0, 4);

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Board
        title="Highest EV Opportunities"
        tone="ev"
        lines={topEv.map(lineFor)}
        empty="No +EV opportunities right now."
      />
      <Board
        title="Safest Bets"
        tone="safe"
        lines={safest.map(lineFor)}
        empty="No low-risk candidates currently."
      />
      <Board
        title="Best Live Windows"
        tone="live"
        lines={bestLive.map((x) => `${lineFor(x)} | Starts in ${x.timeToStartMins}m`)}
        empty="No live or near-live opportunities."
      />
      <Board
        title="Sharp Money Alerts"
        tone="sharp"
        lines={sharpAlerts.map(
          (x) =>
            `${lineFor(x)} | Sharp ${x.sharpMoneyPct.toFixed(1)}%${
              x.reverseLineMovement ? " | RLM" : ""
            }${x.steamMove ? " | Steam" : ""}`
        )}
        empty="No sharp-action outliers detected."
      />
    </section>
  );
}

function Board({
  title,
  tone,
  lines,
  empty
}: {
  title: string;
  tone: "ev" | "safe" | "live" | "sharp";
  lines: string[];
  empty: string;
}) {
  return (
    <article className={`rounded-xl border p-3 ${boardTone(tone)}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90">{title}</h4>
      <div className="mt-2 grid gap-2">
        {lines.length ? (
          lines.map((line) => (
            <p key={line} className="rounded-lg border border-white/15 bg-bg px-2 py-2 text-[11px] text-white/80">
              {line}
            </p>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-white/25 bg-bg px-2 py-3 text-[11px] text-white/60">
            {empty}
          </p>
        )}
      </div>
    </article>
  );
}
