function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function confidenceBand(score) {
  if (score >= 75) return "Medium-High";
  if (score >= 60) return "Medium";
  return "Low-Medium";
}

function safePercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Number(clamp(n, -1000, 1000).toFixed(2));
}

function topEvBet(evBets = []) {
  return [...evBets]
    .filter((row) => Number(row.ev_pct ?? row.evPct ?? 0) > 0)
    .sort((a, b) => Number(b.edge_pct ?? b.edgePct ?? 0) - Number(a.edge_pct ?? a.edgePct ?? 0))[0];
}

function buildFallbackAnswer({ question, context }) {
  const ev = context.topEv;
  const modelProbability = safePercent(ev?.model_probability ?? ev?.modelProbability ?? 0);
  const impliedProbability = safePercent(ev?.implied_probability ?? ev?.impliedProbability ?? 0);
  const edge = safePercent(ev?.edge_pct ?? ev?.edgePct ?? 0);
  const evPct = safePercent(ev?.ev_pct ?? ev?.evPct ?? 0);
  const confidenceScore = clamp(Math.round(Number(ev?.confidence ?? 58)), 35, 90);
  const band = confidenceBand(confidenceScore);

  const quickVerdict = ev
    ? `Lean: ${ev.pick}. Only consider if price holds and injury status remains stable.`
    : "Lean: NO BET - current board does not show a clear positive-EV edge.";

  const reasons = ev
    ? [
        "Model probability is above the sportsbook implied probability.",
        "Current edge and EV pass the dashboard quality filter.",
        "Line shopping can still improve payout quality."
      ]
    : [
        "No market currently clears the minimum confidence and edge thresholds.",
        "Lower-quality bets increase drawdown risk.",
        "Waiting for better price movement is often more profitable long term."
      ];

  const riskFactors = [
    "Late injury/news can invalidate projections quickly.",
    "Fast line movement can remove EV before execution.",
    "Public-heavy sides can create inflated prices."
  ];

  return {
    question,
    answer: [
      `Quick Verdict: ${quickVerdict}`,
      `Confidence Score: ${confidenceScore}/100 (${band})`,
      ev
        ? `Model Projection: Market edge ${edge}% with EV ${evPct}% on ${ev.pick}.`
        : "Model Projection: No high-quality setup currently detected.",
      ev
        ? `Edge Analysis: Implied ${impliedProbability}% vs Model ${modelProbability}% => Edge +${edge}%.`
        : "Edge Analysis: No positive edge above threshold.",
      `Key Reasons: ${reasons.join(" ")}`,
      `Risk Factors: ${riskFactors.join(" ")}`,
      ev
        ? "Suggested Bet Size: 0.5u to 1.0u (small, disciplined exposure)."
        : "Suggested Bet Size: 0u (no action).",
      "Responsible Reminder: This is not guaranteed. Bet responsibly and never chase losses."
    ].join("\n\n"),
    meta: {
      quickVerdict,
      confidenceScore,
      modelProbability,
      impliedProbability,
      edge,
      evPct,
      risk: confidenceScore >= 75 ? "Medium" : "High",
      recommendedUnits: ev ? (confidenceScore >= 75 ? 1 : 0.5) : 0
    }
  };
}

async function callOpenAi({ apiKey, model, prompt }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: prompt
    })
  });
  if (!response.ok) {
    throw new Error(`LLM provider error ${response.status}`);
  }
  const body = await response.json();
  const text = body.output_text;
  return typeof text === "string" && text.trim()
    ? text.trim()
    : "No response content returned by model.";
}

export function createChatService({ env, service, store }) {
  async function analyze({ sessionId, userId, message }) {
    const liveGames = await service.liveGames(null);
    const evBets = await service.plusEvBets({ minEdge: 1, minConfidence: 5.5 });
    const topEv = topEvBet(evBets);
    const context = {
      topEv,
      liveGamesCount: liveGames.length,
      evCount: evBets.length,
      supportedSports: env.supportedSportKeys
    };

    let finalAnswer = buildFallbackAnswer({ question: message, context });
    if (env.OPENAI_API_KEY) {
      const prompt = `
You are BetIQ AI Analyst for a professional sports betting analytics app.
You must never guarantee wins.
Always include uncertainty, risk, and responsible bankroll language.
User question: ${message}
Context JSON:
${JSON.stringify(context, null, 2)}

Required response format with headings:
1) Quick Verdict
2) Confidence Score
3) Model Projection
4) Edge Analysis
5) Key Reasons
6) Risk Factors
7) Suggested Bet Size
8) Responsible Gambling Reminder
      `.trim();

      try {
        const llmText = await callOpenAi({
          apiKey: env.OPENAI_API_KEY,
          model: env.OPENAI_MODEL,
          prompt
        });
        finalAnswer = {
          ...finalAnswer,
          answer: llmText
        };
      } catch {
        // Keep deterministic fallback output.
      }
    }

    await store.upsertChatSession({
      id: sessionId,
      userId,
      title: "BetIQ session"
    });
    await store.addChatMessage({
      sessionId,
      role: "user",
      content: message,
      metadata: { source: "user" }
    });
    await store.addChatMessage({
      sessionId,
      role: "assistant",
      content: finalAnswer.answer,
      metadata: { source: env.OPENAI_API_KEY ? "llm_or_fallback" : "fallback", ...finalAnswer.meta }
    });

    return {
      sessionId,
      ...finalAnswer
    };
  }

  async function history({ sessionId, limit = 40 }) {
    const rows = await store.getChatHistory(sessionId, limit);
    return rows.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      metadata: row.metadata ?? {},
      createdAt: row.created_at ?? row.createdAt
    }));
  }

  return {
    analyze,
    history
  };
}
