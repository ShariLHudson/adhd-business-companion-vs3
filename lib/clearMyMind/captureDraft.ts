/**
 * Continuous Clear My Mind draft autosave.
 * Versioned writes so a stale tab cannot overwrite newer text.
 */

export const CLEAR_MY_MIND_DRAFT_KEY = "companion-clear-my-mind-draft-v2";

export type ClearMyMindDraftRecord = {
  text: string;
  updatedAt: number;
  /** Monotonic write counter for stale-write protection. */
  version: number;
  sessionId?: string;
};

export type DraftSaveStatus = "idle" | "saving" | "saved" | "error";

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadClearMyMindDraft(): ClearMyMindDraftRecord | null {
  if (!hasStorage()) return null;
  try {
    const raw = localStorage.getItem(CLEAR_MY_MIND_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClearMyMindDraftRecord;
    if (!parsed || typeof parsed.text !== "string") return null;
    if (typeof parsed.updatedAt !== "number") return null;
    if (typeof parsed.version !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save draft only when this write is at least as new as storage.
 * Returns false when a newer draft already exists (stale write blocked).
 */
export function saveClearMyMindDraft(input: {
  text: string;
  version: number;
  sessionId?: string;
}): { ok: boolean; blockedByNewer: boolean } {
  if (!hasStorage()) return { ok: false, blockedByNewer: false };
  try {
    const existing = loadClearMyMindDraft();
    if (existing && existing.version > input.version) {
      return { ok: false, blockedByNewer: true };
    }
    const next: ClearMyMindDraftRecord = {
      text: input.text,
      updatedAt: Date.now(),
      version: input.version,
      sessionId: input.sessionId,
    };
    if (!next.text.trim()) {
      localStorage.removeItem(CLEAR_MY_MIND_DRAFT_KEY);
      return { ok: true, blockedByNewer: false };
    }
    localStorage.setItem(CLEAR_MY_MIND_DRAFT_KEY, JSON.stringify(next));
    return { ok: true, blockedByNewer: false };
  } catch {
    return { ok: false, blockedByNewer: false };
  }
}

export function clearClearMyMindDraft(): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(CLEAR_MY_MIND_DRAFT_KEY);
  } catch {
    /* noop */
  }
}

/** Quiet status labels — never interrupt capture. */
export function draftStatusLabel(status: DraftSaveStatus): string | null {
  if (status === "saving") return "Saving…";
  if (status === "saved") return "Saved";
  if (status === "error") {
    return "I couldn’t save the latest changes just now. Your text is still here, and I’ll keep trying.";
  }
  return null;
}
