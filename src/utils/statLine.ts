import { Player } from "@/types";

function fmt(n: number): string {
  return n >= 1000 ? n.toLocaleString("en-US") : String(n);
}

export function getStatLine(player: Player): string {
  const s = player.stats;
  const pos = player.position;

  if (pos === "QB") {
    return `${fmt(s.passYds ?? 0)} yds / ${s.passTD ?? 0} TD`;
  }
  if (pos === "RB") {
    return `${fmt(s.rushYds ?? 0)} yds / ${s.rushTD ?? 0} TD`;
  }
  if (pos.startsWith("WR") || pos === "TE") {
    return `${s.rec ?? 0} rec / ${fmt(s.recYds ?? 0)} yds`;
  }
  if (["LT", "LG", "C", "RG", "RT"].includes(pos)) {
    return `${s.gamesStarted ?? 0} GS`;
  }
  if (pos.startsWith("DE") || pos.startsWith("DT")) {
    return `${s.sacks ?? 0} sacks`;
  }
  if (pos.startsWith("LB")) {
    return `${s.tackles ?? 0} tkl / ${s.sacks ?? 0} sacks`;
  }
  if (pos.startsWith("CB")) {
    return `${s.int ?? 0} INT / ${s.pd ?? 0} PD`;
  }
  if (pos === "SS" || pos === "FS") {
    return `${s.tackles ?? 0} tkl / ${s.int ?? 0} INT`;
  }
  if (pos === "K") {
    return `${s.fgMade ?? 0}/${s.fgAtt ?? 0} FG`;
  }
  if (pos === "P") {
    return `${s.puntAvg ?? 0} avg`;
  }

  return "";
}
