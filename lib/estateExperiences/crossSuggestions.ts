/**
 * Cross-place suggestions — companion connections, not feature menus.
 */

import type { EstateCrossSuggestion } from "./types";
import { ESTATE_CROSS_SUGGESTION_TONES } from "./navigationPhilosophy";

export const ESTATE_CROSS_SUGGESTIONS_BY_SPACE: Record<
  string,
  readonly EstateCrossSuggestion[]
> = {
  "art-studio": [
    {
      tone: "while_youre_here",
      label: "Visit the Gallery",
      targetSpaceId: "portfolio",
      experienceId: "grow",
    },
    {
      tone: "while_youre_here",
      label: "Create an image",
      targetSpaceId: "creative-studio",
      experienceId: "create",
    },
    {
      tone: "while_youre_here",
      label: "Build a vision board",
      targetSpaceId: "creative-studio",
      experienceId: "create",
    },
    {
      tone: "while_youre_here",
      label: "Browse your artwork",
      targetSpaceId: "portfolio",
      experienceId: "grow",
    },
  ],
  greenhouse: [
    {
      tone: "you_might_also_enjoy",
      label: "Brainstorm in Create",
      targetSpaceId: "creative-studio",
      experienceId: "create",
    },
    {
      tone: "you_might_also_enjoy",
      label: "Take a walk through the Gardens",
      targetSpaceId: "garden-path",
      experienceId: "explore",
    },
    {
      tone: "you_might_also_enjoy",
      label: "Visit the Butterfly Conservatory",
      targetSpaceId: "conservatory",
      experienceId: "play",
    },
  ],
};

export function formatCrossSuggestionBlock(
  spaceId: string,
  max = 3,
): string | null {
  const items = ESTATE_CROSS_SUGGESTIONS_BY_SPACE[spaceId];
  if (!items?.length) return null;
  const tone = ESTATE_CROSS_SUGGESTION_TONES[items[0]!.tone];
  const lines = items.slice(0, max).map((item) => item.label);
  return `${tone}\n${lines.map((l) => `· ${l}`).join("\n")}`;
}

/** After completing work — connect dots without forcing (Spec 111 permission). */
export function formatCompletionBridgeSuggestion(input: {
  fromExperienceId: "create";
  artifactKind: "email" | "newsletter" | "sop" | string;
  linkedProjectName?: string;
}): string | null {
  if (
    input.fromExperienceId === "create" &&
    /\b(?:email|newsletter)\b/i.test(input.artifactKind) &&
    input.linkedProjectName
  ) {
    return `Since this ${input.artifactKind} is part of your ${input.linkedProjectName} project, would you like to move over to Momentum and add it to your launch plan?`;
  }
  return null;
}

export function formatRestoreToMomentumBridge(): string {
  return "You've organized your thoughts. Would you like to head to Momentum and decide which one to tackle first?";
}
