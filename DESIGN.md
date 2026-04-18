# Design System: Mothership

## 1. Visual Language & Atmosphere

Mothership is an editorial operations platform — not a developer terminal and not a
generic SaaS dashboard. The visual language is inspired by the sensibility of high-quality
print: warm uncoated paper, inked letterpress text, and a single carefully controlled
accent color used the way a typographer uses red ink — with restraint, on purpose, only
where it matters most.

The default theme is **dark editorial**: a deep charcoal canvas (`#0B0B11`) where the
brand is expressed as warm cream (`#f5f1e8`) — a monochromatic identity that reads as
"authority" rather than "energy." When the user switches to light mode, the canvas
becomes warm uncoated paper (`#f5f1e8`) and the brand accent transforms to **oxblood**
(`#c83524`) — the protected signature color of Mothership's editorial identity.

This is a dual-identity system. Dark mode: cream on charcoal. Light mode: ink on paper
with a single editorial-red pulse.

**Key Characteristics:**
- Two-mode editorial identity: cream-on-charcoal (dark) / ink-on-paper (light)
- Oxblood `#c83524` is the **single protected brand accent** — light mode only
- In dark mode, `--brand-rgb` resolves to cream `#f5f1e8` — intentionally monochromatic
- Three custom web fonts: Fraunces (display serif), Instrument Sans (UI sans), JetBrains Mono (code)
- Warm charcoal borders (`#3d3a39`) are the structural skeleton of both themes
- State colors (emerald, amber, crimson) carry **meaning only** — never decoration


## 2. Color Palette & Roles

### Brand / Primary — Theme-Adaptive

The `--brand-rgb` token is the heart of the system. It resolves differently per theme:

| Mode | `--brand-rgb` | Hex | Character |
|------|--------------|-----|-----------|
| Dark | `245 241 232` | `#f5f1e8` | Warm cream — monochromatic authority |
| Light | `200 53 36` | `#c83524` | Oxblood — the protected editorial accent |

In Tailwind: `bg-brand`, `text-brand`, `border-brand`, `ring-brand` all resolve through
this token. Use opacity modifiers freely — `bg-brand/10`, `text-brand/50`, etc. — the
token is declared as an RGB triplet precisely for this.

**Oxblood is not approximated.** Never substitute Tailwind `red-500` (`#ef4444`),
`rose-600`, or any other red for the brand accent. Oxblood is `#c83524` — slightly
dark, slightly warm, with body. It's a printer's red, not a warning red.


### Dark Mode Surfaces

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#0B0B11` | Page canvas — deep charcoal, not pitch black |
| `--card` | `#13131A` | Elevated surfaces, cards, panels |
| `--secondary` | `#1A1A24` | Second-tier containers |
| `--muted` | `#16161F` | Subtle background fills |
| `--sidebar` | `#050507` | Sidebar canvas — deepest surface |


### Light Mode Surfaces

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#f5f1e8` | Warm uncoated paper |
| `--card` | `#faf6ec` | Lifted paper — slightly whiter than bg |
| `--secondary` | `#ece5d4` | Deeper card stock |
| `--muted` | `#ece5d4` | Subtle background fills |
| `--sidebar` | `#faf6ec` | Sidebar on paper |


### Text Hierarchy

**Dark:**

| Value | Role |
|-------|------|
| `#f2f2f2` — `--foreground` | Primary — softened white |
| `#b8b3b0` — `--text-secondary` | Warm Parchment — secondary body |
| `#8b949e` — `--muted-foreground` | Tertiary — metadata, timestamps |

**Light:**

| Value | Role |
|-------|------|
| `#0e0e0e` — `--foreground` | Printed ink |
| `#3a3529` — `--text-secondary` | Charcoal — secondary body |
| `#7a7465` — `--muted-foreground` | Editorial gray — tertiary |


### Borders & Structure

| Token | Dark | Light |
|-------|------|-------|
| `--border` | `#3d3a39` | `#d4ccbc` |
| `--border-subtle` | `rgba(61,58,57,0.6)` | `rgba(14,14,14,0.06)` |
| `--border-strong` | `rgba(61,58,57,1)` | `rgba(14,14,14,0.12)` |

