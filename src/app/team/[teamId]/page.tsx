import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createRosterService } from "@/services/createRosterService";
import { DepthChartGrid } from "@/components/DepthChartGrid";
import { NewsFeed } from "@/components/NewsFeed";
import { MobileNewsToggle } from "@/components/MobileNewsToggle";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string }>;
}): Promise<Metadata> {
  const { teamId } = await params;
  const service = createRosterService();
  const team = service.getTeam(teamId);
  if (!team) return {};

  const title = `${team.fullName} Roster & Depth Chart`;
  const description = `${team.fullName} (${team.record}) complete roster, depth chart, injuries, and news. ${team.conference} ${team.division}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `/team/${teamId}`,
    },
  };
}

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
  const roster = await service.getTeamRoster(teamId);

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.fullName,
    sport: "American Football",
    memberOf: {
      "@type": "SportsOrganization",
      name: "National Football League",
    },
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-49px)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Depth Chart — Left */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
        {/* Team Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Image src={team.logo} alt={team.name} width={48} height={48} className="h-12 w-12 object-contain" />
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
        <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
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

      {/* Team News — Right (hidden on mobile) */}
      <div className="hidden lg:block w-[380px] border-l border-border bg-bg-card">
        <NewsFeed
          items={news}
          title={`${team.name} News`}
          showFilters={false}
        />
      </div>

      {/* Mobile News */}
      <MobileNewsToggle items={news} title={`${team.name} News`} showFilters={false} />
    </div>
  );
}
