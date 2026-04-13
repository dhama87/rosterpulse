import { getStatLine } from "../statLine";
import { Player } from "@/types";

function makeTestPlayer(position: string, stats: Record<string, number>): Player {
  return {
    id: "test-1",
    name: "Test Player",
    team: "KC",
    position,
    positionGroup: "offense",
    depthOrder: 1,
    jerseyNumber: 1,
    height: "6-0",
    weight: "200",
    age: 25,
    college: "Test U",
    experience: 3,
    injuryStatus: "Active",
    stats,
  };
}

describe("getStatLine", () => {
  it("formats QB stats", () => {
    const player = makeTestPlayer("QB", { passYds: 4183, passTD: 30, int: 11, qbr: 94.2 });
    expect(getStatLine(player)).toBe("4,183 yds / 30 TD");
  });

  it("formats RB stats", () => {
    const player = makeTestPlayer("RB", { rushYds: 1012, rushTD: 7, ypc: 4.5, rec: 32 });
    expect(getStatLine(player)).toBe("1,012 yds / 7 TD");
  });

  it("formats WR stats (WR1, WR2, WR3)", () => {
    const player = makeTestPlayer("WR1", { recYds: 858, recTD: 5, rec: 68, targets: 100 });
    expect(getStatLine(player)).toBe("68 rec / 858 yds");
  });

  it("formats TE stats", () => {
    const player = makeTestPlayer("TE", { recYds: 823, recTD: 5, rec: 75, targets: 98 });
    expect(getStatLine(player)).toBe("75 rec / 823 yds");
  });

  it("formats OL stats (LT, LG, C, RG, RT)", () => {
    const player = makeTestPlayer("LT", { gamesStarted: 14, sacks: 2 });
    expect(getStatLine(player)).toBe("14 GS");
  });

  it("formats DL stats (DE1, DE2, DT1, DT2)", () => {
    const player = makeTestPlayer("DE1", { tackles: 45, sacks: 8.5, tfl: 10, ff: 2 });
    expect(getStatLine(player)).toBe("8.5 sacks");
  });

  it("formats LB stats", () => {
    const player = makeTestPlayer("LB1", { tackles: 95, sacks: 4.5, tfl: 8, int: 1 });
    expect(getStatLine(player)).toBe("95 tkl / 4.5 sacks");
  });

  it("formats CB stats", () => {
    const player = makeTestPlayer("CB1", { tackles: 58, int: 3, pd: 12, ff: 1 });
    expect(getStatLine(player)).toBe("3 INT / 12 PD");
  });

  it("formats S stats (SS, FS)", () => {
    const player = makeTestPlayer("SS", { tackles: 75, int: 2, pd: 8, ff: 1 });
    expect(getStatLine(player)).toBe("75 tkl / 2 INT");
  });

  it("formats K stats", () => {
    const player = makeTestPlayer("K", { fgMade: 28, fgAtt: 32, xpMade: 40, longFG: 55 });
    expect(getStatLine(player)).toBe("28/32 FG");
  });

  it("formats P stats", () => {
    const player = makeTestPlayer("P", { punts: 60, puntAvg: 45.2, inside20: 25, longPunt: 62 });
    expect(getStatLine(player)).toBe("45.2 avg");
  });

  it("returns empty string for KR", () => {
    const player = makeTestPlayer("KR", { krYds: 500, krAvg: 24.0, krTD: 1, krLong: 98 });
    expect(getStatLine(player)).toBe("");
  });

  it("returns empty string for PR", () => {
    const player = makeTestPlayer("PR", { prYds: 200, prAvg: 10.0, prTD: 0, prLong: 45 });
    expect(getStatLine(player)).toBe("");
  });

  it("returns empty string for LS", () => {
    const player = makeTestPlayer("LS", { gamesPlayed: 17, badSnaps: 0 });
    expect(getStatLine(player)).toBe("");
  });

  it("handles zero stats gracefully", () => {
    const player = makeTestPlayer("QB", { passYds: 0, passTD: 0, int: 0, qbr: 0 });
    expect(getStatLine(player)).toBe("0 yds / 0 TD");
  });
});
