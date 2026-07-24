import type { StrategyTypeContract } from "../types";

export const pivotRethinkStrategyType: StrategyTypeContract = {
  id: "pivot_rethink",
  name: "Pivot or Rethink Strategy",
  family: "business_direction",
  plainLanguageDescription:
    "Distinguish temporary slumps, messaging issues, offer issues, market shifts, and execution problems — treating a full pivot as a last resort.",
  useWhen: [
    "Current direction is not improving",
    "Considering a pivot or major rethink",
    "Evidence conflicts with the original plan",
    "Need to tell a temporary slump from a true wrong path",
  ],
  doNotUseWhen: ["Need is a small tweak with no rethink"],
  entrySignals: [
    /\b(pivot|rethink|not working|isn'?t working|change direction|start over|wrong path|wrong strategy)\b/i,
  ],
  clarifyingQuestions: [
    "Are you deciding to adjust, pause, or truly change direction?",
    "What kind of “not working” is this — temporary, messaging, offer, market, execution, or strategy?",
  ],
  currentStateQuestions: [
    "What evidence shows the current direction is not working?",
    "What still has value that you do not want to lose?",
    "What have you already tried to improve without pivoting?",
  ],
  directionQuestions: [
    "What would a rethink make possible?",
    "What must remain true even if the path changes?",
    "What would need to be true before a full pivot is justified?",
  ],
  optionPatterns: [
    "improve",
    "narrow",
    "reposition",
    "staged_transition",
    "test",
    "pause",
    "stop",
    "continue",
  ],
  decisionCriteria: [
    "evidence strength",
    "diagnosis quality",
    "sunk-cost awareness",
    "reversibility",
    "what still works",
  ],
  commonTradeoffs: [
    "learning already invested vs better fit ahead",
    "speed of change vs preserving what works",
    "full pivot vs staged transition",
  ],
  commonRisks: [
    "pivoting from impatience",
    "keeping a failing path from sunk cost",
    "throwing away what still works",
    "misdiagnosing a messaging issue as a market failure",
  ],
  commonAssumptions: [
    "starting over is required",
    "small adjustments are enough",
    "if it is hard, it must be wrong",
    "a pivot will feel clearer immediately",
  ],
  evidencePrompts: [
    "What is confirmed vs still assumed about the problem?",
    "What would improve if messaging or offer changed without a full pivot?",
    "What market signals are temporary vs structural?",
  ],
  capacityChecks: [
    "Does a pivot require more capacity than you have this season?",
    "Can you run a staged transition without burning the core?",
  ],
  experimentPatterns: [
    "Test the new direction in a limited scope before fully leaving the old one",
    "Fix messaging or offer first and review evidence for 30 days",
    "Pause new investment while diagnosing before committing to a pivot",
  ],
  successSignals: [
    "Clearer diagnosis",
    "Clearer fit signals",
    "Reduced friction without unnecessary destruction",
  ],
  reviewTriggers: [
    "New conflicting evidence",
    "Capacity shock",
    "Temporary slump resolves — or does not",
  ],
  recommendedChamberMembers: ["strategy", "risk"],
  recommendedBoardRoles: ["strategy-director", "devil-advocate", "risk"],
  handoffDestinations: ["board", "talk_it_out", "project", "evidence_vault"],
  adaptivePresentationNotes:
    "Pivot is last resort. Prefer diagnosis and smaller corrections first.",
  qualityChecks: [
    "Preserve what still works",
    "Pivot not recommended as first option without diagnosis",
  ],
  decisionHeuristics: [
    {
      id: "pivot_last_resort",
      rule: "A pivot should be a last resort, not the first recommendation.",
      when: "Member wants to start over early in diagnosis",
    },
    {
      id: "diagnose_failure_mode",
      rule: "Name whether the issue is temporary, messaging, offer, market, execution, strategy, or timing.",
      when: "“Not working” is still vague",
    },
    {
      id: "preserve_what_works",
      rule: "Protect what still works while testing change.",
      when: "Parts of the business remain healthy",
    },
    {
      id: "staged_before_full",
      rule: "Prefer staged transition or limited test before full pivot.",
      when: "New direction is still under-evidenced",
    },
  ],
  commonMistakes: [
    "Pivoting from a temporary slump",
    "Calling an execution issue a market failure",
    "Abandoning a good offer because messaging was weak",
    "Ignoring sunk-cost bias in both directions",
  ],
  warningSigns: [
    "Desire to start over after one hard month",
    "No clear evidence definition of “not working”",
    "New idea excitement exceeds diagnosis effort",
  ],
  problemDistinctions: [
    {
      id: "temporary_slump",
      label: "Temporary slump",
      description: "A hard season may not mean the strategy is wrong.",
      whenToSuspect: ["temporary", "this month", "slow season", "dip", "slump"],
      preferredPatterns: ["stabilize", "continue", "improve"],
    },
    {
      id: "messaging",
      label: "Messaging issue",
      description: "The offer or market may be fine; the story may not be landing.",
      whenToSuspect: ["messaging", "wording", "they don’t get it", "copy"],
      preferredPatterns: ["reposition", "improve", "test"],
    },
    {
      id: "offer_issue",
      label: "Offer issue",
      description: "The direction may be fine; the offer may need change — not a full pivot.",
      whenToSuspect: ["offer isn’t", "package", "nobody buys this", "wrong offer"],
      preferredPatterns: ["improve", "simplify", "test"],
    },
    {
      id: "market_shift",
      label: "Market shift",
      description: "External change may require adaptation without abandoning everything.",
      whenToSuspect: ["market shifted", "industry changed", "demand disappeared"],
      preferredPatterns: ["reposition", "narrow", "staged_transition"],
    },
    {
      id: "execution",
      label: "Execution issue",
      description: "Strategy may be sound; follow-through may be the gap.",
      whenToSuspect: ["execution", "inconsistent", "didn’t follow through", "capacity"],
      preferredPatterns: ["stabilize", "simplify", "improve"],
    },
    {
      id: "wrong_strategy",
      label: "Wrong strategy",
      description: "Evidence may show the core bet is wrong — still prefer staged change.",
      whenToSuspect: ["wrong strategy", "core bet failed", "fundamental"],
      preferredPatterns: ["staged_transition", "test", "stop"],
    },
    {
      id: "wrong_timing",
      label: "Wrong timing",
      description: "The idea may be right later, not now.",
      whenToSuspect: ["timing", "too early", "too late", "not ready"],
      preferredPatterns: ["delay", "pause", "test"],
    },
  ],
  hiddenUnderlyingQuestions: [
    "What kind of “not working” is this — temporary, messaging, offer, market, execution, strategy, or timing?",
    "What still works that we must not throw away?",
    "What evidence would justify a full pivot versus a smaller correction?",
    "Have we tried improve / narrow / reposition before starting over?",
  ],
  recommendationRules: [
    "Treat a full pivot as a last resort, not the first recommendation.",
    "Prefer diagnose-and-adjust before recommending start-over.",
    "Prefer staged transition or limited test before full pivot.",
    "Preserve what still works in every recommendation.",
  ],
  handoffBoundaries: [
    "Stay in Strategy until the failure mode is named.",
    "Board/Devil’s Advocate is appropriate before irreversible pivots.",
    "Do not hand to Create/rebrand execution while diagnosis is still “everything is wrong.”",
  ],
  guidingPrinciples: [
    "A pivot should be a last resort, not the first recommendation.",
    "Diagnose the failure mode before changing identity.",
    "Preserve what still works.",
  ],
  version: 2,
};
