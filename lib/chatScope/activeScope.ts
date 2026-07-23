/**
 * Primary conversational scope pointer (session). One active scope at a time.
 */

import type { ChatScopeKind, ChatScopeRecord } from "./types";

const ACTIVE_SCOPE_STORAGE_KEY = "spark.chat.active-scope.v1";

let memoryScope: ChatScopeRecord | null = null;

function newScopeId(kind: ChatScopeKind): string {
  return `${kind}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
}

function readStored(): ChatScopeRecord | null {
  if (typeof window === "undefined") return memoryScope;
  try {
    const raw = sessionStorage.getItem(ACTIVE_SCOPE_STORAGE_KEY);
    if (!raw) return memoryScope;
    return JSON.parse(raw) as ChatScopeRecord;
  } catch {
    return memoryScope;
  }
}

function writeStored(scope: ChatScopeRecord | null): void {
  memoryScope = scope;
  if (typeof window === "undefined") return;
  try {
    if (!scope) {
      sessionStorage.removeItem(ACTIVE_SCOPE_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(ACTIVE_SCOPE_STORAGE_KEY, JSON.stringify(scope));
  } catch {
    /* quota */
  }
}

export function getActiveChatScope(): ChatScopeRecord | null {
  return readStored();
}

export function setActiveChatScope(
  kind: ChatScopeKind,
  options?: {
    sourceId?: string | null;
    resumable?: boolean;
    pendingQuestion?: boolean;
    navigationOwner?: boolean;
  },
): ChatScopeRecord {
  const now = Date.now();
  const scope: ChatScopeRecord = {
    scopeId: newScopeId(kind),
    kind,
    sourceId: options?.sourceId ?? null,
    active: true,
    createdAt: now,
    lastActiveAt: now,
    resumable: options?.resumable ?? true,
    pendingQuestion: options?.pendingQuestion ?? false,
    navigationOwner: options?.navigationOwner ?? kind === "estate_destination",
  };
  writeStored(scope);
  return scope;
}

/** Deactivate current scope without deleting resumable domain records. */
export function suspendActiveChatScope(): void {
  const current = readStored();
  if (!current) return;
  writeStored({
    ...current,
    active: false,
    pendingQuestion: false,
    lastActiveAt: Date.now(),
  });
}

/** New Day — Global Companion / New Day scope; prior scopes become inactive. */
export function activateNewDayChatScope(): ChatScopeRecord {
  return setActiveChatScope("new_day", {
    resumable: false,
    pendingQuestion: false,
    navigationOwner: false,
  });
}

export function __resetActiveChatScopeForTests(): void {
  memoryScope = null;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ACTIVE_SCOPE_STORAGE_KEY);
  } catch {
    /* noop */
  }
}
