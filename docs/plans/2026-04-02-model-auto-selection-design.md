# Intelligent Auto Model Selection System

**Date:** 2026-04-02
**Status:** Approved

## Goal

When an agent runs a task, the system automatically selects the optimal model within the agent's provider family based on task complexity — balancing cost efficiency without sacrificing output quality. The rule: never downgrade a model if it risks a worse outcome.

## Architecture: Runtime Selection

The model strategy is stored on the Agent (`modelStrategy`), but the actual model is selected at execution time. `Agent.model` stays as the provider (CLAUDE/GPT4/GEMINI), and before each run the execute endpoint calls `selectModel()` to resolve a specific model ID.

---

## 1. Core Engine

### Model Tiers Registry (`lib/model-selector.ts`)

Static map of provider to tier to model ID and cost rates:

| Provider | Tier 1 (Complex) | Tier 2 (Balanced) | Tier 3 (Simple) |
|----------|-------------------|-------------------|------------------|
| Anthropic | claude-opus-4-6 ($15/$75) | claude-sonnet-4-6 ($3/$15) | claude-haiku-4-5 ($0.80/$4) |
| OpenAI | gpt-4o ($2.50/$10) | gpt-4o-mini ($0.15/$0.60) | gpt-3.5-turbo ($0.50/$1.50) |
| Google | gemini-2.5-pro ($1.25/$10) | gemini-2.0-flash ($0.10/$0.40) | gemini-1.5-flash-8b ($0.0375/$0.15) |
| Custom | pass-through (no auto-selection) | | |

Cost rates in $/million tokens (input/output).

### Task Profiler (`lib/agent-profiler.ts`)

Builds a `TaskProfile` from agent config + task input:

```typescript
interface TaskProfile {
  agentType: string
  taskDescription: string
  expectedOutputTokens: number
  hasProductionAccess: boolean
  isRepetitive: boolean
  requiresReasoning: boolean
  errorCostHigh: boolean
  provider: 'anthropic' | 'openai' | 'google' | 'custom'
}
```

Signal derivation:
- `hasProductionAccess` — true if agent has tags "production"/"destructive" or tools "database"
- `isRepetitive` — true if `tasksCompleted > 50`
- `requiresReasoning` — true if system prompt contains reasoning keywords or `temperature < 0.3`
- `errorCostHigh` — true if tags include "critical"/"security"/"billing" or has production access

### Selection Algorithm

```
SAFETY OVERRIDES (always tier 1):
  - hasProductionAccess
  - errorCostHigh
  - requiresReasoning AND NOT isRepetitive
  - agentType is SecurityScanner
  - agent tagged "critical" or "destructive"
  - first run of a new agent (tasksCompleted === 0)

COMPLEXITY SCORING:
  score = 0
  +2 if expectedOutputTokens > 2000
  +1 if expectedOutputTokens > 500
  +2 if requiresReasoning
  -2 if isRepetitive
  +3 if agentType === SecurityScanner
  +2 if agentType === CodeReviewer
  -1 if agentType === DataPipelineAgent
  -1 if agentType === InfraMonitor

DECISION:
  score >= 4 → TIER_1
  score >= 1 → TIER_2
  score <  1 → TIER_3
```

Returns `ModelSelection`:
```typescript
interface ModelSelection {
  modelId: string       // e.g. "claude-sonnet-4-6"
  tier: 1 | 2 | 3
  reason: string        // human-readable explanation
  provider: string
  costRates: { input: number; output: number }
}
```

---

## 2. Schema Changes

### Agent Model — New Field

```prisma
modelStrategy  String  @default("auto")  // "auto" | "manual" | "cost_first" | "quality_first"
```

### LlmCall Model — New Fields

```prisma
selectedTier        Int?
selectionReason     String?
wasUpgraded         Boolean  @default(false)
originalTier        Int?
selectionDurationMs Int?
```

All nullable for backwards compatibility with existing records.

### TypeScript Types

- `Agent` interface: add `modelStrategy: "auto" | "manual" | "cost_first" | "quality_first"`
- `LLMCall` interface: add `selectedTier`, `selectionReason`, `wasUpgraded`, `originalTier`, `selectionDurationMs`
- `ModelProvider` type: unchanged
- New type: `ModelStrategy = "auto" | "manual" | "cost_first" | "quality_first"`

---

## 3. Execution Flow

### Modified `/api/agents/[id]/execute`

