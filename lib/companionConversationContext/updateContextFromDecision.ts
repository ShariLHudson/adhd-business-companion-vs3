/**
 * Update companion context after a frictionless decision ships.
 */

import { messageAsksUserConfirmation } from "@/lib/conversationConfirmationGate";
import { getEstateLocationById } from "@/lib/estateKnowledgeBase/estateLocations";
import {
  detectCompanionActiveSession,
} from "@/lib/companionIntelligence/activeSession";
import type { FrictionlessActionDecision } from "@/lib/frictionlessActionLayer";
import type { EstateIntelligenceRuntimeResult } from "@/lib/estateIntelligenceRuntime/types";
import type { ConversationGoal } from "@/lib/conversationStabilization/goalClassifier";
import type { ArbitrationResult } from "@/lib/conversationStabilization/arbitration";
import { PENDING_ACTION_TURN_LIMIT } from "./types";
import { writeCompanionConversationState, readCompanionConversationState } from "./store";
import type { CompanionConversationState } from "./types";

export type UpdateCompanionContextInput = {
  userText: string;
  lastAssistantText?: string | null;
  currentTurn: number;
  decision: FrictionlessActionDecision;
  goal?: ConversationGoal | null;
  arbitration?: ArbitrationResult | null;
};

function patchFromNavigation(
  decision: FrictionlessActionDecision,
): Partial<CompanionConversationState> | null {
  const nav = decision.immediateEstatePlaceNavigate;
  if (!nav?.placeId) return null;

  const location =
    getEstateLocationById(nav.placeId) ??
    getEstateLocationById(nav.placeId.replace(/-outside$/, "-outside"));

  const locationId = location?.locationId ?? nav.placeId;
  const display =
    location?.officialDisplayName?.replace(/™/g, "") ?? nav.placeId;

  return {
    currentLocation: {
      locationId,
      placeId: nav.placeId,
      displayName: display,
    },
    currentArea: locationId,
    pendingAction: null,
  };
}

function patchFromKbAnswer(
  decision: FrictionlessActionDecision,
  currentTurn: number,
): Partial<CompanionConversationState> | null {
  const reply = decision.localReply?.trim();
  if (!reply) return null;

  const hint = decision.responseHint ?? "";
  if (decision.category === "estate_concierge" || hint.includes("object")) {
    const kinsey = /\bkinsey\b/i.test(reply);
    const chest = /\bdiscovery chest\b/i.test(reply);
    if (kinsey) {
      return {
        lastDiscussedEntity: {
          kind: "object",
          id: "kinsey",
          displayName: "Kinsey",
          answeredAtTurn: currentTurn,
        },
        lastKnowledgeAnswerType: "factual_kb",
        currentTopic: "kinsey",
      };
    }
    if (chest) {
      return {
        lastDiscussedEntity: {
          kind: "object",
          id: "discovery-chest",
          displayName: "Discovery Chest",
          answeredAtTurn: currentTurn,
        },
        lastKnowledgeAnswerType: "factual_kb",
        currentTopic: "discovery-chest",
      };
    }
  }

  if (hint.includes("room") || hint.includes("LOCATION")) {
    const locMatch = hint.match(/location[:\s]+([\w-]+)/i);
    const locationId = locMatch?.[1];
    if (locationId) {
      const loc = getEstateLocationById(locationId);
      return {
        lastDiscussedEntity: {
          kind: "room",
          id: locationId,
          displayName: loc?.officialDisplayName ?? locationId,
          answeredAtTurn: currentTurn,
        },
        lastKnowledgeAnswerType: "factual_kb",
      };
    }
  }

  return null;
}

