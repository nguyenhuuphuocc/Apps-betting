"use client";

import { useMemo, useState } from "react";
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
  onRun: (params: { from: string; to: string; minEdge: number }) => Promise<BacktestResult>;
};

export function BacktestPanel({ onRun }: Props) {
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [minEdge, setMinEdge] = useState(2);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const chartData = useMemo(() => {
    const curve = result?.payload?.curve || [];
    return {
      labels: curve.map((row) => new Date(row.t).toLocaleDateString()),
      datasets: [
        {
          label: "Profit Curve (Units)",
          data: curve.map((row) => row.bankroll),
          borderColor: "#39ff88",
          backgroundColor: "rgba(57,255,136,.2)"
        }
      ]
    };
  }, [result]);

  return (
    <section className="rounded-xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Backtesting Engine</h3>
        <span className="text-xs text-white/60">No lookahead bias - uses stored historical predictions</span>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <input className="rounded-lg border border-white/15 bg-bg px-3 py-2 text-sm text-white" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input className="rounded-lg border border-white/15 bg-bg px-3 py-2 text-sm text-white" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <input className="rounded-lg border border-white/15 bg-bg px-3 py-2 text-sm text-white" type="number" min={0} max={15} value={minEdge} onChange={(event) => setMinEdge(Number(event.target.value))} />
        <button
          className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/25"
          onClick={async () => {
            setLoading(true);
            try {
              const payload = await onRun({ from, to, minEdge });
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

      {result ? (
        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 md:grid-cols-5">
            <Metric label="ROI" value={`${result.roi_pct.toFixed(2)}%`} />
            <Metric label="Win Rate" value={`${result.win_rate_pct.toFixed(2)}%`} />
            <Metric label="Units" value={`${result.units.toFixed(2)}u`} />
            <Metric label="Wins-Losses" value={`${result.wins}-${result.losses}`} />
            <Metric label="Total Bets" value={`${result.total_bets}`} />
          </div>
          <div className="rounded-xl border border-white/10 bg-bg p-3">
            <Line data={chartData} options={{ responsive: true, plugins: { legend: { labels: { color: "#e5e7eb" } } }, scales: { x: { ticks: { color: "#94a3b8" } }, y: { ticks: { color: "#94a3b8" } } } }} />
          </div>
        </div>
      ) : null}
    </section>
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