1. Load agent → get `agent.model` + `agent.modelStrategy`
2. Route by strategy:
   - **manual** → use `PROVIDER_DEFAULT_MODEL` (tier 2, same as today)
   - **auto** → call `profileTask()` then `selectModel()` → specific model ID + tier + reason
   - **cost_first** → always tier 3
   - **quality_first** → always tier 1
3. Call adapter with resolved model ID
4. Record LlmCall with tier, reason, selectionDurationMs
5. On failure (auto strategy only) → retry one tier up

### Retry Logic (Auto Only)

```
attempt 1: selected tier
  fail → retry tier - 1 (higher), set wasUpgraded=true, originalTier
    fail → retry tier 1, alert team
      fail → fail the run
```

Max 3 attempts. Each retry logs a separate LlmCall. AgentRun aggregates total cost.

### Cost Rate Resolution

Replace hardcoded `costRates` with lookup from model tiers registry. Each tier has exact input/output rates.

---

## 4. Agent Builder Wizard

### New Step 1: "Model Strategy"

Inserted after Identity (step 0), shifts remaining steps down. Wizard goes from 6 to 7 steps.

Four radio-style cards in 2x2 grid:
- **Auto (Recommended)** — sparkles icon — system selects per task
- **Manual** — hand icon — always use provider default
- **Cost-First** — dollar icon — always cheapest tier
- **Quality-First** — shield icon — always strongest tier

Default: Auto.

### Preview Card (Auto Only)

Shown when Auto is selected:

```
Based on this agent's profile, we estimate:
  ~40% of runs → claude-haiku-4-5      $0.80/M tokens
  ~45% of runs → claude-sonnet-4-6     $3/M tokens
  ~15% of runs → claude-opus-4-6       $15/M tokens

  Est. savings vs always using sonnet: ~30%
```

Heuristic client-side estimate from profiler logic. No database call.

### Validation

`modelStrategy` defaults to `"auto"`. Sent alongside existing fields in POST to `/api/agents`. Added to `createAgentSchema`.

---

## 5. Dashboard Integrations

### Costs & Billing — "Auto-Selection Savings" Section

In the Overview tab, new panel showing:
- **Three stat cards:** "If Always Tier 1" cost, "Actual Cost", "Monthly Savings" (with %)
- **Tier distribution bar chart:** horizontal stacked bar, color-coded per tier
- **Upgrade events count**

New endpoint: `/api/costs/model-savings` — aggregates LlmCall data where `selectedTier IS NOT NULL`.

### Agent Detail Page — Model Distribution

In the Config tab, new section:
- **Donut chart** — % of runs per tier (last 30 days)
- **Auto-upgrade events** — count badge
- **Current strategy** — badge showing Auto/Manual/Cost-First/Quality-First

### Logs Page — LLM Calls Tab

Two additions:
- **New column: "Tier"** — pill badge T1/T2/T3, color-coded (purple/cyan/green)
- **Expanded detail** — selection reason line: `"Selection: tier 2 (claude-sonnet-4-6) — medium complexity score (3), repetitive pattern [1.2ms]"`
- If `wasUpgraded`: amber warning `"Upgraded from T3 → T2 after failed attempt"`

---

## 6. Safety Guardrails

### Always Tier 1
- SecurityScanner agent type
- Any agent with `hasProductionAccess: true`
- Any agent tagged "critical" or "destructive"
- Any agent that can delete/modify data (database tool enabled)
- Any agent managing finances or billing
- First run of a new agent (`tasksCompleted === 0`)

### Eligible for Tier 3
- InfraMonitor (reading metrics, no writes)
- DocGenerator (formatting known content)
- DataPipelineAgent (repetitive ETL with clear schema)
- Any agent tagged "read-only"

---

## Deliverables

1. `src/lib/model-selector.ts` — core selection engine with tiers registry
2. `src/lib/agent-profiler.ts` — builds TaskProfile from agent + task input
3. Prisma schema migration — `modelStrategy` on Agent, 5 new fields on LlmCall
4. Updated TypeScript types — Agent, LLMCall, new ModelStrategy type
5. Updated agent builder wizard — new Step 1 with strategy cards + preview
6. Updated `/api/agents/[id]/execute` — call selector, retry logic, tier logging
7. Updated `/api/agents` POST — accept `modelStrategy` field
8. New `/api/costs/model-savings` endpoint
9. Updated Costs page — savings section
10. Updated Agent detail page — model distribution chart
11. Updated Logs page — tier column + selection reason in expanded detail
12. Updated `createAgentSchema` — add `modelStrategy` validation
