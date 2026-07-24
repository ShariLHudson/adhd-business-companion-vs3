import type { StrategyTypeContract } from "../types";

export const capacityFocusStrategyType: StrategyTypeContract = {
  id: "capacity_focus",
  name: "Capacity and Focus Strategy",
  family: "personal_direction",
  plainLanguageDescription:
    "Decide what fits current time, energy, and focus — especially valuable when ADHD, overcommitment, or too many active offers make “do less” the strategic move.",
  useWhen: [
    "Overcommitted or scattered",
    "Good ideas exceed available capacity",
    "Too many priorities or active offers",
    "Focus, energy, or decision fatigue needs protecting",
  ],
  doNotUseWhen: ["Only need a daily plan with no strategic trade-off"],
  entrySignals: [
    /\b(capacity|focus|overwhelm|too much|bandwidth|energy|spread thin|simplify|priorit|decision fatigue|context switch|hyperfocus|overcommit)\b/i,
    /\b(too many (priorities|offers|projects|things))\b/i,
  ],
  clarifyingQuestions: [
    "Is the real decision about what to stop, what to protect, or what to pursue?",
    "Are you carrying too many priorities, too many offers, or hidden maintenance?",
  ],
  currentStateQuestions: [
    "What already takes most of your time and energy?",
    "What changed that made capacity feel tight?",
    "Which commitments create maintenance even when you are not “working on them”?",
  ],
  directionQuestions: [
    "What deserves protected focus in this season?",
    "What would need to stop to make room?",
    "Would stopping three things create more progress than starting one more?",
  ],
  optionPatterns: [
    "simplify",
    "narrow",
    "delay",
    "stabilize",
    "stop",
    "pause",
    "continue",
  ],
  decisionCriteria: [
    "energy",
    "focus",
    "sustainability",
    "priority fit",
    "maintenance load",
    "decision load",
  ],
  commonTradeoffs: [
    "ambition vs recoverability",
    "keeping options open vs protecting focus",
    "saying yes to opportunity vs protecting energy",
  ],
  commonRisks: [
    "silent overcommitment",
    "dropping what still matters",
    "hyperfocus on the wrong thing",
    "context switching that erases progress",
  ],
  commonAssumptions: [
    "you should be able to do it all",
    "stopping means failure",
    "every open offer must stay open",
  ],
  evidencePrompts: [
    "Where does your week actually go right now?",
    "Which three things create the most drag?",
    "What do you keep restarting because focus keeps breaking?",
  ],
  capacityChecks: [
    "Even if this is a good idea, is there room for it now?",
    "What energy season are you actually in?",
  ],
  experimentPatterns: [
    "Pause one commitment for 30 days and notice the effect",
    "Stop three low-value activities for two weeks",
    "Protect one focus block daily and review after ten days",
  ],
  successSignals: [
    "Fewer competing priorities",
    "Steadier follow-through",
    "Lower decision fatigue",
  ],
  reviewTriggers: ["Energy crash", "New major demand", "Focus fractures again"],
  recommendedChamberMembers: ["strategy"],
  recommendedBoardRoles: ["strategy-director", "founder-advocate"],
  handoffDestinations: ["plan_my_day", "rhythm", "talk_it_out", "project"],
  adaptivePresentationNotes:
    "Doing less is a valid strategic conclusion. Especially calm pacing for ADHD-aware moments.",
  qualityChecks: [
    "Capacity treated as real condition",
    "Stop / pause options present when overloaded",
  ],
  decisionHeuristics: [
    {
      id: "stop_three",
      rule: "Sometimes the best strategy is: stop doing three things.",
      when: "Priorities or offers exceed focus",
    },
    {
      id: "hidden_maintenance",
      rule: "Count hidden maintenance, not only active projects.",
      when: "Member feels busy without visible progress",
    },
    {
      id: "energy_is_data",
      rule: "Treat energy constraints as strategic data, not personal failure.",
      when: "ADHD, burnout, or recovery seasons are present",
    },
    {
      id: "one_focus",
      rule: "Protect one primary focus before adding another initiative.",
      when: "Context switching is high",
    },
  ],
  commonMistakes: [
    "Adding a system instead of removing work",
    "Keeping offers open “just in case”",
    "Planning as if energy is unlimited",
    "Using hyperfocus as a strategy without recovery",
  ],
  warningSigns: [
    "Everything is a priority",
    "Decision fatigue blocks small choices",
    "Active offers outnumber capacity",
    "Recovery never makes the plan",
  ],
  problemDistinctions: [
    {
      id: "too_many_priorities",
      label: "Too many priorities",
      description: "Focus is split across too many “important” items.",
      whenToSuspect: ["too many priorities", "everything is important", "scattered"],
      preferredPatterns: ["narrow", "simplify", "stop"],
    },
    {
      id: "too_many_offers",
      label: "Too many active offers",
      description: "Open offers create ongoing cognitive and delivery load.",
      whenToSuspect: ["too many offers", "too many programs", "open packages"],
      preferredPatterns: ["simplify", "stop", "pause"],
    },
    {
      id: "hidden_maintenance",
      label: "Hidden maintenance",
      description: "Work that stays open quietly consumes capacity.",
      whenToSuspect: ["maintenance", "keep alive", "admin", "always on"],
      preferredPatterns: ["simplify", "automate", "stop"],
    },
    {
      id: "energy_constraints",
      label: "Energy constraints",
      description: "The calendar may fit; the nervous system may not.",
      whenToSuspect: ["energy", "exhausted", "burned out", "low capacity"],
      preferredPatterns: ["stabilize", "delay", "pause"],
    },
    {
      id: "decision_fatigue",
      label: "Decision fatigue",
      description: "Too many open decisions may be the bottleneck.",
      whenToSuspect: ["decision fatigue", "can’t decide", "too many choices"],
      preferredPatterns: ["narrow", "simplify", "delay"],
    },
    {
      id: "context_switching",
      label: "Context switching / hyperfocus risk",
      description: "Switching cost or hyperfocus on the wrong work may be the issue.",
      whenToSuspect: ["context switch", "hyperfocus", "can’t stay with", "rabbit hole"],
      preferredPatterns: ["narrow", "stabilize", "simplify"],
    },
  ],
  guidingPrinciples: [
    "Doing less can be the highest-leverage strategy.",
    "Especially for ADHD users: reduce decisions and open loops.",
    "Stop / pause / simplify are first-class options.",
  ],
  version: 2,
};
