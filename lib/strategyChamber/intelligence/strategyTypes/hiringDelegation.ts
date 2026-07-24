import type { StrategyTypeContract } from "../types";

export const hiringDelegationStrategyType: StrategyTypeContract = {
  id: "hiring_delegation",
  name: "Hiring or Delegation Strategy",
  family: "people_and_leadership",
  plainLanguageDescription:
    "Decide what work needs relief and whether to automate, simplify, delegate, contract, hire, or wait — not “hire someone” by default.",
  useWhen: [
    "Considering hiring help",
    "Overloaded by work others could own",
    "Unsure if people, process, or automation is the issue",
    "Wondering about contractor vs employee or delegation readiness",
  ],
  doNotUseWhen: ["Need is only writing a job post with decision already made"],
  entrySignals: [
    /\b(hire|hiring|delegate|delegation|va|assistant|team|employee|contractor|outsource|automate)\b/i,
  ],
  clarifyingQuestions: [
    "Is the real decision whether to hire, what to hand off, whether to automate, or how to redesign the work?",
    "What work needs relief most — and is that work clear enough to give away?",
  ],
  currentStateQuestions: [
    "Which work is draining capacity the most?",
    "What has already been tried with help, systems, or simplification?",
    "Do you have room to train and manage help right now?",
  ],
  directionQuestions: [
    "What outcome would good help create?",
    "What must stay in your hands for now?",
    "Would a contractor or a small experiment teach enough before a hire?",
  ],
  optionPatterns: [
    "delegate",
    "automate",
    "simplify",
    "test",
    "delay",
    "partner",
    "stabilize",
  ],
  decisionCriteria: [
    "work clarity",
    "automation potential",
    "management burden",
    "financial readiness",
    "delegation readiness",
    "reversibility",
  ],
  commonTradeoffs: [
    "relief vs management cost",
    "speed vs training time",
    "contractor flexibility vs continuity",
    "hiring cost vs founder focus recovered",
  ],
  commonRisks: [
    "hiring before role clarity",
    "new management burden",
    "automating a messy process",
    "financial strain from premature headcount",
  ],
  commonAssumptions: [
    "hiring is the only relief path",
    "a great person will figure out an unclear role",
    "delegation does not need documentation",
  ],
  evidencePrompts: [
    "Which tasks are clear enough that someone else could own them?",
    "What would you automate if hiring were not available?",
    "What would break if you were unavailable for two weeks?",
  ],
  capacityChecks: [
    "Do you have room to train and manage help?",
    "Is cash ready for the commitment you are considering?",
  ],
  experimentPatterns: [
    "Delegate one clear task for two weeks before a larger hire",
    "Contractor pilot for one workstream before employment",
    "Simplify or automate the top draining task before hiring for it",
  ],
  successSignals: [
    "Protected founder focus",
    "Reliable handoff of defined work",
    "Management load stays sustainable",
  ],
  reviewTriggers: ["Quality slip", "Cash pressure", "Founder becomes the bottleneck again"],
  recommendedChamberMembers: ["strategy", "leadership"],
  recommendedBoardRoles: ["strategy-director", "leadership"],
  handoffDestinations: ["project", "board", "create", "plan_my_day"],
  adaptivePresentationNotes:
    "Delay, automate, simplify, and contractor-first are valid beside hire.",
  qualityChecks: [
    "Role clarity before hire recommendation",
    "Automation and simplification considered",
  ],
  decisionHeuristics: [
    {
      id: "relief_first",
      rule: "Name the work that needs relief before naming a role.",
      when: "Member says “I need to hire” without a work inventory",
    },
    {
      id: "automate_or_simplify",
      rule: "Ask whether the work can be automated or simplified before adding people.",
      when: "Work is repetitive or unnecessarily complex",
    },
    {
      id: "contractor_first",
      rule: "Prefer a contractor or pilot when the role is still forming.",
      when: "Scope is unclear or financial readiness is medium",
    },
    {
      id: "management_burden",
      rule: "Count management burden as a real cost of hiring.",
      when: "Founder capacity is already tight",
    },
  ],
  commonMistakes: [
    "Hiring to escape an unclear process",
    "Delegating without decision rights",
    "Assuming a VA solves a strategy problem",
    "Ignoring financial readiness",
  ],
  warningSigns: [
    "Job description is a dump of everything hated",
    "No time to onboard",
    "Cash is tight and hire feels like rescue",
  ],
  problemDistinctions: [
    {
      id: "work_relief",
      label: "Work needing relief",
      description: "Identify the draining work before designing help.",
      whenToSuspect: ["overwhelmed", "too much admin", "drowning in", "relief"],
      preferredPatterns: ["delegate", "simplify", "automate"],
    },
    {
      id: "automation",
      label: "Can it be automated?",
      description: "Some relief belongs to systems, not people.",
      whenToSuspect: ["automate", "repetitive", "same every week", "manual"],
      preferredPatterns: ["automate", "simplify", "test"],
    },
    {
      id: "simplify_first",
      label: "Can it be simplified?",
      description: "Do not hire into unnecessary complexity.",
      whenToSuspect: ["too complicated", "simplify", "process mess"],
      preferredPatterns: ["simplify", "stabilize", "delay"],
    },
    {
      id: "contractor_first",
      label: "Contractor first",
      description: "A bounded pilot may beat a permanent hire.",
      whenToSuspect: ["contractor", "freelance", "pilot", "part time help"],
      preferredPatterns: ["test", "delegate", "delay"],
    },
    {
      id: "delegation_readiness",
      label: "Delegation readiness",
      description: "Unclear work cannot be cleanly handed off yet.",
      whenToSuspect: ["can’t explain", "in my head", "no sop", "not ready to hand off"],
      preferredPatterns: ["simplify", "delay", "test"],
    },
    {
      id: "financial_readiness",
      label: "Financial readiness",
      description: "Relief that creates cash stress is not relief.",
      whenToSuspect: ["can’t afford", "cash", "runway", "expensive"],
      preferredPatterns: ["delay", "automate", "simplify"],
    },
  ],
  guidingPrinciples: [
    "Do not default to “hire someone.”",
    "Relief → clarify work → automate/simplify → pilot → hire.",
    "Management burden and financial readiness are strategic factors.",
  ],
  version: 2,
};
