import type { StrategyTypeContract } from "../types";

export const pivotRethinkStrategyType: StrategyTypeContract = {
  id: "pivot_rethink",
  name: "Pivot or Rethink Strategy",
  family: "business_direction",
  plainLanguageDescription:
    "Rethink a current direction carefully — including whether a full pivot is needed.",
  useWhen: [
    "Current direction is not improving",
    "Considering a pivot or major rethink",
    "Evidence conflicts with the original plan",
  ],
  doNotUseWhen: ["Need is a small tweak with no rethink"],
  entrySignals: [
    /\b(pivot|rethink|not working|change direction|start over|wrong path)\b/i,
  ],
  clarifyingQuestions: [
    "Are you deciding to adjust, pause, or truly change direction?",
  ],
  currentStateQuestions: [
    "What evidence shows the current direction is not working?",
    "What still has value that you do not want to lose?",
  ],
  directionQuestions: [
    "What would a rethink make possible?",
    "What must remain true even if the path changes?",
  ],
  optionPatterns: [
    "reposition",
    "narrow",
    "staged_transition",
    "test",
    "stop",
    "continue",
  ],
  decisionCriteria: ["evidence strength", "sunk-cost awareness", "reversibility"],
  commonTradeoffs: ["learning already invested vs better fit ahead"],
  commonRisks: ["pivoting from impatience", "keeping a failing path from sunk cost"],
  commonAssumptions: ["starting over is required", "small adjustments are enough"],
  evidencePrompts: ["What is confirmed vs still assumed about the problem?"],
  capacityChecks: ["Does a pivot require more capacity than you have this season?"],
  experimentPatterns: ["Test the new direction in a limited scope before fully leaving the old one"],
  successSignals: ["Clearer fit signals", "Reduced friction"],
  reviewTriggers: ["New conflicting evidence", "Capacity shock"],
  recommendedChamberMembers: ["strategy"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["board", "talk_it_out", "project", "evidence_vault"],
  adaptivePresentationNotes: "Board challenge useful when rethink is high-stakes.",
  qualityChecks: ["Preserve what still works"],
  version: 1,
};
