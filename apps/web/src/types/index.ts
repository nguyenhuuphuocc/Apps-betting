export type LiveGame = {
  eventId: string;
  sportKey: string;
  league: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  status: "scheduled" | "live" | "final" | string;
  bestOdds?: {
    sportsbook?: string;
    home_price?: number;
    away_price?: number;
    homePrice?: number;
    awayPrice?: number;
  } | null;
  movement?: {
    movementPct: number;
    reverseLineMovement: boolean;
    steamMove: boolean;
    sharpSignal: boolean;
  };
};

export type EvBet = {
  id: number;
  event_id: string;
  market_type: string;
  pick: string;
  model_probability: number;
  implied_probability: number;
  edge_pct: number;
  ev_pct: number;
  confidence: number;
  risk_level: "Low" | "Medium" | "High";
  suggested_units: number;
  league?: string;
  sport_key?: string;
  reason?: string;
};

export type BacktestResult = {
  id: number;
  strategy_name: string;
  total_bets: number;
  wins: number;
  losses: number;
  pushes: number;
  roi_pct: number;
  win_rate_pct: number;
  units: number;
  payload: {
    curve: Array<{ t: string; bankroll: number; outcome: string; edge: number }>;
    betLogs?: Array<{
      t: string;
      pick: string;
      stake: number;
      pnl: number;
      confidence: number;
      evPct: number;
      outcome: string;
    }>;
    minEdge: number;
    minConfidence?: number;
    startingBankroll?: number;
    endingBankroll?: number;
    maxDrawdownPct?: number;
    longestWinStreak?: number;
    longestLosingStreak?: number;
    brierScore?: number | null;
  };
};

export type SharpSignal = {
  eventId: string;
  matchup: string;
  league: string;
  sportKey: string;
  movementPct: number;
  reverseLineMovement: boolean;
  steamMove: boolean;
  sharpSignal: boolean;
};

export type OddsComparisonRow = {
  sportsbook: string;
  moneylineHome: number | null;
  moneylineAway: number | null;
  spread: number | null;
  total: number | null;
  bestHome: boolean;
  bestAway: boolean;
};

export type BankrollSummary = {
  entries: Array<{
    t: string;
    balance: number;
    amount: number;
    type: string;
  }>;
  summary: {
    currentBankroll: number;
    maxDrawdownPct: number;
    winRatePct: number;
    roiPct: number;
  };
};

export type ChatAnswer = {
  sessionId: string;
  question: string;
  answer: string;
  meta: {
    quickVerdict: string;
    confidenceScore: number;
    modelProbability: number;
    impliedProbability: number;
    edge: number;
    evPct: number;
    risk: string;
    recommendedUnits: number;
  };
};

export type ChatMessage = {
  id: number | string;
  role: "user" | "assistant" | string;
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type DashboardStatus = {
  warnings?: string[];
  supportedSports?: string[];
};

export type AIPick = {
  id: string;
  eventId: string;
  matchup: string;
  league: string;
  sportKey: string;
  pick: string;
  recommendation: "Strong Bet" | "Lean" | "Avoid" | "Sharp Play";
  confidence: number;
  edgePct: number;
  evPct: number;
  impliedProbability: number;
  modelProbability: number;
  risk: "Low" | "Medium" | "High";
  explanation: string;
};

export type NotificationItem = {
  id: string;
  level: "info" | "warning" | "success";
  title: string;
  body: string;
  createdAt: string;
};

export type PlayerPropInsight = {
  id: string;
  player: string;
  team: string;
  opponent: string;
  market: string;
  line: number;
  projection: number;
  confidence: number;
  lean: "Over" | "Under";
  hitRate: number;
  reason: string;
};

export type LiveInsight = {
  eventId: string;
  matchup: string;
  status: string;
  liveWinProbabilityHome: number;
  momentum: "Home" | "Away" | "Neutral";
  paceFactor: number;
  shootingDelta: number;
  opportunity: string;
};
