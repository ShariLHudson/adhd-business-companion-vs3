/**
 * Spark Estate — shared window dismiss policy.
 * Outside click and Escape use the same path.
 * Nested windows: only the topmost layer receives Escape.
 */

import {
  confirmLeaveUnsavedWork,
  hasUnsavedWorkGuard,
} from "@/lib/unsavedWorkGuard";

export type WindowDismissBlockReason =
  | "explicit-decision"
  | "unsaved"
  | "upload"
  | "active-operation"
  | null;

type VoiceSession = {
  id: string;
  stop: () => void;
};

type DismissStackEntry = {
  id: string;
  requestDismiss: () => void;
};

const voiceSessions = new Map<string, VoiceSession>();
let uploadInProgressCount = 0;
let activeOperationCount = 0;
const dismissStack: DismissStackEntry[] = [];

let idSeq = 0;
function nextId(prefix: string): string {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

export function createDismissibleWindowId(): string {
  return nextId("window");
}

/** Register an active voice/mic session. Stop runs before dismiss. */
export function registerVoiceSession(stop: () => void): () => void {
  const id = nextId("voice");
  voiceSessions.set(id, { id, stop });
  return () => {
    voiceSessions.delete(id);
  };
}

export function isVoiceSessionActive(): boolean {
  return voiceSessions.size > 0;
}

/** Stop every registered voice session (safe before close). */
export function stopAllVoiceSessions(): void {
  const stops = [...voiceSessions.values()].map((s) => s.stop);
  voiceSessions.clear();
  for (const stop of stops) {
    try {
      stop();
    } catch {
      /* ignore */
    }
  }
}

export function beginUploadInProgress(): () => void {
  uploadInProgressCount += 1;
  return () => {
    uploadInProgressCount = Math.max(0, uploadInProgressCount - 1);
  };
}

export function isUploadInProgress(): boolean {
  return uploadInProgressCount > 0;
}

export function beginActiveOperation(): () => void {
  activeOperationCount += 1;
  return () => {
    activeOperationCount = Math.max(0, activeOperationCount - 1);
  };
}

export function isActiveOperationInProgress(): boolean {
  return activeOperationCount > 0;
}

export function pushDismissibleWindow(entry: DismissStackEntry): () => void {
  dismissStack.push(entry);
  return () => {
    const idx = dismissStack.findIndex((e) => e.id === entry.id);
    if (idx >= 0) dismissStack.splice(idx, 1);
  };
}

export function isTopDismissibleWindow(id: string): boolean {
  const top = dismissStack[dismissStack.length - 1];
  return Boolean(top && top.id === id);
}

export type RequestWindowDismissOptions = {
  /**
   * Confirmation / choice dialogs — member must use the buttons.
   * Outside click and Escape do not dismiss.
   */
  requiresExplicitDecision?: boolean;
  /** Local dirty state for this window (forms being edited). */
  isDirty?: boolean;
  /** Override confirm when dirty / guarded. */
  confirmDiscard?: () => boolean;
};

export function evaluateWindowDismiss(
  options: RequestWindowDismissOptions = {},
): { allowed: boolean; reason: WindowDismissBlockReason } {
  if (options.requiresExplicitDecision) {
    return { allowed: false, reason: "explicit-decision" };
  }
  if (isUploadInProgress()) {
    return { allowed: false, reason: "upload" };
  }
  if (isActiveOperationInProgress()) {
    return { allowed: false, reason: "active-operation" };
  }
  // Only this window's dirty flag — global navigation guard stays for route changes.
  if (options.isDirty) {
    return { allowed: true, reason: "unsaved" };
  }
  return { allowed: true, reason: null };
}

function promptDiscard(): boolean {
  if (hasUnsavedWorkGuard()) {
    return confirmLeaveUnsavedWork();
  }
  try {
    return window.confirm(
      "You have unsaved changes. Leave without saving?",
    );
  } catch {
    return true;
  }
}

/**
 * Shared dismiss entry — outside click and Escape both call this.
 * Stops voice recording before close. Returns true when closed.
 */
export function requestWindowDismiss(
  onClose: () => void,
  options: RequestWindowDismissOptions = {},
): boolean {
  const verdict = evaluateWindowDismiss(options);
  if (!verdict.allowed) return false;

  if (options.isDirty) {
    const ok = options.confirmDiscard
      ? options.confirmDiscard()
      : promptDiscard();
    if (!ok) return false;
  }

  // Voice never blocks forever — stop listening, then close.
  if (isVoiceSessionActive()) {
    stopAllVoiceSessions();
  }

  onClose();
  return true;
}
