"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { io } from "socket.io-client";
import { API_BASE, fetcher, postJson } from "@/lib/api";
import type { BacktestResult, EvBet, LiveGame } from "@/types";

export function useDashboardData() {
  const [sportKey, setSportKey] = useState<string>("basketball_nba");
  const [syncMessage, setSyncMessage] = useState<string>("Connected");

  const liveQuery = useSWR<LiveGame[]>(`/api/v1/live-games?sportKey=${sportKey}`, fetcher, {
    refreshInterval: 30000
  });
  const evQuery = useSWR<EvBet[]>("/api/v1/ev-bets?minEdge=2&minConfidence=6", fetcher, {
    refreshInterval: 45000
  });
  const statusQuery = useSWR<{ warnings?: string[]; supportedSports?: string[] }>("/api/v1/status", fetcher, {
    refreshInterval: 60000
  });

  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket"] });
    socket.on("sync:tick", (payload) => setSyncMessage(`Live sync ${payload.eventsSynced} events @ ${new Date(payload.at).toLocaleTimeString()}`));
    socket.on("sync:error", (payload) => setSyncMessage(`Live data unavailable - showing latest update (${payload.message})`));
    socket.on("sync:complete", (payload) => setSyncMessage(`Manual sync complete - ${payload.eventsSynced} events`));
    return () => socket.disconnect();
  }, []);

  const kpis = useMemo(() => {
    const bets = evQuery.data ?? [];
    const live = liveQuery.data ?? [];
    const topEdge = bets.length ? Math.max(...bets.map((bet) => Number(bet.edge_pct || 0))) : 0;
    const avgConfidence = bets.length ? bets.reduce((sum, row) => sum + Number(row.confidence || 0), 0) / bets.length : 0;
    return {
      liveGames: live.length,
      evBets: bets.length,
      avgConfidence,
      topEdge
    };
  }, [evQuery.data, liveQuery.data]);

  async function triggerSync() {
    const response = await postJson<{ eventsSynced: number; predictions: number }>("/api/v1/sync", {});
    liveQuery.mutate();
    evQuery.mutate();
    setSyncMessage(`Manual sync complete - ${response.eventsSynced} events / ${response.predictions} predictions`);
  }

  async function runBacktest(params: { from: string; to: string; minEdge: number }) {
    return postJson<BacktestResult>("/api/v1/backtest", {
      strategyName: "+EV only",
      ...params
    });
  }

  return {
    sportKey,
    setSportKey,
    syncMessage,
    liveQuery,
    evQuery,
    statusQuery,
    kpis,
    triggerSync,
    runBacktest
  };
}
