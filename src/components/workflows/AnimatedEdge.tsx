"use client";

import React from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      {/* Base path (glow) */}
      <BaseEdge
        id={`${id}-glow`}
        path={edgePath}
        style={{
          stroke: selected ? "#00d992" : "rgba(0,217,146,0.25)",
          strokeWidth: selected ? 6 : 4,
          filter: "blur(4px)",
        }}
      />
      {/* Main path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#00d992" : "rgba(0,217,146,0.5)",
          strokeWidth: 2,
        }}
      />
      {/* Animated dot */}
      <circle r="3" fill="#00d992" filter="drop-shadow(0 0 3px #00d992)">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
}
