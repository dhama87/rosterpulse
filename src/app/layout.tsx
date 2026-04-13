import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { createMockRosterService } from "@/services/rosterService";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-var",
});

export const metadata: Metadata = {
  title: "RosterPulse — NFL Roster Dashboard",
  description:
    "Real-time NFL roster and depth chart dashboard. Every team, every starter, every status change.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const service = createMockRosterService();
  const lastVerified = service.getLastVerified();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-body antialiased`}>
        <TopBar lastVerified={lastVerified} />
        <main>{children}</main>
      </body>
    </html>
  );
}
