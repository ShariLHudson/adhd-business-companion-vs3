/**
 * Session-scoped ActiveTopicState store (CB-022).
 * Single authoritative owner — do not duplicate in Chamber activation or Continuity.
 */

import {
  isActiveTopicUnresolved,
  type ActiveTopicState,
  type ActiveTopicStatus,
} from "./activeTopicTypes";

export const ACTIVE_TOPIC_STORAGE_KEY = "spark-active-topic-v1" as const;

let memoryFallback: ActiveTopicState | null = null;

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function loadActiveTopic(): ActiveTopicState | null {
  if (!canUseSessionStorage()) return memoryFallback;
  try {
    const raw = sessionStorage.getItem(ACTIVE_TOPIC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveTopicState;
    if (!parsed?.topicId || !parsed?.userGoal || !parsed?.status) return null;
    if (parsed.responseOwner !== "shari") {
      parsed.responseOwner = "shari";
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveActiveTopic(topic: ActiveTopicState): void {
  const next: ActiveTopicState = { ...topic, responseOwner: "shari" };
  memoryFallback = next;
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.setItem(ACTIVE_TOPIC_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function clearActiveTopic(): void {
  memoryFallback = null;
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.removeItem(ACTIVE_TOPIC_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getActiveTopic(): ActiveTopicState | null {
  return loadActiveTopic();
}

export function patchActiveTopic(
  patch: Partial<ActiveTopicState> & { updatedAtTurn: number },
): ActiveTopicState | null {
  const current = loadActiveTopic();
  if (!current) return null;
  const next: ActiveTopicState = {
    ...current,
    ...patch,
    responseOwner: "shari",
    topicId: current.topicId,
  };
  saveActiveTopic(next);
  return next;
}

export function setActiveTopicStatus(
  status: ActiveTopicStatus,
  turn: number,
): ActiveTopicState | null {
  return patchActiveTopic({ status, updatedAtTurn: turn });
}

export function resetActiveTopicStoreForTests(): void {
  memoryFallback = null;
  if (canUseSessionStorage()) {
    try {
      sessionStorage.removeItem(ACTIVE_TOPIC_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export { isActiveTopicUnresolved };
