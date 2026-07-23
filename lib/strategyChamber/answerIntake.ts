/**
 * Quietly organize a conversational answer into the Strategy Work Item.
 * Never ask the member to classify their own answer.
 */

import type { StrategyOption, StrategyWorkItem } from "./types";

export type AnswerSignalKind =
  | "fact"
  | "observation"
  | "interpretation"
  | "feeling"
  | "assumption"
  | "concern"
  | "constraint"
  | "desired_outcome"
  | "option"
  | "risk"
  | "success_signal"
  | "next_step"
  | "unclear";

function pushUnique(list: string[] | undefined, value: string): string[] {
  const next = [...(list ?? [])];
  const trimmed = value.trim();
  if (!trimmed) return next;
  if (next.some((x) => x.toLowerCase() === trimmed.toLowerCase())) return next;
  next.push(trimmed);
  return next;
}

function looksLikeRiskOrConcern(text: string): boolean {
  return /\b(worried|worry|afraid|fear|risk|leave|churn|lose|fail|wrong|concern)\b/i.test(
    text,
  );
}

function looksLikeConstraint(text: string): boolean {
  return /\b(can'?t|cannot|have to|must|budget|cash|time|capacity|energy|only)\b/i.test(
    text,
  );
}

function looksLikeAssumption(text: string): boolean {
  return /\b(i think|maybe|might|probably|assume|seems like|feels like)\b/i.test(
    text,
  );
}

function looksLikeDesire(text: string): boolean {
  return /\b(want|hope|wish|goal|would like|trying to|need more|looking for)\b/i.test(
    text,
  );
}

function looksLikeOption(text: string): boolean {
  return /\b(option|path|could|either|or we|instead|raise|keep|increase|pause)\b/i.test(
    text,
  );
}

function looksLikeFeeling(text: string): boolean {
  return /\b(feel|feeling|overwhelmed|stuck|anxious|excited|scared|relieved)\b/i.test(
    text,
  );
}

/** Best-effort signal tags — preserved alongside original wording. */
export function classifyAnswerSignals(answer: string): AnswerSignalKind[] {
  const t = answer.trim();
  if (!t) return ["unclear"];
  const kinds: AnswerSignalKind[] = [];
  if (looksLikeFeeling(t)) kinds.push("feeling");
  if (looksLikeRiskOrConcern(t)) kinds.push("concern", "risk");
  if (looksLikeConstraint(t)) kinds.push("constraint");
  if (looksLikeAssumption(t)) kinds.push("assumption");
  if (looksLikeDesire(t)) kinds.push("desired_outcome");
  if (looksLikeOption(t)) kinds.push("option");
  if (kinds.length === 0) kinds.push("observation");
  return Array.from(new Set(kinds));
}

/**
 * Opening answer = strategic question only.
 * Never copy it into currentReality / multiple record sections.
 */
export function applyOpeningStrategicQuestion(
  item: StrategyWorkItem,
  answer: string,
): Partial<StrategyWorkItem> {
  const trimmed = answer.trim();
  if (!trimmed) return {};
  const title =
    trimmed.length > 72 ? `${trimmed.slice(0, 69).trim()}…` : trimmed;
  return {
    decisionStatement: trimmed,
    title,
    plainLanguageSummary: trimmed.slice(0, 220),
    // Intentionally leave currentReality empty until real context arrives
    currentReality: item.currentReality?.trim() || undefined,
    status: "understanding",
    currentStage: "understand_current_state",
    activeQuestion: undefined,
    shariReflection: undefined,
  };
}

/**
 * Merge a follow-up conversational answer into the work item without forcing
 * the same sentence into every field.
 */
export function applyConversationalAnswer(
  item: StrategyWorkItem,
  answer: string,
): Partial<StrategyWorkItem> {
  const trimmed = answer.trim();
  if (!trimmed) return {};

  const signals = classifyAnswerSignals(trimmed);
  const patch: Partial<StrategyWorkItem> = {
    memberStatements: pushUnique(item.memberStatements, trimmed),
  };

  // First contextual answer after the strategic question → current situation
  if (!item.currentReality?.trim()) {
    if (
      signals.includes("observation") ||
      signals.includes("fact") ||
      signals.includes("concern") ||
      signals.includes("constraint") ||
      signals.includes("feeling")
    ) {
      patch.currentReality = trimmed;
    }
  } else if (
    signals.includes("observation") ||
    signals.includes("fact")
  ) {
    patch.observations = pushUnique(item.observations, trimmed);
  }

  if (signals.includes("assumption")) {
    patch.assumptions = pushUnique(item.assumptions, trimmed);
  }
  if (signals.includes("concern") || signals.includes("risk")) {
    patch.risks = pushUnique(item.risks, trimmed);
  }
  if (signals.includes("constraint")) {
    patch.constraints = pushUnique(item.constraints, trimmed);
  }
  if (signals.includes("desired_outcome")) {
    patch.desiredDirection = item.desiredDirection?.trim() || trimmed;
  }
  if (signals.includes("success_signal")) {
    patch.successSignals = pushUnique(item.successSignals, trimmed);
  }
  if (signals.includes("next_step")) {
    patch.recommendedNextDestination =
      item.recommendedNextDestination?.trim() || trimmed.slice(0, 120);
  }

  if (signals.includes("option") && !item.optionsConsidered?.length) {
    const titles = trimmed
      .split(/\n|;|·|\u2022|(?:\s+or\s+)/i)
      .map((s) => s.replace(/^\d+[\).\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);
    if (titles.length >= 2) {
      const options: StrategyOption[] = titles.map((title, i) => ({
        id: `opt_${i + 1}`,
        title,
      }));
      patch.optionsConsidered = options;
      patch.currentStage = "explore_options";
      patch.status = "exploring";
    }
  }

  // Advance stage gently based on what we know — never rigid five-step force
  if (!patch.currentStage) {
    if (
      item.currentReality?.trim() ||
      patch.currentReality ||
      (item.memberStatements?.length ?? 0) >= 1
    ) {
      if (!item.desiredDirection?.trim() && !patch.desiredDirection) {
        patch.currentStage = "choose_direction";
        patch.status = "understanding";
      } else if (!item.optionsConsidered?.length) {
        patch.currentStage = "explore_options";
        patch.status = "exploring";
      } else if (!item.chosenDirection?.trim()) {
        patch.currentStage = "evaluate_decision";
        patch.status = "evaluating";
      }
    }
  }

  return patch;
}

export function chooseEmergingOption(
  item: StrategyWorkItem,
  optionId: string,
): Partial<StrategyWorkItem> {
  const option = item.optionsConsidered?.find((o) => o.id === optionId);
  if (!option) return {};
  const notChosen =
    item.optionsConsidered
      ?.filter((o) => o.id !== optionId)
      .map((o) => o.title) ?? [];
  return {
    chosenDirection: option.title,
    notChosen,
    decisionRationale:
      option.whyItMayFit ||
      item.decisionRationale ||
      "Chosen after exploring options in the Strategy Chamber.",
    status: "direction_chosen",
    currentStage: "handoff_direction",
  };
}