The warm charcoal `#3d3a39` is a deliberate structural choice in dark mode — it
prevents cards from feeling cold or clinical. Do not replace it with pure gray.


### Semantic State Colors — Shared Across Themes

These colors carry **fixed meaning**. They are never used decoratively.

| Token | Value | Meaning |
|-------|-------|---------|
| `--color-success` | `#00d992` | Healthy runs, money saved, passing evals |
| `--color-live-dot` | `#39FF14` dark / `#059669` light | Live indicator dot |
| `--color-live-text` | `#39FF14` dark / `#047857` light | Live status label |
| `--color-end-rgb` | `57 255 20` dark / `5 150 105` light | END workflow node |
| `--color-amber` | `#F59E0B` | Budget warnings, rate-limits, degraded |
| `--color-crimson` | `#EF4444` | Failed runs, errors, destructive actions |
| `--color-purple` | `#A855F7` | Secondary accent — model badges, misc |

**The rule:** Emerald = good. Amber = caution. Crimson = bad. If a context doesn't
carry one of these three meanings, it should not be one of these three colors.

The neon live dot (`#39FF14`) works on charcoal where it reads as "signal." On paper
it would be garish — so it swaps to grounded emerald in light mode. Neon-on-dark,
grounded-on-light: this is the pattern for all semantic colors.


## 3. Typography

Three purpose-built web fonts. Each owns a specific role. No mixing.

### Font Stack

| Role | Family | Tailwind class | CSS var |
|------|--------|---------------|---------|
| Display / Headings | **Fraunces** | `font-heading` / `font-serif` | `--font-heading` |
| UI / Body | **Instrument Sans** | `font-sans` | `--font-sans` |
| Code / Mono | **JetBrains Mono** | `font-mono` | `--font-mono` |

**Fraunces** — an optical-size display serif with the authority of a broadsheet
masthead. Variable axes (optical size, weight) make it exceptionally versatile for
editorial treatments. It is the identity anchor of the product.

**Instrument Sans** — a geometric humanist sans-serif. Clean, contemporary, highly
legible at small sizes. The workhorse for all UI labels, navigation, button text, and
body copy.

**JetBrains Mono** — a purpose-built programming font with clearly distinguished
characters (`0/O`, `1/l/I`). Use for code blocks, terminal output, model identifiers,
run IDs, and any data requiring monospace treatment.


### Type Scale

| Role | Font | Size | Weight | Line Height | Tracking |
|------|------|------|--------|-------------|----------|
| Display / Hero | Fraunces | 48–72px | 400–700 | 1.05–1.1 | -0.02em |
| Page Title | Fraunces | 28–36px | 600–700 | 1.1 | -0.01em |
| Section Heading | Fraunces | 20–24px | 600 | 1.2 | -0.005em |
| Card Title | Instrument Sans | 14–16px | 600 | 1.3 | normal |
| Body / Description | Instrument Sans | 13–14px | 400 | 1.5–1.6 | normal |
| Overline / Label | Instrument Sans or Mono | 9–11px | 600–700 | 1 | 0.12–0.26em |
| Caption / Meta | Instrument Sans | 11–12px | 400–500 | 1.4 | normal |
| Code / ID | JetBrains Mono | 11–13px | 400 | 1.4 | normal |


### Principles

- **Fraunces owns display.** Use it for hero headlines and pull-quotes. Do not use it
  for body copy, small UI labels, or decorative treatments.
- **Overlines are uppercase, tracked out, set in `font-mono`.** The sidebar section
  labels are canonical: `font-mono text-[9px] uppercase tracking-[0.26em]`.
- **Negative tracking on large type, positive on small uppercase.** Never apply wide
  letter-spacing to a Fraunces heading.
- **Weight contrast creates hierarchy — don't rely on size alone.** A 600-weight 13px
  label can outrank a 400-weight 16px paragraph.


## 4. Component Styling

### Buttons

**Primary** — the definitive action:
```
bg-brand text-primary-foreground hover:bg-brand/80
```
Cream on dark, oxblood on light. High contrast, no decoration needed.

**Ghost / Outline** — standard UI actions:
```
border border-border bg-transparent text-foreground hover:bg-muted/50
```

**Destructive** — irreversible actions only:
```
border border-destructive/30 bg-destructive/[0.06] text-destructive
```


