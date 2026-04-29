import type { Metadata } from "next";
import { createRosterService } from "@/services/createRosterService";
import { NewsFeed } from "@/components/NewsFeed";

export const metadata: Metadata = {
  title: "NFL Transactions & News",
  description:
    "Latest NFL roster moves, trades, signings, injuries, and transactions. All 32 teams, updated daily.",
  openGraph: {
    title: "NFL Transactions & News | RosterPulse",
    description: "Latest NFL roster moves, trades, signings, injuries, and transactions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFL Transactions & News | RosterPulse",
    description: "Latest NFL roster moves, trades, signings, and injuries.",
  },
  alternates: { canonical: "/news" },
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const service = createRosterService();
  const allNews = await service.getAllNews({ limit: 200 });

  // Group by date
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const todayCount = allNews.filter((n) => {
    const d = new Date(n.timestamp);
    return d.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">
          NFL Transactions & News
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {todayCount > 0
            ? `${todayCount} updates today — ${allNews.length} total tracked.`
            : `${allNews.length} roster moves tracked.`}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-bg-card overflow-hidden">
        <NewsFeed items={allNews} title="All Transactions" />
      </div>
    </div>
  );
}
