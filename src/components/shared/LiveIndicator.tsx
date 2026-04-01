"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  label?: string;
  className?: string;
}

export function LiveIndicator({
  label = "Live",
  className,
}: LiveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex size-2.5">
        <motion.span
          className="absolute inset-0 rounded-full bg-[#39FF14]"
          animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative inline-flex size-2.5 rounded-full bg-[#39FF14]" />
      </span>
      <span className="text-xs font-medium text-[#39FF14]">{label}</span>
    </div>
  );
}
