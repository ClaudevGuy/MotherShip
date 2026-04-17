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

// Beat 7 — § Workflow (frames 495-570, 16.5-19s).
//
// A node graph builds itself in view: three circular agents wire themselves
// into a pipeline, then 4 data "particles" (small oxblood circles) travel
// down the wires in succession. The actual Mothership workflow builder
// distilled to its essence: agents chained together, data moving between.
//
// Positions are chosen so the graph is balanced, left-to-right reading.
// The edges curve slightly (cubic Bezier) to feel hand-drawn instead of
// engineering-diagram stiff.

type NodeSpec = {
  id: string;
  x: number;
  y: number;
  label: string;
  hint: string;
  appearFrame: number;
};

const NODES: NodeSpec[] = [
  { id: "scan",   x: 340,  y: 540, label: "Scanner",  hint: "Claude · Opus",   appearFrame: 8  },
  { id: "review", x: 960,  y: 420, label: "Reviewer", hint: "Claude · Sonnet", appearFrame: 20 },
  { id: "deploy", x: 1580, y: 540, label: "Deploy",   hint: "Claude · Haiku",  appearFrame: 32 },
];

type EdgeSpec = {
  from: string;
  to: string;
  appearFrame: number;
};

const EDGES: EdgeSpec[] = [
  { from: "scan",   to: "review", appearFrame: 16 },
  { from: "review", to: "deploy", appearFrame: 28 },
];

// Data particles — released in succession so the pipeline visibly pumps
const PARTICLES = [
  { start: 40, edgeIndex: 0 },
  { start: 46, edgeIndex: 0 },
  { start: 52, edgeIndex: 1 },
  { start: 58, edgeIndex: 1 },
];

const NODE_RADIUS = 58;
const PARTICLE_TRAVEL_FRAMES = 18;

export const WorkflowDAG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = beats.workflowDAG;
  const endFrame = b.start + b.in + b.hold + b.out;

  if (frame < b.start - 1 || frame > endFrame + 1) return null;

  const fadeOut = interpolate(
    frame,
    [b.start + b.in + b.hold, endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const labelOpacity = interpolate(frame, [b.start, b.start + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Section label — top-left, consistent with other § plates */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: palette.muted,
            opacity: labelOpacity,
          }}
        >
          § Workflow · Chain your agents
        </div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: "italic",
            fontSize: 32,
            color: palette.ink,
            letterSpacing: "-0.01em",
            opacity: labelOpacity,
            fontVariationSettings: '"opsz" 72, "SOFT" 100, "wght" 340',
          }}
        >
          Pipelines with step-level replay.
        </div>
      </div>

      {/* The graph itself — an SVG so paths + dots share one coordinate system */}
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Edges — drawn first so nodes sit on top */}
        {EDGES.map((e, i) => {
          const a = nodeById[e.from];
          const bNode = nodeById[e.to];
          const path = curvedPath(a, bNode);

          const progress = interpolate(
            frame,
            [b.start + e.appearFrame, b.start + e.appearFrame + 18],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 0.61, 0.36, 1),
            }
          );

          // Rough path length for the strokeDashoffset trick (over-estimate
          // is fine — we just want a clean draw-on sweep).
          const approxLen = 2000;

          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={palette.accent}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={approxLen}
              strokeDashoffset={approxLen - progress * approxLen}
              opacity={0.8}
            />
          );
        })}

        {/* Data particles — each one travels its edge once */}
        {PARTICLES.map((p, i) => {
          const e = EDGES[p.edgeIndex];
          const a = nodeById[e.from];
          const bNode = nodeById[e.to];
          const t = interpolate(
            frame,
            [b.start + p.start, b.start + p.start + PARTICLE_TRAVEL_FRAMES],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          if (t <= 0 || t >= 1) return null;
          const pos = interpolateAlongCurve(a, bNode, t);
          return (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r={7}
              fill={palette.accent}
              opacity={interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0])}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((n) => {
          const enterSpring = spring({
            fps,
            frame: frame - (b.start + n.appearFrame),
            config: { damping: 14, stiffness: 140, mass: 0.7 },
          });
          const opacity = interpolate(
            frame,
            [b.start + n.appearFrame, b.start + n.appearFrame + 14],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <g
              key={n.id}
              transform={`translate(${n.x}, ${n.y}) scale(${0.5 + enterSpring * 0.5})`}
              opacity={opacity}
            >
              {/* Soft shadow */}
              <circle
                r={NODE_RADIUS}
                fill="rgba(14,14,14,0.08)"
                transform="translate(0, 6)"
              />
              {/* Card */}
              <circle
                r={NODE_RADIUS}
                fill={palette.paperLift}
                stroke={palette.hairline}
                strokeWidth={1.5}
              />
              {/* Bot glyph inside */}
              <g transform="translate(-16, -16)" fill="none" stroke={palette.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <rect x={4} y={7} width={24} height={18} rx={4} />
                <path d="M16 7V2M10 2h12" />
                <circle cx={12} cy={15} r={1.2} fill={palette.ink} />
                <circle cx={20} cy={15} r={1.2} fill={palette.ink} />
              </g>
            </g>
          );
        })}

        {/* Node labels — rendered as separate text layer below each node */}
        {NODES.map((n) => {
          const opacity = interpolate(
            frame,
            [b.start + n.appearFrame + 6, b.start + n.appearFrame + 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <g key={`lbl-${n.id}`} opacity={opacity}>
              <text
                x={n.x}
                y={n.y + NODE_RADIUS + 46}
                textAnchor="middle"
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 38,
                  fontWeight: 500,
                  fill: palette.ink,
                  letterSpacing: "-0.01em",
                }}
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + NODE_RADIUS + 78}
                textAnchor="middle"
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 15,
                  letterSpacing: "0.18em",
                  fill: palette.muted,
                  textTransform: "uppercase",
                }}
              >
                {n.hint}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── Path math ───────────────────────────────────────────────────────────────

// A gentle cubic bezier from A to B — control points pulled toward the midline
// so edges arc naturally between nodes of different heights.
function curvedPath(a: NodeSpec, b: NodeSpec): string {
  const midY = (a.y + b.y) / 2;
  const c1x = a.x + (b.x - a.x) * 0.4;
  const c1y = midY;
  const c2x = a.x + (b.x - a.x) * 0.6;
  const c2y = midY;
  return `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;
}

// Cubic bezier point evaluation — gives us a particle's (x,y) at t in [0,1].
function interpolateAlongCurve(a: NodeSpec, bNode: NodeSpec, t: number) {
  const midY = (a.y + bNode.y) / 2;
  const c1x = a.x + (bNode.x - a.x) * 0.4;
  const c1y = midY;
  const c2x = a.x + (bNode.x - a.x) * 0.6;
  const c2y = midY;
  const u = 1 - t;
  const x =
    u * u * u * a.x +
    3 * u * u * t * c1x +
    3 * u * t * t * c2x +
    t * t * t * bNode.x;
  const y =
    u * u * u * a.y +
    3 * u * u * t * c1y +
    3 * u * t * t * c2y +
    t * t * t * bNode.y;
  return { x, y };
}
