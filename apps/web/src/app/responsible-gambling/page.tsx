export default function ResponsibleGamblingPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <section className="rounded-xl border border-white/10 bg-panel p-6 shadow-panel">
        <h1 className="text-3xl font-bold text-white">Responsible Betting</h1>
        <p className="mt-3 text-white/75">
          Betting involves risk. This platform is for analysis and education, not guaranteed outcomes.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-white/75">
          <li>Use a fixed unit system and cap daily exposure.</li>
          <li>Never chase losses or increase stakes emotionally.</li>
          <li>Pause after extended losing streaks and reassess strategy.</li>
          <li>Only place bets when expected value is positive and data quality is acceptable.</li>
          <li>If gambling is harming you, seek support resources in your local region.</li>
        </ul>
      </section>
    </main>
  );
}
