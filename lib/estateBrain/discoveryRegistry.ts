/**
 * Discovery question registry — brief, natural, never form-like.
 */

import type { DiscoveryQuestion, DiscoveryTopic } from "./discoveryTypes";

export const DISCOVERY_INTROS: Partial<Record<DiscoveryTopic, string>> = {
  create_sop:
    "I'd be happy to help.\n\nLet me understand what you're trying to build.",
  business_growth:
    "I'd love to help you grow.\n\nWhat feels most important right now?",
  create_general:
    "I'd love to help with that.\n\nBefore we jump in, let me make sure I understand what you're going for.",
};

export const DISCOVERY_QUESTIONS: Record<
  DiscoveryTopic,
  readonly DiscoveryQuestion[]
> = {
  create_sop: [
    {
      id: "sop-audience-type",
      slot: "context",
      prompt:
        "Is this SOP for your own business, or for a client?",
      signalPatterns: [
        /\b(?:my (?:own )?business|our (?:team|company)|for a client|client'?s)\b/i,
      ],
    },
    {
      id: "sop-starting-point",
      slot: "obstacle",
      prompt:
        "Are you starting from scratch, or do you already have a process written down somewhere?",
      signalPatterns: [
        /\b(?:from scratch|starting fresh|already have|written down|existing process|documented)\b/i,
      ],
    },
    {
      id: "sop-audience-size",
      slot: "outcome",
      prompt:
        "Will one person use this, or will multiple people need to follow it?",
      signalPatterns: [
        /\b(?:just me|one person|solo|team|multiple|va|assistant|staff)\b/i,
      ],
    },
  ],
  focus: [
    {
      id: "focus-obstacle",
      slot: "obstacle",
      prompt: "What do you think is making it hardest to focus today?",
      signalPatterns: [
        /\b(?:too many thoughts|scattered|can'?t get started|interruption|motivation|anxious|tired|overwhelm)\b/i,
      ],
    },
  ],
  business_growth: [
    {
      id: "growth-priority",
      slot: "goal",
      prompt:
        "What feels most important right now — finding clients, marketing, products, pricing, systems, productivity, or organization?",
      signalPatterns: [
        /\b(?:client|marketing|product|pricing|system|productivity|organiz)/i,
      ],
    },
    {
      id: "growth-outcome",
      slot: "outcome",
      prompt: "What would success look like in the next few weeks?",
      signalPatterns: [
        /\b(?:more client|launch|revenue|consistent|first sale|pipeline|plan)\b/i,
      ],
    },
  ],
  research: [
    {
      id: "research-depth",
      slot: "outcome",
      prompt:
        "What kind of research would help most — a quick comparison, current landscape, a deeper report, or ongoing monitoring?",
      signalPatterns: [
        /\b(?:quick|comparison|current|landscape|deep|report|monitor|ongoing)\b/i,
      ],
    },
  ],
  // Universal Reasoning Journey — Create Journey Integration (2026-08-06):
  // what → why → who → current situation → constraints. create-goal is
  // prefilled from the member's typed request when present; it is asked only
  // on the guided path where nothing has been typed yet. "Missing
  // information" (the sixth dimension) is not a question — it is Spark's own
  // observation, surfaced honestly at confirm when a question was skipped
  // (see missingInformationNoteFor in entranceUnderstanding.ts).
  create_general: [
    {
      id: "create-goal",
      slot: "goal",
      prompt: "What are you working on — or hoping to make happen?",
    },
    {
      id: "create-outcome",
      slot: "outcome",
      prompt:
        "What would you like this to accomplish? When it's done and working, what should be different?",
      signalPatterns: [
        /\b(?:so that|so my|so i can|to help (?:me|my|them|people)|the goal is|i hope|should feel|want (?:them|people|readers|clients|members) to)\b/i,
      ],
    },
    {
      id: "create-why",
      slot: "obstacle",
      prompt:
        "Why does this matter right now — what's happening that brought it up today?",
      signalPatterns: [/\b(?:because|since i|now that|why)\b/i],
    },
    {
      id: "create-audience",
      slot: "context",
      prompt: "Who is this for?",
      signalPatterns: [
        /\b(?:for (?:my|our|new|existing) (?:clients?|customers?|team|va|assistant|audience|subscribers?|students?|members|readers)|for myself|just for me)\b/i,
      ],
    },
    {
      id: "create-existing",
      slot: "context",
      prompt:
        "What's already in place — any notes, drafts, or past versions we can build from, or is this starting fresh?",
      signalPatterns: [
        /\b(?:from scratch|starting fresh|already have|written down|existing|documented|draft|previous version|notes)\b/i,
      ],
    },
    {
      id: "create-constraints",
      slot: "obstacle",
      prompt:
        "Anything working against us here — a deadline, a budget, limited time or energy, something that has to stay the same?",
      signalPatterns: [
        /\b(?:deadline|budget|no time|limited time|energy|can'?t change|has to stay|no budget|by (?:friday|monday|tomorrow|next week))\b/i,
      ],
    },
  ],
};

export function questionsForTopic(
  topic: DiscoveryTopic,
): readonly DiscoveryQuestion[] {
  return DISCOVERY_QUESTIONS[topic];
}
