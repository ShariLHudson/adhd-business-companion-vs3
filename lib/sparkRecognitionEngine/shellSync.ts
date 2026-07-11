/**
 * Shell ↔ Recognition room-state sync (Sprint 1).
 * Call from navigation / section changes — no UI rebuild.
 */

import {
  isDiscoveryLanguageNotCreate,
  isExplicitCreateRequestForRecognition,
} from "./createGate";
import {
  evaluateRecognitionLifecycleTurn,
} from "./pipeline";
import {
  getActiveFlow,
  getRecognitionRoomState,
  setRequestedDestination,
  syncRecognitionVisualFromShell,
} from "./roomState";
import {
  evaluateRecognitionRouting,
  shouldBlockCreateRouting,
} from "./routing";
import { detectRecognitionTriggers } from "./triggers";
import type { RecognitionRoutingDecision, RecognitionTone } from "./types";
import type { RecognitionLifecycleTurnResult } from "./pipelineTypes";

/**
 * After a successful goToPlace (or equivalent shell navigation).
 */
export function onEstatePlaceArrived(input: {
  placeId: string;
  section?: string | null;
}): void {
  syncRecognitionVisualFromShell({
    placeId: input.placeId,
    section: input.section ?? null,
    conversationRoom: input.placeId,
  });
}

/**
 * When AppSection changes without a full goToPlace (panel / growth nav).
 */
export function onEstateSectionChanged(section: string | null): void {
  syncRecognitionVisualFromShell({
    placeId: null,
    section,
  });
}

/**
 * Member explicitly requested a destination (before arrival).
 */
export function onRecognitionDestinationRequested(
  placeId: string | null,
): void {
  setRequestedDestination(placeId);
}

/**
 * Gate Create / content-generator opens when recognition owns the turn.
 * Discoveries never open Create unless explicitly requested.
 */
export function shouldBlockCreateForRecognitionTurn(
  userText: string,
): boolean {
  const explicitCreate = isExplicitCreateRequestForRecognition(userText);
  const discoveryLanguage = isDiscoveryLanguageNotCreate(userText);
  if (explicitCreate && !discoveryLanguage) return false;

  const trigger = detectRecognitionTriggers(userText);
  const state = getRecognitionRoomState();
  return shouldBlockCreateRouting({
    trigger,
    visualRoom: state.visualRoom,
    activeFlowKind: state.activeRecognitionFlow?.kind ?? null,
    explicitCreateRequested: explicitCreate,
    discoveryLanguage,
  });
}

/**
 * Evaluate recognition routing for a member utterance (preserve-first).
 * Does not navigate — returns a decision for the conversation layer.
 */
export function evaluateRecognitionTurn(input: {
  userText: string;
  tone?: RecognitionTone;
  intentionalRoomEntry?: boolean;
}): RecognitionRoutingDecision | null {
  const trigger = detectRecognitionTriggers(input.userText);
  if (!trigger.matched && !isDiscoveryLanguageNotCreate(input.userText)) {
    return null;
  }
  return evaluateRecognitionRouting({
    trigger: trigger.matched
      ? trigger
      : {
          matched: true,
          phrases: ["discovery_language"],
          suggestsCelebration: false,
          suggestsHallLanguage: false,
          suggestsPreserve: true,
        },
    tone: input.tone,
    intentionalRoomEntry: input.intentionalRoomEntry,
  });
}

/**
 * Full lifecycle evaluation for a conversation turn.
 */
export function evaluateRecognitionLifecycleForTurn(input: {
  userText: string;
  tone?: RecognitionTone;
  intentionalRoomEntry?: boolean;
}): RecognitionLifecycleTurnResult {
  return evaluateRecognitionLifecycleTurn(input);
}

export function hasActiveRecognitionFlow(): boolean {
  return getActiveFlow() != null;
}
