/**
 * Session memory — why this conversation started.
 */

import type {
  ConversationDepth,
  ConversationPurpose,
  IntentAwareSessionStore,
} from "./types";

const STORAGE_KEY = "intent-aware-conversation-v1";

const EMPTY: IntentAwareSessionStore = {
  version: 1,
  sessionPurpose: null,
  sessionDepth: null,
  startedAtTurn: null,
};

export function loadIntentAwareSession(): IntentAwareSessionStore {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as IntentAwareSessionStore;
    if (parsed.version !== 1) return { ...EMPTY };
    return parsed;
  } catch {
    return { ...EMPTY };
  }
}

export function saveIntentAwareSession(store: IntentAwareSessionStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function updateIntentAwareSession(
  purpose: ConversationPurpose | null,
  depth: ConversationDepth | null,
  currentTurn: number,
  purposeChanged: boolean,
): IntentAwareSessionStore {
  const store = loadIntentAwareSession();

  if (purpose && (!store.sessionPurpose || purposeChanged)) {
    store.sessionPurpose = purpose;
    store.sessionDepth = depth ?? "task";
    store.startedAtTurn = currentTurn;
  } else if (
    purpose &&
    depth &&
    depthRank(depth) > depthRank(store.sessionDepth ?? "task")
  ) {
    store.sessionDepth = depth;
  }

  saveIntentAwareSession(store);
  return store;
}

function depthRank(depth: ConversationDepth): number {
  switch (depth) {
    case "task":
      return 1;
    case "guidance":
      return 2;
    case "reflection":
      return 3;
    case "exploration":
      return 4;
  }
}

export function clearIntentAwareSession(): void {
  saveIntentAwareSession({ ...EMPTY });
}
