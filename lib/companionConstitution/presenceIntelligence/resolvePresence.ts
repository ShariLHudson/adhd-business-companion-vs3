import { evaluateSharisPresence } from "@/lib/sharisPresence";
import type { ShariPresenceState } from "@/lib/sharisPresence/types";
import type { PresenceInput, PresenceState, PresenceStateId } from "./types";

function mapToConstitutionalState(
  sharisState: ShariPresenceState,
  input: PresenceInput,
): PresenceStateId {
  if (input.celebrating) return "celebrating";
  if (input.voiceConversation) return "speaking";
  if (input.overwhelmed) return "listening";

  switch (sharisState) {
    case "host":
      return "host";
    case "beside-you":
      return "beside-you";
    case "nearby":
      return "nearby";
    case "returning":
      return "returning";
    default:
      return "invisible";
  }
}

/**
 * Presence Intelligence — sole authority for companion visibility.
 * Rooms and renderers receive PresenceState; they never invent presence.
 */
export function resolvePresence(input: PresenceInput = {}): PresenceState {
  const verdict = evaluateSharisPresence({
    placeId: input.placeId,
    workspaceId: input.workspaceId,
    section: input.section,
    writingActive: input.writingActive,
    voiceConversation: input.voiceConversation,
  });

  const state = mapToConstitutionalState(verdict.state, input);

  return {
    state,
    sharisState: verdict.state,
    showShariImage: verdict.showShariImage,
    showEvidenceObjects: verdict.showEvidenceObjects,
    communicationAnchorPrimary: verdict.communicationAnchorPrimary,
    conversationPrimary: verdict.conversationPrimary,
    hostLine: verdict.hostLine,
    dataAttributes: {
      ...verdict.dataAttributes,
      "data-presence-intelligence": "1",
      "data-presence-state": state,
    },
  };
}
