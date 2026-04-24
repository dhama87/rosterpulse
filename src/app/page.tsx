import { createRosterService } from "@/services/createRosterService";
import { TeamGrid } from "@/components/TeamGrid";
import { NewsFeed } from "@/components/NewsFeed";
import { MobileNewsToggle } from "@/components/MobileNewsToggle";

export const dynamic = "force-dynamic";

export default async function Home() {
  const service = createRosterService();
  const allTeams = service.getAllTeams();
  const allNews = await service.getAllNews();

  // Count news per team (last 24 hours for alert badges)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const newsCountMap: Record<string, number> = {};
  let recentNewsCount = 0;
  for (const item of allNews) {
    if (new Date(item.timestamp).getTime() > oneDayAgo) {
      newsCountMap[item.team] = (newsCountMap[item.team] || 0) + 1;
      recentNewsCount++;
    }
  }

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-49px)]">
      {/* Team Grid — Left */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Hero */}
        <div className="mb-6 rounded-lg border border-border bg-bg-card px-5 py-4">
          <h1 className="text-lg font-bold text-text-primary">
            NFL Roster Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-secondary leading-relaxed max-w-xl">
            Every roster, depth chart, and injury update across all 32 teams
            — aggregated and refreshed daily. No clutter, no paywalls.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-muted">
            <span><strong className="text-text-secondary">32</strong> teams tracked</span>
            <span><strong className="text-text-secondary">{recentNewsCount}</strong> updates today</span>
            <span><strong className="text-text-secondary">{allNews.length}+</strong> roster moves tracked</span>
          </div>
        </div>

        <TeamGrid teams={allTeams} newsCountMap={newsCountMap} />
      </div>

      {/* News Feed — Right (hidden on mobile, shown on lg+) */}
      <div className="hidden lg:block w-[380px] border-l border-border bg-bg-card">
        <NewsFeed items={allNews} />
      </div>

      {/* Mobile News */}
      <MobileNewsToggle items={allNews} />
    </div>
  );
}
