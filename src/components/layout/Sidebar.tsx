"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Zap } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";
import { useIncidentsStore } from "@/stores/incidents-store";
import { cn } from "@/lib/utils";

function useNavBadges() {
  const incidents = useIncidentsStore((s) => s.incidents);
  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;
  return { "/incidents": openIncidents };
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const gKeyActive = useUIStore((s) => s.gKeyActive);
  const badges = useNavBadges();

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col overflow-hidden select-none shrink-0 transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-16" : "w-60"
      )}
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* Noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.03] light:opacity-0 hidden dark:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Right edge line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-border z-20" />

      {/* ── Logo ── */}
      <div className={cn("relative z-20 flex h-14 items-center shrink-0 overflow-hidden", collapsed ? "justify-center" : "gap-3 px-4")}>
        <div className="relative flex size-8 shrink-0 items-center justify-center">
          <div className="absolute inset-0 rounded-lg bg-[#00D4FF]/[0.08]" />
          <Zap className="relative z-10 size-4 text-[#00D4FF]" strokeWidth={2.5} fill="rgba(0,212,255,0.15)" />
          <div className="absolute inset-0 rounded-lg animate-glow-pulse" style={{ boxShadow: "0 0 12px rgba(0,212,255,0.2)" }} />
        </div>
        {!collapsed && (
          <span className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-foreground whitespace-nowrap">
            Mission Control
          </span>
        )}
      </div>

      {/* ── Section divider ── */}
      <div className={cn("relative z-20 flex items-center shrink-0", collapsed ? "px-3 pt-2 pb-1" : "gap-3 px-4 pt-3 pb-2")}>
        {!collapsed && (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">Modules</span>
        )}
        <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-20 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/overview" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const badgeCount = badges[item.href as keyof typeof badges] || 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center rounded-lg text-[13px] transition-all duration-150 overflow-hidden",
                collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-[7px]",
                isActive ? "font-semibold text-foreground" : "font-normal text-muted-foreground hover:text-foreground/80"
              )}
            >
              {/* Active / hover backgrounds */}
              <div className={cn(
                "absolute inset-0 rounded-lg transition-all duration-200",
                isActive
                  ? collapsed
                    ? "bg-[#00D4FF]/[0.06]"
                    : "bg-gradient-to-r from-[#00D4FF]/[0.07] to-transparent"
                  : "bg-transparent group-hover:bg-muted/50"
              )} />

              {/* Active left bar */}
              {isActive && !collapsed && (
                <div
                  className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-full bg-[#00D4FF]"
                  style={{ boxShadow: "0 0 8px rgba(0,212,255,0.5), 0 0 2px rgba(0,212,255,0.8)" }}
                />
              )}

              {/* Hover left hint */}
              {!isActive && !collapsed && (
                <div className="absolute left-0 top-[6px] bottom-[6px] w-[1px] rounded-full bg-transparent group-hover:bg-[#00D4FF]/20 transition-colors duration-150" />
              )}

              {/* Icon + notification badge */}
              <div className="relative z-10 shrink-0">
                <Icon
                  className={cn(
                    "transition-all duration-150",
                    collapsed ? "size-5" : "size-4",
                    isActive
                      ? "text-[#00D4FF] drop-shadow-[0_0_4px_rgba(0,212,255,0.5)]"
                      : "text-muted-foreground/70 group-hover:text-[#00D4FF]/70"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center rounded-full text-[8px] font-mono font-bold min-w-[14px] h-[14px] px-0.5 bg-[#EF4444] text-white shadow-[0_0_6px_rgba(239,68,68,0.5)]">
                    {badgeCount}
                  </span>
                )}
              </div>

              {/* Label */}
              {!collapsed && (
                <span className="relative z-10 flex-1 truncate">{item.label}</span>
              )}

              {/* Shortcut — only when g held */}
              {!collapsed && gKeyActive && item.shortcut && (
                <span className={cn(
                  "relative z-10 ml-auto inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] animate-fade-in-up",
                  isActive ? "bg-[#00D4FF]/15 text-[#00D4FF]/70" : "bg-muted/50 text-muted-foreground/50"
                )}>
                  {item.shortcut}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ── */}
      <div className="relative z-20 shrink-0">
        <div className="mx-3 h-px bg-gradient-to-r from-border via-border/60 to-transparent" />

        {/* User area */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-4 py-2.5">
            <div className="relative">
              <div className="size-7 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#A855F7]/20 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-foreground/70">MC</span>
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#39FF14] border-2 border-background animate-glow-pulse"
                style={{ boxShadow: "0 0 4px rgba(57,255,20,0.5)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground/60 truncate">Operator</p>
              <p className="text-[10px] text-muted-foreground/50">Online</p>
            </div>
          </div>
        )}

        {/* Collapse button */}
        <div className="px-2 pb-2">
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex w-full items-center justify-center rounded-md py-1.5 text-[11px] font-medium text-muted-foreground/50 transition-all duration-150 hover:bg-muted/50 hover:text-foreground/60",
              collapsed ? "px-0" : "gap-2 px-2"
            )}
          >
            <ChevronsLeft className={cn("size-3.5 transition-transform duration-250", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
