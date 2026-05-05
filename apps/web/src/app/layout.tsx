import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Professional Sports Betting Analytics Platform",
  description: "Real-time +EV betting intelligence, line movement analytics, and strategy backtesting."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
