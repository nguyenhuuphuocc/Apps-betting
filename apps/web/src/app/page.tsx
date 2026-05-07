"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  Bot,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  RefreshCw,
  ShieldAlert,
  Target,
  TrendingUp
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import useSWR from "swr";
import { BacktestPanel } from "@/components/dashboard/BacktestPanel";
import { BankrollPanel } from "@/components/dashboard/BankrollPanel";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { EvTable } from "@/components/dashboard/EvTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LiveGamesTable } from "@/components/dashboard/LiveGamesTable";
import { OddsComparisonTable } from "@/components/dashboard/OddsComparisonTable";
import { SharpMoneyTable } from "@/components/dashboard/SharpMoneyTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { fetcher } from "@/lib/api";

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

const tabs = ["dashboard", "ev", "sharp", "backtest", "bankroll", "chat"] as const;
type TabKey = (typeof tabs)[number];

export default function HomePage() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const selectTab = (next: TabKey) => {
    setTab(next);
    window.location.hash = next;
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (tabs.includes(hash as TabKey)) {
      setTab(hash as TabKey);
    }
  }, []);

  const {
    sportKey,
    setSportKey,
    syncMessage,
    liveQuery,
    evQuery,
    statusQuery,
    sharpQuery,
    oddsCompareQuery,
    bankrollQuery,
    chatHistoryQuery,
    kpis,
    triggerSync,
    runBacktest,
    sendChat,
    addBankrollEntry
  } = useDashboardData();

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

  const topPlays = useMemo(
    () =>
      [...(evQuery.data ?? [])]
        .filter((row) => Number(row.ev_pct) > 0 && Number(row.confidence) >= 6)
        .sort((a, b) => Number(b.edge_pct) - Number(a.edge_pct))
        .slice(0, 3),
    [evQuery.data]
  );

  const watchlist = useMemo(
    () =>
      [...(evQuery.data ?? [])]
        .filter(
          (row) =>
            Number(row.ev_pct) > -1 &&
            Number(row.ev_pct) <= 0 &&
            Number(row.confidence) >= 5.5
        )
        .slice(0, 3),
    [evQuery.data]
  );

  const avoid = useMemo(
    () =>
      [...(evQuery.data ?? [])]
        .filter((row) => Number(row.ev_pct) < 0 || Number(row.confidence) < 5.5)
        .slice(0, 3),
    [evQuery.data]
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1800px] p-3 lg:p-6">
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <aside
          className={`rounded-2xl border border-white/10 bg-panel p-3 shadow-panel transition-all duration-300 ${
            collapsed ? "w-[78px]" : "w-[220px]"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="grid place-items-center rounded-xl bg-panelSoft p-3 text-accent">
              <Target className="h-6 w-6" />
            </div>
            <button
              className="rounded-lg border border-white/15 bg-bg p-1.5 text-white/70 hover:border-accent/40 hover:text-accent"
              onClick={() => setCollapsed((v) => !v)}
              type="button"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <p className={`mb-3 text-xs uppercase tracking-widest text-white/55 ${collapsed ? "hidden" : "block"}`}>
            Multi-Sport
          </p>

          <nav className="grid gap-2">
            <NavBtn icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} active={tab === "dashboard"} onClick={() => selectTab("dashboard")} />
            <NavBtn icon={TrendingUp} label="EV Scanner" collapsed={collapsed} active={tab === "ev"} onClick={() => selectTab("ev")} />
            <NavBtn icon={Activity} label="Sharp Money" collapsed={collapsed} active={tab === "sharp"} onClick={() => selectTab("sharp")} />
            <NavBtn icon={ChartNoAxesCombined} label="Backtest" collapsed={collapsed} active={tab === "backtest"} onClick={() => selectTab("backtest")} />
            <NavBtn icon={DollarSign} label="Bankroll" collapsed={collapsed} active={tab === "bankroll"} onClick={() => selectTab("bankroll")} />
            <NavBtn icon={Bot} label="BetIQ Chat" collapsed={collapsed} active={tab === "chat"} onClick={() => selectTab("chat")} />
          </nav>

          {!collapsed ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-bg p-3">
              <p className="text-xs text-white/60">Sport Filter</p>
              <select
                value={sportKey}
                onChange={(event) => setSportKey(event.target.value)}
                className="field mt-2 w-full"
              >
                {sports.map((sport) => (
                  <option key={sport.key} value={sport.key}>
                    {sport.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </aside>

        <section className="space-y-4">
          <header className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                  AI-Powered Sports Betting Intelligence
                </p>
                <h1 className="mt-2 text-2xl font-bold text-white lg:text-4xl">
                  Professional Betting Analytics Terminal
                </h1>
                <p className="mt-2 text-xs text-white/50">
                  Analyze odds, line movement, sharp signals, and expected value with disciplined risk controls.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-bg px-3 py-1 text-xs text-white/70">
                  {syncMessage}
                </span>
                <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs text-warning">
                  Predictions are not guaranteed
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

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <Badge icon={Bell} text="Live sync active" tone="blue" />
              <Badge icon={ShieldAlert} text="No bet if no edge exists" tone="yellow" />
              <Link
                href="/landing"
                className="rounded-full border border-white/20 bg-bg px-3 py-1 text-white/70 hover:border-accent/40 hover:text-accent"
              >
                Marketing Page
              </Link>
              <Link
                href="/settings"
                className="rounded-full border border-white/20 bg-bg px-3 py-1 text-white/70 hover:border-accentBlue/40 hover:text-accentBlue"
              >
                Settings
              </Link>
              <Link
                href="/responsible-gambling"
                className="rounded-full border border-white/20 bg-bg px-3 py-1 text-white/70 hover:border-warning/40 hover:text-warning"
              >
                Responsible Betting
              </Link>
            </div>
          </header>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <KpiCard label="Live Games" value={`${kpis.liveGames}`} hint="Upcoming + live events" />
            <KpiCard label="+EV Bets" value={`${kpis.evBets}`} hint="Threshold qualified spots" />
            <KpiCard label="Sharp Signals" value={`${kpis.sharpSignals}`} hint="Steam/RLM detections" />
            <KpiCard label="Avg Confidence" value={`${kpis.avgConfidence.toFixed(2)}/10`} hint="Model conviction" />
            <KpiCard label="Top Edge" value={`${kpis.topEdge.toFixed(2)}%`} hint="Best model-vs-market gap" />
          </div>

          {tab === "dashboard" ? (
            <div className="grid gap-3">
              <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
                <LiveGamesTable games={liveQuery.data ?? []} />

                <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
                    Line Movement
                  </h3>
                  <div className="h-[275px] rounded-xl border border-white/10 bg-bg p-3">
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
                    Watch for reverse moves near tip-off. If edge disappears, pass the bet.
                  </p>
                </section>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <MiniBoard title="Top Plays Today" tone="green" items={topPlays.map((row) => `${row.pick} | EV ${Number(row.ev_pct).toFixed(2)}% | ${Number(row.confidence).toFixed(1)}/10`)} empty="NO BET: no high-quality +EV setup currently." />
                <MiniBoard title="Watchlist Bets" tone="yellow" items={watchlist.map((row) => `${row.pick} | EV ${Number(row.ev_pct).toFixed(2)}%`)} empty="No watchlist candidates right now." />
                <MiniBoard title="Avoid / Trap Bets" tone="red" items={avoid.map((row) => `${row.pick} | EV ${Number(row.ev_pct).toFixed(2)}%`)} empty="No obvious trap signal for current filter." />
              </div>

              <OddsComparisonTable rows={oddsCompareQuery.data ?? []} />
            </div>
          ) : null}

          {tab === "ev" ? <EvTable bets={evQuery.data ?? []} /> : null}
          {tab === "sharp" ? <SharpMoneyTable rows={sharpQuery.data ?? []} /> : null}
          {tab === "backtest" ? <BacktestPanel onRun={runBacktest} /> : null}
          {tab === "bankroll" ? (
            <BankrollPanel data={bankrollQuery.data} onAddEntry={addBankrollEntry} />
          ) : null}
          {tab === "chat" ? (
            <ChatPanel history={chatHistoryQuery.data ?? []} onAsk={sendChat} />
          ) : null}

          <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">System Status</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <StatusCard
                title="API Health"
                value={statusQuery.error ? "Degraded" : "Operational"}
              />
              <StatusCard
                title="Warnings"
                value={statusQuery.data?.warnings?.join(", ") || "None"}
              />
              <StatusCard
                title="Sports Loaded"
                value={`${statusQuery.data?.supportedSports?.length ?? 0}`}
              />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function NavBtn({
  icon: Icon,
  label,
  collapsed,
  active,
  onClick
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
        active
          ? "border-accent/40 bg-accent/15 text-accent"
          : "border-white/10 bg-bg text-white/70 hover:border-accentBlue/35 hover:text-accentBlue"
      }`}
    >
      <Icon className="h-4 w-4" />
      {!collapsed ? <span>{label}</span> : null}
    </button>
  );
}

function MiniBoard({
  title,
  tone,
  items,
  empty
}: {
  title: string;
  tone: "green" | "yellow" | "red";
  items: string[];
  empty: string;
}) {
  const toneClass =
    tone === "green"
      ? "border-accent/25 bg-accent/5"
      : tone === "yellow"
        ? "border-warning/25 bg-warning/5"
        : "border-danger/25 bg-danger/5";

  return (
    <section className={`rounded-2xl border ${toneClass} p-3`}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-2 grid gap-2">
        {items.length ? (
          items.map((item) => (
            <p key={item} className="rounded-lg border border-white/10 bg-bg px-2 py-2 text-xs text-white/80">
              {item}
            </p>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-white/20 bg-bg px-2 py-3 text-xs text-white/60">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}

function Badge({
  icon: Icon,
  text,
  tone
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  tone: "blue" | "yellow";
}) {
  const toneClass =
    tone === "blue"
      ? "border-accentBlue/40 bg-accentBlue/10 text-accentBlue"
      : "border-warning/40 bg-warning/10 text-warning";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${toneClass}`}>
      <Icon className="h-3 w-3" />
      {text}
    </span>
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
