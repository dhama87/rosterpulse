import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createRosterService } from "@/services/createRosterService";
import { PlayerHeader } from "@/components/PlayerHeader";
import { PlayerStatusCard } from "@/components/PlayerStatusCard";
import { PlayerTimeline } from "@/components/PlayerTimeline";
import { PlayerSidebar } from "@/components/PlayerSidebar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ playerId: string }>;
}): Promise<Metadata> {
  const { playerId } = await params;
  const service = createRosterService();
  const player = await service.getPlayer(playerId);
  if (!player) return {};

  const team = service.getTeam(player.team);
  const teamName = team?.fullName ?? player.team;
  const pos = player.position.replace(/\d+$/, "");
  const title = `${player.name} — ${teamName} ${pos}`;
  const description = `${player.name} (#${player.jerseyNumber}) ${pos} for the ${teamName}. Status: ${player.injuryStatus}. Depth chart, news, and injury updates.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `/player/${playerId}`,
    },
  };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const service = createRosterService();

  const player = await service.getPlayer(playerId);
  if (!player) {
    notFound();
  }

  const team = service.getTeam(player.team);
  if (!team) {
    notFound();
  }

  const [playerNews, roster, lastVerified] = await Promise.all([
    service.getPlayerNews(playerId),
    service.getTeamRoster(player.team),
    service.getLastVerified(),
  ]);

  const depthChartEntry = roster?.depthChart.find(
    (e) => e.position === player.position
  );

  const pos = player.position.replace(/\d+$/, "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rosterpulse.vercel.app";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: player.name,
      jobTitle: `${pos} — ${team.fullName}`,
      memberOf: {
        "@type": "SportsTeam",
        name: team.fullName,
      },
      description: `${player.name} (#${player.jerseyNumber}) plays ${pos} for the ${team.fullName}.`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: team.fullName, item: `${siteUrl}/team/${team.id}` },
        { "@type": "ListItem", position: 3, name: player.name },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
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
        </div>
        <Link
          href={`/compare?p1=${player.id}`}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          Compare →
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
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
        <div className="w-full lg:w-[320px]">
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
