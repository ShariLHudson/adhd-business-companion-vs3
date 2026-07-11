/**
 * Estate Room Awareness — Spark always knows where the member is.
 *
 * Required fields (Architecture Library):
 * - visual_room
 * - conversation_room
 * - requested_room
 * - previous_room
 * - active_workflow
 *
 * Global law: Never claim "You're already here" unless the live shell
 * and visual_room both confirm the place is on screen.
 */

import { resolvePlaceId } from "@/lib/estate/placeIdAliases";
import { estateRoomsEquivalent } from "@/lib/estate/roomContext/roomIds";
import { recognitionSectionForPlace } from "@/lib/sparkRecognitionEngine/recognitionIds";
import {
  isNonPlaceShellSection,
  resolvePlaceFromShell,
} from "./shellPlace";

export { isNonPlaceShellSection, resolvePlaceFromShell } from "./shellPlace";

export const ESTATE_ROOM_AWARENESS_KEY =
  "companion-estate-room-awareness-v1" as const;

export const ESTATE_ROOM_AWARENESS_UPDATED_EVENT =
  "companion-estate-room-awareness-updated" as const;

export type ActiveEstateWorkflow = {
  id: string;
  /** recognition | create | navigation | capture | room_action | other */
  kind: string;
  label?: string;
  placeId?: string | null;
  startedAt: string;
};

export type EstateRoomAwarenessState = {
  /** Place currently visible on screen */
  visualRoom: string | null;
  /** What conversation believes is active */
  conversationRoom: string | null;
  /** Explicit member navigation target (pending arrival) */
  requestedRoom: string | null;
  /** Last visual room before the current one */
  previousRoom: string | null;
  /** In-progress workflow (recognition, create, etc.) */
  activeWorkflow: ActiveEstateWorkflow | null;
  /**
   * Live shell place from the last sync (section/visit).
   * Already-here requires visualRoom ≡ liveShellPlaceId.
   * Null on non-place tool screens.
   */
  liveShellPlaceId: string | null;
};

