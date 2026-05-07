"use client";

import { useEffect, useState } from "react";
import { fetcher, postJson } from "@/lib/api";

type SettingsPayload = {
  userId: string;
  bankroll: { unitSizePct?: number; maxDailyExposurePct?: number };
  risk: { minConfidence?: number; minEdgePct?: number };
  api?: Record<string, unknown>;
  model?: Record<string, unknown>;
  display?: Record<string, unknown>;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<SettingsPayload>({
    userId: "default",
    bankroll: { unitSizePct: 1, maxDailyExposurePct: 5 },
    risk: { minConfidence: 6, minEdgePct: 2 },
    api: {},
    model: {},
    display: {}
  });

  useEffect(() => {
    (async () => {
      try {
        const payload = await fetcher<SettingsPayload>("/api/v1/user/settings?userId=default");
        setSettings(payload);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="rounded-xl border border-white/10 bg-panel p-6 text-white/70">Loading settings...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="rounded-xl border border-white/10 bg-panel p-5 shadow-panel">
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="mt-1 text-sm text-white/65">
          Control API, bankroll, risk, and model defaults. Secrets stay server-side.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card title="Bankroll">
            <Field label="Unit Size %">
              <input
                className="field"
                type="number"
                min={0.25}
                max={5}
                step={0.25}
                value={settings.bankroll.unitSizePct ?? 1}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    bankroll: { ...prev.bankroll, unitSizePct: Number(event.target.value) }
                  }))
                }
              />
            </Field>
            <Field label="Max Daily Exposure %">
              <input
                className="field"
                type="number"
                min={1}
                max={20}
                step={0.5}
                value={settings.bankroll.maxDailyExposurePct ?? 5}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    bankroll: { ...prev.bankroll, maxDailyExposurePct: Number(event.target.value) }
                  }))
                }
              />
            </Field>
          </Card>

          <Card title="Risk">
            <Field label="Min Confidence">
              <input
                className="field"
                type="number"
                min={1}
                max={10}
                step={0.1}
                value={settings.risk.minConfidence ?? 6}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    risk: { ...prev.risk, minConfidence: Number(event.target.value) }
                  }))
                }
              />
            </Field>
            <Field label="Min EV Edge %">
              <input
                className="field"
                type="number"
                min={0}
                max={20}
                step={0.25}
                value={settings.risk.minEdgePct ?? 2}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    risk: { ...prev.risk, minEdgePct: Number(event.target.value) }
                  }))
                }
              />
            </Field>
          </Card>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/25"
            onClick={async () => {
              setSaving(true);
              setMessage("");
              try {
                await postJson("/api/v1/user/settings", settings);
                setMessage("Settings saved.");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <span className="text-xs text-white/60">{message}</span>
        </div>

        <p className="mt-4 text-xs text-warning">
          Predictions are not guaranteed. Bet responsibly and avoid chasing losses.
        </p>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-bg p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/75">{title}</h2>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs text-white/60">
      <span>{label}</span>
      {children}
    </label>
  );
}
