# Mothership · Remotion

Editorial film — 28s landing hero loop for MOTHERSHIP.

Built with [Remotion](https://www.remotion.dev) v4. Renders a silent 1920×1080
MP4 that loops seamlessly and matches the landing page's editorial palette
(paper, ink, oxblood) and typography (Fraunces, Instrument Sans, JetBrains
Mono). Counterweighted with cinematic devices: a dark-terminal cold open,
a node-graph construction beat, a fast-scrolling run feed, and a deliberate
charcoal shock cut — so the paper never gets monotonous.

## Storyboard

Three acts: cold-open terminal → typography → product density → payoff.

| Act | Beat          | Frames  | Time       | What happens                                                              |
| --- | ------------- | ------- | ---------- | ------------------------------------------------------------------------- |
| I   | MacroToken    | 0–60    | 0–2s       | Near-black terminal. `> agent.run()` types in at 140px, neon LIVE chip, scanlines. Camera pulls out — reveals the paper world.  |
| I   | Shipping      | 60–165  | 2–5.5s     | "Your agents are *shipping*." — italic oxblood on "shipping".             |
| I   | Watching      | 165–255 | 5.5–8.5s   | "This is where you start *watching*." — accent dot after.                 |
| II  | § Agents      | 255–345 | 8.5–11.5s  | Three agent ledger rows land: name + description, model, tokens, cost.    |
| II  | § Live run    | 345–435 | 11.5–14.5s | Execution card with subtle camera push-in; tokens stream, cost ticks, Tier 2. |
| II  | § Workflow    | 435–510 | 14.5–17s   | **3 node graph builds itself, edges draw, oxblood data particles flow along.** |
| II  | § Run stream  | 510–570 | 17–19s     | **Fast-scrolling run feed — 4,218 runs today, velocity-over-legibility.** |
| II  | Dark flash    | 570–615 | 19–20.5s   | **Sudden cut to charcoal. "Always on." with oxblood period. Neon telemetry ticker.** |
| III | § Savings     | 615–705 | 20.5–23.5s | "$341.27" counts up; italic oxblood *saved on auto-routing*; sparkline + context. |
| III | Verbs         | 705–795 | 23.5–26.5s | §01 Build. · §02 Run. · §03 Evaluate. — three plates, staggered springs.  |
| III | Wordmark      | 795–840 | 26.5–28s   | MOTHERSHIP wordmark + oxblood accent dot + AI · OPERATIONS tagline.       |

## Quick start

```bash
cd remotion
npm install

# Preview with hot reload
npm run studio          # opens Remotion Studio at localhost:3030

# Render to MP4 (H.264, yuv420p, CRF 18, full 1920×1080)
npm run render          # → out/mothership-hero.mp4

# Or WebM / GIF for alternative embeds
npm run render:webm
npm run render:gif
```

### Re-rendering the README hero

The version embedded at the top of the main repo README lives at
`../assets/mothership-hero.mp4` — rendered at 1280×720 / CRF 23 / ~3 MB
so it loads fast on the GitHub README. Re-render with:

```bash
cd remotion
npx remotion render src/index.ts MothershipHero ../assets/mothership-hero.mp4 \
  --width=1280 --height=720 --crf=23
```

## Project layout

```
remotion/
├── package.json
├── tsconfig.json
├── remotion.config.ts         # codec/pixel format tuning for web playback
└── src/
    ├── index.ts               # registerRoot entry + font side-effect import
    ├── Root.tsx               # Composition registration (id=MothershipHero)
    ├── MothershipHero.tsx     # the 28s film — stacks all 11 scenes
    ├── theme.ts               # palette, fps, beat windows
    ├── fonts.ts               # @remotion/google-fonts loading
    ├── components/
    │   ├── PaperBg.tsx        # cream paper + SVG turbulence grain
    │   ├── HairlineRule.tsx   # the signature editorial rule sweep
    │   └── StatusDot.tsx      # pulsing live dot (used across product plates)
    └── scenes/
        ├── MacroToken.tsx     # Act I — cold-open terminal cinematic
        ├── Shipping.tsx       # Act I
        ├── Watching.tsx       # Act I
        ├── AgentsPlate.tsx    # Act II — product walkthrough
        ├── LivePlate.tsx      # Act II — now with camera push-in
        ├── WorkflowDAG.tsx    # Act II — node graph construction
        ├── RunStream.tsx      # Act II — fast-scrolling feed
        ├── DarkFlash.tsx      # Act II — 1.5s charcoal shock cut
        ├── SavingsPlate.tsx   # Act III
        ├── Verbs.tsx          # Act III
        └── Wordmark.tsx       # Act III
```

## Design principles

- **One timeline, no nesting** — All scenes live on the same frame clock and
  gate their own opacity around their beat window. No `<Sequence>` trees —
  the timing reads as code you can scan top-to-bottom.
- **Editorial grammar** — Same palette and typography as
  `landing/index.html`. The video is an extension of the publication, not a
  separate brand.
- **Seamless loop** — Beat 5 fades back to paper; Beat 1 fades from paper.
  Drop into an autoplaying `<video loop muted playsInline>` and the seam is
  invisible.

## Embedding on the landing page

Once rendered, reference the file from the landing hero:

```html
<video
  src="/video/mothership-hero.mp4"
  autoplay
  loop
  muted
  playsinline
  poster="/video/mothership-hero-poster.jpg"
  style="width: 100%; display: block;"
></video>
```

## Tuning tips

- **Change the palette in one place** — `src/theme.ts`, `palette`. Every
  scene reads from there.
- **Shift a beat's timing** — `src/theme.ts`, `beats.<name>`. Start, fade-in,
  hold, and fade-out are independent knobs.
- **Replace text** — each scene has its words declared at the top of the
  file; change the string, the motion adapts.
- **Cut to 10s / extend to 30s** — adjust `timing.durationInFrames` in
  `theme.ts` and redistribute beat offsets.
