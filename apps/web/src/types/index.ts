export type LiveGame = {
  eventId: string;
  sportKey: string;
  league: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  bestOdds?: {
    sportsbook?: string;
    home_price?: number;
    away_price?: number;
  } | null;
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
  league: string;
  sport_key: string;
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
    minEdge: number;
  };
};
