/**
 * Estate Intelligence™ — mandatory LLM hint (estate-first mandate).
 * Serves The Conversation Front Door™ — talk is enough; Estate invites deepen.
 */

import { CONVERSATION_FRONT_DOOR_PRINCIPLE } from "@/lib/sparkEstateRooms/types";
import { estateRoomKnowledgeHintForChat } from "@/lib/estateKnowledge";
import { shariCompanionHintForChat } from "@/lib/conversation/shariCompanionEngine";
import type { EstateIntelligenceEvaluation } from "./types";

const HIGH_CONFIDENCE_HEADER =
  "ESTATE INTELLIGENCE (mandatory — Estate is first source of truth):";

export type EstateIntelligenceHintOptions = {
  userText?: string | null;
  memberDislikesConflict?: boolean;
};

export function estateIntelligenceHintForChat(
  evaluation: EstateIntelligenceEvaluation | null | undefined,
  options?: EstateIntelligenceHintOptions,
): string | null {
  const parts: string[] = [];

  if (options?.userText?.trim()) {
    const shariHint = shariCompanionHintForChat({
      userText: options.userText,
      memberDislikesConflict: options.memberDislikesConflict,
    });
    if (shariHint) parts.push(shariHint);
  }

  if (!evaluation?.route || !evaluation.bestMatch) {
    return parts.length > 0 ? parts.join("\n\n") : null;
  }
  if (evaluation.suppressed) {
    return parts.length > 0 ? parts.join("\n\n") : null;
  }

  const { route, bestMatch } = evaluation;
  const entry = route.primaryEntry;

  const lines = [
    HIGH_CONFIDENCE_HEADER,
    `Conversation Front Door: ${CONVERSATION_FRONT_DOOR_PRINCIPLE}`,
    `Matched estate capability: ${entry.name} (${bestMatch.confidence} confidence).`,
    `Internal purpose: ${entry.purpose}`,
    "The Estate already has something designed for this — do NOT answer with a generic encyclopedia or dictionary definition first.",
    "Member should not need to hunt the Estate — lead with invitation when depth helps.",
  ];

  if (route.suppressGenericDefinition) {
    lines.push(
      'FORBIDDEN opening patterns: "A peaceful place is…", "Momentum is…", "A decision compass is…", or any textbook definition of the matched capability.',
      "Lead with the Estate invitation — introduce the place Spark already built.",
    );
  }

  lines.push(
    `Suggested invitation (adapt naturally — one question, Spec 108 hospitality):`,
    route.invitation,
    "FORBIDDEN: numbered list of rooms, 'here are a few options', or 'which one feels right' menus.",
    "Offer ONE place at most — conversation first. If unsure what they need, ask what's on their mind.",
    route.primarySection
      ? `If they accept, the app can open section: ${route.primarySection}.`
      : "No direct section yet — invitation and conversation only.",
    "Offer — never command. Member chooses. Never say 'Open [feature name]'.",
    "Success: they feel Spark knows where their need belongs — not that they learned a definition.",
  );

  const roomKnowledge = estateRoomKnowledgeHintForChat(entry.id);
  if (roomKnowledge) {
    lines.push("", roomKnowledge);
  }

  parts.push(lines.join("\n"));
  return parts.join("\n\n");
}
