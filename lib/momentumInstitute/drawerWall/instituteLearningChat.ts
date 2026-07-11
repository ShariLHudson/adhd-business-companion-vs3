/**
 * Discuss with Shari — Knowledge Card context for companion chat (in-room).
 */

import type {
  InstituteDrawerDefinition,
  KnowledgeCardDefinition,
} from "@/lib/sparkMomentumInstitute/types";

export type InstituteDiscussMode = "understand" | "apply" | "advise" | "make_it_mine";

export function instituteLearningChatHint(
  card: KnowledgeCardDefinition,
  drawer: InstituteDrawerDefinition,
  mode: InstituteDiscussMode,
): string {
  const lines = [
    "MOMENTUM INSTITUTE LEARNING CONTEXT (mandatory):",
    `Member is in the Momentum Institute — drawer **${drawer.title}**, Knowledge Card **${card.title}**.`,
    `Card summary: ${card.summary}`,
    "Do NOT leave the Institute or reset the conversation.",
    "One thoughtful response — coach, do not lecture.",
  ];

  switch (mode) {
    case "understand":
      lines.push(
        "Member asked for help understanding this card. Explain in warm plain language.",
      );
      break;
    case "apply":
      lines.push(
        "Member asked how this applies to THEIR business. Ask one clarifying question if needed, then guide application.",
      );
      break;
    case "advise":
      lines.push(
        "Member asked what you would do. Offer judgment with humility — member owns the decision.",
      );
      break;
    case "make_it_mine":
      lines.push(
        "Make It Mine — ask permission before generating anything.",
        'Start with: "Would you like to make this work for your business?"',
        "Facilitate thinking one question at a time. No automatic content generation.",
      );
      break;
  }

  return lines.join("\n");
}
