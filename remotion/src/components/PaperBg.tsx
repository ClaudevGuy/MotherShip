import React from "react";
import { AbsoluteFill } from "remotion";
import { palette } from "../theme";

// Paper background layer:
//   1. Solid cream fill
//   2. Soft radial "ambient" pool near the top — mimics page lighting
//   3. Subtle SVG feTurbulence grain — the texture that keeps the paper
//      from looking flat/plastic on a retina display
//
// All three are static (no frame dependency) so React can render this once
// and Remotion caches it across frames.
export const PaperBg: React.FC = () => {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: palette.paper }} />

      {/* Ambient warm highlight near top-center */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 1400px 700px at 50% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%)",
          mixBlendMode: "screen",
          opacity: 0.9,
        }}
      />

      {/* Paper grain — SVG turbulence for uncoated-stock feel */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.28,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      >
        <defs>
          <filter id="paper-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.06  0 0 0 0 0.06  0 0 0 0 0.05  0 0 0 0.18 0"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>
    </AbsoluteFill>
  );
};
