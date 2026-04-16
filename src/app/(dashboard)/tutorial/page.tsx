/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Bot, GitBranch, Rocket, DollarSign,
  BarChart3, ScrollText, Users, AlertTriangle, Settings,
  BookOpen, Zap, ChevronRight, Keyboard, FolderOpen,
  Play, CheckCircle2, Info, Lightbulb, Terminal, Shield,
  Bell, Palette, Link2, Flame, Activity, TrendingUp, Plug,
  FileCode, FlaskConical, DollarSign as DollarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  tagline: string;
}

// ── Section registry ──────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  { id: "getting-started",  label: "Getting Started",  icon: Zap,            color: "#00d992", tagline: "First steps with MOTHERSHIP" },
  { id: "overview",         label: "Overview",         icon: LayoutDashboard, color: "#00d992", tagline: "Your real-time command centre" },
  { id: "ai-agents",        label: "AI Agents",        icon: Bot,            color: "#A78BFA", tagline: "Create, run, and monitor agents" },
  { id: "workflows",        label: "Workflows",        icon: GitBranch,      color: "#34D399", tagline: "Multi-agent automation pipelines" },
  { id: "deployments",      label: "Deployments",      icon: Rocket,         color: "#F59E0B", tagline: "Ship and track every release" },
  { id: "costs",            label: "Costs & Billing",  icon: DollarSign,     color: "#10B981", tagline: "Budget and spend management" },
  { id: "analytics",        label: "Analytics",        icon: BarChart3,      color: "#60A5FA", tagline: "Agent performance insights" },
  { id: "logs",             label: "Logs",             icon: ScrollText,     color: "#94A3B8", tagline: "Unified log stream" },
  { id: "team",             label: "Team",             icon: Users,          color: "#F472B6", tagline: "Members, roles, and permissions" },
  { id: "incidents",        label: "Incidents",        icon: AlertTriangle,  color: "#EF4444", tagline: "Alert rules and on-call" },
  { id: "settings",         label: "Settings",         icon: Settings,       color: "#6B7280", tagline: "Project configuration" },
  { id: "projects",         label: "Projects",         icon: FolderOpen,     color: "#8B5CF6", tagline: "Multi-project workspace" },
  { id: "prompt-studio",    label: "Prompt Studio",    icon: FileCode,       color: "#00d992", tagline: "Write, test, and version prompts" },
  { id: "evals",            label: "Evals",            icon: FlaskConical,   color: "#8B5CF6", tagline: "Automated agent quality testing" },
  { id: "notifications",    label: "Notifications",    icon: Bell,           color: "#F59E0B", tagline: "Real-time alerts and updates" },
  { id: "external-agents",  label: "External Agents",  icon: Plug,           color: "#F97316", tagline: "Connect agents from any framework" },
  { id: "shortcuts",        label: "Shortcuts",        icon: Keyboard,       color: "#00d992", tagline: "Navigate without a mouse" },
];

// ── Small reusable components ──────────────────────────────────────────────────
function Callout({ icon: Icon, color, title, children }: { icon: React.ElementType; color: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3.5 rounded-lg border p-4" style={{ borderColor: `${color}25`, background: `${color}08` }}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5" style={{ background: `${color}15` }}>
        <Icon className="size-4" style={{ color }} />
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#00d992]/10 border border-[#00d992]/20 text-[11px] font-bold text-[#00d992] font-mono">{n}</div>
        <div className="w-px flex-1 bg-[#00d992]/10 mt-1.5" />
      </div>
      <div className="space-y-1.5 pb-5 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <div className="text-xs text-[#b8b3b0] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, label, desc }: { icon: React.ElementType; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3.5 p-3.5 rounded-lg border border-[#3d3a39]/60 bg-[#101010] hover:border-[#3d3a39] transition-colors">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#00d992]/8 border border-[#00d992]/15 mt-0.5">
        <Icon className="size-3.5 text-[#00d992]/70" />
      </div>
      <div className="space-y-0.5">
        <p className="text-[13px] font-semibold text-[#f2f2f2]">{label}</p>
        <p className="text-xs text-[#b8b3b0] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded-md border border-[#3d3a39] bg-[#101010] px-1.5 py-0.5 font-mono text-[10px] text-[#00d992] mx-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{children}</kbd>
  );
}

function SectionCard({ section, active, onClick }: { section: Section; active: boolean; onClick: () => void }) {
  const Icon = section.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all duration-150",
        active
          ? "border-[#00d992]/30 bg-[#00d992]/[0.04] shadow-[0_0_12px_rgba(0,217,146,0.06)]"
          : "border-[#3d3a39]/60 bg-[#101010] hover:border-[#3d3a39] hover:bg-[#101010]/80"
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5" style={{ background: `${section.color}12`, border: `1px solid ${section.color}20` }}>
        <Icon className="size-3.5" style={{ color: section.color }} />
      </div>
      <div>
        <p className="text-xs font-semibold text-[#f2f2f2] leading-tight">{section.label}</p>
        <p className="text-[10px] text-[#8b949e] leading-tight mt-0.5">{section.tagline}</p>
      </div>
    </button>
  );
}