function patchFromNavigationOffer(
  reply: string,
  currentTurn: number,
  state: CompanionConversationState,
): Partial<CompanionConversationState> | null {
  if (!messageAsksUserConfirmation(reply)) return null;
  if (!/\b(?:visit|go there|take you|fireplace|telescope)\b/i.test(reply)) {
    return null;
  }

  const locationId = state.currentLocation?.locationId;
  return {
    lastAssistantQuestion: reply,
    pendingAction: state.currentLocation
      ? {
          type: "estate_navigate",
          placeId: state.currentLocation.placeId,
          locationId: state.currentLocation.locationId,
          priorAssistantQuestion: reply,
          originalReason: "navigation_offer",
          offeredAtTurn: currentTurn,
          expiresAtTurn: currentTurn + PENDING_ACTION_TURN_LIMIT,
        }
      : null,
    lastKnowledgeAnswerType: "navigation_offer",
  };
}

export function updateCompanionContextFromDecision(
  input: UpdateCompanionContextInput,
): CompanionConversationState {
  const state = readCompanionConversationState();
  const patch: Partial<CompanionConversationState> = {
    updatedAtTurn: input.currentTurn,
    activeSession: detectCompanionActiveSession({
      userText: input.userText,
      lastAssistantText: input.lastAssistantText,
      activeWorkflow: undefined,
      workspace: undefined,
    }),
    lastUserGoal: input.goal ?? state.lastUserGoal,
    emotionalPivotDetected: false,
  };

  const navPatch = patchFromNavigation(input.decision);
  if (navPatch) Object.assign(patch, navPatch);

  const kbPatch = patchFromKbAnswer(input.decision, input.currentTurn);
  if (kbPatch) Object.assign(patch, kbPatch);

  const reply = input.decision.localReply?.trim();
  if (reply) {
    const offerPatch = patchFromNavigationOffer(
      reply,
      input.currentTurn,
      { ...state, ...patch },
    );
    if (offerPatch) Object.assign(patch, offerPatch);
  }

  return writeCompanionConversationState(patch);
}

export function updateCompanionContextFromEstateRuntime(
  runtime: EstateIntelligenceRuntimeResult,
  userText: string,
  currentTurn: number,
): void {
  const patch: Partial<CompanionConversationState> = {
    updatedAtTurn: currentTurn,
  };

  if (runtime.immediateEstatePlaceNavigate?.placeId) {
    const placeId = runtime.immediateEstatePlaceNavigate.placeId;
    const loc = getEstateLocationById(placeId);
    patch.currentLocation = {
      locationId: loc?.locationId ?? placeId,
      placeId,
      displayName: loc?.officialDisplayName?.replace(/™/g, "") ?? placeId,
    };
    patch.pendingAction = null;
  }

  if (runtime.capability === "object" && runtime.localReply) {
    if (/\bkinsey\b/i.test(runtime.localReply)) {
      patch.lastDiscussedEntity = {
        kind: "object",
        id: "kinsey",
        displayName: "Kinsey",
        answeredAtTurn: currentTurn,
      };
      patch.lastKnowledgeAnswerType = "factual_kb";
      patch.currentTopic = "kinsey";
    } else if (/\bdiscovery chest\b/i.test(runtime.localReply)) {
      patch.lastDiscussedEntity = {
        kind: "object",
        id: "discovery-chest",
        displayName: "Discovery Chest",
        answeredAtTurn: currentTurn,
      };
      patch.lastKnowledgeAnswerType = "factual_kb";
      patch.currentTopic = "discovery-chest";
    }
  }

  if (
    runtime.localReply &&
    messageAsksUserConfirmation(runtime.localReply) &&
    patch.currentLocation
  ) {
    patch.lastAssistantQuestion = runtime.localReply;
    patch.pendingAction = {
      type: "estate_navigate",
      placeId: patch.currentLocation.placeId,
      locationId: patch.currentLocation.locationId,
      priorAssistantQuestion: runtime.localReply,
      originalReason: "kb_navigation_offer",
      offeredAtTurn: currentTurn,
      expiresAtTurn: currentTurn + PENDING_ACTION_TURN_LIMIT,
    };
    patch.lastKnowledgeAnswerType = "navigation_offer";
  }

  writeCompanionConversationState(patch);
}
