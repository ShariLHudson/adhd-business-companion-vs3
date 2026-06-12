// Browser → server sync for categorized user intelligence (no message text).

import type { ClassifiedUserSignals } from "./userIntelligenceEngine";
import type { UserSignalCount } from "./userIntelligenceEngine";

const RECONCILE_SESSION_KEY = "ecosystem-signals-reconciled-v1";

function classifiedToIncrements(
  classified: ClassifiedUserSignals,
): { kind: string; category: string }[] {
  return [
    ...classified.struggles.map((category) => ({ kind: "struggle", category })),
    ...classified.questions.map((category) => ({ kind: "question", category })),
    ...classified.emotions.map((category) => ({ kind: "emotion", category })),
  ];
}

export async function syncClassifiedSignalsToServer(
  classified: ClassifiedUserSignals,
): Promise<void> {
  if (typeof window === "undefined") return;
  const signals = classifiedToIncrements(classified);
  if (!signals.length) return;

  try {
    await fetch("/api/ecosystem/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "increment", signals }),
      keepalive: true,
    });
  } catch {
    /* best-effort */
  }
}

export async function reconcileUserIntelligenceWithServer(
  counts: UserSignalCount[],
): Promise<void> {
  if (typeof window === "undefined" || !counts.length) return;
  if (window.sessionStorage.getItem(RECONCILE_SESSION_KEY)) return;

  try {
    const res = await fetch("/api/ecosystem/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "reconcile",
        counts: counts.map((c) => ({
          kind: c.kind,
          category: c.category,
          count: c.count,
          lastSeen: c.lastSeen,
        })),
      }),
    });
    if (res.ok) {
      window.sessionStorage.setItem(RECONCILE_SESSION_KEY, "1");
    }
  } catch {
    /* best-effort */
  }
}
