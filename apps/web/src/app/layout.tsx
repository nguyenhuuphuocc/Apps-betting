import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Professional Sports Betting Analytics Platform",
  description: "Real-time +EV betting intelligence, line movement analytics, and strategy backtesting."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Link
          href="/#chat"
          className="fixed bottom-4 right-4 z-50 rounded-full border border-accent/40 bg-accent/20 px-4 py-2 text-sm font-semibold text-accent shadow-glow hover:bg-accent/30"
        >
          Ask BetIQ AI
        </Link>
      </body>
    </html>
  );
}
