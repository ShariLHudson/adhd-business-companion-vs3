/**
 * Estate Room Visit Memory™ — favorites, frequency, unfinished activity.
 */

import type { EstateMemory } from "@/lib/estateMemory/types";
import { patchEstateMemory } from "@/lib/estateMemory/estateMemoryStore";

export type EstateRoomVisitMemory = {
  lastRoomId?: string;
  favoriteRoomIds: string[];
  visitCounts: Record<string, number>;
  lastUnfinishedActivity?: {
    roomId: string;
    label: string;
    at: string;
  };
};

export function defaultRoomVisitMemory(): EstateRoomVisitMemory {
  return {
    favoriteRoomIds: [],
    visitCounts: {},
  };
}

export function normalizeRoomVisitMemory(
  slice?: EstateRoomVisitMemory | null,
): EstateRoomVisitMemory {
  if (!slice) return defaultRoomVisitMemory();
  return {
    lastRoomId: slice.lastRoomId,
    favoriteRoomIds: [...(slice.favoriteRoomIds ?? [])],
    visitCounts: { ...(slice.visitCounts ?? {}) },
    lastUnfinishedActivity: slice.lastUnfinishedActivity,
  };
}

export function recordEstateRoomVisit(
  roomId: string,
  opts?: { unfinishedActivityLabel?: string },
): EstateRoomVisitMemory {
  let snapshot = defaultRoomVisitMemory();
  patchEstateMemory((mem) => {
    const prior = normalizeRoomVisitMemory(mem.roomVisitMemory);
    const visitCounts = { ...prior.visitCounts };
    visitCounts[roomId] = (visitCounts[roomId] ?? 0) + 1;

    snapshot = {
      ...prior,
      lastRoomId: roomId,
      visitCounts,
      lastUnfinishedActivity: opts?.unfinishedActivityLabel
        ? {
            roomId,
            label: opts.unfinishedActivityLabel,
            at: new Date().toISOString(),
          }
        : prior.lastUnfinishedActivity,
    };

    return { ...mem, roomVisitMemory: snapshot };
  });
  return snapshot;
}

export function toggleEstateRoomFavorite(roomId: string): string[] {
  let favorites: string[] = [];
  patchEstateMemory((mem) => {
    const prior = normalizeRoomVisitMemory(mem.roomVisitMemory);
    const set = new Set(prior.favoriteRoomIds);
    if (set.has(roomId)) set.delete(roomId);
    else set.add(roomId);
    favorites = [...set];
    return {
      ...mem,
      roomVisitMemory: { ...prior, favoriteRoomIds: favorites },
    };
  });
  return favorites;
}

export function mostVisitedEstateRooms(
  memory: EstateMemory,
  limit = 5,
): { roomId: string; count: number }[] {
  const counts = memory.roomVisitMemory?.visitCounts ?? {};
  return Object.entries(counts)
    .map(([roomId, count]) => ({ roomId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function clearEstateUnfinishedActivity(roomId?: string): void {
  patchEstateMemory((mem) => {
    const prior = normalizeRoomVisitMemory(mem.roomVisitMemory);
    if (
      roomId &&
      prior.lastUnfinishedActivity?.roomId &&
      prior.lastUnfinishedActivity.roomId !== roomId
    ) {
      return mem;
    }
    return {
      ...mem,
      roomVisitMemory: { ...prior, lastUnfinishedActivity: undefined },
    };
  });
}