### Cards & Glass Panels

All contained surfaces use the `glass-panel` system:
```css
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  box-shadow: var(--card-shadow);
}
```

Active/selected card: add `border-brand/20 ring-1 ring-brand/30`.
**Never use a semantic color (`border-green-500`, `border-emerald-500`) to highlight a
selected card** — that implies a status, not selection.

Dark-mode card shadows are cream-tinted to reinforce brand identity:
```css
--card-shadow: 0 0 14px rgba(245,241,232,0.035), 0 2px 6px rgba(0,0,0,0.35);
```


### Forms & Inputs

```
h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm
focus:border-brand/50 outline-none transition-colors
```

Focus ring color: `--ring` — cream in dark, oxblood in light.


### Sidebar Navigation

The sidebar is the most polished surface in the product:
- Canvas: `--sidebar` (`#050507` dark / `#faf6ec` light)
- Active item: brand-gradient background pill + left-edge indicator bar + pulsing dot
- Hover: 2px `translateX` micro-shift — forward motion, never jarring
- Collapsed: 58px; Expanded: 230px; transition: `cubic-bezier(0.16, 1, 0.3, 1)` 300ms
- Edge light: slow-sweeping cream glow along the right edge (6s animation)


### Status & Live Indicators

Always go through CSS var tokens:
```tsx
// Live dot
<span style={{ background: "var(--color-live-dot)" }} />

// Status text
success → text-[--color-success]
warning → text-amber-500
error   → text-crimson
```


## 5. Layout & Spacing

**Base unit:** 4px (Tailwind default). All spacing snaps to this grid.

**Layout structure:**
- Sidebar: fixed left, 58–230px collapsible
- Topbar: `h-[56px]` sticky, aligns exactly with sidebar header height
- Content: `flex-1 overflow-auto`, fills remaining space

**Border radius scale:**
```
rounded-sm  ≈ 4px   — inline chips, tiny badges
rounded-md  ≈ 6px   — buttons, inputs
rounded-lg  = 8px   — standard cards (--radius)
rounded-xl  = 12px  — panels, modals, logo marks
```

**Depth & elevation:**

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | `bg-background` | Page canvas |
| Contained | `bg-card border border-border` | Standard cards |
| Glass | `.glass-panel` | Floating panels, overlays |
| Modal | `bg-popover` + shadow | Dialogs |
| Sidebar | `bg-[--sidebar]` | Persistent nav |

**CSS stacking-context note:** Do not assign `z-index` to layout wrapper divs unless
strictly necessary. A `z-10` on a layout child creates a stacking context that traps
`fixed z-50` modals below a `sticky z-40` topbar. This is a known failure mode.


## 6. Motion & Animation

All animations are **slow and purposeful** — a command center, not a consumer game.

| Animation | Duration | Curve |
|-----------|----------|-------|
| Sidebar expand/collapse | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Nav hover shift | 200ms | ease-out |
| Color/opacity transitions | 200ms | ease |
| Active indicator ping | 2400ms | ease |
| Sidebar edge light sweep | 6000ms | ease-in-out |
| Glow pulse | 2000ms | ease-in-out |

Fast flashes, bounce, spring-overshoot, and confetti effects are never used.
When in doubt: slow down.


## 7. Theme Duality

Both modes are equally polished — this is not "dark mode with light mode tacked on."

| Aspect | Dark Mode | Light Mode |
|--------|-----------|------------|
| Canvas | `#0B0B11` deep charcoal | `#f5f1e8` warm uncoated paper |
| Brand | Cream `#f5f1e8` | Oxblood `#c83524` |
| Brand feel | Monochromatic authority | Editorial accent |
| Borders | Warm charcoal `#3d3a39` | Hairline `#d4ccbc` |
| Live dot | Neon `#39FF14` | Emerald `#059669` |
| END node | Neon green | Emerald |
| Ambient glow | Cream whisper | Oxblood whisper |
| Shadows | Cream-tinted, dramatic | Near-black, barely-there |
| Focus ring | Cream | Oxblood |


## 8. What NOT To Do

### The VoltAgent Era — Don't Repeat It