// ── Section content ────────────────────────────────────────────────────────────
function GettingStarted() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        MOTHERSHIP is an AI-powered operations dashboard. It gives your team a single pane of glass to deploy agents, ship code, monitor costs, and respond to incidents — all in one place.
      </p>
      <div className="space-y-3">
        <Step n={1} title="Create your first project">
          Click the project name at the top of the left sidebar. A dropdown opens — choose <strong className="text-foreground">Add project</strong>. Give it a name (e.g. &ldquo;My App&rdquo;) and press <em>Create Project</em>. The dashboard clears to a clean slate for that project.
        </Step>
        <Step n={2} title="Connect your database">
          Go to <strong className="text-foreground">Settings → General</strong> and add your project name and logo. Then head to <strong className="text-foreground">Settings → Integrations</strong> and connect GitHub, Slack, or PagerDuty so alerts flow to the right channels.
        </Step>
        <Step n={3} title="Deploy your first agent">
          Click <strong className="text-foreground">Deploy Agent</strong> on the Overview page (or press <Kbd>g</Kbd><Kbd>a</Kbd> then use the builder). Fill in the agent name, model, and what it should do. Hit Deploy — it appears on the Overview grid within seconds.
        </Step>
        <Step n={4} title="Set a budget alert">
          Go to <strong className="text-foreground">Costs &amp; Billing</strong> and set a daily budget. When spend crosses the threshold you&apos;ll get notified via whichever channels are enabled in <strong className="text-foreground">Settings → Notifications</strong>.
        </Step>
        <Step n={5} title="Invite your team">
          Go to <strong className="text-foreground">Team</strong> and invite members by email. Assign roles (Viewer, Member, Admin, Owner) to control who can deploy agents or kill them in an emergency.
        </Step>
      </div>
      <Callout icon={Lightbulb} color="#F59E0B" title="Power tip">
        Hold <Kbd>g</Kbd> and then press a letter to jump to any section instantly — no mouse needed. Press <Kbd>?</Kbd> to see the full shortcut map.
      </Callout>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        The Overview is your mission-critical home screen. It refreshes automatically and surfaces the metrics that matter most: agent health, active incidents, spend velocity, and recent deployments.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">What you see</p>
        <div className="space-y-2">
          <FeatureRow icon={Activity} label="System Health Bar" desc="Aggregated health across all services. Green = all good. Amber = degraded. Red = outage. Click any segment to jump to Incidents." />
          <FeatureRow icon={TrendingUp} label="Live Stats Row" desc="Four real-time counters: Running Agents, Active Deployments, Open Incidents, and Today's AI Spend. These update every 5 seconds." />
          <FeatureRow icon={Zap} label="Quick Actions" desc="Four one-click shortcuts: Deploy Agent, Run Eval, New Workflow, and the Emergency Kill Switch (red). Kill Switch stops all running agents immediately." />
          <FeatureRow icon={Bot} label="Agent Status Grid" desc="Every deployed agent as a card: name, model, status badge (Running / Idle / Error), last run time, and cost today. Click a card to open the agent detail view." />
          <FeatureRow icon={DollarSign} label="Cost Burn Chart" desc="7-day rolling spend plotted as an area chart. The dotted line is your daily budget. Hovering a point shows the exact date and amount." />
          <FeatureRow icon={AlertTriangle} label="Top Issues" desc="The three most recent open or investigating incidents, ranked by severity. Click any row to open the full incident timeline." />
          <FeatureRow icon={Rocket} label="Recent Deploys" desc="Last five deployments across all environments: status, branch, author, and how long ago. Green = success, red = failed, blue = in progress." />
        </div>
      </div>
      <Callout icon={Info} color="#60A5FA" title="Auto-refresh">
        Live Polling is on by default (every 5 s). You can slow it down or turn it off entirely in <strong className="text-foreground">Settings → Appearance → Live Polling</strong>.
      </Callout>
    </div>
  );
}

function AIAgentsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        AI Agents are autonomous workers that execute tasks on your behalf — code reviews, bug hunting, test generation, deployment checks, and more. Each agent runs on a model of your choice and reports back costs and outcomes.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Agent lifecycle</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Play} label="Deploying" desc="Agent is being provisioned. Usually takes under 10 seconds. Status turns Running once it starts executing tasks." />
          <FeatureRow icon={CheckCircle2} label="Running" desc="Actively executing. You'll see live token usage, elapsed time, and current task in the detail view." />
          <FeatureRow icon={Activity} label="Idle" desc="Finished its last run, waiting for the next trigger (schedule, webhook, or manual)." />
          <FeatureRow icon={AlertTriangle} label="Error" desc="Failed — click the agent card to see the full error trace and retry or edit the config." />
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">How to create an agent</p>
        <Step n={1} title="Click Deploy Agent or use a Template">From the Overview quick actions, or go to AI Agents and click <strong className="text-foreground">Create Agent</strong>. You can also use one of the 8 pre-built templates (Code Reviewer, Security Scanner, Test Writer, etc.) — click <strong className="text-foreground">Use Template</strong> to pre-fill the builder instantly.</Step>
        <Step n={2} title="Choose a model and strategy">Select Claude, GPT-4, or Gemini. Set the model strategy: <strong className="text-foreground">Auto</strong> (picks the best tier per task), <strong className="text-foreground">Cost-First</strong> (always cheapest), or <strong className="text-foreground">Quality-First</strong> (always best model).</Step>
        <Step n={3} title="Write or link a system prompt">Write the prompt directly, or choose <strong className="text-foreground">Use from Prompt Studio</strong> to link a versioned prompt. Linked prompts auto-update when you activate a new version in Prompt Studio.</Step>
        <Step n={4} title="Set triggers and schedule">Agents can run on a schedule (cron), on webhook events (GitHub PR opened), or manually on demand.</Step>
        <Step n={5} title="Set a cost cap">Optional but recommended. Set a per-run token limit or daily spend cap so a runaway agent can&apos;t drain your budget.</Step>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Agent templates</p>
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          The Agents page shows a horizontally scrollable row of 8 pre-built templates: Code Reviewer, Security Scanner, Documentation Writer, Data Pipeline Agent, Test Writer, Performance Optimizer, API Designer, and Incident Responder. Each comes with a full system prompt, recommended model, and strategy — click <strong className="text-foreground">Use Template</strong> to pre-fill the Agent Builder and deploy in seconds.
        </p>
      </div>
      <Callout icon={Lightbulb} color="#F59E0B" title="Run Eval">
        Use <strong className="text-foreground">Evals</strong> to create automated test suites for your agents. Define test cases with pass criteria and run them to measure quality over time. Access via the sidebar or the Overview &ldquo;Run Eval&rdquo; button.
      </Callout>
    </div>
  );
}

function WorkflowsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Workflows chain multiple agents together into a pipeline. The output of one agent feeds as input to the next — enabling complex automations like &ldquo;analyse PR → write tests → run tests → comment results&rdquo;.
      </p>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Workflow anatomy</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={GitBranch} label="Steps" desc="Each step is one agent. Steps run sequentially — the output of step N becomes the input of step N+1. This creates a real pipeline." />
          <FeatureRow icon={Play} label="Trigger" desc="Workflows can be triggered manually, on a schedule, or via an incoming webhook (e.g. a GitHub push event)." />
          <FeatureRow icon={CheckCircle2} label="Real execution" desc="Clicking Run calls each agent via the Anthropic API in sequence. Every run creates a WorkflowRun record with step-level results, cost, and duration." />
          <FeatureRow icon={AlertTriangle} label="Error handling" desc="Set each step to 'halt on error' or 'continue'. If a step fails, the run is marked as failed with the error message." />
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Example: PR review pipeline</p>
        <div className="rounded-xl border border-border bg-muted/20 p-4 font-mono text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
          <p><span className="text-[#00d992]">Step 1</span> — SecurityScanner: analyse diff for vulnerabilities</p>
          <p className="pl-4 text-muted-foreground/50">↓ output: {"{"} issues: [...] {"}"}</p>
          <p><span className="text-[#00d992]">Step 2</span> — TestWriter: write tests for changed functions</p>
          <p className="pl-4 text-muted-foreground/50">↓ output: {"{"} tests: &quot;...&quot; {"}"}</p>
          <p><span className="text-[#00d992]">Step 3</span> — PRCommenter: post summary as PR comment</p>
        </div>
      </div>
      <Callout icon={Info} color="#60A5FA" title="New Workflow shortcut">
        Click <strong className="text-foreground">New Workflow</strong> on the Overview page to create a workflow without leaving your current context. You can also navigate directly with <Kbd>g</Kbd><Kbd>w</Kbd>.
      </Callout>
    </div>
  );
}

function DeploymentsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        The Deployments section tracks every release across all environments — production, staging, and preview. It shows who deployed what, from which branch, and the live status.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">What&apos;s tracked</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Rocket} label="Deployment history" desc="Every deploy with author, commit SHA, branch, target environment, and duration. Click any row for the full build log." />
          <FeatureRow icon={Activity} label="Environment health" desc="Live status of Production, Staging, and Preview environments: healthy, degraded, or down — updated in real time." />
          <FeatureRow icon={GitBranch} label="Feature flags" desc="Toggle features on/off per environment without redeploying. Useful for gradual rollouts and A/B tests." />
          <FeatureRow icon={AlertTriangle} label="Rollback" desc="One-click rollback to any previous successful deployment. The rollback itself is tracked as a new deployment event." />
        </div>
      </div>
      <Callout icon={Lightbulb} color="#F59E0B" title="Connect your CI/CD">
        Go to <strong className="text-foreground">Settings → Integrations</strong> and connect GitHub or your CI provider. Deployment events will then be captured automatically on every push to main.
      </Callout>
    </div>
  );
}

function CostsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Costs & Billing keeps your AI spend under control. Set budgets, see breakdowns by agent and model, download invoices, and get alerted before you go over.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Key features</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={DollarSign} label="Daily cost burn" desc="7-day area chart vs your daily budget line. Spot trends before they become problems." />
          <FeatureRow icon={Bot} label="Cost by agent" desc="Bar chart showing which agents are the most expensive. Great for identifying runaway agents or inefficient prompts." />
          <FeatureRow icon={TrendingUp} label="Model breakdown" desc="See spend split by provider/model so you can make informed decisions about which model to use for which task." />
          <FeatureRow icon={Bell} label="Budget alerts" desc="Set a daily budget. When spend crosses it you'll be notified via Slack, email, or in-app — whichever you've enabled." />
          <FeatureRow icon={Shield} label="Invoices" desc="Download monthly PDF invoices from the Billing tab. Useful for accounting and expense reporting." />
        </div>
      </div>
      <Callout icon={Info} color="#60A5FA" title="Per-agent caps">
        You can set a per-agent daily spend cap in the agent builder. This is separate from the global budget alert and hard-stops the agent if hit.
      </Callout>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Agent Analytics gives you four lenses on how your agents are performing: execution outcomes (Performance), spend efficiency (Costs), model usage (Usage), and reliability (Agent Health).
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Four tabs</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Activity} label="Performance" desc="Total runs, success rate %, average run duration, and a daily chart of successful vs failed runs. Use this to catch reliability regressions early." />
          <FeatureRow icon={DollarSign} label="Costs" desc="Cost per run, most expensive agent, cost efficiency score, and a per-agent spend bar chart. Use this to optimise where your budget goes." />
          <FeatureRow icon={BarChart3} label="Usage" desc="Token consumption over time (input vs output), average tokens per run, and a model breakdown showing how many calls hit each provider." />
          <FeatureRow icon={AlertTriangle} label="Agent Health" desc="Health score (0-100) per agent based on error rate, with sparkline trends. Drift detection flags agents whose score drops 10+ points below their average with an amber badge." />
        </div>
      </div>
      <Callout icon={Lightbulb} color="#F59E0B" title="Drift detection">
        The Agent Health tab automatically detects performance drift. If an agent&apos;s health score drops significantly, it shows a &ldquo;Drift&rdquo; badge — investigate before it impacts users.
      </Callout>
    </div>
  );
}

function LogsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        The Logs page is a unified stream of everything that happened across your project: agent runs, API calls, deployment events, authentication, and system errors.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Log features</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Terminal} label="Live tail" desc="New log lines stream in as they happen. Toggle the live mode button to pause if you need to read without the screen jumping." />
          <FeatureRow icon={ScrollText} label="Filtering" desc="Filter by level (info / warn / error), source (agent name, service), or search free-text. Filters are additive — combine them freely." />
          <FeatureRow icon={Activity} label="Log levels" desc="Error (red) → Warn (amber) → Info (muted) → Debug (dimmed). Set the log level per agent in its config to reduce noise." />
          <FeatureRow icon={Shield} label="Retention" desc="Configurable in Settings → Data & Privacy. Default is 30 days. Extend for compliance needs or reduce to save storage." />
        </div>
      </div>
      <Callout icon={Info} color="#60A5FA" title="Debugging tip">
        When an agent errors, jump straight to Logs and filter by that agent&apos;s name. The full exception trace and the input that caused it will be there.
      </Callout>
    </div>
  );
}

function TeamSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        The Team page manages who has access to your project and what they can do. Roles are scoped per project — the same user can be an Admin on one project and a Viewer on another.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Roles</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Shield} label="Owner" desc="Full control. Can delete the project, manage billing, and transfer ownership. Only one owner per project." />
          <FeatureRow icon={Settings} label="Admin" desc="Can invite/remove members, create and kill agents, configure integrations, and manage incidents." />
          <FeatureRow icon={Users} label="Member" desc="Can deploy agents, trigger workflows, and view all data. Cannot manage team or billing." />
          <FeatureRow icon={ScrollText} label="Viewer" desc="Read-only access. Can see dashboards and logs but cannot make any changes." />
        </div>
      </div>
      <Callout icon={Lightbulb} color="#F59E0B" title="Inviting members">
        Enter the person&apos;s email and select their role. They&apos;ll receive an email invite. If <strong className="text-foreground">ALLOW_REGISTRATION</strong> is disabled in your env, invites are the only way to access the system.
      </Callout>
    </div>
  );
}

function IncidentsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        The Incidents page is your war room for outages and anomalies. It tracks every incident from detection to resolution, with a full timeline of actions and an on-call schedule so the right person is always paged.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Incident flow</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Flame} label="Open" desc="Incident detected — either by an alert rule or manually created. Assignee is notified via configured channels." />
          <FeatureRow icon={Activity} label="Investigating" desc="Someone has acknowledged and is actively working the incident. Timeline entries track their findings." />
          <FeatureRow icon={CheckCircle2} label="Resolved" desc="Issue is fixed and confirmed stable. Resolution notes are added to the timeline for post-mortems." />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Alert rules</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Bell} label="Creating a rule" desc="Choose a metric (e.g. api.error_rate), operator (gt / lt / eq), threshold, and notification channels. The rule fires whenever the condition is met." />
          <FeatureRow icon={AlertTriangle} label="Severity" desc="P1 (critical, page immediately), P2 (high, notify within 15 min), P3 (medium, email digest). Set severity when creating the incident or rule." />
          <FeatureRow icon={Users} label="On-call schedule" desc="Define who is on-call each week in the On-Call tab. The scheduled person is auto-assigned when a P1 alert fires." />
        </div>
      </div>
      <Callout icon={Info} color="#60A5FA" title="Red badge in sidebar">
        The number on the Incidents nav item shows open + investigating incidents. It turns red when any P1 is open — you can&apos;t miss it.
      </Callout>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Settings is the control panel for your project. Everything from the project name and logo to security policies and integrations lives here.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Sections</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Settings} label="General" desc="Project name, description, logo URL, and timezone. The name and logo appear in the sidebar project switcher." />
          <FeatureRow icon={Palette} label="Appearance" desc="Switch between dark, light, and system themes. Enable or disable live polling and set the interval." />
          <FeatureRow icon={Bell} label="Notifications" desc="Configure the cost anomaly auto-pause: set a threshold for hourly agent spend. When exceeded, the agent is paused automatically and you get a notification." />
          <FeatureRow icon={Shield} label="Security" desc="Session timeout length, require 2FA for the whole project, SSO configuration, and recent login activity." />
          <FeatureRow icon={Activity} label="API Keys" desc="Create API keys with scopes (read, write, ingest) to let external tools and agents send data to MOTHERSHIP. Keys start with mc_ and can be revoked." />
          <FeatureRow icon={Link2} label="Integrations" desc="Connect AI providers (Anthropic, OpenAI, Google AI) by adding API keys. Keys are encrypted at rest. Also connect GitHub, Slack, and other services." />
          <FeatureRow icon={AlertTriangle} label="Danger Zone" desc="Destructive actions: pause all agents, reset settings, export all data, or delete the project. All require confirmation." />
        </div>
      </div>
      <Callout icon={Info} color="#60A5FA" title="Logo tip">
        Upload your logo to any public image host (e.g. Cloudinary, GitHub raw, or your own CDN) and paste the URL into Settings → General → Logo URL. It appears instantly in the sidebar.
      </Callout>
    </div>
  );
}

function ProjectsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        MOTHERSHIP is multi-project from day one. Each project gets its own completely isolated dashboard — separate agents, deployments, incidents, costs, and team members.
      </p>
      <div className="space-y-3">
        <Step n={1} title="Open the project switcher">
          Click the project name at the very top of the sidebar (below the MOTHERSHIP logo). A panel drops down showing all your projects.
        </Step>
        <Step n={2} title="Create a new project">
          Click <strong className="text-foreground">Add project</strong> at the bottom of the panel. Enter a name and optional description. The dashboard immediately clears to a clean, empty state for the new project.
        </Step>
        <Step n={3} title="Switch between projects">
          Click any project name in the dropdown. All dashboard data instantly switches to that project&apos;s context — agents, costs, incidents, everything.
        </Step>
        <Step n={4} title="Customise the project">
          Head to <strong className="text-foreground">Settings → General</strong> to add a logo URL and description for the active project. These are saved per-project and appear in the switcher dropdown.
        </Step>
      </div>
      <Callout icon={Info} color="#60A5FA" title="Where projects are stored">
        Projects are saved to your browser&apos;s localStorage, so they persist across page refreshes. In a full deployment, projects are stored in the database and tied to your user account — accessible from any device.
      </Callout>
    </div>
  );
}

function PromptStudioSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Prompt Studio is a dedicated environment for writing, testing, versioning, and managing the system prompts that power your AI agents. Instead of editing prompts inline in the agent config, you manage them centrally — change a prompt once and it propagates to every agent using it.
      </p>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Three tabs</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Terminal} label="Editor" desc="Monospace editor with line numbers, live token counter, and inline name editing. Each save creates a new version — nothing is ever overwritten." />
          <FeatureRow icon={Play} label="Playground" desc="Test your prompt against any Claude model (Haiku, Sonnet, Opus) with adjustable temperature and max tokens. Output streams in real-time in a terminal panel with cost and token stats." />
          <FeatureRow icon={Activity} label="Versions" desc="Full version history with side-by-side diff viewer (green for added, red for removed, amber for changed). Activate any version, or restore an old version to the editor." />
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Agent linking</p>
        <Step n={1} title="Create a prompt in Prompt Studio">Write and test your system prompt. Save it — it becomes v1 and is automatically active.</Step>
        <Step n={2} title="Link it to an agent">In the Agent Builder (Step 3 — System Prompt), choose &ldquo;Use from Prompt Studio&rdquo; and select your prompt from the dropdown.</Step>
        <Step n={3} title="Update without touching the agent">When you save a new version in Prompt Studio and activate it, the agent automatically uses the new version on its next run. No agent config change needed.</Step>
      </div>
      <Callout icon={Lightbulb} color="#F59E0B" title="Version notes">
        Always add a note when saving a new version (e.g. &ldquo;Added error handling instructions&rdquo;). This makes it easy to find and compare versions later.
      </Callout>
    </div>
  );
}

function EvalsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Evals let you create automated test suites that measure and track agent quality over time. Define test cases with pass criteria, run them against an agent, and see a scored report showing exactly which cases passed or failed and why.
      </p>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">How it works</p>
        <Step n={1} title="Create an eval suite">Give it a name and select which agent to test. Use the 3-step wizard to set everything up.</Step>
        <Step n={2} title="Add test cases">Each case has an input (what to send the agent) and one or more pass criteria (what the output must satisfy).</Step>
        <Step n={3} title="Run the suite">Click &ldquo;Run&rdquo; — each case is sent to the agent, the output is scored against all criteria, and you get an overall score (0-100%).</Step>
        <Step n={4} title="Track quality over time">Run the suite regularly. The score history shows trends — catch regressions before they reach users.</Step>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Scoring methods</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={CheckCircle2} label="String matching" desc="Fast checks like 'mentions pricing', 'under 100 words', 'includes code block', 'starts with', 'does not mention [X]'. Instant, deterministic." />
          <FeatureRow icon={Shield} label="AI Judge" desc="For complex criteria like 'is professional tone' or 'answers the question correctly'. Uses claude-haiku-4-5 as an impartial judge — responds PASS or FAIL." />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Results breakdown</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Activity} label="Score history" desc="Bar chart of scores across runs. See trends and catch regressions at a glance." />
          <FeatureRow icon={AlertTriangle} label="Failed cases" desc="Auto-expanded in results view. Shows exactly which criteria failed, the full agent output, and whether it was string match or AI judge." />
          <FeatureRow icon={TrendingUp} label="Notifications" desc="Auto-notification on completion: green if ≥80%, amber if 60-79%, red if under 60%." />
        </div>
      </div>
      <Callout icon={Info} color="#60A5FA" title="Run Eval from Overview">
        The &ldquo;Run Eval&rdquo; button on the Overview quick actions lets you pick a suite and run it without leaving the home screen.
      </Callout>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        MOTHERSHIP has a built-in notification system that alerts you to important events — agent runs, workflow completions, eval results, and cost threshold breaches. Notifications appear in the bell icon in the topbar.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">What triggers notifications</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={CheckCircle2} label="Agent run completed" desc="Agent name, duration, and cost. Links to the agent detail page." />
          <FeatureRow icon={AlertTriangle} label="Agent run failed" desc="Agent name and error message. Click to investigate." />
          <FeatureRow icon={Activity} label="Workflow completed/failed" desc="Workflow name, step count, and duration or failure point." />
          <FeatureRow icon={FlaskConical} label="Eval completed" desc="Suite name and score. Color-coded: green ≥80%, amber 60-79%, red <60%." />
          <FeatureRow icon={DollarIcon} label="Agent auto-paused" desc="Triggered when hourly spend exceeds your threshold. Shows the spend amount." />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Features</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Bell} label="Unread badge" desc="Red badge on the bell icon shows unread count (1-9, or 9+). Pulses when new notifications arrive." />
          <FeatureRow icon={Activity} label="30-second polling" desc="Notifications refresh every 30 seconds. No manual refresh needed." />
          <FeatureRow icon={CheckCircle2} label="Mark all read" desc="One-click button in the notification panel header." />
        </div>
      </div>
      <Callout icon={Lightbulb} color="#F59E0B" title="Cost anomaly auto-pause">
        Go to <strong className="text-foreground">Settings → Notifications</strong> to configure the auto-pause threshold. When an agent&apos;s hourly spend exceeds the limit, it&apos;s automatically paused and you get a warning notification.
      </Callout>
    </div>
  );
}

function ExternalAgentsSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Already running AI agents with CrewAI, LangGraph, AutoGen, or your own custom framework? You don&apos;t need to rebuild them inside MOTHERSHIP. Connect them in minutes and get full visibility — costs, performance, and status — all in one dashboard.
      </p>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">How it works</p>
        <Step n={1} title="Create an API key">
          Go to <strong className="text-foreground">Settings → API Keys</strong> and click <strong className="text-foreground">Create API Key</strong>. Give it a name (e.g. &ldquo;My CrewAI App&rdquo;) and select the <strong className="text-foreground">Ingest</strong> scope. Copy the key — it starts with <code className="text-[#00d992] text-[11px]">mc_</code>.
        </Step>
        <Step n={2} title="Add a few lines to your existing code">
          After each agent run in your app, send a POST request to MOTHERSHIP&apos;s ingest endpoint. This tells the dashboard what happened — which agent ran, how long it took, and what it cost.
        </Step>
        <Step n={3} title="See your agents on the dashboard">
          External agents appear automatically on the <strong className="text-foreground">Overview</strong> page. You&apos;ll see their run history, costs, and performance alongside any agents you created natively in MOTHERSHIP.
        </Step>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Option A — cURL / any language</p>
        <div className="rounded-xl border border-border bg-[#050507] p-4 font-mono text-[11px] text-[#f2f2f2] overflow-x-auto whitespace-pre leading-relaxed">{`curl -X POST https://your-dashboard.com/api/events/ingest \\
  -H "Authorization: Bearer mc_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "agent.run.completed",
    "source": "my-app",
    "agent": { "id": "agent-1", "name": "My Agent" },
    "data": { "cost": 0.05, "duration": 3000 }
  }'`}</div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Option B — JavaScript / TypeScript SDK</p>
        <div className="rounded-xl border border-border bg-[#050507] p-4 font-mono text-[11px] text-[#f2f2f2] overflow-x-auto whitespace-pre leading-relaxed">{`npm install @mothership/sdk`}</div>
        <div className="rounded-xl border border-border bg-[#050507] p-4 font-mono text-[11px] text-[#f2f2f2] overflow-x-auto whitespace-pre leading-relaxed">{`import { Mothership } from '@mothership/sdk'

const mc = new Mothership({
  url: 'https://your-dashboard.com',
  apiKey: 'mc_your_key',
  source: 'my-crewai-app',
})

// After each agent run:
await mc.trackRun({
  agent: { id: 'agent-1', name: 'Research Agent' },
  status: 'completed',
  cost: 0.05,
  duration: 3000,
})`}</div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Supported event types</p>
        <div className="rounded-xl border border-border bg-card/50 divide-y divide-border/50">
          <FeatureRow icon={Play} label="agent.run.started" desc="Agent began executing. Marks it as Running on the dashboard." />
          <FeatureRow icon={CheckCircle2} label="agent.run.completed" desc="Agent finished successfully. Includes cost, duration, and token usage." />
          <FeatureRow icon={AlertTriangle} label="agent.run.failed" desc="Agent errored. Include an error message so it shows up in the Logs page." />
          <FeatureRow icon={DollarSign} label="agent.cost.reported" desc="Report cost data separately from run events — useful for batch billing reconciliation." />
        </div>
      </div>

      <Callout icon={Lightbulb} color="#F59E0B" title="Works with any framework">
        CrewAI, LangGraph, AutoGen, Semantic Kernel, custom Python scripts — anything that can make an HTTP request can report to MOTHERSHIP. You only need to add 3-5 lines of code to your existing agent runner.
      </Callout>

      <Callout icon={Info} color="#60A5FA" title="API key scopes">
        For external agents, you only need the <strong className="text-foreground">Ingest</strong> scope. This keeps the key limited to sending events — it can&apos;t read or modify anything else on your dashboard.
      </Callout>
    </div>
  );
}

