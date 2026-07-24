/**
 * Conversation Delight — meaningful usefulness, not entertainment.
 * Extends excellence; does not create a second validation system.
 */

import type { ShariResponseDecision } from "./types";
import type { ResolvedShariContext } from "./contextResolver";
import type { ShariProfessionalRole } from "./professionalRoles";
import type { ShariResponseComposition } from "./responseComposer";
import type { ShariWisdomPlan } from "./wisdomPlan";
import type { GeneralAiBaselineReview } from "./generalAiBaseline";

export type ConversationDelightReview = {
  passes: boolean;
  feltUnderstoodScore: number;
  savedEffortScore: number;
  practicalSurpriseScore: number;
  confidenceCreatedScore: number;
  personalizationImpactScore: number;
  memorableInsightScore: number;
  emotionalFitScore: number;
  preferenceOverGenericAIScore: number;
  /** Average of dimension scores 0–10 */
  delightScore: number;
  delightSignals: string[];
  disappointmentRisks: string[];
  repairInstructions: string[];
};

function clampScore(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

/**
 * Heuristic delight review of a draft answer.
 */
export function reviewConversationDelight(input: {
  decision: ShariResponseDecision;
  answer: string;
  context: ResolvedShariContext;
  primaryRole: ShariProfessionalRole;
  composition: ShariResponseComposition;
  wisdom: ShariWisdomPlan;
  baseline: GeneralAiBaselineReview;
}): ConversationDelightReview {
  const text = input.answer.trim();
  const lower = text.toLowerCase();
  const signals: string[] = [];
  const risks: string[] = [];
  const repair: string[] = [];

  const categoryMenu =
    /\b(?:which (?:area|of these)|consider (?:layout|signage|lighting).{0,40}which)\b/i.test(
      text,
    ) ||
    (/\b(?:layout|signage|lighting|engagement)\b/i.test(text) &&
      text.length < 280 &&
      /\?/.test(text));

  const opensWeak =
    /^(?:that'?s a great question|you mentioned|did i hear that right|i'?d love to help)/i.test(
      text,
    );

  // Felt understood
  let feltUnderstood = 5;
  if (input.primaryRole === "coach" && /\b(?:overwhelm|heavy|a lot|together)\b/i.test(text)) {
    feltUnderstood += 2;
    signals.push("recognized_emotional_load");
  }
  if (/\b(?:here'?s how|start with|the key is|what matters most)\b/i.test(text)) {
    feltUnderstood += 1.5;
    signals.push("oriented_to_need");
  }
  if (opensWeak || categoryMenu) {
    feltUnderstood -= 3;
    risks.push("weak_or_menu_opening");
    repair.push("Open with the most useful principle or recommendation — not echo or category menus.");
  }

  // Saved effort
  let savedEffort = 5;
  if (text.length >= 220 && (/\n\s*\d+[\).]/.test(text) || /\b(?:first|then|next)\b/i.test(text))) {
    savedEffort += 2;
    signals.push("actionable_structure");
  }
  if (categoryMenu) {
    savedEffort -= 3;
    risks.push("forced_extra_choice");
    repair.push("Replace category selection with a complete first-pass answer.");
  }
  if (input.composition.commonMistakeRequirement && /\b(?:mistake|avoid|don'?t|trap)\b/i.test(text)) {
    savedEffort += 1;
    signals.push("named_mistake_saves_rework");
  }

  // Practical surprise / insight
  let practicalSurprise = 4;
  if (
    input.wisdom.highestLeverageInsight &&
    insightReflected(text, input.wisdom.highestLeverageInsight)
  ) {
    practicalSurprise += 3;
    signals.push("memorable_insight_present");
  } else if (input.composition.insightRequirement) {
    practicalSurprise -= 1;
    risks.push("missing_insight");
    repair.push(
      `Weave in this insight: ${input.wisdom.highestLeverageInsight ?? "one non-obvious practical principle"}.`,
    );
  }
  if (/\b(?:3(?:–|-)5 seconds|break-even|rule of thumb|shortcut)\b/i.test(text)) {
    practicalSurprise += 1.5;
    signals.push("heuristic_or_shortcut");
  }

  // Confidence created
  let confidenceCreated = 5;
  if (/\b(?:you can|start by|once you|you'?ll know it worked)\b/i.test(text)) {
    confidenceCreated += 1.5;
    signals.push("clear_completion_path");
  }
  if (input.primaryRole === "advisor" && /\b(?:i(?:'d| would) |recommend|if .{0,40} then)\b/i.test(text)) {
    confidenceCreated += 2;
    signals.push("judgment_present");
  } else if (input.composition.recommendationRequirement && !/\b(?:recommend|worth|lean|depends)\b/i.test(text)) {
    confidenceCreated -= 2;
    risks.push("no_judgment");
    repair.push("Add a conditional recommendation and what would change it.");
  }

  // Personalization impact — must change advice, not merely mention
  let personalizationImpact = 4;
  if (input.context.knownContextAvailable) {
    const applied =
      usesProductOrAudience(lower, input.context) &&
      /\b(?:because|since|for your|group|anchor|aim)\b/i.test(text);
    if (applied) {
      personalizationImpact += 4;
      signals.push("personalization_changed_advice");
    } else if (/\b(?:as a crafter|since you are)\b/i.test(text) && text.length < 400) {
      personalizationImpact -= 1;
      risks.push("name_drop_personalization");
      repair.push(
        "Apply known products/audience so the recommendation changes — do not only label their identity.",
      );
    } else if (input.composition.personalizedApplicationRequirement) {
      personalizationImpact -= 1;
      risks.push("context_unused");
      repair.push(
        `Apply known context (${input.context.relevantContextKeys.slice(0, 4).join(", ")}) in examples and decisions.`,
      );
    }
  } else {
    personalizationImpact = 6; // N/A — do not punish
  }

  // Memorable insight
  let memorableInsight = practicalSurprise;

  // Emotional fit
  let emotionalFit = 6;
  if (input.primaryRole === "coach") {
    if ((text.match(/^\s*\d+[\).]/gm) || []).length >= 6) {
      emotionalFit -= 3;
      risks.push("coaching_task_dump");
      repair.push("Stay in coaching: reflect, reduce load, one question — no long task list.");
    } else {
      emotionalFit += 2;
      signals.push("coaching_fit");
    }
  }
  if (input.primaryRole === "teacher" && /\bwhat feels (?:hardest|hard)\b/i.test(text)) {
    emotionalFit -= 3;
    risks.push("coaching_intercepted_teaching");
    repair.push("Shift to teacher: give ordered steps immediately; no discovery interview.");
  }

  // Preference over generic AI
  let preference = 5;
  if (input.baseline.shariIsWeaker) {
    preference = 2;
    risks.push("weaker_than_generic_ai");
    repair.push(
      "Regenerate to match or beat a strong general AI on completeness and actionability, then add Estate advantages.",
    );
  } else if (input.baseline.shariIsStronger) {
    preference += 3;
    signals.push("beats_generic_baseline");
  } else if (input.baseline.shariIsEqual) {
    preference += 1;
    if (input.context.knownContextAvailable && personalizationImpact < 6) {
      preference -= 1;
      repair.push("Match baseline substance and add one personalized application.");
    }
  }
  if (signals.includes("personalization_changed_advice") || signals.includes("memorable_insight_present")) {
    preference += 1;
  }

  const dims = [
    feltUnderstood,
    savedEffort,
    practicalSurprise,
    confidenceCreated,
    personalizationImpact,
    memorableInsight,
    emotionalFit,
    preference,
  ].map(clampScore);

  const delightScore = clampScore(dims.reduce((a, b) => a + b, 0) / dims.length);
  const passes = delightScore >= 6.5 && !input.baseline.shariIsWeaker && !categoryMenu && !opensWeak;

  if (!passes && repair.length === 0) {
    repair.push(
      "Add one insight, shortcut, mistake, or personalized application so the answer feels chosen for this person.",
    );
  }

  return {
    passes,
    feltUnderstoodScore: dims[0],
    savedEffortScore: dims[1],
    practicalSurpriseScore: dims[2],
    confidenceCreatedScore: dims[3],
    personalizationImpactScore: dims[4],
    memorableInsightScore: dims[5],
    emotionalFitScore: dims[6],
    preferenceOverGenericAIScore: dims[7],
    delightScore,
    delightSignals: signals,
    disappointmentRisks: risks,
    repairInstructions: [...new Set(repair)],
  };
}

function insightReflected(answer: string, insight: string): boolean {
  const tokens = insight
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 6);
  const lower = answer.toLowerCase();
  const hits = tokens.filter((w) => lower.includes(w)).length;
  return hits >= Math.min(2, tokens.length);
}

function usesProductOrAudience(
  lower: string,
  context: ResolvedShariContext,
): boolean {
  for (const p of context.knownProducts.slice(0, 5)) {
    const token = p.split(/[,·|]/)[0]?.trim().toLowerCase();
    if (token && token.length >= 4 && lower.includes(token.slice(0, 20))) return true;
  }
  if (context.businessName && lower.includes(context.businessName.toLowerCase())) {
    return true;
  }
  return false;
}
