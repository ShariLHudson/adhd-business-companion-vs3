/**
 * Member-facing navigation copy — warm, never a giant menu.
 */

import type {
  EstateNavigationChoice,
  EstateNavigationDecision,
} from "./types";
import type { LocationOption } from "@/lib/estateKnowledgeBase/types";
import type { ValidatedNavigationTarget } from "./types";

export function toNavigationChoice(
  target: ValidatedNavigationTarget,
): EstateNavigationChoice {
  return {
    locationId: target.locationId,
    placeId: target.placeId,
    officialDisplayName: target.option.officialDisplayName,
    memberFacingHint: target.option.memberFacingHint,
    primaryAssetFileName: target.option.primaryAssetFileName,
    route: target.option.route,
    buttonText: "Take Me There",
  };
}

export function choicesFromOptions(
  options: LocationOption[],
  placeIdsByLocationId: Map<string, string>,
): EstateNavigationChoice[] {
  return options.map((option) => ({
    locationId: option.locationId,
    placeId: placeIdsByLocationId.get(option.locationId) ?? option.locationId,
    officialDisplayName: option.officialDisplayName,
    memberFacingHint: option.memberFacingHint,
    primaryAssetFileName: option.primaryAssetFileName,
    route: option.route,
    buttonText: "Take Me There" as const,
  }));
}

export function formatNavigationChoicesPrompt(
  intro: string,
  choices: readonly EstateNavigationChoice[],
): string {
  const lines = choices.map(
    (choice) =>
      `${choice.officialDisplayName}\n${choice.memberFacingHint}`,
  );

  return [
    intro,
    "",
    ...lines,
    "",
    "Which would you like to visit?",
  ].join("\n");
}

export function formatDirectNavigationLine(
  displayName: string,
  hint?: string,
): string {
  if (hint) {
    return `I'll take you to ${displayName} — ${hint}.`;
  }
  return `I'll take you to ${displayName}.`;
}

export function formatNavigationDecision(
  decision: EstateNavigationDecision,
): string | null {
  if (decision.memberFacingPrompt) return decision.memberFacingPrompt;
  if (decision.clarificationQuestion) return decision.clarificationQuestion;

  if (decision.kind === "navigate_direct" && decision.choices?.[0]) {
    const choice = decision.choices[0];
    return formatDirectNavigationLine(
      choice.officialDisplayName,
      choice.memberFacingHint,
    );
  }

  if (decision.kind === "offer_choices" && decision.choices?.length) {
    const intro =
      decision.experienceGroup != null
        ? `I have a few ${decision.experienceGroup.toLowerCase()} places you might enjoy:`
        : "I found a few places you might enjoy:";
    return formatNavigationChoicesPrompt(intro, decision.choices);
  }

  return null;
}
