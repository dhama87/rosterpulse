import type { DraftPick, DraftProspect, TeamNeed } from "@/types";

// 2026 NFL Draft order (first round) — based on Tankathon as of April 2026
// Includes traded picks: CIN→NYG (#10), ATL→LAR (#13), IND→NYJ (#16),
// GB→DAL (#20), JAX→CLE (#24), LAR→KC (#29), DEN→MIA (#30)
export const draftOrder: DraftPick[] = [
  { id: "2026-R1-P1", year: 2026, round: 1, pickNumber: 1, teamId: "LV", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P2", year: 2026, round: 1, pickNumber: 2, teamId: "NYJ", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P3", year: 2026, round: 1, pickNumber: 3, teamId: "ARI", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P4", year: 2026, round: 1, pickNumber: 4, teamId: "TEN", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P5", year: 2026, round: 1, pickNumber: 5, teamId: "NYG", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P6", year: 2026, round: 1, pickNumber: 6, teamId: "CLE", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P7", year: 2026, round: 1, pickNumber: 7, teamId: "WAS", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P8", year: 2026, round: 1, pickNumber: 8, teamId: "NO", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P9", year: 2026, round: 1, pickNumber: 9, teamId: "KC", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P10", year: 2026, round: 1, pickNumber: 10, teamId: "NYG", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: "From CIN via trade (Dexter Lawrence)", timestamp: null },
  { id: "2026-R1-P11", year: 2026, round: 1, pickNumber: 11, teamId: "MIA", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P12", year: 2026, round: 1, pickNumber: 12, teamId: "DAL", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P13", year: 2026, round: 1, pickNumber: 13, teamId: "LAR", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: "From ATL via trade", timestamp: null },
  { id: "2026-R1-P14", year: 2026, round: 1, pickNumber: 14, teamId: "BAL", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P15", year: 2026, round: 1, pickNumber: 15, teamId: "TB", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P16", year: 2026, round: 1, pickNumber: 16, teamId: "NYJ", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: "From IND via trade", timestamp: null },
  { id: "2026-R1-P17", year: 2026, round: 1, pickNumber: 17, teamId: "DET", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P18", year: 2026, round: 1, pickNumber: 18, teamId: "MIN", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P19", year: 2026, round: 1, pickNumber: 19, teamId: "CAR", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P20", year: 2026, round: 1, pickNumber: 20, teamId: "DAL", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: "From GB via trade", timestamp: null },
  { id: "2026-R1-P21", year: 2026, round: 1, pickNumber: 21, teamId: "PIT", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P22", year: 2026, round: 1, pickNumber: 22, teamId: "LAC", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P23", year: 2026, round: 1, pickNumber: 23, teamId: "PHI", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P24", year: 2026, round: 1, pickNumber: 24, teamId: "CLE", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: "From JAX via trade", timestamp: null },
  { id: "2026-R1-P25", year: 2026, round: 1, pickNumber: 25, teamId: "CHI", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P26", year: 2026, round: 1, pickNumber: 26, teamId: "BUF", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P27", year: 2026, round: 1, pickNumber: 27, teamId: "SF", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P28", year: 2026, round: 1, pickNumber: 28, teamId: "HOU", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P29", year: 2026, round: 1, pickNumber: 29, teamId: "KC", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: "From LAR via trade", timestamp: null },
  { id: "2026-R1-P30", year: 2026, round: 1, pickNumber: 30, teamId: "MIA", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: "From DEN via trade", timestamp: null },
  { id: "2026-R1-P31", year: 2026, round: 1, pickNumber: 31, teamId: "NE", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
  { id: "2026-R1-P32", year: 2026, round: 1, pickNumber: 32, teamId: "SEA", playerName: "", position: "", college: "", isTradeUp: false, tradeNote: null, timestamp: null },
];

// Top 32 prospects — Tankathon consensus big board (April 2026)
export const topProspects: DraftProspect[] = [
  { id: "arvell-reese", name: "Arvell Reese", position: "LB", college: "Ohio State", rank: 1, projectedRound: 1, projectedPick: 1 },
  { id: "caleb-downs", name: "Caleb Downs", position: "S", college: "Ohio State", rank: 2, projectedRound: 1, projectedPick: 2 },
  { id: "fernando-mendoza", name: "Fernando Mendoza", position: "QB", college: "Indiana", rank: 3, projectedRound: 1, projectedPick: 3 },
  { id: "david-bailey", name: "David Bailey", position: "EDGE", college: "Texas Tech", rank: 4, projectedRound: 1, projectedPick: 4 },
  { id: "jeremiyah-love", name: "Jeremiyah Love", position: "RB", college: "Notre Dame", rank: 5, projectedRound: 1, projectedPick: 5 },
  { id: "sonny-styles", name: "Sonny Styles", position: "LB", college: "Ohio State", rank: 6, projectedRound: 1, projectedPick: 6 },
  { id: "carnell-tate", name: "Carnell Tate", position: "WR", college: "Ohio State", rank: 7, projectedRound: 1, projectedPick: 7 },
  { id: "rueben-bain", name: "Rueben Bain Jr.", position: "EDGE", college: "Miami", rank: 8, projectedRound: 1, projectedPick: 8 },
  { id: "francis-mauigoa", name: "Francis Mauigoa", position: "OT", college: "Miami", rank: 9, projectedRound: 1, projectedPick: 9 },
  { id: "mansoor-delane", name: "Mansoor Delane", position: "CB", college: "LSU", rank: 10, projectedRound: 1, projectedPick: 10 },
  { id: "spencer-fano", name: "Spencer Fano", position: "OT", college: "Utah", rank: 11, projectedRound: 1, projectedPick: 11 },
  { id: "makai-lemon", name: "Makai Lemon", position: "WR", college: "USC", rank: 12, projectedRound: 1, projectedPick: 12 },
  { id: "vega-ioane", name: "Vega Ioane", position: "IOL", college: "Penn State", rank: 13, projectedRound: 1, projectedPick: 13 },
  { id: "jordyn-tyson", name: "Jordyn Tyson", position: "WR", college: "Arizona State", rank: 14, projectedRound: 1, projectedPick: 14 },
  { id: "monroe-freeling", name: "Monroe Freeling", position: "OT", college: "Georgia", rank: 15, projectedRound: 1, projectedPick: 15 },
  { id: "dillon-thieneman", name: "Dillon Thieneman", position: "S", college: "Oregon", rank: 16, projectedRound: 1, projectedPick: 16 },
  { id: "kenyon-sadiq", name: "Kenyon Sadiq", position: "TE", college: "Oregon", rank: 17, projectedRound: 1, projectedPick: 17 },
  { id: "jermod-mccoy", name: "Jermod McCoy", position: "CB", college: "Tennessee", rank: 18, projectedRound: 1, projectedPick: 18 },
  { id: "kadyn-proctor", name: "Kadyn Proctor", position: "OT", college: "Alabama", rank: 19, projectedRound: 1, projectedPick: 19 },
  { id: "keldric-faulk", name: "Keldric Faulk", position: "EDGE", college: "Auburn", rank: 20, projectedRound: 1, projectedPick: 20 },
  { id: "kc-concepcion", name: "KC Concepcion", position: "WR", college: "Texas A&M", rank: 21, projectedRound: 1, projectedPick: 21 },
  { id: "akheem-mesidor", name: "Akheem Mesidor", position: "EDGE", college: "Miami", rank: 22, projectedRound: 1, projectedPick: 22 },
  { id: "omar-cooper", name: "Omar Cooper Jr.", position: "WR", college: "Indiana", rank: 23, projectedRound: 1, projectedPick: 23 },
  { id: "emmanuel-mcneil-warren", name: "Emmanuel McNeil-Warren", position: "S", college: "Toledo", rank: 24, projectedRound: 1, projectedPick: null },
  { id: "denzel-boston", name: "Denzel Boston", position: "WR", college: "Washington", rank: 25, projectedRound: 1, projectedPick: null },
  { id: "blake-miller", name: "Blake Miller", position: "OT", college: "Clemson", rank: 26, projectedRound: 1, projectedPick: null },
  { id: "caleb-lomu", name: "Caleb Lomu", position: "OT", college: "Utah", rank: 27, projectedRound: 1, projectedPick: null },
  { id: "max-iheanachor", name: "Max Iheanachor", position: "OT", college: "Arizona State", rank: 28, projectedRound: 1, projectedPick: null },
  { id: "kayden-mcdonald", name: "Kayden McDonald", position: "DL", college: "Ohio State", rank: 29, projectedRound: 1, projectedPick: null },
  { id: "peter-woods", name: "Peter Woods", position: "DL", college: "Clemson", rank: 30, projectedRound: 1, projectedPick: null },
  { id: "tj-parker", name: "T.J. Parker", position: "EDGE", college: "Clemson", rank: 31, projectedRound: 1, projectedPick: null },
  { id: "colton-hood", name: "Colton Hood", position: "CB", college: "Tennessee", rank: 32, projectedRound: 1, projectedPick: null },
];

// Team needs by position priority (1=critical, 2=moderate, 3=depth)
// Based on NFL.com analysis — April 2026
// Teams without a 1st-round pick (CIN, ATL, GB, IND, DEN, JAX) still listed for reference
export const teamNeeds: TeamNeed[] = [
  // LV Raiders (#1)
  { teamId: "LV", position: "QB", priority: 1 },
  { teamId: "LV", position: "OL", priority: 2 },
  { teamId: "LV", position: "EDGE", priority: 3 },
  // NYJ Jets (#2, #16 from IND)
  { teamId: "NYJ", position: "OL", priority: 1 },
  { teamId: "NYJ", position: "EDGE", priority: 1 },
  { teamId: "NYJ", position: "CB", priority: 2 },
  // ARI Cardinals (#3)
  { teamId: "ARI", position: "EDGE", priority: 1 },
  { teamId: "ARI", position: "DL", priority: 2 },
  { teamId: "ARI", position: "CB", priority: 3 },
  // TEN Titans (#4)
  { teamId: "TEN", position: "OL", priority: 1 },
  { teamId: "TEN", position: "WR", priority: 2 },
  { teamId: "TEN", position: "CB", priority: 3 },
  // NYG Giants (#5, #10 from CIN)
  { teamId: "NYG", position: "EDGE", priority: 1 },
  { teamId: "NYG", position: "OL", priority: 1 },
  { teamId: "NYG", position: "CB", priority: 2 },
  // CLE Browns (#6, #24 from JAX)
  { teamId: "CLE", position: "QB", priority: 1 },
  { teamId: "CLE", position: "OL", priority: 2 },
  { teamId: "CLE", position: "WR", priority: 2 },
  // WAS Commanders (#7)
  { teamId: "WAS", position: "DL", priority: 1 },
  { teamId: "WAS", position: "OL", priority: 2 },
  { teamId: "WAS", position: "LB", priority: 3 },
  // NO Saints (#8)
  { teamId: "NO", position: "WR", priority: 1 },
  { teamId: "NO", position: "OL", priority: 2 },
  { teamId: "NO", position: "CB", priority: 3 },
  // KC Chiefs (#9, #29 from LAR)
  { teamId: "KC", position: "WR", priority: 1 },
  { teamId: "KC", position: "OL", priority: 2 },
  { teamId: "KC", position: "CB", priority: 3 },
  // MIA Dolphins (#11, #30 from DEN)
  { teamId: "MIA", position: "OL", priority: 1 },
  { teamId: "MIA", position: "DL", priority: 2 },
  { teamId: "MIA", position: "LB", priority: 3 },
  // DAL Cowboys (#12, #20 from GB)
  { teamId: "DAL", position: "EDGE", priority: 1 },
  { teamId: "DAL", position: "OL", priority: 1 },
  { teamId: "DAL", position: "S", priority: 3 },
  // LAR Rams (#13 from ATL)
  { teamId: "LAR", position: "EDGE", priority: 1 },
  { teamId: "LAR", position: "OL", priority: 2 },
  { teamId: "LAR", position: "CB", priority: 3 },
  // BAL Ravens (#14)
  { teamId: "BAL", position: "WR", priority: 1 },
  { teamId: "BAL", position: "OL", priority: 2 },
  { teamId: "BAL", position: "CB", priority: 3 },
  // TB Buccaneers (#15)
  { teamId: "TB", position: "EDGE", priority: 1 },
  { teamId: "TB", position: "OL", priority: 2 },
  { teamId: "TB", position: "S", priority: 3 },
  // DET Lions (#17)
  { teamId: "DET", position: "DL", priority: 1 },
  { teamId: "DET", position: "EDGE", priority: 2 },
  { teamId: "DET", position: "CB", priority: 3 },
  // MIN Vikings (#18)
  { teamId: "MIN", position: "OL", priority: 1 },
  { teamId: "MIN", position: "CB", priority: 2 },
  { teamId: "MIN", position: "EDGE", priority: 3 },
  // CAR Panthers (#19)
  { teamId: "CAR", position: "OL", priority: 1 },
  { teamId: "CAR", position: "EDGE", priority: 2 },
  { teamId: "CAR", position: "CB", priority: 3 },
  // PIT Steelers (#21)
  { teamId: "PIT", position: "QB", priority: 1 },
  { teamId: "PIT", position: "OL", priority: 2 },
  { teamId: "PIT", position: "WR", priority: 3 },
  // LAC Chargers (#22)
  { teamId: "LAC", position: "WR", priority: 1 },
  { teamId: "LAC", position: "OL", priority: 2 },
  { teamId: "LAC", position: "CB", priority: 3 },
  // PHI Eagles (#23)
  { teamId: "PHI", position: "CB", priority: 1 },
  { teamId: "PHI", position: "LB", priority: 2 },
  { teamId: "PHI", position: "S", priority: 3 },
  // CHI Bears (#25)
  { teamId: "CHI", position: "OL", priority: 1 },
  { teamId: "CHI", position: "EDGE", priority: 2 },
  { teamId: "CHI", position: "DL", priority: 3 },
  // BUF Bills (#26)
  { teamId: "BUF", position: "WR", priority: 1 },
  { teamId: "BUF", position: "EDGE", priority: 2 },
  { teamId: "BUF", position: "OL", priority: 3 },
  // SF 49ers (#27)
  { teamId: "SF", position: "OL", priority: 1 },
  { teamId: "SF", position: "DL", priority: 2 },
  { teamId: "SF", position: "S", priority: 3 },
  // HOU Texans (#28)
  { teamId: "HOU", position: "OL", priority: 1 },
  { teamId: "HOU", position: "EDGE", priority: 2 },
  { teamId: "HOU", position: "CB", priority: 3 },
  // NE Patriots (#31)
  { teamId: "NE", position: "WR", priority: 1 },
  { teamId: "NE", position: "OL", priority: 2 },
  { teamId: "NE", position: "EDGE", priority: 3 },
  // SEA Seahawks (#32)
  { teamId: "SEA", position: "OL", priority: 1 },
  { teamId: "SEA", position: "DL", priority: 2 },
  { teamId: "SEA", position: "LB", priority: 3 },
  // --- Teams without 1st-round picks (traded away) ---
  // CIN Bengals (traded #10 to NYG)
  { teamId: "CIN", position: "OL", priority: 1 },
  { teamId: "CIN", position: "DL", priority: 2 },
  { teamId: "CIN", position: "LB", priority: 3 },
  // ATL Falcons (traded #13 to LAR)
  { teamId: "ATL", position: "EDGE", priority: 1 },
  { teamId: "ATL", position: "S", priority: 2 },
  { teamId: "ATL", position: "OL", priority: 3 },
  // GB Packers (traded #20 to DAL)
  { teamId: "GB", position: "DL", priority: 1 },
  { teamId: "GB", position: "S", priority: 2 },
  { teamId: "GB", position: "EDGE", priority: 3 },
  // IND Colts (traded #16 to NYJ)
  { teamId: "IND", position: "WR", priority: 1 },
  { teamId: "IND", position: "EDGE", priority: 2 },
  { teamId: "IND", position: "CB", priority: 3 },
  // DEN Broncos (traded #30 to MIA)
  { teamId: "DEN", position: "WR", priority: 1 },
  { teamId: "DEN", position: "OL", priority: 2 },
  { teamId: "DEN", position: "EDGE", priority: 3 },
  // JAX Jaguars (traded #24 to CLE)
  { teamId: "JAX", position: "QB", priority: 1 },
  { teamId: "JAX", position: "OL", priority: 2 },
  { teamId: "JAX", position: "WR", priority: 3 },
];
