"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { ChatAnswer, ChatMessage } from "@/types";

type Props = {
  history: ChatMessage[];
  onAsk: (message: string) => Promise<ChatAnswer>;
};

const quickPrompts = [
  "Should I bet Lakers -4.5 tonight?",
  "Analyze Celtics vs Heat over/under.",
  "What is the best +EV bet today?",
  "Why is this line moving?"
];

export function ChatPanel({ history, onAsk }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<ChatAnswer | null>(null);

  const renderedHistory = useMemo(() => history.slice(-16), [history]);

  return (
    <section className="rounded-xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">BetIQ AI Analyst</h3>
        <span className="text-xs text-white/60">
          Educational analysis only. No guaranteed picks.
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickPrompts.map((chip) => (
          <button
            key={chip}
            type="button"
            className="rounded-full border border-white/15 bg-bg px-3 py-1 text-xs text-white/75 hover:border-accent/40 hover:text-accent"
            onClick={() => setPrompt(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="mt-3 h-[280px] overflow-y-auto rounded-xl border border-white/10 bg-bg p-3">
        {renderedHistory.length ? (
          <div className="grid gap-2">
            {renderedHistory.map((item) => (
              <article
                key={`${item.id}-${item.createdAt}`}
                className={clsx(
                  "rounded-lg border p-2 text-sm",
                  item.role === "assistant"
                    ? "border-accent/30 bg-accent/5 text-white/90"
                    : "border-white/15 bg-white/5 text-white/80"
                )}
              >
                <p className="mb-1 text-[10px] uppercase tracking-wider text-white/50">
                  {item.role}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{item.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/55">
            Ask BetIQ for matchup analysis, EV checks, or bankroll-safe bet sizing.
          </p>
        )}
      </div>

      {lastAnswer ? (
        <div className="mt-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          Confidence: {lastAnswer.meta.confidenceScore}/100 | Edge: {lastAnswer.meta.edge.toFixed(2)}% | Suggested size:{" "}
          {lastAnswer.meta.recommendedUnits.toFixed(2)}u
        </div>
      ) : null}

      <form
        className="mt-3 flex gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const message = prompt.trim();
          if (!message) return;
          setLoading(true);
          try {
            const answer = await onAsk(message);
            setLastAnswer(answer);
            setPrompt("");
          } finally {
            setLoading(false);
          }
        }}
      >
        <input
          className="field flex-1"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask BetIQ AI Analyst..."
        />
        <button
          type="submit"
          className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/25"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </form>

      <p className="mt-2 text-xs text-white/50">
        This assistant does not provide guaranteed outcomes and should not be used to chase losses.
      </p>
    </section>
  );
}
