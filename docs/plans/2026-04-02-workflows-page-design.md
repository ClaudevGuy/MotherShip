# Workflows Page — Visual Pipeline Builder

**Date:** 2026-04-02
**Status:** Approved

## Goal

Build a complete Workflows page with a visual pipeline builder using React Flow for chaining AI agents into automated pipelines. Zero mock data — everything from the database.

## Existing Foundation

Already built and functional:
- Prisma models: Workflow, WorkflowStep
- API routes: CRUD + execution engine (GET/POST/PATCH/DELETE /api/workflows, POST /api/workflows/[id]/run)
- Zustand store: workflows-store.ts
- Basic list page with cards, run panel, delete
- NewWorkflowModal with dual-panel builder
- Zod validation schemas

## What To Build (Delta)

### 1. Schema Changes

Add to Workflow model:
```prisma
trigger     Json?    // { type: "manual"|"schedule"|"webhook"|"event", config: {} }
```

New model:
```prisma
model WorkflowRun {
  id          String    @id @default(cuid())
  workflowId  String
  status      String    @default("running")
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  duration    Int?
  stepResults Json?
  triggeredBy String?
  error       String?
  workflow    Workflow   @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  @@index([workflowId])
  @@index([workflowId, startedAt])
}
```

### 2. New API Routes

- GET /api/workflows/[id]/runs — paginated run history
- GET /api/workflows/[id]/runs/[runId] — single run detail

Update existing POST /api/workflows/[id]/run to create WorkflowRun records.

### 3. Workflows List Page (Enhanced)

Replace current page with enhanced version:
- Stats bar (active/paused/runs today counts from API)
- Enhanced cards: trigger type icon, success rate, next run, agent chain preview
- Empty state with CTA to create first workflow
- Click card → slide-over detail panel

### 4. Workflow Detail Slide-Over

600px panel from right with backdrop blur:
- Tabs: Overview | Run History | Settings
- Overview: visual pipeline diagram (read-only React Flow), stats per step
- Run History: table of runs from /api/workflows/[id]/runs
- Settings: trigger config, timeout, failure behavior

### 5. Workflow Builder (React Flow Canvas)

Route: /workflows/builder (new) and /workflows/[id]/edit (existing)

**Tech:** @xyflow/react for the canvas

**Layout:** 3 columns
- Left panel (240px): agent list from API + trigger types, draggable
- Canvas (flex-1): React Flow with custom nodes, dot-grid background
- Right config panel (280px): shows when node selected

**Custom Node Types:**
- TriggerNode: purple accent (#A855F7), diamond-style, output port only
- AgentNode: dark card (180x80px), agent name + model badge, input + output ports
- EndNode: green accent (#39FF14), circle, input port only

**Custom Edge:** Cyan animated flowing dots using CSS animation on SVG path

**Canvas Features:** zoom/pan (React Flow built-in), minimap, fit-to-screen controls

**Saving:** Serialize React Flow nodes/edges to JSON, save to Workflow.steps via PUT API

### 6. Builder Zustand Store

```typescript
interface BuilderStore {
  nodes: Node[]
  edges: Edge[]
  selectedNodeId: string | null
  isDirty: boolean
  // actions
  addNode, removeNode, updateNodeConfig
  addEdge, removeEdge
  setSelected
  loadFromWorkflow(workflow)
  serializeToJson()
  setDirty
}
```

### 7. Validation Before Activation

- Exactly 1 trigger node
- At least 1 agent node
- All agent nodes connected (no orphans)
- All agent nodes reference valid agentId
- Show inline errors, disable Activate button with tooltip

### 8. Workflow Run Detail Page

Route: /workflows/[id]/runs/[runId]

Step timeline with status indicators:
- Pending (grey), Running (cyan spinner), Success (green check), Failed (red X), Skipped (grey dash)
- Collapsible input/output per step
- Summary card: total tokens, cost, duration, steps completed/failed

## Design Tokens

Canvas background: var(--bg-primary) with dot-grid
Node background: var(--bg-card)
Node border: var(--border), selected: #00D4FF with glow
Trigger node: #A855F7
End node: #39FF14
Connection line: #00D4FF at 60% opacity, animated dots
Error branch: #EF4444 dashed

## No Mock Data Rule

Every number, name, status, and timestamp comes from the database API. Empty states shown when no data exists.
