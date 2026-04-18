/**
 * LLM-as-judge — Auto-Downshift step 3 (fallback path)
 *
 * Given a production output and a shadow output (on the same input), use a
 * cheap judge model to assign each a 0–1 quality score. Scores feed into the
 * parity detector, which decides whether to propose a downshift.
 *
 * Design notes:
 * - Judge is Claude Haiku 4.5 — cheap enough that judging a 5%-sampled
 *   shadow still nets a big savings; strong enough to score pairwise
 *   alongside the target models.
 * - Rubric is pairwise AND independent so we can also catch cases where the
 *   shadow is flatly wrong even if the production answer is merely fine.
 * - Scoring is fail-closed: any parse error → score stays null so parity
 *   analysis only considers cleanly-judged pairs.
 */

import Anthropic from "@anthropic-ai/sdk";

const JUDGE_MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT = `You are an impartial evaluator scoring two AI responses to the same prompt.

Score each response 0.00–1.00 on three equally-weighted dimensions, then average:
  1. Correctness — is the response factually and logically right?
  2. Helpfulness — does it actually address the user's request?
  3. Completeness — does it cover what a reasonable user would need?

Scoring anchors:
  1.00  Flawless — fully correct, maximally helpful, no gaps
  0.80  Strong — minor nitpicks only
  0.60  Acceptable — usable but noticeably weaker in one dimension
  0.40  Weak — usable only with rework
  0.20  Poor — misleading or off-target
  0.00  Broken — wrong, refused, or empty

Score the two responses INDEPENDENTLY. Do not rank or reward differences for their own sake — they can both be 1.00 or both be 0.20.

Output ONLY a minified JSON object, no prose, no markdown fences:
{"a":0.XX,"b":0.XX}`;

export interface JudgeResult {
  productionScore: number | null;
  shadowScore: number | null;
  judgeMethod: "llm_judge" | null;
}

export interface JudgePairOpts {
  apiKey: string;
  input: string;
  systemPrompt: string;
  productionOutput: string;
  shadowOutput: string;
}

/**
 * Score a production/shadow pair.
 * Returns null scores on any failure — caller should treat unscored pairs
 * as if the shadow run never happened.
 */
export async function scorePair(opts: JudgePairOpts): Promise<JudgeResult> {
  // Defensive: empty outputs can't be judged meaningfully
  if (!opts.productionOutput.trim() || !opts.shadowOutput.trim()) {
    return { productionScore: null, shadowScore: null, judgeMethod: null };
  }

  try {
    const client = new Anthropic({ apiKey: opts.apiKey });

    const userPrompt = [
      `ORIGINAL USER PROMPT:`,
      `<<<${opts.input}>>>`,
      ``,
      opts.systemPrompt
        ? `AGENT SYSTEM PROMPT (context only — do not score against this):\n<<<${opts.systemPrompt}>>>`
        : ``,
      ``,
      `RESPONSE A:`,
      `<<<${opts.productionOutput}>>>`,
      ``,
      `RESPONSE B:`,
      `<<<${opts.shadowOutput}>>>`,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await client.messages.create({
      model: JUDGE_MODEL,
      max_tokens: 64,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    // Find JSON in text (defensive — sometimes there's leading whitespace)
    const match = text.match(/\{[^{}]*\}/);
    if (!match) return { productionScore: null, shadowScore: null, judgeMethod: null };

    const parsed = JSON.parse(match[0]) as { a?: unknown; b?: unknown };
    const a = Number(parsed.a);
    const b = Number(parsed.b);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return { productionScore: null, shadowScore: null, judgeMethod: null };
    }
    if (a < 0 || a > 1 || b < 0 || b > 1) {
      return { productionScore: null, shadowScore: null, judgeMethod: null };
    }

    return {
      productionScore: Math.round(a * 100) / 100,
      shadowScore: Math.round(b * 100) / 100,
      judgeMethod: "llm_judge",
    };
  } catch (err) {
    console.error("[downshift] judge failed:", (err as Error).message);
    return { productionScore: null, shadowScore: null, judgeMethod: null };
  }
}
