/**
 * Quietly organize a conversational answer into the Strategy Work Item.
 * Never ask the member to classify their own answer.
 */

import type { StrategyOption, StrategyWorkItem } from "./types";
import type { StrategicInputClassification } from "./domainModel";
import {
  analyzeStrategicStatement,
  assessJudgmentStage,
  classifyStrategicInput,
  identifyStrategicQuestion,
  suggestStrategyTypeId,
} from "./intelligence";

function pushUnique(list: string[] | undefined, value: string): string[] {
  const next = [...(list ?? [])];
  const trimmed = value.trim();
  if (!trimmed) return next;
  if (next.some((x) => x.toLowerCase() === trimmed.toLowerCase())) return next;
  next.push(trimmed);
  return next;
}

/** Best-effort classifications — preserved alongside original wording. */
export function classifyAnswerSignals(
  answer: string,
): StrategicInputClassification[] {
  const t = answer.trim();
  if (!t) return ["unknown"];
  return classifyStrategicInput(t).classifications;
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
  const strategyType = suggestStrategyTypeId(trimmed);
  const analysis = identifyStrategicQuestion(
    { ...item, decisionStatement: trimmed },
    trimmed,
  );
  const draft: StrategyWorkItem = {
    ...item,
    decisionStatement: trimmed,
    strategyType: strategyType ?? item.strategyType,
  };
  return {
    decisionStatement: trimmed,
    title,
    plainLanguageSummary: trimmed.slice(0, 220),
    // Intentionally leave currentReality empty until real context arrives
    currentReality: item.currentReality?.trim() || undefined,
    status: "understanding",
    currentStage: assessJudgmentStage(draft),
    activeQuestion: undefined,
    shariReflection: undefined,
    strategyType: strategyType ?? item.strategyType,
    strategyFamily:
      analysis.strategyTypeId === "pricing"
        ? "money_and_resources"
        : analysis.strategyTypeId === "growth" ||
            analysis.strategyTypeId === "market_customer"
          ? "customer_and_market"
          : analysis.strategyTypeId === "offer"
            ? "offers_and_innovation"
            : analysis.strategyTypeId === "hiring_delegation"
              ? "people_and_leadership"
              : analysis.strategyTypeId === "capacity_focus" ||
                  analysis.strategyTypeId === "personal_direction"
                ? "personal_direction"
                : item.strategyFamily ?? "business_direction",
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
      signals.includes("evidence") ||
      signals.includes("fact") ||
      signals.includes("concern") ||
      signals.includes("constraint") ||
      signals.includes("risk")
    ) {
      patch.currentReality = trimmed;
    }
  } else if (signals.includes("evidence") || signals.includes("fact")) {
    patch.observations = pushUnique(item.observations, trimmed);
  }

  const classified = classifyStrategicInput(trimmed);
  const statement = analyzeStrategicStatement(trimmed);
  // Epistemic discipline: feelings ≠ evidence; assumptions ≠ facts;
  // observations ≠ proven causes; interpretations stay tentative.
  if (
    statement.nature === "assumption" ||
    signals.includes("assumption") ||
    classified.classifications.includes("assumption")
  ) {
    patch.assumptions = pushUnique(item.assumptions, trimmed);
  }
  if (statement.safeToTreatAsFact && statement.nature === "fact") {
    patch.knownFacts = pushUnique(item.knownFacts, trimmed);
  } else if (
    statement.nature === "observation" &&
    statement.safeToPresentAsEvidence
  ) {
    patch.observations = pushUnique(item.observations, trimmed);
  }
  // Feelings / interpretations never populate knownFacts
  if (signals.includes("concern") || signals.includes("risk")) {
    patch.risks = pushUnique(item.risks, trimmed);
  }
  if (signals.includes("constraint")) {
    patch.constraints = pushUnique(item.constraints, trimmed);
  }
  if (signals.includes("goal")) {
    patch.desiredDirection = item.desiredDirection?.trim() || trimmed;
  }
  if (signals.includes("opportunity")) {
    patch.opportunities = pushUnique(item.opportunities, trimmed);
  }
  if (signals.includes("decision")) {
    patch.chosenDirection = item.chosenDirection?.trim() || trimmed;
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
      patch.status = "exploring";
    }
  }

  const merged: StrategyWorkItem = {
    ...item,
    ...patch,
    memberStatements: patch.memberStatements ?? item.memberStatements,
    optionsConsidered: patch.optionsConsidered ?? item.optionsConsidered,
    assumptions: patch.assumptions ?? item.assumptions,
    risks: patch.risks ?? item.risks,
    constraints: patch.constraints ?? item.constraints,
    currentReality: patch.currentReality ?? item.currentReality,
    desiredDirection: patch.desiredDirection ?? item.desiredDirection,
    chosenDirection: patch.chosenDirection ?? item.chosenDirection,
    knownFacts: patch.knownFacts ?? item.knownFacts,
    observations: patch.observations ?? item.observations,
    opportunities: patch.opportunities ?? item.opportunities,
  };
  patch.currentStage = assessJudgmentStage(merged);
  if (merged.optionsConsidered?.length && !merged.chosenDirection?.trim()) {
    patch.status = "exploring";
  } else if (merged.chosenDirection?.trim()) {
    patch.status = "direction_chosen";
  } else if (merged.currentReality?.trim()) {
    patch.status = "understanding";
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
  const patch: Partial<StrategyWorkItem> = {
    chosenDirection: option.title,
    notChosen,
    decisionRationale:
      option.whyItMayFit ||
      item.decisionRationale ||
      "Chosen after exploring options in the Strategy Chamber.",
    status: "direction_chosen",
  };
  const merged = { ...item, ...patch };
  patch.currentStage = assessJudgmentStage(merged);
  return patch;
}
