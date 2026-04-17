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

// Beat 4 — Verbs (frames 270-390, 9-13s).
//
// Rapid-fire triptych: §01 Build · §02 Run · §03 Evaluate.
// Each plate gets a small monospace section number (the landing's §01 move),
// a hairline tick, then the verb in Fraunces italic oxblood.
//
// Each plate springs in ~10 frames apart, so all three are on screen together
// by frame ~330 and hold until the beat exits.

const PLATES = [
  { num: "§01", verb: "Build." },
  { num: "§02", verb: "Run." },
  { num: "§03", verb: "Evaluate." },
];

// Plate appearance offsets, in frames, from beat.start
const OFFSETS = [5, 25, 45];

export const Verbs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = beats.verbs;
  const endFrame = b.start + b.in + b.hold + b.out;

  if (frame < b.start - 1 || frame > endFrame + 1) return null;

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
          gap: 128,
          alignItems: "flex-start",
        }}
      >
        {PLATES.map((p, i) => {
          const localStart = b.start + OFFSETS[i];

          const s = spring({
            fps,
            frame: frame - localStart,
            config: { damping: 20, stiffness: 120, mass: 0.8 },
          });
          const opacity = interpolate(
            frame,
            [localStart, localStart + 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Hairline tick sweeps from 0 to full width during appearance.
          const tickScale = interpolate(
            frame,
            [localStart + 4, localStart + 22],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 0.61, 0.36, 1),
            }
          );

          return (
            <div
              key={p.num}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
                opacity,
                transform: `translateY(${(1 - s) * 14}px)`,
              }}
            >
              {/* Section number — monospace, tracked */}
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 20,
                  letterSpacing: "0.34em",
                  color: palette.muted,
                  textTransform: "uppercase",
                }}
              >
                {p.num}
              </div>

              {/* Hairline tick */}
              <div
                style={{
                  width: 64,
                  height: 1,
                  background: palette.hairline,
                  transform: `scaleX(${tickScale})`,
                  transformOrigin: "center",
                }}
              />

              {/* The verb */}
              <div
                style={{
                  fontFamily: fonts.serif,
                  fontStyle: "italic",
                  color: palette.accent,
                  fontSize: 96,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  fontVariationSettings: '"opsz" 144, "SOFT" 100, "wght" 320',
                }}
              >
                {p.verb}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
