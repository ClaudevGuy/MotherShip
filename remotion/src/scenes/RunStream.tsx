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

// Beat 8 — § Run stream (frames 570-630, 19-21s).
//
// A fast-scrolling feed of runs. Rows scroll upward continuously across
// ~2 seconds — you can't read individual rows, and that's the point. The
// impression is velocity: "this system is pumping thousands of runs a day
// and Mothership shows all of them."
//
// Top + bottom fade masks keep the edges elegant (rows don't hard-cut).

type Run = {
  time: string;
  agent: string;
  model: string;
  tokens: string;
  cost: string;
  status: "success" | "running" | "failed";
};

const RUNS: Run[] = [
  { time: "13:42:18", agent: "Security Scanner",    model: "Opus",   tokens: "2.4k", cost: "$0.0421", status: "running" },
  { time: "13:42:11", agent: "Code Reviewer",       model: "Sonnet", tokens: "1.1k", cost: "$0.0098", status: "success" },
  { time: "13:42:03", agent: "Docs Writer",         model: "Haiku",  tokens: "842",  cost: "$0.0006", status: "success" },
  { time: "13:41:57", agent: "Test Writer",         model: "Sonnet", tokens: "1.8k", cost: "$0.0162", status: "success" },
  { time: "13:41:49", agent: "Security Scanner",    model: "Opus",   tokens: "3.1k", cost: "$0.0544", status: "success" },
  { time: "13:41:42", agent: "Incident Responder",  model: "Opus",   tokens: "2.0k", cost: "$0.0351", status: "success" },
  { time: "13:41:35", agent: "Performance Optimizer", model: "Sonnet", tokens: "1.4k", cost: "$0.0126", status: "success" },
  { time: "13:41:28", agent: "Data Pipeline Agent", model: "Haiku",  tokens: "612",  cost: "$0.0004", status: "failed" },
  { time: "13:41:20", agent: "API Designer",        model: "Sonnet", tokens: "2.2k", cost: "$0.0198", status: "success" },
  { time: "13:41:14", agent: "Code Reviewer",       model: "Sonnet", tokens: "974",  cost: "$0.0088", status: "success" },
  { time: "13:41:08", agent: "Docs Writer",         model: "Haiku",  tokens: "532",  cost: "$0.0004", status: "success" },
  { time: "13:41:00", agent: "Test Writer",         model: "Sonnet", tokens: "2.0k", cost: "$0.0180", status: "success" },
  { time: "13:40:52", agent: "Security Scanner",    model: "Opus",   tokens: "2.7k", cost: "$0.0474", status: "success" },
];

const ROW_HEIGHT = 86;
const VISIBLE_ROWS = 7;

export const RunStream: React.FC = () => {
  const frame = useCurrentFrame();
  const b = beats.runStream;
  const endFrame = b.start + b.in + b.hold + b.out;

  if (frame < b.start - 1 || frame > endFrame + 1) return null;

  const fadeOut = interpolate(
    frame,
    [b.start + b.in + b.hold, endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Section label fade
  const labelOpacity = interpolate(
    frame,
    [b.start, b.start + 14],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  // Scroll offset — rows move upward. Scroll covers (RUNS.length - VISIBLE)
  // worth of rows over the active window, so the last few rows are visible
  // when the hold begins.
  const scrollDistance = (RUNS.length - VISIBLE_ROWS) * ROW_HEIGHT;
  const scroll = interpolate(
    frame,
    [b.start + 6, b.start + b.in + b.hold - 6],
    [0, scrollDistance],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.3, 0, 0.7, 1),
    }
  );

  const viewportHeight = VISIBLE_ROWS * ROW_HEIGHT;

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
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            opacity: labelOpacity,
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 22,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: palette.muted,
            }}
          >
            § Run stream
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              fontFamily: fonts.mono,
              fontSize: 18,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: palette.muted,
            }}
          >
            <StatusDot color="#047857" size={10} startFrame={b.start} />
            <span>4,218 runs today · Live</span>
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: palette.hairline,
            width: "100%",
          }}
        />

        {/* Scrolling viewport */}
        <div
          style={{
            position: "relative",
            height: viewportHeight,
            overflow: "hidden",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          <div
            style={{
              transform: `translateY(${-scroll}px)`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {RUNS.map((run, i) => (
              <RunRow key={i} run={run} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Row ────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Run["status"], string> = {
  success: "#047857",
  running: "#047857",
  failed: palette.accent,
};

const STATUS_LABELS: Record<Run["status"], string> = {
  success: "200",
  running: "RUN",
  failed: "500",
};

const RunRow: React.FC<{ run: Run }> = ({ run }) => (
  <div
    style={{
      height: ROW_HEIGHT,
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "0 12px",
      borderBottom: `1px solid ${palette.hairline}`,
    }}
  >
    {/* Time */}
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 17,
        color: palette.muted,
        width: 100,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {run.time}
    </span>

    {/* Status pill */}
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 13,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: STATUS_COLORS[run.status],
        padding: "6px 12px",
        borderRadius: 6,
        background:
          run.status === "failed"
            ? "rgba(200,53,36,0.08)"
            : "rgba(4,120,87,0.08)",
        border: `1px solid ${
          run.status === "failed"
            ? "rgba(200,53,36,0.25)"
            : "rgba(4,120,87,0.2)"
        }`,
        minWidth: 72,
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {STATUS_LABELS[run.status]}
    </span>

    {/* Agent name */}
    <span
      style={{
        fontFamily: fonts.serif,
        fontSize: 26,
        color: palette.ink,
        flex: 1,
        letterSpacing: "-0.01em",
        fontWeight: 500,
      }}
    >
      {run.agent}
    </span>

    {/* Model */}
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 14,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: palette.muted,
        width: 90,
        textAlign: "right",
      }}
    >
      {run.model}
    </span>

    {/* Tokens */}
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 20,
        color: palette.ink,
        width: 80,
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {run.tokens}
    </span>

    {/* Cost */}
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 20,
        color: palette.ink,
        width: 110,
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {run.cost}
    </span>
  </div>
);
