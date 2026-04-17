// ════════════════════════════════════════════════════════════════════════════
// Font loading via @remotion/google-fonts.
//
// Remotion blocks rendering until these fonts are ready — so every scene can
// rely on Fraunces/Instrument/JetBrains being fully loaded by the time a
// frame is drawn. Keep weight/subset lists tight so each render stays small.
//
// Usage pattern throughout the project:
//   import { fonts } from "./fonts";
//   <div style={{ fontFamily: fonts.serif }}>...</div>
// ════════════════════════════════════════════════════════════════════════════

import {
  loadFont as loadFraunces,
  fontFamily as frauncesFamily,
} from "@remotion/google-fonts/Fraunces";
import {
  loadFont as loadInstrument,
  fontFamily as instrumentFamily,
} from "@remotion/google-fonts/InstrumentSans";
import {
  loadFont as loadMono,
  fontFamily as monoFamily,
} from "@remotion/google-fonts/JetBrainsMono";

// Fraunces — editorial display serif. Load both upright + italic so we can
// switch at the character level inside a headline.
loadFraunces("normal", { weights: ["300", "400", "600"], subsets: ["latin"] });
loadFraunces("italic", { weights: ["300", "400"], subsets: ["latin"] });

// Instrument Sans — humanist UI sans, used for labels and tracking.
loadInstrument("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

// JetBrains Mono — the monospace voice (timestamps, "§01", etc.)
loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const fonts = {
  serif: frauncesFamily,
  sans: instrumentFamily,
  mono: monoFamily,
} as const;
