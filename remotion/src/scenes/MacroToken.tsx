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

// Beat 1 — MacroToken (frames 0-60, 0-2s).
//
// Cold open. Near-black terminal. A blinking cursor. Giant monospace text
// types in: "> agent.run()". Neon LIVE chip in the top-left. CRT scanlines
// across everything. At ~frame 45, the camera pulls out (scale 1 → 0.4)
// while the dark layer fades to reveal the paper world below — the whole
// rest of the film.
//
// Establishes that Mothership is a LIVE system — the film starts inside a
// running process, then decompresses outward. Sets a cinematic contract.

const CODE_TEXT = "> agent.run()";
const TYPE_START_OFFSET = 8;
const TYPE_FRAMES_PER_CHAR = 1.8; // ~17Hz — feels decisive, not sluggish

export const MacroToken: React.FC = () => {
  const frame = useCurrentFrame();
  const b = beats.macroToken;
  const endFrame = b.start + b.in + b.hold + b.out;

  if (frame < b.start - 1 || frame > endFrame + 1) return null;

  // Typed text
  const typeStart = b.start + TYPE_START_OFFSET;
  const charsShown = Math.max(
    0,
    Math.floor((frame - typeStart) / TYPE_FRAMES_PER_CHAR)
  );
  const typed = CODE_TEXT.slice(0, Math.min(charsShown, CODE_TEXT.length));

  // Cursor blink (5-frame on / 5-frame off)
  const cursorOn = Math.floor(frame / 5) % 2 === 0;

  // Pull-out + fade at scene tail — the whole terminal stage scales down
  // (1.0 → 0.4) and fades its dark overlay so the paper world reveals.
  const exitStart = b.start + b.in + b.hold;
  const exitT = interpolate(frame, [exitStart, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 0.61, 0.36, 1),
  });
  const scale = interpolate(exitT, [0, 1], [1, 0.42]);
  const darkOpacity = interpolate(exitT, [0, 1], [1, 0]);

  // Soft breathe on the code text while typing — keeps it feeling alive
  const breathe = Math.sin((frame / 30) * Math.PI * 2) * 0.01 + 1;

  return (
    <AbsoluteFill>
      {/* Dark charcoal stage — the inverse of the paper bg underneath */}
      <AbsoluteFill
        style={{
          backgroundColor: "#0b0b11",
          opacity: darkOpacity,
        }}
      />

      {/* CRT scanlines for that hardware-feels-old polish */}
      <AbsoluteFill
        style={{
          opacity: darkOpacity * 0.5,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
          pointerEvents: "none",
        }}
      />

      {/* Radial vignette — focuses attention center-stage */}
      <AbsoluteFill
        style={{
          opacity: darkOpacity,
          background:
            "radial-gradient(ellipse 1200px 700px at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Everything below scales out together at the end */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale * breathe})`,
          opacity: darkOpacity,
        }}
      >
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
            background: "rgba(57,255,20,0.08)",
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
            Live
          </span>
        </div>

        {/* Top-right session header */}
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 72,
            fontFamily: fonts.mono,
            fontSize: 16,
            letterSpacing: "0.22em",
            color: "rgba(245,241,232,0.45)",
            textTransform: "uppercase",
          }}
        >
          session · 0421 · tier 2
        </div>

        {/* Giant centered code — the film's opening shot */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 140,
              fontWeight: 500,
              color: "#f5f1e8",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {typed}
            {cursorOn && (
              <span
                style={{
                  display: "inline-block",
                  width: 58,
                  height: 140,
                  background: "#39FF14",
                  marginLeft: 8,
                  verticalAlign: "text-bottom",
                  boxShadow: "0 0 24px rgba(57,255,20,0.6)",
                }}
              />
            )}
          </div>
        </AbsoluteFill>

        {/* Bottom tabular telemetry — keeps the frame from feeling empty */}
        <div
          style={{
            position: "absolute",
            bottom: 72,
            left: 72,
            right: 72,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: fonts.mono,
            fontSize: 15,
            letterSpacing: "0.24em",
            color: "rgba(245,241,232,0.35)",
            textTransform: "uppercase",
          }}
        >
          <span>Cost · $0.0000</span>
          <span>Tokens · 0</span>
          <span>Latency · 0ms</span>
          <span>claude-sonnet-4-6</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
