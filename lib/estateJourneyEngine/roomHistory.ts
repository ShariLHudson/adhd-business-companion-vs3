/**
 * Estate Journey Engine — compact room history for the continuous journey.
 */

import { patchJourneyEngine } from "./journeyStore";
import type { EstateRoomHistoryEntry } from "./types";

const MAX_ROOM_HISTORY = 48;

export function formatRoomHistoryChain(
  history: EstateRoomHistoryEntry[],
): string | null {
  if (history.length === 0) return null;
  return history.map((h) => h.roomName).join(" → ");
}

export function recordJourneyRoomVisit(
  entryId: string,
  roomName: string,
): EstateRoomHistoryEntry[] {
  let snapshot: EstateRoomHistoryEntry[] = [];
  patchJourneyEngine((journey) => {
    const history = [...journey.roomHistory];
    const last = history[history.length - 1];
    const now = new Date().toISOString();

    if (!last || last.entryId !== entryId) {
      history.push({ entryId, roomName, enteredAt: now });
    }

    snapshot = history.slice(-MAX_ROOM_HISTORY);
    const sessions = journey.sessions.map((s) => {
      if (s.id !== journey.activeSessionId) return s;
      const roomIdsVisited = [...s.roomIdsVisited];
      if (!roomIdsVisited.includes(entryId)) roomIdsVisited.push(entryId);
      return { ...s, roomIdsVisited };
    });

    return { ...journey, roomHistory: snapshot, sessions };
  });
  return snapshot;
}
