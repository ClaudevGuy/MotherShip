"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bot,
  FlaskConical,
  GitBranch,
  OctagonX,
} from "lucide-react";
import { toast } from "sonner";
import { NAV_ITEMS } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";

const QUICK_ACTIONS = [
  { label: "Deploy Agent", icon: Bot },
  { label: "Run Eval", icon: FlaskConical },
  { label: "New Workflow", icon: GitBranch },
  { label: "Kill Switch", icon: OctagonX },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => setCommandPaletteOpen(false), [setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [commandPaletteOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && commandPaletteOpen) {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [commandPaletteOpen, close]);

  const handleNavSelect = (href: string) => {
    close();
    router.push(href);
  };

  const handleActionSelect = (label: string) => {
    close();
    toast.success(`${label} triggered`, {
      description: "Action dispatched successfully.",
    });
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998]"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={close}
          />

          {/* Centering wrapper — fixed, not animated */}
          <div
            className="fixed z-[9999] flex justify-center"
            style={{ top: 80, left: 0, right: 0, pointerEvents: "none" }}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="w-full"
            style={{ maxWidth: 580, pointerEvents: "auto" }}
          >
            <div
              className="overflow-hidden rounded-xl"
              style={{
                background: "var(--bg-card, #0D0D14)",
                border: "1px solid rgba(0,217,146,0.25)",
                boxShadow:
                  "0 0 0 1px rgba(0,217,146,0.12), 0 24px 60px rgba(0,0,0,0.8), 0 0 80px rgba(0,217,146,0.06)",
              }}
            >
              <CommandPrimitive
                className="flex flex-col"
                loop
              >
                {/* Input bar */}
                <div className="relative flex items-center border-b border-border">
                  <Search
                    className="absolute left-4 size-4 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <CommandPrimitive.Input
                    ref={inputRef}
                    placeholder="Type a command or search..."
                    className="h-[52px] w-full bg-transparent pl-12 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>

                {/* Results */}
                <CommandPrimitive.List className="max-h-[340px] overflow-y-auto py-2">
                  <CommandPrimitive.Empty className="py-8 text-center text-sm text-muted-foreground">
                    No results found.
                  </CommandPrimitive.Empty>

                  {/* Navigation */}
                  <CommandPrimitive.Group
                    heading="Navigation"
                    className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {NAV_ITEMS.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <CommandPrimitive.Item
                          key={item.href}
                          value={item.label}
                          onSelect={() => handleNavSelect(item.href)}
                          className="group mx-2 flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-[14px] text-foreground/80 outline-none transition-colors duration-100 data-[selected=true]:bg-[rgba(0,217,146,0.05)] data-[selected=true]:text-foreground"
                          style={{ animationDelay: `${i * 20}ms` }}
                        >
                          {/* Hover/selected left accent */}
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full bg-transparent group-data-[selected=true]:bg-[#00d992] transition-colors duration-100" />

                          <Icon
                            className="size-4 shrink-0 text-muted-foreground group-data-[selected=true]:text-[#00d992] transition-colors duration-100"
                            strokeWidth={1.5}
                          />
                          <span className="flex-1">{item.label}</span>
                          {item.shortcut && (
                            <span
                              className="ml-auto font-mono text-[11px] text-muted-foreground rounded border border-border px-1.5 py-0.5"
                              style={{
                                background: "var(--bg-hover, rgba(255,255,255,0.03))",
                              }}
                            >
                              {item.shortcut}
                            </span>
                          )}
                        </CommandPrimitive.Item>
                      );
                    })}
                  </CommandPrimitive.Group>

                  {/* Separator */}
                  <div className="mx-4 my-2 h-px bg-border" />

                  {/* Quick Actions */}
                  <CommandPrimitive.Group
                    heading="Quick Actions"
                    className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <CommandPrimitive.Item
                          key={action.label}
                          value={action.label}
                          onSelect={() => handleActionSelect(action.label)}
                          className="group mx-2 flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-[14px] text-foreground/80 outline-none transition-colors duration-100 data-[selected=true]:bg-[rgba(0,217,146,0.05)] data-[selected=true]:text-foreground"
                        >
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full bg-transparent group-data-[selected=true]:bg-[#00d992] transition-colors duration-100" />
                          <Icon
                            className="size-4 shrink-0 text-muted-foreground group-data-[selected=true]:text-[#00d992] transition-colors duration-100"
                            strokeWidth={1.5}
                          />
                          <span className="flex-1">{action.label}</span>
                        </CommandPrimitive.Item>
                      );
                    })}
                  </CommandPrimitive.Group>
                </CommandPrimitive.List>

                {/* Footer hints */}
                <div
                  className="flex items-center gap-4 border-t px-4 py-2"
                  style={{ borderColor: "var(--border-subtle, rgba(255,255,255,0.06))" }}
                >
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    <kbd className="text-muted-foreground">↑↓</kbd> navigate
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    <kbd className="text-muted-foreground">↵</kbd> select
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    <kbd className="text-muted-foreground">esc</kbd> dismiss
                  </span>
                </div>
              </CommandPrimitive>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
