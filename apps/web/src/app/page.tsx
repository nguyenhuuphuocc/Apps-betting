"use client";

import { useMemo } from "react";
import {
  Bell,
  ChartNoAxesCombined,
  DollarSign,
  Home,
  RefreshCw,
  Settings,
  ShieldCheck,
  Target
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import useSWR from "swr";
import { BacktestPanel } from "@/components/dashboard/BacktestPanel";
import { EvTable } from "@/components/dashboard/EvTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LiveGamesTable } from "@/components/dashboard/LiveGamesTable";
import { fetcher } from "@/lib/api";
import { useDashboardData } from "@/hooks/useDashboardData";

const sports = [
  { key: "basketball_nba", label: "NBA" },
  { key: "basketball_wnba", label: "WNBA" },
  { key: "baseball_mlb", label: "MLB" },
  { key: "icehockey_nhl", label: "NHL" },
  { key: "americanfootball_nfl", label: "NFL" },
  { key: "basketball_ncaab", label: "NCAABB" },
  { key: "basketball_euroleague", label: "EuroLeague" },
  { key: "soccer_epl", label: "Soccer" },
  { key: "tennis_atp_italian_open", label: "Tennis" },
  { key: "golf_pga_tour", label: "Golf" },
  { key: "boxing_boxing", label: "Boxing" }
];

export default function HomePage() {
  const { sportKey, setSportKey, syncMessage, liveQuery, evQuery, statusQuery, kpis, triggerSync, runBacktest } =
    useDashboardData();

  const selectedEvent = liveQuery.data?.[0]?.eventId;
  const lineQuery = useSWR(
    selectedEvent ? `/api/v1/line-movement/${selectedEvent}` : null,
    fetcher
  );

  const lineData = useMemo(() => {
    const rows = (lineQuery.data as Array<{ capturedAt: string; homePrice: number }> | undefined) ?? [];
    return rows.slice(-30).map((row) => ({
      time: new Date(row.capturedAt).toLocaleTimeString(),
      homePrice: Number(row.homePrice ?? 0)
    }));
  }, [lineQuery.data]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1800px] p-4 lg:p-6">
      <div className="grid gap-4 lg:grid-cols-[88px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-panel p-3 shadow-panel">
          <div className="mb-4 grid place-items-center rounded-xl bg-panelSoft p-3 text-accent">
            <Target className="h-6 w-6" />
          </div>
          <nav className="grid gap-2">
            {[Home, ChartNoAxesCombined, DollarSign, Bell, ShieldCheck, Settings].map((Icon, idx) => (
              <button
                className="grid h-11 place-items-center rounded-lg border border-white/10 bg-bg text-white/70 hover:border-accent/50 hover:text-accent"
                key={idx}
                type="button"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-4">
          <header className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                  Professional Sports Betting Analytics Platform
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
                  Live +EV Intelligence Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/15 bg-bg px-3 py-1 text-xs text-white/70">
                  {syncMessage}
                </span>
                <button
                  onClick={triggerSync}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/25"
                >
                  <RefreshCw className="h-4 w-4" /> Sync now
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/50">
              Predictions are not guaranteed. Bet responsibly. No bet if no edge exists.
            </p>
          </header>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Live Games" value={`${kpis.liveGames}`} hint="Upcoming + in-play events" />
            <KpiCard label="+EV Bets" value={`${kpis.evBets}`} hint="Filtered by confidence and edge" />
            <KpiCard label="Avg Confidence" value={`${kpis.avgConfidence.toFixed(2)}/10`} hint="Model confidence score" />
            <KpiCard label="Top Edge" value={`${kpis.topEdge.toFixed(2)}%`} hint="Best model-vs-market gap" />
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
            <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">Live Games Panel</h2>
                <select
                  value={sportKey}
                  onChange={(event) => setSportKey(event.target.value)}
                  className="rounded-lg border border-white/15 bg-bg px-3 py-2 text-sm text-white"
                >
                  {sports.map((sport) => (
                    <option key={sport.key} value={sport.key}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>
              <LiveGamesTable games={liveQuery.data ?? []} />
            </section>

            <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/80">
                Line Movement Tracker
              </h2>
              <div className="h-[320px] rounded-xl border border-white/10 bg-bg p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="homePrice" stroke="#39ff88" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-white/55">
                Sharp signal: watch for fast reversal in closing price with rising volume.
              </p>
            </section>
          </div>

          <EvTable bets={evQuery.data ?? []} />

          <BacktestPanel onRun={runBacktest} />

          <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">System Status</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <StatusCard title="API Health" value={statusQuery.error ? "Degraded" : "Operational"} />
              <StatusCard title="Warnings" value={statusQuery.data?.warnings?.join(", ") || "None"} />
              <StatusCard title="Sports Loaded" value={`${statusQuery.data?.supportedSports?.length ?? 0}`} />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function StatusCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-bg p-3">
      <p className="text-xs uppercase tracking-wide text-white/60">{title}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </article>
  );
}
