"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { io } from "socket.io-client";
import { API_BASE, fetcher, postJson } from "@/lib/api";
import type {
  AIPick,
  BacktestResult,
  BankrollSummary,
  ChatAnswer,
  ChatMessage,
  DashboardStatus,
  EvBet,
  LiveGame,
  LiveInsight,
  NotificationItem,
  OddsComparisonRow,
  PlayerPropInsight,
  SharpSignal
} from "@/types";

export function useDashboardData() {
  const [sportKey, setSportKey] = useState<string>("basketball_nba");
  const [syncMessage, setSyncMessage] = useState<string>("Connected");
  const [sessionId, setSessionId] = useState<string>("default-session");

  const liveQuery = useSWR<LiveGame[]>(`/api/v1/live-games?sportKey=${sportKey}`, fetcher, {
    refreshInterval: 30000
  });
  const evQuery = useSWR<EvBet[]>("/api/v1/ev-bets?minEdge=2&minConfidence=6", fetcher, {
    refreshInterval: 45000
  });
  const statusQuery = useSWR<DashboardStatus>("/api/v1/status", fetcher, {
    refreshInterval: 60000
  });
  const sharpQuery = useSWR<SharpSignal[]>(`/api/v1/sharp-money?sportKey=${sportKey}`, fetcher, {
    refreshInterval: 45000
  });
  const oddsCompareQuery = useSWR<OddsComparisonRow[]>(
    liveQuery.data?.[0]?.eventId ? `/api/v1/odds-comparison?eventId=${liveQuery.data[0].eventId}` : null,
    fetcher,
    { refreshInterval: 60000 }
  );
  const bankrollQuery = useSWR<BankrollSummary>("/api/v1/bankroll?userId=default", fetcher, {
    refreshInterval: 45000
  });
  const chatHistoryQuery = useSWR<ChatMessage[]>(
    `/api/v1/chat/history?sessionId=${encodeURIComponent(sessionId)}&limit=80`,
    fetcher,
    {
      refreshInterval: 0
    }
  );
  const aiPicksQuery = useSWR<AIPick[]>(`/api/v1/ai-picks?sportKey=${sportKey}`, fetcher, {
    refreshInterval: 30000
  });
  const notificationsQuery = useSWR<NotificationItem[]>("/api/v1/notifications", fetcher, {
    refreshInterval: 30000
  });
  const playerPropsQuery = useSWR<PlayerPropInsight[]>(
    `/api/v1/player-props?sportKey=${sportKey}`,
    fetcher,
    { refreshInterval: 60000 }
  );
  const liveInsightsQuery = useSWR<LiveInsight[]>(
    `/api/v1/live-insights?sportKey=${sportKey}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket"] });
    socket.on("sync:tick", (payload) =>
      setSyncMessage(
        `Live sync ${payload.eventsSynced} events @ ${new Date(payload.at).toLocaleTimeString()}`
      )
    );
    socket.on("sync:error", (payload) =>
      setSyncMessage(`Live API sync failed. Showing cached data. (${payload.message})`)
    );
    socket.on("sync:complete", (payload) =>
      setSyncMessage(`Manual sync complete - ${payload.eventsSynced} events`)
    );
    return () => socket.disconnect();
  }, []);

  const kpis = useMemo(() => {
    const bets = evQuery.data ?? [];
    const live = liveQuery.data ?? [];
    const topEdge = bets.length
      ? Math.max(...bets.map((bet) => Number(bet.edge_pct || 0)))
      : 0;
    const avgConfidence = bets.length
      ? bets.reduce((sum, row) => sum + Number(row.confidence || 0), 0) / bets.length
      : 0;
    const sharpSignals =
      (sharpQuery.data ?? []).filter((row) => row.sharpSignal || row.steamMove).length ?? 0;
    const strongPicks =
      (aiPicksQuery.data ?? []).filter((row) => row.recommendation === "Strong Bet").length ?? 0;
    return {
      liveGames: live.length,
      evBets: bets.length,
      avgConfidence,
      topEdge,
      sharpSignals,
      strongPicks
    };
  }, [aiPicksQuery.data, evQuery.data, liveQuery.data, sharpQuery.data]);

  async function triggerSync() {
    const response = await postJson<{ eventsSynced: number; predictions: number; errors?: Array<{ sportKey: string; message: string }> }>(
      `/api/v1/sync?sportKey=${encodeURIComponent(sportKey)}`,
      { sportKey }
    );
    await Promise.all([
      liveQuery.mutate(),
      evQuery.mutate(),
      sharpQuery.mutate(),
      oddsCompareQuery.mutate(),
      aiPicksQuery.mutate(),
      playerPropsQuery.mutate(),
      liveInsightsQuery.mutate(),
      notificationsQuery.mutate()
    ]);
    if (response.errors?.length) {
      setSyncMessage(
        `Sync partial: ${response.eventsSynced} events / ${response.predictions} preds (${response.errors.length} sport errors)`
      );
    } else {
      setSyncMessage(
        `Manual sync complete - ${response.eventsSynced} events / ${response.predictions} predictions`
      );
    }
  }

  async function runBacktest(params: {
    from: string;
    to: string;
    minEdge: number;
    minConfidence?: number;
    startingBankroll?: number;
  }) {
    return postJson<BacktestResult>("/api/v1/backtest", {
      strategyName: "+EV only",
      ...params
    });
  }

  async function sendChat(message: string) {
    const payload = await postJson<ChatAnswer>("/api/v1/chat", {
      sessionId,
      userId: "default",
      message
    });
    setSessionId(payload.sessionId);
    await chatHistoryQuery.mutate();
    return payload;
  }

  async function addBankrollEntry(input: {
    amount: number;
    entryType: string;
    note?: string;
  }) {
    await postJson("/api/v1/bankroll", {
      userId: "default",
      ...input
    });
    await bankrollQuery.mutate();
  }

  return {
    sportKey,
    setSportKey,
    syncMessage,
    sessionId,
    setSessionId,
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
    kpis,
    triggerSync,
    runBacktest,
    sendChat,
    addBankrollEntry
  };
}
