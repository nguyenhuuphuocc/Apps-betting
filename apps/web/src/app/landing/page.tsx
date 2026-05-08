import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Radar, ShieldAlert, Target, TrendingUp } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Live Odds Terminal",
    text: "Track opening vs current prices, sharp signals, and best available execution paths."
  },
  {
    icon: Radar,
    title: "AI Opportunity Engine",
    text: "Rank opportunities by EV, confidence, line movement quality, and risk."
  },
  {
    icon: Bot,
    title: "BetIQ AI Analyst",
    text: "Ask natural-language questions and get structured, risk-aware game analysis."
  }
];

const workflow = [
  "Sync live odds and matchup context",
  "Score all markets by EV and confidence",
  "Filter to qualified opportunities",
  "Size risk using disciplined bankroll rules"
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(4,10,22,.9) 10%, rgba(4,10,22,.45) 56%, rgba(4,10,22,.9) 100%), url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(76,201,255,0.25),transparent_42%),radial-gradient(circle_at_78%_14%,rgba(57,255,136,0.18),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
          <nav className="glass-card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/20 text-accent">
                <Target className="h-4 w-4" />
              </span>
              <div>
                <p className="section-label">Multi-Sport</p>
                <p className="text-sm font-semibold">BetIQ Terminal</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link href="/" className="rounded-full border border-white/15 bg-bg px-3 py-1 text-white/75 hover:border-accentBlue/35 hover:text-accentBlue">
                Dashboard
              </Link>
              <Link href="/settings" className="rounded-full border border-white/15 bg-bg px-3 py-1 text-white/75 hover:border-accentBlue/35 hover:text-accentBlue">
                Settings
              </Link>
            </div>
          </nav>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <article className="glass-card p-5 lg:p-8">
              <p className="panel-title">AI-Powered Sports Betting Intelligence</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight lg:text-6xl">
                Professional Betting
                <span className="block text-accentBlue">Analytics Platform</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-white/75 lg:text-base">
                Analyze odds, compare lines, track sharp money, backtest strategies, and ask an AI analyst before taking risk.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg border border-accent/45 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/25"
                >
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg border border-accentBlue/45 bg-accentBlue/15 px-4 py-2 text-sm font-semibold text-accentBlue hover:bg-accentBlue/25"
                >
                  Ask BetIQ AI <Bot className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-warning/35 bg-warning/10 px-3 py-1 text-xs text-warning">
                <ShieldAlert className="h-3 w-3" /> Predictions are not guaranteed. Bet responsibly.
              </p>
            </article>

            <article className="glass-card p-5">
              <div className="flex items-center justify-between">
                <p className="section-label">Top Signals</p>
                <span className="rounded-full border border-accent/35 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
                  Live
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                {[
                  "NBA: Celtics ML | EV +6.2%",
                  "MLB: Yankees TT Over 4.5 | EV +4.1%",
                  "EPL: BTTS Yes | EV +3.6%",
                  "WNBA: Aces -4.5 | Sharp Signal"
                ].map((line) => (
                  <p key={line} className="rounded-lg border border-white/15 bg-bg px-3 py-2 text-xs text-white/80">
                    {line}
                  </p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="glass-card p-4 lg:p-5">
              <feature.icon className="h-5 w-5 text-accentBlue" />
              <h2 className="mt-3 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm text-white/72">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-6 lg:pb-16">
        <div className="glass-card p-5 lg:p-7">
          <p className="panel-title">Workflow</p>
          <h3 className="mt-2 text-2xl font-semibold lg:text-3xl">From market noise to disciplined decisions</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((step, index) => (
              <article key={step} className="rounded-xl border border-white/15 bg-bg p-3">
                <p className="section-label text-accentBlue">Step {index + 1}</p>
                <p className="mt-2 text-sm text-white/85">{step}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-white/80">
            <TrendingUp className="mr-2 inline h-4 w-4 text-accent" />
            Focus on long-term profitability: take quality edges, manage exposure, and review outcomes weekly.
          </div>
        </div>
      </section>
    </main>
  );
}
