/**
 * Discovery question registry — brief, natural, never form-like.
 */

import type { DiscoveryQuestion, DiscoveryTopic } from "./discoveryTypes";

export const DISCOVERY_INTROS: Partial<Record<DiscoveryTopic, string>> = {
  create_sop:
    "I'd be happy to help.\n\nLet me understand what you're trying to build.",
  business_growth:
    "I'd love to help you grow.\n\nWhat feels most important right now?",
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
};

export function questionsForTopic(
  topic: DiscoveryTopic,
): readonly DiscoveryQuestion[] {
  return DISCOVERY_QUESTIONS[topic];
}
