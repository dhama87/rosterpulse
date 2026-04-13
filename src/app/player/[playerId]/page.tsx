import Link from "next/link";
import { notFound } from "next/navigation";
import { createRosterService } from "@/services/createRosterService";
import { PlayerHeader } from "@/components/PlayerHeader";
import { PlayerStatusCard } from "@/components/PlayerStatusCard";
import { PlayerTimeline } from "@/components/PlayerTimeline";
import { PlayerSidebar } from "@/components/PlayerSidebar";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const service = createRosterService();

  const player = service.getPlayer(playerId);
  if (!player) {
    notFound();
  }

  const team = service.getTeam(player.team);
  if (!team) {
    notFound();
  }

  const playerNews = service.getPlayerNews(playerId);
  const roster = service.getTeamRoster(player.team);
  const depthChartEntry = roster?.depthChart.find(
    (e) => e.position === player.position
  );
  const lastVerified = service.getLastVerified();

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-text-muted">
        <Link href="/" className="hover:text-text-secondary">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/team/${team.id}`}
          className="hover:text-text-secondary"
        >
          {team.fullName}
        </Link>
        <span>/</span>
        <span className="text-text-secondary">{player.name}</span>
      </nav>

      <div className="flex gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <PlayerHeader player={player} />
          <PlayerStatusCard player={player} lastVerified={lastVerified} />
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
              News Timeline
            </h2>
            <PlayerTimeline newsItems={playerNews} />
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[320px]">
          <PlayerSidebar
            player={player}
            team={team}
            depthChartEntry={depthChartEntry}
          />
        </div>
      </div>
    </div>
  );
}
