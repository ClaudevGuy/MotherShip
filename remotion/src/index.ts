import { registerRoot } from "remotion";
import { Root } from "./Root";

// Side-effect import: registers all three Google Fonts at module load.
import "./fonts";

registerRoot(Root);
