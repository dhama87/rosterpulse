import { ImageResponse } from "next/og";

export const alt = "RosterPulse — NFL Roster Dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0f1a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />

        {/* Green pulse dot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 12px rgba(74, 222, 128, 0.5)",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#4ade80",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            LIVE DATA
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#f1f5f9",
            letterSpacing: "-2px",
            display: "flex",
          }}
        >
          RosterPulse
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.5)",
            marginTop: "16px",
            display: "flex",
          }}
        >
          NFL Roster Dashboard
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "48px",
            padding: "20px 40px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {[
            ["32", "Teams"],
            ["1700+", "Players"],
            ["Daily", "Updates"],
          ].map(([num, label]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "32px", fontWeight: 700, color: "#f1f5f9" }}>
                {num}
              </span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "2px" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
