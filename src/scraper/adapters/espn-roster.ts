import { ScrapedItem, SourceAdapter } from "../types";

const ESPN_TEAM_IDS: Record<string, string> = {
  ARI: "22", ATL: "1", BAL: "33", BUF: "2", CAR: "29", CHI: "3",
  CIN: "4", CLE: "5", DAL: "6", DEN: "7", DET: "8", GB: "9",
  HOU: "34", IND: "11", JAX: "30", KC: "12", LV: "13", LAC: "24",
  LAR: "14", MIA: "15", MIN: "16", NE: "17", NO: "18", NYG: "19",
  NYJ: "20", PHI: "21", PIT: "23", SF: "25", SEA: "26", TB: "27",
  TEN: "10", WAS: "28",
};

const ALL_TEAM_ABBREVS = Object.keys(ESPN_TEAM_IDS);

// Map ESPN depth chart position keys to our position codes
const DEPTH_CHART_POS_MAP: Record<string, { position: string; group: string }> = {
  qb:  { position: "QB",  group: "offense" },
  rb:  { position: "RB",  group: "offense" },
  wr1: { position: "WR1", group: "offense" },
  wr2: { position: "WR2", group: "offense" },
  wr3: { position: "WR3", group: "offense" },
  te:  { position: "TE",  group: "offense" },
  lt:  { position: "LT",  group: "offense" },
  lg:  { position: "LG",  group: "offense" },
  c:   { position: "C",   group: "offense" },
  rg:  { position: "RG",  group: "offense" },
  rt:  { position: "RT",  group: "offense" },
  lde: { position: "DE1", group: "defense" },
  rde: { position: "DE2", group: "defense" },
  ldt: { position: "DT1", group: "defense" },
  rdt: { position: "DT2", group: "defense" },
  wlb: { position: "LB1", group: "defense" },
  mlb: { position: "LB2", group: "defense" },
  slb: { position: "LB3", group: "defense" },
  lcb: { position: "CB1", group: "defense" },
  rcb: { position: "CB2", group: "defense" },
  nb:  { position: "CB3", group: "defense" },
  ss:  { position: "SS",  group: "defense" },
  fs:  { position: "FS",  group: "defense" },
  pk:  { position: "K",   group: "specialTeams" },
  p:   { position: "P",   group: "specialTeams" },
  kr:  { position: "KR",  group: "specialTeams" },
  pr:  { position: "PR",  group: "specialTeams" },
  ls:  { position: "LS",  group: "specialTeams" },
};

interface EspnAthlete {
  id: string;
  fullName: string;
  jersey?: string;
  position?: { abbreviation: string };
  age?: number;
  weight?: number;
  height?: string;
  experience?: { years: number };
  college?: { name: string };
  injuries?: Array<{ status?: string; details?: { detail?: string } }>;
}

interface DepthChartAthlete {
  id: string;
  displayName: string;
  injuries?: Array<{ status?: string; details?: { detail?: string } }>;
}

interface DepthChartPosition {
  position: { id: string; name: string };
  athletes: DepthChartAthlete[];
}

