/**
 * Estate workspace offer continuation — register and recover Creative Studio™ (etc.)
 * invitations so "yes" opens the room instead of a dead-end fallback.
 */

import type { AppSection } from "@/lib/companionUi";
import { detectRegistryArtifact } from "@/lib/artifactRegistry";
import {
  frictionlessPendingFromWorkspaceOffer,
  type FrictionlessPendingAction,
} from "@/lib/frictionlessActionLayer";
import { estateRegistryEntryById } from "@/lib/estateIntelligence/estateRegistry";
import type { WorkspaceOffer } from "@/lib/workspaceMode";
import {
  inferEstateFollowUpQuestion,
  isEstateTransitionOfferMessage,
  registerEstatePendingTransition,
} from "./estatePendingTransition";
import { estateEntryIdForSection, estateSectionForEntryId } from "./estateSectionMap";

function inferSectionFromAssistantOffer(assistantText: string): AppSection | null {
  const t = assistantText.toLowerCase();
  if (/\bcreative studio\b/.test(t)) return "content-generator";
  if (/\bmomentum institute\b/.test(t)) return "momentum-institute";
  if (/\bobservatory\b/.test(t)) return "grow-observatory";
  if (/\bdecision compass\b/.test(t)) return "decision-compass";
  if (/\bpeaceful places?\b/.test(t)) return "focus-audio";
  if (/\bclear my mind\b/.test(t)) return "brain-dump";
  if (/\bmomentum builder\b/.test(t)) return "momentum-builder";
  if (/\bjournal\b/.test(t)) return "growth-journal";
  return null;
}

export function buildWorkspaceOfferForEstateSection(
  section: AppSection,
  line: string,
): WorkspaceOffer {
  const entryId = estateEntryIdForSection(section);
  const name = entryId
    ? (estateRegistryEntryById(entryId)?.name ?? entryId)
    : section;
  return {
    section,
    buttonLabel: `Open ${name}`,
    line,
  };
}

export function buildEstateOfferFrictionlessPending(input: {
  section: AppSection;
  priorUserText: string;
  assistantText: string;
  offeredAtTurn: number;
}): FrictionlessPendingAction {
  const offer = buildWorkspaceOfferForEstateSection(input.section, input.assistantText);
  return frictionlessPendingFromWorkspaceOffer(offer, input.offeredAtTurn, {
    userText: input.priorUserText,
    artifactKind: detectRegistryArtifact(input.priorUserText),
  });
}

/** After assistant invites to an Estate room — persist pending so yes/sure works. */
export function registerEstateWorkspaceOfferFromAssistant(input: {
  assistantText: string;
  priorUserText: string;
  offeredAtTurn: number;
}): FrictionlessPendingAction | null {
  const assistant = input.assistantText.trim();
  const prior = input.priorUserText.trim();
  if (!assistant || !prior) return null;
  if (!isEstateTransitionOfferMessage(assistant)) return null;

  const section = inferSectionFromAssistantOffer(assistant);
  if (!section) return null;

  const entryId = estateEntryIdForSection(section) ?? section;
  registerEstatePendingTransition({
    destinationSection: section,
    destinationEntryId: entryId,
    originalUserIntent: prior,
    offeredAtTurn: input.offeredAtTurn,
    invitationLine: assistant,
    followUpQuestion: inferEstateFollowUpQuestion(entryId, prior),
  });

  return buildEstateOfferFrictionlessPending({
    section,
    priorUserText: prior,
    assistantText: assistant,
    offeredAtTurn: input.offeredAtTurn,
  });
}

/** Recover pending when member says yes but localStorage / ref was lost. */
export function recoverEstateWorkspaceOfferFromChat(input: {
  lastAssistantText: string;
  priorUserText?: string;
  currentTurn: number;
}): FrictionlessPendingAction | null {
  return registerEstateWorkspaceOfferFromAssistant({
    assistantText: input.lastAssistantText,
    priorUserText: input.priorUserText ?? "",
    offeredAtTurn: Math.max(1, input.currentTurn - 1),
  });
}

export function estateSectionForAssistantOffer(
  assistantText: string,
): AppSection | null {
  return inferSectionFromAssistantOffer(assistantText);
}

export function estateEntryIdForAssistantOffer(
  assistantText: string,
): string | undefined {
  const section = inferSectionFromAssistantOffer(assistantText);
  if (!section) return undefined;
  return estateEntryIdForSection(section) ?? estateSectionForEntryId(section);
}
