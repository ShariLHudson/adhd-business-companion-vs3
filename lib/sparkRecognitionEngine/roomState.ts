/**
 * Recognition room state — visual_room vs conversation_room.
 * Never claim "already here" unless visual_room matches.
 *
 * Canonical field names (Architecture Library):
 * - visual_room
 * - conversation_room (aka conversation_context)
 * - requested_room (aka requested_destination)
 * - previous_room
 * - active_flow / active_workflow (aka active_recognition_flow)
 *
 * Delegates estate-wide awareness to lib/estate/roomAwareness.
 */

import {
  canClaimAlreadyHere as estateCanClaimAlreadyHere,
  clearActiveWorkflow as clearEstateWorkflow,
  getEstateRoomAwareness,
  resetEstateRoomAwarenessForTests,
  setConversationRoom as setEstateConversationRoom,
  setRequestedRoom as setEstateRequestedRoom,
  setVisualRoom as setEstateVisualRoom,
  startActiveWorkflow as startEstateWorkflow,
  syncEstateRoomAwareness,
} from "@/lib/estate/roomAwareness";
import { recognitionRoomsEquivalent } from "./recognitionIds";
import type {
  ActiveRecognitionFlow,
  RecognitionExperiencePath,
  RecognitionFlowKind,
  RecognitionRoomState,
} from "./types";

export const RECOGNITION_ROOM_STATE_KEY =
  "companion-recognition-room-state-v1" as const;

export const RECOGNITION_ROOM_STATE_UPDATED_EVENT =
  "companion-recognition-room-state-updated" as const;

