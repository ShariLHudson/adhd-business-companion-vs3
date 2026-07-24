import type { StrategyDecisionRecordView, StrategyWorkItem } from "./types";

const PLACEHOLDER_DIRECTION = "A direction has not been chosen yet.";
const PLACEHOLDER_WHY =
  "When you choose, the reason will live here so Future You does not have to reconstruct it.";
const PLACEHOLDER_NOT_CHOSEN =
  "Nothing ruled out yet — you can decide what not to pursue as clarity grows.";
const PLACEHOLDER_HAPPENING =
  "You are still gathering what is true right now.";
const PLACEHOLDER_NEXT =
  "Stay here until the direction feels clear enough to hand off — then choose one next step.";

function sameText(a?: string | null, b?: string | null): boolean {
  return Boolean(a?.trim() && b?.trim() && a.trim() === b.trim());
}

/**
 * Concise Strategy Decision Record — built from conversation, not a form.
 * Never copies the strategic question into "what is happening now".
 */
export function buildStrategyDecisionRecord(
  item: StrategyWorkItem,
): StrategyDecisionRecordView {
  const question =
    item.decisionStatement?.trim() || item.title || "Your strategic question";
  const reality = item.currentReality?.trim();
  const happening =
    reality && !sameText(reality, question) ? reality : "";

  const notChosen = item.notChosen?.filter(Boolean).join("; ") || "";

  return {
    whatYouWereDeciding: question,
    whatIsHappeningNow: happening,
    directionYouChose: item.chosenDirection?.trim() || "",
    whyThisDirectionFits: item.decisionRationale?.trim() || "",
    whatYouAreNotChoosing: notChosen,
    assumptionsToTest: item.assumptions?.filter(Boolean) ?? [],
    risksToWatch: item.risks?.filter(Boolean) ?? [],
    howYouWillKnowItIsWorking: item.successSignals?.filter(Boolean) ?? [],
    whenToReview: item.reviewDate?.trim() || "",
    nextHelpfulStep: item.recommendedNextDestination?.trim() || "",
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

/** Hide empty / placeholder sections so the record never looks like a blank form. */
export function decisionRecordSectionHasContent(
  key: keyof StrategyDecisionRecordView,
  record: StrategyDecisionRecordView,
): boolean {
  const value = record[key];
  if (Array.isArray(value)) return value.length > 0;
  const text = String(value ?? "").trim();
  if (!text) return false;
  const placeholders = [
    PLACEHOLDER_DIRECTION,
    PLACEHOLDER_WHY,
    PLACEHOLDER_NOT_CHOSEN,
    PLACEHOLDER_HAPPENING,
    PLACEHOLDER_NEXT,
  ];
  if (placeholders.includes(text)) return false;
  // Prevent repeating the strategic question under "happening"
  if (
    key === "whatIsHappeningNow" &&
    sameText(text, record.whatYouWereDeciding)
  ) {
    return false;
  }
  return true;
}

export const DECISION_RECORD_OPTIONAL_LIST_KEYS: Array<
  keyof StrategyDecisionRecordView
> = [
  "assumptionsToTest",
  "risksToWatch",
  "howYouWillKnowItIsWorking",
  "whatIsHappeningNow",
  "directionYouChose",
  "whyThisDirectionFits",
  "whatYouAreNotChoosing",
  "whenToReview",
  "nextHelpfulStep",
  "optionsConsideredSummary",
  "whyOptionsDiffered",
  "tradeoffsSummary",
  "opportunityCostsSummary",
  "reversibilityNote",
  "experimentsConsidered",
  "whatWouldChangeTheDecision",
  "companionRecommendation",
];

/** Core sections that may still show when present; all others are optional. */
export const DECISION_RECORD_CORE_KEYS: Array<keyof StrategyDecisionRecordView> =
  ["whatYouWereDeciding"];
