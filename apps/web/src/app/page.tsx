"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
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
import { AIPicksPanel } from "@/components/dashboard/AIPicksPanel";
import { EvTable } from "@/components/dashboard/EvTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LiveGamesTable } from "@/components/dashboard/LiveGamesTable";
import { LiveInsightsPanel } from "@/components/dashboard/LiveInsightsPanel";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { OddsComparisonTable } from "@/components/dashboard/OddsComparisonTable";
import { PlayerPropsPanel } from "@/components/dashboard/PlayerPropsPanel";
import { SharpMoneyTable } from "@/components/dashboard/SharpMoneyTable";
import { OpportunityHighlights } from "@/components/dashboard/OpportunityHighlights";
import { OpportunityHeatmap } from "@/components/dashboard/OpportunityHeatmap";
import { TopOpportunitiesFeed } from "@/components/dashboard/TopOpportunitiesFeed";
import { useDashboardData } from "@/hooks/useDashboardData";
import { fetcher } from "@/lib/api";

const sportLabels: Record<string, string> = {
  basketball_nba: "NBA",
  basketball_wnba: "WNBA",
  baseball_mlb: "MLB",
  icehockey_nhl: "NHL",
  americanfootball_nfl: "NFL",
  basketball_ncaab: "NCAABB",
  basketball_euroleague: "EuroLeague",
  soccer_epl: "Soccer EPL",
  soccer_fifa_world_cup: "Soccer World Cup",
  tennis_atp_italian_open: "Tennis ATP Rome",
  tennis_wta_italian_open: "Tennis WTA Rome",
  golf_pga_tour: "PGA Tour",
  boxing_boxing: "Boxing"
};

const tabs = ["dashboard", "ev", "sharp", "backtest", "bankroll", "chat"] as const;
type TabKey = (typeof tabs)[number];

