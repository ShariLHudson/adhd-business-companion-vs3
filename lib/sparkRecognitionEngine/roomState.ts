/**
 * Recognition room state — visual_room vs conversation_context.
 * Never claim "already here" unless visualRoom matches.
 */

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
  activeRecognitionFlow: null,
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function readState(): RecognitionRoomState {
  if (!canUseStorage()) return { ...EMPTY_STATE };
  try {
    const raw = sessionStorage.getItem(RECOGNITION_ROOM_STATE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as Partial<RecognitionRoomState>;
    return {
      visualRoom:
        typeof parsed.visualRoom === "string" ? parsed.visualRoom : null,
      conversationContext:
        typeof parsed.conversationContext === "string"
          ? parsed.conversationContext
          : null,
      requestedDestination:
        typeof parsed.requestedDestination === "string"
          ? parsed.requestedDestination
          : null,
      activeRecognitionFlow:
        parsed.activeRecognitionFlow &&
        typeof parsed.activeRecognitionFlow === "object"
          ? (parsed.activeRecognitionFlow as ActiveRecognitionFlow)
          : null,
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

function writeState(next: RecognitionRoomState): RecognitionRoomState {
  if (!canUseStorage()) return next;
  try {
    sessionStorage.setItem(RECOGNITION_ROOM_STATE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECOGNITION_ROOM_STATE_UPDATED_EVENT));
  } catch {
    /* noop */
  }
  return next;
}

export function getRecognitionRoomState(): RecognitionRoomState {
  return readState();
}

export function setVisualRoom(placeId: string | null): RecognitionRoomState {
  const current = readState();
  return writeState({
    ...current,
    visualRoom: placeId,
    requestedDestination: null,
  });
}

export function setConversationContext(
  context: string | null,
): RecognitionRoomState {
  const current = readState();
  return writeState({ ...current, conversationContext: context });
}

export function setRequestedDestination(
  placeId: string | null,
): RecognitionRoomState {
  const current = readState();
  return writeState({ ...current, requestedDestination: placeId });
}

export function startRecognitionFlow(input: {
  kind: RecognitionFlowKind;
  path: RecognitionExperiencePath;
  recordId?: string;
  suggestedRoomId?: ActiveRecognitionFlow["suggestedRoomId"];
}): RecognitionRoomState {
  const current = readState();
  const flow: ActiveRecognitionFlow = {
    id: `recflow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: input.kind,
    path: input.path,
    recordId: input.recordId,
    suggestedRoomId: input.suggestedRoomId,
    startedAt: new Date().toISOString(),
  };
  return writeState({ ...current, activeRecognitionFlow: flow });
}

export function clearRecognitionFlow(): RecognitionRoomState {
  const current = readState();
  return writeState({ ...current, activeRecognitionFlow: null });
}

export function patchRecognitionRoomState(
  patch: Partial<RecognitionRoomState>,
): RecognitionRoomState {
  const current = readState();
  return writeState({ ...current, ...patch });
}

/**
 * Only true when the claimed place is the visually active room.
 * Conversation context alone is never enough.
 */
export function isVisuallyInRoom(claimedPlaceId: string | null): boolean {
  if (!claimedPlaceId) return false;
  const { visualRoom } = readState();
  return visualRoom === claimedPlaceId;
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
}
