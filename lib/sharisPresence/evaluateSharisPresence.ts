import { resolvePlace } from "@/lib/companionConstitution";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import { EVIDENCE_BY_STATE, STATE_HOST_LINES } from "./evidenceCatalog";
import {
  communicationAnchorPrimaryForState,
  conversationPrimaryForState,
  evidenceAllowedForState,
  shariImageAllowedForState,
} from "./rules";
import {
  EXPERIENCE_TO_PLACE,
  presenceStateForPlace,
  SECTION_TO_PLACE_FOR_PRESENCE,
} from "./roomAssignments";
import type { SharisPresenceInput, SharisPresenceVerdict } from "./types";
import { SHARIS_PRESENCE_GOAL, SHARIS_PRESENCE_PRINCIPLE } from "./types";

function resolvePlaceId(input: SharisPresenceInput): CompanionPlaceId {
  if (input.placeId) return input.placeId;
  if (input.section && SECTION_TO_PLACE_FOR_PRESENCE[input.section]) {
    return SECTION_TO_PLACE_FOR_PRESENCE[input.section]!;
  }
  if (input.workspaceId) return resolvePlace({ workspaceId: input.workspaceId });
  if (input.experienceId && EXPERIENCE_TO_PLACE[input.experienceId]) {
    return EXPERIENCE_TO_PLACE[input.experienceId]!;
  }
  return "living-room";
}

function resolveState(
  placeId: CompanionPlaceId,
  input: SharisPresenceInput,
): SharisPresenceVerdict["state"] {
  if (input.writingActive && placeId === "window-seat") {
    return "beside-you";
  }
  if (input.voiceConversation) return "host";
  return presenceStateForPlace(placeId);
}

/**
 * Shari's Presence — constitutional presence before any room renders.
 */
export function evaluateSharisPresence(
  input: SharisPresenceInput = {},
): SharisPresenceVerdict {
  const placeId = resolvePlaceId(input);
  const state = resolveState(placeId, input);

  const showShariImage =
    shariImageAllowedForState(state) && !input.writingActive;
  const showEvidence =
    evidenceAllowedForState(state) &&
    !input.writingActive &&
    state !== "beside-you";
  const evidenceObjects = showEvidence ? EVIDENCE_BY_STATE[state] : [];

  return {
    state,
    principle: SHARIS_PRESENCE_PRINCIPLE,
    placeId,
    showShariImage,
    showEvidenceObjects: showEvidence,
    evidenceObjects,
    communicationAnchorPrimary: communicationAnchorPrimaryForState(state),
    conversationPrimary: conversationPrimaryForState(state),
    guestFeelsWatched: false,
    guestFeelsWelcomed: true,
    hostLine: STATE_HOST_LINES[state],
    dataAttributes: {
      "data-sharis-presence": state,
      "data-sharis-presence-place": placeId,
      "data-sharis-presence-goal": SHARIS_PRESENCE_GOAL,
    },
  };
}

export function sharisPresenceHintForChat(verdict: SharisPresenceVerdict): string {
  return [
    "SHARI'S PRESENCE:",
    verdict.principle,
    `State: ${verdict.state} (${verdict.placeId}).`,
    verdict.hostLine,
    verdict.showShariImage
      ? "Shari may appear visually — Host."
      : "No Shari portrait — presence felt through room and anchor.",
    "Guest never feels watched. Always feels welcomed.",
  ].join("\n");
}

/** Apply constitutional overrides to Companion Presence Engine output */
export function applySharisPresenceToEngine<T extends {
  showShariImage: boolean;
  showEvidenceObjects: boolean;
  evidenceObjects: readonly string[];
  conversationPrimary: boolean;
}>(
  engineResult: T,
  input: SharisPresenceInput,
): T & { sharisPresence: SharisPresenceVerdict } {
  const sharisPresence = evaluateSharisPresence(input);
  return {
    ...engineResult,
    showShariImage: sharisPresence.showShariImage,
    showEvidenceObjects: sharisPresence.showEvidenceObjects,
    evidenceObjects: sharisPresence.showEvidenceObjects
      ? sharisPresence.evidenceObjects
      : engineResult.evidenceObjects,
    conversationPrimary: sharisPresence.conversationPrimary,
    sharisPresence,
  };
}
