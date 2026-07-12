/**
 * Per-Director session view state — restored when returning to a profile.
 */

import type { BoardDirectorAccordionSectionId } from "@/lib/board/directorAccordion";
import type { BoardDirectorId } from "@/lib/board/types";
import type { MeetDirectorConversation } from "@/lib/board/meetDirector/types";

export type DirectorSessionViewState = {
  openAccordionId: BoardDirectorAccordionSectionId | null;
  portraitEnlarged: boolean;
};

export type DirectorSessionStore = {
  views: Partial<Record<BoardDirectorId, DirectorSessionViewState>>;
  /** Closed or open Meet conversations preserved per Director */
  conversations: Partial<Record<BoardDirectorId, MeetDirectorConversation>>;
};

export function createEmptyDirectorSessionStore(): DirectorSessionStore {
  return { views: {}, conversations: {} };
}

export function getDirectorSessionView(
  store: DirectorSessionStore,
  directorId: BoardDirectorId,
): DirectorSessionViewState {
  return (
    store.views[directorId] ?? {
      openAccordionId: null,
      portraitEnlarged: false,
    }
  );
}

export function setDirectorAccordionOpen(
  store: DirectorSessionStore,
  directorId: BoardDirectorId,
  openAccordionId: BoardDirectorAccordionSectionId | null,
): DirectorSessionStore {
  const prev = getDirectorSessionView(store, directorId);
  return {
    ...store,
    views: {
      ...store.views,
      [directorId]: { ...prev, openAccordionId },
    },
  };
}

export function setDirectorPortraitEnlarged(
  store: DirectorSessionStore,
  directorId: BoardDirectorId,
  portraitEnlarged: boolean,
): DirectorSessionStore {
  const prev = getDirectorSessionView(store, directorId);
  return {
    ...store,
    views: {
      ...store.views,
      [directorId]: { ...prev, portraitEnlarged },
    },
  };
}

export function rememberDirectorConversation(
  store: DirectorSessionStore,
  conversation: MeetDirectorConversation,
): DirectorSessionStore {
  return {
    ...store,
    conversations: {
      ...store.conversations,
      [conversation.directorId]: conversation,
    },
  };
}

export function getRememberedConversation(
  store: DirectorSessionStore,
  directorId: BoardDirectorId,
): MeetDirectorConversation | null {
  return store.conversations[directorId] ?? null;
}