const EMPTY_STATE: RecognitionRoomState = {
  visualRoom: null,
  conversationContext: null,
  requestedDestination: null,
  previousRoom: null,
  activeRecognitionFlow: null,
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function readLocal(): RecognitionRoomState {
  if (!canUseStorage()) return { ...EMPTY_STATE };
  try {
    const raw = sessionStorage.getItem(RECOGNITION_ROOM_STATE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as Partial<RecognitionRoomState> & {
      visual_room?: string | null;
      conversation_room?: string | null;
      conversation_context?: string | null;
      requested_room?: string | null;
      requested_destination?: string | null;
      previous_room?: string | null;
      active_flow?: ActiveRecognitionFlow | null;
      active_recognition_flow?: ActiveRecognitionFlow | null;
    };
    return {
      visualRoom:
        typeof parsed.visualRoom === "string"
          ? parsed.visualRoom
          : typeof parsed.visual_room === "string"
            ? parsed.visual_room
            : null,
      conversationContext:
        typeof parsed.conversationContext === "string"
          ? parsed.conversationContext
          : typeof parsed.conversation_room === "string"
            ? parsed.conversation_room
            : typeof parsed.conversation_context === "string"
              ? parsed.conversation_context
              : null,
      requestedDestination:
        typeof parsed.requestedDestination === "string"
          ? parsed.requestedDestination
          : typeof parsed.requested_room === "string"
            ? parsed.requested_room
            : typeof parsed.requested_destination === "string"
              ? parsed.requested_destination
              : null,
      previousRoom:
        typeof parsed.previousRoom === "string"
          ? parsed.previousRoom
          : typeof parsed.previous_room === "string"
            ? parsed.previous_room
            : null,
      activeRecognitionFlow:
        parsed.activeRecognitionFlow &&
        typeof parsed.activeRecognitionFlow === "object"
          ? (parsed.activeRecognitionFlow as ActiveRecognitionFlow)
          : parsed.active_flow && typeof parsed.active_flow === "object"
            ? (parsed.active_flow as ActiveRecognitionFlow)
            : parsed.active_recognition_flow &&
                typeof parsed.active_recognition_flow === "object"
              ? (parsed.active_recognition_flow as ActiveRecognitionFlow)
              : null,
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

function writeLocal(next: RecognitionRoomState): RecognitionRoomState {
  if (!canUseStorage()) return next;
  try {
    sessionStorage.setItem(RECOGNITION_ROOM_STATE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECOGNITION_ROOM_STATE_UPDATED_EVENT));
  } catch {
    /* noop */
  }
  return next;
}

/**
 * Merge estate awareness + local recognition flow into one view.
 * Estate awareness is authoritative for visual / conversation / requested / previous.
 */
export function getRecognitionRoomState(): RecognitionRoomState {
  const local = readLocal();
  const estate = getEstateRoomAwareness();
  return {
    visualRoom: estate.visualRoom ?? local.visualRoom,
    conversationContext: estate.conversationRoom ?? local.conversationContext,
    requestedDestination: estate.requestedRoom ?? local.requestedDestination,
    previousRoom: estate.previousRoom ?? local.previousRoom,
    activeRecognitionFlow: local.activeRecognitionFlow,
  };
}

export function getVisualRoom(): string | null {
  return getRecognitionRoomState().visualRoom;
}

export function getConversationRoom(): string | null {
  return getRecognitionRoomState().conversationContext;
}

export function getRequestedRoom(): string | null {
  return getRecognitionRoomState().requestedDestination;
}

export function getPreviousRoom(): string | null {
  return getRecognitionRoomState().previousRoom;
}

export function getActiveFlow(): ActiveRecognitionFlow | null {
  return readLocal().activeRecognitionFlow;
}

export function setVisualRoom(placeId: string | null): RecognitionRoomState {
  const estate = setEstateVisualRoom(placeId);
  const local = readLocal();
  return writeLocal({
    ...local,
    visualRoom: estate.visualRoom,
    conversationContext: estate.conversationRoom,
    previousRoom: estate.previousRoom,
    requestedDestination: null,
  });
}

export function setConversationRoom(
  context: string | null,
): RecognitionRoomState {
  return setConversationContext(context);
}

export function setConversationContext(
  context: string | null,
): RecognitionRoomState {
  setEstateConversationRoom(context);
  const local = readLocal();
  return writeLocal({ ...local, conversationContext: context });
}

export function setRequestedRoom(placeId: string | null): RecognitionRoomState {
  return setRequestedDestination(placeId);
}

export function setRequestedDestination(
  placeId: string | null,
): RecognitionRoomState {
  setEstateRequestedRoom(placeId);
  const local = readLocal();
  return writeLocal({ ...local, requestedDestination: placeId });
}

export function startRecognitionFlow(input: {
  kind: RecognitionFlowKind;
  path: RecognitionExperiencePath;
  recordId?: string;
  suggestedRoomId?: ActiveRecognitionFlow["suggestedRoomId"];
}): RecognitionRoomState {
  const local = readLocal();
  const flow: ActiveRecognitionFlow = {
    id: `recflow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: input.kind,
    path: input.path,
    recordId: input.recordId,
    suggestedRoomId: input.suggestedRoomId,
    startedAt: new Date().toISOString(),
  };
  startEstateWorkflow({
    kind: `recognition:${input.kind}`,
    label: input.kind,
    placeId: input.suggestedRoomId ?? null,
  });
  return writeLocal({ ...local, activeRecognitionFlow: flow });
}

export function clearRecognitionFlow(): RecognitionRoomState {
  clearEstateWorkflow();
  const local = readLocal();
  return writeLocal({ ...local, activeRecognitionFlow: null });
}

export function clearActiveFlow(): RecognitionRoomState {
  return clearRecognitionFlow();
}

export function patchRecognitionRoomState(
  patch: Partial<RecognitionRoomState>,
): RecognitionRoomState {
  const local = readLocal();
  const next = { ...local, ...patch };
  writeLocal(next);
  if (
    patch.visualRoom !== undefined ||
    patch.conversationContext !== undefined ||
    patch.requestedDestination !== undefined
  ) {
    syncEstateRoomAwareness({
      placeId: next.visualRoom,
      conversationRoom: next.conversationContext,
    });
  }
  return getRecognitionRoomState();
}

/**
 * Sync shell → room awareness + recognition state.
 * Never clears a known visual room when section alone cannot resolve a place.
 */
export function syncRecognitionVisualFromShell(input: {
  placeId?: string | null;
  section?: string | null;
  conversationRoom?: string | null;
  clearVisual?: boolean;
}): RecognitionRoomState {
  const estate = syncEstateRoomAwareness({
    placeId: input.placeId,
    section: input.section,
    conversationRoom: input.conversationRoom,
    clearVisual: input.clearVisual,
  });
  const local = readLocal();
  return writeLocal({
    ...local,
    visualRoom: estate.visualRoom,
    conversationContext: estate.conversationRoom,
    previousRoom: estate.previousRoom,
    requestedDestination: estate.requestedRoom,
  });
}

/**
 * Only true when the claimed place is the visually active room.
 * Conversation context alone is never enough.
 */
export function isVisuallyInRoom(claimedPlaceId: string | null): boolean {
  if (!claimedPlaceId) return false;
  // Estate awareness is authoritative
  if (estateCanClaimAlreadyHere(claimedPlaceId)) return true;
  const { visualRoom } = getRecognitionRoomState();
  if (!visualRoom) return false;
  return recognitionRoomsEquivalent(visualRoom, claimedPlaceId);
}

/**
 * Gate for "already here" replies.
 * Returns false when visual room is unknown or mismatched.
 */
export function canClaimAlreadyHere(claimedPlaceId: string | null): boolean {
  return isVisuallyInRoom(claimedPlaceId);
}

export function resetRecognitionRoomStateForTests(): void {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(RECOGNITION_ROOM_STATE_KEY);
  resetEstateRoomAwarenessForTests();
}
