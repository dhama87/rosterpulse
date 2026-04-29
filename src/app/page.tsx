import { createRosterService } from "@/services/createRosterService";
import { TeamGrid } from "@/components/TeamGrid";
import { NewsFeed } from "@/components/NewsFeed";
import { MobileNewsToggle } from "@/components/MobileNewsToggle";
import type { TeamSummary } from "@/components/TeamGrid";

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

  // Build per-team summaries for favorites dashboard
  const teamSummaries: Record<string, TeamSummary> = {};
  for (const team of allTeams) {
    const roster = await service.getTeamRoster(team.id);
    if (!roster) continue;

    let injuredStarters = 0;
    let questionable = 0;
    let rookies = 0;

    for (const entry of roster.depthChart) {
      for (const p of entry.players) {
        if (p.experience === 0) rookies++;
        if (p.depthOrder !== 1) continue;
        if (p.injuryStatus === "Out" || p.injuryStatus === "IR" || p.injuryStatus === "Suspended") {
          injuredStarters++;
        } else if (p.injuryStatus === "Questionable" || p.injuryStatus === "Doubtful") {
          questionable++;
        }
      }
    }

    // Latest news headline for this team
    const teamNews = allNews.filter((n) => n.team === team.id);
    const latestHeadline = teamNews[0]?.headline ?? null;

    teamSummaries[team.id] = { injuredStarters, questionable, rookies, latestHeadline };
  }

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-49px)]">
      {/* Team Grid — Left */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Hero */}
        <div className="mb-6 rounded-lg border border-border bg-bg-card px-5 py-4">
          <h1 className="text-lg font-bold text-text-primary">
            The cleanest NFL roster dashboard on the internet.
          </h1>
          <p className="mt-1 text-sm text-text-secondary leading-relaxed max-w-xl">
            Every team. Every starter. Every status change — updated daily, zero clutter.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-muted">
            <span><strong className="text-text-secondary">32</strong> teams tracked</span>
            <span><strong className="text-text-secondary">{recentNewsCount}</strong> updates today</span>
            <span><strong className="text-text-secondary">{allNews.length}+</strong> roster moves tracked</span>
          </div>
        </div>

        <TeamGrid teams={allTeams} newsCountMap={newsCountMap} teamSummaries={teamSummaries} />
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
