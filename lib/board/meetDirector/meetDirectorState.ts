/**
 * Meet This Director — routing & session helpers.
 * Profile stays mounted; Meet only opens an overlay conversation.
 */

import { getBoardDirectorById } from "@/lib/board/boardDirectorRegistry";
import type { BoardDirectorDefinition, BoardDirectorId } from "@/lib/board/types";
import type {
  MeetDirectorConversation,
  MeetDirectorExperienceState,
  MeetDirectorMessage,
  MeetDirectorRoute,
} from "@/lib/board/meetDirector/types";

/**
 * Exact opening for Meet This Director (private; not a Board meeting).
 * Profile welcome/openingMessage stays on the profile card — not here.
 */
export const MEET_DIRECTOR_OPENING =
  "Welcome. I'm glad you're here. What decision or situation would you like us to examine together?" as const;

/** @deprecated Prefer MEET_DIRECTOR_OPENING */
export const MEET_DIRECTOR_OPENING_LINES = [
  "Welcome.",
  "I'm glad you're here.",
  "What decision or situation would you like us to examine together?",
] as const;

export function meetDirectorOpeningMessage(
  _director?: BoardDirectorDefinition | null,
): string {
  return MEET_DIRECTOR_OPENING;
}

export function meetDirectorCtaLabel(director: BoardDirectorDefinition): string {
  const first = director.name.trim().split(/\s+/)[0] ?? "Director";
  return `Meet ${first}`;
}

export function createMeetDirectorMessage(
  role: MeetDirectorMessage["role"],
  content: string,
): MeetDirectorMessage {
  return {
    id: `mdm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function createInitialMeetConversation(
  directorId: BoardDirectorId,
): MeetDirectorConversation {
  const director = getBoardDirectorById(directorId);
  return {
    directorId,
    open: true,
    messages: [
      createMeetDirectorMessage("director", meetDirectorOpeningMessage(director)),
    ],
  };
}

export function initialMeetDirectorExperienceState(): MeetDirectorExperienceState {
  return {
    route: { screen: "gallery" },
    conversation: null,
  };
}

/** Open Director profile — no conversation yet. */
export function routeToDirectorProfile(
  directorId: BoardDirectorId,
): MeetDirectorExperienceState {
  return {
    route: { screen: "profile", directorId },
    conversation: null,
  };
}

/**
 * Start Meet This Director.
 * Does not navigate away — profile remains underneath; conversation overlays.
 * Resumes a remembered conversation when provided (state preservation).
 */
export function openMeetDirectorConversation(
  directorId: BoardDirectorId,
  previous?: MeetDirectorConversation | null,
): MeetDirectorExperienceState {
  const conversation =
    previous && previous.directorId === directorId
      ? { ...previous, open: true }
      : createInitialMeetConversation(directorId);
  return {
    route: { screen: "meet", directorId },
    conversation,
  };
}

/**
 * Open profile while optionally preserving a closed Meet conversation
 * for the same Director (returning restores prior view).
 */
export function routeToDirectorProfilePreservingConversation(
  directorId: BoardDirectorId,
  previousConversation?: MeetDirectorConversation | null,
): MeetDirectorExperienceState {
  const conversation =
    previousConversation && previousConversation.directorId === directorId
      ? { ...previousConversation, open: false }
      : null;
  return {
    route: { screen: "profile", directorId },
    conversation,
  };
}

/** Close conversation panel — return to the same Director profile. */
export function returnToDirectorProfile(
  state: MeetDirectorExperienceState,
): MeetDirectorExperienceState {
  const directorId =
    state.route.screen === "gallery" ? null : state.route.directorId;
  if (!directorId) {
    return initialMeetDirectorExperienceState();
  }
  return {
    route: { screen: "profile", directorId },
    conversation: state.conversation
      ? { ...state.conversation, open: false }
      : null,
  };
}

/** Leave profile / meet and return to the Directors gallery. */
export function returnToDirectorsGallery(): MeetDirectorExperienceState {
  return initialMeetDirectorExperienceState();
}

export function resolveMeetRouteDirector(
  route: MeetDirectorRoute,
): BoardDirectorDefinition | null {
  if (route.screen === "gallery") return null;
  return getBoardDirectorById(route.directorId) ?? null;
}

export function isMeetConversationActive(
  state: MeetDirectorExperienceState,
): boolean {
  return (
    state.route.screen === "meet" &&
    Boolean(state.conversation?.open) &&
    state.conversation?.directorId ===
      (state.route.screen === "meet" ? state.route.directorId : null)
  );
}
