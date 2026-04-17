import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// A small status dot with a continuous pulse halo — used in the product
// walkthrough plates to signal "running / live". The halo expands and fades
// on a 1-second cadence (2s at 30fps would be too slow for a 3s plate).
export type StatusDotProps = {
  color?: string;
  size?: number;
  startFrame?: number;
};

export const StatusDot: React.FC<StatusDotProps> = ({
  color = "#059669", // Emerald-600 — readable on cream paper
  size = 8,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Only pulse once the dot has entered. Loop the halo on a ~1s cadence.
  const localFrame = Math.max(0, frame - startFrame);
  const cycle = fps; // frames per pulse = 30 → 1Hz
  const phase = (localFrame % cycle) / cycle; // 0 → 1 each pulse

  const haloScale = interpolate(phase, [0, 1], [1, 2.6]);
  const haloOpacity = interpolate(phase, [0, 1], [0.55, 0]);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
      }}
    >
      {/* Halo ring */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          transform: `scale(${haloScale})`,
          opacity: haloOpacity,
        }}
      />
      {/* Solid core */}
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
        }}
      />
    </span>
  );
};
