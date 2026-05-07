"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { BacktestResult } from "@/types";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

type Props = {
  onRun: (params: {
    from: string;
    to: string;
    minEdge: number;
    minConfidence?: number;
    startingBankroll?: number;
  }) => Promise<BacktestResult>;
};

export function BacktestPanel({ onRun }: Props) {
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [minEdge, setMinEdge] = useState(2);
  const [minConfidence, setMinConfidence] = useState(6);
  const [startingBankroll, setStartingBankroll] = useState(1000);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const chartData = useMemo(() => {
    const curve = result?.payload?.curve || [];
    return {
      labels: curve.map((row) => new Date(row.t).toLocaleDateString()),
      datasets: [
        {
          label: "Bankroll Curve",
          data: curve.map((row) => row.bankroll),
          borderColor: "#39ff88",
          backgroundColor: "rgba(57,255,136,.18)",
          tension: 0.26
        }
      ]
    };
  }, [result]);

  return (
    <section className="rounded-xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Backtesting Engine</h3>
        <span className="text-xs text-white/60">
          Historical replay only. No lookahead bias. No guaranteed outcomes.
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-6">
        <Field label="From">
          <input
            className="field"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </Field>
        <Field label="To">
          <input
            className="field"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </Field>
        <Field label="Min Edge %">
          <input
            className="field"
            type="number"
            min={0}
            max={20}
            step={0.25}
            value={minEdge}
            onChange={(event) => setMinEdge(Number(event.target.value))}
          />
        </Field>
        <Field label="Min Confidence">
          <input
            className="field"
            type="number"
            min={1}
            max={10}
            step={0.1}
            value={minConfidence}
            onChange={(event) => setMinConfidence(Number(event.target.value))}
          />
        </Field>
        <Field label="Starting Bankroll">
          <input
            className="field"
            type="number"
            min={100}
            step={50}
            value={startingBankroll}
            onChange={(event) => setStartingBankroll(Number(event.target.value))}
          />
        </Field>
        <div className="flex items-end">
          <button
            className="w-full rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/25"
            onClick={async () => {
              setLoading(true);
              try {
                const payload = await onRun({
                  from,
                  to,
                  minEdge,
                  minConfidence,
                  startingBankroll
                });
                setResult(payload);
              } finally {
                setLoading(false);
              }
            }}
            type="button"
          >
            {loading ? "Running..." : "Run Backtest"}
          </button>
        </div>
      </div>

      {result ? (
        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 md:grid-cols-5">
            <Metric label="ROI" value={`${result.roi_pct.toFixed(2)}%`} />
            <Metric label="Win Rate" value={`${result.win_rate_pct.toFixed(2)}%`} />
            <Metric label="Units" value={`${result.units.toFixed(2)}u`} />
            <Metric label="Wins-Losses" value={`${result.wins}-${result.losses}`} />
            <Metric label="Total Bets" value={`${result.total_bets}`} />
            <Metric
              label="Max Drawdown"
              value={`${result.payload?.maxDrawdownPct?.toFixed(2) ?? "0.00"}%`}
            />
            <Metric
              label="Brier Score"
              value={
                result.payload?.brierScore === null || result.payload?.brierScore === undefined
                  ? "N/A"
                  : `${result.payload.brierScore.toFixed(4)}`
              }
            />
            <Metric
              label="Longest Win Streak"
              value={`${result.payload?.longestWinStreak ?? 0}`}
            />
            <Metric
              label="Longest Loss Streak"
              value={`${result.payload?.longestLosingStreak ?? 0}`}
            />
            <Metric
              label="Ending Bankroll"
              value={`$${result.payload?.endingBankroll?.toFixed(2) ?? "0.00"}`}
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-bg p-3">
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { labels: { color: "#e5e7eb" } } },
                scales: {
                  x: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
                  y: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } }
                }
              }}
            />
          </div>
          <p className="text-xs text-white/55">
            Backtest results are scenario estimates. Live execution can differ due to line movement,
            limits, and unavailable markets.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-xs uppercase tracking-wide text-white/60">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-bg p-3">
      <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </article>
  );
}
