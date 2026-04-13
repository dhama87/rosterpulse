import { createMockRosterService } from "@/services/rosterService";
import { TeamCard } from "@/components/TeamCard";
import { NewsFeed } from "@/components/NewsFeed";
import { Conference, Division } from "@/types";

const divisions: Division[] = ["East", "North", "South", "West"];
const conferences: Conference[] = ["AFC", "NFC"];

export default function Home() {
  const service = createMockRosterService();
  const allTeams = service.getAllTeams();
  const allNews = service.getAllNews();

  // Count news per team (last 24 hours for alert badges)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentNewsCount = new Map<string, number>();
  for (const item of allNews) {
    if (new Date(item.timestamp).getTime() > oneDayAgo) {
      recentNewsCount.set(
        item.team,
        (recentNewsCount.get(item.team) || 0) + 1
      );
    }
  }

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* Team Grid — Left */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-8">
          {conferences.map((conf) => (
            <div key={conf}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                {conf}
              </h2>
              <div className="space-y-5">
                {divisions.map((div) => {
                  const divTeams = allTeams.filter(
                    (t) => t.conference === conf && t.division === div
                  );
                  return (
                    <div key={div}>
                      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                        {conf} {div}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {divTeams.map((team) => (
                          <TeamCard
                            key={team.id}
                            team={team}
                            newsCount={recentNewsCount.get(team.id) || 0}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News Feed — Right */}
      <div className="w-[380px] border-l border-border bg-bg-card">
        <NewsFeed items={allNews} />
      </div>
    </div>
  );
}
