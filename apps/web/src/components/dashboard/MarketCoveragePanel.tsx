type MarketItem = {
  name: string;
  description: string;
  examples?: string[];
};

type SportPropGroup = {
  sport: string;
  props: string[];
};

const coreMarkets: MarketItem[] = [
  { name: "Moneyline (ML)", description: "Bet on who wins the game.", examples: ["Lakers ML -150", "Celtics ML +130"] },
  { name: "Point Spread", description: "Bet on margin of victory.", examples: ["Lakers -5.5", "Celtics +5.5"] },
  { name: "Totals / Over-Under", description: "Bet on combined score.", examples: ["Over 228.5", "Under 228.5"] },
  { name: "Alternate Spread", description: "Adjusted spread for different payout." },
  { name: "Alternate Totals", description: "Adjusted totals for different payout." },
  { name: "Team Totals", description: "Bet one team's score only." },
  { name: "First Half / Second Half", description: "Only that game segment counts." },
  { name: "Quarter / Period Bets", description: "Bet by quarter or period." },
  { name: "Winning Margin", description: "Predict a margin range (1-5, 6-10, etc.)." },
  { name: "Double Chance / Draw No Bet", description: "Soccer-friendly protection markets." },
  { name: "Both Teams to Score (BTTS)", description: "Primarily soccer market." },
  { name: "Correct Score", description: "Predict exact final score." },
  { name: "Parlays / Same Game Parlays", description: "Combine multiple legs into one ticket." },
  { name: "Teasers / Round Robin", description: "Structure lines/combinations across legs." },
  { name: "Futures", description: "Long-horizon markets like title winner, MVP, division." },
  { name: "Live / In-Play", description: "Bet during live action with moving prices." },
  { name: "Arbitrage & +EV", description: "Price inefficiency and expected-value opportunities." },
  { name: "Sharp Money / Steam Moves", description: "Track professional action and line reactions." }
];

const propGroups: SportPropGroup[] = [
  {
    sport: "NBA / WNBA",
    props: [
      "Points, rebounds, assists, steals, blocks, turnovers",
      "PRA / PR / PA / RA combos",
      "3PM, FGM/FGA, FTM/FTA",
      "Double-double, triple-double, first basket, anytime scorer",
      "Quarter/half props and live props"
    ]
  },
  {
    sport: "NFL",
    props: [
      "Passing yards, TDs, completions, attempts, interceptions",
      "Rushing yards/attempts/TDs",
      "Receiving yards/receptions/TDs/longest reception",
      "Defensive props (sacks, tackles, INTs), kicker props, anytime TD"
    ]
  },
  {
    sport: "MLB",
    props: [
      "Batter: hits, total bases, HR, RBI, runs, walks, strikeouts",
      "Pitcher: strikeouts, ER, hits/walks allowed, outs recorded",
      "First inning run, multi-hit game, home run scorer"
    ]
  },
  {
    sport: "NHL",
    props: [
      "Goals, assists, points",
      "Shots on goal, saves, power play points",
      "Anytime scorer"
    ]
  },
  {
    sport: "Soccer",
    props: [
      "Goals, assists, shots, shots on target",
      "Passes, tackles, saves, cards, corners"
    ]
  },
  {
    sport: "UFC / Boxing",
    props: [
      "Fight winner, method of victory",
      "Round winner, goes distance",
      "KO / submission markets"
    ]
  },
  {
    sport: "Tennis (ATP / WTA)",
    props: ["Aces, double faults, sets won, total games, break points"]
  },
  {
    sport: "Golf (PGA)",
    props: ["Winner, round score, birdies, matchups, top-10 finish"]
  },
  {
    sport: "Esports",
    props: ["Kills, assists, maps won, headshots, objectives"]
  }
];

const advancedFeatures = [
  "AI Prop Finder (mispriced props)",
  "Hit-rate analysis (last 5/10/20 and season)",
  "Matchup difficulty and defense-vs-position context",
  "Usage + minutes projection adjustments",
  "Prop correlation engine (e.g., star over + team ML)",
  "Live prop updates with momentum context",
  "Volatility rating and consistency score",
  "Sharp prop tracking and CLV tracking",
  "Best sportsbook odds + +EV scanner + alerts"
];

export function MarketCoveragePanel() {
  return (
    <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Coverage</p>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
            All Betting Markets & Prop Types
          </h3>
        </div>
        <span className="rounded-full border border-warning/35 bg-warning/10 px-3 py-1 text-[11px] text-warning">
          Analysis only • no guaranteed outcomes
        </span>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-bg p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-white/85">
            Main Sportsbook Markets
          </h4>
          <div className="mt-3 grid gap-2">
            {coreMarkets.map((market) => (
              <details key={market.name} className="rounded-lg border border-white/10 bg-panel px-3 py-2">
                <summary className="cursor-pointer text-xs font-semibold text-white/90">{market.name}</summary>
                <p className="mt-2 text-xs text-white/70">{market.description}</p>
                {market.examples?.length ? (
                  <ul className="mt-2 grid gap-1 text-[11px] text-white/60">
                    {market.examples.map((example) => (
                      <li key={example} className="rounded bg-white/5 px-2 py-1">
                        {example}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </details>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-bg p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-white/85">
            Player Prop Universe
          </h4>
          <div className="mt-3 grid gap-2">
            {propGroups.map((group) => (
              <details key={group.sport} className="rounded-lg border border-white/10 bg-panel px-3 py-2">
                <summary className="cursor-pointer text-xs font-semibold text-white/90">{group.sport}</summary>
                <ul className="mt-2 grid gap-1 text-[11px] text-white/70">
                  {group.props.map((prop) => (
                    <li key={prop} className="rounded bg-white/5 px-2 py-1">
                      {prop}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </article>
      </div>

      <article className="mt-3 rounded-xl border border-accentBlue/30 bg-accentBlue/10 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-white/85">
          Advanced Prop Intelligence
        </h4>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {advancedFeatures.map((feature) => (
            <p key={feature} className="rounded border border-white/15 bg-bg px-2 py-1.5 text-[11px] text-white/75">
              {feature}
            </p>
          ))}
        </div>
      </article>
    </section>
  );
}
