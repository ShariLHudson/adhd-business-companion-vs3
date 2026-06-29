/**
 * Response depth, estate routing, streaming behavior.
 */

import type { EstateRoomId } from "@/lib/sparkResponseIntelligence/types";

import type {
  ConversationIntent,
  EmotionalState,
  EstateRoutingSuggestion,
  ResponseDepth,
  StreamingBehavior,
} from "./types";

export function selectResponseDepth(
  intent: ConversationIntent,
  emotional: EmotionalState,
  messageLength: number,
): ResponseDepth {
  if (emotional === "overwhelmed") return "empathy_first";
  if (intent === "simple_question" && messageLength < 60) return "simple";
  if (intent === "creative") return "collaborative_create";
  if (intent === "research") return "research_scoped";
  if (intent === "planning") return "structured";
  if (intent === "business_guidance" && messageLength > 100) return "executive";
  if (intent === "execution") return "simple";
  return "moderate";
}

export function suggestEstate(
  intent: ConversationIntent,
): EstateRoutingSuggestion | undefined {
  const invites: Record<string, { room: EstateRoomId; copy: string }> = {
    creative: {
      room: "creative-studio",
      copy: "Would you like me to develop this further in the Creative Studio?",
    },
    planning: {
      room: "strategy-room",
      copy: "This would be a great opportunity to explore in the Strategy Room.",
    },
    research: {
      room: "research-lab",
      copy: "We could dig into this properly in the Research Lab — want to?",
    },
    emotional_support: {
      room: "white-gazebo",
      copy: "We can take this slowly in the White Gazebo if that sounds better.",
    },
  };

  const match = invites[intent];
  if (!match) return undefined;

  return {
    room: match.room,
    inviteCopy: match.copy,
    optional: true,
  };
}

export function streamingForDepth(depth: ResponseDepth): StreamingBehavior {
  switch (depth) {
    case "executive":
    case "structured":
    case "research_scoped":
      return {
        enabled: true,
        immediateAck: true,
        streamTokens: true,
        reason: "Deep or structured response — never appear frozen",
      };
    case "empathy_first":
      return {
        enabled: false,
        immediateAck: true,
        streamTokens: false,
        reason: "Brief empathy first — no stream needed",
      };
  default:
      return {
        enabled: false,
        immediateAck: false,
        streamTokens: false,
      };
  }
}

export function responseGuidance(
  depth: ResponseDepth,
  intent: ConversationIntent,
): string {
  const rules: Record<ResponseDepth, string> = {
    simple: "Answer directly in one to three sentences. One next step if helpful.",
    moderate: "One recommendation, brief rationale, one next step.",
    structured: "Sequence steps clearly without overwhelming. One priority at a time.",
    executive: "Lead with recommendation and tradeoffs. Stay focused.",
    empathy_first:
      "Acknowledge first. One gentle question OR one tiny next step — not both unless essential.",
    collaborative_create: "Help create. Minimal lecture. Collaborate.",
    research_scoped: "Scope the answer. Cite uncertainty. Offer depth only if requested.",
  };

  if (intent === "emotional_support") {
    return rules.empathy_first;
  }
  return rules[depth];
}
