"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Set false during a destructive or in-flight operation to block dismiss. */
  dismissable?: boolean;
  /** Additional classes on the content wrapper (not the backdrop). */
  className?: string;
}

/**
 * Portal-based modal wrapper. Mounts at document.body so the backdrop covers
 * the topbar and sidebar uniformly regardless of layout stacking contexts.
 * Click-outside and Escape both call onClose when dismissable.
 */
export function ModalShell({
  open,
  onClose,
  children,
  dismissable = true,
  className,
}: ModalShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !dismissable) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, dismissable, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => dismissable && onClose()}
      />
      <div
        className={cn("relative z-[61]", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
