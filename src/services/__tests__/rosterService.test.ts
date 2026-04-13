import { createMockRosterService } from "@/services/rosterService";
import { RosterService } from "@/types";

describe("MockRosterService", () => {
  let service: RosterService;

  beforeEach(() => {
    service = createMockRosterService();
  });

  describe("getAllTeams", () => {
    it("returns all 32 NFL teams", () => {
      const teams = service.getAllTeams();
      expect(teams).toHaveLength(32);
    });

    it("includes teams from both conferences", () => {
      const teams = service.getAllTeams();
      const afc = teams.filter((t) => t.conference === "AFC");
      const nfc = teams.filter((t) => t.conference === "NFC");
      expect(afc).toHaveLength(16);
      expect(nfc).toHaveLength(16);
    });
  });

  describe("getTeam", () => {
    it("returns a team by ID", () => {
      const team = service.getTeam("KC");
      expect(team).toBeDefined();
      expect(team?.name).toBe("Chiefs");
      expect(team?.fullName).toBe("Kansas City Chiefs");
    });

    it("returns undefined for invalid team ID", () => {
      const team = service.getTeam("INVALID");
      expect(team).toBeUndefined();
    });
  });

  describe("getTeamRoster", () => {
    it("returns a roster with depth chart entries", () => {
      const roster = service.getTeamRoster("KC");
      expect(roster).toBeDefined();
      expect(roster?.team.id).toBe("KC");
      expect(roster?.depthChart.length).toBeGreaterThan(0);
    });

    it("groups players by position in depth chart", () => {
      const roster = service.getTeamRoster("KC");
      expect(roster).toBeDefined();

      const qbEntry = roster?.depthChart.find((e) => e.position === "QB");
      expect(qbEntry).toBeDefined();
      expect(qbEntry?.players.length).toBeGreaterThanOrEqual(1);
      expect(qbEntry?.players[0].depthOrder).toBe(1);
    });

    it("returns undefined for invalid team ID", () => {
      const roster = service.getTeamRoster("INVALID");
      expect(roster).toBeUndefined();
    });

    it("includes team news in roster", () => {
      const roster = service.getTeamRoster("KC");
      expect(roster).toBeDefined();
      expect(roster?.news.length).toBeGreaterThanOrEqual(0);
      roster?.news.forEach((item) => {
        expect(item.team).toBe("KC");
      });
    });
  });

  describe("getPlayer", () => {
    it("returns a player by ID", () => {
      const player = service.getPlayer("KC-QB-1");
      expect(player).toBeDefined();
      expect(player?.name).toBe("Patrick Mahomes");
      expect(player?.team).toBe("KC");
    });

    it("returns undefined for invalid player ID", () => {
      const player = service.getPlayer("INVALID-ID");
      expect(player).toBeUndefined();
    });
  });

  describe("getPlayerNews", () => {
    it("returns news items for a specific player", () => {
      const news = service.getPlayerNews("KC-CB2-1");
      expect(news.length).toBeGreaterThanOrEqual(1);
      news.forEach((item) => {
        expect(item.playerId).toBe("KC-CB2-1");
      });
    });

    it("returns empty array for player with no news", () => {
      const news = service.getPlayerNews("KC-LG-3");
      expect(news).toEqual([]);
    });
  });

  describe("getTeamNews", () => {
    it("returns news items for a specific team", () => {
      const news = service.getTeamNews("KC");
      expect(news.length).toBeGreaterThanOrEqual(1);
      news.forEach((item) => {
        expect(item.team).toBe("KC");
      });
    });

    it("returns empty array for team with no news", () => {
      // A team that has no news in our mock data
      const news = service.getTeamNews("INVALID");
      expect(news).toEqual([]);
    });
  });

  describe("getAllNews", () => {
    it("returns all news items when no options provided", () => {
      const news = service.getAllNews();
      expect(news.length).toBeGreaterThanOrEqual(50);
    });

    it("filters by category", () => {
      const news = service.getAllNews({ category: "INJURY" });
      expect(news.length).toBeGreaterThan(0);
      news.forEach((item) => {
        expect(item.category).toBe("INJURY");
      });
    });

    it("limits results", () => {
      const news = service.getAllNews({ limit: 5 });
      expect(news).toHaveLength(5);
    });

    it("filters by category and limits", () => {
      const news = service.getAllNews({ category: "INJURY", limit: 3 });
      expect(news.length).toBeLessThanOrEqual(3);
      news.forEach((item) => {
        expect(item.category).toBe("INJURY");
      });
    });

    it("sorts by timestamp descending (newest first)", () => {
      const news = service.getAllNews();
      for (let i = 1; i < news.length; i++) {
        expect(
          new Date(news[i - 1].timestamp).getTime()
        ).toBeGreaterThanOrEqual(new Date(news[i].timestamp).getTime());
      }
    });
  });

  describe("searchPlayers", () => {
    it("finds players by name (case-insensitive)", () => {
      const results = service.searchPlayers("mahomes");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].name).toBe("Patrick Mahomes");
    });

    it("finds players by partial name", () => {
      const results = service.searchPlayers("maho");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty array for no matches", () => {
      const results = service.searchPlayers("zzzzzzzzz");
      expect(results).toEqual([]);
    });
  });

  describe("searchTeams", () => {
    it("finds teams by name", () => {
      const results = service.searchTeams("chiefs");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe("KC");
    });

    it("finds teams by fullName", () => {
      const results = service.searchTeams("kansas city");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe("KC");
    });

    it("returns empty array for no matches", () => {
      const results = service.searchTeams("zzzzzzzzz");
      expect(results).toEqual([]);
    });
  });

  describe("getLastVerified", () => {
    it("returns an ISO timestamp string", () => {
      const timestamp = service.getLastVerified();
      expect(timestamp).toBeDefined();
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });
});
