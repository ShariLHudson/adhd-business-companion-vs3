/**
 * Estate Router™ — primary destination + invitation copy.
 *
 * **Phase C — adapter:** Intent invitations must not override `goToPlace` direct navigation.
 *
 * @see lib/estate/goToPlace.ts
 */

import type { AppSection } from "@/lib/companionUi";
import { estateCreativeStudioInvite } from "@/lib/estate/estateTransitionInviteCopy";
import type {
  EstateMatchResult,
  EstateRegistryEntry,
  EstateRouteResult,
} from "./types";

const INVITATION_TEMPLATES: Partial<Record<string, string>> = {
  "peaceful-places":
    "I know a peaceful place that might help. Would you like to go there with me?",
  "momentum-builder":
    "The Momentum Builder™ can help us create a simple path forward. Shall we head over?",
  "clear-my-mind":
    "That sounds worth capturing while it's fresh. Would you like to step into Clear My Mind™ together?",
  "decision-compass":
    "The Decision Compass™ was designed for situations like this. Would you like me to guide you there?",
  "observatory":
    "The Observatory™ is where we gather information and evaluate ideas. Shall we head there?",
  "library":
    "The Library™ is quiet when you want to read or think. Would you like to go there together?",
  "momentum-institute":
    "The Momentum Institute™ has just the drawer for that. Would you like to explore it together?",
  "creative-studio":
    `I'd love to help with that. ${estateCreativeStudioInvite()}`,
  "growth-journal":
    "That sounds worth capturing while it's fresh. Would you like to step into your Journal™ together?",
  "coffee-house":
    "The Coffee House™ is warm when you need a breather. Would you like a quiet pause there?",
  "soundscapes-focus-audio":
    "Peaceful Places™ has soundscapes made for exactly this — rain, hearth, morning light, and more. Would you like to listen there with me?",
};

export function buildEstateInvitation(entry: EstateRegistryEntry): string {
  return (
    INVITATION_TEMPLATES[entry.id] ??
    `${entry.memberDescription} Would you like to step into ${entry.name} together?`
  );
}

export function routeEstateMatch(
  match: EstateMatchResult,
): EstateRouteResult {
  const suppressGenericDefinition =
    match.confidence === "high" &&
    (match.entry.id === "peaceful-places" ||
      /\bwhat(?:'s| is)\b/i.test(match.reasons.join(" ")) ||
      match.reasons.some((r) => r.includes("definitional")));

  return {
    primaryEntry: match.entry,
    invitation: buildEstateInvitation(match.entry),
    primarySection: match.entry.primarySection ?? null,
    suppressGenericDefinition,
  };
}

export function memberAlreadyInEstateDestination(
  activeSection: AppSection | null | undefined,
  workspacePanel: string | null | undefined,
  entry: EstateRegistryEntry,
): boolean {
  const sections = new Set<AppSection>();
  if (entry.primarySection) sections.add(entry.primarySection);
  for (const s of entry.sections ?? []) sections.add(s);

  if (activeSection && sections.has(activeSection)) return true;
  if (workspacePanel && sections.has(workspacePanel as AppSection)) return true;
  return false;
}

export type EstateRouterMode =
  | "guide_to_room"
  | "conversation_first"
  | "answer_directly"
  | "journey_latent";

export type EstateRouterModeDecision = {
  mode: EstateRouterMode;
};

export function decideEstateRouterMode(
  evaluation: import("./types").EstateIntelligenceEvaluation,
): EstateRouterModeDecision {
  if (!evaluation.route || !evaluation.bestMatch) {
    return { mode: "conversation_first" };
  }

  if (evaluation.bestMatch.confidence === "high") {
    const hasLatent =
      (evaluation.route.primaryEntry.relatedEntryIds?.length ?? 0) > 0;
    return { mode: hasLatent ? "journey_latent" : "guide_to_room" };
  }

  if (evaluation.bestMatch.confidence === "medium") {
    return { mode: "conversation_first" };
  }

  return { mode: "answer_directly" };
}
