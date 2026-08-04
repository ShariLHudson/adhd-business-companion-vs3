/**
 * P0.40 — Quick Save™ routing for Growth Center (Growth Vault™ + Outcome Goals™).
 */

export type QuickSaveDestination =
  | "my-journey"
  | "wins"
  | "evidence"
  | "portfolio"
  | "goal-progress";

export type QuickSaveRecommendation = {
  recommended: QuickSaveDestination;
  alternatives: QuickSaveDestination[];
  label: string;
};

const DESTINATION_LABELS: Record<QuickSaveDestination, string> = {
  "my-journey": "My Journey™",
  wins: "My Wins™",
  evidence: "Evidence Bank™",
  portfolio: "Portfolio™",
  "goal-progress": "Goal Progress",
};

export function quickSaveDestinationLabel(dest: QuickSaveDestination): string {
  return DESTINATION_LABELS[dest];
}

export function recommendQuickSaveDestination(text: string): QuickSaveRecommendation {
  const t = text.trim().toLowerCase();
  if (!t) {
    return {
      recommended: "wins",
      alternatives: ["evidence", "my-journey", "portfolio"],
      label: DESTINATION_LABELS.wins,
    };
  }

  if (
    /\b(?:decided|decision|chose|choose|going with|hired|fired|picked|selected)\b/i.test(
      t,
    )
  ) {
    return {
      recommended: "my-journey",
      alternatives: ["wins", "evidence", "portfolio"],
      label: DESTINATION_LABELS["my-journey"],
    };
  }

  if (
    /\b(?:course|book|funnel|template|website|workshop|lead magnet|presentation|product)\b/i.test(
      t,
    )
  ) {
    return {
      recommended: "portfolio",
      alternatives: ["wins", "evidence", "my-journey"],
      label: DESTINATION_LABELS.portfolio,
    };
  }

  if (
    /\b(?:signed|closed|won|finished|completed|shipped|launched|sold|got a client)\b/i.test(
      t,
    )
  ) {
    return {
      recommended: "wins",
      alternatives: ["evidence", "goal-progress", "portfolio"],
      label: DESTINATION_LABELS.wins,
    };
  }

  if (
    /\b(?:feedback|testimonial|review|proof|result|impact|they said|positive)\b/i.test(
      t,
    )
  ) {
    return {
      recommended: "evidence",
      alternatives: ["wins", "my-journey", "portfolio"],
      label: DESTINATION_LABELS.evidence,
    };
  }

  if (/\b(?:learned|lesson|realized|figured out|insight|takeaway)\b/i.test(t)) {
    return {
      recommended: "my-journey",
      alternatives: ["wins", "evidence", "portfolio"],
      label: DESTINATION_LABELS["my-journey"],
    };
  }

  if (/\b(?:progress|metric|moved closer|closer to goal)\b/i.test(t)) {
    return {
      recommended: "goal-progress",
      alternatives: ["wins", "evidence", "my-journey"],
      label: DESTINATION_LABELS["goal-progress"],
    };
  }

  return {
    recommended: "wins",
    alternatives: ["evidence", "my-journey", "portfolio"],
    label: DESTINATION_LABELS.wins,
  };
}