function ShortcutsSection() {
  const shortcuts = [
    { keys: ["Ctrl", "K"], desc: "Open command palette — search for any page or action" },
    { keys: ["?"],         desc: "Show / hide keyboard shortcuts overlay" },
    { keys: ["g", "o"],   desc: "Go to Overview" },
    { keys: ["g", "a"],   desc: "Go to AI Agents" },
    { keys: ["g", "w"],   desc: "Go to Workflows" },
    { keys: ["g", "d"],   desc: "Go to Deployments" },
    { keys: ["g", "$"],   desc: "Go to Costs & Billing" },
    { keys: ["g", "n"],   desc: "Go to Analytics" },
    { keys: ["g", "l"],   desc: "Go to Logs" },
    { keys: ["g", "t"],   desc: "Go to Team" },
    { keys: ["g", "!"],   desc: "Go to Incidents" },
    { keys: ["g", "s"],   desc: "Go to Settings" },
    { keys: ["Esc"],      desc: "Close any open dialog or modal" },
  ];
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        MOTHERSHIP is built for keyboard-first navigation. Most actions have a shortcut so you never have to leave the keyboard during an incident.
      </p>
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-2.5 border-b border-border/40 last:border-0">
            <div className="flex items-center gap-1 shrink-0 w-28">
              {s.keys.map((k, ki) => (
                <span key={ki} className="flex items-center gap-1">
                  {ki > 0 && <span className="text-muted-foreground/30 text-[10px]">then</span>}
                  <Kbd>{k}</Kbd>
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{s.desc}</span>
          </div>
        ))}
      </div>
      <Callout icon={Lightbulb} color="#F59E0B" title="g + key navigation">
        The <Kbd>g</Kbd> key is a leader key. Press and hold, then press the second key within 800ms. When you press <Kbd>g</Kbd> you&apos;ll see shortcut hints appear next to each nav item.
      </Callout>
    </div>
  );
}

const SECTION_CONTENT: Record<string, React.ReactNode> = {
  "getting-started":  <GettingStarted />,
  "overview":         <OverviewSection />,
  "ai-agents":        <AIAgentsSection />,
  "workflows":        <WorkflowsSection />,
  "deployments":      <DeploymentsSection />,
  "costs":            <CostsSection />,
  "analytics":        <AnalyticsSection />,
  "logs":             <LogsSection />,
  "team":             <TeamSection />,
  "incidents":        <IncidentsSection />,
  "settings":         <SettingsSection />,
  "projects":         <ProjectsSection />,
  "prompt-studio":    <PromptStudioSection />,
  "evals":            <EvalsSection />,
  "notifications":    <NotificationsSection />,
  "external-agents":  <ExternalAgentsSection />,
  "shortcuts":        <ShortcutsSection />,
};

// ── Main page ──────────────────────────────────────────────────────────────────
function TutorialPageInner() {
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section");
  const initialId = requestedSection && SECTIONS.some((s) => s.id === requestedSection)
    ? requestedSection
    : "getting-started";
  const [activeId, setActiveId] = useState(initialId);

  // Keep section in sync if the URL changes while on page
  useEffect(() => {
    if (requestedSection && SECTIONS.some((s) => s.id === requestedSection)) {
      setActiveId(requestedSection);
    }
  }, [requestedSection]);

  const active = SECTIONS.find((s) => s.id === activeId)!;
  const ActiveIcon = active.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#00d992]/10 border border-[#00d992]/20">
          <BookOpen className="size-5 text-[#00d992]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Tutorial</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Everything you need to know about MOTHERSHIP — from first login to advanced agent pipelines.
          </p>
        </div>
      </div>

      {/* Section grid (table of contents) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {SECTIONS.map((s) => (
          <SectionCard
            key={s.id}
            section={s}
            active={s.id === activeId}
            onClick={() => setActiveId(s.id)}
          />
        ))}
      </div>

      {/* Active section detail */}
      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <ActiveIcon className="size-5 shrink-0" style={{ color: active.color }} />
          <div>
            <h2 className="text-sm font-bold text-foreground">{active.label}</h2>
            <p className="text-xs text-muted-foreground">{active.tagline}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/40">
            <ChevronRight className="size-3" />
            <span>Tutorial</span>
            <ChevronRight className="size-3" />
            <span className="text-muted-foreground/70">{active.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {SECTION_CONTENT[activeId]}
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <button
            onClick={() => {
              const idx = SECTIONS.findIndex((s) => s.id === activeId);
              if (idx > 0) setActiveId(SECTIONS[idx - 1].id);
            }}
            disabled={SECTIONS[0].id === activeId}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-[10px] text-muted-foreground/40">
            {SECTIONS.findIndex((s) => s.id === activeId) + 1} / {SECTIONS.length}
          </span>
          <button
            onClick={() => {
              const idx = SECTIONS.findIndex((s) => s.id === activeId);
              if (idx < SECTIONS.length - 1) setActiveId(SECTIONS[idx + 1].id);
            }}
            disabled={SECTIONS[SECTIONS.length - 1].id === activeId}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams requires it under Next.js App Router
export default function TutorialPage() {
  return (
    <Suspense fallback={<div className="py-24 flex justify-center"><div className="size-6 rounded-full border-2 border-[#00d992]/20 border-t-[#00d992] animate-spin" /></div>}>
      <TutorialPageInner />
    </Suspense>
  );
}
