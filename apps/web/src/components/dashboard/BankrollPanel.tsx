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
import type { BankrollSummary } from "@/types";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

type Props = {
  data: BankrollSummary | undefined;
  onAddEntry: (input: { amount: number; entryType: string; note?: string }) => Promise<void>;
};

export function BankrollPanel({ data, onAddEntry }: Props) {
  const [amount, setAmount] = useState<number>(0);
  const [entryType, setEntryType] = useState("manual_adjustment");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const chartData = useMemo(() => {
    const rows = data?.entries ?? [];
    return {
      labels: rows.map((row) => new Date(row.t).toLocaleDateString()),
      datasets: [
        {
          label: "Bankroll",
          data: rows.map((row) => row.balance),
          borderColor: "#4cc9ff",
          backgroundColor: "rgba(76,201,255,.18)",
          tension: 0.24
        }
      ]
    };
  }, [data?.entries]);

  return (
    <section className="rounded-xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Bankroll Tracker</h3>
        <span className="text-xs text-white/60">
          Risk first: never chase losses, cap single-bet exposure.
        </span>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <Metric label="Current" value={`$${data?.summary.currentBankroll?.toFixed(2) ?? "0.00"}`} />
        <Metric label="ROI" value={`${data?.summary.roiPct?.toFixed(2) ?? "0.00"}%`} />
        <Metric label="Win Rate" value={`${data?.summary.winRatePct?.toFixed(2) ?? "0.00"}%`} />
        <Metric label="Max Drawdown" value={`${data?.summary.maxDrawdownPct?.toFixed(2) ?? "0.00"}%`} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr]">
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

        <form
          className="rounded-xl border border-white/10 bg-bg p-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!Number.isFinite(amount) || amount === 0) return;
            setSaving(true);
            try {
              await onAddEntry({ amount, entryType, note });
              setAmount(0);
              setNote("");
            } finally {
              setSaving(false);
            }
          }}
        >
          <h4 className="text-sm font-semibold text-white">Add Entry</h4>
          <div className="mt-3 grid gap-2">
            <label className="text-xs text-white/60">
              Amount
              <input
                className="field mt-1 w-full"
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
            </label>
            <label className="text-xs text-white/60">
              Entry Type
              <select
                className="field mt-1 w-full"
                value={entryType}
                onChange={(event) => setEntryType(event.target.value)}
              >
                <option value="manual_adjustment">Manual adjustment</option>
                <option value="bet_win">Bet win</option>
                <option value="bet_loss">Bet loss</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </label>
            <label className="text-xs text-white/60">
              Note
              <input
                className="field mt-1 w-full"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional context"
              />
            </label>
            <button
              type="submit"
              className="mt-1 rounded-lg border border-accentBlue/40 bg-accentBlue/15 px-3 py-2 text-sm font-semibold text-accentBlue hover:bg-accentBlue/25"
            >
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
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
