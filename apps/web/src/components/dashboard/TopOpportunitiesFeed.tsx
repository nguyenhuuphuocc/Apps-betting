import type { OpportunityItem } from "@/types";

type Props = {
  items: OpportunityItem[];
};

function tagTone(tag: OpportunityItem["tag"]) {
  if (tag === "Best Bet of the Day") return "border-warning/50 bg-warning/20 text-warning";
  if (tag === "Elite Value") return "border-accent/50 bg-accent/15 text-accent";
  if (tag === "High Confidence") return "border-accentBlue/45 bg-accentBlue/15 text-accentBlue";
  if (tag === "Underdog Value") return "border-violet-400/45 bg-violet-500/15 text-violet-200";
  return "border-white/20 bg-white/10 text-white/80";
}

function riskTone(risk: OpportunityItem["risk"]) {
  if (risk === "Low") return "bg-accent/15 text-accent";
  if (risk === "Medium") return "bg-warning/15 text-warning";
  return "bg-danger/15 text-danger";
}

export function TopOpportunitiesFeed({ items }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/85">
          Top Betting Opportunities
        </h3>
        <p className="text-xs text-white/55">Auto-scanned across all supported sports and markets</p>
      </div>

      <div className="grid gap-3">
        {items.length ? (
          items.slice(0, 12).map((item, idx) => (
            <article
              key={item.id}
              className={`rounded-xl border p-3 transition ${
                item.tag === "Best Bet of the Day"
                  ? "border-warning/50 bg-warning/10 shadow-[0_0_24px_rgba(242,201,76,.18)]"
                  : item.tag === "Elite Value"
                    ? "border-accent/35 bg-accent/10 shadow-[0_0_20px_rgba(57,255,136,.12)]"
                    : "border-white/10 bg-bg hover:border-accentBlue/35"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    #{idx + 1} {item.pick}
                  </p>
                  <p className="text-xs text-white/60">
                    {item.league} - {item.matchup} - {item.sportsbook}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ConfidenceDial value={item.confidence * 10} />
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tagTone(item.tag)}`}>
                    {item.tag}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white">
                    Score {item.opportunityScore.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-6">
                <Metric label="Odds" value={item.odds === null ? "Market pending" : item.odds > 0 ? `+${item.odds}` : `${item.odds}`} />
                <Metric label="AI Prob" value={`${item.aiProbability.toFixed(1)}%`} />
                <Metric label="EV" value={`${item.evPct.toFixed(2)}%`} />
                <Metric label="Edge" value={`${item.edgePct.toFixed(2)}%`} />
                <Metric label="Confidence" value={`${item.confidence.toFixed(1)}/10`} />
                <Metric label="Stake" value={`${item.suggestedUnits.toFixed(2)}u`} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded px-2 py-1 font-semibold ${riskTone(item.risk)}`}>Risk {item.risk}</span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">Sharp {item.sharpMoneyPct.toFixed(1)}%</span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">Public {item.publicMoneyPct.toFixed(1)}%</span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">Line Move {item.lineMovePct.toFixed(1)}%</span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">ROI Proj {item.roiProjectionPct.toFixed(1)}%</span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">Starts in {item.timeToStartMins}m</span>
                {item.reverseLineMovement ? (
                  <span className="rounded bg-warning/15 px-2 py-1 text-warning">RLM</span>
                ) : null}
                {item.steamMove ? (
                  <span className="rounded bg-danger/15 px-2 py-1 text-danger">Steam</span>
                ) : null}
              </div>

              <p className="mt-2 text-xs text-white/70">{item.reason}</p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 bg-bg p-5 text-sm text-white/60">
            No high-quality opportunities yet. Sync data to refresh the global scanner.
          </div>
        )}
      </div>
    </section>
  );
}

function ConfidenceDial({ value }: { value: number }) {
  const bounded = Math.max(0, Math.min(100, value));
  const radius = 13;
  const c = 2 * Math.PI * radius;
  const fill = c * (1 - bounded / 100);
  const tone =
    bounded >= 75 ? "#39ff88" : bounded >= 60 ? "#4cc9ff" : bounded >= 45 ? "#f2c94c" : "#ff5d73";
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-bg px-1.5 py-1">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-label="confidence">
        <circle cx="15" cy="15" r={radius} fill="none" stroke="#334155" strokeWidth="3" />
        <circle
          cx="15"
          cy="15"
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={fill}
          transform="rotate(-90 15 15)"
        />
      </svg>
      <span className="text-[10px] font-semibold text-white/85">{bounded.toFixed(0)}%</span>
    </div>
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
