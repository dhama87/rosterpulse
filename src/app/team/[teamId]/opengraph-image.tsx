import { ImageResponse } from "next/og";
import { createRosterService } from "@/services/createRosterService";

export const alt = "Team Roster";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const service = createRosterService();
  const team = service.getTeam(teamId);

  if (!team) {
    return new ImageResponse(
      <div style={{ background: "#0a0f1a", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#f1f5f9", fontSize: "48px" }}>
        Team not found
      </div>,
      { ...size }
    );
  }

  const roster = await service.getTeamRoster(teamId);
  const starterCount = roster?.depthChart.length ?? 0;
  const injuredStarters = roster?.depthChart
    .flatMap((e) => e.players)
    .filter((p) => p.depthOrder === 1 && p.injuryStatus !== "Active").length ?? 0;
  const rookies = roster?.depthChart
    .flatMap((e) => e.players)
    .filter((p) => p.experience === 0).length ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0f1a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />

        {/* RosterPulse branding */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "60px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", display: "flex" }} />
          <span style={{ fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>
            RosterPulse
          </span>
        </div>

        {/* Team name */}
        <div style={{ fontSize: "56px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-1px", display: "flex" }}>
          {team.fullName}
        </div>

        {/* Division & record */}
        <div style={{ fontSize: "24px", color: "rgba(255,255,255,0.5)", marginTop: "8px", display: "flex", gap: "16px" }}>
          <span>{team.conference} {team.division}</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span>{team.record}</span>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "48px",
          }}
        >
          {[
            [String(starterCount), "Positions"],
            [String(injuredStarters), "Injured Starters"],
            ...(rookies > 0 ? [[String(rookies), "Rookies"]] : []),
          ].map(([num, label]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                padding: "16px 24px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <span style={{ fontSize: "36px", fontWeight: 700, color: label === "Injured Starters" && parseInt(num) > 0 ? "#ef4444" : "#f1f5f9" }}>
                {num}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "2px" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ position: "absolute", bottom: "40px", left: "80px", fontSize: "16px", color: "rgba(255,255,255,0.25)", display: "flex" }}>
          Roster &middot; Depth Chart &middot; Injuries &middot; Updated Daily
        </div>
      </div>
    ),
    { ...size }
  );
}
