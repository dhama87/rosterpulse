import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { createRosterService } from "@/services/createRosterService";
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
  const service = createRosterService();
  const lastVerified = service.getLastVerified();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-body antialiased`}>
        <TopBar lastVerified={lastVerified} />
        <main className="min-h-[calc(100vh-49px-37px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
