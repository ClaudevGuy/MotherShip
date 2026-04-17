import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { palette } from "../theme";

// The signature editorial hairline — a horizontal 1px rule that can sweep
// in from the center or from an edge. Used repeatedly as a punctuation
// device throughout the film.
//
// Props:
//   startFrame: when the sweep begins
//   durationFrames: how long the full reveal takes
//   origin: where the rule grows from
//   width: % width when fully revealed (e.g. "72%", "420px")
//   color: defaults to palette.hairline
export type HairlineRuleProps = {
  startFrame: number;
  durationFrames: number;
  origin?: "center" | "left" | "right";
  width?: string | number;
  color?: string;
  thickness?: number;
  opacity?: number;
};

export const HairlineRule: React.FC<HairlineRuleProps> = ({
  startFrame,
  durationFrames,
  origin = "center",
  width = "48%",
  color = palette.hairline,
  thickness = 1,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();

  // 0 → 1 progress across the reveal window, clamped at both ends.
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 0.61, 0.36, 1), // tight in, gentle finish
    }
  );

  const transformOrigin =
    origin === "center" ? "center" : origin === "left" ? "left" : "right";

  return (
    <div
      style={{
        height: thickness,
        width,
        background: color,
        transform: `scaleX(${progress})`,
        transformOrigin,
        opacity,
      }}
    />
  );
};
