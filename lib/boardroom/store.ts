import type {
  BoardroomDiscussionRecord,
  BoardroomStoreSnapshot,
} from "./types";

export const BOARDROOM_STORAGE_KEY = "spark.boardroom.discussions.v1";

function emptySnapshot(): BoardroomStoreSnapshot {
  return { version: 1, discussions: [] };
}

function parseSnapshot(raw: string | null): BoardroomStoreSnapshot {
  if (!raw) return emptySnapshot();
  try {
    const parsed = JSON.parse(raw) as BoardroomStoreSnapshot;
    if (parsed?.version !== 1 || !Array.isArray(parsed.discussions)) {
      return emptySnapshot();
    }
    return parsed;
  } catch {
    return emptySnapshot();
  }
}

export function loadBoardroomDiscussions(): BoardroomDiscussionRecord[] {
  if (typeof window === "undefined") return [];
  return parseSnapshot(localStorage.getItem(BOARDROOM_STORAGE_KEY)).discussions;
}

function saveAll(discussions: BoardroomDiscussionRecord[]): void {
  if (typeof window === "undefined") return;
  const snapshot: BoardroomStoreSnapshot = { version: 1, discussions };
  localStorage.setItem(BOARDROOM_STORAGE_KEY, JSON.stringify(snapshot));
}

export function listBoardroomDiscussions(): BoardroomDiscussionRecord[] {
  return loadBoardroomDiscussions().sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getBoardroomDiscussion(
  id: string,
): BoardroomDiscussionRecord | null {
  return loadBoardroomDiscussions().find((d) => d.id === id) ?? null;
}

export function upsertBoardroomDiscussion(
  record: BoardroomDiscussionRecord,
): BoardroomDiscussionRecord {
  const all = loadBoardroomDiscussions();
  const idx = all.findIndex((d) => d.id === record.id);
  const next = { ...record, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = next;
  } else {
    all.unshift(next);
  }
  saveAll(all);
  return next;
}

export function deleteBoardroomDiscussion(id: string): void {
  saveAll(loadBoardroomDiscussions().filter((d) => d.id !== id));
}

export function recentBoardroomDiscussions(
  limit = 5,
): BoardroomDiscussionRecord[] {
  return listBoardroomDiscussions().slice(0, limit);
}
