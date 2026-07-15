/**
 * Clear conversation-thread slices of Estate Memory while preserving
 * long-term profile, preferences, room favorites, and journey learning.
 */

import {
  createEmptyEstateMemory,
  getEstateMemory,
  patchEstateMemory,
} from "./estateMemoryStore";
import type { EstateMemory } from "./types";

export type ClearConversationThreadResult = {
  previousSessionId: string;
  sessionId: string;
  clearedDigestTurns: number;
};

function newThreadSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `estate-thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Wipe prior chat digest / open loops / active task so New Chat and New Day
 * cannot silently continue the previous thread via estateMemoryHintForChat.
 */
export function clearConversationThreadFromEstateMemory(): ClearConversationThreadResult {
  const current = getEstateMemory();
  const previousSessionId = current.sessionId;
  const clearedDigestTurns = current.conversationDigest.length;
  const sessionId = newThreadSessionId();

  patchEstateMemory((mem) => {
    const empty = createEmptyEstateMemory();
    return {
      ...mem,
      sessionId,
      conversationDigest: [],
      emotionalState: {
        current: undefined,
        history: mem.emotionalState.history,
      },
      momentumState: {
        progressNotes: mem.momentumState.progressNotes,
        unfinishedLoops: [],
      },
      activeJourney: {
        steps: mem.activeJourney.steps,
        intentChain: [],
        pendingEntryIds: [],
        activeTask: undefined,
      },
      lastTransition: mem.lastTransition
        ? {
            ...mem.lastTransition,
            userText: undefined,
            expectedNextStep: undefined,
            reason: "fresh-conversation",
          }
        : undefined,
      // Keep room pointers, favorites, profile, goals, and journey engine learning.
      userProfile: mem.userProfile,
      activeGoals: mem.activeGoals,
      roomVisitMemory: mem.roomVisitMemory,
      journeyEngine: mem.journeyEngine,
      currentRoom: mem.currentRoom,
      previousRoom: mem.previousRoom,
      // Ensure we never accidentally carry empty's new session over profile wipe.
      version: empty.version,
    } satisfies EstateMemory;
  });

  return {
    previousSessionId,
    sessionId,
    clearedDigestTurns,
  };
}

/** True when Estate Memory has no prior-thread digest to continue. */
export function isEstateConversationThreadFresh(
  memory: EstateMemory | null = getEstateMemory(),
): boolean {
  if (!memory) return true;
  return (
    memory.conversationDigest.length === 0 &&
    !memory.activeJourney.activeTask &&
    memory.momentumState.unfinishedLoops.length === 0
  );
}