const EMPTY: EstateRoomAwarenessState = {
  visualRoom: null,
  conversationRoom: null,
  requestedRoom: null,
  previousRoom: null,
  activeWorkflow: null,
  liveShellPlaceId: null,
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function normalizePlace(id: string | null | undefined): string | null {
  if (!id?.trim()) return null;
  return resolvePlaceId(id.trim());
}

function readState(): EstateRoomAwarenessState {
  if (!canUseStorage()) return { ...EMPTY };
  try {
    const raw = sessionStorage.getItem(ESTATE_ROOM_AWARENESS_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<EstateRoomAwarenessState> & {
      visual_room?: string | null;
      conversation_room?: string | null;
      requested_room?: string | null;
      previous_room?: string | null;
      active_workflow?: ActiveEstateWorkflow | null;
      live_shell_place_id?: string | null;
    };
    return {
      visualRoom: normalizePlace(
        parsed.visualRoom ?? parsed.visual_room ?? null,
      ),
      conversationRoom: normalizePlace(
        parsed.conversationRoom ?? parsed.conversation_room ?? null,
      ),
      requestedRoom: normalizePlace(
        parsed.requestedRoom ?? parsed.requested_room ?? null,
      ),
      previousRoom: normalizePlace(
        parsed.previousRoom ?? parsed.previous_room ?? null,
      ),
      activeWorkflow:
        parsed.activeWorkflow && typeof parsed.activeWorkflow === "object"
          ? parsed.activeWorkflow
          : parsed.active_workflow && typeof parsed.active_workflow === "object"
            ? parsed.active_workflow
            : null,
      liveShellPlaceId: normalizePlace(
        parsed.liveShellPlaceId ?? parsed.live_shell_place_id ?? null,
      ),
    };
  } catch {
    return { ...EMPTY };
  }
}

function writeState(next: EstateRoomAwarenessState): EstateRoomAwarenessState {
  if (!canUseStorage()) return next;
  try {
    sessionStorage.setItem(ESTATE_ROOM_AWARENESS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(ESTATE_ROOM_AWARENESS_UPDATED_EVENT));
  } catch {
    /* noop */
  }
  return next;
}

export function getEstateRoomAwareness(): EstateRoomAwarenessState {
  return readState();
}

export function getVisualRoom(): string | null {
  return readState().visualRoom;
}

export function getLiveShellPlaceId(): string | null {
  return readState().liveShellPlaceId;
}

export function getConversationRoom(): string | null {
  return readState().conversationRoom;
}

export function getRequestedRoom(): string | null {
  return readState().requestedRoom;
}

export function getPreviousRoom(): string | null {
  return readState().previousRoom;
}

export function getActiveWorkflow(): ActiveEstateWorkflow | null {
  return readState().activeWorkflow;
}

/**
 * Member requested a destination (before arrival).
 */
export function setRequestedRoom(
  placeId: string | null,
): EstateRoomAwarenessState {
  const current = readState();
  return writeState({
    ...current,
    requestedRoom: normalizePlace(placeId),
  });
}

/**
 * Update conversation belief without changing visual room.
 */
export function setConversationRoom(
  placeId: string | null,
): EstateRoomAwarenessState {
  const current = readState();
  return writeState({
    ...current,
    conversationRoom: normalizePlace(placeId),
  });
}

/**
 * Arrive at a place — updates visual, live shell, previous, clears requested.
 */
export function setVisualRoom(placeId: string | null): EstateRoomAwarenessState {
  const current = readState();
  const nextVisual = normalizePlace(placeId);
  const previous =
    current.visualRoom &&
    nextVisual &&
    !estateRoomsEquivalent(current.visualRoom, nextVisual)
      ? current.visualRoom
      : current.previousRoom;

  return writeState({
    ...current,
    previousRoom:
      nextVisual && current.visualRoom && nextVisual !== current.visualRoom
        ? current.visualRoom
        : previous,
    visualRoom: nextVisual,
    liveShellPlaceId: nextVisual,
    conversationRoom: nextVisual ?? current.conversationRoom,
    requestedRoom: null,
  });
}

export function startActiveWorkflow(input: {
  kind: string;
  label?: string;
  placeId?: string | null;
}): EstateRoomAwarenessState {
  const current = readState();
  const workflow: ActiveEstateWorkflow = {
    id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: input.kind,
    label: input.label,
    placeId: normalizePlace(input.placeId ?? null),
    startedAt: new Date().toISOString(),
  };
  return writeState({ ...current, activeWorkflow: workflow });
}

export function clearActiveWorkflow(): EstateRoomAwarenessState {
  const current = readState();
  return writeState({ ...current, activeWorkflow: null });
}

/**
 * Sync from goToPlace / direct visit / section change.
 *
 * Global rules:
 * - Mapped sections update visual + liveShellPlaceId
 * - Non-place tool sections clear visual (never keep stale room)
 * - Unknown sections keep last visual only for ambience — liveShellPlaceId stays null
 *   so already-here cannot fire
 */
export function syncEstateRoomAwareness(input: {
  placeId?: string | null;
  section?: string | null;
  conversationRoom?: string | null;
  /** When true, allow clearing visual (explicit leave / reset) */
  clearVisual?: boolean;
}): EstateRoomAwarenessState {
  const current = readState();
  const section = input.section?.trim() ?? null;
  const resolved = resolvePlaceFromShell({
    placeId: input.placeId,
    section,
  });
  const nonPlace = Boolean(section && isNonPlaceShellSection(section));

  let nextVisual = resolved;
  let liveShellPlaceId = resolved;

  if (!resolved) {
    if (nonPlace || input.clearVisual) {
      // Tool/panel screens and explicit clears must not keep a stale place.
      nextVisual = null;
      liveShellPlaceId = null;
    } else {
      // Unknown section: keep ambience visual, but do not authorize already-here.
      nextVisual = current.visualRoom;
      liveShellPlaceId = null;
    }
  }

  const previousRoom =
    current.visualRoom &&
    nextVisual &&
    !estateRoomsEquivalent(current.visualRoom, nextVisual)
      ? current.visualRoom
      : current.previousRoom;

  const conversationRoom =
    input.conversationRoom !== undefined
      ? normalizePlace(input.conversationRoom)
      : (nextVisual ?? current.conversationRoom);

  return writeState({
    ...current,
    visualRoom: nextVisual,
    liveShellPlaceId,
    conversationRoom,
    previousRoom,
    requestedRoom: resolved ? null : current.requestedRoom,
  });
}

/**
 * Only true when the claimed place is the visually active room
 * AND the live shell still shows that place.
 * Conversation / memory / requested alone are never enough.
 */
export function isVisuallyInRoom(claimedPlaceId: string | null): boolean {
  if (!claimedPlaceId) return false;
  const { visualRoom, liveShellPlaceId } = readState();
  if (!visualRoom) return false;
  if (!estateRoomsEquivalent(visualRoom, claimedPlaceId)) return false;
  // Legacy sessions without liveShellPlaceId: require visual only (tests / first paint).
  // Once shell has synced, liveShellPlaceId must also agree (or be unset only before first sync).
  if (liveShellPlaceId != null) {
    return estateRoomsEquivalent(liveShellPlaceId, claimedPlaceId);
  }
  return true;
}

/**
 * Gate for "already here" / "You're already in…" replies.
 * Hard rule: visual_room and live shell must both confirm.
 */
export function canClaimAlreadyHere(claimedPlaceId: string | null): boolean {
  return isVisuallyInRoom(claimedPlaceId);
}

/**
 * Best current place for routing — live shell wins, then visual, then conversation.
 * Does NOT authorize "already here" (use canClaimAlreadyHere for that).
 */
export function resolveAwareCurrentPlace(): string | null {
  const state = readState();
  return (
    state.liveShellPlaceId ??
    state.visualRoom ??
    state.conversationRoom ??
    state.requestedRoom
  );
}

export function patchEstateRoomAwareness(
  patch: Partial<EstateRoomAwarenessState>,
): EstateRoomAwarenessState {
  const current = readState();
  return writeState({ ...current, ...patch });
}

export function resetEstateRoomAwarenessForTests(): void {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(ESTATE_ROOM_AWARENESS_KEY);
}

/** Section for a place when known (recognition + common shells). */
export function sectionHintForPlace(placeId: string | null): string | null {
  if (!placeId) return null;
  return recognitionSectionForPlace(placeId);
}
