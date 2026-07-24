import type { StrategyTypeContract } from "../types";

export const partnershipStrategyType: StrategyTypeContract = {
  id: "partnership",
  name: "Partnership Strategy",
  family: "people_and_leadership",
  plainLanguageDescription:
    "Evaluate strategic fit, values, decision rights, risk, and exit paths — preferring a pilot before deep commitment.",
  useWhen: [
    "Considering a collaboration, JV, affiliate, or strategic partner",
    "Someone proposed working together and the stakes feel high",
    "Need to decide whether to partner, pilot, delay, or decline",
  ],
  doNotUseWhen: ["Need is only drafting a contract with the decision already made"],
  entrySignals: [
    /\b(partner(ship)?|collaborat|joint venture|jv|co-?create|affiliate partner|strategic alliance)\b/i,
    /\b(work together|go in together|share (the )?risk)\b/i,
  ],
  clarifyingQuestions: [
    "What would this partnership make possible that you cannot do alone?",
    "Is the real decision whether to partner, how to structure it, or whether to decline?",
  ],
  currentStateQuestions: [
    "What do you already know about strategic fit and values alignment?",
    "What decision rights would each side need?",
    "What would a clean exit look like if this does not work?",
  ],
  directionQuestions: [
    "What shared expectations must be true before you commit?",
    "What risk are you unwilling to take in this partnership?",
    "Would a small pilot answer the biggest unknown?",
  ],
  optionPatterns: ["test", "partner", "delay", "pause", "continue", "stop"],
  decisionCriteria: [
    "strategic fit",
    "values alignment",
    "decision rights",
    "exit path",
    "risk",
    "shared expectations",
  ],
  commonTradeoffs: [
    "speed of partnership vs clarity of terms",
    "shared upside vs shared complexity",
    "exclusivity vs flexibility",
  ],
  commonRisks: [
    "values misalignment discovered late",
    "unclear decision rights creating conflict",
    "no exit path",
    "reputation risk from the other party",
    "capacity drain from coordination",
  ],
  commonAssumptions: [
    "partnership will save time",
    "good chemistry means good structure",
    "you can figure out details later",
  ],
  evidencePrompts: [
    "What evidence do you have of how they decide under pressure?",
    "What have prior collaborations taught you?",
    "What would need to be written down for this to feel safe?",
  ],
  capacityChecks: [
    "Do you have capacity for coordination and relationship maintenance?",
    "Would this partnership distract from a more important focus?",
  ],
  experimentPatterns: [
    "Pilot one small shared project before a long commitment",
    "Define decision rights and exit terms in a one-page agreement first",
    "Run a 30–60 day collaboration with a review gate",
  ],
  successSignals: [
    "Clear decision rights",
    "Values still aligned after a hard moment",
    "Pilot results support deeper commitment — or a clean no",
  ],
  reviewTriggers: [
    "Missed expectations",
    "Decision deadlock",
    "Reputation concern",
    "Capacity strain from coordination",
  ],
  recommendedChamberMembers: ["strategy", "risk", "leadership"],
  recommendedBoardRoles: ["strategy-director", "risk", "devil-advocate"],
  handoffDestinations: ["board", "project", "talk_it_out", "create"],
  adaptivePresentationNotes:
    "Pilot before commitment. Declining is a valid strategic outcome.",
  qualityChecks: [
    "Exit path considered",
    "Pilot option present before deep commitment",
  ],
  decisionHeuristics: [
    {
      id: "pilot_first",
      rule: "Prefer a pilot before deep commitment.",
      when: "Uncertainty about fit, values, or working rhythm is high",
    },
    {
      id: "values_and_rights",
      rule: "Values alignment and decision rights matter as much as opportunity size.",
      when: "Deal looks exciting but structure is vague",
    },
    {
      id: "exit_path",
      rule: "Do not enter without a believable exit path.",
      when: "Commitment is hard to reverse",
    },
    {
      id: "decline_is_ok",
      rule: "Declining or delaying can be the wise partnership strategy.",
      when: "Fit is weak or capacity is tight",
    },
  ],
  commonMistakes: [
    "Partnering to avoid building capability",
    "Skipping decision rights because trust feels high",
    "No shared definition of success",
    "No exit conversation until conflict",
  ],
  warningSigns: [
    "Urgency to sign before clarity",
    "Vague “we’ll figure it out” on money or credit",
    "Values talk feels performative",
    "One side carries most of the risk",
  ],
  problemDistinctions: [
    {
      id: "strategic_fit",
      label: "Strategic fit",
      description: "Does this advance your direction, or distract from it?",
      whenToSuspect: ["fit", "aligned", "distracts", "off strategy"],
      preferredPatterns: ["delay", "stop", "test"],
    },
    {
      id: "values_alignment",
      label: "Values alignment",
      description: "Shared values under pressure matter more than shared enthusiasm.",
      whenToSuspect: ["values", "trust", "how they treat", "reputation"],
      preferredPatterns: ["delay", "test", "stop"],
    },
    {
      id: "decision_rights",
      label: "Decision rights",
      description: "Unclear who decides will become conflict.",
      whenToSuspect: ["who decides", "control", "veto", "decision rights"],
      preferredPatterns: ["delay", "test", "partner"],
    },
    {
      id: "exit_paths",
      label: "Exit paths",
      description: "Commitment without exit is a major risk.",
      whenToSuspect: ["exit", "unwind", "stuck", "long contract"],
      preferredPatterns: ["delay", "test", "pause"],
    },
    {
      id: "pilot",
      label: "Pilot before commitment",
      description: "A bounded trial may answer the real unknowns.",
      whenToSuspect: ["pilot", "trial", "test together", "small project first"],
      preferredPatterns: ["test", "delay", "partner"],
    },
  ],
  guidingPrinciples: [
    "Pilot before commitment.",
    "Strategic fit and values beat opportunity size.",
    "Shared expectations and exit paths are part of the strategy, not legal afterthoughts.",
  ],
  version: 2,
};
