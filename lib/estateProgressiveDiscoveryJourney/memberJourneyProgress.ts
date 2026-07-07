/**
 * Member journey progress — quiet tracking without scores or checklists.
 */

import type {
  JourneyItemRef,
  JourneyProgressStore,
  MemberJourneyProgress,
} from "./types";
import { journeyItemKey } from "./journeyItemKey";

const STORAGE_KEY = "spark:progressive-discovery:journey:v1";

function nowIso(): string {
  return new Date().toISOString();
}

export function createEmptyMemberJourneyProgress(
  memberId: string,
): MemberJourneyProgress {
  return {
    memberId,
    discoveriesViewed: [],
    roomsVisited: [],
    featuresExplored: [],
    savedDiscoveries: [],
    interestsShown: [],
    journeyItemsIntroduced: [],
    updatedAt: nowIso(),
  };
}

function uniqueAppend(list: string[], value: string): string[] {
  if (list.includes(value)) return list;
  return [...list, value];
}

function touch(progress: MemberJourneyProgress): MemberJourneyProgress {
  return { ...progress, updatedAt: nowIso() };
}

export function isJourneyItemEngaged(
  progress: MemberJourneyProgress,
  ref: JourneyItemRef,
): boolean {
  const key = journeyItemKey(ref);

  if (progress.journeyItemsIntroduced.includes(key)) return true;

  switch (ref.type) {
    case "room":
      return progress.roomsVisited.includes(ref.id);
    case "feature":
      return progress.featuresExplored.includes(ref.id);
    case "discovery":
      return progress.discoveriesViewed.includes(ref.id);
    case "tool":
    case "setting":
      return progress.journeyItemsIntroduced.includes(key);
    default:
      return false;
  }
}

export function recordRoomVisit(
  progress: MemberJourneyProgress,
  roomId: string,
): MemberJourneyProgress {
  return touch({
    ...progress,
    roomsVisited: uniqueAppend(progress.roomsVisited, roomId),
    interestsShown: uniqueAppend(progress.interestsShown, `room:${roomId}`),
  });
}

export function recordFeatureExplored(
  progress: MemberJourneyProgress,
  featureId: string,
): MemberJourneyProgress {
  return touch({
    ...progress,
    featuresExplored: uniqueAppend(progress.featuresExplored, featureId),
    interestsShown: uniqueAppend(progress.interestsShown, `feature:${featureId}`),
  });
}

export function recordDiscoveryViewed(
  progress: MemberJourneyProgress,
  discoveryId: string,
): MemberJourneyProgress {
  return touch({
    ...progress,
    discoveriesViewed: uniqueAppend(progress.discoveriesViewed, discoveryId),
  });
}

export function recordDiscoverySaved(
  progress: MemberJourneyProgress,
  discoveryId: string,
): MemberJourneyProgress {
  return touch({
    ...progress,
    savedDiscoveries: uniqueAppend(progress.savedDiscoveries, discoveryId),
    discoveriesViewed: uniqueAppend(progress.discoveriesViewed, discoveryId),
  });
}

export function recordInterestShown(
  progress: MemberJourneyProgress,
  interest: string,
): MemberJourneyProgress {
  return touch({
    ...progress,
    interestsShown: uniqueAppend(progress.interestsShown, interest),
  });
}

export function recordJourneyItemsIntroduced(
  progress: MemberJourneyProgress,
  refs: readonly JourneyItemRef[],
): MemberJourneyProgress {
  let next = progress;
  for (const ref of refs) {
    const key = journeyItemKey(ref);
    next = {
      ...next,
      journeyItemsIntroduced: uniqueAppend(next.journeyItemsIntroduced, key),
    };
  }
  return touch(next);
}

export class InMemoryJourneyProgressStore implements JourneyProgressStore {
  private entries = new Map<string, MemberJourneyProgress>();

  load(memberId: string): MemberJourneyProgress {
    return (
      this.entries.get(memberId) ??
      createEmptyMemberJourneyProgress(memberId)
    );
  }

  save(progress: MemberJourneyProgress): void {
    this.entries.set(progress.memberId, progress);
  }

  clear(): void {
    this.entries.clear();
  }
}

export class LocalJourneyProgressStore implements JourneyProgressStore {
  load(memberId: string): MemberJourneyProgress {
    if (typeof localStorage === "undefined") {
      return createEmptyMemberJourneyProgress(memberId);
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyMemberJourneyProgress(memberId);

      const parsed = JSON.parse(raw) as Record<string, MemberJourneyProgress>;
      return parsed[memberId] ?? createEmptyMemberJourneyProgress(memberId);
    } catch {
      return createEmptyMemberJourneyProgress(memberId);
    }
  }

  save(progress: MemberJourneyProgress): void {
    if (typeof localStorage === "undefined") return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw
        ? (JSON.parse(raw) as Record<string, MemberJourneyProgress>)
        : {};
      parsed[progress.memberId] = progress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      // fail silent — journey progress is supportive, not blocking
    }
  }
}

let defaultStore: JourneyProgressStore | null = null;

export function getJourneyProgressStore(): JourneyProgressStore {
  if (!defaultStore) {
    defaultStore = new LocalJourneyProgressStore();
  }
  return defaultStore;
}

export function loadMemberJourneyProgress(memberId: string): MemberJourneyProgress {
  return getJourneyProgressStore().load(memberId);
}

export function saveMemberJourneyProgress(
  progress: MemberJourneyProgress,
): void {
  getJourneyProgressStore().save(progress);
}
