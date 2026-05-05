import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        bg: "#060c1a",
        panel: "#0d1630",
        panelSoft: "#111f3f",
        accent: "#39ff88",
        accentBlue: "#4cc9ff",
        danger: "#ff5d73",
        warning: "#f2c94c"
      },
      boxShadow: {
        panel: "0 24px 56px rgba(0,0,0,.35)",
        glow: "0 0 0 1px rgba(57,255,136,.35), 0 0 35px rgba(57,255,136,.12)"
      }
    }
  },
  plugins: []
};

export default config;
