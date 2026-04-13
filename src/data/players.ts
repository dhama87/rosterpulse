import { Player } from "@/types";

// Helper to generate player ID
const pid = (team: string, position: string, depth: number): string =>
  `${team}-${position}-${depth}`;

type PositionGroup = "offense" | "defense" | "specialTeams";
type InjuryStatus = "Active" | "Questionable" | "Doubtful" | "Out" | "IR" | "Suspended" | "Holdout";

interface PlayerInput {
  pos: string;
  pg: PositionGroup;
  d: number;
  name: string;
  num: number;
  h: string;
  w: string;
  age: number;
  col: string;
  exp: number;
  inj?: InjuryStatus;
  injD?: string;
  stats: Record<string, number>;
}

function makePlayer(team: string, p: PlayerInput): Player {
  return {
    id: pid(team, p.pos, p.d),
    name: p.name,
    team,
    position: p.pos,
    positionGroup: p.pg,
    depthOrder: p.d,
    jerseyNumber: p.num,
    height: p.h,
    weight: p.w,
    age: p.age,
    college: p.col,
    experience: p.exp,
    injuryStatus: p.inj ?? "Active",
    ...(p.injD ? { injuryDetail: p.injD } : {}),
    stats: p.stats,
  };
}

// Generates 2-deep rosters for all 26 non-showcase teams
function generateNonShowcaseTeams(): Player[] {
  const o: PositionGroup = "offense";
  const d: PositionGroup = "defense";
  const st: PositionGroup = "specialTeams";

  // Each team entry: [teamId, [...players]]
  const teamData: [string, PlayerInput[]][] = [
    // === BALTIMORE RAVENS ===
    ["BAL", [
      { pos: "QB", pg: o, d: 1, name: "Lamar Jackson", num: 8, h: "6-2", w: "212", age: 27, col: "Louisville", exp: 7, stats: { passYds: 3678, passTD: 24, int: 7, qbr: 96.4 } },
      { pos: "QB", pg: o, d: 2, name: "Tyler Huntley", num: 2, h: "6-1", w: "196", age: 26, col: "Utah", exp: 4, stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
      { pos: "RB", pg: o, d: 1, name: "Derrick Henry", num: 22, h: "6-3", w: "247", age: 30, col: "Alabama", exp: 9, stats: { rushYds: 1450, rushTD: 13, ypc: 5.0, rec: 20 } },
      { pos: "RB", pg: o, d: 2, name: "Justice Hill", num: 43, h: "5-10", w: "198", age: 26, col: "Oklahoma State", exp: 6, stats: { rushYds: 250, rushTD: 2, ypc: 4.3, rec: 18 } },
      { pos: "WR1", pg: o, d: 1, name: "Zay Flowers", num: 4, h: "5-9", w: "182", age: 24, col: "Boston College", exp: 2, stats: { recYds: 858, recTD: 5, rec: 68, targets: 100 } },
      { pos: "WR1", pg: o, d: 2, name: "Rashod Bateman", num: 7, h: "6-1", w: "193", age: 25, col: "Minnesota", exp: 4, stats: { recYds: 350, recTD: 2, rec: 30, targets: 45 } },
      { pos: "WR2", pg: o, d: 1, name: "Rashod Bateman", num: 7, h: "6-1", w: "193", age: 25, col: "Minnesota", exp: 4, stats: { recYds: 350, recTD: 2, rec: 30, targets: 45 } },
      { pos: "WR2", pg: o, d: 2, name: "Nelson Agholor", num: 15, h: "6-0", w: "198", age: 31, col: "USC", exp: 10, stats: { recYds: 200, recTD: 1, rec: 18, targets: 28 } },
      { pos: "WR3", pg: o, d: 1, name: "Nelson Agholor", num: 15, h: "6-0", w: "198", age: 31, col: "USC", exp: 10, stats: { recYds: 200, recTD: 1, rec: 18, targets: 28 } },
      { pos: "WR3", pg: o, d: 2, name: "Devin Duvernay", num: 13, h: "5-11", w: "210", age: 27, col: "Texas", exp: 5, stats: { recYds: 100, recTD: 0, rec: 10, targets: 15 } },
      { pos: "TE", pg: o, d: 1, name: "Mark Andrews", num: 89, h: "6-5", w: "256", age: 29, col: "Oklahoma", exp: 7, stats: { recYds: 700, recTD: 6, rec: 55, targets: 75 } },
      { pos: "TE", pg: o, d: 2, name: "Isaiah Likely", num: 80, h: "6-4", w: "245", age: 25, col: "Coastal Carolina", exp: 3, stats: { recYds: 350, recTD: 3, rec: 28, targets: 40 } },
      { pos: "LT", pg: o, d: 1, name: "Ronnie Stanley", num: 79, h: "6-6", w: "312", age: 30, col: "Notre Dame", exp: 9, stats: { gamesStarted: 14, sacks: 2 } },
      { pos: "LT", pg: o, d: 2, name: "Patrick Mekari", num: 65, h: "6-4", w: "310", age: 27, col: "UC Berkeley", exp: 6, stats: { gamesStarted: 3, sacks: 0 } },
      { pos: "LG", pg: o, d: 1, name: "Andrew Vorhees", num: 63, h: "6-6", w: "315", age: 25, col: "USC", exp: 2, stats: { gamesStarted: 15, sacks: 1 } },
      { pos: "LG", pg: o, d: 2, name: "Patrick Mekari", num: 65, h: "6-4", w: "310", age: 27, col: "UC Berkeley", exp: 6, stats: { gamesStarted: 2, sacks: 0 } },
      { pos: "C", pg: o, d: 1, name: "Tyler Linderbaum", num: 64, h: "6-2", w: "302", age: 25, col: "Iowa", exp: 3, stats: { gamesStarted: 17, sacks: 0 } },
      { pos: "C", pg: o, d: 2, name: "Patrick Mekari", num: 65, h: "6-4", w: "310", age: 27, col: "UC Berkeley", exp: 6, stats: { gamesStarted: 1, sacks: 0 } },
      { pos: "RG", pg: o, d: 1, name: "Kevin Zeitler", num: 70, h: "6-4", w: "315", age: 34, col: "Wisconsin", exp: 13, stats: { gamesStarted: 16, sacks: 1 } },
      { pos: "RG", pg: o, d: 2, name: "Ben Cleveland", num: 74, h: "6-6", w: "357", age: 27, col: "Georgia", exp: 4, stats: { gamesStarted: 2, sacks: 0 } },
      { pos: "RT", pg: o, d: 1, name: "Morgan Moses", num: 78, h: "6-6", w: "318", age: 33, col: "Virginia", exp: 11, stats: { gamesStarted: 17, sacks: 3 } },
      { pos: "RT", pg: o, d: 2, name: "Patrick Mekari", num: 65, h: "6-4", w: "310", age: 27, col: "UC Berkeley", exp: 6, stats: { gamesStarted: 1, sacks: 0 } },
      { pos: "DE1", pg: d, d: 1, name: "Odafe Oweh", num: 99, h: "6-5", w: "257", age: 25, col: "Penn State", exp: 4, stats: { tackles: 45, sacks: 8.0, tfl: 10, ff: 2 } },
      { pos: "DE1", pg: d, d: 2, name: "David Ojabo", num: 90, h: "6-5", w: "250", age: 24, col: "Michigan", exp: 3, stats: { tackles: 20, sacks: 3.0, tfl: 4, ff: 0 } },
      { pos: "DE2", pg: d, d: 1, name: "Kyle Van Noy", num: 44, h: "6-3", w: "250", age: 33, col: "BYU", exp: 11, stats: { tackles: 38, sacks: 5.5, tfl: 7, ff: 1 } },
      { pos: "DE2", pg: d, d: 2, name: "David Ojabo", num: 90, h: "6-5", w: "250", age: 24, col: "Michigan", exp: 3, stats: { tackles: 20, sacks: 3.0, tfl: 4, ff: 0 } },
      { pos: "DT1", pg: d, d: 1, name: "Justin Madubuike", num: 92, h: "6-3", w: "304", age: 27, col: "Texas A&M", exp: 5, stats: { tackles: 50, sacks: 8.0, tfl: 12, ff: 2 } },
      { pos: "DT1", pg: d, d: 2, name: "Broderick Washington", num: 96, h: "6-2", w: "310", age: 28, col: "Texas Tech", exp: 5, stats: { tackles: 20, sacks: 1.0, tfl: 3, ff: 0 } },
      { pos: "DT2", pg: d, d: 1, name: "Broderick Washington", num: 96, h: "6-2", w: "310", age: 28, col: "Texas Tech", exp: 5, stats: { tackles: 25, sacks: 1.5, tfl: 3, ff: 0 } },
      { pos: "DT2", pg: d, d: 2, name: "Travis Jones", num: 97, h: "6-4", w: "325", age: 25, col: "UConn", exp: 3, stats: { tackles: 15, sacks: 0.5, tfl: 2, ff: 0 } },
      { pos: "LB1", pg: d, d: 1, name: "Roquan Smith", num: 0, h: "6-1", w: "236", age: 27, col: "Georgia", exp: 7, stats: { tackles: 135, sacks: 3.5, tfl: 10, int: 2 } },
      { pos: "LB1", pg: d, d: 2, name: "Trenton Simpson", num: 22, h: "6-1", w: "230", age: 23, col: "Clemson", exp: 2, stats: { tackles: 40, sacks: 1.0, tfl: 3, int: 0 } },
      { pos: "LB2", pg: d, d: 1, name: "Trenton Simpson", num: 22, h: "6-1", w: "230", age: 23, col: "Clemson", exp: 2, stats: { tackles: 55, sacks: 1.5, tfl: 4, int: 0 } },
      { pos: "LB2", pg: d, d: 2, name: "Del'Shawn Phillips", num: 51, h: "6-1", w: "228", age: 26, col: "Illinois", exp: 3, stats: { tackles: 15, sacks: 0, tfl: 1, int: 0 } },
      { pos: "LB3", pg: d, d: 1, name: "Del'Shawn Phillips", num: 51, h: "6-1", w: "228", age: 26, col: "Illinois", exp: 3, stats: { tackles: 20, sacks: 0, tfl: 1, int: 0 } },
      { pos: "LB3", pg: d, d: 2, name: "Malik Harrison", num: 40, h: "6-3", w: "247", age: 26, col: "Ohio State", exp: 5, stats: { tackles: 10, sacks: 0, tfl: 0, int: 0 } },
      { pos: "CB1", pg: d, d: 1, name: "Marlon Humphrey", num: 44, h: "6-0", w: "197", age: 28, col: "Alabama", exp: 8, stats: { tackles: 55, int: 3, pd: 12, ff: 1 } },
      { pos: "CB1", pg: d, d: 2, name: "Brandon Stephens", num: 21, h: "6-1", w: "215", age: 28, col: "SMU", exp: 4, stats: { tackles: 30, int: 1, pd: 5, ff: 0 } },
      { pos: "CB2", pg: d, d: 1, name: "Brandon Stephens", num: 21, h: "6-1", w: "215", age: 28, col: "SMU", exp: 4, stats: { tackles: 45, int: 2, pd: 8, ff: 0 } },
      { pos: "CB2", pg: d, d: 2, name: "Arthur Maulet", num: 10, h: "5-10", w: "190", age: 30, col: "Memphis", exp: 6, stats: { tackles: 20, int: 0, pd: 3, ff: 0 } },
      { pos: "SS", pg: d, d: 1, name: "Kyle Hamilton", num: 14, h: "6-4", w: "220", age: 24, col: "Notre Dame", exp: 3, stats: { tackles: 80, int: 3, pd: 10, ff: 2 } },
      { pos: "SS", pg: d, d: 2, name: "Geno Stone", num: 26, h: "5-11", w: "210", age: 25, col: "Iowa", exp: 4, stats: { tackles: 30, int: 1, pd: 3, ff: 0 } },
      { pos: "FS", pg: d, d: 1, name: "Geno Stone", num: 26, h: "5-11", w: "210", age: 25, col: "Iowa", exp: 4, stats: { tackles: 60, int: 4, pd: 8, ff: 0 } },
      { pos: "FS", pg: d, d: 2, name: "Ar'Darius Washington", num: 29, h: "5-8", w: "178", age: 24, col: "TCU", exp: 3, stats: { tackles: 15, int: 0, pd: 2, ff: 0 } },
      { pos: "K", pg: st, d: 1, name: "Justin Tucker", num: 9, h: "6-1", w: "188", age: 34, col: "Texas", exp: 13, stats: { fgMade: 30, fgAtt: 33, xpMade: 40, longFG: 62 } },
      { pos: "K", pg: st, d: 2, name: "Tyler Huntley", num: 2, h: "6-1", w: "196", age: 26, col: "Utah", exp: 4, stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
      { pos: "P", pg: st, d: 1, name: "Jordan Stout", num: 11, h: "6-3", w: "209", age: 26, col: "Penn State", exp: 3, stats: { punts: 50, puntAvg: 46.0, inside20: 21, longPunt: 60 } },
      { pos: "P", pg: st, d: 2, name: "Justin Tucker", num: 9, h: "6-1", w: "188", age: 34, col: "Texas", exp: 13, stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
      { pos: "KR", pg: st, d: 1, name: "Devin Duvernay", num: 13, h: "5-11", w: "210", age: 27, col: "Texas", exp: 5, stats: { krYds: 400, krAvg: 24.0, krTD: 1, krLong: 98 } },
      { pos: "KR", pg: st, d: 2, name: "Justice Hill", num: 43, h: "5-10", w: "198", age: 26, col: "Oklahoma State", exp: 6, stats: { krYds: 80, krAvg: 20.0, krTD: 0, krLong: 25 } },
      { pos: "PR", pg: st, d: 1, name: "Devin Duvernay", num: 13, h: "5-11", w: "210", age: 27, col: "Texas", exp: 5, stats: { prYds: 180, prAvg: 9.5, prTD: 0, prLong: 25 } },
      { pos: "PR", pg: st, d: 2, name: "Zay Flowers", num: 4, h: "5-9", w: "182", age: 24, col: "Boston College", exp: 2, stats: { prYds: 20, prAvg: 5.0, prTD: 0, prLong: 10 } },
      { pos: "LS", pg: st, d: 1, name: "Nick Moore", num: 46, h: "6-1", w: "240", age: 32, col: "Georgia", exp: 8, stats: { gamesPlayed: 17, badSnaps: 0 } },
      { pos: "LS", pg: st, d: 2, name: "Tyler Linderbaum", num: 64, h: "6-2", w: "302", age: 25, col: "Iowa", exp: 3, stats: { gamesPlayed: 0, badSnaps: 0 } },
    ]],

    // === CINCINNATI BENGALS ===
    ["CIN", [
      { pos: "QB", pg: o, d: 1, name: "Joe Burrow", num: 9, h: "6-4", w: "221", age: 28, col: "LSU", exp: 5, stats: { passYds: 4475, passTD: 34, int: 9, qbr: 98.0 } },
      { pos: "QB", pg: o, d: 2, name: "Jake Browning", num: 6, h: "6-2", w: "212", age: 28, col: "Washington", exp: 3, stats: { passYds: 200, passTD: 1, int: 1, qbr: 70.0 } },
      { pos: "RB", pg: o, d: 1, name: "Joe Mixon", num: 28, h: "6-1", w: "220", age: 28, col: "Oklahoma", exp: 8, stats: { rushYds: 950, rushTD: 8, ypc: 4.2, rec: 30 } },
      { pos: "RB", pg: o, d: 2, name: "Chase Brown", num: 30, h: "5-9", w: "205", age: 24, col: "Illinois", exp: 2, stats: { rushYds: 200, rushTD: 1, ypc: 4.0, rec: 10 } },
      { pos: "WR1", pg: o, d: 1, name: "Ja'Marr Chase", num: 1, h: "6-0", w: "201", age: 24, col: "LSU", exp: 4, stats: { recYds: 1380, recTD: 12, rec: 98, targets: 138 } },
      { pos: "WR1", pg: o, d: 2, name: "Andrei Iosivas", num: 80, h: "6-3", w: "205", age: 25, col: "Princeton", exp: 2, stats: { recYds: 220, recTD: 2, rec: 18, targets: 28 } },
      { pos: "WR2", pg: o, d: 1, name: "Tee Higgins", num: 5, h: "6-4", w: "219", age: 25, col: "Clemson", exp: 5, stats: { recYds: 950, recTD: 7, rec: 60, targets: 90 } },
      { pos: "WR2", pg: o, d: 2, name: "Trenton Irwin", num: 16, h: "6-0", w: "199", age: 28, col: "Stanford", exp: 4, stats: { recYds: 120, recTD: 1, rec: 12, targets: 18 } },
      { pos: "WR3", pg: o, d: 1, name: "Andrei Iosivas", num: 80, h: "6-3", w: "205", age: 25, col: "Princeton", exp: 2, stats: { recYds: 220, recTD: 2, rec: 18, targets: 28 } },
      { pos: "WR3", pg: o, d: 2, name: "Trenton Irwin", num: 16, h: "6-0", w: "199", age: 28, col: "Stanford", exp: 4, stats: { recYds: 120, recTD: 1, rec: 12, targets: 18 } },
      { pos: "TE", pg: o, d: 1, name: "Irv Smith Jr.", num: 81, h: "6-2", w: "242", age: 26, col: "Alabama", exp: 6, stats: { recYds: 280, recTD: 2, rec: 28, targets: 38 } },
      { pos: "TE", pg: o, d: 2, name: "Drew Sample", num: 89, h: "6-5", w: "255", age: 28, col: "Washington", exp: 6, stats: { recYds: 80, recTD: 0, rec: 10, targets: 14 } },
      { pos: "LT", pg: o, d: 1, name: "Orlando Brown Jr.", num: 75, h: "6-8", w: "345", age: 28, col: "Oklahoma", exp: 7, stats: { gamesStarted: 16, sacks: 3 } },
      { pos: "LT", pg: o, d: 2, name: "Jackson Carman", num: 79, h: "6-5", w: "317", age: 25, col: "Clemson", exp: 4, stats: { gamesStarted: 2, sacks: 0 } },
      { pos: "LG", pg: o, d: 1, name: "Cordell Volson", num: 67, h: "6-6", w: "315", age: 27, col: "North Dakota State", exp: 3, stats: { gamesStarted: 16, sacks: 2 } },
      { pos: "LG", pg: o, d: 2, name: "Jackson Carman", num: 79, h: "6-5", w: "317", age: 25, col: "Clemson", exp: 4, stats: { gamesStarted: 1, sacks: 0 } },
      { pos: "C", pg: o, d: 1, name: "Ted Karras", num: 64, h: "6-4", w: "305", age: 31, col: "Illinois", exp: 8, stats: { gamesStarted: 17, sacks: 0 } },
      { pos: "C", pg: o, d: 2, name: "Trey Hill", num: 63, h: "6-3", w: "305", age: 25, col: "Georgia", exp: 3, stats: { gamesStarted: 1, sacks: 0 } },
      { pos: "RG", pg: o, d: 1, name: "Alex Cappa", num: 65, h: "6-6", w: "305", age: 29, col: "Humboldt State", exp: 7, stats: { gamesStarted: 15, sacks: 1 } },
      { pos: "RG", pg: o, d: 2, name: "Trey Hill", num: 63, h: "6-3", w: "305", age: 25, col: "Georgia", exp: 3, stats: { gamesStarted: 2, sacks: 0 } },
      { pos: "RT", pg: o, d: 1, name: "Jonah Williams", num: 73, h: "6-4", w: "312", age: 27, col: "Alabama", exp: 6, stats: { gamesStarted: 14, sacks: 3 } },
      { pos: "RT", pg: o, d: 2, name: "Jackson Carman", num: 79, h: "6-5", w: "317", age: 25, col: "Clemson", exp: 4, stats: { gamesStarted: 3, sacks: 1 } },
      { pos: "DE1", pg: d, d: 1, name: "Trey Hendrickson", num: 91, h: "6-4", w: "270", age: 30, col: "Florida Atlantic", exp: 8, stats: { tackles: 40, sacks: 14.0, tfl: 15, ff: 4 } },
      { pos: "DE1", pg: d, d: 2, name: "Joseph Ossai", num: 58, h: "6-4", w: "253", age: 25, col: "Texas", exp: 3, stats: { tackles: 18, sacks: 3.0, tfl: 4, ff: 0 } },
      { pos: "DE2", pg: d, d: 1, name: "Sam Hubbard", num: 94, h: "6-5", w: "265", age: 29, col: "Ohio State", exp: 7, stats: { tackles: 45, sacks: 7.0, tfl: 9, ff: 2 } },
      { pos: "DE2", pg: d, d: 2, name: "Joseph Ossai", num: 58, h: "6-4", w: "253", age: 25, col: "Texas", exp: 3, stats: { tackles: 18, sacks: 3.0, tfl: 4, ff: 0 } },
      { pos: "DT1", pg: d, d: 1, name: "B.J. Hill", num: 86, h: "6-3", w: "311", age: 28, col: "NC State", exp: 7, stats: { tackles: 42, sacks: 4.0, tfl: 6, ff: 1 } },
      { pos: "DT1", pg: d, d: 2, name: "Jay Tufele", num: 73, h: "6-3", w: "305", age: 25, col: "USC", exp: 4, stats: { tackles: 15, sacks: 1.0, tfl: 2, ff: 0 } },
      { pos: "DT2", pg: d, d: 1, name: "Jay Tufele", num: 73, h: "6-3", w: "305", age: 25, col: "USC", exp: 4, stats: { tackles: 25, sacks: 1.5, tfl: 3, ff: 0 } },
      { pos: "DT2", pg: d, d: 2, name: "Sheldon Rankins", num: 98, h: "6-1", w: "305", age: 30, col: "Louisville", exp: 9, stats: { tackles: 12, sacks: 0.5, tfl: 1, ff: 0 } },
      { pos: "LB1", pg: d, d: 1, name: "Logan Wilson", num: 55, h: "6-2", w: "241", age: 28, col: "Wyoming", exp: 5, stats: { tackles: 110, sacks: 2.0, tfl: 6, int: 2 } },
      { pos: "LB1", pg: d, d: 2, name: "Akeem Davis-Gaither", num: 59, h: "6-2", w: "224", age: 27, col: "Appalachian State", exp: 5, stats: { tackles: 30, sacks: 0.5, tfl: 2, int: 0 } },
      { pos: "LB2", pg: d, d: 1, name: "Germaine Pratt", num: 57, h: "6-3", w: "240", age: 28, col: "NC State", exp: 6, stats: { tackles: 85, sacks: 1.5, tfl: 5, int: 1 } },
      { pos: "LB2", pg: d, d: 2, name: "Akeem Davis-Gaither", num: 59, h: "6-2", w: "224", age: 27, col: "Appalachian State", exp: 5, stats: { tackles: 30, sacks: 0.5, tfl: 2, int: 0 } },
      { pos: "LB3", pg: d, d: 1, name: "Akeem Davis-Gaither", num: 59, h: "6-2", w: "224", age: 27, col: "Appalachian State", exp: 5, stats: { tackles: 40, sacks: 0.5, tfl: 3, int: 0 } },
      { pos: "LB3", pg: d, d: 2, name: "Joe Bachie", num: 34, h: "6-1", w: "233", age: 27, col: "Michigan State", exp: 4, stats: { tackles: 10, sacks: 0, tfl: 0, int: 0 } },
      { pos: "CB1", pg: d, d: 1, name: "DJ Turner II", num: 29, h: "5-11", w: "178", age: 24, col: "Michigan", exp: 2, stats: { tackles: 40, int: 2, pd: 10, ff: 0 } },
      { pos: "CB1", pg: d, d: 2, name: "Cam Taylor-Britt", num: 29, h: "5-11", w: "196", age: 25, col: "Nebraska", exp: 3, stats: { tackles: 25, int: 1, pd: 5, ff: 0 } },
      { pos: "CB2", pg: d, d: 1, name: "Cam Taylor-Britt", num: 29, h: "5-11", w: "196", age: 25, col: "Nebraska", exp: 3, stats: { tackles: 50, int: 2, pd: 8, ff: 0 } },
      { pos: "CB2", pg: d, d: 2, name: "Allan George", num: 35, h: "6-1", w: "192", age: 23, col: "Vanderbilt", exp: 1, stats: { tackles: 10, int: 0, pd: 2, ff: 0 } },
      { pos: "SS", pg: d, d: 1, name: "Vonn Bell", num: 24, h: "5-11", w: "205", age: 29, col: "Ohio State", exp: 9, stats: { tackles: 68, int: 1, pd: 5, ff: 1 } },
      { pos: "SS", pg: d, d: 2, name: "Jordan Battle", num: 22, h: "6-1", w: "210", age: 24, col: "Alabama", exp: 2, stats: { tackles: 25, int: 0, pd: 2, ff: 0 } },
      { pos: "FS", pg: d, d: 1, name: "Dax Hill", num: 23, h: "6-0", w: "191", age: 24, col: "Michigan", exp: 3, stats: { tackles: 55, int: 2, pd: 6, ff: 0 } },
      { pos: "FS", pg: d, d: 2, name: "Jordan Battle", num: 22, h: "6-1", w: "210", age: 24, col: "Alabama", exp: 2, stats: { tackles: 25, int: 0, pd: 2, ff: 0 } },
      { pos: "K", pg: st, d: 1, name: "Evan McPherson", num: 2, h: "5-11", w: "185", age: 25, col: "Florida", exp: 4, stats: { fgMade: 28, fgAtt: 33, xpMade: 38, longFG: 58 } },
      { pos: "K", pg: st, d: 2, name: "Jake Browning", num: 6, h: "6-2", w: "212", age: 28, col: "Washington", exp: 3, stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
      { pos: "P", pg: st, d: 1, name: "Drue Chrisman", num: 3, h: "6-3", w: "220", age: 27, col: "Ohio State", exp: 3, stats: { punts: 50, puntAvg: 44.5, inside20: 18, longPunt: 58 } },
      { pos: "P", pg: st, d: 2, name: "Evan McPherson", num: 2, h: "5-11", w: "185", age: 25, col: "Florida", exp: 4, stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
      { pos: "KR", pg: st, d: 1, name: "Andrei Iosivas", num: 80, h: "6-3", w: "205", age: 25, col: "Princeton", exp: 2, stats: { krYds: 300, krAvg: 22.0, krTD: 0, krLong: 35 } },
      { pos: "KR", pg: st, d: 2, name: "Chase Brown", num: 30, h: "5-9", w: "205", age: 24, col: "Illinois", exp: 2, stats: { krYds: 80, krAvg: 20.0, krTD: 0, krLong: 25 } },
      { pos: "PR", pg: st, d: 1, name: "Andrei Iosivas", num: 80, h: "6-3", w: "205", age: 25, col: "Princeton", exp: 2, stats: { prYds: 100, prAvg: 8.0, prTD: 0, prLong: 18 } },
      { pos: "PR", pg: st, d: 2, name: "Trenton Irwin", num: 16, h: "6-0", w: "199", age: 28, col: "Stanford", exp: 4, stats: { prYds: 20, prAvg: 5.0, prTD: 0, prLong: 8 } },
      { pos: "LS", pg: st, d: 1, name: "Cal Adomitis", num: 48, h: "6-1", w: "240", age: 27, col: "Pittsburgh", exp: 3, stats: { gamesPlayed: 17, badSnaps: 0 } },
      { pos: "LS", pg: st, d: 2, name: "Ted Karras", num: 64, h: "6-4", w: "305", age: 31, col: "Illinois", exp: 8, stats: { gamesPlayed: 0, badSnaps: 0 } },
    ]],
  ];

  // For the remaining 24 teams, we'll use a compact generator approach
  // that creates proper 2-deep rosters with real player names
  const remainingTeams = createRemainingTeamRosters();

  const result: Player[] = [];
  for (const [teamId, playerInputs] of teamData) {
    for (const p of playerInputs) {
      result.push(makePlayer(teamId, p));
    }
  }
  return [...result, ...remainingTeams];
}

// Creates 2-deep rosters for the remaining 24 non-showcase teams
function createRemainingTeamRosters(): Player[] {
  const o: PositionGroup = "offense";
  const d: PositionGroup = "defense";
  const st: PositionGroup = "specialTeams";

  interface TeamRosterDef {
    id: string;
    starters: [string, string, number, string, string, number, string, number, Record<string, number>, InjuryStatus?, string?][];
    // [pos, name, num, height, weight, age, college, exp, stats, injuryStatus?, injuryDetail?]
  }

  const posGroups: Record<string, PositionGroup> = {
    QB: o, RB: o, WR1: o, WR2: o, WR3: o, TE: o, LT: o, LG: o, C: o, RG: o, RT: o,
    DE1: d, DE2: d, DT1: d, DT2: d, LB1: d, LB2: d, LB3: d, CB1: d, CB2: d, SS: d, FS: d,
    K: st, P: st, KR: st, PR: st, LS: st,
  };

  // Compact format: each row = [position, name, jersey#, height, weight, age, college, exp, stats, injStatus?, injDetail?]
  type R = [string, string, number, string, string, number, string, number, Record<string, number>, InjuryStatus?, string?];

  function teamPlayers(teamId: string, rows: R[]): Player[] {
    return rows.map((r) => ({
      id: pid(teamId, r[0].replace(/-\d$/, ""), parseInt(r[0].slice(-1)) || 1),
      name: r[1],
      team: teamId,
      position: r[0].replace(/-\d$/, ""),
      positionGroup: posGroups[r[0].replace(/-\d$/, "")],
      depthOrder: parseInt(r[0].slice(-1)) || 1,
      jerseyNumber: r[2],
      height: r[3],
      weight: r[4].toString(),
      age: r[5],
      college: r[6],
      experience: r[7],
      injuryStatus: r[8] as unknown as InjuryStatus ?? "Active",
      ...(r[10] ? { injuryDetail: r[10] } : {}),
      stats: r[8] as unknown as Record<string, number>,
    }));
  }

  // Actually, this compact approach has issues with type indexing. Let me use a simpler approach.
  // I'll define each team's roster using the makePlayer helper directly.

  const result: Player[] = [];

  function add(team: string, pos: string, depth: number, name: string, num: number, h: string, w: string, age: number, col: string, exp: number, stats: Record<string, number>, inj?: InjuryStatus, injD?: string) {
    result.push(makePlayer(team, { pos, pg: posGroups[pos], d: depth, name, num, h, w, age, col, exp, stats, inj, injD }));
  }

  // Default backup stats generators
  const qbB = { passYds: 0, passTD: 0, int: 0, qbr: 0 };
  const rbB = { rushYds: 150, rushTD: 1, ypc: 3.8, rec: 8 };
  const wrB = { recYds: 100, recTD: 0, rec: 10, targets: 15 };
  const teB = { recYds: 60, recTD: 0, rec: 8, targets: 12 };
  const olB = { gamesStarted: 2, sacks: 0 };
  const dlB = { tackles: 15, sacks: 1.0, tfl: 2, ff: 0 };
  const lbB = { tackles: 25, sacks: 0.5, tfl: 2, int: 0 };
  const cbB = { tackles: 20, int: 0, pd: 3, ff: 0 };
  const sB = { tackles: 20, int: 0, pd: 2, ff: 0 };
  const kB = { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 };
  const pB = { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 };
  const krB = { krYds: 0, krAvg: 0, krTD: 0, krLong: 0 };
  const prB = { prYds: 0, prAvg: 0, prTD: 0, prLong: 0 };
  const lsB = { gamesPlayed: 0, badSnaps: 0 };

  // CLE
  add("CLE","QB",1,"Deshaun Watson",4,"6-2","215",29,"Clemson",7,{passYds:1100,passTD:7,int:4,qbr:72.0},"IR","Shoulder — placed on IR");
  add("CLE","QB",2,"Joe Flacco",15,"6-6","236",39,"Delaware",16,{passYds:1600,passTD:13,int:4,qbr:85.0});
  add("CLE","RB",1,"Nick Chubb",24,"5-11","227",28,"Georgia",7,{rushYds:400,rushTD:3,ypc:4.5,rec:12},"Questionable","Knee — limited practice");
  add("CLE","RB",2,"Jerome Ford",34,"5-11","210",25,"Cincinnati",3,rbB);
  add("CLE","WR1",1,"Amari Cooper",2,"6-1","210",30,"Alabama",10,{recYds:980,recTD:7,rec:68,targets:100});
  add("CLE","WR1",2,"Elijah Moore",8,"5-10","178",24,"Ole Miss",4,wrB);
  add("CLE","WR2",1,"Elijah Moore",8,"5-10","178",24,"Ole Miss",4,{recYds:350,recTD:3,rec:30,targets:48});
  add("CLE","WR2",2,"Cedric Tillman",19,"6-3","213",24,"Tennessee",2,wrB);
  add("CLE","WR3",1,"Cedric Tillman",19,"6-3","213",24,"Tennessee",2,{recYds:200,recTD:1,rec:18,targets:28});
  add("CLE","WR3",2,"Marquise Goodwin",84,"5-9","179",33,"Texas",10,wrB);
  add("CLE","TE",1,"David Njoku",85,"6-4","246",28,"Miami",7,{recYds:600,recTD:5,rec:50,targets:65});
  add("CLE","TE",2,"Harrison Bryant",88,"6-5","240",26,"FAU",4,teB);
  add("CLE","LT",1,"Jedrick Wills Jr.",71,"6-4","312",25,"Alabama",5,{gamesStarted:14,sacks:3});
  add("CLE","LT",2,"James Hudson III",66,"6-5","312",25,"Cincinnati",4,olB);
  add("CLE","LG",1,"Joel Bitonio",75,"6-4","305",33,"Nevada",11,{gamesStarted:17,sacks:0});
  add("CLE","LG",2,"James Hudson III",66,"6-5","312",25,"Cincinnati",4,olB);
  add("CLE","C",1,"Ethan Pocic",55,"6-6","310",29,"LSU",7,{gamesStarted:16,sacks:0});
  add("CLE","C",2,"Nick Harris",53,"6-1","302",26,"Washington",4,olB);
  add("CLE","RG",1,"Wyatt Teller",77,"6-4","315",30,"Virginia Tech",7,{gamesStarted:15,sacks:1});
  add("CLE","RG",2,"Nick Harris",53,"6-1","302",26,"Washington",4,olB);
  add("CLE","RT",1,"Jack Conklin",78,"6-6","308",30,"Michigan State",9,{gamesStarted:12,sacks:3});
  add("CLE","RT",2,"James Hudson III",66,"6-5","312",25,"Cincinnati",4,olB);
  add("CLE","DE1",1,"Myles Garrett",95,"6-4","272",28,"Texas A&M",8,{tackles:50,sacks:14.0,tfl:15,ff:4});
  add("CLE","DE1",2,"Ogbo Okoronkwo",45,"6-2","247",29,"Oklahoma",6,dlB);
  add("CLE","DE2",1,"Za'Darius Smith",99,"6-4","275",31,"Kentucky",9,{tackles:40,sacks:7.0,tfl:9,ff:1});
  add("CLE","DE2",2,"Ogbo Okoronkwo",45,"6-2","247",29,"Oklahoma",6,dlB);
  add("CLE","DT1",1,"Dalvin Tomlinson",94,"6-3","325",30,"Alabama",8,{tackles:38,sacks:3.0,tfl:6,ff:0});
  add("CLE","DT1",2,"Shelby Harris",93,"6-2","288",32,"Illinois State",9,dlB);
  add("CLE","DT2",1,"Shelby Harris",93,"6-2","288",32,"Illinois State",9,{tackles:28,sacks:2.0,tfl:4,ff:0});
  add("CLE","DT2",2,"Maurice Hurst",73,"6-1","290",29,"Michigan",7,dlB);
  add("CLE","LB1",1,"Jeremiah Owusu-Koramoah",6,"6-1","221",25,"Notre Dame",4,{tackles:100,sacks:3.0,tfl:8,int:2});
  add("CLE","LB1",2,"Anthony Walker Jr.",5,"6-1","232",29,"Northwestern",7,lbB);
  add("CLE","LB2",1,"Anthony Walker Jr.",5,"6-1","232",29,"Northwestern",7,{tackles:75,sacks:1.0,tfl:4,int:0});
  add("CLE","LB2",2,"Deion Jones",45,"6-1","227",29,"LSU",8,lbB);
  add("CLE","LB3",1,"Deion Jones",45,"6-1","227",29,"LSU",8,{tackles:40,sacks:0.5,tfl:2,int:0});
  add("CLE","LB3",2,"Jordan Hicks",48,"6-1","236",32,"Texas",10,lbB);
  add("CLE","CB1",1,"Denzel Ward",21,"5-11","190",27,"Ohio State",7,{tackles:48,int:3,pd:14,ff:0});
  add("CLE","CB1",2,"Greg Newsome II",0,"6-1","190",24,"Northwestern",4,cbB);
  add("CLE","CB2",1,"Greg Newsome II",0,"6-1","190",24,"Northwestern",4,{tackles:42,int:2,pd:10,ff:0});
  add("CLE","CB2",2,"Martin Emerson Jr.",23,"6-2","205",24,"Mississippi State",3,cbB);
  add("CLE","SS",1,"Grant Delpit",22,"6-2","213",25,"LSU",4,{tackles:65,int:2,pd:6,ff:1});
  add("CLE","SS",2,"Ronnie Harrison Jr.",33,"6-3","214",27,"Alabama",7,sB);
  add("CLE","FS",1,"Juan Thornhill",3,"6-0","205",29,"Virginia",6,{tackles:55,int:2,pd:5,ff:0});
  add("CLE","FS",2,"Ronnie Harrison Jr.",33,"6-3","214",27,"Alabama",7,sB);
  add("CLE","K",1,"Dustin Hopkins",7,"6-2","193",34,"Florida State",10,{fgMade:26,fgAtt:30,xpMade:32,longFG:52});
  add("CLE","K",2,"Cade York",3,"6-0","193",24,"LSU",3,kB);
  add("CLE","P",1,"Corey Bojorquez",13,"6-0","208",27,"New Mexico",7,{punts:55,puntAvg:47.0,inside20:22,longPunt:64});
  add("CLE","P",2,"Dustin Hopkins",7,"6-2","193",34,"Florida State",10,pB);
  add("CLE","KR",1,"Jerome Ford",34,"5-11","210",25,"Cincinnati",3,{krYds:300,krAvg:22.0,krTD:0,krLong:40});
  add("CLE","KR",2,"Cedric Tillman",19,"6-3","213",24,"Tennessee",2,krB);
  add("CLE","PR",1,"Elijah Moore",8,"5-10","178",24,"Ole Miss",4,{prYds:100,prAvg:8.0,prTD:0,prLong:18});
  add("CLE","PR",2,"Cedric Tillman",19,"6-3","213",24,"Tennessee",2,prB);
  add("CLE","LS",1,"Charley Hughlett",47,"6-4","248",32,"UCF",10,{gamesPlayed:17,badSnaps:0});
  add("CLE","LS",2,"Ethan Pocic",55,"6-6","310",29,"LSU",7,lsB);

  // For the remaining 23 teams, we use a compact factory
  // Each team gets QB, RB, WR1, WR2, WR3, TE + OL + DEF + ST at 2-deep
  const teams: [string, string, number, string, number, Record<string, number>, // QB1
    string, number, // QB2 name, num
    string, number, Record<string, number>, // RB1
    string, number, // RB2
    string, number, Record<string, number>, // WR1-1
    string, number, // WR1-2
    string, number, Record<string, number>, // WR2-1
    string, number, // WR2-2
    string, number, Record<string, number>, // TE1
    string, number, // TE2
  ][] = [];

  // Given the complexity, let me just add each team with the add() helper directly.
  // I'll add the key players for each remaining team.

  // PIT
  add("PIT","QB",1,"Russell Wilson",3,"6-2","215",36,"Wisconsin",13,{passYds:3070,passTD:22,int:9,qbr:86.0});
  add("PIT","QB",2,"Justin Fields",2,"6-3","228",25,"Ohio State",4,qbB);
  add("PIT","RB",1,"Najee Harris",22,"6-1","232",26,"Alabama",4,{rushYds:900,rushTD:7,ypc:4.0,rec:28});
  add("PIT","RB",2,"Jaylen Warren",30,"5-8","210",26,"Oklahoma State",3,rbB);
  add("PIT","WR1",1,"George Pickens",14,"6-3","200",23,"Georgia",3,{recYds:1050,recTD:8,rec:65,targets:105});
  add("PIT","WR1",2,"Van Jefferson",12,"6-1","200",29,"Florida",5,wrB);
  add("PIT","WR2",1,"Van Jefferson",12,"6-1","200",29,"Florida",5,{recYds:380,recTD:3,rec:32,targets:50});
  add("PIT","WR2",2,"Calvin Austin III",19,"5-8","173",24,"Memphis",3,wrB);
  add("PIT","WR3",1,"Calvin Austin III",19,"5-8","173",24,"Memphis",3,{recYds:220,recTD:1,rec:20,targets:30});
  add("PIT","WR3",2,"Miles Boykin",80,"6-4","220",28,"Notre Dame",6,wrB);
  add("PIT","TE",1,"Pat Freiermuth",88,"6-5","258",26,"Penn State",4,{recYds:480,recTD:4,rec:45,targets:60});
  add("PIT","TE",2,"Darnell Washington",86,"6-7","264",23,"Georgia",2,teB);
  add("PIT","LT",1,"Dan Moore Jr.",65,"6-5","315",26,"Texas A&M",4,{gamesStarted:16,sacks:4});
  add("PIT","LT",2,"Broderick Jones",77,"6-5","311",23,"Georgia",2,olB);
  add("PIT","LG",1,"Isaac Seumalo",73,"6-4","303",30,"Oregon State",9,{gamesStarted:15,sacks:1});
  add("PIT","LG",2,"Mason McCormick",64,"6-4","309",24,"South Dakota State",1,olB);
  add("PIT","C",1,"Nate Herbig",63,"6-4","334",26,"Stanford",5,{gamesStarted:16,sacks:0});
  add("PIT","C",2,"Mason McCormick",64,"6-4","309",24,"South Dakota State",1,olB);
  add("PIT","RG",1,"James Daniels",78,"6-4","327",27,"Iowa",7,{gamesStarted:15,sacks:1});
  add("PIT","RG",2,"Mason McCormick",64,"6-4","309",24,"South Dakota State",1,olB);
  add("PIT","RT",1,"Broderick Jones",77,"6-5","311",23,"Georgia",2,{gamesStarted:14,sacks:3});
  add("PIT","RT",2,"Dan Moore Jr.",65,"6-5","315",26,"Texas A&M",4,olB);
  add("PIT","DE1",1,"T.J. Watt",90,"6-4","252",30,"Wisconsin",8,{tackles:55,sacks:13.0,tfl:16,ff:3});
  add("PIT","DE1",2,"Nick Herbig",51,"6-2","240",22,"Wisconsin",1,dlB);
  add("PIT","DE2",1,"Alex Highsmith",56,"6-4","248",27,"Charlotte",5,{tackles:42,sacks:8.0,tfl:10,ff:2});
  add("PIT","DE2",2,"Nick Herbig",51,"6-2","240",22,"Wisconsin",1,dlB);
  add("PIT","DT1",1,"Cameron Heyward",97,"6-5","295",35,"Ohio State",14,{tackles:48,sacks:4.5,tfl:8,ff:1});
  add("PIT","DT1",2,"Keeanu Benton",95,"6-4","310",23,"Wisconsin",2,dlB);
  add("PIT","DT2",1,"Larry Ogunjobi",99,"6-3","305",30,"Charlotte",8,{tackles:35,sacks:3.0,tfl:5,ff:0});
  add("PIT","DT2",2,"Keeanu Benton",95,"6-4","310",23,"Wisconsin",2,dlB);
  add("PIT","LB1",1,"Elandon Roberts",50,"6-0","238",30,"Houston",9,{tackles:85,sacks:1.5,tfl:5,int:0});
  add("PIT","LB1",2,"Cole Holcomb",55,"6-1","240",28,"North Carolina",6,lbB);
  add("PIT","LB2",1,"Cole Holcomb",55,"6-1","240",28,"North Carolina",6,{tackles:60,sacks:1.0,tfl:3,int:0});
  add("PIT","LB2",2,"Mark Robinson",93,"6-2","240",25,"Ole Miss",3,lbB);
  add("PIT","LB3",1,"Mark Robinson",93,"6-2","240",25,"Ole Miss",3,{tackles:30,sacks:0.5,tfl:2,int:0});
  add("PIT","LB3",2,"Tyler Matakevich",44,"6-1","235",32,"Temple",9,lbB);
  add("PIT","CB1",1,"Joey Porter Jr.",26,"6-2","193",24,"Penn State",2,{tackles:48,int:3,pd:12,ff:0});
  add("PIT","CB1",2,"Donte Jackson",26,"5-10","180",29,"LSU",7,cbB);
  add("PIT","CB2",1,"Donte Jackson",26,"5-10","180",29,"LSU",7,{tackles:42,int:2,pd:8,ff:0});
  add("PIT","CB2",2,"Cory Trice Jr.",28,"6-3","206",25,"Purdue",2,cbB);
  add("PIT","SS",1,"Minkah Fitzpatrick",39,"6-1","207",28,"Alabama",7,{tackles:70,int:3,pd:8,ff:1});
  add("PIT","SS",2,"Damontae Kazee",23,"5-10","174",31,"San Diego State",8,sB);
  add("PIT","FS",1,"Damontae Kazee",23,"5-10","174",31,"San Diego State",8,{tackles:55,int:2,pd:5,ff:0});
  add("PIT","FS",2,"Miles Killebrew",28,"6-2","222",30,"Southern Utah",9,sB);
  add("PIT","K",1,"Chris Boswell",9,"6-2","185",33,"Rice",10,{fgMade:32,fgAtt:35,xpMade:40,longFG:56});
  add("PIT","K",2,"Justin Fields",2,"6-3","228",25,"Ohio State",4,kB);
  add("PIT","P",1,"Pressley Harvin III",6,"6-0","255",26,"Georgia Tech",4,{punts:55,puntAvg:45.5,inside20:20,longPunt:60});
  add("PIT","P",2,"Chris Boswell",9,"6-2","185",33,"Rice",10,pB);
  add("PIT","KR",1,"Calvin Austin III",19,"5-8","173",24,"Memphis",3,{krYds:350,krAvg:23.0,krTD:0,krLong:42});
  add("PIT","KR",2,"Jaylen Warren",30,"5-8","210",26,"Oklahoma State",3,krB);
  add("PIT","PR",1,"Calvin Austin III",19,"5-8","173",24,"Memphis",3,{prYds:120,prAvg:9.0,prTD:0,prLong:20});
  add("PIT","PR",2,"Van Jefferson",12,"6-1","200",29,"Florida",5,prB);
  add("PIT","LS",1,"Christian Kuntz",46,"6-2","240",29,"Duquesne",5,{gamesPlayed:17,badSnaps:0});
  add("PIT","LS",2,"Nate Herbig",63,"6-4","334",26,"Stanford",5,lsB);

  // For the remaining 22 teams, I'll add starters with a more compact pattern
  // Each team gets key offensive/defensive starters + backups

  const simpleTeams: { id: string; players: [string, number, string, number, string, string, number, string, number, Record<string, number>, InjuryStatus?, string?][] }[] = [
    { id: "HOU", players: [
      ["QB",1,"C.J. Stroud",7,"6-3","218",22,"Ohio State",2,{passYds:4108,passTD:23,int:5,qbr:100.4}],
      ["QB",2,"Davis Mills",10,"6-3","217",26,"Stanford",4,qbB],
      ["RB",1,"Joe Mixon",28,"6-1","220",28,"Oklahoma",8,{rushYds:850,rushTD:7,ypc:4.2,rec:28}],
      ["RB",2,"Dameon Pierce",31,"5-10","218",24,"Florida",3,rbB],
      ["WR1",1,"Nico Collins",12,"6-4","215",25,"Michigan",4,{recYds:1100,recTD:8,rec:72,targets:105}],
      ["WR1",2,"Robert Woods",2,"6-0","195",32,"USC",12,wrB],
      ["WR2",1,"Stefon Diggs",1,"6-0","191",31,"Maryland",10,{recYds:850,recTD:6,rec:58,targets:88}],
      ["WR2",2,"Robert Woods",2,"6-0","195",32,"USC",12,wrB],
      ["WR3",1,"Tank Dell",3,"5-8","163",24,"Houston",2,{recYds:580,recTD:5,rec:42,targets:60}],
      ["WR3",2,"John Metchie III",8,"6-0","187",24,"Alabama",2,wrB],
      ["TE",1,"Dalton Schultz",83,"6-5","244",28,"Stanford",7,{recYds:420,recTD:3,rec:38,targets:50}],
      ["TE",2,"Brevin Jordan",9,"6-3","245",24,"Miami",4,teB],
    ]},
    { id: "IND", players: [
      ["QB",1,"Anthony Richardson",5,"6-4","244",22,"Florida",2,{passYds:1580,passTD:11,int:5,qbr:82.0}],
      ["QB",2,"Gardner Minshew",10,"6-1","225",28,"Washington State",6,qbB],
      ["RB",1,"Jonathan Taylor",28,"5-10","226",25,"Wisconsin",4,{rushYds:1050,rushTD:8,ypc:4.8,rec:25}],
      ["RB",2,"Zack Moss",21,"5-9","233",27,"Utah",5,rbB],
      ["WR1",1,"Michael Pittman Jr.",11,"6-4","223",27,"USC",5,{recYds:880,recTD:6,rec:62,targets:95}],
      ["WR1",2,"Alec Pierce",14,"6-3","211",25,"Cincinnati",3,wrB],
      ["WR2",1,"Josh Downs",1,"5-10","171",23,"North Carolina",2,{recYds:580,recTD:4,rec:48,targets:68}],
      ["WR2",2,"Alec Pierce",14,"6-3","211",25,"Cincinnati",3,wrB],
      ["WR3",1,"Alec Pierce",14,"6-3","211",25,"Cincinnati",3,{recYds:300,recTD:2,rec:22,targets:38}],
      ["WR3",2,"Adonai Mitchell",10,"6-2","205",22,"Texas",1,wrB],
      ["TE",1,"Mo Alie-Cox",81,"6-5","267",31,"VCU",7,{recYds:280,recTD:2,rec:25,targets:35}],
      ["TE",2,"Kylen Granson",83,"6-2","240",26,"SMU",4,teB],
    ]},
  ];

  // This approach is getting too complex. Let me simplify by directly generating the
  // remaining teams with a streamlined helper for the standard positions.

  // Helper to add a full 2-deep roster for a team given key player info
  function addTeamRoster(
    team: string,
    qb1: [string, number], qb2: [string, number],
    rb1: [string, number], rb2: [string, number],
    wr1: [string, number], wr2: [string, number], wr3: [string, number],
    te1: [string, number], te2: [string, number],
    k1: [string, number], p1: [string, number],
  ) {
    // QB
    add(team,"QB",1,qb1[0],qb1[1],"6-2","220",27,"College",5,{passYds:3500,passTD:24,int:10,qbr:88.0});
    add(team,"QB",2,qb2[0],qb2[1],"6-3","215",26,"College",3,qbB);
    // RB
    add(team,"RB",1,rb1[0],rb1[1],"5-11","215",26,"College",4,{rushYds:900,rushTD:6,ypc:4.3,rec:25});
    add(team,"RB",2,rb2[0],rb2[1],"5-10","210",25,"College",3,rbB);
    // WRs
    add(team,"WR1",1,wr1[0],wr1[1],"6-1","200",26,"College",4,{recYds:950,recTD:7,rec:65,targets:100});
    add(team,"WR1",2,wr2[0],wr2[1],"6-0","195",25,"College",3,wrB);
    add(team,"WR2",1,wr2[0],wr2[1],"6-0","195",25,"College",3,{recYds:550,recTD:4,rec:40,targets:60});
    add(team,"WR2",2,wr3[0],wr3[1],"5-11","190",24,"College",2,wrB);
    add(team,"WR3",1,wr3[0],wr3[1],"5-11","190",24,"College",2,{recYds:280,recTD:2,rec:22,targets:35});
    add(team,"WR3",2,"Reserve WR",80,"5-10","185",24,"College",1,wrB);
    // TE
    add(team,"TE",1,te1[0],te1[1],"6-5","250",27,"College",5,{recYds:450,recTD:3,rec:38,targets:50});
    add(team,"TE",2,te2[0],te2[1],"6-4","245",25,"College",3,teB);
    // OL
    add(team,"LT",1,"Starting LT",72,"6-5","315",28,"College",6,{gamesStarted:16,sacks:3});
    add(team,"LT",2,"Backup LT",76,"6-6","310",25,"College",3,olB);
    add(team,"LG",1,"Starting LG",66,"6-4","310",27,"College",5,{gamesStarted:16,sacks:1});
    add(team,"LG",2,"Backup LG",63,"6-5","305",24,"College",2,olB);
    add(team,"C",1,"Starting C",55,"6-3","305",28,"College",6,{gamesStarted:17,sacks:0});
    add(team,"C",2,"Backup C",67,"6-3","300",25,"College",3,olB);
    add(team,"RG",1,"Starting RG",74,"6-5","315",27,"College",5,{gamesStarted:15,sacks:1});
    add(team,"RG",2,"Backup RG",68,"6-4","310",24,"College",2,olB);
    add(team,"RT",1,"Starting RT",78,"6-6","320",28,"College",6,{gamesStarted:16,sacks:3});
    add(team,"RT",2,"Backup RT",70,"6-5","312",25,"College",3,olB);
    // DE
    add(team,"DE1",1,"Starting DE1",91,"6-4","270",27,"College",5,{tackles:45,sacks:8.0,tfl:10,ff:2});
    add(team,"DE1",2,"Backup DE1",93,"6-3","260",24,"College",2,dlB);
    add(team,"DE2",1,"Starting DE2",94,"6-5","275",28,"College",6,{tackles:40,sacks:6.0,tfl:8,ff:1});
    add(team,"DE2",2,"Backup DE2",96,"6-4","265",24,"College",2,dlB);
    // DT
    add(team,"DT1",1,"Starting DT1",98,"6-3","310",28,"College",6,{tackles:42,sacks:4.0,tfl:7,ff:1});
    add(team,"DT1",2,"Backup DT1",92,"6-2","305",25,"College",3,dlB);
    add(team,"DT2",1,"Starting DT2",97,"6-4","320",27,"College",5,{tackles:30,sacks:2.0,tfl:4,ff:0});
    add(team,"DT2",2,"Backup DT2",95,"6-3","315",24,"College",2,dlB);
    // LB
    add(team,"LB1",1,"Starting LB1",52,"6-2","235",27,"College",5,{tackles:95,sacks:3.0,tfl:7,int:1});
    add(team,"LB1",2,"Backup LB1",54,"6-1","230",24,"College",2,lbB);
    add(team,"LB2",1,"Starting LB2",50,"6-1","232",26,"College",4,{tackles:70,sacks:1.5,tfl:5,int:0});
    add(team,"LB2",2,"Backup LB2",58,"6-2","228",24,"College",2,lbB);
    add(team,"LB3",1,"Starting LB3",48,"6-0","225",25,"College",3,{tackles:40,sacks:0.5,tfl:3,int:0});
    add(team,"LB3",2,"Backup LB3",56,"6-1","228",23,"College",1,lbB);
    // CB
    add(team,"CB1",1,"Starting CB1",21,"6-0","190",27,"College",5,{tackles:50,int:3,pd:12,ff:0});
    add(team,"CB1",2,"Backup CB1",23,"5-11","185",24,"College",2,cbB);
    add(team,"CB2",1,"Starting CB2",24,"6-1","195",26,"College",4,{tackles:45,int:2,pd:8,ff:0});
    add(team,"CB2",2,"Backup CB2",29,"5-10","188",23,"College",1,cbB);
    // S
    add(team,"SS",1,"Starting SS",32,"6-1","210",27,"College",5,{tackles:68,int:2,pd:7,ff:1});
    add(team,"SS",2,"Backup SS",36,"6-0","205",24,"College",2,sB);
    add(team,"FS",1,"Starting FS",27,"6-0","205",26,"College",4,{tackles:60,int:2,pd:6,ff:0});
    add(team,"FS",2,"Backup FS",38,"5-11","200",24,"College",2,sB);
    // ST
    add(team,"K",1,k1[0],k1[1],"6-0","195",28,"College",6,{fgMade:26,fgAtt:30,xpMade:38,longFG:54});
    add(team,"K",2,"Backup K",8,"5-11","190",24,"College",1,kB);
    add(team,"P",1,p1[0],p1[1],"6-2","210",28,"College",6,{punts:52,puntAvg:45.5,inside20:20,longPunt:60});
    add(team,"P",2,"Backup P",4,"6-1","200",24,"College",1,pB);
    add(team,"KR",1,rb2[0],rb2[1],"5-10","210",25,"College",3,{krYds:300,krAvg:22.0,krTD:0,krLong:35});
    add(team,"KR",2,wr3[0],wr3[1],"5-11","190",24,"College",2,krB);
    add(team,"PR",1,wr3[0],wr3[1],"5-11","190",24,"College",2,{prYds:100,prAvg:8.0,prTD:0,prLong:18});
    add(team,"PR",2,rb2[0],rb2[1],"5-10","210",25,"College",3,prB);
    add(team,"LS",1,"Starting LS",45,"6-2","240",30,"College",8,{gamesPlayed:17,badSnaps:0});
    add(team,"LS",2,"Backup LS",49,"6-1","235",25,"College",2,lsB);
  }

  // Process simple team data already added (HOU, IND)
  for (const t of simpleTeams) {
    for (const p of t.players) {
      add(t.id, p[0] as string, p[1] as number, p[2] as string, p[3] as number, p[4] as string, p[5] as string, p[6] as number, p[7] as string, p[8] as number, p[9] as Record<string, number>, p[10] as InjuryStatus | undefined, p[11] as string | undefined);
    }
    // Add the rest via addTeamRoster-like defaults for positions not yet added
    // Actually HOU and IND only have offense starters. Let me add their defense/ST/OL too.
  }

  // This is getting unwieldy. Let me just use the addTeamRoster for remaining teams
  // with real key player names and skip the partial approach.

  // HOU (add remaining positions)
  add("HOU","LT",1,"Laremy Tunsil",78,"6-5","313",30,"Ole Miss",9,{gamesStarted:15,sacks:2});
  add("HOU","LT",2,"Tytus Howard",71,"6-5","322",29,"Alabama State",6,olB);
  add("HOU","LG",1,"Kenyon Green",55,"6-4","323",23,"Texas A&M",3,{gamesStarted:14,sacks:2});
  add("HOU","LG",2,"Tytus Howard",71,"6-5","322",29,"Alabama State",6,olB);
  add("HOU","C",1,"Juice Scruggs",60,"6-3","307",25,"Penn State",2,{gamesStarted:16,sacks:0});
  add("HOU","C",2,"Jarrett Patterson",68,"6-3","306",25,"Notre Dame",2,olB);
  add("HOU","RG",1,"Shaq Mason",69,"6-1","310",31,"Georgia Tech",10,{gamesStarted:16,sacks:1});
  add("HOU","RG",2,"Jarrett Patterson",68,"6-3","306",25,"Notre Dame",2,olB);
  add("HOU","RT",1,"George Fant",74,"6-5","322",32,"Western Kentucky",9,{gamesStarted:14,sacks:3});
  add("HOU","RT",2,"Tytus Howard",71,"6-5","322",29,"Alabama State",6,olB);
  add("HOU","DE1",1,"Will Anderson Jr.",51,"6-4","253",23,"Alabama",2,{tackles:55,sacks:10.0,tfl:13,ff:3});
  add("HOU","DE1",2,"Jerry Hughes",55,"6-2","254",36,"TCU",14,dlB);
  add("HOU","DE2",1,"Jonathan Greenard",52,"6-3","263",27,"Florida",5,{tackles:42,sacks:8.5,tfl:10,ff:2});
  add("HOU","DE2",2,"Jerry Hughes",55,"6-2","254",36,"TCU",14,dlB);
  add("HOU","DT1",1,"Foley Fatukasi",94,"6-4","318",30,"UConn",7,{tackles:40,sacks:2.5,tfl:5,ff:0});
  add("HOU","DT1",2,"Maliek Collins",96,"6-2","305",29,"Nebraska",9,dlB);
  add("HOU","DT2",1,"Maliek Collins",96,"6-2","305",29,"Nebraska",9,{tackles:28,sacks:2.0,tfl:4,ff:0});
  add("HOU","DT2",2,"Kurt Hinish",93,"6-1","310",26,"Notre Dame",3,dlB);
  add("HOU","LB1",1,"Denzel Perryman",41,"6-0","240",31,"Miami",10,{tackles:90,sacks:2.0,tfl:6,int:0});
  add("HOU","LB1",2,"Christian Harris",48,"6-0","226",23,"Alabama",3,lbB);
  add("HOU","LB2",1,"Christian Harris",48,"6-0","226",23,"Alabama",3,{tackles:60,sacks:1.0,tfl:4,int:1});
  add("HOU","LB2",2,"Henry To'oTo'o",39,"6-1","228",24,"Alabama",2,lbB);
  add("HOU","LB3",1,"Henry To'oTo'o",39,"6-1","228",24,"Alabama",2,{tackles:35,sacks:0.5,tfl:2,int:0});
  add("HOU","LB3",2,"Jake Hansen",49,"6-1","230",26,"Illinois",3,lbB);
  add("HOU","CB1",1,"Derek Stingley Jr.",24,"6-0","190",23,"LSU",3,{tackles:48,int:4,pd:15,ff:0});
  add("HOU","CB1",2,"Desmond King II",25,"5-10","201",29,"Iowa",8,cbB);
  add("HOU","CB2",1,"Steven Nelson",21,"5-11","194",31,"Oregon State",9,{tackles:42,int:2,pd:8,ff:0});
  add("HOU","CB2",2,"Desmond King II",25,"5-10","201",29,"Iowa",8,cbB);
  add("HOU","SS",1,"Jimmie Ward",20,"5-11","195",33,"Northern Illinois",11,{tackles:60,int:2,pd:6,ff:0});
  add("HOU","SS",2,"Jalen Pitre",5,"5-11","198",24,"Baylor",3,sB);
  add("HOU","FS",1,"Jalen Pitre",5,"5-11","198",24,"Baylor",3,{tackles:75,int:3,pd:8,ff:1});
  add("HOU","FS",2,"M.J. Stewart",36,"5-11","202",29,"North Carolina",7,sB);
  add("HOU","K",1,"Ka'imi Fairbairn",7,"6-0","183",30,"UCLA",9,{fgMade:28,fgAtt:32,xpMade:42,longFG:56});
  add("HOU","K",2,"Davis Mills",10,"6-3","217",26,"Stanford",4,kB);
  add("HOU","P",1,"Cameron Johnston",11,"6-2","192",32,"Ohio State",7,{punts:50,puntAvg:46.5,inside20:22,longPunt:62});
  add("HOU","P",2,"Ka'imi Fairbairn",7,"6-0","183",30,"UCLA",9,pB);
  add("HOU","KR",1,"Dameon Pierce",31,"5-10","218",24,"Florida",3,{krYds:350,krAvg:23.0,krTD:0,krLong:40});
  add("HOU","KR",2,"Tank Dell",3,"5-8","163",24,"Houston",2,krB);
  add("HOU","PR",1,"Tank Dell",3,"5-8","163",24,"Houston",2,{prYds:120,prAvg:9.0,prTD:0,prLong:22});
  add("HOU","PR",2,"Dameon Pierce",31,"5-10","218",24,"Florida",3,prB);
  add("HOU","LS",1,"Jon Weeks",46,"6-1","242",37,"Baylor",15,{gamesPlayed:17,badSnaps:0});
  add("HOU","LS",2,"Juice Scruggs",60,"6-3","307",25,"Penn State",2,lsB);

  // IND (add remaining positions)
  add("IND","LT",1,"Bernhard Raimann",64,"6-6","303",26,"Central Michigan",3,{gamesStarted:15,sacks:3});
  add("IND","LT",2,"Blake Freeland",76,"6-8","302",24,"BYU",2,olB);
  add("IND","LG",1,"Quenton Nelson",56,"6-5","330",28,"Notre Dame",7,{gamesStarted:14,sacks:1});
  add("IND","LG",2,"Will Fries",67,"6-6","308",27,"Penn State",4,olB);
  add("IND","C",1,"Ryan Kelly",78,"6-4","311",31,"Alabama",9,{gamesStarted:15,sacks:0});
  add("IND","C",2,"Will Fries",67,"6-6","308",27,"Penn State",4,olB);
  add("IND","RG",1,"Will Fries",67,"6-6","308",27,"Penn State",4,{gamesStarted:16,sacks:1});
  add("IND","RG",2,"Danny Pinter",63,"6-4","305",28,"Ball State",5,olB);
  add("IND","RT",1,"Braden Smith",72,"6-6","310",28,"Auburn",7,{gamesStarted:16,sacks:3});
  add("IND","RT",2,"Blake Freeland",76,"6-8","302",24,"BYU",2,olB);
  add("IND","DE1",1,"Kwity Paye",51,"6-2","261",26,"Michigan",4,{tackles:40,sacks:7.0,tfl:9,ff:2});
  add("IND","DE1",2,"Tyquan Lewis",94,"6-3","268",28,"Ohio State",7,dlB);
  add("IND","DE2",1,"Samson Ebukam",52,"6-3","245",29,"Eastern Washington",8,{tackles:38,sacks:6.5,tfl:8,ff:1});
  add("IND","DE2",2,"Tyquan Lewis",94,"6-3","268",28,"Ohio State",7,dlB);
  add("IND","DT1",1,"DeForest Buckner",99,"6-7","295",30,"Oregon",9,{tackles:48,sacks:6.0,tfl:10,ff:1});
  add("IND","DT1",2,"Grover Stewart",90,"6-4","315",30,"Albany State",8,dlB);
  add("IND","DT2",1,"Grover Stewart",90,"6-4","315",30,"Albany State",8,{tackles:35,sacks:2.0,tfl:5,ff:0});
  add("IND","DT2",2,"Adetomiwa Adebawore",95,"6-2","282",23,"Northwestern",2,dlB);
  add("IND","LB1",1,"Zaire Franklin",44,"6-0","230",28,"Syracuse",7,{tackles:110,sacks:2.0,tfl:7,int:1});
  add("IND","LB1",2,"E.J. Speed",45,"6-3","225",29,"Tarleton State",6,lbB);
  add("IND","LB2",1,"E.J. Speed",45,"6-3","225",29,"Tarleton State",6,{tackles:55,sacks:1.0,tfl:4,int:0});
  add("IND","LB2",2,"Grant Stuard",41,"6-0","231",26,"Houston",4,lbB);
  add("IND","LB3",1,"Grant Stuard",41,"6-0","231",26,"Houston",4,{tackles:30,sacks:0.5,tfl:2,int:0});
  add("IND","LB3",2,"Segun Olabi",53,"6-2","240",24,"UCLA",1,lbB);
  add("IND","CB1",1,"Kenny Moore II",23,"5-9","190",29,"Valdosta State",8,{tackles:55,int:3,pd:12,ff:1});
  add("IND","CB1",2,"JuJu Brents",29,"6-3","200",24,"Kansas State",2,cbB);
  add("IND","CB2",1,"JuJu Brents",29,"6-3","200",24,"Kansas State",2,{tackles:40,int:1,pd:8,ff:0});
  add("IND","CB2",2,"Dallis Flowers",33,"5-11","185",24,"Pittsburg State",2,cbB);
  add("IND","SS",1,"Nick Cross",20,"6-0","212",24,"Maryland",3,{tackles:65,int:2,pd:5,ff:1});
  add("IND","SS",2,"Rodney Thomas II",25,"6-0","203",25,"Yale",3,sB);
  add("IND","FS",1,"Julian Blackmon",32,"6-1","200",27,"Utah",5,{tackles:55,int:2,pd:6,ff:0});
  add("IND","FS",2,"Rodney Thomas II",25,"6-0","203",25,"Yale",3,sB);
  add("IND","K",1,"Matt Gay",1,"6-0","232",30,"Utah",6,{fgMade:28,fgAtt:32,xpMade:40,longFG:55});
  add("IND","K",2,"Gardner Minshew",10,"6-1","225",28,"Washington State",6,kB);
  add("IND","P",1,"Rigoberto Sanchez",8,"6-0","192",29,"Hawaii",7,{punts:52,puntAvg:45.0,inside20:20,longPunt:58});
  add("IND","P",2,"Matt Gay",1,"6-0","232",30,"Utah",6,pB);
  add("IND","KR",1,"Zack Moss",21,"5-9","233",27,"Utah",5,{krYds:280,krAvg:21.0,krTD:0,krLong:35});
  add("IND","KR",2,"Adonai Mitchell",10,"6-2","205",22,"Texas",1,krB);
  add("IND","PR",1,"Josh Downs",1,"5-10","171",23,"North Carolina",2,{prYds:100,prAvg:8.0,prTD:0,prLong:18});
  add("IND","PR",2,"Adonai Mitchell",10,"6-2","205",22,"Texas",1,prB);
  add("IND","LS",1,"Luke Rhodes",46,"6-2","240",30,"William & Mary",7,{gamesPlayed:17,badSnaps:0});
  add("IND","LS",2,"Ryan Kelly",78,"6-4","311",31,"Alabama",9,lsB);

  // For the remaining 21 teams, use the addTeamRoster helper with real names for key players
  // JAX, TEN, LV, LAC, DEN, NE, NYJ, NYG, WAS, CHI, DET, GB, MIN, ATL, CAR, NO, TB, ARI, LAR, SEA
  // Note: SF is already a showcase team

  addTeamRoster("JAX",
    ["Trevor Lawrence",16],["Mac Jones",5],
    ["Travis Etienne Jr.",1],["Tank Bigsby",4],
    ["Calvin Ridley",0],["Christian Kirk",13],["Zay Jones",7],
    ["Evan Engram",17],["Luke Farrell",89],
    ["Brandon McManus",2],["Logan Cooke",9]);

  addTeamRoster("TEN",
    ["Will Levis",8],["Mason Rudolph",11],
    ["Tony Pollard",20],["Tyjae Spears",2],
    ["DeAndre Hopkins",10],["Treylon Burks",16],["Nick Westbrook-Ikhine",15],
    ["Chigoziem Okonkwo",85],["Josh Whyle",81],
    ["Nick Folk",6],["Ryan Stonehouse",4]);
  // Override TEN Hopkins with injury
  result[result.length - 54 + 8].injuryStatus = "Questionable";
  result[result.length - 54 + 8].injuryDetail = "Knee — limited practice";

  addTeamRoster("LV",
    ["Jimmy Garoppolo",10],["Aidan O'Connell",12],
    ["Josh Jacobs",28],["Zamir White",35],
    ["Davante Adams",17],["Jakobi Meyers",16],["Tre Tucker",11],
    ["Michael Mayer",87],["Austin Hooper",81],
    ["Daniel Carlson",2],["AJ Cole",6]);

  addTeamRoster("LAC",
    ["Justin Herbert",10],["Easton Stick",2],
    ["Austin Ekeler",30],["Joshua Kelley",25],
    ["Keenan Allen",13],["Joshua Palmer",5],["Quentin Johnston",1],
    ["Gerald Everett",87],["Donald Parham Jr.",89],
    ["Cameron Dicker",15],["JK Scott",16]);

  addTeamRoster("DEN",
    ["Bo Nix",10],["Jarrett Stidham",4],
    ["Javonte Williams",33],["Samaje Perine",25],
    ["Courtland Sutton",14],["Jerry Jeudy",10],["Marvin Mims Jr.",11],
    ["Adam Trautman",82],["Greg Dulcich",80],
    ["Wil Lutz",3],["Riley Dixon",9]);

  addTeamRoster("NE",
    ["Drake Maye",10],["Jacoby Brissett",7],
    ["Rhamondre Stevenson",38],["Antonio Gibson",21],
    ["Kendrick Bourne",84],["JuJu Smith-Schuster",7],["Demario Douglas",3],
    ["Hunter Henry",85],["Mike Gesicki",88],
    ["Chad Ryland",37],["Bryce Baringer",17]);

  addTeamRoster("NYJ",
    ["Aaron Rodgers",8],["Tyrod Taylor",2],
    ["Breece Hall",20],["Dalvin Cook",33],
    ["Garrett Wilson",17],["Allen Lazard",10],["Xavier Gipson",3],
    ["Tyler Conklin",83],["C.J. Uzomah",87],
    ["Greg Zuerlein",1],["Thomas Morstead",4]);

  addTeamRoster("NYG",
    ["Daniel Jones",8],["Tommy DeVito",15],
    ["Saquon Barkley",26],["Matt Breida",31],
    ["Darius Slayton",86],["Wan'Dale Robinson",17],["Isaiah Hodgins",18],
    ["Darren Waller",12],["Daniel Bellinger",82],
    ["Graham Gano",5],["Jamie Gillan",6]);

  addTeamRoster("WAS",
    ["Jayden Daniels",5],["Marcus Mariota",8],
    ["Brian Robinson Jr.",8],["Austin Ekeler",30],
    ["Terry McLaurin",17],["Jahan Dotson",1],["Dyami Brown",2],
    ["Logan Thomas",82],["John Bates",87],
    ["Cade York",3],["Tress Way",5]);

  addTeamRoster("CHI",
    ["Caleb Williams",18],["Tyson Bagent",17],
    ["D'Andre Swift",14],["Khalil Herbert",24],
    ["DJ Moore",2],["Keenan Allen",13],["Tyler Scott",12],
    ["Cole Kmet",85],["Gerald Everett",87],
    ["Cairo Santos",2],["Trenton Gill",16]);

  addTeamRoster("DET",
    ["Jared Goff",16],["Hendon Hooker",4],
    ["David Montgomery",5],["Jahmyr Gibbs",26],
    ["Amon-Ra St. Brown",14],["Jameson Williams",9],["Kalif Raymond",11],
    ["Sam LaPorta",87],["Brock Wright",89],
    ["Michael Badgley",17],["Jack Fox",3]);

  addTeamRoster("GB",
    ["Jordan Love",10],["Sean Clifford",8],
    ["Aaron Jones",33],["AJ Dillon",28],
    ["Christian Watson",9],["Romeo Doubs",87],["Jayden Reed",11],
    ["Luke Musgrave",88],["Tucker Kraft",85],
    ["Anders Carlson",7],["Daniel Whelan",2]);

  addTeamRoster("MIN",
    ["Sam Darnold",14],["Nick Mullens",12],
    ["Aaron Jones",33],["Ty Chandler",32],
    ["Justin Jefferson",18],["Jordan Addison",3],["K.J. Osborn",17],
    ["T.J. Hockenson",87],["Josh Oliver",84],
    ["Greg Joseph",1],["Ryan Wright",2]);

  addTeamRoster("ATL",
    ["Kirk Cousins",18],["Desmond Ridder",4],
    ["Bijan Robinson",7],["Tyler Allgeier",25],
    ["Drake London",5],["Darnell Mooney",11],["Mack Hollins",17],
    ["Kyle Pitts",8],["Jonnu Smith",81],
    ["Younghoe Koo",7],["Bradley Pinion",4]);

  addTeamRoster("CAR",
    ["Bryce Young",9],["Andy Dalton",14],
    ["Chuba Hubbard",30],["Miles Sanders",6],
    ["Adam Thielen",19],["Diontae Johnson",1],["Jonathan Mingo",15],
    ["Tommy Tremble",82],["Ian Thomas",80],
    ["Eddy Pineiro",5],["Johnny Hekker",6]);

  addTeamRoster("NO",
    ["Derek Carr",4],["Jameis Winston",2],
    ["Alvin Kamara",41],["Kendre Miller",25],
    ["Chris Olave",12],["Rashid Shaheed",89],["A.T. Perry",16],
    ["Juwan Johnson",83],["Taysom Hill",7],
    ["Blake Grupe",19],["Lou Hedley",6]);

  addTeamRoster("TB",
    ["Baker Mayfield",6],["Kyle Trask",2],
    ["Rachaad White",1],["Chase Edmonds",2],
    ["Mike Evans",13],["Chris Godwin",14],["Trey Palmer",10],
    ["Cade Otton",88],["Ko Kieft",41],
    ["Chase McLaughlin",44],["Jake Camarda",5]);

  addTeamRoster("ARI",
    ["Kyler Murray",1],["Clayton Tune",12],
    ["James Conner",6],["Emari Demercado",36],
    ["Marquise Brown",2],["Michael Wilson",14],["Rondale Moore",4],
    ["Trey McBride",85],["Geoff Swaim",87],
    ["Matt Prater",5],["Andy Lee",4]);

  addTeamRoster("LAR",
    ["Matthew Stafford",9],["Jimmy Garoppolo",10],
    ["Kyren Williams",23],["Zach Evans",26],
    ["Puka Nacua",17],["Cooper Kupp",10],["Tutu Atwell",5],
    ["Tyler Higbee",89],["Colby Parkinson",84],
    ["Joshua Karty",6],["Ethan Evans",3]);

  addTeamRoster("SEA",
    ["Geno Smith",7],["Drew Lock",2],
    ["Kenneth Walker III",9],["Zach Charbonnet",26],
    ["DK Metcalf",14],["Tyler Lockett",16],["Jaxon Smith-Njigba",11],
    ["Noah Fant",87],["Will Dissly",89],
    ["Jason Myers",5],["Michael Dickson",4]);

  return result;
}

export const players: Player[] = [
  // =============================================
  // KANSAS CITY CHIEFS (Showcase — full 3-deep)
  // =============================================
  // --- Offense ---
  { id: pid("KC", "QB", 1), name: "Patrick Mahomes", team: "KC", position: "QB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 15, height: "6-2", weight: "225", age: 29, college: "Texas Tech", experience: 8, injuryStatus: "Active", stats: { passYds: 4183, passTD: 30, int: 11, qbr: 94.2 } },
  { id: pid("KC", "QB", 2), name: "Carson Wentz", team: "KC", position: "QB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 11, height: "6-5", weight: "237", age: 32, college: "North Dakota State", experience: 9, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("KC", "QB", 3), name: "Chris Oladokun", team: "KC", position: "QB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 6, height: "6-1", weight: "210", age: 27, college: "South Dakota State", experience: 3, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("KC", "RB", 1), name: "Isiah Pacheco", team: "KC", position: "RB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 10, height: "5-10", weight: "215", age: 25, college: "Rutgers", experience: 3, injuryStatus: "Active", stats: { rushYds: 1012, rushTD: 7, ypc: 4.5, rec: 32 } },
  { id: pid("KC", "RB", 2), name: "Clyde Edwards-Helaire", team: "KC", position: "RB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 25, height: "5-7", weight: "207", age: 25, college: "LSU", experience: 5, injuryStatus: "Questionable", injuryDetail: "Knee — Limited practice Thu", stats: { rushYds: 310, rushTD: 2, ypc: 3.8, rec: 18 } },
  { id: pid("KC", "RB", 3), name: "Deneric Prince", team: "KC", position: "RB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 34, height: "6-0", weight: "210", age: 24, college: "Tulsa", experience: 2, injuryStatus: "Active", stats: { rushYds: 85, rushTD: 0, ypc: 4.0, rec: 5 } },
  { id: pid("KC", "WR1", 1), name: "Rashee Rice", team: "KC", position: "WR1", positionGroup: "offense", depthOrder: 1, jerseyNumber: 4, height: "6-1", weight: "200", age: 24, college: "SMU", experience: 2, injuryStatus: "Suspended", injuryDetail: "Suspended 6 games — off-field conduct", stats: { recYds: 0, recTD: 0, rec: 0, targets: 0 } },
  { id: pid("KC", "WR1", 2), name: "Xavier Worthy", team: "KC", position: "WR1", positionGroup: "offense", depthOrder: 2, jerseyNumber: 1, height: "5-11", weight: "165", age: 21, college: "Texas", experience: 1, injuryStatus: "Active", stats: { recYds: 780, recTD: 6, rec: 52, targets: 75 } },
  { id: pid("KC", "WR1", 3), name: "Mecole Hardman", team: "KC", position: "WR1", positionGroup: "offense", depthOrder: 3, jerseyNumber: 12, height: "5-10", weight: "187", age: 26, college: "Georgia", experience: 6, injuryStatus: "Active", stats: { recYds: 220, recTD: 2, rec: 18, targets: 28 } },
  { id: pid("KC", "WR2", 1), name: "Marquise Brown", team: "KC", position: "WR2", positionGroup: "offense", depthOrder: 1, jerseyNumber: 5, height: "5-9", weight: "170", age: 27, college: "Oklahoma", experience: 6, injuryStatus: "Active", stats: { recYds: 650, recTD: 5, rec: 45, targets: 68 } },
  { id: pid("KC", "WR2", 2), name: "Kadarius Toney", team: "KC", position: "WR2", positionGroup: "offense", depthOrder: 2, jerseyNumber: 19, height: "6-0", weight: "193", age: 25, college: "Florida", experience: 4, injuryStatus: "Active", stats: { recYds: 150, recTD: 1, rec: 12, targets: 20 } },
  { id: pid("KC", "WR2", 3), name: "Justyn Ross", team: "KC", position: "WR2", positionGroup: "offense", depthOrder: 3, jerseyNumber: 8, height: "6-4", weight: "210", age: 24, college: "Clemson", experience: 3, injuryStatus: "Active", stats: { recYds: 80, recTD: 0, rec: 6, targets: 10 } },
  { id: pid("KC", "WR3", 1), name: "Skyy Moore", team: "KC", position: "WR3", positionGroup: "offense", depthOrder: 1, jerseyNumber: 24, height: "5-10", weight: "195", age: 24, college: "Western Michigan", experience: 3, injuryStatus: "Active", stats: { recYds: 320, recTD: 2, rec: 25, targets: 38 } },
  { id: pid("KC", "WR3", 2), name: "Nikko Remigio", team: "KC", position: "WR3", positionGroup: "offense", depthOrder: 2, jerseyNumber: 84, height: "5-11", weight: "185", age: 25, college: "Fresno State", experience: 1, injuryStatus: "Active", stats: { recYds: 45, recTD: 0, rec: 4, targets: 7 } },
  { id: pid("KC", "WR3", 3), name: "Montrell Washington", team: "KC", position: "WR3", positionGroup: "offense", depthOrder: 3, jerseyNumber: 85, height: "5-10", weight: "170", age: 25, college: "Samford", experience: 3, injuryStatus: "Active", stats: { recYds: 20, recTD: 0, rec: 2, targets: 4 } },
  { id: pid("KC", "TE", 1), name: "Travis Kelce", team: "KC", position: "TE", positionGroup: "offense", depthOrder: 1, jerseyNumber: 87, height: "6-5", weight: "250", age: 35, college: "Cincinnati", experience: 12, injuryStatus: "Active", stats: { recYds: 823, recTD: 5, rec: 75, targets: 98 } },
  { id: pid("KC", "TE", 2), name: "Noah Gray", team: "KC", position: "TE", positionGroup: "offense", depthOrder: 2, jerseyNumber: 83, height: "6-3", weight: "240", age: 25, college: "Duke", experience: 4, injuryStatus: "Active", stats: { recYds: 210, recTD: 2, rec: 22, targets: 30 } },
  { id: pid("KC", "TE", 3), name: "Jody Fortson", team: "KC", position: "TE", positionGroup: "offense", depthOrder: 3, jerseyNumber: 88, height: "6-4", weight: "230", age: 28, college: "Valdosta State", experience: 4, injuryStatus: "IR", injuryDetail: "Achilles — placed on IR Week 6", stats: { recYds: 45, recTD: 1, rec: 5, targets: 8 } },
  { id: pid("KC", "LT", 1), name: "Donovan Smith", team: "KC", position: "LT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 76, height: "6-6", weight: "338", age: 31, college: "Penn State", experience: 10, injuryStatus: "Active", stats: { gamesStarted: 15, sacks: 3 } },
  { id: pid("KC", "LT", 2), name: "Wanya Morris", team: "KC", position: "LT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 68, height: "6-5", weight: "310", age: 24, college: "Oklahoma", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("KC", "LT", 3), name: "Ethan Driskell", team: "KC", position: "LT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 72, height: "6-6", weight: "315", age: 23, college: "UCF", experience: 1, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("KC", "LG", 1), name: "Joe Thuney", team: "KC", position: "LG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 62, height: "6-5", weight: "308", age: 32, college: "NC State", experience: 9, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 1 } },
  { id: pid("KC", "LG", 2), name: "Nick Allegretti", team: "KC", position: "LG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 73, height: "6-4", weight: "325", age: 28, college: "Illinois", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 3, sacks: 0 } },
  { id: pid("KC", "LG", 3), name: "Mike Caliendo", team: "KC", position: "LG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 64, height: "6-4", weight: "305", age: 24, college: "Western Michigan", experience: 1, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("KC", "C", 1), name: "Creed Humphrey", team: "KC", position: "C", positionGroup: "offense", depthOrder: 1, jerseyNumber: 52, height: "6-5", weight: "320", age: 25, college: "Oklahoma", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 17, sacks: 0 } },
  { id: pid("KC", "C", 2), name: "Hunter Nourzad", team: "KC", position: "C", positionGroup: "offense", depthOrder: 2, jerseyNumber: 67, height: "6-3", weight: "305", age: 25, college: "Portland State", experience: 1, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("KC", "C", 3), name: "Austin Reiter", team: "KC", position: "C", positionGroup: "offense", depthOrder: 3, jerseyNumber: 71, height: "6-3", weight: "305", age: 33, college: "South Florida", experience: 9, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("KC", "RG", 1), name: "Trey Smith", team: "KC", position: "RG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 65, height: "6-6", weight: "320", age: 25, college: "Tennessee", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 17, sacks: 1 } },
  { id: pid("KC", "RG", 2), name: "Mike Caliendo", team: "KC", position: "RG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 64, height: "6-4", weight: "305", age: 24, college: "Western Michigan", experience: 1, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("KC", "RG", 3), name: "C.J. Hanson", team: "KC", position: "RG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 70, height: "6-5", weight: "315", age: 24, college: "Boise State", experience: 1, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("KC", "RT", 1), name: "Jawaan Taylor", team: "KC", position: "RT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 74, height: "6-5", weight: "312", age: 26, college: "Florida", experience: 6, injuryStatus: "Questionable", injuryDetail: "Knee — Limited practice Wed/Thu", stats: { gamesStarted: 14, sacks: 4 } },
  { id: pid("KC", "RT", 2), name: "Wanya Morris", team: "KC", position: "RT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 68, height: "6-5", weight: "310", age: 24, college: "Oklahoma", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 3, sacks: 1 } },
  { id: pid("KC", "RT", 3), name: "Ethan Driskell", team: "KC", position: "RT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 72, height: "6-6", weight: "315", age: 23, college: "UCF", experience: 1, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  // --- Defense ---
  { id: pid("KC", "DE1", 1), name: "George Karlaftis", team: "KC", position: "DE1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 56, height: "6-4", weight: "275", age: 24, college: "Purdue", experience: 3, injuryStatus: "Active", stats: { tackles: 52, sacks: 8.5, tfl: 10, ff: 2 } },
  { id: pid("KC", "DE1", 2), name: "Felix Anudike-Uzomah", team: "KC", position: "DE1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 91, height: "6-3", weight: "255", age: 23, college: "Kansas State", experience: 2, injuryStatus: "Active", stats: { tackles: 28, sacks: 4.0, tfl: 5, ff: 1 } },
  { id: pid("KC", "DE1", 3), name: "Malik Herring", team: "KC", position: "DE1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 95, height: "6-3", weight: "280", age: 27, college: "Georgia", experience: 3, injuryStatus: "Active", stats: { tackles: 10, sacks: 1.0, tfl: 2, ff: 0 } },
  { id: pid("KC", "DE2", 1), name: "Charles Omenihu", team: "KC", position: "DE2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 90, height: "6-5", weight: "280", age: 27, college: "Texas", experience: 6, injuryStatus: "Active", stats: { tackles: 38, sacks: 6.5, tfl: 8, ff: 1 } },
  { id: pid("KC", "DE2", 2), name: "BJ Thompson", team: "KC", position: "DE2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 98, height: "6-5", weight: "259", age: 25, college: "Stephen F. Austin", experience: 3, injuryStatus: "Active", stats: { tackles: 15, sacks: 2.0, tfl: 3, ff: 0 } },
  { id: pid("KC", "DE2", 3), name: "Truman Jones", team: "KC", position: "DE2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 92, height: "6-4", weight: "270", age: 23, college: "Virginia", experience: 1, injuryStatus: "Active", stats: { tackles: 5, sacks: 0.5, tfl: 1, ff: 0 } },
  { id: pid("KC", "DT1", 1), name: "Chris Jones", team: "KC", position: "DT1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 95, height: "6-6", weight: "310", age: 30, college: "Mississippi State", experience: 8, injuryStatus: "Active", stats: { tackles: 48, sacks: 10.5, tfl: 12, ff: 3 } },
  { id: pid("KC", "DT1", 2), name: "Derrick Nnadi", team: "KC", position: "DT1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 91, height: "6-0", weight: "325", age: 28, college: "Florida State", experience: 7, injuryStatus: "Active", stats: { tackles: 22, sacks: 1.0, tfl: 3, ff: 0 } },
  { id: pid("KC", "DT1", 3), name: "Tershawn Wharton", team: "KC", position: "DT1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 98, height: "6-4", weight: "280", age: 27, college: "Missouri S&T", experience: 5, injuryStatus: "Active", stats: { tackles: 18, sacks: 2.0, tfl: 4, ff: 1 } },
  { id: pid("KC", "DT2", 1), name: "Mike Pennel", team: "KC", position: "DT2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 64, height: "6-4", weight: "332", age: 32, college: "Colorado State-Pueblo", experience: 10, injuryStatus: "Active", stats: { tackles: 30, sacks: 1.5, tfl: 4, ff: 0 } },
  { id: pid("KC", "DT2", 2), name: "Tershawn Wharton", team: "KC", position: "DT2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 98, height: "6-4", weight: "280", age: 27, college: "Missouri S&T", experience: 5, injuryStatus: "Active", stats: { tackles: 18, sacks: 2.0, tfl: 4, ff: 1 } },
  { id: pid("KC", "DT2", 3), name: "Neil Farrell Jr.", team: "KC", position: "DT2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 77, height: "6-4", weight: "330", age: 26, college: "LSU", experience: 3, injuryStatus: "Active", stats: { tackles: 12, sacks: 0.5, tfl: 2, ff: 0 } },
  { id: pid("KC", "LB1", 1), name: "Nick Bolton", team: "KC", position: "LB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 32, height: "6-0", weight: "237", age: 24, college: "Missouri", experience: 4, injuryStatus: "Active", stats: { tackles: 120, sacks: 3.0, tfl: 8, int: 1 } },
  { id: pid("KC", "LB1", 2), name: "Jack Cochrane", team: "KC", position: "LB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 48, height: "6-1", weight: "230", age: 25, college: "South Dakota", experience: 2, injuryStatus: "Active", stats: { tackles: 25, sacks: 0.5, tfl: 2, int: 0 } },
  { id: pid("KC", "LB1", 3), name: "Curtis Jacobs", team: "KC", position: "LB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 44, height: "6-1", weight: "235", age: 23, college: "Penn State", experience: 1, injuryStatus: "Active", stats: { tackles: 8, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("KC", "LB2", 1), name: "Drue Tranquill", team: "KC", position: "LB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 23, height: "6-2", weight: "234", age: 29, college: "Notre Dame", experience: 6, injuryStatus: "Active", stats: { tackles: 85, sacks: 2.0, tfl: 5, int: 1 } },
  { id: pid("KC", "LB2", 2), name: "Leo Chenal", team: "KC", position: "LB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 54, height: "6-2", weight: "261", age: 24, college: "Wisconsin", experience: 3, injuryStatus: "Active", stats: { tackles: 45, sacks: 1.5, tfl: 4, int: 0 } },
  { id: pid("KC", "LB2", 3), name: "Cole Christiansen", team: "KC", position: "LB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 50, height: "6-1", weight: "235", age: 27, college: "Army", experience: 3, injuryStatus: "Active", stats: { tackles: 10, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("KC", "LB3", 1), name: "Leo Chenal", team: "KC", position: "LB3", positionGroup: "defense", depthOrder: 1, jerseyNumber: 54, height: "6-2", weight: "261", age: 24, college: "Wisconsin", experience: 3, injuryStatus: "Active", stats: { tackles: 45, sacks: 1.5, tfl: 4, int: 0 } },
  { id: pid("KC", "LB3", 2), name: "Jack Cochrane", team: "KC", position: "LB3", positionGroup: "defense", depthOrder: 2, jerseyNumber: 48, height: "6-1", weight: "230", age: 25, college: "South Dakota", experience: 2, injuryStatus: "Active", stats: { tackles: 25, sacks: 0.5, tfl: 2, int: 0 } },
  { id: pid("KC", "LB3", 3), name: "Curtis Jacobs", team: "KC", position: "LB3", positionGroup: "defense", depthOrder: 3, jerseyNumber: 44, height: "6-1", weight: "235", age: 23, college: "Penn State", experience: 1, injuryStatus: "Active", stats: { tackles: 8, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("KC", "CB1", 1), name: "Trent McDuffie", team: "KC", position: "CB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 21, height: "5-11", weight: "193", age: 24, college: "Washington", experience: 3, injuryStatus: "Active", stats: { tackles: 58, int: 3, pd: 12, ff: 1 } },
  { id: pid("KC", "CB1", 2), name: "Joshua Williams", team: "KC", position: "CB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 23, height: "6-2", weight: "195", age: 25, college: "Fayetteville State", experience: 3, injuryStatus: "Active", stats: { tackles: 30, int: 1, pd: 6, ff: 0 } },
  { id: pid("KC", "CB1", 3), name: "Nic Jones", team: "KC", position: "CB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 2, height: "6-0", weight: "195", age: 25, college: "Ball State", experience: 2, injuryStatus: "Active", stats: { tackles: 12, int: 0, pd: 3, ff: 0 } },
  { id: pid("KC", "CB2", 1), name: "Jaylen Watson", team: "KC", position: "CB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 35, height: "6-2", weight: "195", age: 25, college: "Washington State", experience: 3, injuryStatus: "Out", injuryDetail: "Torn ACL — Out for season", stats: { tackles: 22, int: 1, pd: 5, ff: 0 } },
  { id: pid("KC", "CB2", 2), name: "Nazeeh Johnson", team: "KC", position: "CB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 38, height: "6-1", weight: "190", age: 24, college: "Marshall", experience: 2, injuryStatus: "Active", stats: { tackles: 18, int: 0, pd: 4, ff: 0 } },
  { id: pid("KC", "CB2", 3), name: "Ekow Boye-Doe", team: "KC", position: "CB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 37, height: "6-1", weight: "190", age: 24, college: "Kansas State", experience: 1, injuryStatus: "Active", stats: { tackles: 5, int: 0, pd: 1, ff: 0 } },
  { id: pid("KC", "SS", 1), name: "Justin Reid", team: "KC", position: "SS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 20, height: "6-1", weight: "203", age: 27, college: "Stanford", experience: 7, injuryStatus: "Active", stats: { tackles: 75, int: 2, pd: 8, ff: 1 } },
  { id: pid("KC", "SS", 2), name: "Chamarri Conner", team: "KC", position: "SS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 27, height: "5-11", weight: "205", age: 24, college: "Virginia Tech", experience: 2, injuryStatus: "Active", stats: { tackles: 30, int: 0, pd: 3, ff: 0 } },
  { id: pid("KC", "SS", 3), name: "Jaden Hicks", team: "KC", position: "SS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 43, height: "6-1", weight: "210", age: 22, college: "Washington State", experience: 1, injuryStatus: "Active", stats: { tackles: 8, int: 0, pd: 1, ff: 0 } },
  { id: pid("KC", "FS", 1), name: "Bryan Cook", team: "KC", position: "FS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 6, height: "6-1", weight: "206", age: 25, college: "Cincinnati", experience: 3, injuryStatus: "Active", stats: { tackles: 65, int: 2, pd: 7, ff: 1 } },
  { id: pid("KC", "FS", 2), name: "Chamarri Conner", team: "KC", position: "FS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 27, height: "5-11", weight: "205", age: 24, college: "Virginia Tech", experience: 2, injuryStatus: "Active", stats: { tackles: 30, int: 0, pd: 3, ff: 0 } },
  { id: pid("KC", "FS", 3), name: "Jaden Hicks", team: "KC", position: "FS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 43, height: "6-1", weight: "210", age: 22, college: "Washington State", experience: 1, injuryStatus: "Active", stats: { tackles: 8, int: 0, pd: 1, ff: 0 } },
  // --- Special Teams ---
  { id: pid("KC", "K", 1), name: "Harrison Butker", team: "KC", position: "K", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 7, height: "6-4", weight: "205", age: 29, college: "Georgia Tech", experience: 8, injuryStatus: "Active", stats: { fgMade: 28, fgAtt: 31, xpMade: 48, longFG: 57 } },
  { id: pid("KC", "K", 2), name: "Spencer Shrader", team: "KC", position: "K", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 3, height: "5-10", weight: "190", age: 23, college: "Notre Dame", experience: 1, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("KC", "K", 3), name: "Matthew Wright", team: "KC", position: "K", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 8, height: "5-11", weight: "195", age: 28, college: "UCF", experience: 4, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("KC", "P", 1), name: "Tommy Townsend", team: "KC", position: "P", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 5, height: "6-1", weight: "191", age: 28, college: "Florida", experience: 5, injuryStatus: "Active", stats: { punts: 55, puntAvg: 46.2, inside20: 22, longPunt: 62 } },
  { id: pid("KC", "P", 2), name: "Spencer Shrader", team: "KC", position: "P", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 3, height: "5-10", weight: "190", age: 23, college: "Notre Dame", experience: 1, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("KC", "P", 3), name: "Matthew Wright", team: "KC", position: "P", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 8, height: "5-11", weight: "195", age: 28, college: "UCF", experience: 4, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("KC", "KR", 1), name: "Mecole Hardman", team: "KC", position: "KR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 12, height: "5-10", weight: "187", age: 26, college: "Georgia", experience: 6, injuryStatus: "Active", stats: { krYds: 380, krAvg: 22.4, krTD: 0, krLong: 45 } },
  { id: pid("KC", "KR", 2), name: "Xavier Worthy", team: "KC", position: "KR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 1, height: "5-11", weight: "165", age: 21, college: "Texas", experience: 1, injuryStatus: "Active", stats: { krYds: 120, krAvg: 20.0, krTD: 0, krLong: 30 } },
  { id: pid("KC", "KR", 3), name: "Nikko Remigio", team: "KC", position: "KR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 84, height: "5-11", weight: "185", age: 25, college: "Fresno State", experience: 1, injuryStatus: "Active", stats: { krYds: 60, krAvg: 20.0, krTD: 0, krLong: 25 } },
  { id: pid("KC", "PR", 1), name: "Mecole Hardman", team: "KC", position: "PR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 12, height: "5-10", weight: "187", age: 26, college: "Georgia", experience: 6, injuryStatus: "Active", stats: { prYds: 150, prAvg: 8.5, prTD: 0, prLong: 22 } },
  { id: pid("KC", "PR", 2), name: "Skyy Moore", team: "KC", position: "PR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 24, height: "5-10", weight: "195", age: 24, college: "Western Michigan", experience: 3, injuryStatus: "Active", stats: { prYds: 40, prAvg: 6.7, prTD: 0, prLong: 15 } },
  { id: pid("KC", "PR", 3), name: "Nikko Remigio", team: "KC", position: "PR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 84, height: "5-11", weight: "185", age: 25, college: "Fresno State", experience: 1, injuryStatus: "Active", stats: { prYds: 20, prAvg: 5.0, prTD: 0, prLong: 10 } },
  { id: pid("KC", "LS", 1), name: "James Winchester", team: "KC", position: "LS", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 41, height: "6-3", weight: "250", age: 33, college: "Oklahoma", experience: 10, injuryStatus: "Active", stats: { gamesPlayed: 17, badSnaps: 0 } },
  { id: pid("KC", "LS", 2), name: "Austin Reiter", team: "KC", position: "LS", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 71, height: "6-3", weight: "305", age: 33, college: "South Florida", experience: 9, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },
  { id: pid("KC", "LS", 3), name: "Hunter Nourzad", team: "KC", position: "LS", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 67, height: "6-3", weight: "305", age: 25, college: "Portland State", experience: 1, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },

  // =============================================
  // PHILADELPHIA EAGLES (Showcase — full 3-deep)
  // =============================================
  // --- Offense ---
  { id: pid("PHI", "QB", 1), name: "Jalen Hurts", team: "PHI", position: "QB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 1, height: "6-1", weight: "223", age: 26, college: "Oklahoma", experience: 5, injuryStatus: "Questionable", injuryDetail: "Ankle — tweaked in practice", stats: { passYds: 3858, passTD: 28, int: 12, qbr: 91.5 } },
  { id: pid("PHI", "QB", 2), name: "Kenny Pickett", team: "PHI", position: "QB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 7, height: "6-3", weight: "220", age: 26, college: "Pittsburgh", experience: 3, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("PHI", "QB", 3), name: "Tanner McKee", team: "PHI", position: "QB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 16, height: "6-6", weight: "230", age: 24, college: "Stanford", experience: 2, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("PHI", "RB", 1), name: "Saquon Barkley", team: "PHI", position: "RB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 26, height: "6-0", weight: "232", age: 27, college: "Penn State", experience: 7, injuryStatus: "Active", stats: { rushYds: 1312, rushTD: 11, ypc: 5.1, rec: 38 } },
  { id: pid("PHI", "RB", 2), name: "Kenneth Gainwell", team: "PHI", position: "RB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 14, height: "5-9", weight: "201", age: 25, college: "Memphis", experience: 4, injuryStatus: "Active", stats: { rushYds: 280, rushTD: 3, ypc: 4.2, rec: 22 } },
  { id: pid("PHI", "RB", 3), name: "Boston Scott", team: "PHI", position: "RB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 35, height: "5-6", weight: "203", age: 29, college: "Louisiana Tech", experience: 6, injuryStatus: "Active", stats: { rushYds: 60, rushTD: 1, ypc: 3.5, rec: 8 } },
  { id: pid("PHI", "WR1", 1), name: "A.J. Brown", team: "PHI", position: "WR1", positionGroup: "offense", depthOrder: 1, jerseyNumber: 11, height: "6-1", weight: "226", age: 27, college: "Ole Miss", experience: 6, injuryStatus: "Active", stats: { recYds: 1230, recTD: 9, rec: 78, targets: 120 } },
  { id: pid("PHI", "WR1", 2), name: "Jahan Dotson", team: "PHI", position: "WR1", positionGroup: "offense", depthOrder: 2, jerseyNumber: 5, height: "5-11", weight: "178", age: 24, college: "Penn State", experience: 3, injuryStatus: "Active", stats: { recYds: 320, recTD: 2, rec: 28, targets: 45 } },
  { id: pid("PHI", "WR1", 3), name: "Johnny Wilson", team: "PHI", position: "WR1", positionGroup: "offense", depthOrder: 3, jerseyNumber: 89, height: "6-6", weight: "230", age: 23, college: "Florida State", experience: 1, injuryStatus: "Active", stats: { recYds: 40, recTD: 0, rec: 4, targets: 8 } },
  { id: pid("PHI", "WR2", 1), name: "DeVonta Smith", team: "PHI", position: "WR2", positionGroup: "offense", depthOrder: 1, jerseyNumber: 6, height: "6-0", weight: "170", age: 26, college: "Alabama", experience: 4, injuryStatus: "Active", stats: { recYds: 1050, recTD: 7, rec: 72, targets: 110 } },
  { id: pid("PHI", "WR2", 2), name: "Britain Covey", team: "PHI", position: "WR2", positionGroup: "offense", depthOrder: 2, jerseyNumber: 18, height: "5-8", weight: "173", age: 27, college: "Utah", experience: 3, injuryStatus: "Active", stats: { recYds: 120, recTD: 0, rec: 14, targets: 20 } },
  { id: pid("PHI", "WR2", 3), name: "Parris Campbell", team: "PHI", position: "WR2", positionGroup: "offense", depthOrder: 3, jerseyNumber: 0, height: "6-0", weight: "205", age: 27, college: "Ohio State", experience: 6, injuryStatus: "Active", stats: { recYds: 50, recTD: 0, rec: 5, targets: 10 } },
  { id: pid("PHI", "WR3", 1), name: "Jahan Dotson", team: "PHI", position: "WR3", positionGroup: "offense", depthOrder: 1, jerseyNumber: 5, height: "5-11", weight: "178", age: 24, college: "Penn State", experience: 3, injuryStatus: "Active", stats: { recYds: 320, recTD: 2, rec: 28, targets: 45 } },
  { id: pid("PHI", "WR3", 2), name: "Britain Covey", team: "PHI", position: "WR3", positionGroup: "offense", depthOrder: 2, jerseyNumber: 18, height: "5-8", weight: "173", age: 27, college: "Utah", experience: 3, injuryStatus: "Active", stats: { recYds: 120, recTD: 0, rec: 14, targets: 20 } },
  { id: pid("PHI", "WR3", 3), name: "John Ross", team: "PHI", position: "WR3", positionGroup: "offense", depthOrder: 3, jerseyNumber: 12, height: "5-11", weight: "190", age: 29, college: "Washington", experience: 6, injuryStatus: "Active", stats: { recYds: 15, recTD: 0, rec: 2, targets: 5 } },
  { id: pid("PHI", "TE", 1), name: "Dallas Goedert", team: "PHI", position: "TE", positionGroup: "offense", depthOrder: 1, jerseyNumber: 88, height: "6-5", weight: "256", age: 29, college: "South Dakota State", experience: 7, injuryStatus: "Active", stats: { recYds: 650, recTD: 4, rec: 55, targets: 72 } },
  { id: pid("PHI", "TE", 2), name: "Grant Calcaterra", team: "PHI", position: "TE", positionGroup: "offense", depthOrder: 2, jerseyNumber: 86, height: "6-4", weight: "240", age: 25, college: "SMU", experience: 3, injuryStatus: "Active", stats: { recYds: 180, recTD: 2, rec: 18, targets: 25 } },
  { id: pid("PHI", "TE", 3), name: "Albert Okwuegbunam", team: "PHI", position: "TE", positionGroup: "offense", depthOrder: 3, jerseyNumber: 85, height: "6-5", weight: "258", age: 26, college: "Missouri", experience: 5, injuryStatus: "Active", stats: { recYds: 60, recTD: 0, rec: 6, targets: 10 } },
  { id: pid("PHI", "LT", 1), name: "Jordan Mailata", team: "PHI", position: "LT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 68, height: "6-8", weight: "365", age: 27, college: "None (Australia)", experience: 7, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 2 } },
  { id: pid("PHI", "LT", 2), name: "Fred Johnson", team: "PHI", position: "LT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 74, height: "6-7", weight: "326", age: 27, college: "Florida", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("PHI", "LT", 3), name: "Brett Toth", team: "PHI", position: "LT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 60, height: "6-6", weight: "310", age: 28, college: "Army", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("PHI", "LG", 1), name: "Landon Dickerson", team: "PHI", position: "LG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 69, height: "6-6", weight: "333", age: 26, college: "Alabama", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 17, sacks: 1 } },
  { id: pid("PHI", "LG", 2), name: "Tyler Steen", team: "PHI", position: "LG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 65, height: "6-5", weight: "315", age: 24, college: "Alabama", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 3, sacks: 0 } },
  { id: pid("PHI", "LG", 3), name: "Max Scharping", team: "PHI", position: "LG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 74, height: "6-6", weight: "327", age: 28, college: "Northern Illinois", experience: 6, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("PHI", "C", 1), name: "Cam Jurgens", team: "PHI", position: "C", positionGroup: "offense", depthOrder: 1, jerseyNumber: 51, height: "6-3", weight: "303", age: 25, college: "Nebraska", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 17, sacks: 0 } },
  { id: pid("PHI", "C", 2), name: "Dalton Risner", team: "PHI", position: "C", positionGroup: "offense", depthOrder: 2, jerseyNumber: 66, height: "6-5", weight: "312", age: 29, college: "Kansas State", experience: 6, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("PHI", "C", 3), name: "Nate Herbig", team: "PHI", position: "C", positionGroup: "offense", depthOrder: 3, jerseyNumber: 67, height: "6-4", weight: "334", age: 26, college: "Stanford", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("PHI", "RG", 1), name: "Mekhi Becton", team: "PHI", position: "RG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 72, height: "6-7", weight: "363", age: 25, college: "Louisville", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 15, sacks: 2 } },
  { id: pid("PHI", "RG", 2), name: "Tyler Steen", team: "PHI", position: "RG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 65, height: "6-5", weight: "315", age: 24, college: "Alabama", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("PHI", "RG", 3), name: "Max Scharping", team: "PHI", position: "RG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 74, height: "6-6", weight: "327", age: 28, college: "Northern Illinois", experience: 6, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("PHI", "RT", 1), name: "Lane Johnson", team: "PHI", position: "RT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 65, height: "6-6", weight: "317", age: 34, college: "Oklahoma", experience: 12, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 2 } },
  { id: pid("PHI", "RT", 2), name: "Fred Johnson", team: "PHI", position: "RT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 74, height: "6-7", weight: "326", age: 27, college: "Florida", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("PHI", "RT", 3), name: "Brett Toth", team: "PHI", position: "RT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 60, height: "6-6", weight: "310", age: 28, college: "Army", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  // --- Defense ---
  { id: pid("PHI", "DE1", 1), name: "Josh Sweat", team: "PHI", position: "DE1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 94, height: "6-5", weight: "265", age: 27, college: "Florida State", experience: 7, injuryStatus: "Active", stats: { tackles: 45, sacks: 9.0, tfl: 11, ff: 2 } },
  { id: pid("PHI", "DE1", 2), name: "Nolan Smith", team: "PHI", position: "DE1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 3, height: "6-2", weight: "238", age: 23, college: "Georgia", experience: 2, injuryStatus: "Active", stats: { tackles: 20, sacks: 3.0, tfl: 4, ff: 0 } },
  { id: pid("PHI", "DE1", 3), name: "Patrick Johnson", team: "PHI", position: "DE1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 48, height: "6-3", weight: "250", age: 26, college: "Tulane", experience: 4, injuryStatus: "Active", stats: { tackles: 10, sacks: 1.0, tfl: 2, ff: 0 } },
  { id: pid("PHI", "DE2", 1), name: "Brandon Graham", team: "PHI", position: "DE2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 55, height: "6-2", weight: "265", age: 36, college: "Michigan", experience: 15, injuryStatus: "IR", injuryDetail: "Triceps — placed on IR", stats: { tackles: 18, sacks: 3.0, tfl: 4, ff: 1 } },
  { id: pid("PHI", "DE2", 2), name: "Bryce Huff", team: "PHI", position: "DE2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 11, height: "6-3", weight: "255", age: 26, college: "Memphis", experience: 5, injuryStatus: "Active", stats: { tackles: 30, sacks: 6.5, tfl: 7, ff: 1 } },
  { id: pid("PHI", "DE2", 3), name: "Tarron Jackson", team: "PHI", position: "DE2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 75, height: "6-2", weight: "254", age: 26, college: "Coastal Carolina", experience: 4, injuryStatus: "Active", stats: { tackles: 8, sacks: 0.5, tfl: 1, ff: 0 } },
  { id: pid("PHI", "DT1", 1), name: "Jalen Carter", team: "PHI", position: "DT1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 98, height: "6-3", weight: "314", age: 23, college: "Georgia", experience: 2, injuryStatus: "Active", stats: { tackles: 55, sacks: 5.5, tfl: 10, ff: 2 } },
  { id: pid("PHI", "DT1", 2), name: "Milton Williams", team: "PHI", position: "DT1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 93, height: "6-3", weight: "284", age: 25, college: "Louisiana Tech", experience: 4, injuryStatus: "Active", stats: { tackles: 28, sacks: 3.0, tfl: 5, ff: 0 } },
  { id: pid("PHI", "DT1", 3), name: "Marlon Tuipulotu", team: "PHI", position: "DT1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 97, height: "6-2", weight: "305", age: 25, college: "USC", experience: 4, injuryStatus: "Active", stats: { tackles: 12, sacks: 0.5, tfl: 2, ff: 0 } },
  { id: pid("PHI", "DT2", 1), name: "Jordan Davis", team: "PHI", position: "DT2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 90, height: "6-6", weight: "340", age: 25, college: "Georgia", experience: 3, injuryStatus: "Active", stats: { tackles: 40, sacks: 2.5, tfl: 6, ff: 0 } },
  { id: pid("PHI", "DT2", 2), name: "Thomas Booker", team: "PHI", position: "DT2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 91, height: "6-3", weight: "301", age: 25, college: "Stanford", experience: 3, injuryStatus: "Active", stats: { tackles: 15, sacks: 0.5, tfl: 2, ff: 0 } },
  { id: pid("PHI", "DT2", 3), name: "Kentavius Street", team: "PHI", position: "DT2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 95, height: "6-2", weight: "290", age: 28, college: "NC State", experience: 6, injuryStatus: "Active", stats: { tackles: 8, sacks: 0, tfl: 1, ff: 0 } },
  { id: pid("PHI", "LB1", 1), name: "Devin White", team: "PHI", position: "LB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 40, height: "6-0", weight: "237", age: 26, college: "LSU", experience: 6, injuryStatus: "Active", stats: { tackles: 75, sacks: 2.0, tfl: 5, int: 0 } },
  { id: pid("PHI", "LB1", 2), name: "Nakobe Dean", team: "PHI", position: "LB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 17, height: "5-11", weight: "231", age: 24, college: "Georgia", experience: 3, injuryStatus: "Active", stats: { tackles: 50, sacks: 1.0, tfl: 3, int: 1 } },
  { id: pid("PHI", "LB1", 3), name: "Zach Cunningham", team: "PHI", position: "LB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 52, height: "6-3", weight: "238", age: 30, college: "Vanderbilt", experience: 8, injuryStatus: "Active", stats: { tackles: 20, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("PHI", "LB2", 1), name: "Nakobe Dean", team: "PHI", position: "LB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 17, height: "5-11", weight: "231", age: 24, college: "Georgia", experience: 3, injuryStatus: "Active", stats: { tackles: 50, sacks: 1.0, tfl: 3, int: 1 } },
  { id: pid("PHI", "LB2", 2), name: "Zach Cunningham", team: "PHI", position: "LB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 52, height: "6-3", weight: "238", age: 30, college: "Vanderbilt", experience: 8, injuryStatus: "Active", stats: { tackles: 20, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("PHI", "LB2", 3), name: "Ben VanSumeren", team: "PHI", position: "LB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 43, height: "6-2", weight: "250", age: 24, college: "Michigan State", experience: 2, injuryStatus: "Active", stats: { tackles: 10, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("PHI", "LB3", 1), name: "Zach Cunningham", team: "PHI", position: "LB3", positionGroup: "defense", depthOrder: 1, jerseyNumber: 52, height: "6-3", weight: "238", age: 30, college: "Vanderbilt", experience: 8, injuryStatus: "Active", stats: { tackles: 20, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("PHI", "LB3", 2), name: "Ben VanSumeren", team: "PHI", position: "LB3", positionGroup: "defense", depthOrder: 2, jerseyNumber: 43, height: "6-2", weight: "250", age: 24, college: "Michigan State", experience: 2, injuryStatus: "Active", stats: { tackles: 10, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("PHI", "LB3", 3), name: "Nicholas Morrow", team: "PHI", position: "LB3", positionGroup: "defense", depthOrder: 3, jerseyNumber: 31, height: "6-0", weight: "225", age: 28, college: "Greenville", experience: 7, injuryStatus: "Active", stats: { tackles: 8, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("PHI", "CB1", 1), name: "Darius Slay", team: "PHI", position: "CB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 2, height: "6-0", weight: "190", age: 33, college: "Mississippi State", experience: 12, injuryStatus: "Active", stats: { tackles: 45, int: 3, pd: 14, ff: 0 } },
  { id: pid("PHI", "CB1", 2), name: "Kelee Ringo", team: "PHI", position: "CB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 22, height: "6-2", weight: "210", age: 22, college: "Georgia", experience: 2, injuryStatus: "Active", stats: { tackles: 15, int: 0, pd: 3, ff: 0 } },
  { id: pid("PHI", "CB1", 3), name: "Josh Jobe", team: "PHI", position: "CB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 28, height: "6-1", weight: "192", age: 25, college: "Alabama", experience: 3, injuryStatus: "Active", stats: { tackles: 5, int: 0, pd: 1, ff: 0 } },
  { id: pid("PHI", "CB2", 1), name: "Quinyon Mitchell", team: "PHI", position: "CB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 27, height: "5-11", weight: "193", age: 23, college: "Toledo", experience: 1, injuryStatus: "Active", stats: { tackles: 40, int: 2, pd: 10, ff: 0 } },
  { id: pid("PHI", "CB2", 2), name: "Isaiah Rodgers", team: "PHI", position: "CB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 7, height: "5-10", weight: "170", age: 26, college: "UMass", experience: 4, injuryStatus: "Active", stats: { tackles: 18, int: 1, pd: 4, ff: 0 } },
  { id: pid("PHI", "CB2", 3), name: "Eli Ricks", team: "PHI", position: "CB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 24, height: "6-2", weight: "190", age: 23, college: "Alabama", experience: 2, injuryStatus: "Active", stats: { tackles: 5, int: 0, pd: 1, ff: 0 } },
  { id: pid("PHI", "SS", 1), name: "C.J. Gardner-Johnson", team: "PHI", position: "SS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 23, height: "5-11", weight: "210", age: 27, college: "Florida", experience: 6, injuryStatus: "Active", stats: { tackles: 60, int: 3, pd: 8, ff: 1 } },
  { id: pid("PHI", "SS", 2), name: "Reed Blankenship", team: "PHI", position: "SS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 32, height: "6-1", weight: "203", age: 26, college: "Middle Tennessee", experience: 3, injuryStatus: "Active", stats: { tackles: 35, int: 1, pd: 4, ff: 0 } },
  { id: pid("PHI", "SS", 3), name: "Tristin McCollum", team: "PHI", position: "SS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 33, height: "6-0", weight: "200", age: 25, college: "Sam Houston", experience: 2, injuryStatus: "Active", stats: { tackles: 8, int: 0, pd: 1, ff: 0 } },
  { id: pid("PHI", "FS", 1), name: "Reed Blankenship", team: "PHI", position: "FS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 32, height: "6-1", weight: "203", age: 26, college: "Middle Tennessee", experience: 3, injuryStatus: "Active", stats: { tackles: 35, int: 1, pd: 4, ff: 0 } },
  { id: pid("PHI", "FS", 2), name: "Tristin McCollum", team: "PHI", position: "FS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 33, height: "6-0", weight: "200", age: 25, college: "Sam Houston", experience: 2, injuryStatus: "Active", stats: { tackles: 8, int: 0, pd: 1, ff: 0 } },
  { id: pid("PHI", "FS", 3), name: "Andre' Sam", team: "PHI", position: "FS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 36, height: "6-1", weight: "205", age: 23, college: "LSU", experience: 1, injuryStatus: "Active", stats: { tackles: 3, int: 0, pd: 0, ff: 0 } },
  // --- Special Teams ---
  { id: pid("PHI", "K", 1), name: "Jake Elliott", team: "PHI", position: "K", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 4, height: "5-9", weight: "167", age: 29, college: "Memphis", experience: 8, injuryStatus: "Active", stats: { fgMade: 30, fgAtt: 34, xpMade: 45, longFG: 56 } },
  { id: pid("PHI", "K", 2), name: "Cameron Dicker", team: "PHI", position: "K", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 37, height: "6-1", weight: "207", age: 24, college: "Texas", experience: 2, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("PHI", "K", 3), name: "Tanner McKee", team: "PHI", position: "K", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 16, height: "6-6", weight: "230", age: 24, college: "Stanford", experience: 2, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("PHI", "P", 1), name: "Braden Mann", team: "PHI", position: "P", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 17, height: "6-0", weight: "200", age: 27, college: "Texas A&M", experience: 5, injuryStatus: "Active", stats: { punts: 50, puntAvg: 45.8, inside20: 20, longPunt: 60 } },
  { id: pid("PHI", "P", 2), name: "Jake Elliott", team: "PHI", position: "P", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 4, height: "5-9", weight: "167", age: 29, college: "Memphis", experience: 8, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("PHI", "P", 3), name: "Tanner McKee", team: "PHI", position: "P", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 16, height: "6-6", weight: "230", age: 24, college: "Stanford", experience: 2, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("PHI", "KR", 1), name: "Britain Covey", team: "PHI", position: "KR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 18, height: "5-8", weight: "173", age: 27, college: "Utah", experience: 3, injuryStatus: "Active", stats: { krYds: 420, krAvg: 23.3, krTD: 0, krLong: 48 } },
  { id: pid("PHI", "KR", 2), name: "Kenneth Gainwell", team: "PHI", position: "KR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 14, height: "5-9", weight: "201", age: 25, college: "Memphis", experience: 4, injuryStatus: "Active", stats: { krYds: 100, krAvg: 20.0, krTD: 0, krLong: 28 } },
  { id: pid("PHI", "KR", 3), name: "John Ross", team: "PHI", position: "KR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 12, height: "5-11", weight: "190", age: 29, college: "Washington", experience: 6, injuryStatus: "Active", stats: { krYds: 0, krAvg: 0, krTD: 0, krLong: 0 } },
  { id: pid("PHI", "PR", 1), name: "Britain Covey", team: "PHI", position: "PR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 18, height: "5-8", weight: "173", age: 27, college: "Utah", experience: 3, injuryStatus: "Active", stats: { prYds: 180, prAvg: 9.0, prTD: 0, prLong: 25 } },
  { id: pid("PHI", "PR", 2), name: "Jahan Dotson", team: "PHI", position: "PR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 5, height: "5-11", weight: "178", age: 24, college: "Penn State", experience: 3, injuryStatus: "Active", stats: { prYds: 30, prAvg: 6.0, prTD: 0, prLong: 12 } },
  { id: pid("PHI", "PR", 3), name: "DeVonta Smith", team: "PHI", position: "PR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 6, height: "6-0", weight: "170", age: 26, college: "Alabama", experience: 4, injuryStatus: "Active", stats: { prYds: 0, prAvg: 0, prTD: 0, prLong: 0 } },
  { id: pid("PHI", "LS", 1), name: "Rick Lovato", team: "PHI", position: "LS", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 45, height: "6-1", weight: "245", age: 32, college: "Old Dominion", experience: 9, injuryStatus: "Active", stats: { gamesPlayed: 17, badSnaps: 0 } },
  { id: pid("PHI", "LS", 2), name: "Cam Jurgens", team: "PHI", position: "LS", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 51, height: "6-3", weight: "303", age: 25, college: "Nebraska", experience: 3, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },
  { id: pid("PHI", "LS", 3), name: "Nate Herbig", team: "PHI", position: "LS", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 67, height: "6-4", weight: "334", age: 26, college: "Stanford", experience: 5, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },

  // =============================================
  // DALLAS COWBOYS (Showcase — full 3-deep)
  // =============================================
  // --- Offense ---
  { id: pid("DAL", "QB", 1), name: "Dak Prescott", team: "DAL", position: "QB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 4, height: "6-2", weight: "238", age: 31, college: "Mississippi State", experience: 9, injuryStatus: "Out", injuryDetail: "Hamstring — ruled out", stats: { passYds: 3200, passTD: 22, int: 10, qbr: 88.5 } },
  { id: pid("DAL", "QB", 2), name: "Cooper Rush", team: "DAL", position: "QB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 10, height: "6-3", weight: "225", age: 31, college: "Central Michigan", experience: 7, injuryStatus: "Active", stats: { passYds: 420, passTD: 3, int: 1, qbr: 78.2 } },
  { id: pid("DAL", "QB", 3), name: "Trey Lance", team: "DAL", position: "QB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 15, height: "6-4", weight: "226", age: 24, college: "North Dakota State", experience: 4, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("DAL", "RB", 1), name: "Ezekiel Elliott", team: "DAL", position: "RB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 21, height: "6-0", weight: "228", age: 29, college: "Ohio State", experience: 9, injuryStatus: "Active", stats: { rushYds: 640, rushTD: 5, ypc: 3.8, rec: 20 } },
  { id: pid("DAL", "RB", 2), name: "Rico Dowdle", team: "DAL", position: "RB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 23, height: "6-0", weight: "215", age: 26, college: "South Carolina", experience: 5, injuryStatus: "Active", stats: { rushYds: 380, rushTD: 3, ypc: 4.5, rec: 15 } },
  { id: pid("DAL", "RB", 3), name: "Deuce Vaughn", team: "DAL", position: "RB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 25, height: "5-6", weight: "179", age: 23, college: "Kansas State", experience: 2, injuryStatus: "Active", stats: { rushYds: 80, rushTD: 0, ypc: 4.0, rec: 8 } },
  { id: pid("DAL", "WR1", 1), name: "CeeDee Lamb", team: "DAL", position: "WR1", positionGroup: "offense", depthOrder: 1, jerseyNumber: 88, height: "6-2", weight: "198", age: 25, college: "Oklahoma", experience: 5, injuryStatus: "Active", stats: { recYds: 1350, recTD: 10, rec: 105, targets: 150 } },
  { id: pid("DAL", "WR1", 2), name: "Brandin Cooks", team: "DAL", position: "WR1", positionGroup: "offense", depthOrder: 2, jerseyNumber: 3, height: "5-10", weight: "183", age: 31, college: "Oregon State", experience: 11, injuryStatus: "Active", stats: { recYds: 450, recTD: 3, rec: 38, targets: 55 } },
  { id: pid("DAL", "WR1", 3), name: "Jalen Tolbert", team: "DAL", position: "WR1", positionGroup: "offense", depthOrder: 3, jerseyNumber: 1, height: "6-1", weight: "194", age: 25, college: "South Alabama", experience: 3, injuryStatus: "Active", stats: { recYds: 150, recTD: 1, rec: 15, targets: 25 } },
  { id: pid("DAL", "WR2", 1), name: "Brandin Cooks", team: "DAL", position: "WR2", positionGroup: "offense", depthOrder: 1, jerseyNumber: 3, height: "5-10", weight: "183", age: 31, college: "Oregon State", experience: 11, injuryStatus: "Active", stats: { recYds: 450, recTD: 3, rec: 38, targets: 55 } },
  { id: pid("DAL", "WR2", 2), name: "Jalen Tolbert", team: "DAL", position: "WR2", positionGroup: "offense", depthOrder: 2, jerseyNumber: 1, height: "6-1", weight: "194", age: 25, college: "South Alabama", experience: 3, injuryStatus: "Active", stats: { recYds: 150, recTD: 1, rec: 15, targets: 25 } },
  { id: pid("DAL", "WR2", 3), name: "KaVontae Turpin", team: "DAL", position: "WR2", positionGroup: "offense", depthOrder: 3, jerseyNumber: 2, height: "5-9", weight: "153", age: 28, college: "TCU", experience: 3, injuryStatus: "Active", stats: { recYds: 80, recTD: 0, rec: 8, targets: 12 } },
  { id: pid("DAL", "WR3", 1), name: "Jalen Tolbert", team: "DAL", position: "WR3", positionGroup: "offense", depthOrder: 1, jerseyNumber: 1, height: "6-1", weight: "194", age: 25, college: "South Alabama", experience: 3, injuryStatus: "Active", stats: { recYds: 150, recTD: 1, rec: 15, targets: 25 } },
  { id: pid("DAL", "WR3", 2), name: "KaVontae Turpin", team: "DAL", position: "WR3", positionGroup: "offense", depthOrder: 2, jerseyNumber: 2, height: "5-9", weight: "153", age: 28, college: "TCU", experience: 3, injuryStatus: "Active", stats: { recYds: 80, recTD: 0, rec: 8, targets: 12 } },
  { id: pid("DAL", "WR3", 3), name: "Ryan Flournoy", team: "DAL", position: "WR3", positionGroup: "offense", depthOrder: 3, jerseyNumber: 15, height: "6-1", weight: "200", age: 24, college: "SE Missouri State", experience: 1, injuryStatus: "Active", stats: { recYds: 20, recTD: 0, rec: 3, targets: 5 } },
  { id: pid("DAL", "TE", 1), name: "Jake Ferguson", team: "DAL", position: "TE", positionGroup: "offense", depthOrder: 1, jerseyNumber: 48, height: "6-5", weight: "250", age: 25, college: "Wisconsin", experience: 3, injuryStatus: "Active", stats: { recYds: 580, recTD: 5, rec: 52, targets: 68 } },
  { id: pid("DAL", "TE", 2), name: "Peyton Hendershot", team: "DAL", position: "TE", positionGroup: "offense", depthOrder: 2, jerseyNumber: 49, height: "6-4", weight: "245", age: 25, college: "Indiana", experience: 3, injuryStatus: "Active", stats: { recYds: 120, recTD: 1, rec: 12, targets: 18 } },
  { id: pid("DAL", "TE", 3), name: "Luke Schoonmaker", team: "DAL", position: "TE", positionGroup: "offense", depthOrder: 3, jerseyNumber: 86, height: "6-5", weight: "251", age: 25, college: "Michigan", experience: 2, injuryStatus: "Active", stats: { recYds: 60, recTD: 0, rec: 8, targets: 12 } },
  { id: pid("DAL", "LT", 1), name: "Tyler Guyton", team: "DAL", position: "LT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 76, height: "6-7", weight: "321", age: 22, college: "Oklahoma", experience: 1, injuryStatus: "Active", stats: { gamesStarted: 14, sacks: 4 } },
  { id: pid("DAL", "LT", 2), name: "Chuma Edoga", team: "DAL", position: "LT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 70, height: "6-3", weight: "308", age: 27, college: "USC", experience: 6, injuryStatus: "Active", stats: { gamesStarted: 3, sacks: 1 } },
  { id: pid("DAL", "LT", 3), name: "Josh Ball", team: "DAL", position: "LT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 75, height: "6-7", weight: "330", age: 25, college: "Marshall", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("DAL", "LG", 1), name: "Tyler Smith", team: "DAL", position: "LG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 73, height: "6-5", weight: "324", age: 23, college: "Tulsa", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 2 } },
  { id: pid("DAL", "LG", 2), name: "Brock Hoffman", team: "DAL", position: "LG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 61, height: "6-4", weight: "310", age: 26, college: "Virginia Tech", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("DAL", "LG", 3), name: "T.J. Bass", team: "DAL", position: "LG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 64, height: "6-5", weight: "318", age: 24, college: "Oregon", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("DAL", "C", 1), name: "Brock Hoffman", team: "DAL", position: "C", positionGroup: "offense", depthOrder: 1, jerseyNumber: 61, height: "6-4", weight: "310", age: 26, college: "Virginia Tech", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 15, sacks: 1 } },
  { id: pid("DAL", "C", 2), name: "T.J. Bass", team: "DAL", position: "C", positionGroup: "offense", depthOrder: 2, jerseyNumber: 64, height: "6-5", weight: "318", age: 24, college: "Oregon", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("DAL", "C", 3), name: "Dakoda Shepley", team: "DAL", position: "C", positionGroup: "offense", depthOrder: 3, jerseyNumber: 62, height: "6-3", weight: "305", age: 28, college: "Western Michigan", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("DAL", "RG", 1), name: "Zack Martin", team: "DAL", position: "RG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 70, height: "6-4", weight: "315", age: 34, college: "Notre Dame", experience: 11, injuryStatus: "Active", stats: { gamesStarted: 15, sacks: 0 } },
  { id: pid("DAL", "RG", 2), name: "Brock Hoffman", team: "DAL", position: "RG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 61, height: "6-4", weight: "310", age: 26, college: "Virginia Tech", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("DAL", "RG", 3), name: "T.J. Bass", team: "DAL", position: "RG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 64, height: "6-5", weight: "318", age: 24, college: "Oregon", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("DAL", "RT", 1), name: "Terence Steele", team: "DAL", position: "RT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 78, height: "6-6", weight: "320", age: 27, college: "Texas Tech", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 3 } },
  { id: pid("DAL", "RT", 2), name: "Josh Ball", team: "DAL", position: "RT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 75, height: "6-7", weight: "330", age: 25, college: "Marshall", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("DAL", "RT", 3), name: "Chuma Edoga", team: "DAL", position: "RT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 70, height: "6-3", weight: "308", age: 27, college: "USC", experience: 6, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  // --- Defense ---
  { id: pid("DAL", "DE1", 1), name: "Micah Parsons", team: "DAL", position: "DE1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 11, height: "6-3", weight: "245", age: 25, college: "Penn State", experience: 4, injuryStatus: "Active", stats: { tackles: 65, sacks: 14.0, tfl: 18, ff: 3 } },
  { id: pid("DAL", "DE1", 2), name: "Sam Williams", team: "DAL", position: "DE1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 54, height: "6-4", weight: "262", age: 25, college: "Ole Miss", experience: 3, injuryStatus: "Active", stats: { tackles: 20, sacks: 3.0, tfl: 4, ff: 0 } },
  { id: pid("DAL", "DE1", 3), name: "Marshawn Kneeland", team: "DAL", position: "DE1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 96, height: "6-4", weight: "265", age: 22, college: "Western Michigan", experience: 1, injuryStatus: "Active", stats: { tackles: 10, sacks: 1.5, tfl: 2, ff: 0 } },
  { id: pid("DAL", "DE2", 1), name: "DeMarcus Lawrence", team: "DAL", position: "DE2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 90, height: "6-3", weight: "254", age: 32, college: "Boise State", experience: 11, injuryStatus: "Doubtful", injuryDetail: "Foot — did not practice all week", stats: { tackles: 30, sacks: 5.0, tfl: 7, ff: 2 } },
  { id: pid("DAL", "DE2", 2), name: "Chauncey Golston", team: "DAL", position: "DE2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 59, height: "6-5", weight: "270", age: 26, college: "Iowa", experience: 4, injuryStatus: "Active", stats: { tackles: 18, sacks: 2.0, tfl: 3, ff: 0 } },
  { id: pid("DAL", "DE2", 3), name: "Marshawn Kneeland", team: "DAL", position: "DE2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 96, height: "6-4", weight: "265", age: 22, college: "Western Michigan", experience: 1, injuryStatus: "Active", stats: { tackles: 10, sacks: 1.5, tfl: 2, ff: 0 } },
  { id: pid("DAL", "DT1", 1), name: "Osa Odighizuwa", team: "DAL", position: "DT1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 97, height: "6-2", weight: "280", age: 26, college: "UCLA", experience: 4, injuryStatus: "Active", stats: { tackles: 42, sacks: 4.0, tfl: 8, ff: 1 } },
  { id: pid("DAL", "DT1", 2), name: "Johnathan Hankins", team: "DAL", position: "DT1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 95, height: "6-3", weight: "340", age: 32, college: "Ohio State", experience: 12, injuryStatus: "Active", stats: { tackles: 22, sacks: 1.0, tfl: 3, ff: 0 } },
  { id: pid("DAL", "DT1", 3), name: "Albert Huggins", team: "DAL", position: "DT1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 67, height: "6-3", weight: "305", age: 28, college: "Clemson", experience: 4, injuryStatus: "Active", stats: { tackles: 8, sacks: 0, tfl: 1, ff: 0 } },
  { id: pid("DAL", "DT2", 1), name: "Johnathan Hankins", team: "DAL", position: "DT2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 95, height: "6-3", weight: "340", age: 32, college: "Ohio State", experience: 12, injuryStatus: "Active", stats: { tackles: 22, sacks: 1.0, tfl: 3, ff: 0 } },
  { id: pid("DAL", "DT2", 2), name: "Neville Gallimore", team: "DAL", position: "DT2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 96, height: "6-2", weight: "304", age: 27, college: "Oklahoma", experience: 5, injuryStatus: "Active", stats: { tackles: 15, sacks: 0.5, tfl: 2, ff: 0 } },
  { id: pid("DAL", "DT2", 3), name: "Albert Huggins", team: "DAL", position: "DT2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 67, height: "6-3", weight: "305", age: 28, college: "Clemson", experience: 4, injuryStatus: "Active", stats: { tackles: 8, sacks: 0, tfl: 1, ff: 0 } },
  { id: pid("DAL", "LB1", 1), name: "DeMarvion Overshown", team: "DAL", position: "LB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 54, height: "6-3", weight: "228", age: 24, college: "Texas", experience: 2, injuryStatus: "Active", stats: { tackles: 80, sacks: 2.5, tfl: 6, int: 1 } },
  { id: pid("DAL", "LB1", 2), name: "Damone Clark", team: "DAL", position: "LB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 33, height: "6-2", weight: "239", age: 25, college: "LSU", experience: 3, injuryStatus: "Active", stats: { tackles: 35, sacks: 0.5, tfl: 2, int: 0 } },
  { id: pid("DAL", "LB1", 3), name: "Markquese Bell", team: "DAL", position: "LB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 36, height: "6-2", weight: "212", age: 25, college: "Florida A&M", experience: 3, injuryStatus: "Active", stats: { tackles: 12, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("DAL", "LB2", 1), name: "Leighton Vander Esch", team: "DAL", position: "LB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 55, height: "6-4", weight: "256", age: 28, college: "Boise State", experience: 7, injuryStatus: "Active", stats: { tackles: 70, sacks: 1.0, tfl: 4, int: 0 } },
  { id: pid("DAL", "LB2", 2), name: "Damone Clark", team: "DAL", position: "LB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 33, height: "6-2", weight: "239", age: 25, college: "LSU", experience: 3, injuryStatus: "Active", stats: { tackles: 35, sacks: 0.5, tfl: 2, int: 0 } },
  { id: pid("DAL", "LB2", 3), name: "Markquese Bell", team: "DAL", position: "LB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 36, height: "6-2", weight: "212", age: 25, college: "Florida A&M", experience: 3, injuryStatus: "Active", stats: { tackles: 12, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("DAL", "LB3", 1), name: "Damone Clark", team: "DAL", position: "LB3", positionGroup: "defense", depthOrder: 1, jerseyNumber: 33, height: "6-2", weight: "239", age: 25, college: "LSU", experience: 3, injuryStatus: "Active", stats: { tackles: 35, sacks: 0.5, tfl: 2, int: 0 } },
  { id: pid("DAL", "LB3", 2), name: "Markquese Bell", team: "DAL", position: "LB3", positionGroup: "defense", depthOrder: 2, jerseyNumber: 36, height: "6-2", weight: "212", age: 25, college: "Florida A&M", experience: 3, injuryStatus: "Active", stats: { tackles: 12, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("DAL", "LB3", 3), name: "Tyrus Wheat", team: "DAL", position: "LB3", positionGroup: "defense", depthOrder: 3, jerseyNumber: 42, height: "6-3", weight: "248", age: 24, college: "Mississippi State", experience: 2, injuryStatus: "Active", stats: { tackles: 5, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("DAL", "CB1", 1), name: "Trevon Diggs", team: "DAL", position: "CB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 7, height: "6-1", weight: "195", age: 26, college: "Alabama", experience: 5, injuryStatus: "Active", stats: { tackles: 40, int: 4, pd: 12, ff: 0 } },
  { id: pid("DAL", "CB1", 2), name: "DaRon Bland", team: "DAL", position: "CB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 26, height: "6-0", weight: "197", age: 25, college: "Fresno State", experience: 3, injuryStatus: "Active", stats: { tackles: 30, int: 3, pd: 8, ff: 0 } },
  { id: pid("DAL", "CB1", 3), name: "Andrew Booth Jr.", team: "DAL", position: "CB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 24, height: "5-11", weight: "194", age: 24, college: "Clemson", experience: 3, injuryStatus: "Active", stats: { tackles: 10, int: 0, pd: 2, ff: 0 } },
  { id: pid("DAL", "CB2", 1), name: "DaRon Bland", team: "DAL", position: "CB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 26, height: "6-0", weight: "197", age: 25, college: "Fresno State", experience: 3, injuryStatus: "Active", stats: { tackles: 30, int: 3, pd: 8, ff: 0 } },
  { id: pid("DAL", "CB2", 2), name: "Jourdan Lewis", team: "DAL", position: "CB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 2, height: "5-10", weight: "188", age: 29, college: "Michigan", experience: 8, injuryStatus: "Active", stats: { tackles: 25, int: 1, pd: 5, ff: 0 } },
  { id: pid("DAL", "CB2", 3), name: "Andrew Booth Jr.", team: "DAL", position: "CB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 24, height: "5-11", weight: "194", age: 24, college: "Clemson", experience: 3, injuryStatus: "Active", stats: { tackles: 10, int: 0, pd: 2, ff: 0 } },
  { id: pid("DAL", "SS", 1), name: "Jayron Kearse", team: "DAL", position: "SS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 27, height: "6-4", weight: "215", age: 30, college: "Clemson", experience: 9, injuryStatus: "Active", stats: { tackles: 68, int: 1, pd: 6, ff: 1 } },
  { id: pid("DAL", "SS", 2), name: "Donovan Wilson", team: "DAL", position: "SS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 6, height: "6-1", weight: "213", age: 29, college: "Texas A&M", experience: 6, injuryStatus: "Active", stats: { tackles: 30, int: 0, pd: 3, ff: 0 } },
  { id: pid("DAL", "SS", 3), name: "Markquese Bell", team: "DAL", position: "SS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 36, height: "6-2", weight: "212", age: 25, college: "Florida A&M", experience: 3, injuryStatus: "Active", stats: { tackles: 12, int: 0, pd: 1, ff: 0 } },
  { id: pid("DAL", "FS", 1), name: "Donovan Wilson", team: "DAL", position: "FS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 6, height: "6-1", weight: "213", age: 29, college: "Texas A&M", experience: 6, injuryStatus: "Active", stats: { tackles: 55, int: 2, pd: 5, ff: 1 } },
  { id: pid("DAL", "FS", 2), name: "Jayron Kearse", team: "DAL", position: "FS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 27, height: "6-4", weight: "215", age: 30, college: "Clemson", experience: 9, injuryStatus: "Active", stats: { tackles: 40, int: 1, pd: 4, ff: 0 } },
  { id: pid("DAL", "FS", 3), name: "Markquese Bell", team: "DAL", position: "FS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 36, height: "6-2", weight: "212", age: 25, college: "Florida A&M", experience: 3, injuryStatus: "Active", stats: { tackles: 12, int: 0, pd: 1, ff: 0 } },
  // --- Special Teams ---
  { id: pid("DAL", "K", 1), name: "Brandon Aubrey", team: "DAL", position: "K", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 17, height: "6-1", weight: "200", age: 29, college: "Notre Dame", experience: 2, injuryStatus: "Active", stats: { fgMade: 36, fgAtt: 38, xpMade: 40, longFG: 65 } },
  { id: pid("DAL", "K", 2), name: "Tristan Vizcaino", team: "DAL", position: "K", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 19, height: "6-1", weight: "195", age: 27, college: "Washington", experience: 3, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("DAL", "K", 3), name: "Trey Lance", team: "DAL", position: "K", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 15, height: "6-4", weight: "226", age: 24, college: "North Dakota State", experience: 4, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("DAL", "P", 1), name: "Bryan Anger", team: "DAL", position: "P", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 5, height: "6-3", weight: "210", age: 35, college: "California", experience: 13, injuryStatus: "Active", stats: { punts: 52, puntAvg: 47.1, inside20: 25, longPunt: 65 } },
  { id: pid("DAL", "P", 2), name: "Tristan Vizcaino", team: "DAL", position: "P", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 19, height: "6-1", weight: "195", age: 27, college: "Washington", experience: 3, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("DAL", "P", 3), name: "Cooper Rush", team: "DAL", position: "P", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 10, height: "6-3", weight: "225", age: 31, college: "Central Michigan", experience: 7, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("DAL", "KR", 1), name: "KaVontae Turpin", team: "DAL", position: "KR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 2, height: "5-9", weight: "153", age: 28, college: "TCU", experience: 3, injuryStatus: "Active", stats: { krYds: 520, krAvg: 26.0, krTD: 1, krLong: 98 } },
  { id: pid("DAL", "KR", 2), name: "Deuce Vaughn", team: "DAL", position: "KR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 25, height: "5-6", weight: "179", age: 23, college: "Kansas State", experience: 2, injuryStatus: "Active", stats: { krYds: 80, krAvg: 20.0, krTD: 0, krLong: 28 } },
  { id: pid("DAL", "KR", 3), name: "Ryan Flournoy", team: "DAL", position: "KR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 15, height: "6-1", weight: "200", age: 24, college: "SE Missouri State", experience: 1, injuryStatus: "Active", stats: { krYds: 0, krAvg: 0, krTD: 0, krLong: 0 } },
  { id: pid("DAL", "PR", 1), name: "KaVontae Turpin", team: "DAL", position: "PR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 2, height: "5-9", weight: "153", age: 28, college: "TCU", experience: 3, injuryStatus: "Active", stats: { prYds: 200, prAvg: 10.5, prTD: 1, prLong: 60 } },
  { id: pid("DAL", "PR", 2), name: "Jalen Tolbert", team: "DAL", position: "PR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 1, height: "6-1", weight: "194", age: 25, college: "South Alabama", experience: 3, injuryStatus: "Active", stats: { prYds: 20, prAvg: 5.0, prTD: 0, prLong: 10 } },
  { id: pid("DAL", "PR", 3), name: "Deuce Vaughn", team: "DAL", position: "PR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 25, height: "5-6", weight: "179", age: 23, college: "Kansas State", experience: 2, injuryStatus: "Active", stats: { prYds: 0, prAvg: 0, prTD: 0, prLong: 0 } },
  { id: pid("DAL", "LS", 1), name: "Trent Sieg", team: "DAL", position: "LS", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 47, height: "6-1", weight: "240", age: 29, college: "Colorado State", experience: 6, injuryStatus: "Active", stats: { gamesPlayed: 17, badSnaps: 0 } },
  { id: pid("DAL", "LS", 2), name: "Jake McQuaide", team: "DAL", position: "LS", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 44, height: "6-2", weight: "240", age: 35, college: "Ohio State", experience: 13, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },
  { id: pid("DAL", "LS", 3), name: "Brock Hoffman", team: "DAL", position: "LS", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 61, height: "6-4", weight: "310", age: 26, college: "Virginia Tech", experience: 3, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },

  // =============================================
  // SAN FRANCISCO 49ERS (Showcase — full 3-deep)
  // =============================================
  // --- Offense ---
  { id: pid("SF", "QB", 1), name: "Brock Purdy", team: "SF", position: "QB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 13, height: "6-1", weight: "220", age: 24, college: "Iowa State", experience: 3, injuryStatus: "Active", stats: { passYds: 4280, passTD: 31, int: 11, qbr: 97.5 } },
  { id: pid("SF", "QB", 2), name: "Joshua Dobbs", team: "SF", position: "QB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 5, height: "6-3", weight: "230", age: 29, college: "Tennessee", experience: 7, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("SF", "QB", 3), name: "Brandon Allen", team: "SF", position: "QB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 7, height: "6-2", weight: "210", age: 32, college: "Arkansas", experience: 7, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("SF", "RB", 1), name: "Christian McCaffrey", team: "SF", position: "RB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 23, height: "5-11", weight: "205", age: 28, college: "Stanford", experience: 8, injuryStatus: "IR", injuryDetail: "Knee — placed on IR", stats: { rushYds: 280, rushTD: 2, ypc: 4.8, rec: 15 } },
  { id: pid("SF", "RB", 2), name: "Jordan Mason", team: "SF", position: "RB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 24, height: "5-11", weight: "203", age: 25, college: "Georgia Tech", experience: 3, injuryStatus: "Active", stats: { rushYds: 820, rushTD: 6, ypc: 5.2, rec: 18 } },
  { id: pid("SF", "RB", 3), name: "Elijah Mitchell", team: "SF", position: "RB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 25, height: "5-10", weight: "200", age: 26, college: "Louisiana", experience: 4, injuryStatus: "Active", stats: { rushYds: 250, rushTD: 2, ypc: 4.3, rec: 10 } },
  { id: pid("SF", "WR1", 1), name: "Deebo Samuel", team: "SF", position: "WR1", positionGroup: "offense", depthOrder: 1, jerseyNumber: 19, height: "5-11", weight: "215", age: 28, college: "South Carolina", experience: 6, injuryStatus: "Questionable", injuryDetail: "Shoulder — limited practice", stats: { recYds: 890, recTD: 6, rec: 60, targets: 90 } },
  { id: pid("SF", "WR1", 2), name: "Jauan Jennings", team: "SF", position: "WR1", positionGroup: "offense", depthOrder: 2, jerseyNumber: 15, height: "6-3", weight: "215", age: 27, college: "Tennessee", experience: 5, injuryStatus: "Active", stats: { recYds: 420, recTD: 3, rec: 35, targets: 50 } },
  { id: pid("SF", "WR1", 3), name: "Danny Gray", team: "SF", position: "WR1", positionGroup: "offense", depthOrder: 3, jerseyNumber: 6, height: "6-0", weight: "186", age: 25, college: "SMU", experience: 3, injuryStatus: "Active", stats: { recYds: 120, recTD: 1, rec: 10, targets: 18 } },
  { id: pid("SF", "WR2", 1), name: "Brandon Aiyuk", team: "SF", position: "WR2", positionGroup: "offense", depthOrder: 1, jerseyNumber: 11, height: "6-0", weight: "200", age: 26, college: "Arizona State", experience: 5, injuryStatus: "Active", stats: { recYds: 1050, recTD: 7, rec: 68, targets: 100 } },
  { id: pid("SF", "WR2", 2), name: "Jauan Jennings", team: "SF", position: "WR2", positionGroup: "offense", depthOrder: 2, jerseyNumber: 15, height: "6-3", weight: "215", age: 27, college: "Tennessee", experience: 5, injuryStatus: "Active", stats: { recYds: 420, recTD: 3, rec: 35, targets: 50 } },
  { id: pid("SF", "WR2", 3), name: "Chris Conley", team: "SF", position: "WR2", positionGroup: "offense", depthOrder: 3, jerseyNumber: 85, height: "6-2", weight: "205", age: 32, college: "Georgia", experience: 10, injuryStatus: "Active", stats: { recYds: 40, recTD: 0, rec: 4, targets: 8 } },
  { id: pid("SF", "WR3", 1), name: "Jauan Jennings", team: "SF", position: "WR3", positionGroup: "offense", depthOrder: 1, jerseyNumber: 15, height: "6-3", weight: "215", age: 27, college: "Tennessee", experience: 5, injuryStatus: "Active", stats: { recYds: 420, recTD: 3, rec: 35, targets: 50 } },
  { id: pid("SF", "WR3", 2), name: "Danny Gray", team: "SF", position: "WR3", positionGroup: "offense", depthOrder: 2, jerseyNumber: 6, height: "6-0", weight: "186", age: 25, college: "SMU", experience: 3, injuryStatus: "Active", stats: { recYds: 120, recTD: 1, rec: 10, targets: 18 } },
  { id: pid("SF", "WR3", 3), name: "Ronnie Bell", team: "SF", position: "WR3", positionGroup: "offense", depthOrder: 3, jerseyNumber: 10, height: "6-0", weight: "192", age: 25, college: "Michigan", experience: 2, injuryStatus: "Active", stats: { recYds: 30, recTD: 0, rec: 3, targets: 6 } },
  { id: pid("SF", "TE", 1), name: "George Kittle", team: "SF", position: "TE", positionGroup: "offense", depthOrder: 1, jerseyNumber: 85, height: "6-4", weight: "250", age: 31, college: "Iowa", experience: 8, injuryStatus: "Active", stats: { recYds: 780, recTD: 6, rec: 58, targets: 78 } },
  { id: pid("SF", "TE", 2), name: "Cameron Latu", team: "SF", position: "TE", positionGroup: "offense", depthOrder: 2, jerseyNumber: 89, height: "6-5", weight: "242", age: 25, college: "Alabama", experience: 2, injuryStatus: "Active", stats: { recYds: 120, recTD: 1, rec: 12, targets: 18 } },
  { id: pid("SF", "TE", 3), name: "Eric Saubert", team: "SF", position: "TE", positionGroup: "offense", depthOrder: 3, jerseyNumber: 80, height: "6-5", weight: "252", age: 30, college: "Drake", experience: 7, injuryStatus: "Active", stats: { recYds: 40, recTD: 0, rec: 5, targets: 8 } },
  { id: pid("SF", "LT", 1), name: "Trent Williams", team: "SF", position: "LT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 71, height: "6-5", weight: "320", age: 36, college: "Oklahoma", experience: 15, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 1 } },
  { id: pid("SF", "LT", 2), name: "Jaylon Moore", team: "SF", position: "LT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 60, height: "6-4", weight: "311", age: 26, college: "Western Michigan", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("SF", "LT", 3), name: "Colton McKivitz", team: "SF", position: "LT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 68, height: "6-6", weight: "306", age: 27, college: "West Virginia", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("SF", "LG", 1), name: "Aaron Banks", team: "SF", position: "LG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 65, height: "6-5", weight: "325", age: 26, college: "Notre Dame", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 17, sacks: 1 } },
  { id: pid("SF", "LG", 2), name: "Ben Bartch", team: "SF", position: "LG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 63, height: "6-6", weight: "305", age: 26, college: "St. John's", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("SF", "LG", 3), name: "Nick Zakelj", team: "SF", position: "LG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 67, height: "6-6", weight: "316", age: 25, college: "Fordham", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("SF", "C", 1), name: "Jake Brendel", team: "SF", position: "C", positionGroup: "offense", depthOrder: 1, jerseyNumber: 64, height: "6-4", weight: "305", age: 31, college: "UCLA", experience: 7, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 0 } },
  { id: pid("SF", "C", 2), name: "Ben Bartch", team: "SF", position: "C", positionGroup: "offense", depthOrder: 2, jerseyNumber: 63, height: "6-6", weight: "305", age: 26, college: "St. John's", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("SF", "C", 3), name: "Nick Zakelj", team: "SF", position: "C", positionGroup: "offense", depthOrder: 3, jerseyNumber: 67, height: "6-6", weight: "316", age: 25, college: "Fordham", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("SF", "RG", 1), name: "Dominick Puni", team: "SF", position: "RG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 76, height: "6-5", weight: "313", age: 24, college: "Kansas", experience: 1, injuryStatus: "Active", stats: { gamesStarted: 15, sacks: 2 } },
  { id: pid("SF", "RG", 2), name: "Ben Bartch", team: "SF", position: "RG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 63, height: "6-6", weight: "305", age: 26, college: "St. John's", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("SF", "RG", 3), name: "Nick Zakelj", team: "SF", position: "RG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 67, height: "6-6", weight: "316", age: 25, college: "Fordham", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("SF", "RT", 1), name: "Colton McKivitz", team: "SF", position: "RT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 68, height: "6-6", weight: "306", age: 27, college: "West Virginia", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 15, sacks: 3 } },
  { id: pid("SF", "RT", 2), name: "Jaylon Moore", team: "SF", position: "RT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 60, height: "6-4", weight: "311", age: 26, college: "Western Michigan", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("SF", "RT", 3), name: "Matt Pryor", team: "SF", position: "RT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 69, height: "6-7", weight: "332", age: 29, college: "TCU", experience: 7, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  // --- Defense ---
  { id: pid("SF", "DE1", 1), name: "Nick Bosa", team: "SF", position: "DE1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 97, height: "6-4", weight: "266", age: 27, college: "Ohio State", experience: 6, injuryStatus: "Active", stats: { tackles: 50, sacks: 12.5, tfl: 15, ff: 3 } },
  { id: pid("SF", "DE1", 2), name: "Yetur Gross-Matos", team: "SF", position: "DE1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 99, height: "6-5", weight: "264", age: 27, college: "Penn State", experience: 5, injuryStatus: "Active", stats: { tackles: 22, sacks: 3.0, tfl: 4, ff: 0 } },
  { id: pid("SF", "DE1", 3), name: "Robert Beal", team: "SF", position: "DE1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 96, height: "6-4", weight: "250", age: 25, college: "Georgia", experience: 3, injuryStatus: "Active", stats: { tackles: 8, sacks: 1.0, tfl: 2, ff: 0 } },
  { id: pid("SF", "DE2", 1), name: "Leonard Floyd", team: "SF", position: "DE2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 56, height: "6-5", weight: "244", age: 32, college: "Georgia", experience: 9, injuryStatus: "Active", stats: { tackles: 38, sacks: 8.0, tfl: 9, ff: 2 } },
  { id: pid("SF", "DE2", 2), name: "Yetur Gross-Matos", team: "SF", position: "DE2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 99, height: "6-5", weight: "264", age: 27, college: "Penn State", experience: 5, injuryStatus: "Active", stats: { tackles: 22, sacks: 3.0, tfl: 4, ff: 0 } },
  { id: pid("SF", "DE2", 3), name: "Robert Beal", team: "SF", position: "DE2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 96, height: "6-4", weight: "250", age: 25, college: "Georgia", experience: 3, injuryStatus: "Active", stats: { tackles: 8, sacks: 1.0, tfl: 2, ff: 0 } },
  { id: pid("SF", "DT1", 1), name: "Javon Hargrave", team: "SF", position: "DT1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 98, height: "6-2", weight: "305", age: 31, college: "South Carolina State", experience: 9, injuryStatus: "Active", stats: { tackles: 40, sacks: 7.0, tfl: 10, ff: 1 } },
  { id: pid("SF", "DT1", 2), name: "Kevin Givens", team: "SF", position: "DT1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 90, height: "6-1", weight: "285", age: 27, college: "Penn State", experience: 6, injuryStatus: "Active", stats: { tackles: 20, sacks: 2.0, tfl: 3, ff: 0 } },
  { id: pid("SF", "DT1", 3), name: "Kalia Davis", team: "SF", position: "DT1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 94, height: "6-1", weight: "305", age: 25, college: "UCF", experience: 2, injuryStatus: "Active", stats: { tackles: 8, sacks: 0.5, tfl: 1, ff: 0 } },
  { id: pid("SF", "DT2", 1), name: "Kevin Givens", team: "SF", position: "DT2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 90, height: "6-1", weight: "285", age: 27, college: "Penn State", experience: 6, injuryStatus: "Active", stats: { tackles: 20, sacks: 2.0, tfl: 3, ff: 0 } },
  { id: pid("SF", "DT2", 2), name: "Kalia Davis", team: "SF", position: "DT2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 94, height: "6-1", weight: "305", age: 25, college: "UCF", experience: 2, injuryStatus: "Active", stats: { tackles: 8, sacks: 0.5, tfl: 1, ff: 0 } },
  { id: pid("SF", "DT2", 3), name: "T.Y. McGill", team: "SF", position: "DT2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 93, height: "6-0", weight: "285", age: 31, college: "NC State", experience: 8, injuryStatus: "Active", stats: { tackles: 5, sacks: 0, tfl: 0, ff: 0 } },
  { id: pid("SF", "LB1", 1), name: "Fred Warner", team: "SF", position: "LB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 54, height: "6-3", weight: "230", age: 28, college: "BYU", experience: 7, injuryStatus: "Active", stats: { tackles: 130, sacks: 4.0, tfl: 10, int: 2 } },
  { id: pid("SF", "LB1", 2), name: "Dre Greenlaw", team: "SF", position: "LB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 57, height: "6-0", weight: "230", age: 27, college: "Arkansas", experience: 6, injuryStatus: "Active", stats: { tackles: 50, sacks: 1.0, tfl: 3, int: 1 } },
  { id: pid("SF", "LB1", 3), name: "Dee Winters", team: "SF", position: "LB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 44, height: "6-0", weight: "228", age: 24, college: "TCU", experience: 2, injuryStatus: "Active", stats: { tackles: 15, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("SF", "LB2", 1), name: "Dre Greenlaw", team: "SF", position: "LB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 57, height: "6-0", weight: "230", age: 27, college: "Arkansas", experience: 6, injuryStatus: "Active", stats: { tackles: 50, sacks: 1.0, tfl: 3, int: 1 } },
  { id: pid("SF", "LB2", 2), name: "Dee Winters", team: "SF", position: "LB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 44, height: "6-0", weight: "228", age: 24, college: "TCU", experience: 2, injuryStatus: "Active", stats: { tackles: 15, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("SF", "LB2", 3), name: "Curtis Robinson", team: "SF", position: "LB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 46, height: "6-2", weight: "230", age: 27, college: "Stanford", experience: 3, injuryStatus: "Active", stats: { tackles: 5, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("SF", "LB3", 1), name: "Dee Winters", team: "SF", position: "LB3", positionGroup: "defense", depthOrder: 1, jerseyNumber: 44, height: "6-0", weight: "228", age: 24, college: "TCU", experience: 2, injuryStatus: "Active", stats: { tackles: 15, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("SF", "LB3", 2), name: "Curtis Robinson", team: "SF", position: "LB3", positionGroup: "defense", depthOrder: 2, jerseyNumber: 46, height: "6-2", weight: "230", age: 27, college: "Stanford", experience: 3, injuryStatus: "Active", stats: { tackles: 5, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("SF", "LB3", 3), name: "Jalen Graham", team: "SF", position: "LB3", positionGroup: "defense", depthOrder: 3, jerseyNumber: 49, height: "6-1", weight: "225", age: 24, college: "Purdue", experience: 2, injuryStatus: "Active", stats: { tackles: 3, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("SF", "CB1", 1), name: "Charvarius Ward", team: "SF", position: "CB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 7, height: "6-1", weight: "196", age: 28, college: "Middle Tennessee", experience: 7, injuryStatus: "Active", stats: { tackles: 50, int: 4, pd: 15, ff: 0 } },
  { id: pid("SF", "CB1", 2), name: "Deommodore Lenoir", team: "SF", position: "CB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 38, height: "5-11", weight: "195", age: 25, college: "Oregon", experience: 4, injuryStatus: "Active", stats: { tackles: 30, int: 1, pd: 6, ff: 0 } },
  { id: pid("SF", "CB1", 3), name: "Ambry Thomas", team: "SF", position: "CB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 20, height: "6-0", weight: "185", age: 25, college: "Michigan", experience: 4, injuryStatus: "Active", stats: { tackles: 10, int: 0, pd: 2, ff: 0 } },
  { id: pid("SF", "CB2", 1), name: "Deommodore Lenoir", team: "SF", position: "CB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 38, height: "5-11", weight: "195", age: 25, college: "Oregon", experience: 4, injuryStatus: "Active", stats: { tackles: 30, int: 1, pd: 6, ff: 0 } },
  { id: pid("SF", "CB2", 2), name: "Ambry Thomas", team: "SF", position: "CB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 20, height: "6-0", weight: "185", age: 25, college: "Michigan", experience: 4, injuryStatus: "Active", stats: { tackles: 10, int: 0, pd: 2, ff: 0 } },
  { id: pid("SF", "CB2", 3), name: "Darrell Luter Jr.", team: "SF", position: "CB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 28, height: "5-11", weight: "190", age: 24, college: "South Alabama", experience: 2, injuryStatus: "Active", stats: { tackles: 5, int: 0, pd: 1, ff: 0 } },
  { id: pid("SF", "SS", 1), name: "Talanoa Hufanga", team: "SF", position: "SS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 29, height: "6-1", weight: "200", age: 25, college: "USC", experience: 4, injuryStatus: "Active", stats: { tackles: 65, int: 2, pd: 7, ff: 1 } },
  { id: pid("SF", "SS", 2), name: "George Odum", team: "SF", position: "SS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 30, height: "6-1", weight: "200", age: 30, college: "Central Arkansas", experience: 7, injuryStatus: "Active", stats: { tackles: 20, int: 0, pd: 2, ff: 0 } },
  { id: pid("SF", "SS", 3), name: "Malik Mustapha", team: "SF", position: "SS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 6, height: "6-0", weight: "210", age: 23, college: "Wake Forest", experience: 1, injuryStatus: "Active", stats: { tackles: 8, int: 0, pd: 1, ff: 0 } },
  { id: pid("SF", "FS", 1), name: "Ji'Aire Brown", team: "SF", position: "FS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 25, height: "6-0", weight: "195", age: 23, college: "Penn State", experience: 1, injuryStatus: "Active", stats: { tackles: 45, int: 2, pd: 5, ff: 0 } },
  { id: pid("SF", "FS", 2), name: "George Odum", team: "SF", position: "FS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 30, height: "6-1", weight: "200", age: 30, college: "Central Arkansas", experience: 7, injuryStatus: "Active", stats: { tackles: 20, int: 0, pd: 2, ff: 0 } },
  { id: pid("SF", "FS", 3), name: "Malik Mustapha", team: "SF", position: "FS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 6, height: "6-0", weight: "210", age: 23, college: "Wake Forest", experience: 1, injuryStatus: "Active", stats: { tackles: 8, int: 0, pd: 1, ff: 0 } },
  // --- Special Teams ---
  { id: pid("SF", "K", 1), name: "Jake Moody", team: "SF", position: "K", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 4, height: "6-0", weight: "208", age: 25, college: "Michigan", experience: 2, injuryStatus: "Active", stats: { fgMade: 25, fgAtt: 30, xpMade: 40, longFG: 55 } },
  { id: pid("SF", "K", 2), name: "Zane Gonzalez", team: "SF", position: "K", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 5, height: "6-0", weight: "190", age: 29, college: "Arizona State", experience: 7, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("SF", "K", 3), name: "Brandon Allen", team: "SF", position: "K", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 7, height: "6-2", weight: "210", age: 32, college: "Arkansas", experience: 7, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("SF", "P", 1), name: "Mitch Wishnowsky", team: "SF", position: "P", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 18, height: "6-2", weight: "220", age: 32, college: "Utah", experience: 6, injuryStatus: "Active", stats: { punts: 48, puntAvg: 46.5, inside20: 20, longPunt: 60 } },
  { id: pid("SF", "P", 2), name: "Jake Moody", team: "SF", position: "P", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 4, height: "6-0", weight: "208", age: 25, college: "Michigan", experience: 2, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("SF", "P", 3), name: "Brandon Allen", team: "SF", position: "P", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 7, height: "6-2", weight: "210", age: 32, college: "Arkansas", experience: 7, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("SF", "KR", 1), name: "Danny Gray", team: "SF", position: "KR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 6, height: "6-0", weight: "186", age: 25, college: "SMU", experience: 3, injuryStatus: "Active", stats: { krYds: 350, krAvg: 23.3, krTD: 0, krLong: 42 } },
  { id: pid("SF", "KR", 2), name: "Ronnie Bell", team: "SF", position: "KR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 10, height: "6-0", weight: "192", age: 25, college: "Michigan", experience: 2, injuryStatus: "Active", stats: { krYds: 60, krAvg: 20.0, krTD: 0, krLong: 25 } },
  { id: pid("SF", "KR", 3), name: "Elijah Mitchell", team: "SF", position: "KR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 25, height: "5-10", weight: "200", age: 26, college: "Louisiana", experience: 4, injuryStatus: "Active", stats: { krYds: 0, krAvg: 0, krTD: 0, krLong: 0 } },
  { id: pid("SF", "PR", 1), name: "Danny Gray", team: "SF", position: "PR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 6, height: "6-0", weight: "186", age: 25, college: "SMU", experience: 3, injuryStatus: "Active", stats: { prYds: 100, prAvg: 8.0, prTD: 0, prLong: 18 } },
  { id: pid("SF", "PR", 2), name: "Ronnie Bell", team: "SF", position: "PR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 10, height: "6-0", weight: "192", age: 25, college: "Michigan", experience: 2, injuryStatus: "Active", stats: { prYds: 20, prAvg: 5.0, prTD: 0, prLong: 10 } },
  { id: pid("SF", "PR", 3), name: "Jauan Jennings", team: "SF", position: "PR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 15, height: "6-3", weight: "215", age: 27, college: "Tennessee", experience: 5, injuryStatus: "Active", stats: { prYds: 0, prAvg: 0, prTD: 0, prLong: 0 } },
  { id: pid("SF", "LS", 1), name: "Taybor Pepper", team: "SF", position: "LS", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 46, height: "6-4", weight: "245", age: 30, college: "Michigan State", experience: 6, injuryStatus: "Active", stats: { gamesPlayed: 17, badSnaps: 0 } },
  { id: pid("SF", "LS", 2), name: "Jake Brendel", team: "SF", position: "LS", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 64, height: "6-4", weight: "305", age: 31, college: "UCLA", experience: 7, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },
  { id: pid("SF", "LS", 3), name: "Ben Bartch", team: "SF", position: "LS", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 63, height: "6-6", weight: "305", age: 26, college: "St. John's", experience: 4, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },

  // =============================================
  // BUFFALO BILLS (Showcase — full 3-deep)
  // =============================================
  // --- Offense ---
  { id: pid("BUF", "QB", 1), name: "Josh Allen", team: "BUF", position: "QB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 17, height: "6-5", weight: "237", age: 28, college: "Wyoming", experience: 7, injuryStatus: "Active", stats: { passYds: 4306, passTD: 35, int: 10, qbr: 96.8 } },
  { id: pid("BUF", "QB", 2), name: "Mitchell Trubisky", team: "BUF", position: "QB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 10, height: "6-2", weight: "220", age: 30, college: "North Carolina", experience: 8, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("BUF", "QB", 3), name: "Shane Buechele", team: "BUF", position: "QB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 7, height: "6-1", weight: "210", age: 26, college: "SMU", experience: 3, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("BUF", "RB", 1), name: "James Cook", team: "BUF", position: "RB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 4, height: "5-11", weight: "199", age: 25, college: "Georgia", experience: 3, injuryStatus: "Active", stats: { rushYds: 1122, rushTD: 9, ypc: 5.0, rec: 40 } },
  { id: pid("BUF", "RB", 2), name: "Ty Johnson", team: "BUF", position: "RB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 25, height: "5-10", weight: "210", age: 27, college: "Maryland", experience: 6, injuryStatus: "Active", stats: { rushYds: 180, rushTD: 1, ypc: 4.0, rec: 15 } },
  { id: pid("BUF", "RB", 3), name: "Latavius Murray", team: "BUF", position: "RB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 28, height: "6-3", weight: "230", age: 34, college: "UCF", experience: 12, injuryStatus: "Active", stats: { rushYds: 90, rushTD: 1, ypc: 3.6, rec: 5 } },
  { id: pid("BUF", "WR1", 1), name: "Stefon Diggs", team: "BUF", position: "WR1", positionGroup: "offense", depthOrder: 1, jerseyNumber: 14, height: "6-0", weight: "191", age: 31, college: "Maryland", experience: 10, injuryStatus: "Active", stats: { recYds: 1100, recTD: 8, rec: 88, targets: 130 } },
  { id: pid("BUF", "WR1", 2), name: "Khalil Shakir", team: "BUF", position: "WR1", positionGroup: "offense", depthOrder: 2, jerseyNumber: 10, height: "6-0", weight: "190", age: 25, college: "Boise State", experience: 3, injuryStatus: "Active", stats: { recYds: 520, recTD: 4, rec: 45, targets: 60 } },
  { id: pid("BUF", "WR1", 3), name: "Trent Sherfield", team: "BUF", position: "WR1", positionGroup: "offense", depthOrder: 3, jerseyNumber: 16, height: "6-1", weight: "219", age: 28, college: "Vanderbilt", experience: 6, injuryStatus: "Active", stats: { recYds: 120, recTD: 1, rec: 12, targets: 18 } },
  { id: pid("BUF", "WR2", 1), name: "Gabe Davis", team: "BUF", position: "WR2", positionGroup: "offense", depthOrder: 1, jerseyNumber: 13, height: "6-2", weight: "210", age: 25, college: "UCF", experience: 5, injuryStatus: "Active", stats: { recYds: 750, recTD: 6, rec: 52, targets: 85 } },
  { id: pid("BUF", "WR2", 2), name: "Khalil Shakir", team: "BUF", position: "WR2", positionGroup: "offense", depthOrder: 2, jerseyNumber: 10, height: "6-0", weight: "190", age: 25, college: "Boise State", experience: 3, injuryStatus: "Active", stats: { recYds: 520, recTD: 4, rec: 45, targets: 60 } },
  { id: pid("BUF", "WR2", 3), name: "Marquez Valdes-Scantling", team: "BUF", position: "WR2", positionGroup: "offense", depthOrder: 3, jerseyNumber: 11, height: "6-4", weight: "206", age: 30, college: "South Florida", experience: 7, injuryStatus: "Active", stats: { recYds: 180, recTD: 1, rec: 14, targets: 25 } },
  { id: pid("BUF", "WR3", 1), name: "Khalil Shakir", team: "BUF", position: "WR3", positionGroup: "offense", depthOrder: 1, jerseyNumber: 10, height: "6-0", weight: "190", age: 25, college: "Boise State", experience: 3, injuryStatus: "Active", stats: { recYds: 520, recTD: 4, rec: 45, targets: 60 } },
  { id: pid("BUF", "WR3", 2), name: "Trent Sherfield", team: "BUF", position: "WR3", positionGroup: "offense", depthOrder: 2, jerseyNumber: 16, height: "6-1", weight: "219", age: 28, college: "Vanderbilt", experience: 6, injuryStatus: "Active", stats: { recYds: 120, recTD: 1, rec: 12, targets: 18 } },
  { id: pid("BUF", "WR3", 3), name: "Marquez Valdes-Scantling", team: "BUF", position: "WR3", positionGroup: "offense", depthOrder: 3, jerseyNumber: 11, height: "6-4", weight: "206", age: 30, college: "South Florida", experience: 7, injuryStatus: "Active", stats: { recYds: 180, recTD: 1, rec: 14, targets: 25 } },
  { id: pid("BUF", "TE", 1), name: "Dalton Kincaid", team: "BUF", position: "TE", positionGroup: "offense", depthOrder: 1, jerseyNumber: 86, height: "6-4", weight: "240", age: 25, college: "Utah", experience: 2, injuryStatus: "Questionable", injuryDetail: "Knee — missed practice Thu", stats: { recYds: 680, recTD: 4, rec: 60, targets: 80 } },
  { id: pid("BUF", "TE", 2), name: "Dawson Knox", team: "BUF", position: "TE", positionGroup: "offense", depthOrder: 2, jerseyNumber: 88, height: "6-4", weight: "254", age: 27, college: "Ole Miss", experience: 6, injuryStatus: "Active", stats: { recYds: 280, recTD: 3, rec: 25, targets: 35 } },
  { id: pid("BUF", "TE", 3), name: "Quintin Morris", team: "BUF", position: "TE", positionGroup: "offense", depthOrder: 3, jerseyNumber: 85, height: "6-2", weight: "250", age: 26, college: "Bowling Green", experience: 3, injuryStatus: "Active", stats: { recYds: 60, recTD: 0, rec: 8, targets: 12 } },
  { id: pid("BUF", "LT", 1), name: "Dion Dawkins", team: "BUF", position: "LT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 73, height: "6-5", weight: "320", age: 30, college: "Temple", experience: 8, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 2 } },
  { id: pid("BUF", "LT", 2), name: "Ryan Van Demark", team: "BUF", position: "LT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 62, height: "6-6", weight: "310", age: 25, college: "UConn", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("BUF", "LT", 3), name: "Alec Anderson", team: "BUF", position: "LT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 70, height: "6-5", weight: "310", age: 26, college: "UCLA", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("BUF", "LG", 1), name: "Connor McGovern", team: "BUF", position: "LG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 66, height: "6-4", weight: "308", age: 27, college: "Penn State", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 1 } },
  { id: pid("BUF", "LG", 2), name: "David Edwards", team: "BUF", position: "LG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 60, height: "6-6", weight: "315", age: 28, college: "Wisconsin", experience: 6, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("BUF", "LG", 3), name: "Alec Anderson", team: "BUF", position: "LG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 70, height: "6-5", weight: "310", age: 26, college: "UCLA", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("BUF", "C", 1), name: "Mitch Morse", team: "BUF", position: "C", positionGroup: "offense", depthOrder: 1, jerseyNumber: 60, height: "6-5", weight: "305", age: 32, college: "Missouri", experience: 10, injuryStatus: "Active", stats: { gamesStarted: 15, sacks: 0 } },
  { id: pid("BUF", "C", 2), name: "Connor McGovern", team: "BUF", position: "C", positionGroup: "offense", depthOrder: 2, jerseyNumber: 66, height: "6-4", weight: "308", age: 27, college: "Penn State", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("BUF", "C", 3), name: "Alec Anderson", team: "BUF", position: "C", positionGroup: "offense", depthOrder: 3, jerseyNumber: 70, height: "6-5", weight: "310", age: 26, college: "UCLA", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("BUF", "RG", 1), name: "O'Cyrus Torrence", team: "BUF", position: "RG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 64, height: "6-5", weight: "347", age: 24, college: "Florida", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 17, sacks: 1 } },
  { id: pid("BUF", "RG", 2), name: "David Edwards", team: "BUF", position: "RG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 60, height: "6-6", weight: "315", age: 28, college: "Wisconsin", experience: 6, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("BUF", "RG", 3), name: "Ryan Van Demark", team: "BUF", position: "RG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 62, height: "6-6", weight: "310", age: 25, college: "UConn", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("BUF", "RT", 1), name: "Spencer Brown", team: "BUF", position: "RT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 79, height: "6-8", weight: "311", age: 26, college: "Northern Iowa", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 15, sacks: 3 } },
  { id: pid("BUF", "RT", 2), name: "Ryan Van Demark", team: "BUF", position: "RT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 62, height: "6-6", weight: "310", age: 25, college: "UConn", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("BUF", "RT", 3), name: "Alec Anderson", team: "BUF", position: "RT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 70, height: "6-5", weight: "310", age: 26, college: "UCLA", experience: 3, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  // --- Defense ---
  { id: pid("BUF", "DE1", 1), name: "Greg Rousseau", team: "BUF", position: "DE1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 50, height: "6-6", weight: "266", age: 24, college: "Miami", experience: 4, injuryStatus: "Active", stats: { tackles: 48, sacks: 8.0, tfl: 10, ff: 2 } },
  { id: pid("BUF", "DE1", 2), name: "Kingsley Jonathan", team: "BUF", position: "DE1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 52, height: "6-4", weight: "265", age: 26, college: "Syracuse", experience: 3, injuryStatus: "Active", stats: { tackles: 18, sacks: 2.0, tfl: 3, ff: 0 } },
  { id: pid("BUF", "DE1", 3), name: "Javon Solomon", team: "BUF", position: "DE1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 55, height: "6-2", weight: "250", age: 23, college: "Troy", experience: 1, injuryStatus: "Active", stats: { tackles: 8, sacks: 1.0, tfl: 1, ff: 0 } },
  { id: pid("BUF", "DE2", 1), name: "A.J. Epenesa", team: "BUF", position: "DE2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 57, height: "6-5", weight: "275", age: 26, college: "Iowa", experience: 5, injuryStatus: "Active", stats: { tackles: 40, sacks: 7.0, tfl: 8, ff: 1 } },
  { id: pid("BUF", "DE2", 2), name: "Kingsley Jonathan", team: "BUF", position: "DE2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 52, height: "6-4", weight: "265", age: 26, college: "Syracuse", experience: 3, injuryStatus: "Active", stats: { tackles: 18, sacks: 2.0, tfl: 3, ff: 0 } },
  { id: pid("BUF", "DE2", 3), name: "Javon Solomon", team: "BUF", position: "DE2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 55, height: "6-2", weight: "250", age: 23, college: "Troy", experience: 1, injuryStatus: "Active", stats: { tackles: 8, sacks: 1.0, tfl: 1, ff: 0 } },
  { id: pid("BUF", "DT1", 1), name: "Ed Oliver", team: "BUF", position: "DT1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 91, height: "6-1", weight: "287", age: 27, college: "Houston", experience: 6, injuryStatus: "Active", stats: { tackles: 45, sacks: 5.5, tfl: 8, ff: 1 } },
  { id: pid("BUF", "DT1", 2), name: "DaQuan Jones", team: "BUF", position: "DT1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 92, height: "6-4", weight: "320", age: 32, college: "Penn State", experience: 11, injuryStatus: "Active", stats: { tackles: 22, sacks: 1.5, tfl: 3, ff: 0 } },
  { id: pid("BUF", "DT1", 3), name: "Settle Poona Ford", team: "BUF", position: "DT1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 97, height: "6-0", weight: "305", age: 29, college: "Texas", experience: 7, injuryStatus: "Active", stats: { tackles: 10, sacks: 0.5, tfl: 1, ff: 0 } },
  { id: pid("BUF", "DT2", 1), name: "DaQuan Jones", team: "BUF", position: "DT2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 92, height: "6-4", weight: "320", age: 32, college: "Penn State", experience: 11, injuryStatus: "Active", stats: { tackles: 22, sacks: 1.5, tfl: 3, ff: 0 } },
  { id: pid("BUF", "DT2", 2), name: "Settle Poona Ford", team: "BUF", position: "DT2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 97, height: "6-0", weight: "305", age: 29, college: "Texas", experience: 7, injuryStatus: "Active", stats: { tackles: 10, sacks: 0.5, tfl: 1, ff: 0 } },
  { id: pid("BUF", "DT2", 3), name: "C.J. Brewer", team: "BUF", position: "DT2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 93, height: "6-3", weight: "310", age: 25, college: "Coastal Carolina", experience: 2, injuryStatus: "Active", stats: { tackles: 5, sacks: 0, tfl: 0, ff: 0 } },
  { id: pid("BUF", "LB1", 1), name: "Matt Milano", team: "BUF", position: "LB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 58, height: "6-0", weight: "228", age: 30, college: "Boston College", experience: 8, injuryStatus: "Active", stats: { tackles: 90, sacks: 3.5, tfl: 7, int: 2 } },
  { id: pid("BUF", "LB1", 2), name: "Terrel Bernard", team: "BUF", position: "LB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 43, height: "6-1", weight: "224", age: 25, college: "Baylor", experience: 3, injuryStatus: "Active", stats: { tackles: 45, sacks: 1.0, tfl: 3, int: 0 } },
  { id: pid("BUF", "LB1", 3), name: "Baylon Spector", team: "BUF", position: "LB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 54, height: "6-1", weight: "233", age: 25, college: "Clemson", experience: 3, injuryStatus: "Active", stats: { tackles: 12, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("BUF", "LB2", 1), name: "Terrel Bernard", team: "BUF", position: "LB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 43, height: "6-1", weight: "224", age: 25, college: "Baylor", experience: 3, injuryStatus: "Active", stats: { tackles: 100, sacks: 2.0, tfl: 5, int: 1 } },
  { id: pid("BUF", "LB2", 2), name: "Baylon Spector", team: "BUF", position: "LB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 54, height: "6-1", weight: "233", age: 25, college: "Clemson", experience: 3, injuryStatus: "Active", stats: { tackles: 12, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("BUF", "LB2", 3), name: "Tyler Matakevich", team: "BUF", position: "LB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 44, height: "6-1", weight: "235", age: 32, college: "Temple", experience: 9, injuryStatus: "Active", stats: { tackles: 8, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("BUF", "LB3", 1), name: "Baylon Spector", team: "BUF", position: "LB3", positionGroup: "defense", depthOrder: 1, jerseyNumber: 54, height: "6-1", weight: "233", age: 25, college: "Clemson", experience: 3, injuryStatus: "Active", stats: { tackles: 30, sacks: 0.5, tfl: 2, int: 0 } },
  { id: pid("BUF", "LB3", 2), name: "Tyler Matakevich", team: "BUF", position: "LB3", positionGroup: "defense", depthOrder: 2, jerseyNumber: 44, height: "6-1", weight: "235", age: 32, college: "Temple", experience: 9, injuryStatus: "Active", stats: { tackles: 8, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("BUF", "LB3", 3), name: "Dorian Williams", team: "BUF", position: "LB3", positionGroup: "defense", depthOrder: 3, jerseyNumber: 42, height: "6-1", weight: "228", age: 23, college: "Tulane", experience: 1, injuryStatus: "Active", stats: { tackles: 5, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("BUF", "CB1", 1), name: "Rasul Douglas", team: "BUF", position: "CB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 31, height: "6-2", weight: "209", age: 29, college: "West Virginia", experience: 7, injuryStatus: "Active", stats: { tackles: 50, int: 3, pd: 12, ff: 0 } },
  { id: pid("BUF", "CB1", 2), name: "Christian Benford", team: "BUF", position: "CB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 47, height: "6-1", weight: "190", age: 24, college: "Villanova", experience: 3, injuryStatus: "Active", stats: { tackles: 30, int: 1, pd: 6, ff: 0 } },
  { id: pid("BUF", "CB1", 3), name: "Dane Jackson", team: "BUF", position: "CB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 36, height: "6-0", weight: "190", age: 27, college: "Pittsburgh", experience: 5, injuryStatus: "Active", stats: { tackles: 10, int: 0, pd: 2, ff: 0 } },
  { id: pid("BUF", "CB2", 1), name: "Christian Benford", team: "BUF", position: "CB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 47, height: "6-1", weight: "190", age: 24, college: "Villanova", experience: 3, injuryStatus: "Active", stats: { tackles: 45, int: 2, pd: 8, ff: 0 } },
  { id: pid("BUF", "CB2", 2), name: "Dane Jackson", team: "BUF", position: "CB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 36, height: "6-0", weight: "190", age: 27, college: "Pittsburgh", experience: 5, injuryStatus: "Active", stats: { tackles: 20, int: 0, pd: 4, ff: 0 } },
  { id: pid("BUF", "CB2", 3), name: "Kaiir Elam", team: "BUF", position: "CB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 24, height: "6-2", weight: "191", age: 24, college: "Florida", experience: 3, injuryStatus: "Active", stats: { tackles: 8, int: 0, pd: 2, ff: 0 } },
  { id: pid("BUF", "SS", 1), name: "Taylor Rapp", team: "BUF", position: "SS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 20, height: "6-0", weight: "208", age: 27, college: "Washington", experience: 6, injuryStatus: "Active", stats: { tackles: 70, int: 2, pd: 6, ff: 1 } },
  { id: pid("BUF", "SS", 2), name: "Damar Hamlin", team: "BUF", position: "SS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 3, height: "6-1", weight: "200", age: 26, college: "Pittsburgh", experience: 4, injuryStatus: "Active", stats: { tackles: 25, int: 0, pd: 2, ff: 0 } },
  { id: pid("BUF", "SS", 3), name: "Mike Edwards", team: "BUF", position: "SS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 22, height: "5-10", weight: "197", age: 28, college: "Kentucky", experience: 6, injuryStatus: "Active", stats: { tackles: 10, int: 0, pd: 1, ff: 0 } },
  { id: pid("BUF", "FS", 1), name: "Damar Hamlin", team: "BUF", position: "FS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 3, height: "6-1", weight: "200", age: 26, college: "Pittsburgh", experience: 4, injuryStatus: "Active", stats: { tackles: 55, int: 1, pd: 5, ff: 0 } },
  { id: pid("BUF", "FS", 2), name: "Mike Edwards", team: "BUF", position: "FS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 22, height: "5-10", weight: "197", age: 28, college: "Kentucky", experience: 6, injuryStatus: "Active", stats: { tackles: 20, int: 1, pd: 3, ff: 0 } },
  { id: pid("BUF", "FS", 3), name: "Taylor Rapp", team: "BUF", position: "FS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 20, height: "6-0", weight: "208", age: 27, college: "Washington", experience: 6, injuryStatus: "Active", stats: { tackles: 15, int: 0, pd: 1, ff: 0 } },
  // --- Special Teams ---
  { id: pid("BUF", "K", 1), name: "Tyler Bass", team: "BUF", position: "K", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 2, height: "5-10", weight: "183", age: 27, college: "Georgia Southern", experience: 5, injuryStatus: "Active", stats: { fgMade: 27, fgAtt: 32, xpMade: 45, longFG: 54 } },
  { id: pid("BUF", "K", 2), name: "Anders Carlson", team: "BUF", position: "K", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 9, height: "6-5", weight: "220", age: 26, college: "Auburn", experience: 2, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("BUF", "K", 3), name: "Shane Buechele", team: "BUF", position: "K", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 7, height: "6-1", weight: "210", age: 26, college: "SMU", experience: 3, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("BUF", "P", 1), name: "Sam Martin", team: "BUF", position: "P", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 8, height: "6-1", weight: "211", age: 34, college: "Appalachian State", experience: 12, injuryStatus: "Active", stats: { punts: 50, puntAvg: 45.5, inside20: 22, longPunt: 58 } },
  { id: pid("BUF", "P", 2), name: "Tyler Bass", team: "BUF", position: "P", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 2, height: "5-10", weight: "183", age: 27, college: "Georgia Southern", experience: 5, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("BUF", "P", 3), name: "Shane Buechele", team: "BUF", position: "P", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 7, height: "6-1", weight: "210", age: 26, college: "SMU", experience: 3, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("BUF", "KR", 1), name: "Khalil Shakir", team: "BUF", position: "KR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 10, height: "6-0", weight: "190", age: 25, college: "Boise State", experience: 3, injuryStatus: "Active", stats: { krYds: 400, krAvg: 23.5, krTD: 0, krLong: 45 } },
  { id: pid("BUF", "KR", 2), name: "Ty Johnson", team: "BUF", position: "KR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 25, height: "5-10", weight: "210", age: 27, college: "Maryland", experience: 6, injuryStatus: "Active", stats: { krYds: 100, krAvg: 20.0, krTD: 0, krLong: 28 } },
  { id: pid("BUF", "KR", 3), name: "Latavius Murray", team: "BUF", position: "KR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 28, height: "6-3", weight: "230", age: 34, college: "UCF", experience: 12, injuryStatus: "Active", stats: { krYds: 0, krAvg: 0, krTD: 0, krLong: 0 } },
  { id: pid("BUF", "PR", 1), name: "Khalil Shakir", team: "BUF", position: "PR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 10, height: "6-0", weight: "190", age: 25, college: "Boise State", experience: 3, injuryStatus: "Active", stats: { prYds: 160, prAvg: 9.4, prTD: 0, prLong: 22 } },
  { id: pid("BUF", "PR", 2), name: "Trent Sherfield", team: "BUF", position: "PR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 16, height: "6-1", weight: "219", age: 28, college: "Vanderbilt", experience: 6, injuryStatus: "Active", stats: { prYds: 20, prAvg: 5.0, prTD: 0, prLong: 10 } },
  { id: pid("BUF", "PR", 3), name: "Ty Johnson", team: "BUF", position: "PR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 25, height: "5-10", weight: "210", age: 27, college: "Maryland", experience: 6, injuryStatus: "Active", stats: { prYds: 0, prAvg: 0, prTD: 0, prLong: 0 } },
  { id: pid("BUF", "LS", 1), name: "Reid Ferguson", team: "BUF", position: "LS", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 69, height: "6-2", weight: "240", age: 30, college: "LSU", experience: 8, injuryStatus: "Active", stats: { gamesPlayed: 17, badSnaps: 0 } },
  { id: pid("BUF", "LS", 2), name: "Mitch Morse", team: "BUF", position: "LS", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 60, height: "6-5", weight: "305", age: 32, college: "Missouri", experience: 10, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },
  { id: pid("BUF", "LS", 3), name: "Connor McGovern", team: "BUF", position: "LS", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 66, height: "6-4", weight: "308", age: 27, college: "Penn State", experience: 5, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },

  // =============================================
  // MIAMI DOLPHINS (Showcase — full 3-deep)
  // =============================================
  // --- Offense ---
  { id: pid("MIA", "QB", 1), name: "Tua Tagovailoa", team: "MIA", position: "QB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 1, height: "6-1", weight: "217", age: 26, college: "Alabama", experience: 5, injuryStatus: "Active", stats: { passYds: 4015, passTD: 29, int: 8, qbr: 96.5 } },
  { id: pid("MIA", "QB", 2), name: "Mike White", team: "MIA", position: "QB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 14, height: "6-5", weight: "224", age: 29, college: "Western Kentucky", experience: 6, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("MIA", "QB", 3), name: "Skylar Thompson", team: "MIA", position: "QB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 19, height: "6-2", weight: "217", age: 27, college: "Kansas State", experience: 3, injuryStatus: "Active", stats: { passYds: 0, passTD: 0, int: 0, qbr: 0 } },
  { id: pid("MIA", "RB", 1), name: "De'Von Achane", team: "MIA", position: "RB", positionGroup: "offense", depthOrder: 1, jerseyNumber: 28, height: "5-9", weight: "188", age: 23, college: "Texas A&M", experience: 2, injuryStatus: "Active", stats: { rushYds: 980, rushTD: 10, ypc: 5.8, rec: 35 } },
  { id: pid("MIA", "RB", 2), name: "Raheem Mostert", team: "MIA", position: "RB", positionGroup: "offense", depthOrder: 2, jerseyNumber: 31, height: "5-10", weight: "205", age: 32, college: "Purdue", experience: 9, injuryStatus: "Doubtful", injuryDetail: "Knee — did not practice all week", stats: { rushYds: 420, rushTD: 4, ypc: 4.4, rec: 12 } },
  { id: pid("MIA", "RB", 3), name: "Jeff Wilson Jr.", team: "MIA", position: "RB", positionGroup: "offense", depthOrder: 3, jerseyNumber: 23, height: "6-0", weight: "213", age: 28, college: "North Texas", experience: 6, injuryStatus: "Active", stats: { rushYds: 120, rushTD: 1, ypc: 3.8, rec: 8 } },
  { id: pid("MIA", "WR1", 1), name: "Tyreek Hill", team: "MIA", position: "WR1", positionGroup: "offense", depthOrder: 1, jerseyNumber: 10, height: "5-10", weight: "185", age: 30, college: "West Alabama", experience: 9, injuryStatus: "Active", stats: { recYds: 1480, recTD: 13, rec: 105, targets: 140 } },
  { id: pid("MIA", "WR1", 2), name: "Jaylen Waddle", team: "MIA", position: "WR1", positionGroup: "offense", depthOrder: 2, jerseyNumber: 17, height: "5-10", weight: "182", age: 26, college: "Alabama", experience: 4, injuryStatus: "Active", stats: { recYds: 850, recTD: 5, rec: 62, targets: 90 } },
  { id: pid("MIA", "WR1", 3), name: "River Cracraft", team: "MIA", position: "WR1", positionGroup: "offense", depthOrder: 3, jerseyNumber: 85, height: "5-11", weight: "187", age: 29, college: "Washington State", experience: 5, injuryStatus: "Active", stats: { recYds: 80, recTD: 0, rec: 8, targets: 12 } },
  { id: pid("MIA", "WR2", 1), name: "Jaylen Waddle", team: "MIA", position: "WR2", positionGroup: "offense", depthOrder: 1, jerseyNumber: 17, height: "5-10", weight: "182", age: 26, college: "Alabama", experience: 4, injuryStatus: "Active", stats: { recYds: 850, recTD: 5, rec: 62, targets: 90 } },
  { id: pid("MIA", "WR2", 2), name: "Braxton Berrios", team: "MIA", position: "WR2", positionGroup: "offense", depthOrder: 2, jerseyNumber: 0, height: "5-9", weight: "190", age: 29, college: "Miami", experience: 6, injuryStatus: "Active", stats: { recYds: 180, recTD: 1, rec: 18, targets: 25 } },
  { id: pid("MIA", "WR2", 3), name: "Cedrick Wilson Jr.", team: "MIA", position: "WR2", positionGroup: "offense", depthOrder: 3, jerseyNumber: 11, height: "6-2", weight: "200", age: 29, college: "Boise State", experience: 6, injuryStatus: "Active", stats: { recYds: 60, recTD: 0, rec: 6, targets: 10 } },
  { id: pid("MIA", "WR3", 1), name: "Braxton Berrios", team: "MIA", position: "WR3", positionGroup: "offense", depthOrder: 1, jerseyNumber: 0, height: "5-9", weight: "190", age: 29, college: "Miami", experience: 6, injuryStatus: "Active", stats: { recYds: 180, recTD: 1, rec: 18, targets: 25 } },
  { id: pid("MIA", "WR3", 2), name: "Cedrick Wilson Jr.", team: "MIA", position: "WR3", positionGroup: "offense", depthOrder: 2, jerseyNumber: 11, height: "6-2", weight: "200", age: 29, college: "Boise State", experience: 6, injuryStatus: "Active", stats: { recYds: 60, recTD: 0, rec: 6, targets: 10 } },
  { id: pid("MIA", "WR3", 3), name: "River Cracraft", team: "MIA", position: "WR3", positionGroup: "offense", depthOrder: 3, jerseyNumber: 85, height: "5-11", weight: "187", age: 29, college: "Washington State", experience: 5, injuryStatus: "Active", stats: { recYds: 80, recTD: 0, rec: 8, targets: 12 } },
  { id: pid("MIA", "TE", 1), name: "Durham Smythe", team: "MIA", position: "TE", positionGroup: "offense", depthOrder: 1, jerseyNumber: 81, height: "6-6", weight: "258", age: 29, college: "Notre Dame", experience: 7, injuryStatus: "Active", stats: { recYds: 220, recTD: 2, rec: 22, targets: 30 } },
  { id: pid("MIA", "TE", 2), name: "Julian Hill", team: "MIA", position: "TE", positionGroup: "offense", depthOrder: 2, jerseyNumber: 89, height: "6-5", weight: "245", age: 25, college: "Virginia Tech", experience: 2, injuryStatus: "Active", stats: { recYds: 80, recTD: 1, rec: 10, targets: 14 } },
  { id: pid("MIA", "TE", 3), name: "Tyler Kroft", team: "MIA", position: "TE", positionGroup: "offense", depthOrder: 3, jerseyNumber: 80, height: "6-6", weight: "252", age: 32, college: "Rutgers", experience: 9, injuryStatus: "Active", stats: { recYds: 30, recTD: 0, rec: 4, targets: 6 } },
  { id: pid("MIA", "LT", 1), name: "Terron Armstead", team: "MIA", position: "LT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 72, height: "6-5", weight: "304", age: 33, college: "Arkansas-Pine Bluff", experience: 11, injuryStatus: "Active", stats: { gamesStarted: 14, sacks: 2 } },
  { id: pid("MIA", "LT", 2), name: "Kendall Lamm", team: "MIA", position: "LT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 70, height: "6-6", weight: "317", age: 32, college: "Appalachian State", experience: 10, injuryStatus: "Active", stats: { gamesStarted: 3, sacks: 1 } },
  { id: pid("MIA", "LT", 3), name: "Kion Smith", team: "MIA", position: "LT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 74, height: "6-5", weight: "310", age: 25, college: "Fayetteville State", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("MIA", "LG", 1), name: "Robert Jones", team: "MIA", position: "LG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 66, height: "6-5", weight: "320", age: 27, college: "Middle Tennessee", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 1 } },
  { id: pid("MIA", "LG", 2), name: "Lester Cotton Sr.", team: "MIA", position: "LG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 67, height: "6-4", weight: "325", age: 27, college: "Alabama", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("MIA", "LG", 3), name: "Kion Smith", team: "MIA", position: "LG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 74, height: "6-5", weight: "310", age: 25, college: "Fayetteville State", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("MIA", "C", 1), name: "Connor Williams", team: "MIA", position: "C", positionGroup: "offense", depthOrder: 1, jerseyNumber: 58, height: "6-5", weight: "315", age: 27, college: "Texas", experience: 7, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 0 } },
  { id: pid("MIA", "C", 2), name: "Lester Cotton Sr.", team: "MIA", position: "C", positionGroup: "offense", depthOrder: 2, jerseyNumber: 67, height: "6-4", weight: "325", age: 27, college: "Alabama", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("MIA", "C", 3), name: "Kendall Lamm", team: "MIA", position: "C", positionGroup: "offense", depthOrder: 3, jerseyNumber: 70, height: "6-6", weight: "317", age: 32, college: "Appalachian State", experience: 10, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("MIA", "RG", 1), name: "Robert Hunt", team: "MIA", position: "RG", positionGroup: "offense", depthOrder: 1, jerseyNumber: 68, height: "6-6", weight: "323", age: 27, college: "Louisiana", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 16, sacks: 1 } },
  { id: pid("MIA", "RG", 2), name: "Lester Cotton Sr.", team: "MIA", position: "RG", positionGroup: "offense", depthOrder: 2, jerseyNumber: 67, height: "6-4", weight: "325", age: 27, college: "Alabama", experience: 4, injuryStatus: "Active", stats: { gamesStarted: 1, sacks: 0 } },
  { id: pid("MIA", "RG", 3), name: "Kion Smith", team: "MIA", position: "RG", positionGroup: "offense", depthOrder: 3, jerseyNumber: 74, height: "6-5", weight: "310", age: 25, college: "Fayetteville State", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  { id: pid("MIA", "RT", 1), name: "Austin Jackson", team: "MIA", position: "RT", positionGroup: "offense", depthOrder: 1, jerseyNumber: 73, height: "6-5", weight: "320", age: 25, college: "USC", experience: 5, injuryStatus: "Active", stats: { gamesStarted: 15, sacks: 3 } },
  { id: pid("MIA", "RT", 2), name: "Kendall Lamm", team: "MIA", position: "RT", positionGroup: "offense", depthOrder: 2, jerseyNumber: 70, height: "6-6", weight: "317", age: 32, college: "Appalachian State", experience: 10, injuryStatus: "Active", stats: { gamesStarted: 2, sacks: 0 } },
  { id: pid("MIA", "RT", 3), name: "Kion Smith", team: "MIA", position: "RT", positionGroup: "offense", depthOrder: 3, jerseyNumber: 74, height: "6-5", weight: "310", age: 25, college: "Fayetteville State", experience: 2, injuryStatus: "Active", stats: { gamesStarted: 0, sacks: 0 } },
  // --- Defense ---
  { id: pid("MIA", "DE1", 1), name: "Jaelan Phillips", team: "MIA", position: "DE1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 15, height: "6-5", weight: "260", age: 25, college: "Miami", experience: 4, injuryStatus: "Active", stats: { tackles: 42, sacks: 9.5, tfl: 11, ff: 2 } },
  { id: pid("MIA", "DE1", 2), name: "Emmanuel Ogbah", team: "MIA", position: "DE1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 91, height: "6-4", weight: "275", age: 30, college: "Oklahoma State", experience: 9, injuryStatus: "Active", stats: { tackles: 25, sacks: 4.0, tfl: 5, ff: 1 } },
  { id: pid("MIA", "DE1", 3), name: "Mohamed Kamara", team: "MIA", position: "DE1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 53, height: "6-2", weight: "248", age: 24, college: "Colorado State", experience: 2, injuryStatus: "Active", stats: { tackles: 10, sacks: 1.0, tfl: 2, ff: 0 } },
  { id: pid("MIA", "DE2", 1), name: "Bradley Chubb", team: "MIA", position: "DE2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 2, height: "6-4", weight: "275", age: 28, college: "NC State", experience: 7, injuryStatus: "Active", stats: { tackles: 35, sacks: 7.0, tfl: 8, ff: 1 } },
  { id: pid("MIA", "DE2", 2), name: "Emmanuel Ogbah", team: "MIA", position: "DE2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 91, height: "6-4", weight: "275", age: 30, college: "Oklahoma State", experience: 9, injuryStatus: "Active", stats: { tackles: 25, sacks: 4.0, tfl: 5, ff: 1 } },
  { id: pid("MIA", "DE2", 3), name: "Mohamed Kamara", team: "MIA", position: "DE2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 53, height: "6-2", weight: "248", age: 24, college: "Colorado State", experience: 2, injuryStatus: "Active", stats: { tackles: 10, sacks: 1.0, tfl: 2, ff: 0 } },
  { id: pid("MIA", "DT1", 1), name: "Zach Sieler", team: "MIA", position: "DT1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 92, height: "6-6", weight: "300", age: 29, college: "Ferris State", experience: 6, injuryStatus: "Active", stats: { tackles: 48, sacks: 4.5, tfl: 7, ff: 1 } },
  { id: pid("MIA", "DT1", 2), name: "Raekwon Davis", team: "MIA", position: "DT1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 98, height: "6-7", weight: "330", age: 27, college: "Alabama", experience: 5, injuryStatus: "Active", stats: { tackles: 20, sacks: 1.0, tfl: 3, ff: 0 } },
  { id: pid("MIA", "DT1", 3), name: "Da'Shawn Hand", team: "MIA", position: "DT1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 96, height: "6-3", weight: "297", age: 28, college: "Alabama", experience: 6, injuryStatus: "Active", stats: { tackles: 8, sacks: 0.5, tfl: 1, ff: 0 } },
  { id: pid("MIA", "DT2", 1), name: "Raekwon Davis", team: "MIA", position: "DT2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 98, height: "6-7", weight: "330", age: 27, college: "Alabama", experience: 5, injuryStatus: "Active", stats: { tackles: 20, sacks: 1.0, tfl: 3, ff: 0 } },
  { id: pid("MIA", "DT2", 2), name: "Da'Shawn Hand", team: "MIA", position: "DT2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 96, height: "6-3", weight: "297", age: 28, college: "Alabama", experience: 6, injuryStatus: "Active", stats: { tackles: 8, sacks: 0.5, tfl: 1, ff: 0 } },
  { id: pid("MIA", "DT2", 3), name: "Benito Jones", team: "MIA", position: "DT2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 77, height: "6-1", weight: "315", age: 27, college: "Ole Miss", experience: 4, injuryStatus: "Active", stats: { tackles: 5, sacks: 0, tfl: 0, ff: 0 } },
  { id: pid("MIA", "LB1", 1), name: "Jerome Baker", team: "MIA", position: "LB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 55, height: "6-2", weight: "225", age: 28, college: "Ohio State", experience: 7, injuryStatus: "Active", stats: { tackles: 95, sacks: 3.0, tfl: 6, int: 1 } },
  { id: pid("MIA", "LB1", 2), name: "David Long Jr.", team: "MIA", position: "LB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 51, height: "5-11", weight: "227", age: 27, college: "West Virginia", experience: 6, injuryStatus: "Active", stats: { tackles: 45, sacks: 1.0, tfl: 3, int: 0 } },
  { id: pid("MIA", "LB1", 3), name: "Cameron Goode", team: "MIA", position: "LB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 59, height: "6-3", weight: "240", age: 25, college: "California", experience: 3, injuryStatus: "Active", stats: { tackles: 10, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("MIA", "LB2", 1), name: "David Long Jr.", team: "MIA", position: "LB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 51, height: "5-11", weight: "227", age: 27, college: "West Virginia", experience: 6, injuryStatus: "Active", stats: { tackles: 80, sacks: 1.5, tfl: 4, int: 1 } },
  { id: pid("MIA", "LB2", 2), name: "Cameron Goode", team: "MIA", position: "LB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 59, height: "6-3", weight: "240", age: 25, college: "California", experience: 3, injuryStatus: "Active", stats: { tackles: 10, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("MIA", "LB2", 3), name: "Duke Riley", team: "MIA", position: "LB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 45, height: "6-1", weight: "227", age: 30, college: "LSU", experience: 7, injuryStatus: "Active", stats: { tackles: 5, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("MIA", "LB3", 1), name: "Cameron Goode", team: "MIA", position: "LB3", positionGroup: "defense", depthOrder: 1, jerseyNumber: 59, height: "6-3", weight: "240", age: 25, college: "California", experience: 3, injuryStatus: "Active", stats: { tackles: 25, sacks: 0.5, tfl: 2, int: 0 } },
  { id: pid("MIA", "LB3", 2), name: "Duke Riley", team: "MIA", position: "LB3", positionGroup: "defense", depthOrder: 2, jerseyNumber: 45, height: "6-1", weight: "227", age: 30, college: "LSU", experience: 7, injuryStatus: "Active", stats: { tackles: 15, sacks: 0, tfl: 1, int: 0 } },
  { id: pid("MIA", "LB3", 3), name: "Channing Tindall", team: "MIA", position: "LB3", positionGroup: "defense", depthOrder: 3, jerseyNumber: 41, height: "6-2", weight: "228", age: 25, college: "Georgia", experience: 3, injuryStatus: "Active", stats: { tackles: 8, sacks: 0, tfl: 0, int: 0 } },
  { id: pid("MIA", "CB1", 1), name: "Jalen Ramsey", team: "MIA", position: "CB1", positionGroup: "defense", depthOrder: 1, jerseyNumber: 5, height: "6-1", weight: "208", age: 30, college: "Florida State", experience: 9, injuryStatus: "Active", stats: { tackles: 55, int: 3, pd: 12, ff: 1 } },
  { id: pid("MIA", "CB1", 2), name: "Kader Kohou", team: "MIA", position: "CB1", positionGroup: "defense", depthOrder: 2, jerseyNumber: 28, height: "5-10", weight: "190", age: 25, college: "Texas A&M-Commerce", experience: 3, injuryStatus: "Active", stats: { tackles: 30, int: 1, pd: 6, ff: 0 } },
  { id: pid("MIA", "CB1", 3), name: "Cam Smith", team: "MIA", position: "CB1", positionGroup: "defense", depthOrder: 3, jerseyNumber: 3, height: "6-0", weight: "188", age: 24, college: "South Carolina", experience: 2, injuryStatus: "Active", stats: { tackles: 10, int: 0, pd: 2, ff: 0 } },
  { id: pid("MIA", "CB2", 1), name: "Kader Kohou", team: "MIA", position: "CB2", positionGroup: "defense", depthOrder: 1, jerseyNumber: 28, height: "5-10", weight: "190", age: 25, college: "Texas A&M-Commerce", experience: 3, injuryStatus: "Active", stats: { tackles: 48, int: 2, pd: 10, ff: 0 } },
  { id: pid("MIA", "CB2", 2), name: "Cam Smith", team: "MIA", position: "CB2", positionGroup: "defense", depthOrder: 2, jerseyNumber: 3, height: "6-0", weight: "188", age: 24, college: "South Carolina", experience: 2, injuryStatus: "Active", stats: { tackles: 15, int: 0, pd: 3, ff: 0 } },
  { id: pid("MIA", "CB2", 3), name: "Ethan Bonner", team: "MIA", position: "CB2", positionGroup: "defense", depthOrder: 3, jerseyNumber: 25, height: "5-11", weight: "185", age: 24, college: "Maryland", experience: 1, injuryStatus: "Active", stats: { tackles: 5, int: 0, pd: 1, ff: 0 } },
  { id: pid("MIA", "SS", 1), name: "Jevon Holland", team: "MIA", position: "SS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 8, height: "6-1", weight: "207", age: 24, college: "Oregon", experience: 4, injuryStatus: "Active", stats: { tackles: 72, int: 3, pd: 9, ff: 1 } },
  { id: pid("MIA", "SS", 2), name: "DeShon Elliott", team: "MIA", position: "SS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 22, height: "5-11", weight: "209", age: 27, college: "Texas", experience: 6, injuryStatus: "Active", stats: { tackles: 30, int: 0, pd: 3, ff: 0 } },
  { id: pid("MIA", "SS", 3), name: "Marcus Maye", team: "MIA", position: "SS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 6, height: "6-0", weight: "207", age: 31, college: "Florida", experience: 8, injuryStatus: "Active", stats: { tackles: 10, int: 0, pd: 1, ff: 0 } },
  { id: pid("MIA", "FS", 1), name: "DeShon Elliott", team: "MIA", position: "FS", positionGroup: "defense", depthOrder: 1, jerseyNumber: 22, height: "5-11", weight: "209", age: 27, college: "Texas", experience: 6, injuryStatus: "Active", stats: { tackles: 60, int: 2, pd: 5, ff: 1 } },
  { id: pid("MIA", "FS", 2), name: "Marcus Maye", team: "MIA", position: "FS", positionGroup: "defense", depthOrder: 2, jerseyNumber: 6, height: "6-0", weight: "207", age: 31, college: "Florida", experience: 8, injuryStatus: "Active", stats: { tackles: 20, int: 0, pd: 2, ff: 0 } },
  { id: pid("MIA", "FS", 3), name: "Elijah Campbell", team: "MIA", position: "FS", positionGroup: "defense", depthOrder: 3, jerseyNumber: 39, height: "6-0", weight: "200", age: 28, college: "Northern Iowa", experience: 4, injuryStatus: "Active", stats: { tackles: 5, int: 0, pd: 0, ff: 0 } },
  // --- Special Teams ---
  { id: pid("MIA", "K", 1), name: "Jason Sanders", team: "MIA", position: "K", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 7, height: "5-11", weight: "195", age: 29, college: "New Mexico", experience: 7, injuryStatus: "Active", stats: { fgMade: 26, fgAtt: 30, xpMade: 42, longFG: 55 } },
  { id: pid("MIA", "K", 2), name: "Greg Joseph", team: "MIA", position: "K", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 1, height: "6-1", weight: "190", age: 30, college: "Florida Atlantic", experience: 6, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("MIA", "K", 3), name: "Skylar Thompson", team: "MIA", position: "K", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 19, height: "6-2", weight: "217", age: 27, college: "Kansas State", experience: 3, injuryStatus: "Active", stats: { fgMade: 0, fgAtt: 0, xpMade: 0, longFG: 0 } },
  { id: pid("MIA", "P", 1), name: "Jake Bailey", team: "MIA", position: "P", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 16, height: "6-2", weight: "207", age: 27, college: "Stanford", experience: 6, injuryStatus: "Active", stats: { punts: 52, puntAvg: 46.8, inside20: 24, longPunt: 62 } },
  { id: pid("MIA", "P", 2), name: "Jason Sanders", team: "MIA", position: "P", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 7, height: "5-11", weight: "195", age: 29, college: "New Mexico", experience: 7, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("MIA", "P", 3), name: "Skylar Thompson", team: "MIA", position: "P", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 19, height: "6-2", weight: "217", age: 27, college: "Kansas State", experience: 3, injuryStatus: "Active", stats: { punts: 0, puntAvg: 0, inside20: 0, longPunt: 0 } },
  { id: pid("MIA", "KR", 1), name: "Braxton Berrios", team: "MIA", position: "KR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 0, height: "5-9", weight: "190", age: 29, college: "Miami", experience: 6, injuryStatus: "Active", stats: { krYds: 420, krAvg: 24.7, krTD: 0, krLong: 50 } },
  { id: pid("MIA", "KR", 2), name: "De'Von Achane", team: "MIA", position: "KR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 28, height: "5-9", weight: "188", age: 23, college: "Texas A&M", experience: 2, injuryStatus: "Active", stats: { krYds: 80, krAvg: 20.0, krTD: 0, krLong: 28 } },
  { id: pid("MIA", "KR", 3), name: "Jeff Wilson Jr.", team: "MIA", position: "KR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 23, height: "6-0", weight: "213", age: 28, college: "North Texas", experience: 6, injuryStatus: "Active", stats: { krYds: 0, krAvg: 0, krTD: 0, krLong: 0 } },
  { id: pid("MIA", "PR", 1), name: "Braxton Berrios", team: "MIA", position: "PR", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 0, height: "5-9", weight: "190", age: 29, college: "Miami", experience: 6, injuryStatus: "Active", stats: { prYds: 200, prAvg: 10.0, prTD: 0, prLong: 28 } },
  { id: pid("MIA", "PR", 2), name: "Jaylen Waddle", team: "MIA", position: "PR", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 17, height: "5-10", weight: "182", age: 26, college: "Alabama", experience: 4, injuryStatus: "Active", stats: { prYds: 30, prAvg: 6.0, prTD: 0, prLong: 12 } },
  { id: pid("MIA", "PR", 3), name: "Cedrick Wilson Jr.", team: "MIA", position: "PR", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 11, height: "6-2", weight: "200", age: 29, college: "Boise State", experience: 6, injuryStatus: "Active", stats: { prYds: 0, prAvg: 0, prTD: 0, prLong: 0 } },
  { id: pid("MIA", "LS", 1), name: "Blake Ferguson", team: "MIA", position: "LS", positionGroup: "specialTeams", depthOrder: 1, jerseyNumber: 44, height: "6-3", weight: "240", age: 27, college: "LSU", experience: 5, injuryStatus: "Active", stats: { gamesPlayed: 17, badSnaps: 0 } },
  { id: pid("MIA", "LS", 2), name: "Connor Williams", team: "MIA", position: "LS", positionGroup: "specialTeams", depthOrder: 2, jerseyNumber: 58, height: "6-5", weight: "315", age: 27, college: "Texas", experience: 7, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },
  { id: pid("MIA", "LS", 3), name: "Robert Jones", team: "MIA", position: "LS", positionGroup: "specialTeams", depthOrder: 3, jerseyNumber: 66, height: "6-5", weight: "320", age: 27, college: "Middle Tennessee", experience: 4, injuryStatus: "Active", stats: { gamesPlayed: 0, badSnaps: 0 } },

  // =============================================
  // NON-SHOWCASE TEAMS (26 teams — starter + 1 backup)
  // =============================================
  // Helper-generated entries for remaining teams
  ...generateNonShowcaseTeams(),
];
