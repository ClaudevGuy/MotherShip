import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { fonts } from "../fonts";
import { palette, beats } from "../theme";

// Beat 2 — Shipping (frames 75-180).
//
// The first real headline. "Your agents are shipping." in Fraunces display,
// with "shipping" set in italic + oxblood so the word pops as a verb-of-the-
// year. Each word reveals on its own micro-timeline — staggered fade + 6px
// upward drift — which reads as type "settling onto the page" rather than
// type "animating in".

type WordSpec = {
  text: string;
  /** italic + oxblood display treatment */
  accent?: boolean;
  /** when this word begins revealing, offset from the beat start */
  offset: number;
};

const WORDS: WordSpec[] = [
  { text: "Your",     offset: 5 },
  { text: "agents",   offset: 20 },
  { text: "are",      offset: 35 },
  { text: "shipping", offset: 50, accent: true },
];

const REVEAL_FRAMES = 18;

export const Shipping: React.FC = () => {
  const frame = useCurrentFrame();
  const b = beats.shipping;
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
        padding: "0 10%",
      }}
    >
      <h1
        style={{
          margin: 0,
          color: palette.ink,
          fontFamily: fonts.serif,
          fontWeight: 400,
          fontSize: 168,
          lineHeight: 1.02,
          letterSpacing: "-0.028em",
          textAlign: "center",
          // Fraunces variable axes — render for display at large optical size.
          fontVariationSettings: '"opsz" 144, "SOFT" 100',
        }}
      >
        {WORDS.map((w, i) => {
          const localStart = b.start + w.offset;
          const opacity = interpolate(
            frame,
            [localStart, localStart + REVEAL_FRAMES],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }
          );
          const drift = interpolate(
            frame,
            [localStart, localStart + REVEAL_FRAMES],
            [12, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }
          );

          const accentStyle: React.CSSProperties = w.accent
            ? {
                fontStyle: "italic",
                color: palette.accent,
                fontVariationSettings: '"opsz" 144, "SOFT" 100, "wght" 320',
              }
            : {};

          return (
            <React.Fragment key={i}>
              {i > 0 && " "}
              <span
                style={{
                  display: "inline-block",
                  opacity,
                  transform: `translateY(${drift}px)`,
                  ...accentStyle,
                }}
              >
                {w.text}
              </span>
            </React.Fragment>
          );
        })}
        {/* Trailing period matches last word's color for a clean cadence. */}
        <span
          style={{
            color: palette.ink,
            display: "inline-block",
            opacity: interpolate(
              frame,
              [b.start + WORDS[WORDS.length - 1].offset + REVEAL_FRAMES - 4, b.start + WORDS[WORDS.length - 1].offset + REVEAL_FRAMES + 4],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          .
        </span>
      </h1>
    </AbsoluteFill>
  );
};
