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

// Beat 4 — § Agents (frames 270-380, 9-12.7s).
//
// First plate of the product walkthrough. Three agent rows land one after
// another like ledger entries on a page. Each row is a compact signature
// of the real /agents list: bot glyph, editorial name + description, model
// pill, live dot, tokens today, cost per hour.
//
// Deliberately NOT a screenshot — the dashboard translated onto paper,
// matching the film's editorial grammar.

type Agent = {
  name: string;
  description: string;
  model: string;
  status: "running" | "idle";
  tokens: string;
  cost: string;
  offset: number; // frames after beat.start when this row enters
};

const AGENTS: Agent[] = [
  { name: "Security Scanner",  description: "Reviews code for vulnerabilities", model: "Claude · Opus",   status: "running", tokens: "128k", cost: "$1.24/hr", offset: 6  },
  { name: "Code Reviewer",     description: "Surfaces bugs before production",  model: "Claude · Sonnet", status: "running", tokens: "74k",  cost: "$0.42/hr", offset: 24 },
  { name: "Incident Responder",description: "Triages pages and drafts fixes",   model: "Claude · Opus",   status: "running", tokens: "36k",  cost: "$0.88/hr", offset: 42 },
];

export const AgentsPlate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = beats.agentsPlate;
  const endFrame = b.start + b.in + b.hold + b.out;

  if (frame < b.start - 1 || frame > endFrame + 1) return null;

  const fadeOut = interpolate(
    frame,
    [b.start + b.in + b.hold, endFrame],
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
          flexDirection: "column",
          alignItems: "stretch",
          gap: 28,
          width: 1340,
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <SectionLabel label="§ Agents" beatStart={b.start} delay={0} />
          <SectionSubhead beatStart={b.start} delay={8} />
        </div>

        {/* Hairline under the header */}
        <HairlineRule
          startFrame={b.start + 2}
          durationFrames={22}
          origin="left"
          width="100%"
        />

        {/* Agent rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {AGENTS.map((a, i) => {
            const localStart = b.start + a.offset;

            const enterSpring = spring({
              fps,
              frame: frame - localStart,
              config: { damping: 22, stiffness: 120, mass: 0.9 },
            });
            const opacity = interpolate(
              frame,
              [localStart, localStart + 18],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  padding: "28px 36px",
                  background: palette.paperLift,
                  borderRadius: 16,
                  border: `1px solid ${palette.hairline}`,
                  opacity,
                  transform: `translateY(${(1 - enterSpring) * 18}px)`,
                  boxShadow:
                    "0 1px 0 rgba(14,14,14,0.02), 0 14px 40px rgba(14,14,14,0.05)",
                }}
              >
                <BotGlyph />

                {/* Name + description */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontFamily: fonts.serif,
                      fontSize: 48,
                      fontWeight: 500,
                      color: palette.ink,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      fontVariationSettings: '"opsz" 72, "SOFT" 50',
                    }}
                  >
                    {a.name}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 20,
                      color: palette.muted,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {a.description}
                  </div>
                </div>

                {/* Model pill */}
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 18,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: palette.muted,
                    padding: "10px 18px",
                    borderRadius: 999,
                    border: `1px solid ${palette.hairline}`,
                    background: palette.paper,
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.model}
                </span>

                {/* Status dot + label */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    color: "#047857",
                    fontFamily: fonts.mono,
                    fontSize: 18,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                  }}
                >
                  <StatusDot startFrame={localStart + 6} size={10} />
                  Running
                </div>

                {/* Tokens */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                    width: 120,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 12,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: palette.muted,
                    }}
                  >
                    Tokens
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 30,
                      color: palette.ink,
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                    }}
                  >
                    {a.tokens}
                  </span>
                </div>

                {/* Cost */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                    width: 140,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 12,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: palette.muted,
                    }}
                  >
                    Cost/hr
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 30,
                      color: palette.ink,
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                    }}
                  >
                    {a.cost}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{
  label: string;
  beatStart: number;
  delay: number;
}> = ({ label, beatStart, delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [beatStart + delay, beatStart + delay + 14],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: 22,
        letterSpacing: "0.38em",
        textTransform: "uppercase",
        color: palette.muted,
        opacity,
      }}
    >
      {label}
    </div>
  );
};

const SectionSubhead: React.FC<{ beatStart: number; delay: number }> = ({
  beatStart,
  delay,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [beatStart + delay, beatStart + delay + 14],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
  return (
    <div
      style={{
        fontFamily: fonts.serif,
        fontStyle: "italic",
        fontSize: 30,
        color: palette.ink,
        letterSpacing: "-0.01em",
        opacity,
        fontVariationSettings: '"opsz" 72, "SOFT" 100, "wght" 340',
      }}
    >
      3 running · 238k tokens today
    </div>
  );
};

const BotGlyph: React.FC = () => (
  <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={palette.ink} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="7" width="16" height="12" rx="3" />
    <path d="M12 7V3M8 3h8" />
    <circle cx="9" cy="13" r="1" fill={palette.ink} />
    <circle cx="15" cy="13" r="1" fill={palette.ink} />
  </svg>
);
