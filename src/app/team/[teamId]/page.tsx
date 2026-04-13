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

  // Count injured starters for availability summary
  const starterInjuries = depthChart
    .flatMap((e) => e.players)
    .filter((p) => p.depthOrder === 1 && p.injuryStatus !== "Active");

  const injuryCounts: Record<string, { count: number; color: string }> = {};
  for (const p of starterInjuries) {
    const status = p.injuryStatus;
    if (!injuryCounts[status]) {
      const color = status === "Questionable" || status === "Doubtful" || status === "Holdout"
        ? "text-status-amber"
        : "text-status-red";
      injuryCounts[status] = { count: 0, color };
    }
    injuryCounts[status].count++;
  }

  // Division standings
  const allTeams = service.getAllTeams();
  const divisionTeams = allTeams
    .filter((t) => t.conference === team.conference && t.division === team.division)
    .sort((a, b) => {
      const parseWinPct = (record: string) => {
        const [w, l] = record.split("-").map(Number);
        return w / (w + l);
      };
      return parseWinPct(b.record) - parseWinPct(a.record);
    });

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
              {starterInjuries.length > 0 && (
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  {Object.entries(injuryCounts).map(([status, { count, color }]) => (
                    <span key={status} className={color}>
                      {count} {status}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Division Standings */}
        <div className="mb-6 flex items-center gap-3 text-[11px]">
          <span className="font-semibold uppercase tracking-wider text-text-muted">
            {team.conference} {team.division}
          </span>
          {divisionTeams.map((t, i) => (
            <span key={t.id} className="flex items-center gap-1">
              {i > 0 && <span className="text-text-muted/40 mr-1">·</span>}
              <span className={t.id === team.id ? "font-bold text-text-primary" : "text-text-secondary"}>
                {t.id}
              </span>
              <span className="font-mono text-text-muted">{t.record}</span>
            </span>
          ))}
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
