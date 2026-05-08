import Link from "next/link";
import { ArrowRight, Bot, ShieldAlert, TrendingUp } from "lucide-react";

const features = [
  {
    title: "Live Odds + Line Movement",
    text: "Track opening vs current numbers, detect steam and reverse movement, and shop best prices."
  },
  {
    title: "+EV Intelligence",
    text: "Compare model probability vs market implied probability with edge and EV scoring."
  },
  {
    title: "BetIQ AI Analyst",
    text: "Ask natural-language betting questions and get structured, risk-aware analysis."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(76,201,255,0.2),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(57,255,136,0.18),transparent_38%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Multi-Sport Analytics SaaS</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight lg:text-6xl">
            AI-Powered Sports Betting Intelligence
          </h1>
          <p className="mt-4 max-w-3xl text-white/75 lg:text-lg">
            Analyze odds, compare lines, track sharp money, backtest strategies, and ask an AI betting analyst before placing a bet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 font-semibold text-accent hover:bg-accent/25"
            >
              View Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-accentBlue/40 bg-accentBlue/15 px-4 py-2 font-semibold text-accentBlue hover:bg-accentBlue/25"
            >
              Ask AI Analyst <Bot className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-5 inline-flex items-center gap-1 rounded-full border border-warning/35 bg-warning/10 px-3 py-1 text-xs text-warning">
            <ShieldAlert className="h-3 w-3" /> Predictions are not guaranteed. Bet responsibly.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-xl border border-white/10 bg-panel p-4 shadow-panel">
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm text-white/70">{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-white/10 bg-panel p-6">
          <h3 className="text-2xl font-semibold">Built for disciplined, long-term decision making</h3>
          <ul className="mt-4 grid gap-2 text-sm text-white/75 md:grid-cols-2">
            <li className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Positive-EV scanner with confidence and risk labels</li>
            <li className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Backtesting engine with drawdown and bankroll curve</li>
            <li className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Bankroll tracker and exposure controls</li>
            <li className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Multi-sport support: NBA, WNBA, MLB, NHL, NFL, NCAABB, EuroLeague, Soccer, Tennis, Golf, Boxing</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
