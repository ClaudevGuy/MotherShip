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
import { StatusDot } from "../components/StatusDot";
import { HairlineRule } from "../components/HairlineRule";

// Beat 5 — § Live run (frames 380-480, 12.7-16s).
//
// The "product in motion" plate. A stylized execution card:
//   · Agent name + running dot at top
//   · Tokens stream in character-by-character — the Mothership signature
//   · Cost ticker counts up in tabular-nums
//   · TIER 2 badge lands with a spring
//   · Tokens in/out counters below the stream
//
// Streaming is deterministic (frame-based slice) — pixel-identical on every
// render, no randomness.

const STREAM_TEXT =
  "Scanning auth layer for vulns…\nFound 3 issues — missing CSRF tokens, exposed JWT secret.";

const STREAM_START_OFFSET = 10;   // frames from beat.start until typing begins
const STREAM_CHARS_PER_FRAME = 4; // ~120 chars/sec — snappier, cinematic
const COST_START = 0;
const COST_END = 0.0421;
const TOKENS_IN_END = 842;
const TOKENS_OUT_END = 1204;

export const LivePlate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = beats.livePlate;
  const endFrame = b.start + b.in + b.hold + b.out;

  if (frame < b.start - 1 || frame > endFrame + 1) return null;

  const fadeOut = interpolate(
    frame,
    [b.start + b.in + b.hold, endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Card entrance spring
  const cardSpring = spring({
    fps,
    frame: frame - b.start,
    config: { damping: 24, stiffness: 110, mass: 0.9 },
  });
  const cardOpacity = interpolate(frame, [b.start, b.start + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle camera push-in across the scene — adds a "we're leaning in to
  // watch" energy without ever calling attention to itself.
  const cameraPush = interpolate(
    frame,
    [b.start, b.start + b.in + b.hold],
    [1.0, 1.035],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Streaming text
  const streamStartFrame = b.start + STREAM_START_OFFSET;
  const charsVisible = Math.max(
    0,
    Math.floor((frame - streamStartFrame) * STREAM_CHARS_PER_FRAME)
  );
  const streamedText = STREAM_TEXT.slice(
    0,
    Math.min(charsVisible, STREAM_TEXT.length)
  );
  const streamingInProgress =
    charsVisible > 0 && charsVisible < STREAM_TEXT.length;

  // Blinking cursor while typing
  const cursorPhase = Math.floor(frame / 6) % 2;
  const showCursor = streamingInProgress && cursorPhase === 0;

  // Cost + tokens tickers
  const tickerEnd = b.start + b.in + b.hold;
  const cost = interpolate(
    frame,
    [streamStartFrame, tickerEnd],
    [COST_START, COST_END],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const tokensIn = interpolate(
    frame,
    [streamStartFrame, tickerEnd],
    [0, TOKENS_IN_END],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const tokensOut = interpolate(
    frame,
    [streamStartFrame, tickerEnd],
    [0, TOKENS_OUT_END],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const costText = `$${cost.toFixed(4)}`;

  // Tier badge
  const badgeDelay = 20;
  const badgeSpring = spring({
    fps,
    frame: frame - (b.start + badgeDelay),
    config: { damping: 12, stiffness: 180, mass: 0.6 },
  });
  const badgeOpacity = interpolate(
    frame,
    [b.start + badgeDelay, b.start + badgeDelay + 14],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Footer tokens counters fade in once stream has begun
  const footerOpacity = interpolate(
    frame,
    [streamStartFrame + 6, streamStartFrame + 22],
    [0, 1],
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
          width: 1440,
          background: palette.paperLift,
          borderRadius: 18,
          border: `1px solid ${palette.hairline}`,
          boxShadow:
            "0 1px 0 rgba(14,14,14,0.02), 0 18px 56px rgba(14,14,14,0.06)",
          opacity: cardOpacity,
          transform: `translateY(${(1 - cardSpring) * 20}px) scale(${cameraPush})`,
          transformOrigin: "center center",
          overflow: "hidden",
        }}
      >
        {/* Header strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "26px 36px",
            borderBottom: `1px solid ${palette.hairline}`,
          }}
        >
          <StatusDot startFrame={b.start + 4} size={12} />
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 20,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: palette.muted,
            }}
          >
            Live · Security Scanner · Run 0421
          </div>
          <div style={{ flex: 1 }} />

          {/* Cost ticker */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 26,
              color: palette.ink,
              fontVariantNumeric: "tabular-nums",
              display: "inline-flex",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <span
              style={{
                color: palette.muted,
                letterSpacing: "0.22em",
                fontSize: 16,
                textTransform: "uppercase",
              }}
            >
              Cost
            </span>
            <span>{costText}</span>
          </div>

          {/* Tier badge */}
          <div
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: `1.5px solid ${palette.accent}`,
              background: "rgba(200,53,36,0.06)",
              color: palette.accent,
              fontFamily: fonts.mono,
              fontSize: 18,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              opacity: badgeOpacity,
              transform: `scale(${0.85 + badgeSpring * 0.15})`,
            }}
          >
            Tier 2
          </div>
        </div>

        {/* Streaming body */}
        <div
          style={{
            padding: "40px 40px 20px",
            minHeight: 260,
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 34,
              lineHeight: 1.5,
              color: palette.ink,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <span style={{ color: palette.muted }}>&gt; </span>
            {streamedText}
            {showCursor && (
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 36,
                  background: palette.ink,
                  marginLeft: 3,
                  verticalAlign: "text-bottom",
                }}
              />
            )}
          </div>

          {/* Progress rule under the stream */}
          <div style={{ marginTop: 28 }}>
            <HairlineRule
              startFrame={streamStartFrame}
              durationFrames={Math.ceil(
                STREAM_TEXT.length / STREAM_CHARS_PER_FRAME
              )}
              origin="left"
              width="100%"
              color={palette.accent}
              thickness={2}
              opacity={0.7}
            />
          </div>
        </div>

        {/* Footer — token counters */}
        <div
          style={{
            display: "flex",
            gap: 48,
            padding: "22px 40px 28px",
            opacity: footerOpacity,
          }}
        >
          <TokenStat label="Tokens In" value={Math.floor(tokensIn)} />
          <TokenStat label="Tokens Out" value={Math.floor(tokensOut)} />
          <TokenStat label="Duration" value={formatDuration(frame - streamStartFrame, fps)} isText />
          <TokenStat label="Model" value="claude-sonnet-4-6" isText />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const TokenStat: React.FC<{
  label: string;
  value: number | string;
  isText?: boolean;
}> = ({ label, value, isText }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 13,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: palette.muted,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 26,
        color: palette.ink,
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1,
      }}
    >
      {isText ? value : (value as number).toLocaleString()}
    </span>
  </div>
);

function formatDuration(frameDelta: number, fps: number): string {
  if (frameDelta <= 0) return "0.0s";
  const seconds = frameDelta / fps;
  return `${seconds.toFixed(1)}s`;
}
