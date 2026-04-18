import React from "react";

// ════════════════════════════════════════════════════════════════════════════
// MothershipMark — the product's brand glyph
//
// A minimal stroked flying-saucer silhouette: a dome hemisphere riding on a
// flattened elliptical disc. Reads cleanly at 14px in the sidebar and scales
// up to 48px+ on the login/register/404 hero blocks without losing identity.
//
// API mirrors the Lucide icon we used to render in these slots (<Zap />) so
// existing styling keeps working:
//   - strokeWidth   : thickness of the outline
//   - fill          : optional inside-wash color (e.g. "rgb(var(--brand-rgb)/0.35)")
//   - className     : Tailwind/utility classes (handles color + size via
//                     text-brand + size-*)
// ════════════════════════════════════════════════════════════════════════════
export type MothershipMarkProps = {
  className?: string;
  strokeWidth?: number;
  fill?: string;
  /** Accessibility: set to a string to expose as a labelled image, or leave
   *  undefined and the parent can set aria-hidden/role on the wrapper. */
  title?: string;
};

export const MothershipMark: React.FC<MothershipMarkProps> = ({
  className,
  strokeWidth = 1.8,
  fill,
  title,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* Optional tinted wash — painted under the strokes so they stay crisp.
          Uses the same viewBox shapes as the outlines but with the caller's
          `fill` color. When fill is unset we draw nothing, leaving the icon
          as a pure outline. */}
      {fill ? (
        <>
          <path d="M8 10a4 4 0 0 1 8 0" fill={fill} stroke="none" />
          <ellipse cx="12" cy="13" rx="10" ry="2.8" fill={fill} stroke="none" />
        </>
      ) : null}

      {/* Dome — top hemisphere of the saucer */}
      <path d="M8 10a4 4 0 0 1 8 0" />

      {/* Saucer disc — flattened ellipse, wider than the dome so the dome
          visually "sits" on it */}
      <ellipse cx="12" cy="13" rx="10" ry="2.8" />

      {/* Tractor beam — single subtle dashed ray pointing down. Renders as
          a small visual hint of "transmission / active" without cluttering
          the silhouette at small sizes. */}
      <path
        d="M12 16v4"
        strokeDasharray="1.4 1.8"
        opacity={0.55}
      />
    </svg>
  );
};
