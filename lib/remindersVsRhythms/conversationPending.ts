/**
 * Pending Reminder/Rhythm create confirmation (conversation path).
 * Never create the wrong type silently — confirm first.
 */

export type PendingRememberCreate = {
  kind: "reminder" | "rhythm";
  title: string;
  sourceText: string;
  cadence?: string;
  createdAt: string;
};

const KEY = "spark:pending-remember-create:v1";

export function loadPendingRememberCreate(): PendingRememberCreate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingRememberCreate;
    if (
      !parsed ||
      (parsed.kind !== "reminder" && parsed.kind !== "rhythm") ||
      typeof parsed.title !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePendingRememberCreate(
  pending: PendingRememberCreate | null,
): void {
  if (typeof window === "undefined") return;
  try {
    if (!pending) {
      window.localStorage.removeItem(KEY);
      return;
    }
    window.localStorage.setItem(KEY, JSON.stringify(pending));
  } catch {
    /* ignore */
  }
}

export function clearPendingRememberCreate(): void {
  savePendingRememberCreate(null);
}

export function isAffirmativeRememberConfirm(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(yes|yeah|yep|sure|ok|okay|please|go ahead|create it|do it|sounds good)\b/.test(
    t,
  );
}

export function isNegativeRememberConfirm(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(no|nope|cancel|never ?mind|not that|wait|stop)\b/.test(t);
}
