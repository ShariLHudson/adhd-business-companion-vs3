import type { StrategyTypeContract } from "../types";

export const marketCustomerStrategyType: StrategyTypeContract = {
  id: "market_customer",
  name: "Market and Customer Strategy",
  family: "customer_and_market",
  plainLanguageDescription:
    "Decide who you serve, who you do not, how clearly you speak their language, and whether audience, positioning, or journey is the real issue.",
  useWhen: [
    "Unclear ideal customer or ICP",
    "Market feels too broad",
    "Positioning or customer language may be the real issue",
    "Retention or journey friction is strategic, not only tactical",
  ],
  doNotUseWhen: ["Need is finished marketing assets with strategy already chosen"],
  entrySignals: [
    /\b(market|audience|ideal client|ideal customer|icp|customer|positioning|segment|who (do|should) i (serve|help)|customer journey|retention)\b/i,
    /\b(wrong audience|too broad|customer language)\b/i,
  ],
  clarifyingQuestions: [
    "Is the real decision about who you serve, how you reach them, how you speak to them, or what they need?",
    "Are you too broad, aiming at the wrong people, or unclear with the right people?",
  ],
  currentStateQuestions: [
    "Who already gets the most value from your work?",
    "Where does interest come from today?",
    "Where do people get stuck in the journey after they find you?",
  ],
  directionQuestions: [
    "Which customer group deserves priority in this season?",
    "Who will you intentionally not prioritize right now?",
    "What language do your best customers already use?",
  ],
  optionPatterns: [
    "narrow",
    "serve_different_audience",
    "protect_current_base",
    "reposition",
    "test",
    "improve",
  ],
  decisionCriteria: [
    "ICP clarity",
    "fit",
    "reachability",
    "customer language",
    "journey friction",
    "capacity",
  ],
  commonTradeoffs: [
    "niche clarity vs larger reach",
    "serving loyal base vs chasing a new segment",
    "positioning sharpness vs sounding exclusive",
  ],
  commonRisks: [
    "trying to speak to everyone",
    "abandoning a loyal base too soon",
    "repositioning without evidence",
    "segmenting into unservable fragments",
  ],
  commonAssumptions: [
    "more awareness alone fixes sales",
    "the whole market is the customer",
    "customer language should sound like industry jargon",
  ],
  evidencePrompts: [
    "What evidence shows who already succeeds with you?",
    "What words do happy customers use unprompted?",
    "Where does the journey break today?",
  ],
  capacityChecks: [
    "Can you serve this market well if interest rises?",
    "Does this segment need a delivery model you do not have?",
  ],
  experimentPatterns: [
    "Speak to one segment for 30 days and compare response",
    "Rewrite one page in customer language and measure engagement",
    "Interview five best-fit customers before changing ICP",
  ],
  successSignals: [
    "Clearer conversations",
    "Better-fit inquiries",
    "Stronger retention in the chosen segment",
  ],
  reviewTriggers: [
    "Segment response collapses",
    "Capacity strain",
    "Wrong-fit inquiries dominate",
  ],
  recommendedChamberMembers: ["strategy", "marketing"],
  recommendedBoardRoles: ["strategy-director", "customer"],
  handoffDestinations: ["create", "business_estate", "project", "board"],
  adaptivePresentationNotes:
    "Separate market choice from marketing execution. Narrowing is often the strategic win.",
  qualityChecks: ["Not-serving named when narrowing", "Customer language considered"],
  decisionHeuristics: [
    {
      id: "start_from_who_succeeds",
      rule: "Start ICP from who already succeeds, not from a fantasy market.",
      when: "Audience feels theoretical",
    },
    {
      id: "too_broad",
      rule: "If messaging tries to include everyone, narrow before spending on reach.",
      when: "Positioning sounds generic",
    },
    {
      id: "language_match",
      rule: "Use customer language before clever brand language.",
      when: "Engagement is low despite traffic",
    },
    {
      id: "journey_vs_audience",
      rule: "Distinguish wrong audience from broken journey.",
      when: "People arrive but do not continue",
    },
  ],
  commonMistakes: [
    "Blaming the market when the journey is broken",
    "Chasing a prestige audience you cannot serve",
    "Repositioning every month without learning",
  ],
  warningSigns: [
    "Ideal client description is a long wish list",
    "Best customers do not match marketing language",
    "Retention is weak among “target” customers",
  ],
  problemDistinctions: [
    {
      id: "wrong_audience",
      label: "Wrong audience",
      description: "You may be attracting people you cannot help well.",
      whenToSuspect: ["wrong audience", "wrong people", "not my people", "bad fit leads"],
      preferredPatterns: ["narrow", "serve_different_audience", "test"],
    },
    {
      id: "too_broad",
      label: "Too broad",
      description: "The market definition may include too many incompatible needs.",
      whenToSuspect: ["too broad", "everyone", "anyone who", "all small businesses"],
      preferredPatterns: ["narrow", "reposition", "test"],
    },
    {
      id: "positioning",
      label: "Wrong positioning",
      description: "The people may be right; the story may be wrong.",
      whenToSuspect: ["positioning", "they don’t get it", "look the same", "message"],
      preferredPatterns: ["reposition", "improve", "test"],
    },
    {
      id: "customer_language",
      label: "Customer language",
      description: "You may be using internal words instead of theirs.",
      whenToSuspect: ["language", "jargon", "they say", "words they use"],
      preferredPatterns: ["improve", "reposition", "test"],
    },
    {
      id: "segmentation",
      label: "Segmentation / ICP",
      description: "Priority segments may need sequencing, not simultaneous pursuit.",
      whenToSuspect: ["segment", "icp", "ideal client", "priority customer"],
      preferredPatterns: ["narrow", "protect_current_base", "test"],
    },
    {
      id: "journey_retention",
      label: "Journey / retention",
      description: "The strategic issue may be after the first yes.",
      whenToSuspect: ["journey", "onboarding", "retention", "after they buy"],
      preferredPatterns: ["improve", "protect_current_base", "stabilize"],
    },
  ],
  guidingPrinciples: [
    "Who you do not serve is part of market strategy.",
    "Customer language is evidence, not decoration.",
    "Do not confuse a marketing task with a market decision.",
  ],
  version: 2,
};
