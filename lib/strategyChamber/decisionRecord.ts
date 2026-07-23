import type { StrategyDecisionRecordView, StrategyWorkItem } from "./types";

/**
 * Concise Strategy Decision Record — default outcome, not a long plan.
 */
export function buildStrategyDecisionRecord(
  item: StrategyWorkItem,
): StrategyDecisionRecordView {
  const notChosen =
    item.notChosen?.filter(Boolean).join("; ") ||
    "Nothing ruled out yet — you can decide what not to pursue as clarity grows.";

  return {
    whatYouWereDeciding:
      item.decisionStatement?.trim() ||
      item.title ||
      "Your strategic question",
    whatIsHappeningNow:
      item.currentReality?.trim() ||
      item.plainLanguageSummary ||
      "You are still gathering what is true right now.",
    directionYouChose:
      item.chosenDirection?.trim() ||
      item.desiredDirection?.trim() ||
      "A direction has not been chosen yet.",
    whyThisDirectionFits:
      item.decisionRationale?.trim() ||
      "When you choose, the reason will live here so Future You does not have to reconstruct it.",
    whatYouAreNotChoosing: notChosen,
    assumptionsToTest: item.assumptions?.filter(Boolean) ?? [],
    risksToWatch: item.risks?.filter(Boolean) ?? [],
    howYouWillKnowItIsWorking: item.successSignals?.filter(Boolean) ?? [],
    whenToReview: item.reviewDate?.trim() || "When something meaningful changes — or when you want a calm check-in.",
    nextHelpfulStep:
      item.recommendedNextDestination?.trim() ||
      "Stay here until the direction feels clear enough to hand off — then choose one next step.",
  };
}

export function decisionRecordIsReady(item: StrategyWorkItem): boolean {
  return Boolean(
    item.chosenDirection?.trim() ||
      item.status === "direction_chosen" ||
      item.status === "handed_off" ||
      item.status === "completed",
  );
}

/** Optional list sections — hide when empty so the record stays concise. */
export function decisionRecordSectionHasContent(
  key: keyof StrategyDecisionRecordView,
  record: StrategyDecisionRecordView,
): boolean {
  const value = record[key];
  if (Array.isArray(value)) return value.length > 0;
  const text = String(value ?? "").trim();
  if (!text) return false;
  // Placeholder prose for unfinished direction — still useful to show core frame
  return true;
}

export const DECISION_RECORD_OPTIONAL_LIST_KEYS: Array<
  keyof StrategyDecisionRecordView
> = ["assumptionsToTest", "risksToWatch", "howYouWillKnowItIsWorking"];
