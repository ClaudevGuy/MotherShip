import {
  LayoutDashboard,
  Bot,
  Code2,
  Rocket,
  Server,
  DollarSign,
  BarChart3,
  ScrollText,
  Users,
  Puzzle,
  AlertTriangle,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard, shortcut: "g o" },
  { label: "AI Agents", href: "/agents", icon: Bot, shortcut: "g a" },
  { label: "Codebase", href: "/codebase", icon: Code2, shortcut: "g c" },
  { label: "Deployments", href: "/deployments", icon: Rocket, shortcut: "g d" },
  { label: "Infrastructure", href: "/infrastructure", icon: Server, shortcut: "g i" },
  { label: "Costs & Billing", href: "/costs", icon: DollarSign, shortcut: "g $" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, shortcut: "g n" },
  { label: "Logs", href: "/logs", icon: ScrollText, shortcut: "g l" },
  { label: "Team", href: "/team", icon: Users, shortcut: "g t" },
  { label: "Integrations", href: "/integrations", icon: Puzzle, shortcut: "g p" },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle, shortcut: "g !" },
  { label: "Settings", href: "/settings", icon: Settings, shortcut: "g s" },
];

export const STATUS_COLORS = {
  running: { bg: "bg-green/10", text: "text-green", border: "border-green/30", dot: "bg-green" },
  idle: { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground" },
  paused: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/30", dot: "bg-amber" },
  error: { bg: "bg-crimson/10", text: "text-crimson", border: "border-crimson/30", dot: "bg-crimson" },
  deploying: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/30", dot: "bg-cyan" },
  healthy: { bg: "bg-green/10", text: "text-green", border: "border-green/30", dot: "bg-green" },
  degraded: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/30", dot: "bg-amber" },
  down: { bg: "bg-crimson/10", text: "text-crimson", border: "border-crimson/30", dot: "bg-crimson" },
  success: { bg: "bg-green/10", text: "text-green", border: "border-green/30", dot: "bg-green" },
  failed: { bg: "bg-crimson/10", text: "text-crimson", border: "border-crimson/30", dot: "bg-crimson" },
  in_progress: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/30", dot: "bg-cyan" },
  pending: { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground" },
  open: { bg: "bg-crimson/10", text: "text-crimson", border: "border-crimson/30", dot: "bg-crimson" },
  investigating: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/30", dot: "bg-amber" },
  resolved: { bg: "bg-green/10", text: "text-green", border: "border-green/30", dot: "bg-green" },
  connected: { bg: "bg-green/10", text: "text-green", border: "border-green/30", dot: "bg-green" },
  disconnected: { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground" },
  rolled_back: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/30", dot: "bg-amber" },
} as const;

export const KEYBOARD_SHORTCUTS = [
  { keys: ["Ctrl", "K"], description: "Command Palette" },
  { keys: ["?"], description: "Keyboard Shortcuts" },
  { keys: ["g", "o"], description: "Go to Overview" },
  { keys: ["g", "a"], description: "Go to Agents" },
  { keys: ["g", "c"], description: "Go to Codebase" },
  { keys: ["g", "d"], description: "Go to Deployments" },
  { keys: ["g", "i"], description: "Go to Infrastructure" },
  { keys: ["g", "l"], description: "Go to Logs" },
  { keys: ["g", "t"], description: "Go to Team" },
  { keys: ["g", "s"], description: "Go to Settings" },
  { keys: ["g", "$"], description: "Go to Costs" },
  { keys: ["g", "n"], description: "Go to Analytics" },
  { keys: ["g", "p"], description: "Go to Integrations" },
  { keys: ["g", "!"], description: "Go to Incidents" },
  { keys: ["Esc"], description: "Close dialogs" },
];
