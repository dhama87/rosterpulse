import { createRosterService } from "@/services/createRosterService";
import { TeamGrid } from "@/components/TeamGrid";
import { NewsFeed } from "@/components/NewsFeed";
import { MobileNewsToggle } from "@/components/MobileNewsToggle";

export default async function Home() {
  const service = createRosterService();
  const allTeams = service.getAllTeams();
  const allNews = await service.getAllNews();

  // Count news per team (last 24 hours for alert badges)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const newsCountMap: Record<string, number> = {};
  for (const item of allNews) {
    if (new Date(item.timestamp).getTime() > oneDayAgo) {
      newsCountMap[item.team] = (newsCountMap[item.team] || 0) + 1;
    }
  }

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-49px)]">
      {/* Team Grid — Left */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
