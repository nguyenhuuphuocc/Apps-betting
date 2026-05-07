import type { NotificationItem } from "@/types";

type Props = {
  items: NotificationItem[];
};

function toneClass(level: NotificationItem["level"]) {
  if (level === "success") return "border-accent/25 bg-accent/10 text-accent";
  if (level === "warning") return "border-warning/25 bg-warning/10 text-warning";
  return "border-accentBlue/25 bg-accentBlue/10 text-accentBlue";
}

export function NotificationsPanel({ items }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/85">Notifications</h3>
        <p className="text-xs text-white/55">AI and market alerts</p>
      </div>

      <div className="grid gap-2">
        {items.length ? (
          items.slice(0, 8).map((item) => (
            <article key={item.id} className={`rounded-xl border px-3 py-2 ${toneClass(item.level)}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">{item.title}</p>
              <p className="mt-1 text-xs text-white/80">{item.body}</p>
              <p className="mt-1 text-[11px] text-white/50">{new Date(item.createdAt).toLocaleString()}</p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/20 bg-bg p-4 text-sm text-white/60">
            No alerts yet for the current slate.
          </div>
        )}
      </div>
    </section>
  );
}