interface DepthChartFormation {
  id: string;
  name: string;
  positions: Record<string, DepthChartPosition>;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await globalThis.fetch(url, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export class EspnRosterAdapter implements SourceAdapter {
  name = "espn-roster";

  private teamAbbrevs: string[];

  constructor(teamIds?: string[]) {
    this.teamAbbrevs = teamIds ?? ALL_TEAM_ABBREVS;
  }

  async fetch(): Promise<ScrapedItem[]> {
    const results: ScrapedItem[] = [];

    for (const abbrev of this.teamAbbrevs) {
      const espnId = ESPN_TEAM_IDS[abbrev];
      if (!espnId) continue;

      const rosterUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${espnId}/roster`;
      const depthUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${espnId}/depthcharts`;

      // Fetch roster and depth chart in parallel
      const [rosterData, depthData] = await Promise.all([
        fetchJson<{
          team: { abbreviation: string };
          athletes: Array<{ position: string; items: EspnAthlete[] }>;
        }>(rosterUrl),
        fetchJson<{
          team: { abbreviation: string };
          depthchart: DepthChartFormation[];
        }>(depthUrl),
      ]);

      const teamAbbrev = rosterData?.team?.abbreviation ?? abbrev;
      const fetchedAt = new Date().toISOString();

      // Build athlete bio lookup from roster API (keyed by ESPN ID)
      const bioMap = new Map<string, EspnAthlete>();
      if (rosterData) {
        for (const group of rosterData.athletes ?? []) {
          for (const athlete of group.items ?? []) {
            bioMap.set(athlete.id, athlete);
          }
        }
      }

      // Build depth chart: espnId -> { position, depthOrder }
      // Use offensive formation for offense, defensive for defense, ST for special teams
      const depthMap = new Map<string, { position: string; group: string; depthOrder: number }>();
      const processedIds = new Set<string>();

      if (depthData) {
        for (const formation of depthData.depthchart ?? []) {
          for (const [slotKey, slot] of Object.entries(formation.positions ?? {})) {
            const mapping = DEPTH_CHART_POS_MAP[slotKey];
            if (!mapping) continue;

            for (let i = 0; i < (slot.athletes?.length ?? 0) && i < 3; i++) {
              const athlete = slot.athletes[i];
              // Only set if not already assigned (first formation wins)
              if (!depthMap.has(athlete.id)) {
                depthMap.set(athlete.id, {
                  position: mapping.position,
                  group: mapping.group,
                  depthOrder: i + 1,
                });
              }
            }
          }
        }
      }

      // Emit players from depth chart (with bio data merged in)
      for (const [athleteId, depth] of depthMap) {
        const bio = bioMap.get(athleteId);
        const injury = bio?.injuries?.[0];

        const item: ScrapedItem = {
          type: "player",
          sourceAdapter: this.name,
          source: "ESPN",
          sourceUrl: rosterUrl,
          confidence: "official",
          fetchedAt,
          rawData: {
            id: `${teamAbbrev}-${depth.position}-${depth.depthOrder}`,
            name: bio?.fullName ?? `Unknown (${athleteId})`,
            team: teamAbbrev,
            position: depth.position,
            positionGroup: depth.group,
            depthOrder: depth.depthOrder,
            jerseyNumber: bio?.jersey != null ? parseInt(bio.jersey, 10) : undefined,
            height: bio?.height,
            weight: bio?.weight != null ? String(bio.weight) : undefined,
            age: bio?.age,
            college: bio?.college?.name,
            experience: bio?.experience?.years,
            injuryStatus: injury?.status,
            injuryDetail: injury?.details?.detail,
            espnId: athleteId,
          },
        };

        results.push(item);
        processedIds.add(athleteId);
      }

      // Also emit roster-only players not in depth chart (practice squad, etc.)
      for (const [athleteId, bio] of bioMap) {
        if (processedIds.has(athleteId)) continue;

        const position = bio.position?.abbreviation ?? "UNK";
        const injury = bio.injuries?.[0];

        results.push({
          type: "player",
          sourceAdapter: this.name,
          source: "ESPN",
          sourceUrl: rosterUrl,
          confidence: "official",
          fetchedAt,
          rawData: {
            id: `${teamAbbrev}-${position}-${athleteId}`,
            name: bio.fullName,
            team: teamAbbrev,
            position,
            positionGroup: "roster",
            depthOrder: 0,
            jerseyNumber: bio.jersey != null ? parseInt(bio.jersey, 10) : undefined,
            height: bio.height,
            weight: bio.weight != null ? String(bio.weight) : undefined,
            age: bio.age,
            college: bio.college?.name,
            experience: bio.experience?.years,
            injuryStatus: injury?.status,
            injuryDetail: injury?.details?.detail,
            espnId: athleteId,
          },
        });
      }
    }

    return results;
  }
}
