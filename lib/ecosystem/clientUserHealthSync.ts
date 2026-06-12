// Browser → server user health activity (anonymous id only).

import { getEcosystemUserId } from "./ecosystemUserId";
import type { EcosystemTrackEventType } from "./eventTrackingEngine";
import { mapEcosystemEventToHealthKind, type UserHealthActivityKind } from "./userHealthEngine";

export async function syncUserHealthActivity(
  kind: UserHealthActivityKind,
): Promise<void> {
  if (typeof window === "undefined") return;
  const userId = getEcosystemUserId();
  if (!userId || userId === "server-anonymous") return;

  try {
    await fetch("/api/ecosystem/user-health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, kind }),
      keepalive: true,
    });
  } catch {
    /* best-effort */
  }
}

export function syncUserHealthFromEcosystemEvent(
  eventType: EcosystemTrackEventType,
): void {
  const kind = mapEcosystemEventToHealthKind(eventType);
  if (!kind) return;
  void syncUserHealthActivity(kind);
}
