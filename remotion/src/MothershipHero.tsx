import React from "react";
import { AbsoluteFill } from "remotion";
import { PaperBg } from "./components/PaperBg";
import { MacroToken } from "./scenes/MacroToken";
import { Shipping } from "./scenes/Shipping";
import { Watching } from "./scenes/Watching";
import { AgentsPlate } from "./scenes/AgentsPlate";
import { LivePlate } from "./scenes/LivePlate";
import { WorkflowDAG } from "./scenes/WorkflowDAG";
import { RunStream } from "./scenes/RunStream";
import { DarkFlash } from "./scenes/DarkFlash";
import { SavingsPlate } from "./scenes/SavingsPlate";
import { Verbs } from "./scenes/Verbs";
import { Wordmark } from "./scenes/Wordmark";

// ════════════════════════════════════════════════════════════════════════════
// MOTHERSHIP — Landing Hero Loop
//
// 28s · 30fps · 1920×1080 · silent · seamless loop.
//
// Act I — Hook (0-8.5s)
//   MacroToken (cold-open dark terminal) → pulls out straight into:
//   Shipping · Watching
// Act II — Product walkthrough (8.5-20.5s)
//   AgentsPlate · LivePlate · WorkflowDAG · RunStream · DarkFlash
// Act III — Payoff + close (20.5-28s)
//   SavingsPlate · Verbs · Wordmark
//
// All scenes stack on the same frame clock. Each gates its own visibility
// around beats.<name> (single source of truth in theme.ts) and early-returns
// `null` outside its window to guarantee no leakage. Dark scenes
// (MacroToken, DarkFlash) paint their own charcoal layers on top of PaperBg
// and fade that layer out on exit, revealing the paper underneath — a free
// "reveal shot" at zero additional cost.
// ════════════════════════════════════════════════════════════════════════════
export const MothershipHero: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Paper + grain — the base layer, always present */}
      <PaperBg />

      {/* Eleven stacked scenes; each gates its own visibility by frame */}
      <MacroToken />
      <Shipping />
      <Watching />
      <AgentsPlate />
      <LivePlate />
      <WorkflowDAG />
      <RunStream />
      <DarkFlash />
      <SavingsPlate />
      <Verbs />
      <Wordmark />
    </AbsoluteFill>
  );
};
