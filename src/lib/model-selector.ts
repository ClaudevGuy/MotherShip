// ── Types ──

export type Tier = 1 | 2 | 3;
export type ProviderKey = "CLAUDE" | "GPT4" | "GEMINI" | "CUSTOM";

export interface TierConfig {
  modelId: string;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
}

export interface ModelSelection {
  modelId: string;
  tier: Tier;
  reason: string;
  provider: string;
  costRates: { input: number; output: number };
}

export interface TaskProfile {
  agentType: string;
  taskDescription: string;
  expectedOutputTokens: number;
  hasProductionAccess: boolean;
  isRepetitive: boolean;
  requiresReasoning: boolean;
  errorCostHigh: boolean;
  provider: ProviderKey;
  isFirstRun: boolean;
}

export type SafetyOverrideRule =
  | "production_access"
  | "error_cost_high"
  | "requires_reasoning"
  | "security_scanner"
  | "first_run";

export interface SafetyOverride {
  rule: SafetyOverrideRule;
  /** Short phrase, lowercase-first — designed for interpolation after "Safety override: " */
  reason: string;
  /**
   * false → resolves after one successful run (isFirstRun). UI warnings should
   * filter these out since every new agent trivially hits this on run #1.
   * true  → driven by persistent agent configuration (tools, prompt, tags, name).
   */
  persistent: boolean;
}

/**
 * Single source of truth for which safety overrides would fire for a given
 * profile. `selectModel()` uses the first entry to force tier 1. The agent
 * builder UI uses the persistent subset to warn users before they pick a
 * strategy that bypasses these overrides (cost_first, manual).
 *
 * Order matches selectModel()'s original first-match priority so refactor is
 * behavior-preserving.
 */
export function detectSafetyOverrides(profile: TaskProfile): SafetyOverride[] {
  const out: SafetyOverride[] = [];

  if (profile.hasProductionAccess) {
    out.push({
      rule: "production_access",
      reason: "agent has production access",
      persistent: true,
    });
  }
  if (profile.errorCostHigh) {
    out.push({
      rule: "error_cost_high",
      reason: "high error cost (critical/security/billing)",
      persistent: true,
    });
  }
  if (profile.requiresReasoning && !profile.isRepetitive) {
    out.push({
      rule: "requires_reasoning",
      reason: "requires reasoning on non-repetitive task",
      persistent: true,
    });
  }
  if (profile.agentType === "SecurityScanner") {
    out.push({
      rule: "security_scanner",
      reason: "SecurityScanner always uses tier 1",
      persistent: true,
    });
  }
  if (profile.isFirstRun) {
    out.push({
      rule: "first_run",
      reason: "first run of new agent (unknown risk)",
      persistent: false,
    });
  }

  return out;
}

// ── Tiers Registry ──

const TIERS: Record<string, Record<Tier, TierConfig>> = {
  CLAUDE: {
    1: { modelId: "claude-opus-4-6",   inputCostPerMillion: 15,     outputCostPerMillion: 75 },
    2: { modelId: "claude-sonnet-4-6",  inputCostPerMillion: 3,      outputCostPerMillion: 15 },
    3: { modelId: "claude-haiku-4-5",   inputCostPerMillion: 0.80,   outputCostPerMillion: 4 },
  },
  GPT4: {
    1: { modelId: "gpt-4o",            inputCostPerMillion: 2.50,   outputCostPerMillion: 10 },
    2: { modelId: "gpt-4o-mini",       inputCostPerMillion: 0.15,   outputCostPerMillion: 0.60 },
    3: { modelId: "gpt-3.5-turbo",     inputCostPerMillion: 0.50,   outputCostPerMillion: 1.50 },
  },
  GEMINI: {
    1: { modelId: "gemini-2.5-pro",       inputCostPerMillion: 1.25,   outputCostPerMillion: 10 },
    2: { modelId: "gemini-2.0-flash",     inputCostPerMillion: 0.10,   outputCostPerMillion: 0.40 },
    3: { modelId: "gemini-1.5-flash-8b",  inputCostPerMillion: 0.0375, outputCostPerMillion: 0.15 },
  },
};

export function getTierConfig(provider: ProviderKey, tier: Tier): TierConfig | null {
  return TIERS[provider]?.[tier] ?? null;
}

export function getAllTiers(provider: ProviderKey): Record<Tier, TierConfig> | null {
  return TIERS[provider] ?? null;
}

// ── Selection Algorithm ──

export function selectModel(profile: TaskProfile): ModelSelection {
  if (profile.provider === "CUSTOM") {
    return {
      modelId: "custom",
      tier: 2,
      reason: "Custom provider — pass-through, no auto-selection",
      provider: "CUSTOM",
      costRates: { input: 0, output: 0 },
    };
  }

  const providerTiers = TIERS[profile.provider];
  if (!providerTiers) {
    const fallback = TIERS.CLAUDE;
    return buildSelection(fallback, 2, `Unknown provider ${profile.provider}, falling back to Claude tier 2`, profile.provider);
  }

  // ── SAFETY OVERRIDES — always tier 1 ──
  // Rules and priority live in detectSafetyOverrides() so the UI can share them.
  const overrides = detectSafetyOverrides(profile);
  if (overrides.length > 0) {
    return buildSelection(providerTiers, 1, `Safety override: ${overrides[0].reason}`, profile.provider);
  }

  // ── COMPLEXITY SCORING ──
  let score = 0;
  const reasons: string[] = [];

  if (profile.expectedOutputTokens > 2000) {
    score += 2;
    reasons.push("long output >2K tokens (+2)");
  } else if (profile.expectedOutputTokens > 500) {
    score += 1;
    reasons.push("medium output >500 tokens (+1)");
  }

  if (profile.requiresReasoning) {
    score += 2;
    reasons.push("requires reasoning (+2)");
  }

  if (profile.isRepetitive) {
    score -= 2;
    reasons.push("repetitive pattern (-2)");
  }

  const agentTypeScores: Record<string, number> = {
    SecurityScanner: 3,
    CodeReviewer: 2,
    DataPipelineAgent: -1,
    InfraMonitor: -1,
  };
  const typeAdjust = agentTypeScores[profile.agentType];
  if (typeAdjust !== undefined) {
    score += typeAdjust;
    reasons.push(`agent type ${profile.agentType} (${typeAdjust >= 0 ? "+" : ""}${typeAdjust})`);
  }

  // ── DECISION ──
  let tier: Tier;
  if (score >= 4) {
    tier = 1;
  } else if (score >= 1) {
    tier = 2;
  } else {
    tier = 3;
  }

  return buildSelection(
    providerTiers,
    tier,
    `Complexity score ${score}: ${reasons.join(", ")}`,
    profile.provider
  );
}

function buildSelection(
  tiers: Record<Tier, TierConfig>,
  tier: Tier,
  reason: string,
  provider: string
): ModelSelection {
  const config = tiers[tier];
  return {
    modelId: config.modelId,
    tier,
    reason,
    provider,
    costRates: {
      input: config.inputCostPerMillion / 1_000_000,
      output: config.outputCostPerMillion / 1_000_000,
    },
  };
}

// ── Tier Upgrade (for retry) ──

export function upgradeTier(currentTier: Tier): Tier | null {
  if (currentTier === 1) return null;
  return (currentTier - 1) as Tier;
}
