import { ImageResponse } from "next/og";
import { createRosterService } from "@/services/createRosterService";

export const alt = "Player Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const service = createRosterService();
  const player = await service.getPlayer(playerId);

  if (!player) {
    return new ImageResponse(
      <div style={{ background: "#0a0f1a", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#f1f5f9", fontSize: "48px" }}>
        Player not found
      </div>,
      { ...size }
    );
  }

  const team = service.getTeam(player.team);
  const pos = player.position.replace(/\d+$/, "");
  const isRookie = player.experience === 0;

  const statusColor =
    player.injuryStatus === "Active" ? "#4ade80" :
    player.injuryStatus === "Questionable" || player.injuryStatus === "Doubtful" ? "#f59e0b" :
    "#ef4444";

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
        {/* Grid background */}
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

        {/* Jersey number */}
        <div
          style={{
            position: "absolute",
            right: "80px",
            bottom: "60px",
            fontSize: "200px",
            fontWeight: 800,
            color: "rgba(255,255,255,0.04)",
            lineHeight: 1,
            display: "flex",
          }}
        >
          {player.jerseyNumber}
        </div>

        {/* Player name */}
        <div style={{ fontSize: "64px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-1px", display: "flex", alignItems: "center", gap: "20px" }}>
          {player.name}
        </div>

        {/* Position, team, number */}
        <div style={{ fontSize: "24px", color: "rgba(255,255,255,0.5)", marginTop: "8px", display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>#{player.jerseyNumber}</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span>{pos}</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span>{team?.fullName ?? player.team}</span>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          {/* Status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              background: `${statusColor}18`,
              border: `1px solid ${statusColor}30`,
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor, display: "flex" }} />
            <span style={{ fontSize: "16px", fontWeight: 700, color: statusColor, textTransform: "uppercase", letterSpacing: "1px" }}>
              {player.injuryStatus}
            </span>
          </div>

          {/* Rookie badge */}
          {isRookie && (
            <div
              style={{
                display: "flex",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#3b82f618",
                border: "1px solid #3b82f630",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "1px" }}>
                Draft &apos;26
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ display: "flex", gap: "32px", marginTop: "32px", fontSize: "18px", color: "rgba(255,255,255,0.35)" }}>
          <span>{player.height}</span>
          <span>{player.weight} lbs</span>
          <span>Age {player.age}</span>
          <span>Yr {player.experience}</span>
          <span>{player.college}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