The previous design system, documented in `DESIGN.voltagent-legacy.md`, was called
**VoltAgent**. It used:
- `#050507` Abyss Black + `#00d992` Emerald Signal Green as the identity
- `system-ui` / Inter / SFMono as the font stack
- Green as the brand color — an "electric power-on" metaphor

**All of this is retired.** VoltAgent was the right language for that project.
Mothership's editorial operations platform has a different identity. If you see
these colors or that vocabulary in the codebase, they are legacy artifacts to migrate.


### Specific Anti-Patterns

**Do not use `#00d992` as a brand or accent color.** It is a semantic success signal.
It does not go in logos, headlines, decorative borders, or primary buttons unless the
literal meaning is "this operation succeeded."

**Do not substitute `#ef4444` (crimson) for the brand oxblood.** They are different
colors with different meanings. Crimson signals an error. Oxblood is editorial identity.
Using them interchangeably destroys both meanings.

**Do not use Tailwind color scale classes for semantic colors** (`text-green-400`,
`border-emerald-500`). Use the CSS token: `text-[--color-success]`, `bg-brand/10`.
Hard-coded scale values break theme adaptation.

**Do not add a second brand accent color.** The system has one adaptive brand token.
Semantic colors (purple, amber, emerald) provide variety — they just always carry
meaning. A "secondary brand color" that doesn't carry meaning is decoration in disguise.

**Do not use Abyss Black (`#050507`) in the light theme** as a background or surface.
Light mode is warm paper. If you are writing dark-mode values inside `.light {}` selectors,
something is wrong.

**Do not use system-ui, Inter, or SFMono.** Those are retired VoltAgent fonts. The
fonts are Fraunces, Instrument Sans, and JetBrains Mono.

**Do not apply `z-index` to layout wrapper divs casually.** It creates stacking contexts
that trap `fixed` overlays. See Layout section note above.

**Do not write fast animations.** Duration under 150ms is reserved for micro-interactions
(color transitions, hover state reveals). Anything structural or decorative should be
200ms at minimum, and usually 300ms or more.

### The Design in One Rule

> One adaptive brand token (cream / oxblood). A semantic triad (emerald / amber / crimson)
> that carries meaning and never decoration. One editorial typography system (Fraunces /
> Instrument Sans / JetBrains Mono). Paper and ink before plastic and glow.


## 9. Quick Reference for AI Prompts

When prompting an AI to write or modify components in this codebase:

### Color Tokens
```
Brand (adaptive):  text-brand / bg-brand / border-brand
                   dark = cream #f5f1e8,  light = oxblood #c83524

Surfaces:          bg-background  bg-card  bg-muted  bg-secondary
Borders:           border-border  (warm charcoal #3d3a39 / hairline #d4ccbc)
Text:              text-foreground  text-muted-foreground
Success:           text-[--color-success]  bg-[--color-success]/10  (#00d992)
Warning:           text-amber  bg-amber/10  (#F59E0B)
Error:             text-crimson  bg-crimson/10  (#EF4444)
Live dot:          style={{ background: "var(--color-live-dot)" }}
```

### Font Tokens
```
Display / Headings:  font-heading  (Fraunces)
UI / Body:           font-sans     (Instrument Sans)
Code / IDs:          font-mono     (JetBrains Mono)
Overlines:           font-mono text-[9px] font-semibold uppercase tracking-[0.26em]
                     text-muted-foreground/45
```

### Example Prompt
> "Create a metric card using `bg-card border border-border rounded-lg p-4`. Title in
> `font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground`. Value
> in `font-heading text-3xl font-bold text-foreground`. Positive delta in
> `text-[--color-success]`. Use `text-brand` only for the most critical interactive
> highlight — not for general decoration."

### Iteration Checklist
1. Reference token names, not hex codes. Use `text-brand`, not `text-[#c83524]`.
2. `bg-brand/10` for a brand tint — the `/` opacity shorthand works because `--brand-rgb`
   is declared as an RGB triplet.
3. Before assigning any color: ask "does this carry meaning?" If yes → semantic token.
   If it's brand identity → `text-brand`. If it's structure → border/surface token.
4. When verifying a token value: check `globals.css` `:root` (dark) or `.light` (light).
5. Animations: slow, deliberate, purposeful. Turn a page, don't launch a rocket.
