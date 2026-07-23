import type { StrategyTypeContract } from "../types";

export const capacityFocusStrategyType: StrategyTypeContract = {
  id: "capacity_focus",
  name: "Capacity and Focus Strategy",
  family: "personal_direction",
  plainLanguageDescription:
    "Decide what fits current time, energy, and focus — including doing less.",
  useWhen: [
    "Overcommitted or scattered",
    "Good ideas exceed available capacity",
    "Focus needs protecting",
  ],
  doNotUseWhen: ["Only need a daily plan with no strategic trade-off"],
  entrySignals: [
    /\b(capacity|focus|overwhelm|too much|bandwidth|energy|spread thin|simplify)\b/i,
  ],
  clarifyingQuestions: [
    "Is the real decision about what to stop, what to protect, or what to pursue?",
  ],
  currentStateQuestions: [
    "What already takes most of your time and energy?",
    "What changed that made capacity feel tight?",
  ],
  directionQuestions: [
    "What deserves protected focus in this season?",
    "What would need to stop to make room?",
  ],
  optionPatterns: ["simplify", "narrow", "delay", "stabilize", "stop", "continue"],
  decisionCriteria: ["energy", "focus", "sustainability", "priority fit"],
  commonTradeoffs: ["ambition vs recoverability"],
  commonRisks: ["silent overcommitment", "dropping what still matters"],
  commonAssumptions: ["you should be able to do it all"],
  evidencePrompts: ["Where does your week actually go right now?"],
  capacityChecks: ["Even if this is a good idea, is there room for it now?"],
  experimentPatterns: ["Pause one commitment for 30 days and notice the effect"],
  successSignals: ["Fewer competing priorities", "Steadier follow-through"],
  reviewTriggers: ["Energy crash", "New major demand"],
  recommendedChamberMembers: ["strategy"],
  recommendedBoardRoles: ["strategy-director"],
  handoffDestinations: ["plan_my_day", "rhythm", "talk_it_out", "project"],
  adaptivePresentationNotes: "Doing less is a valid strategic conclusion.",
  qualityChecks: ["Capacity treated as real condition"],
  version: 1,
};
