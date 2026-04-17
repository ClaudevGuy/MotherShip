import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { fonts } from "../fonts";
import { palette, beats } from "../theme";

// Beat 6 — § Savings (frames 480-570, 16-19s).
//
// The "aha" plate. Closes the product walkthrough with a single big number:
// "$341.27" counting up from zero, italic oxblood subtitle, a context line,
// and a svg sparkline sweeping in beneath. The point is to plant the value
// prop — auto-routing saves you real money — before the film pivots to the
// closing verbs.

const SAVINGS_TARGET = 341.27;

export const SavingsPlate: React.FC = () => {
  const frame = useCurrentFrame();
  const b = beats.savingsPlate;
  const endFrame = b.start + b.in + b.hold + b.out;

  // Hard visibility gate — scene is completely absent outside its beat.
  // Prevents "$0.00" from leaking through every other frame of the film.
  if (frame < b.start - 1 || frame > endFrame + 1) return null;

  const fadeOut = interpolate(
    frame,
    [b.start + b.in + b.hold, endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Number counts up from 0 → target with a gentle ease-out.
  const tickerValue = interpolate(
    frame,
    [b.start + 8, b.start + 48],
    [0, SAVINGS_TARGET],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.2, 0.7, 0.2, 1),
    }
  );
  const tickerText = `$${tickerValue.toFixed(2)}`;

  // Section label fade
  const labelOpacity = interpolate(
    frame,
    [b.start, b.start + 12],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  // Subtitle fades in once the number is mostly there
  const subtitleOpacity = interpolate(
    frame,
    [b.start + 38, b.start + 55],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const subtitleDrift = interpolate(
    frame,
    [b.start + 38, b.start + 55],
    [14, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Context line fades in slightly after the subtitle
  const contextOpacity = interpolate(
    frame,
    [b.start + 48, b.start + 64],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Sparkline sweep
  const sparkProgress = interpolate(
    frame,
    [b.start + 20, b.start + 68],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
    }
  );

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
        }}
      >
        {/* Section label */}
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: palette.muted,
            opacity: labelOpacity,
          }}
        >
          § Savings · Auto-routing · This month
        </div>

        {/* The big number */}
        <div
          style={{
            fontFamily: fonts.serif,
            fontWeight: 500,
            fontSize: 280,
            lineHeight: 1,
            color: palette.ink,
            letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
          }}
        >
          {tickerText}
        </div>

        {/* Italic oxblood subtitle — matches 'shipping.' language */}
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: "italic",
            fontSize: 64,
            color: palette.accent,
            letterSpacing: "-0.015em",
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleDrift}px)`,
            fontVariationSettings: '"opsz" 72, "SOFT" 100, "wght" 340',
            lineHeight: 1,
          }}
        >
          saved on auto-routing.
        </div>

        {/* Context line — tells the user HOW */}
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: palette.muted,
            opacity: contextOpacity,
            display: "flex",
            gap: 24,
            alignItems: "center",
          }}
        >
          <span>428 runs</span>
          <span style={{ color: palette.hairline }}>·</span>
          <span>92% on lower tiers</span>
          <span style={{ color: palette.hairline }}>·</span>
          <span>zero quality loss</span>
        </div>

        {/* Sparkline */}
        <Sparkline progress={sparkProgress} />
      </div>
    </AbsoluteFill>
  );
};

// ── Sparkline ──────────────────────────────────────────────────────────────

const SPARK_POINTS = [
  0.80, 0.78, 0.82, 0.72, 0.70, 0.64, 0.58, 0.62, 0.55, 0.48,
  0.44, 0.40, 0.36, 0.32, 0.30, 0.28, 0.24, 0.20, 0.16, 0.14,
  0.12, 0.10, 0.08, 0.06, 0.05, 0.04, 0.03, 0.03, 0.02, 0.02,
];

const Sparkline: React.FC<{ progress: number }> = ({ progress }) => {
  const width = 960;
  const height = 140;
  const n = SPARK_POINTS.length;
  const dx = width / (n - 1);
  const path = SPARK_POINTS.map(
    (y, i) => `${i === 0 ? "M" : "L"} ${i * dx} ${y * height}`
  ).join(" ");

  return (
    <svg
      width={width}
      height={height + 28}
      viewBox={`0 0 ${width} ${height + 28}`}
      style={{ overflow: "visible", opacity: progress > 0.02 ? 1 : 0 }}
    >
      {/* Baseline (dashed hairline) — fades in with the sparkline */}
      <line
        x1={0}
        y1={SPARK_POINTS[0] * height}
        x2={width}
        y2={SPARK_POINTS[0] * height}
        stroke={palette.hairline}
        strokeWidth={1.5}
        strokeDasharray="4 6"
      />

      {/* Savings curve */}
      <path
        d={path}
        fill="none"
        stroke={palette.accent}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={2400}
        strokeDashoffset={2400 - progress * 2400}
      />

      {/* Endpoint dot lands on completion */}
      <circle
        cx={width}
        cy={SPARK_POINTS[SPARK_POINTS.length - 1] * height}
        r={progress > 0.95 ? 7 : 0}
        fill={palette.accent}
      />
    </svg>
  );
};
