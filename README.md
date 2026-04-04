# Mission Control

AI-powered operations dashboard for managing AI agents, deployments, costs, and team — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8)

## What is Mission Control?

Mission Control is a full-stack admin dashboard for AI-powered projects. It gives you visibility into:

- **AI Agents** — Create, configure, and execute AI agents with real-time streaming output
- **Prompt Studio** — Write, test, version, and manage agent prompts with a built-in playground
- **Evals** — Automated test suites for measuring agent quality with string matching + AI judge scoring
- **Workflows** — Visual pipeline builder (React Flow) for chaining agents together
- **Costs & Billing** — Track spend per agent, per model, with auto-selection savings and cost anomaly auto-pause
- **Deployments** — Service deployment tracking across dev/staging/production
- **Logs & Observability** — Unified log stream, LLM call inspection, traces
- **Incidents** — Alert rules, on-call scheduling, incident management
- **Analytics** — User engagement, growth metrics, agent performance, health drift detection
- **Notifications** — Real-time notification system with auto-alerts on agent runs, workflow completions, and cost thresholds
- **Team** — Member management, role-based access, API keys
- **Settings** — Project config, integrations, appearance, auto-pause thresholds

## Quick Start

### Prerequisites

- Node.js 18+
- A PostgreSQL database ([Neon](https://neon.tech) free tier works great)

### 1. Clone and install

```bash
git clone https://github.com/ClaudevGuy/mission-control.git
cd mission-control
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in these required values:

```env
# Get from neon.tech dashboard (or any PostgreSQL provider)
DATABASE_URL=postgresql://user:pass@host/dbname

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-here

# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=your-random-hex-here
```

### 3. Set up the database

```bash
npx prisma db push    # Create all tables
npx prisma db seed    # Create default project + admin user
```

### 4. Start the dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the empty dashboard ready to use.

## Adding AI Providers

To run AI agents, you need at least one AI provider API key.

### Option A: Through the UI

1. Go to **Settings > Integrations > + Add Integration**
2. Enter the service name (e.g. "Anthropic") and paste your API key
3. The key is encrypted and stored in the database
4. Create an agent and run it — it uses the key automatically

### Option B: Through .env

```env
# Anthropic (Claude) — get from console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI — get from platform.openai.com
OPENAI_API_KEY=sk-...

# Google AI — get from aistudio.google.com
GOOGLE_AI_API_KEY=...
```

Restart the dev server after adding keys to `.env`.

## Core Features

### AI Agent Execution

Agents execute with real-time streaming via Anthropic's API:

1. **Create an agent** — Agent Builder wizard (7 steps: identity, model strategy, system prompt, tools, memory, triggers, review)
2. **Execute it** — Go to agent detail > Execution tab > type a task > click Run
3. **Watch live output** — Tokens stream in real-time in a terminal-style panel
4. **See results** — Token count, cost, duration, model used — all tracked

### Agent Templates

8 pre-built agent templates on the Agents page for 1-click deployment:

- **Code Reviewer** — Reviews code for bugs, security, and best practices (Sonnet, Auto)
- **Security Scanner** — Analyzes code for security vulnerabilities (Opus, Quality-First)
- **Documentation Writer** — Generates technical docs from code (Haiku, Cost-First)
- **Data Pipeline Agent** — Processes and validates data pipelines (Haiku, Cost-First)
- **Test Writer** — Generates comprehensive test suites (Sonnet, Auto)
- **Performance Optimizer** — Identifies performance bottlenecks (Sonnet, Auto)
- **API Designer** — Designs RESTful/GraphQL APIs (Sonnet, Auto)
- **Incident Responder** — Analyzes incidents and suggests fixes (Opus, Quality-First)

Click "Use Template" to pre-fill the agent builder with the template's config and system prompt.

### Intelligent Model Selection

The system automatically picks the optimal model tier per task:

| Tier | Anthropic | OpenAI | Google |
|------|-----------|--------|--------|
| Tier 1 (complex) | claude-opus-4-6 | gpt-4o | gemini-2.5-pro |
| Tier 2 (balanced) | claude-sonnet-4-6 | gpt-4o-mini | gemini-2.0-flash |
| Tier 3 (simple) | claude-haiku-4-5 | gpt-3.5-turbo | gemini-1.5-flash-8b |

Safety guardrails ensure critical tasks always use Tier 1.

### Prompt Studio

A dedicated section for writing, testing, versioning, and managing agent prompts:

- **Editor** — Monospace editor with line numbers and live token counter
- **Playground** — Test prompts against any Claude model with streaming output (Haiku/Sonnet/Opus), adjustable temperature and max tokens
- **Version History** — Every save creates a new version. Side-by-side diff viewer to compare versions
- **Agent Linking** — Link a prompt to an agent. When the active version changes, the agent automatically uses the new version on its next run — no agent config change needed

### Evals (Automated Testing)

Create test suites to measure and track agent quality over time:

1. **Create a suite** — Name it, pick an agent, and add test cases
2. **Define test cases** — Input text + pass criteria (e.g. "mentions pricing", "under 100 words", "is professional tone")
3. **Run the suite** — Each case sends input to the agent, scores the output, and reports pass/fail
4. **Track quality** — Score history with sparklines, pass/fail breakdowns, case-by-case results

**Scoring engine** supports two methods:
- **String matching** — Fast, deterministic checks: `mentions [X]`, `under N words`, `includes code block`, `starts with`, `does not mention [X]`
- **AI Judge** — For complex criteria like tone, quality, or correctness: uses claude-haiku-4-5 to evaluate PASS/FAIL

### Visual Workflow Builder

Chain multiple agents into pipelines using a drag-and-drop canvas (React Flow):

- Custom node types: Trigger, Agent, End
- Animated connection edges
- Save/load canvas state
- Validation before activation
- **Real execution** — Workflows call agents via the sync endpoint, pipe output between steps, and save complete WorkflowRun records with step-level results

### Notification System

Real-time notifications with automatic alerts:

- **Bell icon** in topbar with unread count badge and pulse animation
- **Slide-over panel** — 380px wide, grouped by Today/Yesterday/Earlier
- **Auto-notifications** on: agent run success/failure, workflow completion/failure, eval completion, cost threshold exceeded, agent auto-paused
- **30-second polling** for new notifications
- API: mark read, mark all read, dismiss, delete

### Cost Anomaly Auto-Pause

Automatic protection against runaway agent costs:

- Configure in **Settings > Notifications**: toggle + hourly spend threshold (default $10)
- After every agent run, the system checks hourly spend for that agent
- If threshold exceeded: agent is automatically paused + warning notification created
- Paused agents can be resumed manually

### Performance Drift Detection

Agent health monitoring in the **Analytics > Agent Health** tab:

- Health score (0-100) per agent based on error rate and status
- Sparkline of recent scores
- Drift detection: amber badge when score drops 10+ points below average
- Trend indicators: ↑ Improving / ↓ Degrading / → Stable

### External Agent Integration

Connect agents from any external framework (Paperclip, CrewAI, LangGraph, etc.):

1. Create an API key in **Settings > API Keys**
2. Send events from your app:

```bash
curl -X POST https://your-dashboard.com/api/events/ingest \
  -H "Authorization: Bearer mc_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "agent.run.completed",
    "source": "my-app",
    "agent": { "id": "agent-1", "name": "My Agent" },
    "data": { "cost": 0.05, "duration": 3000 }
  }'
```

Or use the SDK:

```bash
npm install @mission-control/sdk
```

```typescript
import { MissionControl } from '@mission-control/sdk'

const mc = new MissionControl({
  url: 'https://your-dashboard.com',
  apiKey: 'mc_your_key',
  source: 'my-app',
})

await mc.trackRun({
  agent: { id: 'agent-1', name: 'My Agent' },
  status: 'completed',
  cost: 0.05,
  duration: 3000,
})
```

External agents appear automatically on the Overview page.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # All dashboard pages
│   │   ├── overview/         # Home dashboard
│   │   ├── agents/           # AI agents + builder + templates
│   │   ├── workflows/        # Pipeline builder (React Flow)
│   │   ├── prompts/          # Prompt Studio
│   │   ├── evals/            # Eval suites + results
│   │   ├── deployments/      # Deployment tracking
│   │   ├── costs/            # Cost & billing
│   │   ├── analytics/        # User + agent analytics + health
│   │   ├── logs/             # Log stream + LLM calls
│   │   ├── team/             # Team management
│   │   ├── incidents/        # Alerts & incidents
│   │   ├── settings/         # Project settings
│   │   ├── tutorial/         # Interactive tutorial
│   │   └── profile/          # User profile
│   └── api/                  # API routes
│       ├── agents/           # CRUD + execute (streaming) + execute-sync
│       ├── evals/            # Eval suites, cases, runs, execution engine
│       ├── prompts/          # Prompt CRUD, versioning, playground test
│       ├── events/ingest/    # External agent webhook
│       ├── workflows/        # Workflow CRUD + run pipeline
│       ├── notifications/    # List, read, read-all, delete
│       ├── costs/            # Cost aggregation
│       ├── team/             # Members, invites, API keys
│       └── ...
├── components/
│   ├── layout/               # Sidebar, Topbar, CommandPalette
│   ├── shared/               # Reusable (GlassPanel, MetricCard, etc.)
│   ├── overview/             # Overview page widgets
│   ├── workflows/            # React Flow nodes + edges
│   ├── agents/               # LiveExecutionPanel
│   └── team/                 # Invite modal, API key modal
├── stores/                   # Zustand state management
├── lib/                      # Utilities
│   ├── model-selector.ts     # AI model auto-selection engine
│   ├── agent-profiler.ts     # Task complexity profiler
│   ├── cost-guard.ts         # Cost anomaly auto-pause checker
│   ├── create-notification.ts # Notification helper
│   ├── store-cache.ts        # Session-based fetch cache
│   ├── api-client.ts         # Project-aware fetch wrapper
│   └── ...
├── types/                    # TypeScript interfaces
└── packages/sdk/             # @mission-control/sdk npm package
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **State**: Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Canvas**: React Flow (@xyflow/react)
- **AI**: Anthropic SDK (streaming + sync)
- **Auth**: NextAuth.js (optional)

## Customization

Everything is customizable:

- **Branding** — Change colors in `src/app/globals.css`, logo in `Sidebar.tsx`
- **Pages** — Add/remove pages in `src/app/(dashboard)/`
- **Navigation** — Edit `src/lib/constants.ts`
- **Database** — Modify `prisma/schema.prisma` and run `npx prisma db push`
- **Design system** — See `DESIGN.md` for the full design token reference

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Command palette |
| `?` | Show all shortcuts |
| `g o` | Go to Overview |
| `g a` | Go to Agents |
| `g w` | Go to Workflows |
| `g p` | Go to Prompt Studio |
| `g e` | Go to Evals |
| `g d` | Go to Deployments |
| `g $` | Go to Costs |
| `g n` | Go to Analytics |
| `g l` | Go to Logs |
| `g t` | Go to Team |
| `g s` | Go to Settings |

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables in the Vercel dashboard (same as `.env`).

## License

MIT