export default function HomePage() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string>(new Date().toISOString());
  const [leanMode, setLeanMode] = useState<"strict" | "leans">("leans");
  const [riskFilter, setRiskFilter] = useState<"all" | "Low" | "Medium" | "High">("all");
  const [minOpportunityScore, setMinOpportunityScore] = useState<number>(55);
  const [liveOnly, setLiveOnly] = useState<boolean>(false);

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
    aiPicksQuery,
    notificationsQuery,
    playerPropsQuery,
    liveInsightsQuery,
    opportunitiesQuery,
    kpis,
    triggerSync,
    runBacktest,
    sendChat,
    addBankrollEntry
  } = useDashboardData();

  const availableSports = useMemo(() => {
    const keys = statusQuery.data?.supportedSports?.length
      ? statusQuery.data.supportedSports
      : Object.keys(sportLabels);
    return [{ key: "all", label: "All Sports Auto Scan" }, ...keys.map((key) => ({
      key,
      label: sportLabels[key] ?? key.replaceAll("_", " ").toUpperCase()
    }))];
  }, [statusQuery.data?.supportedSports]);

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

  const tickerItems = useMemo(() => {
    const base = (opportunitiesQuery.data ?? []).slice(0, 8).map((item) => {
      const oddsText =
        item.odds === null ? "n/a" : item.odds > 0 ? `+${item.odds}` : `${item.odds}`;
      return `${item.league} ${item.pick} ${oddsText} | EV ${item.evPct.toFixed(2)}% | Score ${item.opportunityScore.toFixed(1)}`;
    });
    return base.length ? [...base, ...base] : [];
  }, [opportunitiesQuery.data]);

  const filteredOpportunities = useMemo(() => {
    const rows = opportunitiesQuery.data ?? [];
    return rows.filter((item) => {
      const riskOk = riskFilter === "all" ? true : item.risk === riskFilter;
      const scoreOk = item.opportunityScore >= minOpportunityScore;
      const liveOk = liveOnly ? item.timeToStartMins <= 180 : true;
      const strictOk =
        leanMode === "strict"
          ? item.evPct > 0 && item.edgePct > 1.5 && item.confidence >= 6.2
          : true;
      return riskOk && scoreOk && liveOk && strictOk;
    });
  }, [leanMode, liveOnly, minOpportunityScore, opportunitiesQuery.data, riskFilter]);

  const bestAvailableLeans = useMemo(() => {
    const rows = filteredOpportunities;
    return [...rows]
      .sort((a, b) => b.opportunityScore - a.opportunityScore || b.confidence - a.confidence)
      .slice(0, 6);
  }, [filteredOpportunities]);

  const hasNoDataForSport =
    !liveQuery.isLoading &&
    !liveQuery.data?.length &&
    !(evQuery.data ?? []).some((row) => row.sport_key === sportKey) &&
    sportKey !== "all";

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
                {availableSports.map((sport) => (
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
                  {syncMessage} | Updated {new Date(lastSyncAt).toLocaleTimeString()}
                </span>
                <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs text-warning">
                  Predictions are not guaranteed
                </span>
                <span className="live-pulse rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
                  Live odds pulse
                </span>
                <button
                  onClick={async () => {
                    await triggerSync();
                    setLastSyncAt(new Date().toISOString());
                  }}
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

          <section className="overflow-hidden rounded-xl border border-accentBlue/25 bg-panelSoft/60 p-2">
            {tickerItems.length ? (
              <div className="opportunity-ticker-track">
                {tickerItems.map((line, index) => (
                  <span
                    key={`${line}-${index}`}
                    className="rounded-lg border border-white/15 bg-bg px-3 py-1 text-xs text-white/80"
                  >
                    {line}
                  </span>
                ))}
              </div>
            ) : (
              <p className="px-2 py-1 text-xs text-white/60">
                Opportunity ticker waiting for live market sync.
              </p>
            )}
          </section>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <KpiCard label="Live Games" value={`${kpis.liveGames}`} hint="Upcoming + live events" />
            <KpiCard label="+EV Bets" value={`${kpis.evBets}`} hint="Threshold qualified spots" />
            <KpiCard label="Strong AI Picks" value={`${kpis.strongPicks}`} hint="High-conviction spots" />
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

              <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-white/85">
                    Opportunity Controls
                  </h3>
                  <p className="text-xs text-white/60">
                    Tune feed like a trading terminal. Strict mode only shows high-quality +EV spots.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label className="grid gap-1 text-xs text-white/60">
                    <span>Feed Mode</span>
                    <select
                      value={leanMode}
                      onChange={(event) => setLeanMode(event.target.value as "strict" | "leans")}
                      className="field"
                    >
                      <option value="leans">Best Available Leans</option>
                      <option value="strict">Strict +EV Only</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs text-white/60">
                    <span>Risk Filter</span>
                    <select
                      value={riskFilter}
                      onChange={(event) =>
                        setRiskFilter(event.target.value as "all" | "Low" | "Medium" | "High")
                      }
                      className="field"
                    >
                      <option value="all">All Risk Levels</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs text-white/60">
                    <span>Min Opportunity Score ({minOpportunityScore})</span>
                    <input
                      type="range"
                      min={40}
                      max={90}
                      step={1}
                      value={minOpportunityScore}
                      onChange={(event) => setMinOpportunityScore(Number(event.target.value))}
                    />
                  </label>
                  <label className="flex items-end gap-2 text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={liveOnly}
                      onChange={(event) => setLiveOnly(event.target.checked)}
                    />
                    <span>Live/Near-Live only (next 3h)</span>
                  </label>
                </div>
              </section>

              <TopOpportunitiesFeed items={filteredOpportunities} />
              <OpportunityHighlights items={filteredOpportunities} />
              <OpportunityHeatmap items={filteredOpportunities} />
              <BestAvailableLeansPanel items={bestAvailableLeans} />

              {hasNoDataForSport ? (
                <section className="rounded-xl border border-warning/35 bg-warning/10 p-3 text-sm text-warning">
                  No synced data for <strong>{sportLabels[sportKey] ?? sportKey}</strong>. Run{" "}
                  <strong>Sync now</strong> for this sport or switch to a populated sport.
                </section>
              ) : null}

              <div className="grid gap-3 xl:grid-cols-2">
                <AIPicksPanel picks={aiPicksQuery.data ?? []} />
                <NotificationsPanel items={notificationsQuery.data ?? []} />
              </div>

              <div className="grid gap-3 xl:grid-cols-2">
                <LiveInsightsPanel rows={liveInsightsQuery.data ?? []} />
                <PlayerPropsPanel rows={playerPropsQuery.data ?? []} />
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
  icon: ComponentType<{ className?: string }>;
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
  icon: ComponentType<{ className?: string }>;
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

function BestAvailableLeansPanel({
  items
}: {
  items: Array<{
    id: string;
    league: string;
    matchup: string;
    pick: string;
    evPct: number;
    confidence: number;
    opportunityScore: number;
    risk: "Low" | "Medium" | "High";
    reason: string;
  }>;
}) {
  return (
    <section className="rounded-2xl border border-accentBlue/30 bg-accentBlue/10 p-4 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
          Best Available Leans
        </h3>
        <span className="rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[11px] text-warning">
          Not guaranteed - stake small
        </span>
      </div>
      <p className="mt-1 text-xs text-white/70">
        This list appears when strict +EV filters are thin. These are model-lean ideas, not strong
        official plays.
      </p>

      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="rounded-lg border border-white/15 bg-bg p-3">
              <p className="text-sm font-semibold text-white">{item.pick}</p>
              <p className="mt-0.5 text-xs text-white/60">
                {item.league} - {item.matchup}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">
                  Score {item.opportunityScore.toFixed(1)}
                </span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">
                  EV {item.evPct.toFixed(2)}%
                </span>
                <span className="rounded bg-white/10 px-2 py-1 text-white/80">
                  Conf {item.confidence.toFixed(1)}/10
                </span>
                <span
                  className={`rounded px-2 py-1 ${
                    item.risk === "Low"
                      ? "bg-accent/15 text-accent"
                      : item.risk === "Medium"
                        ? "bg-warning/15 text-warning"
                        : "bg-danger/15 text-danger"
                  }`}
                >
                  Risk {item.risk}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/70">{item.reason}</p>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-white/25 bg-bg p-3 text-xs text-white/60 md:col-span-2 xl:col-span-3">
            No lean candidates yet. Sync data and try again in a few minutes.
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-warning">
        Responsible betting: never chase losses; limit exposure to 1-3% bankroll per position.
      </p>
    </section>
  );
}
