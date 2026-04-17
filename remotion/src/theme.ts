// ════════════════════════════════════════════════════════════════════════════
// Editorial palette — mirrors mission-control/src/app/globals.css .light block,
// which in turn mirrors landing/index.html. Keep these in lock-step so the
// hero video always matches the page it sits on top of.
// ════════════════════════════════════════════════════════════════════════════

export const palette = {
  paper: "#f5f1e8",      // Warm uncoated paper (background)
  paperLift: "#faf6ec",  // Slightly whiter — card stock
  ink: "#0e0e0e",        // Printed ink
  inkSoft: "#2a2a2a",    // Half-tone
  muted: "#7a7465",      // Editorial gray
  hairline: "#d4ccbc",   // Rule color
  accent: "#c83524",     // Oxblood — the only non-monochrome voice
} as const;

// Frame arithmetic — change FPS here and every scene adapts.
export const timing = {
  fps: 30,
  durationInFrames: 840, // 28s
} as const;

// Common eased interpolation windows (in frames).
// "in": fade-in window. "hold": dwell. "out": fade-out window.
// A beat is [start, start+in, start+in+hold, start+in+hold+out].
export type Beat = {
  start: number;
  in: number;
  hold: number;
  out: number;
};

// The eleven beats of the film.
//
// Act I — Hook (0-8.5s) · cold-open terminal pulls out straight into the
//   main typographic headlines. MacroToken does the brand-establishment
//   work, so no separate masthead is needed.
//   macroToken · shipping · watching
// Act II — Product walkthrough (8.5-20.5s) · rhythmic variety — cards,
//   live stream, node graph, fast scroll, shock cut to dark
//   agentsPlate · livePlate · workflowDAG · runStream · darkFlash
// Act III — Payoff + close (20.5-28s)
//   savingsPlate · verbs · wordmark
export const beats: Record<
  | "macroToken"
  | "shipping"
  | "watching"
  | "agentsPlate"
  | "livePlate"
  | "workflowDAG"
  | "runStream"
  | "darkFlash"
  | "savingsPlate"
  | "verbs"
  | "wordmark",
  Beat
> = {
  macroToken:    { start: 0,   in: 30, hold: 15, out: 15 }, // 0-60     (2s)
  shipping:      { start: 60,  in: 75, hold: 15, out: 15 }, // 60-165   (3.5s)
  watching:      { start: 165, in: 65, hold: 15, out: 10 }, // 165-255  (3s)
  agentsPlate:   { start: 255, in: 55, hold: 20, out: 15 }, // 255-345  (3s)
  livePlate:     { start: 345, in: 60, hold: 15, out: 15 }, // 345-435  (3s)
  workflowDAG:   { start: 435, in: 45, hold: 15, out: 15 }, // 435-510  (2.5s)
  runStream:     { start: 510, in: 30, hold: 15, out: 15 }, // 510-570  (2s)
  darkFlash:     { start: 570, in: 18, hold: 12, out: 15 }, // 570-615  (1.5s)
  savingsPlate:  { start: 615, in: 55, hold: 20, out: 15 }, // 615-705  (3s)
  verbs:         { start: 705, in: 70, hold: 10, out: 10 }, // 705-795  (3s)
  wordmark:      { start: 795, in: 22, hold: 10, out: 13 }, // 795-840  (1.5s)
};

// Overlap between beats (a cross-fade, not a cut) reads calmer than hard cuts.
export const CROSSFADE_FRAMES = 8;
