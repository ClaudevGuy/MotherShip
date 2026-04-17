import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { fonts } from "../fonts";
import { palette, beats } from "../theme";

// Beat 3 — Watching (frames 180-270).
//
// Same typographic language as Shipping, different verb. "This is where
// you start watching." — "watching" in italic oxblood, and the trailing
// period is ALSO oxblood (the landing page's signature .accent-dot move).

type WordSpec = {
  text: string;
  accent?: boolean;
  /** color-only accent — italic stays in ink */
  accentDot?: boolean;
  offset: number;
};

// Laid out on two lines for balance: "This is where you start" / "watching."
const LINE_1: WordSpec[] = [
  { text: "This",  offset: 5 },
  { text: "is",    offset: 14 },
  { text: "where", offset: 23 },
  { text: "you",   offset: 32 },
  { text: "start", offset: 41 },
];

const LINE_2: WordSpec[] = [
  { text: "watching", offset: 54, accent: true },
];

const REVEAL_FRAMES = 16;

export const Watching: React.FC = () => {
  const frame = useCurrentFrame();
  const b = beats.watching;
  const endFrame = b.start + b.in + b.hold + b.out;

  if (frame < b.start - 1 || frame > endFrame + 1) return null;

  const fadeOut = interpolate(
    frame,
    [b.start + b.in + b.hold, b.start + b.in + b.hold + b.out],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const renderWord = (w: WordSpec, key: number, showLeadingSpace: boolean) => {
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
      [10, 0],
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
      <React.Fragment key={key}>
        {showLeadingSpace && " "}
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
  };

  // Period color — oxblood dot after "watching", matches landing .accent-dot
  const dotStart = b.start + LINE_2[0].offset + REVEAL_FRAMES - 4;
  const dotOpacity = interpolate(
    frame,
    [dotStart, dotStart + 10],
    [0, 1],
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
          fontSize: 132,
          lineHeight: 1.04,
          letterSpacing: "-0.026em",
          textAlign: "center",
          fontVariationSettings: '"opsz" 144, "SOFT" 100',
        }}
      >
        <div>{LINE_1.map((w, i) => renderWord(w, i, i > 0))}</div>
        <div>
          {LINE_2.map((w, i) => renderWord(w, i, false))}
          <span
            style={{
              display: "inline-block",
              color: palette.accent,
              fontStyle: "italic",
              opacity: dotOpacity,
              fontVariationSettings: '"opsz" 144, "SOFT" 100',
            }}
          >
            .
          </span>
        </div>
      </h1>
    </AbsoluteFill>
  );
};
