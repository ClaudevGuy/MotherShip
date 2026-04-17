import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fonts } from "../fonts";
import { palette, beats } from "../theme";
import { HairlineRule } from "../components/HairlineRule";

// Beat 5 — Wordmark (frames 390-450, 13-15s).
//
// Closing plate. The MOTHERSHIP wordmark scales in (spring), an oxblood
// accent dot stamps immediately after, the mono tagline "AI · OPERATIONS"
// fades in below, and a hairline rule draws under the whole stack.
//
// The final 15 frames fade everything back down to paper so the loop is
// seamless when used as an autoplaying landing hero loop.
export const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = beats.wordmark;
  const endFrame = b.start + b.in + b.hold + b.out;

  if (frame < b.start - 1 || frame > endFrame + 1) return null;

  // Wordmark — springs in at beat start, 400 → 560 size
  const wordmarkScale = spring({
    fps,
    frame: frame - b.start,
    config: { damping: 16, stiffness: 90, mass: 0.9 },
  });
  const wordmarkOpacity = interpolate(
    frame,
    [b.start, b.start + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Oxblood accent dot — lands ~6 frames after the wordmark with a subtle
  // overshoot to feel like a rubber stamp.
  const dotAppear = spring({
    fps,
    frame: frame - (b.start + 6),
    config: { damping: 8, stiffness: 200, mass: 0.5 },
  });

  // Tagline — fades in after the wordmark settles
  const taglineOpacity = interpolate(
    frame,
    [b.start + 18, b.start + 34],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
  const taglineDrift = interpolate(
    frame,
    [b.start + 18, b.start + 34],
    [8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Final fade-out of the whole scene so the loop joins back to paper.
  const fadeOut = interpolate(
    frame,
    [b.start + b.in + b.hold, b.start + b.in + b.hold + b.out],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
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
          gap: 28,
        }}
      >
        {/* Wordmark row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            opacity: wordmarkOpacity,
            transform: `scale(${0.92 + wordmarkScale * 0.08})`,
            transformOrigin: "center center",
          }}
        >
          <span
            style={{
              fontFamily: fonts.serif,
              fontWeight: 600,
              fontSize: 140,
              letterSpacing: "-0.04em",
              color: palette.ink,
              lineHeight: 1,
              fontVariationSettings: '"opsz" 144, "SOFT" 0',
            }}
          >
            MOTHERSHIP
          </span>
          <span
            style={{
              fontFamily: fonts.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 140,
              color: palette.accent,
              lineHeight: 1,
              opacity: dotAppear,
              transform: `scale(${0.6 + dotAppear * 0.4})`,
              transformOrigin: "left bottom",
              fontVariationSettings: '"opsz" 144, "SOFT" 100',
            }}
          >
            .
          </span>
        </div>

        {/* Hairline rule under the wordmark */}
        <HairlineRule
          startFrame={b.start + 14}
          durationFrames={20}
          origin="center"
          width="28%"
          color={palette.hairline}
        />

        {/* Tagline */}
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 24,
            letterSpacing: "0.48em",
            textTransform: "uppercase",
            color: palette.muted,
            opacity: taglineOpacity,
            transform: `translateY(${taglineDrift}px)`,
          }}
        >
          AI · Operations
        </div>
      </div>
    </AbsoluteFill>
  );
};
