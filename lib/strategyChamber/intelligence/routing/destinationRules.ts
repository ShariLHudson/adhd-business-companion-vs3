import type { ContinueJourneyDestinationId, StrategyWorkItem } from "../../types";
import type { DecisionReadinessAssessment, HandoffRecommendation } from "../types";

function rec(
  destinationId: ContinueJourneyDestinationId,
  title: string,
  benefit: string,
  actionLabel: string,
  reason: string,
): HandoffRecommendation {
  return { destinationId, title, benefit, actionLabel, reason };
}

/**
 * Route only when another destination becomes the next most useful place.
 */
export function recommendHandoffDestination(
  item: StrategyWorkItem,
  readiness: DecisionReadinessAssessment,
): HandoffRecommendation | null {
  const blob = [
    item.decisionStatement,
    item.currentReality,
    ...(item.memberStatements ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const emotional =
    /\b(overwhelm|scared|anxious|conflicted|tangled|hurt)\b/.test(blob) ||
    item.entryReason === "unsure" ||
    item.entryReason === "rethink_current_direction";

  if (
    !item.chosenDirection?.trim() &&
    emotional &&
    (readiness.readiness === "problem_not_yet_clear" ||
      readiness.readiness === "reality_not_yet_understood")
  ) {
    return rec(
      "talk_it_out",
      "Talk it through first",
      "When the choice feels tangled, a calmer conversation can reveal what you actually want.",
      "Open Talk It Out",
      "Emotion is blocking clear strategic judgment.",
    );
  }

  if (
    !item.chosenDirection?.trim() &&
    (readiness.readiness === "tradeoffs_not_evaluated" ||
      readiness.readiness === "risks_not_reviewed" ||
      item.currentStage === "evaluate_tradeoffs")
  ) {
    return rec(
      "board",
      "Get a Board challenge",
      "Multiple perspectives help when the stakes are high and options compete.",
      "Open the Board",
      "Challenge and alternate views would improve the decision.",
    );
  }

  if (!item.chosenDirection?.trim()) {
    return null;
  }

  if (/\b(budget|cash|afford|forecast|revenue target)\b/.test(blob)) {
    return rec(
      "business_estate",
      "Check Business Estate context",
      "Affordability and business facts should inform the next move.",
      "Open Business Estate",
      "Money or business-profile depth is now the limiting factor.",
    );
  }

  if (/\b(marketing|campaign|content|audience message)\b/.test(blob)) {
    return rec(
      "create",
      "Create the next strategic asset",
      "The direction is clear enough to shape a finished piece of work.",
      "Open Create",
      "Execution now needs a created asset, not more strategy.",
    );
  }

  if (item.experiments?.length || /\b(test|pilot)\b/i.test(item.chosenDirection)) {
    return rec(
      "project",
      "Turn the test into a small project",
      "A contained project keeps the experiment from becoming a hidden full build.",
      "Open Projects",
      "An approved experiment needs coordinated follow-through.",
    );
  }

  return rec(
    "project",
    "Move the direction into a project",
    "Implementation belongs in Projects once the direction is chosen.",
    "Open Projects",
    "Direction is clear; execution is the next useful place.",
  );
}
