import { motion } from "framer-motion";

type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function KpiCard({ label, value, hint }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-panel p-4 shadow-panel"
    >
      <p className="text-xs uppercase tracking-widest text-white/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-xs text-white/55">{hint}</p> : null}
    </motion.article>
  );
}
