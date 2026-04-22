import { createRosterService } from "@/services/createRosterService";
import { PreDraftHub } from "@/components/draft/PreDraftHub";
import { LiveDraftTracker } from "@/components/draft/LiveDraftTracker";
import { DraftResults } from "@/components/draft/DraftResults";
import { NewsFeed } from "@/components/NewsFeed";
import { MobileNewsToggle } from "@/components/MobileNewsToggle";
import type { DraftMode } from "@/types";

export const dynamic = "force-dynamic";

function getDraftMode(now: Date, draftDates: string[]): DraftMode {
  if (draftDates.length === 0) return "pre";

  const firstDay = new Date(draftDates[0]);
  const lastDay = new Date(draftDates[draftDates.length - 1]);
  const draftEnd = new Date(lastDay.getTime() + 12 * 60 * 60 * 1000);

  if (now < firstDay) return "pre";
  if (now <= draftEnd) return "live";
  return "results";
}

export default async function DraftPage() {
  const service = createRosterService();
  const meta = await service.getDraftMeta();
  const year = parseInt(meta.draftYear ?? "2026", 10);
  const draftDates = JSON.parse(meta.draftDates ?? "[]") as string[];
  const draftStartDate = draftDates[0] ?? "2026-04-23T20:00:00-04:00";

  const now = new Date();
  const mode = getDraftMode(now, draftDates);

  const [picks, prospects, teamNeeds, allNews] = await Promise.all([
    service.getDraftPicks(year),
    service.getDraftProspects(),
    service.getTeamNeeds(),
    service.getAllNews({ limit: 30 }),
  ]);

  const teams = service.getAllTeams();

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-49px)]">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {mode === "pre" && (
          <PreDraftHub
            draftOrder={picks}
            prospects={prospects}
            teamNeeds={teamNeeds}
            teams={teams}
            draftStartDate={draftStartDate}
          />
        )}

        {mode === "live" && (
          <LiveDraftTracker
            initialPicks={picks}
            teams={teams}
          />
        )}

        {mode === "results" && (
          <DraftResults
            picks={picks}
            teamNeeds={teamNeeds}
            teams={teams}
          />
        )}
      </div>

      <div className="hidden lg:block w-[380px] border-l border-border bg-bg-card">
        <NewsFeed items={allNews} />
      </div>

      <MobileNewsToggle items={allNews} />
    </div>
  );
}
