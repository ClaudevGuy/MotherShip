import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { fonts } from "../fonts";
import { palette, beats } from "../theme";
import { StatusDot } from "../components/StatusDot";

// Beat 9 — Dark flash (frames 630-675, 21-22.5s).
//
// A deliberate tonal whiplash: paper world flashes to charcoal for 1.5
// seconds. Cream serif "Always on." with an italic oxblood period. A
// neon LIVE chip pulses top-right. Tabular telemetry flashes in along
// the bottom like a stock-ticker feed.
//
// The point is CONTRAST — the editorial paper palette dominates the film,
// and this single shock moment reminds the viewer that Mothership has a
// dark theme and a 24/7 heartbeat. Then the film snaps back to paper.

const TICKER_ITEMS = [
  { label: "Runs · hour",   value: "412" },
  { label: "Tokens · hour", value: "1.42M" },
  { label: "Cost · hour",   value: "$12.43" },
  { label: "Avg latency",   value: "1.84s" },
  { label: "Uptime · 30d",  value: "99.98%" },
];

export const DarkFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const b = beats.darkFlash;
  const endFrame = b.start + b.in + b.hold + b.out;

  if (frame < b.start - 1 || frame > endFrame + 1) return null;

  // Hard fade in (sharp snap to dark) and softer fade out back to paper
  const entryOpacity = interpolate(
    frame,
    [b.start, b.start + 5],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    }
  );
  const exitOpacity = interpolate(
    frame,
    [b.start + b.in + b.hold, endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const stageOpacity = Math.min(entryOpacity, exitOpacity);

  // Headline reveal — quick
  const headlineOpacity = interpolate(
    frame,
    [b.start + 4, b.start + 14],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
  const headlineDrift = interpolate(
    frame,
    [b.start + 4, b.start + 14],
    [12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Ticker rows fade in staggered
  const tickerBaseOpacity = interpolate(
    frame,
    [b.start + 12, b.start + 22],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: stageOpacity }}>
      {/* Charcoal stage */}
      <AbsoluteFill style={{ backgroundColor: "#0a0a10" }} />

      {/* Scanlines overlay */}
      <AbsoluteFill
        style={{
          opacity: 0.5,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
          pointerEvents: "none",
        }}
      />

      {/* LIVE chip, top-left */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 72,
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 20px",
          borderRadius: 999,
          border: "1.5px solid rgba(57,255,20,0.45)",
          background: "rgba(57,255,20,0.1)",
        }}
      >
        <StatusDot color="#39FF14" size={12} startFrame={b.start} />
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 18,
            letterSpacing: "0.32em",
            color: "#39FF14",
            textTransform: "uppercase",
          }}
        >
          24/7 · Live
        </span>
      </div>

      {/* Top-right timestamp */}
      <div
        style={{
          position: "absolute",
          top: 82,
          right: 72,
          fontFamily: fonts.mono,
          fontSize: 16,
          letterSpacing: "0.22em",
          color: "rgba(245,241,232,0.55)",
          textTransform: "uppercase",
        }}
      >
        13:42:18 UTC · 04/18/26
      </div>

      {/* Centered headline */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: fonts.serif,
            fontWeight: 500,
            fontSize: 200,
            color: "#f5f1e8",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            opacity: headlineOpacity,
            transform: `translateY(${headlineDrift}px)`,
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
          }}
        >
          Always on
          <span
            style={{
              fontStyle: "italic",
              color: palette.accent,
              fontVariationSettings: '"opsz" 144, "SOFT" 100',
            }}
          >
            .
          </span>
        </div>
      </AbsoluteFill>

      {/* Bottom telemetry ticker */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          left: 72,
          right: 72,
          display: "flex",
          justifyContent: "space-between",
          gap: 24,
          opacity: tickerBaseOpacity,
        }}
      >
        {TICKER_ITEMS.map((t, i) => {
          const itemOpacity = interpolate(
            frame,
            [b.start + 12 + i * 3, b.start + 20 + i * 3],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                opacity: itemOpacity,
              }}
            >
              <span
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(245,241,232,0.45)",
                }}
              >
                {t.label}
              </span>
              <span
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 28,
                  color: "#39FF14",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                  textShadow: "0 0 18px rgba(57,255,20,0.3)",
                }}
              >
                {t.value}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
