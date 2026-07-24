/**
 * General-AI baseline review — Shari must beat a competent general assistant.
 */

import type { ShariResponseDecision } from "./types";
import type { ResolvedShariContext } from "./contextResolver";

export type GeneralAiBaselineReview = {
  wouldGeneralAiAnswerDirectly: boolean;
  wouldGeneralAiAskFirst: boolean;
  wouldGeneralAiProvideSubstance: boolean;
  shariIsWeaker: boolean;
  shariIsEqual: boolean;
  shariIsStronger: boolean;
  /** 0–10 comparative score vs a strong general AI */
  comparativeScore: number;
  missingAdvantages: string[];
  notes: string[];
  /** Personalized mention without equal substance still fails */
  personalizationWithoutSubstance: boolean;
};

/**
 * Pre-flight: does this request deserve a direct answer from a general AI?
 */
export function expectGeneralAiDirectAnswer(
  decision: ShariResponseDecision,
): boolean {
  if (decision.directAnswerRequired || decision.directAnswerPossible) return true;
  if (decision.conversationMode === "teach" || decision.conversationMode === "explain") {
    return true;
  }
  if (decision.conversationMode === "advise") return true;
  return false;
}

/**
 * Compare a draft Shari answer against what a competent general AI would do.
 */
export function reviewAgainstGeneralAiBaseline(input: {
  decision: ShariResponseDecision;
  context: ResolvedShariContext;
  draft: string;
}): GeneralAiBaselineReview {
  const { decision, context, draft } = input;
  const text = draft.trim();
  const notes: string[] = [];
  const missingAdvantages: string[] = [];

  const wouldGeneralAiAnswerDirectly = expectGeneralAiDirectAnswer(decision);
  const wouldGeneralAiAskFirst =
    decision.primaryHelpMode === "reflective_thinking" &&
    !decision.directAnswerRequired;
  const wouldGeneralAiProvideSubstance =
    wouldGeneralAiAnswerDirectly && text.length >= 120;

  const asksEarly =
    (/\?/.test(text.slice(0, Math.min(160, text.length))) && text.length < 220) ||
    /\b(?:did i hear that right|tell me about your business|what do you sell|which area)\b/i.test(
      text,
    );
  const menuOnly =
    /\b(?:would you like to (?:go|open|visit)|i can take you to|here are (?:a few )?(?:places|options))\b/i.test(
      text,
    ) && text.length < 400;
  const categoryListOnly =
    /\b(?:consider|think about|look at)\b/i.test(text) &&
    /\b(?:layout|signage|lighting|engagement|accessibility)\b/i.test(text) &&
    /\bwhich\b/i.test(text) &&
    text.length < 420;
  const thin =
    text.length > 0 &&
    text.length < 120 &&
    wouldGeneralAiAnswerDirectly &&
    decision.primaryHelpMode !== "reflective_thinking";

  const usesContext =
    context.knownContextAvailable && usesContextHints(text, context);
  const hasSteps =
    /\n\s*\d+[\).]/.test(text) || /\b(?:first|then|next|finally)\b/i.test(text);
  const softOffer =
    /\b(?:if you(?:'d| would) like|want me to|i can also)\b/i.test(text);
  const hasJudgment =
    /\b(?:i(?:'d| would) |recommend|worth|depends|if you|lean)\b/i.test(text);
  const actionable =
    text.length >= 180 &&
    (hasSteps || hasJudgment || /\b(?:start|try|check|use|set)\b/i.test(text));

  // Name-drop personalization without substance still fails
  const personalizationWithoutSubstance =
    Boolean(usesContext) &&
    !actionable &&
    (thin || asksEarly || categoryListOnly || text.length < 200);

  let shariIsWeaker = false;
  if (
    wouldGeneralAiAnswerDirectly &&
    (asksEarly || menuOnly || thin || categoryListOnly)
  ) {
    shariIsWeaker = true;
    notes.push(
      "General AI would likely be more complete or easier to use; this draft asks, menus, or lists categories first.",
    );
  }
  if (personalizationWithoutSubstance) {
    shariIsWeaker = true;
    missingAdvantages.push("substance_equal_to_baseline");
    notes.push(
      "Personal fact mentioned but answer is thinner than a strong general baseline.",
    );
  }
  if (
    context.knownContextAvailable &&
    isUnnecessaryAsk(text) &&
    !usesContext
  ) {
    shariIsWeaker = true;
    missingAdvantages.push("personalization_from_known_context");
    notes.push(
      "Known context unused; general AI without memory would still answer, and Shari should be stronger.",
    );
  }
  if (
    decision.primaryHelpMode === "advice" &&
    wouldGeneralAiAnswerDirectly &&
    !hasJudgment &&
    text.length > 80
  ) {
    shariIsWeaker = true;
    missingAdvantages.push("judgment");
    notes.push("Advice without a recommendation is weaker than a decisive general AI answer.");
  }

  let shariIsStronger = false;
  let shariIsEqual = false;
  if (!shariIsWeaker && wouldGeneralAiProvideSubstance) {
    if (
      (usesContext && actionable) ||
      (hasSteps && (softOffer || hasJudgment)) ||
      (context.assumptions.length > 0 && actionable)
    ) {
      shariIsStronger = true;
      notes.push(
        "Beats baseline via applied context, judgment, structure, or stated assumptions.",
      );
    } else if (actionable) {
      shariIsEqual = true;
      missingAdvantages.push("estate_personalization_or_continuity");
      notes.push("Matches general AI substance; can still add Estate advantages.");
    } else {
      shariIsWeaker = true;
      notes.push("Not as complete or actionable as a strong general AI answer.");
    }
  } else if (!shariIsWeaker && !wouldGeneralAiAnswerDirectly) {
    shariIsEqual = true;
  }

  if (context.knownContextAvailable && !usesContext) {
    if (!missingAdvantages.includes("personalization_from_known_context")) {
      missingAdvantages.push("personalization_from_known_context");
    }
  }

  let comparativeScore = 5;
  if (shariIsWeaker) comparativeScore = 3;
  else if (shariIsEqual) comparativeScore = 6;
  else if (shariIsStronger) comparativeScore = 8;
  if (usesContext && actionable) comparativeScore = Math.min(10, comparativeScore + 1);
  if (asksEarly || categoryListOnly) comparativeScore = Math.min(comparativeScore, 3);

  return {
    wouldGeneralAiAnswerDirectly,
    wouldGeneralAiAskFirst,
    wouldGeneralAiProvideSubstance,
    shariIsWeaker,
    shariIsEqual,
    shariIsStronger,
    comparativeScore,
    missingAdvantages,
    notes,
    personalizationWithoutSubstance,
  };
}

function isUnnecessaryAsk(text: string): boolean {
  return /\b(?:what (?:do|are) you sell|what type of products|tell me about your business|who do you (?:help|serve))\b/i.test(
    text,
  );
}

function usesContextHints(text: string, context: ResolvedShariContext): boolean {
  const lower = text.toLowerCase();
  for (const product of context.knownProducts.slice(0, 4)) {
    const token = product.split(/[,·|]/)[0]?.trim().toLowerCase();
    if (token && token.length >= 4 && lower.includes(token.slice(0, Math.min(token.length, 24)))) {
      return true;
    }
  }
  if (context.businessName && lower.includes(context.businessName.toLowerCase())) {
    return true;
  }
  if (
    context.knownAudience &&
    context.knownAudience.length >= 6 &&
    lower.includes(context.knownAudience.slice(0, 20).toLowerCase())
  ) {
    return true;
  }
  // Soft personalization language when we have context
  if (
    context.knownContextAvailable &&
    /\b(?:given what you(?:'re| are) (?:already )?(?:selling|building|working)|for your (?:booth|business|offer)|with your)\b/i.test(
      text,
    )
  ) {
    return true;
  }
  return false;
}
