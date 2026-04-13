import { notFound } from "next/navigation";
import { createRosterService } from "@/services/createRosterService";
import { DepthChartGrid } from "@/components/DepthChartGrid";
import { NewsFeed } from "@/components/NewsFeed";

function formatLastUpdated(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const service = createRosterService();
  const roster = service.getTeamRoster(teamId);

  if (!roster) {
    notFound();
  }

  const { team, depthChart, news } = roster;

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* Depth Chart — Left */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Team Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <img src={team.logo} alt={team.name} className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {team.fullName}
              </h1>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <span>
                  {team.conference} {team.division}
                </span>
                <span className="text-text-muted">&middot;</span>
                <span>{team.record}</span>
                <span className="text-text-muted">&middot;</span>
                <span className="font-mono text-xs text-text-muted">
                  Updated {formatLastUpdated(team.lastUpdated)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DepthChartGrid depthChart={depthChart} />
      </div>

      {/* Team News — Right */}
      <div className="w-[380px] border-l border-border bg-bg-card">
        <NewsFeed
          items={news}
          title={`${team.name} News`}
          showFilters={false}
        />
      </div>
    </div>
  );
}
